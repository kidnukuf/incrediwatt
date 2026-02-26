import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAuthContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@sopris.com",
      name: "Test User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
  return { ctx };
}

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const cleared: string[] = [];
    const ctx: TrpcContext = {
      ...createAuthContext().ctx,
      res: {
        clearCookie: (name: string) => cleared.push(name),
      } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(cleared.length).toBeGreaterThan(0);
  });
});

describe("menu router", () => {
  it("returns menu categories as an array", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const categories = await caller.menu.categories();
    expect(Array.isArray(categories)).toBe(true);
  });

  it("returns menu items list", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const items = await caller.menu.list();
    expect(Array.isArray(items)).toBe(true);
  });

  it("returns menu items by category", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const items = await caller.menu.byCategory({ category: "Mexican Cuisine" });
    expect(Array.isArray(items)).toBe(true);
    items.forEach((item) => {
      expect(item.category).toBe("Mexican Cuisine");
    });
  });
});

describe("promotions router", () => {
  it("returns active promotions", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const promos = await caller.promotions.active();
    expect(Array.isArray(promos)).toBe(true);
  });

  it("returns all promotions list", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const promos = await caller.promotions.list();
    expect(Array.isArray(promos)).toBe(true);
    expect(promos.length).toBeGreaterThan(0);
  });
});

describe("specials router", () => {
  it("returns specials list", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const specials = await caller.specials.list();
    expect(Array.isArray(specials)).toBe(true);
  });
});

describe("events router", () => {
  it("returns events list", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const events = await caller.events.list();
    expect(Array.isArray(events)).toBe(true);
  });
});

describe("posts router", () => {
  it("returns posts list", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const posts = await caller.posts.list({ limit: 10 });
    expect(Array.isArray(posts)).toBe(true);
  });

  it("returns post counts", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const counts = await caller.posts.counts();
    expect(counts).toHaveProperty("total");
    expect(counts).toHaveProperty("scheduled");
    expect(counts).toHaveProperty("published");
    expect(counts).toHaveProperty("draft");
    expect(typeof counts.total).toBe("number");
  });
});
