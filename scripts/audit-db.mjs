import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';
import { gte, count } from 'drizzle-orm';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

// Post counts by status/platform
const postCounts = await db.select({ status: schema.posts.status, platform: schema.posts.platform, cnt: count() })
  .from(schema.posts).groupBy(schema.posts.status, schema.posts.platform);
console.log('POST COUNTS:');
postCounts.forEach(r => console.log(' ', r.status, r.platform, r.cnt));

// Food photos
const photos = await db.select().from(schema.foodPhotos).limit(50);
console.log('\nFOOD PHOTOS:', photos.length);
photos.forEach(p => {
  const url = p.url.substring(0, 90);
  const isVideo = /\.(mp4|mov|webm|avi)(\?|$)/i.test(p.url);
  console.log(' ', p.id, isVideo ? '[VIDEO]' : '[IMAGE]', url, '|', p.caption ? p.caption.substring(0, 30) : '(no caption)');
});

// Menu items count
const items = await db.select({ id: schema.menuItems.id, name: schema.menuItems.name, category: schema.menuItems.category })
  .from(schema.menuItems).limit(100);
console.log('\nMENU ITEMS:', items.length);

// Upcoming scheduled posts
const now = Date.now();
const upcoming = await db.select({
  id: schema.posts.id,
  scheduledAt: schema.posts.scheduledAt,
  platform: schema.posts.platform,
  status: schema.posts.status,
  imageUrl: schema.posts.imageUrl,
  postType: schema.posts.postType,
}).from(schema.posts).where(gte(schema.posts.scheduledAt, now));
console.log('\nUPCOMING POSTS (scheduled_at >= now):', upcoming.length);
upcoming.forEach(p => {
  const d = new Date(p.scheduledAt);
  console.log(' ', d.toISOString().substring(0, 16), p.platform, p.status, p.postType, p.imageUrl ? '[has image]' : '[no image]');
});

await connection.end();
