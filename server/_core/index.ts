import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { startScheduler } from "./scheduler";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

// ── In-memory brute force tracker ────────────────────────────────────────────
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function recordFailedLogin(ip: string): void {
  const entry = loginAttempts.get(ip) ?? { count: 0, lockedUntil: 0 };
  entry.count += 1;
  if (entry.count >= MAX_LOGIN_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    console.warn(`[Security] IP ${ip} locked out after ${entry.count} failed login attempts`);
  }
  loginAttempts.set(ip, entry);
}

export function isLoginLocked(ip: string): boolean {
  const entry = loginAttempts.get(ip);
  if (!entry) return false;
  if (entry.lockedUntil > Date.now()) return true;
  loginAttempts.delete(ip);
  return false;
}

export function clearLoginAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

// Purge stale entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of Array.from(loginAttempts.entries())) {
    if (entry.lockedUntil < now && entry.count < MAX_LOGIN_ATTEMPTS) {
      loginAttempts.delete(ip);
    }
  }
}, 60 * 60 * 1000);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // ── Security headers (helmet) ───────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: false, // Vite/React handles its own CSP needs
      crossOriginEmbedderPolicy: false, // Required for media embeds
    })
  );

  // ── Global rate limiter: 300 requests / 15 min per IP ──────────────────────
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: "Too many requests. Please try again later." },
      skip: (req) => req.path.startsWith("/src") || req.path.startsWith("/@"),
    })
  );

  // ── Strict rate limiter on login: 10 attempts / 15 min per IP ──────────────
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many login attempts. Please wait 15 minutes." },
  });
  app.use("/api/trpc/auth.loginWithPassword", loginLimiter);

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    // Start the auto-publish scheduler after server is up
    startScheduler();
  });
}

startServer().catch(console.error);
