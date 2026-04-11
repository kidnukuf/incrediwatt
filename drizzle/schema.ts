import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  float,
  bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Menu Items
export const menuItems = mysqlTable("menu_items", {
  id: int("id").autoincrement().primaryKey(),
  category: varchar("category", { length: 100 }).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  nameEs: varchar("name_es", { length: 200 }),
  price: float("price"),
  description: text("description"),
  descriptionEs: text("description_es"),
  modifierGroups: varchar("modifier_groups", { length: 300 }),
  isActive: boolean("is_active").default(true).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type MenuItem = typeof menuItems.$inferSelect;

// Food Photos
export const foodPhotos = mysqlTable("food_photos", {
  id: int("id").autoincrement().primaryKey(),
  url: text("url").notNull(),
  fileKey: varchar("file_key", { length: 500 }).notNull(),
  caption: text("caption"),
  menuItemId: int("menu_item_id"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export type FoodPhoto = typeof foodPhotos.$inferSelect;

// Posts
export const posts = mysqlTable("posts", {
  id: int("id").autoincrement().primaryKey(),
  platform: mysqlEnum("platform", ["facebook", "instagram", "both"]).default("both").notNull(),
  captionEn: text("caption_en").notNull(),
  captionEs: text("caption_es"),
  hashtags: text("hashtags"),
  imageUrl: text("image_url"),
  menuItemId: int("menu_item_id"),
  postType: mysqlEnum("post_type", [
    "menu_item",
    "special",
    "event",
    "promotion",
    "taco_tuesday",
    "manual",
    "borderline_brew",
  ]).default("menu_item").notNull(),
  status: mysqlEnum("status", ["draft", "scheduled", "published", "cancelled", "failed"])
    .default("draft")
    .notNull(),
  scheduledAt: bigint("scheduled_at", { mode: "number" }),
  publishedAt: bigint("published_at", { mode: "number" }),
  relatedId: int("related_id"), // FK to specials/events/promotions
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

// Specials
export const specials = mysqlTable("specials", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  titleEs: varchar("title_es", { length: 200 }),
  description: text("description"),
  descriptionEs: text("description_es"),
  price: float("price"),
  validFrom: bigint("valid_from", { mode: "number" }),
  validTo: bigint("valid_to", { mode: "number" }),
  isActive: boolean("is_active").default(true).notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Special = typeof specials.$inferSelect;

// Events
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  titleEs: varchar("title_es", { length: 200 }),
  description: text("description"),
  descriptionEs: text("description_es"),
  eventDate: bigint("event_date", { mode: "number" }).notNull(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;

// Promotions
export const promotions = mysqlTable("promotions", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", [
    "review_dessert",
    "cdl_discount",
    "honor_roll",
    "educator_discount",
    "custom",
  ]).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  titleEs: varchar("title_es", { length: 200 }),
  description: text("description"),
  descriptionEs: text("description_es"),
  discountValue: varchar("discount_value", { length: 50 }),
  requirements: text("requirements"),
  requirementsEs: text("requirements_es"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
export type Promotion = typeof promotions.$inferSelect;

// Client Pages — stores Facebook/Instagram page credentials for each managed client
export const clientPages = mysqlTable("client_pages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  facebookPageId: varchar("facebook_page_id", { length: 50 }),
  facebookPageToken: text("facebook_page_token"),
  instagramAccountId: varchar("instagram_account_id", { length: 50 }),
  isActive: boolean("is_active").default(true).notNull(),
  isPrimary: boolean("is_primary").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ClientPage = typeof clientPages.$inferSelect;
export type InsertClientPage = typeof clientPages.$inferInsert;

// Security Events Log
export const securityEvents = mysqlTable("security_events", {
  id: int("id").autoincrement().primaryKey(),
  eventType: mysqlEnum("event_type", [
    "failed_login",
    "ip_lockout",
    "captcha_failed",
    "api_probe_blocked",
    "successful_login",
    "rate_limit_hit",
  ]).notNull(),
  ip: varchar("ip", { length: 64 }).notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SecurityEvent = typeof securityEvents.$inferSelect;
export type InsertSecurityEvent = typeof securityEvents.$inferInsert;
