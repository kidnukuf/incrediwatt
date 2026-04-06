/**
 * Auto-link food photos to their matching menu items.
 * Strategy:
 * 1. Exact match: photo caption == menu item name (case-insensitive)
 * 2. Fuzzy match: all significant words in photo caption appear in menu item name
 * 3. Partial match: photo caption is a substring of menu item name or vice versa
 * 
 * Videos and non-food photos (promos, graphics, story images) are skipped.
 */
import { createConnection } from 'mysql2/promise';

const conn = await createConnection(process.env.DATABASE_URL);

const [photos] = await conn.execute(
  `SELECT id, url, caption, menu_item_id FROM food_photos ORDER BY id`
);
const [items] = await conn.execute(
  `SELECT id, name, name_es FROM menu_items WHERE is_active = 1 ORDER BY name`
);

// Skip these non-menu-item photos (promos, events, branding, videos)
const SKIP_KEYWORDS = [
  'promo', 'catering', 'taco tuesday', 'cinco de mayo', 'happy hour',
  'mural', 'story', 'chef', 'never rushed', 'familiar', 'future vision',
  'our dream', 'graphic', 'banner', 'neon', 'youcut', 'grok_video',
  'null', 'skilled'
];

function normalize(str) {
  return str?.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim() ?? '';
}

function significantWords(str) {
  return normalize(str).split(/\s+/).filter(w => w.length > 2);
}

function scoreMatch(caption, itemName) {
  const cap = normalize(caption);
  const item = normalize(itemName);
  
  // Exact match
  if (cap === item) return 100;
  
  // Caption is substring of item name or vice versa
  if (item.includes(cap) || cap.includes(item)) return 80;
  
  // Word overlap score
  const capWords = significantWords(caption);
  const itemWords = significantWords(itemName);
  if (capWords.length === 0 || itemWords.length === 0) return 0;
  
  let matches = 0;
  for (const w of capWords) {
    if (itemWords.some(iw => iw.includes(w) || w.includes(iw))) matches++;
  }
  
  const precision = matches / capWords.length;
  const recall = matches / itemWords.length;
  return Math.round((precision + recall) / 2 * 60);
}

const updates = [];
const skipped = [];
const noMatch = [];

for (const photo of photos) {
  if (photo.menu_item_id) continue; // already linked
  
  const caption = photo.caption ?? '';
  const filename = photo.url.split('/').pop()?.split('?')[0] ?? '';
  
  // Skip non-menu-item photos
  const capLower = caption.toLowerCase();
  const fileLower = filename.toLowerCase();
  if (SKIP_KEYWORDS.some(kw => capLower.includes(kw) || fileLower.includes(kw))) {
    skipped.push({ id: photo.id, caption, filename });
    continue;
  }
  
  // Find best matching menu item
  let best = null;
  let bestScore = 0;
  
  for (const item of items) {
    const score = scoreMatch(caption, item.name);
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
    // Also try Spanish name
    if (item.name_es) {
      const scoreEs = scoreMatch(caption, item.name_es);
      if (scoreEs > bestScore) {
        bestScore = scoreEs;
        best = item;
      }
    }
  }
  
  if (best && bestScore >= 40) {
    updates.push({ photoId: photo.id, menuItemId: best.id, caption, itemName: best.name, score: bestScore });
  } else {
    noMatch.push({ id: photo.id, caption, filename, bestScore, bestItem: best?.name });
  }
}

console.log(`\n=== AUTO-LINK PLAN ===`);
console.log(`Will link: ${updates.length} photos`);
console.log(`Will skip (non-menu): ${skipped.length} photos`);
console.log(`No match found: ${noMatch.length} photos`);

console.log('\n=== LINKS TO CREATE ===');
for (const u of updates) {
  console.log(`  Photo [${u.photoId}] "${u.caption}" → [${u.menuItemId}] "${u.itemName}" (score: ${u.score})`);
}

console.log('\n=== SKIPPED (non-menu-item) ===');
for (const s of skipped) {
  console.log(`  [${s.id}] ${s.caption}`);
}

if (noMatch.length > 0) {
  console.log('\n=== NO MATCH FOUND ===');
  for (const n of noMatch) {
    console.log(`  [${n.id}] "${n.caption}" (best: "${n.bestItem}" score: ${n.bestScore})`);
  }
}

// Apply the links
console.log('\n=== APPLYING LINKS ===');
let applied = 0;
for (const u of updates) {
  await conn.execute(
    `UPDATE food_photos SET menu_item_id = ? WHERE id = ?`,
    [u.menuItemId, u.photoId]
  );
  console.log(`✅ [${u.photoId}] "${u.caption}" → "${u.itemName}"`);
  applied++;
}

console.log(`\nDone! Applied ${applied} links.`);
await conn.end();
