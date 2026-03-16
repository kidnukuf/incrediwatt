/**
 * Seed food photos catalog from CDN URLs and fill all empty Mon/Tue/Thu/Sat
 * posting slots for the next 4 weeks with AI-generated scheduled posts.
 *
 * Run: npx tsx scripts/seed-and-schedule.mjs
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';
import { gte } from 'drizzle-orm';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

// ── 1. All CDN image/video URLs to import into food_photos ────────────────────
const CDN_ASSETS = [
  // Food post images
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_post_street_tacos_c4a8bb9d.jpg', caption: 'Street Tacos' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_post_bacon_cheeseburger_74de5e76.jpg', caption: 'Bacon Cheeseburger' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_post_wet_burrito_4ec937a0.jpg', caption: 'Wet Burrito' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_post_double_burger_and_onion_rings_f7846812.jpg', caption: 'Double Burger & Onion Rings' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_taco_tuesday_f150b418.jpg', caption: 'Taco Tuesday' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_double_burger_908397d5.jpg', caption: 'Double Burger' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_taco_tuesday_banner_a9d42d6e.jpg', caption: 'Taco Tuesday Banner' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_post_wet_burrito_v2_c6dd9c63.jpg', caption: 'Wet Burrito v2' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_post_supreme_pizza_28bf7850.jpg', caption: 'Supreme Pizza' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_post_birria_tacos_dd99ef8e.jpg', caption: 'Birria Tacos' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_post_carne_asada_eggs_1141c375.jpg', caption: 'Carne Asada & Eggs' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_post_fajita_trio_98ae6a2d.jpg', caption: 'Fajita Trio' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_post_onion_rings_3a1ad6d7.jpg', caption: 'Onion Rings' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_post_blt_57fdaf73.jpg', caption: 'BLT Sandwich' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_post_chicken_fajitas_a1b34c9f.jpg', caption: 'Chicken Fajitas' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_post_chicken_tacos_50c2de16.jpg', caption: 'Chicken Tacos' },
  // Graphic/branded images
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_enchiladas_graphic_189ae6a1.jpg', caption: 'Enchiladas Graphic' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_steak_lobster_graphic_3564897e.jpg', caption: 'Steak & Lobster Graphic' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_pizza_graphic_68f0ed52.jpg', caption: 'Pizza Graphic' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_mural_feature_509d2a32.jpg', caption: 'Restaurant Mural' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_grilled_cheese_graphic_ff4a7743.jpg', caption: 'Grilled Cheese Graphic' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_taco_tuesday_neon_6c7ff4b3.jpg', caption: 'Taco Tuesday Neon' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_chocolate_oreo_sundae_1b5bf5c4.jpg', caption: 'Chocolate Oreo Sundae' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_cinco_de_mayo_33d48635.jpg', caption: 'Cinco de Mayo' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_happy_hour_specials_77c938f3.jpg', caption: 'Happy Hour Specials' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_prime_rib_dinner_9467a1c7.jpg', caption: 'Prime Rib Dinner' },
  // V2 branded images
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_story_sophie_iris_v2_3ac40b5e.jpg', caption: 'Our Story — Sophie & Iris' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_skilled_chef_v2_8952beff.jpg', caption: 'Skilled Chef' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_never_rushed_v2_16118f80.jpg', caption: 'Never Rushed' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_familiar_experience_v2_c45ade0a.jpg', caption: 'Familiar Experience' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_enchiladas_v2_38c1beb6.jpg', caption: 'Cheese Enchiladas' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_asada_tacos_v2_5d8fd027.jpg', caption: 'Asada Tacos' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_steak_lobster_v2_9eaddc91.jpg', caption: 'Steak & Lobster' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_carnitas_tacos_v2_fbda0695.jpg', caption: 'Carnitas Tacos' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_prime_rib_v2_0fba142a.jpg', caption: 'Prime Rib' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_taco_tuesday_v2_7832c76e.jpg', caption: 'Taco Tuesday v2' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_campechano_tacos_v2_84f349a7.jpg', caption: 'Campechano Tacos' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_buche_tacos_v2_e0f34e40.jpg', caption: 'Buche Tacos' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_baja_shrimp_tacos_v2_e949b575.jpg', caption: 'Baja Shrimp Tacos' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_arabe_tacos_v2_19934e90.jpg', caption: 'Arabe Tacos' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_lengua_tacos_v2_a3c3f4c4.jpg', caption: 'Lengua Tacos' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_ground_beef_tacos_v2_81560409.jpg', caption: 'Ground Beef Tacos' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_alambre_tacos_v2_b4a10d49.jpg', caption: 'Alambre Tacos' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_pollo_tacos_v2_5c062221.jpg', caption: 'Pollo Tacos' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_chocolate_oreo_sundae_v2_f15a7f25.jpg', caption: 'Chocolate Oreo Sundae v2' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_barbecue_ribs_v2_1e8a67f3.jpg', caption: 'BBQ Ribs' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_future_vision_v2_892c1e66.jpg', caption: 'Future Vision' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_our_dream_v2_c5a031be.jpg', caption: 'Our Dream' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_happy_hour_v2_d4f25fb2.jpg', caption: 'Happy Hour v2' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_cinco_de_mayo_v2_e596b4ae.jpg', caption: 'Cinco de Mayo v2' },
  // Promotional videos
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_promo_1_8a0b7ea8.mp4', caption: 'Promo Video 1' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_promo_2_6cc6d35a.mp4', caption: 'Promo Video 2' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_promo_3_38977f36.mp4', caption: 'Promo Video 3' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_promo_4_3a81cee1.mp4', caption: 'Promo Video 4' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_promo_5_a7cbbf69.mp4', caption: 'Promo Video 5' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_promo_6_9fdfebfb.mp4', caption: 'Promo Video 6' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_promo_7_c1d6d66a.mp4', caption: 'Promo Video 7' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_catering_v1_b47928d6.mp4', caption: 'Catering Video 1' },
  { url: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_catering_v2_48ea7b36.mp4', caption: 'Catering Video 2' },
];

// ── 2. Import all photos into food_photos table ───────────────────────────────
console.log(`\nImporting ${CDN_ASSETS.length} assets into food_photos catalog...`);
let imported = 0;
for (const asset of CDN_ASSETS) {
  const filename = asset.url.split('/').pop();
  const fileKey = `sopris-cdn-import/${filename}`;
  await db.insert(schema.foodPhotos).values({
    url: asset.url,
    fileKey,
    caption: asset.caption,
  });
  imported++;
}
console.log(`✓ Imported ${imported} assets`);

// ── 3. Generate posting slots: Mon/Tue/Thu/Sat at 13:00 MST (UTC+7 = 20:00 UTC) ─
const POSTING_DAYS = new Set([1, 2, 4, 6]); // Mon=1, Tue=2, Thu=4, Sat=6
const MST_HOUR_IN_UTC = 20; // 1 PM MST = 20:00 UTC

function getNextSlots(count) {
  const slots = [];
  const cursor = new Date();
  cursor.setUTCHours(MST_HOUR_IN_UTC, 0, 0, 0);
  // Start from tomorrow
  cursor.setUTCDate(cursor.getUTCDate() + 1);

  while (slots.length < count) {
    const dayOfWeek = cursor.getDay(); // local day
    // Use UTC day for consistency
    const utcDay = new Date(cursor).getUTCDay();
    // Actually use the UTC-adjusted day
    const mstDate = new Date(cursor.getTime() - 7 * 60 * 60 * 1000);
    const mstDay = mstDate.getDay();
    if (POSTING_DAYS.has(mstDay)) {
      slots.push(cursor.getTime());
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return slots;
}

// Check existing scheduled posts to avoid duplicates
const now = Date.now();
const existingScheduled = await db.select({ scheduledAt: schema.posts.scheduledAt })
  .from(schema.posts)
  .where(gte(schema.posts.scheduledAt, now));

const existingSlots = new Set(existingScheduled.map(p => {
  if (!p.scheduledAt) return null;
  const d = new Date(p.scheduledAt);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}).filter(Boolean));

console.log(`\nExisting scheduled posts: ${existingSlots.size}`);

// Get 16 slots (4 per week × 4 weeks)
const allSlots = getNextSlots(20);
const emptySlots = allSlots.filter(ts => {
  const d = new Date(ts);
  const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  return !existingSlots.has(key);
}).slice(0, 16);

console.log(`\nEmpty slots to fill: ${emptySlots.length}`);

// ── 4. Post content plan — map each slot to a specific image/caption theme ────
const POST_PLAN = [
  { caption: "🌮 It's Taco Tuesday at Sopris Taqueria! Come in and enjoy our authentic street tacos — carne asada, carnitas, pollo, and more. Handcrafted with fresh ingredients every single day. Stop by 4 Jacks Casino in Jackpot, NV and taste the difference!", captionEs: "¡Es Martes de Tacos en Sopris Taqueria! Ven a disfrutar nuestros auténticos tacos de calle — carne asada, carnitas, pollo y más. Hechos a mano con ingredientes frescos todos los días.", hashtags: "#TacoTuesday #SoprisTaqueria #JackpotNV #4JacksCasino #StreetTacos #AuthenticMexican", imageKey: 4, type: "taco_tuesday" },
  { caption: "🍔 Our Double Bacon Cheeseburger is the real deal — two juicy patties, crispy bacon, melted cheese, and all the fixings. Comfort food done right at Sopris Taqueria inside 4 Jacks Casino!", captionEs: "🍔 Nuestra Doble Hamburguesa con Tocino es lo mejor — dos jugosas hamburguesas, tocino crujiente, queso derretido y todos los aderezos. ¡Comida reconfortante en Sopris Taqueria!", hashtags: "#Burger #BaconCheeseburger #SoprisTaqueria #JackpotNV #4JacksCasino #ComfortFood", imageKey: 1, type: "menu_item" },
  { caption: "🥩 Prime Rib night is HERE. Our slow-roasted prime rib is tender, juicy, and absolutely worth the trip to Jackpot, NV. Served with your choice of sides. Come hungry!", captionEs: "🥩 ¡La noche de Prime Rib está aquí! Nuestro prime rib asado lentamente es tierno, jugoso y absolutamente vale la pena el viaje a Jackpot, NV. ¡Ven con hambre!", hashtags: "#PrimeRib #SoprisTaqueria #JackpotNV #4JacksCasino #SteakNight #DinnerTime", imageKey: 24, type: "special" },
  { caption: "🌯 Wet Burrito lovers — this one's for you! Our signature wet burrito is smothered in rich red sauce and melted cheese. It's a full meal in every bite. Find us inside 4 Jacks Casino, Jackpot NV!", captionEs: "🌯 ¡Amantes del burrito mojado — este es para ustedes! Nuestro burrito mojado está cubierto de rica salsa roja y queso derretido. ¡Es una comida completa en cada bocado!", hashtags: "#WetBurrito #SoprisTaqueria #JackpotNV #4JacksCasino #MexicanFood #Burrito", imageKey: 2, type: "menu_item" },
  { caption: "🍕 Did you know we serve pizza too? Our Supreme Pizza is loaded with all your favorites — pepperoni, sausage, peppers, and more. Sopris Taqueria has something for everyone at 4 Jacks Casino!", captionEs: "🍕 ¿Sabías que también servimos pizza? Nuestra Pizza Suprema está cargada con todos tus favoritos. ¡Sopris Taqueria tiene algo para todos en 4 Jacks Casino!", hashtags: "#Pizza #SupremePizza #SoprisTaqueria #JackpotNV #4JacksCasino #FamilyDining", imageKey: 8, type: "menu_item" },
  { caption: "🦐 Baja Shrimp Tacos — light, fresh, and absolutely delicious! Our shrimp tacos are made with perfectly seasoned shrimp, crisp cabbage, and our house sauce. A taste of the coast in the heart of Nevada!", captionEs: "🦐 Tacos de Camarón Baja — ¡ligeros, frescos y absolutamente deliciosos! Nuestros tacos de camarón están hechos con camarones perfectamente sazonados, repollo crujiente y nuestra salsa especial.", hashtags: "#ShrimpTacos #BajaTacos #SoprisTaqueria #JackpotNV #4JacksCasino #SeafoodTacos", imageKey: 37, type: "menu_item" },
  { caption: "🎉 Happy Hour at Sopris Taqueria! Great drinks, great food, great prices. Stop in after a day at 4 Jacks Casino and unwind with your favorites. You deserve it!", captionEs: "🎉 ¡Hora Feliz en Sopris Taqueria! Bebidas increíbles, comida deliciosa, precios increíbles. Pasa después de un día en 4 Jacks Casino y relájate con tus favoritos.", hashtags: "#HappyHour #SoprisTaqueria #JackpotNV #4JacksCasino #HappyHourDeals #DrinkSpecials", imageKey: 24, type: "promotion" },
  { caption: "🥩 Steak & Lobster — a classic combination that never gets old! Our surf and turf is the ultimate indulgence. Treat yourself tonight at Sopris Taqueria inside 4 Jacks Casino, Jackpot NV.", captionEs: "🥩 Filete y Langosta — ¡una combinación clásica que nunca pasa de moda! Nuestro surf and turf es la máxima indulgencia. Date un gusto esta noche en Sopris Taqueria.", hashtags: "#SteakAndLobster #SurfAndTurf #SoprisTaqueria #JackpotNV #4JacksCasino #FineDining", imageKey: 32, type: "menu_item" },
  { caption: "🌮 Taco Tuesday is back and better than ever! Mix and match your favorites — asada, carnitas, pollo, buche, lengua, and more. Authentic flavors, unbeatable prices. See you at Sopris Taqueria!", captionEs: "🌮 ¡El Martes de Tacos está de vuelta y mejor que nunca! Mezcla y combina tus favoritos — asada, carnitas, pollo, buche, lengua y más. ¡Sabores auténticos, precios inmejorables!", hashtags: "#TacoTuesday #SoprisTaqueria #JackpotNV #4JacksCasino #TacoLovers #MexicanFood", imageKey: 35, type: "taco_tuesday" },
  { caption: "🍖 BBQ Ribs that fall right off the bone! Our slow-smoked ribs are tender, saucy, and absolutely irresistible. Come in and get a full rack tonight at Sopris Taqueria in Jackpot, NV!", captionEs: "🍖 ¡Costillas BBQ que se caen del hueso! Nuestras costillas ahumadas lentamente son tiernas, jugosas e irresistibles. ¡Ven esta noche a Sopris Taqueria en Jackpot, NV!", hashtags: "#BBQRibs #Ribs #SoprisTaqueria #JackpotNV #4JacksCasino #BBQ #SlowSmoked", imageKey: 45, type: "menu_item" },
  { caption: "🌮 Campechano Tacos — the best of both worlds! Our campechano tacos combine carne asada and chorizo for a flavor explosion in every bite. Authentic Mexican street food at its finest!", captionEs: "🌮 ¡Tacos Campechanos — lo mejor de dos mundos! Nuestros tacos campechanos combinan carne asada y chorizo para una explosión de sabor en cada bocado.", hashtags: "#CampechanoTacos #SoprisTaqueria #JackpotNV #4JacksCasino #StreetTacos #MexicanFood", imageKey: 36, type: "menu_item" },
  { caption: "🍟 Onion Rings so crispy you can hear the crunch! Golden, perfectly seasoned, and great as a side or a snack. Pair them with our famous burgers at Sopris Taqueria inside 4 Jacks Casino!", captionEs: "🍟 ¡Aros de Cebolla tan crujientes que puedes escuchar el crujido! Dorados, perfectamente sazonados y excelentes como acompañamiento o bocadillo.", hashtags: "#OnionRings #SoprisTaqueria #JackpotNV #4JacksCasino #CrispyGoodness #Sides", imageKey: 12, type: "menu_item" },
  { caption: "🍫 End your meal on a sweet note with our Chocolate Oreo Sundae! Rich chocolate ice cream, crushed Oreos, whipped cream, and chocolate drizzle. Pure dessert heaven at Sopris Taqueria!", captionEs: "🍫 ¡Termina tu comida con una nota dulce con nuestro Sundae de Chocolate Oreo! Helado de chocolate rico, Oreos trituradas, crema batida y chocolate. ¡Puro paraíso de postre!", hashtags: "#ChocolateSundae #OreoDessert #SoprisTaqueria #JackpotNV #4JacksCasino #Dessert #IceCream", imageKey: 22, type: "menu_item" },
  { caption: "🥚 Carne Asada & Eggs — the breakfast of champions! Start your morning right with our perfectly seasoned carne asada paired with fluffy eggs. Available all day at Sopris Taqueria!", captionEs: "🥚 ¡Carne Asada y Huevos — el desayuno de campeones! Comienza tu mañana con nuestra carne asada perfectamente sazonada junto con huevos esponjosos. ¡Disponible todo el día!", hashtags: "#CarneAsadaEggs #Breakfast #SoprisTaqueria #JackpotNV #4JacksCasino #BreakfastAllDay", imageKey: 10, type: "menu_item" },
  { caption: "🍗 Chicken Fajitas sizzling hot and fresh! Tender grilled chicken, peppers, and onions served with warm tortillas, guacamole, and sour cream. A Sopris Taqueria classic!", captionEs: "🍗 ¡Fajitas de Pollo chisporroteando calientes y frescas! Pollo a la parrilla tierno, pimientos y cebollas servidos con tortillas calientes, guacamole y crema agria.", hashtags: "#ChickenFajitas #Fajitas #SoprisTaqueria #JackpotNV #4JacksCasino #MexicanFood", imageKey: 14, type: "menu_item" },
  { caption: "🌮 Birria Tacos — the taco that took the world by storm! Our slow-braised birria is rich, flavorful, and served with consommé for dipping. Come try the best birria in Jackpot, NV!", captionEs: "🌮 ¡Tacos de Birria — el taco que conquistó el mundo! Nuestra birria estofada lentamente es rica, sabrosa y se sirve con consomé para mojar. ¡Ven a probar la mejor birria en Jackpot, NV!", hashtags: "#BirriaTagos #Birria #SoprisTaqueria #JackpotNV #4JacksCasino #BirriaQuesatacos", imageKey: 9, type: "menu_item" },
];

// Map imageKey index to CDN_ASSETS array
const imageAssets = CDN_ASSETS.filter(a => !a.url.endsWith('.mp4'));
const videoAssets = CDN_ASSETS.filter(a => a.url.endsWith('.mp4'));

// ── 5. Insert scheduled posts ─────────────────────────────────────────────────
console.log(`\nCreating ${emptySlots.length} scheduled posts...`);
let created = 0;

for (let i = 0; i < emptySlots.length; i++) {
  const slot = emptySlots[i];
  const plan = POST_PLAN[i % POST_PLAN.length];

  // Alternate: every 4th post use a promo video, otherwise use image
  let imageUrl;
  if (i % 4 === 3 && videoAssets.length > 0) {
    // Use a promo video every 4th slot
    imageUrl = videoAssets[Math.floor(i / 4) % videoAssets.length].url;
  } else {
    imageUrl = imageAssets[plan.imageKey % imageAssets.length].url;
  }

  await db.insert(schema.posts).values({
    platform: 'both',
    captionEn: plan.caption,
    captionEs: plan.captionEs,
    hashtags: plan.hashtags,
    imageUrl,
    postType: plan.type,
    status: 'scheduled',
    scheduledAt: slot,
  });

  const d = new Date(slot);
  console.log(`  ✓ Slot ${i + 1}: ${d.toISOString().substring(0, 16)} — ${plan.type} [${imageUrl.endsWith('.mp4') ? 'VIDEO' : 'IMAGE'}]`);
  created++;
}

console.log(`\n✅ Done! Created ${created} scheduled posts across ${emptySlots.length} slots.`);
console.log(`📸 Food photos catalog: ${imported} assets imported.`);

await connection.end();
