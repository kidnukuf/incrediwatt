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

// ── tRPC procedures allowed without a session cookie ─────────────────────────
const PUBLIC_TRPC_PROCEDURES = new Set([
  "auth.me",
  "auth.logout",
  "auth.loginWithPassword",
]);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Trust Cloudflare proxy so rate limiting uses real client IP, not Cloudflare's
  app.set("trust proxy", 1);

  // ── Security headers (helmet) ───────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            "https://fonts.googleapis.com",
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
          ],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
          imgSrc: [
            "'self'",
            "data:",
            "blob:",
            "https://d2xsxph8kpxj0f.cloudfront.net",
            "https://*.cloudfront.net",
            "https://*.manus.space",
            "https://*.manus.computer",
          ],
          mediaSrc: [
            "'self'",
            "blob:",
            "https://d2xsxph8kpxj0f.cloudfront.net",
            "https://*.cloudfront.net",
          ],
          connectSrc: [
            "'self'",
            "https://*.manus.space",
            "https://*.manus.computer",
            "wss://*.manus.computer",
            "https://graph.facebook.com",
            "https://api.manus.im",
          ],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: false, // Required for media embeds
      crossOriginResourcePolicy: { policy: "same-origin" },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
    })
  );

  // ── Global rate limiter: 100 requests / 15 min per IP ──────────────────────
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: "Too many requests. Please try again later." },
      skip: (req) =>
        req.path.startsWith("/src") ||
        req.path.startsWith("/@") ||
        req.path.startsWith("/node_modules"),
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

  // ── Server-side API auth guard ────────────────────────────────────────────
  // Blocks direct API calls to non-public tRPC procedures from unauthenticated
  // clients. This is a defense-in-depth layer on top of protectedProcedure.
  app.use("/api/trpc", (req, res, next) => {
    const rawPath = req.path.replace(/^\//, "");
    const procedures = rawPath.split(",").map(p => p.split("?")[0].trim());
    const allPublic = procedures.every(p => PUBLIC_TRPC_PROCEDURES.has(p));
    if (allPublic) return next();

    // Check for session cookie (set by loginWithPassword)
    const cookies = req.headers.cookie || "";
    const hasSession = cookies.includes("session=");
    if (!hasSession) {
      console.warn(`[Security] Unauthenticated API probe blocked: ${rawPath} from ${req.ip}`);
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    return next();
  });

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
