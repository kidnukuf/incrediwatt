import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  InsertSecurityEvent,
  clientPages,
  events,
  foodPhotos,
  menuItems,
  posts,
  promotions,
  securityEvents,
  specials,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];
  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Menu Items ───────────────────────────────────────────────────────────────

export async function getAllMenuItems() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(menuItems).where(eq(menuItems.isActive, true)).orderBy(menuItems.category, menuItems.name);
}

export async function getMenuItemsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(menuItems).where(and(eq(menuItems.category, category), eq(menuItems.isActive, true)));
}

export async function getMenuItemById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  return result[0];
}

export async function getFeaturedMenuItems() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(menuItems).where(and(eq(menuItems.isFeatured, true), eq(menuItems.isActive, true)));
}

export async function updateMenuItemPhoto(id: number, photoUrl: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(menuItems).set({ photoUrl }).where(eq(menuItems.id, id));
}

export async function toggleMenuItemFeatured(id: number, isFeatured: boolean) {
  const db = await getDb();
  if (!db) return;
  await db.update(menuItems).set({ isFeatured }).where(eq(menuItems.id, id));
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export async function createPost(data: {
  platform: "facebook" | "instagram" | "both";
  captionEn: string;
  captionEs?: string;
  hashtags?: string;
  imageUrl?: string;
  menuItemId?: number;
  postType: "menu_item" | "special" | "event" | "promotion" | "taco_tuesday" | "manual" | "borderline_brew";
  status: "draft" | "scheduled" | "published" | "cancelled";
  scheduledAt?: number;
  relatedId?: number;
}) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(posts).values(data).$returningId();
  return { id: result?.id ?? 0, status: data.status };
}

export async function getAllPosts(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(posts).orderBy(desc(posts.createdAt)).limit(limit).offset(offset);
}

export async function getScheduledPosts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(posts).where(eq(posts.status, "scheduled")).orderBy(posts.scheduledAt);
}

export async function getPostsByStatus(status: "draft" | "scheduled" | "published" | "cancelled" | "failed") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(posts).where(eq(posts.status, status)).orderBy(desc(posts.createdAt));
}

export async function getPostsInRange(from: number, to: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(posts)
    .where(and(gte(posts.scheduledAt, from), lte(posts.scheduledAt, to)))
    .orderBy(posts.scheduledAt);
}

export async function updatePost(
  id: number,
  data: Partial<{
    captionEn: string;
    captionEs: string;
    hashtags: string;
    imageUrl: string;
    status: "draft" | "scheduled" | "published" | "cancelled" | "failed";
    scheduledAt: number;
    publishedAt: number;
    platform: "facebook" | "instagram" | "both";
  }>
) {
  const db = await getDb();
  if (!db) return;
  await db.update(posts).set(data).where(eq(posts.id, id));
}

export async function deletePost(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(posts).where(eq(posts.id, id));
}

export async function getPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return result[0];
}

// ─── Specials ─────────────────────────────────────────────────────────────────

export async function createSpecial(data: {
  title: string;
  titleEs?: string;
  description?: string;
  descriptionEs?: string;
  price?: number;
  validFrom?: number;
  validTo?: number;
  imageUrl?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(specials).values({ ...data, isActive: true });
}

export async function getActiveSpecials() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(specials).where(eq(specials.isActive, true)).orderBy(desc(specials.createdAt));
}

export async function getAllSpecials() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(specials).orderBy(desc(specials.createdAt));
}

export async function deleteSpecial(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(specials).where(eq(specials.id, id));
}

// ─── Events ───────────────────────────────────────────────────────────────────

export async function createEvent(data: {
  title: string;
  titleEs?: string;
  description?: string;
  descriptionEs?: string;
  eventDate: number;
  imageUrl?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(events).values({ ...data, isActive: true });
}

export async function getUpcomingEvents() {
  const db = await getDb();
  if (!db) return [];
  const now = Date.now();
  return db
    .select()
    .from(events)
    .where(and(eq(events.isActive, true), gte(events.eventDate, now)))
    .orderBy(events.eventDate);
}

export async function getAllEvents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events).orderBy(desc(events.eventDate));
}

export async function deleteEvent(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(events).where(eq(events.id, id));
}

// ─── Promotions ───────────────────────────────────────────────────────────────

export async function getAllPromotions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(promotions).orderBy(promotions.type);
}

export async function getActivePromotions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(promotions).where(eq(promotions.isActive, true));
}

export async function togglePromotion(id: number, isActive: boolean) {
  const db = await getDb();
  if (!db) return;
  await db.update(promotions).set({ isActive }).where(eq(promotions.id, id));
}

export async function updatePromotion(
  id: number,
  data: Partial<{
    title: string;
    titleEs: string;
    description: string;
    descriptionEs: string;
    discountValue: string;
    requirements: string;
    requirementsEs: string;
    imageUrl: string;
    isActive: boolean;
  }>
) {
  const db = await getDb();
  if (!db) return;
  await db.update(promotions).set(data).where(eq(promotions.id, id));
}

// ─── Food Photos ──────────────────────────────────────────────────────────────

export async function createFoodPhoto(data: {
  url: string;
  fileKey: string;
  caption?: string;
  menuItemId?: number;
}) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(foodPhotos).values(data);
}

export async function getAllFoodPhotos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(foodPhotos).orderBy(desc(foodPhotos.uploadedAt));
}

export async function getFoodPhotosByMenuItem(menuItemId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(foodPhotos).where(eq(foodPhotos.menuItemId, menuItemId));
}

export async function deleteFoodPhoto(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(foodPhotos).where(eq(foodPhotos.id, id));
}

/**
 * Find the best matching food photo for a menu item.
 * First tries by menuItemId, then by fuzzy caption match against item name.
 */
export async function findBestPhotoForMenuItem(menuItemId: number, itemName: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  // 1. Try direct menuItemId link
  const linked = await db.select().from(foodPhotos).where(eq(foodPhotos.menuItemId, menuItemId)).limit(1);
  if (linked.length > 0) return linked[0].url;

  // 2. Fuzzy match by caption (case-insensitive keyword overlap)
  const allPhotos = await db.select().from(foodPhotos);
  const nameLower = itemName.toLowerCase();
  const nameWords = nameLower.split(/\s+/).filter(w => w.length > 3);

  let bestMatch: { url: string; score: number } | null = null;
  for (const photo of allPhotos) {
    if (!photo.caption) continue;
    const captionLower = photo.caption.toLowerCase();
    let score = 0;
    for (const word of nameWords) {
      if (captionLower.includes(word)) score++;
    }
    // Also check if the item name is a substring of caption or vice versa
    if (captionLower.includes(nameLower) || nameLower.includes(captionLower)) score += 3;
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { url: photo.url, score };
    }
  }

  return bestMatch?.url ?? null;
}

export async function getMenuCategories() {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .selectDistinct({ category: menuItems.category })
    .from(menuItems)
    .where(eq(menuItems.isActive, true));
  return result.map((r) => r.category);
}

// ─── Client Pages ────────────────────────────────────────────────────────────
export async function getAllClientPages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clientPages).orderBy(clientPages.isPrimary, clientPages.name);
}

export async function getClientPageById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(clientPages).where(eq(clientPages.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getPrimaryClientPage() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(clientPages).where(eq(clientPages.isPrimary, true)).limit(1);
  return result[0] ?? null;
}

export async function upsertClientPage(data: {
  id?: number;
  name: string;
  facebookPageId?: string;
  facebookPageToken?: string;
  instagramAccountId?: string;
  isActive?: boolean;
  isPrimary?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  if (data.id) {
    await db.update(clientPages).set({
      name: data.name,
      facebookPageId: data.facebookPageId,
      facebookPageToken: data.facebookPageToken,
      instagramAccountId: data.instagramAccountId,
      isActive: data.isActive ?? true,
      isPrimary: data.isPrimary ?? false,
    }).where(eq(clientPages.id, data.id));
    return data.id;
  } else {
    const result = await db.insert(clientPages).values({
      name: data.name,
      facebookPageId: data.facebookPageId,
      facebookPageToken: data.facebookPageToken,
      instagramAccountId: data.instagramAccountId,
      isActive: data.isActive ?? true,
      isPrimary: data.isPrimary ?? false,
    });
    return (result as unknown as { insertId: number }).insertId;
  }
}

export async function deleteClientPage(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(clientPages).where(eq(clientPages.id, id));
}

export async function getPostCount() {
  const db = await getDb();
  if (!db) return { total: 0, scheduled: 0, published: 0, draft: 0 };
  const result = await db
    .select({
      status: posts.status,
      count: sql<number>`count(*)`,
    })
    .from(posts)
    .groupBy(posts.status);

  const counts = { total: 0, scheduled: 0, published: 0, draft: 0 };
  for (const row of result) {
    counts.total += Number(row.count);
    if (row.status === "scheduled") counts.scheduled = Number(row.count);
    if (row.status === "published") counts.published = Number(row.count);
    if (row.status === "draft") counts.draft = Number(row.count);
  }
  return counts;
}

// ─── Security Events ─────────────────────────────────────────────────────────

export async function logSecurityEvent(event: InsertSecurityEvent): Promise<void> {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(securityEvents).values(event);
  } catch (e) {
    // Never let security logging crash the main flow
    console.warn("[Security] Failed to log event:", e);
  }
}

export async function getRecentSecurityEvents(limit = 200): Promise<typeof securityEvents.$inferSelect[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(securityEvents).orderBy(desc(securityEvents.createdAt)).limit(limit);
}

export async function getSecurityEventStats(): Promise<{
  totalEvents: number;
  failedLogins: number;
  ipLockouts: number;
  captchaFailed: number;
  apiProbesBlocked: number;
  uniqueIPs: number;
  last24h: number;
}> {
  const db = await getDb();
  if (!db) return { totalEvents: 0, failedLogins: 0, ipLockouts: 0, captchaFailed: 0, apiProbesBlocked: 0, uniqueIPs: 0, last24h: 0 };

  const all = await db.select().from(securityEvents).orderBy(desc(securityEvents.createdAt)).limit(1000);
  const now = Date.now();
  const last24h = now - 24 * 60 * 60 * 1000;

  return {
    totalEvents: all.length,
    failedLogins: all.filter(e => e.eventType === "failed_login").length,
    ipLockouts: all.filter(e => e.eventType === "ip_lockout").length,
    captchaFailed: all.filter(e => e.eventType === "captcha_failed").length,
    apiProbesBlocked: all.filter(e => e.eventType === "api_probe_blocked").length,
    uniqueIPs: new Set(all.map(e => e.ip)).size,
    last24h: all.filter(e => new Date(e.createdAt).getTime() > last24h).length,
  };
}
