/**
 * Seed Border Boost and Brew™ scheduled posts for the next 4 weeks.
 * Posts on Mon/Tue/Thu/Sat at 1 PM MST (20:00 UTC), platform=both.
 * Run: npx tsx scripts/seed-brew-schedule.mjs
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';
import { and, eq, gte } from 'drizzle-orm';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

const POSTING_DAYS = new Set([1, 2, 4, 6]); // Mon=1, Tue=2, Thu=4, Sat=6
const MST_OFFSET_MS = 7 * 60 * 60 * 1000;

// Check existing brew scheduled slots
const now = Date.now();
const existing = await db.select({ scheduledAt: schema.posts.scheduledAt })
  .from(schema.posts)
  .where(and(eq(schema.posts.postType, 'borderline_brew'), gte(schema.posts.scheduledAt, now)));

const existingSlots = new Set(
  existing.map(p => {
    if (!p.scheduledAt) return null;
    const d = new Date(p.scheduledAt);
    return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
  }).filter(Boolean)
);

console.log(`Existing brew slots: ${existingSlots.size}`);

// Generate 16 slots (4 weeks × 4 days)
const slots = [];
const cursor = new Date();
cursor.setUTCHours(20, 0, 0, 0);
cursor.setUTCDate(cursor.getUTCDate() + 1);

while (slots.length < 16) {
  const mstDate = new Date(cursor.getTime() - MST_OFFSET_MS);
  const mstDay = mstDate.getDay();
  if (POSTING_DAYS.has(mstDay)) {
    const key = `${cursor.getUTCFullYear()}-${cursor.getUTCMonth()}-${cursor.getUTCDate()}`;
    if (!existingSlots.has(key)) {
      slots.push(cursor.getTime());
    }
  }
  cursor.setUTCDate(cursor.getUTCDate() + 1);
}

console.log(`Slots to fill: ${slots.length}`);

const BREW_POSTS = [
  {
    captionEn: "☕ Good morning, Jackpot! Start your day right with a handcrafted latte from Border Boost and Brew™ inside 4 Jacks Casino. Rich espresso, steamed milk, and your choice of flavors. Come fuel up before you hit the floor!",
    captionEs: "☕ ¡Buenos días, Jackpot! Comienza tu día con un latte artesanal de Border Boost and Brew™ dentro del Casino 4 Jacks. ¡Espresso rico, leche al vapor y tu elección de sabores!",
    hashtags: "#BorderBoostAndBrew #CoffeeLover #JackpotNV #4JacksCasino #Latte #MorningCoffee #Espresso",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_post_carne_asada_eggs_1141c375.jpg",
  },
  {
    captionEn: "⚡ Need an energy boost? Our Red Bull loaded drinks are the perfect pick-me-up! Custom blends, your favorite flavors, and that extra kick to keep you going. Find us inside 4 Jacks Casino, Jackpot NV!",
    captionEs: "⚡ ¿Necesitas energía? ¡Nuestras bebidas cargadas de Red Bull son el impulso perfecto! Mezclas personalizadas y tus sabores favoritos. ¡Encuéntranos dentro del Casino 4 Jacks!",
    hashtags: "#BorderBoostAndBrew #RedBull #EnergyDrink #JackpotNV #4JacksCasino #BoostUp #EnergyBoost",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_promo_1_8a0b7ea8.mp4",
  },
  {
    captionEn: "🧋 Treat yourself to one of our specialty blended drinks! Smoothies, frappes, and seasonal creations made fresh to order. Border Boost and Brew™ has something sweet for every mood. Stop by 4 Jacks Casino!",
    captionEs: "🧋 ¡Date un gusto con una de nuestras bebidas especiales! Smoothies, frappés y creaciones de temporada hechas al momento. ¡Border Boost and Brew™ tiene algo dulce para cada estado de ánimo!",
    hashtags: "#BorderBoostAndBrew #Smoothie #Frappe #JackpotNV #4JacksCasino #SpecialtyDrinks #BlendedDrinks",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_chocolate_oreo_sundae_v2_f15a7f25.jpg",
  },
  {
    captionEn: "☕ Cappuccino perfection! Velvety foam, bold espresso, and just the right balance. Border Boost and Brew™ crafts every cup with care. Pair it with your favorite Sopris Taqueria breakfast and you're set for the day!",
    captionEs: "☕ ¡Perfección en capuchino! Espuma aterciopelada, espresso intenso y el equilibrio perfecto. ¡Combínalo con tu desayuno favorito de Sopris Taqueria!",
    hashtags: "#BorderBoostAndBrew #Cappuccino #CoffeeCraft #JackpotNV #4JacksCasino #MorningVibes #CoffeeAndFood",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_promo_2_6cc6d35a.mp4",
  },
  {
    captionEn: "⚡ Double the energy, double the fun! Our loaded energy drinks come in dozens of flavor combinations. Mix Red Bull with your favorite juice, syrup, or cream. Custom drinks made YOUR way at Border Boost and Brew™!",
    captionEs: "⚡ ¡Doble energía, doble diversión! Nuestras bebidas energéticas vienen en docenas de combinaciones de sabores. ¡Bebidas personalizadas a TU manera en Border Boost and Brew™!",
    hashtags: "#BorderBoostAndBrew #LoadedEnergyDrink #CustomDrinks #JackpotNV #4JacksCasino #RedBullLoaded",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_post_chicken_fajitas_a1b34c9f.jpg",
  },
  {
    captionEn: "🌅 Rise and grind, Jackpot! Border Boost and Brew™ opens early so you can fuel up before your day begins. Hot espresso drinks, cold blends, and everything in between. See you at 4 Jacks Casino!",
    captionEs: "🌅 ¡Levántate y brilla, Jackpot! Border Boost and Brew™ abre temprano para que puedas recargar energías antes de comenzar tu día. ¡Hasta luego en el Casino 4 Jacks!",
    hashtags: "#BorderBoostAndBrew #EarlyBird #MorningCoffee #JackpotNV #4JacksCasino #RiseAndGrind #CoffeeTime",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_post_fajita_trio_98ae6a2d.jpg",
  },
  {
    captionEn: "🍵 Matcha lovers, this one's for you! Our creamy matcha latte is made with premium matcha powder and your choice of milk. Earthy, smooth, and absolutely delicious. Available now at Border Boost and Brew™!",
    captionEs: "🍵 ¡Amantes del matcha, este es para ustedes! Nuestro latte de matcha cremoso está hecho con polvo de matcha premium. ¡Terroso, suave y absolutamente delicioso!",
    hashtags: "#BorderBoostAndBrew #MatchaLatte #Matcha #JackpotNV #4JacksCasino #GreenTea #HealthyDrinks",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_promo_3_38977f36.mp4",
  },
  {
    captionEn: "☕ The perfect combo: a hot latte from Border Boost and Brew™ + street tacos from Sopris Taqueria. Two great brands, one amazing location inside 4 Jacks Casino, Jackpot NV. Come experience both!",
    captionEs: "☕ La combinación perfecta: un latte caliente de Border Boost and Brew™ + tacos de la calle de Sopris Taqueria. ¡Dos marcas increíbles, una ubicación increíble!",
    hashtags: "#BorderBoostAndBrew #SoprisTaqueria #JackpotNV #4JacksCasino #CoffeeAndTacos #BestCombo",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_post_street_tacos_c4a8bb9d.jpg",
  },
  {
    captionEn: "☕ Iced or hot — we've got you covered! Border Boost and Brew™ serves your favorite espresso drinks any way you like them. Stop in at 4 Jacks Casino, Jackpot NV and let us make your perfect cup!",
    captionEs: "☕ ¡Frío o caliente — te tenemos cubierto! Border Boost and Brew™ sirve tus bebidas de espresso favoritas como más te gusten. ¡Pasa por el Casino 4 Jacks y déjanos hacer tu taza perfecta!",
    hashtags: "#BorderBoostAndBrew #IcedCoffee #HotCoffee #JackpotNV #4JacksCasino #CoffeeAnyWay",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_promo_4_3a81cee1.mp4",
  },
  {
    captionEn: "⚡ Power through your day with a loaded energy drink from Border Boost and Brew™! Choose from dozens of flavor combos and get that boost you need. Inside 4 Jacks Casino, Jackpot NV — open daily!",
    captionEs: "⚡ ¡Supera tu día con una bebida energética cargada de Border Boost and Brew™! Elige entre docenas de combinaciones de sabores. ¡Dentro del Casino 4 Jacks, Jackpot NV — abierto todos los días!",
    hashtags: "#BorderBoostAndBrew #EnergyDrink #PowerUp #JackpotNV #4JacksCasino #RedBull #LoadedDrinks",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_post_birria_tacos_dd99ef8e.jpg",
  },
  {
    captionEn: "🧋 Seasonal special alert! Try our limited-time blended creation — only available at Border Boost and Brew™ inside 4 Jacks Casino. Come in before it's gone!",
    captionEs: "🧋 ¡Alerta de especial de temporada! Prueba nuestra creación mezclada de tiempo limitado — solo disponible en Border Boost and Brew™ dentro del Casino 4 Jacks. ¡Ven antes de que se acabe!",
    hashtags: "#BorderBoostAndBrew #SeasonalDrink #LimitedTime #JackpotNV #4JacksCasino #SpecialDrink",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_promo_5_a7cbbf69.mp4",
  },
  {
    captionEn: "☕ Your morning ritual just got an upgrade! Border Boost and Brew™ is your go-to spot for premium espresso drinks in Jackpot, NV. Find us inside 4 Jacks Casino — we're ready to serve you!",
    captionEs: "☕ ¡Tu ritual matutino acaba de mejorar! Border Boost and Brew™ es tu lugar favorito para bebidas de espresso premium en Jackpot, NV. ¡Encuéntranos dentro del Casino 4 Jacks!",
    hashtags: "#BorderBoostAndBrew #MorningRitual #PremiumCoffee #JackpotNV #4JacksCasino #EspressoBar",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_post_carne_asada_eggs_1141c375.jpg",
  },
  {
    captionEn: "⚡ Weekend vibes call for a loaded Red Bull drink! Come into Border Boost and Brew™ at 4 Jacks Casino and let us mix up something amazing for you. Custom flavors, great prices, good times!",
    captionEs: "⚡ ¡El fin de semana pide una bebida cargada de Red Bull! Ven a Border Boost and Brew™ en el Casino 4 Jacks y déjanos prepararte algo increíble. ¡Sabores personalizados, buenos precios, buenos momentos!",
    hashtags: "#BorderBoostAndBrew #WeekendVibes #RedBull #JackpotNV #4JacksCasino #WeekendDrinks",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_promo_6_9fdfebfb.mp4",
  },
  {
    captionEn: "🌟 Two brands, one location — Border Boost and Brew™ + Sopris Taqueria, both inside 4 Jacks Casino in Jackpot, NV. Get your morning coffee and your favorite meal all in one stop. Life is good!",
    captionEs: "🌟 Dos marcas, una ubicación — Border Boost and Brew™ + Sopris Taqueria, ambas dentro del Casino 4 Jacks en Jackpot, NV. ¡Obtén tu café matutino y tu comida favorita en una sola parada!",
    hashtags: "#BorderBoostAndBrew #SoprisTaqueria #JackpotNV #4JacksCasino #TwoBrandsOneLove #CoffeeAndFood",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_post_street_tacos_c4a8bb9d.jpg",
  },
  {
    captionEn: "☕ Vanilla latte, caramel macchiato, or something totally custom — at Border Boost and Brew™, you call the shots! Our baristas are ready to craft your perfect drink. Inside 4 Jacks Casino, Jackpot NV!",
    captionEs: "☕ ¡Latte de vainilla, macchiato de caramelo, o algo totalmente personalizado — en Border Boost and Brew™, tú decides! Nuestros baristas están listos para preparar tu bebida perfecta.",
    hashtags: "#BorderBoostAndBrew #CustomCoffee #VanillaLatte #CaramelMacchiato #JackpotNV #4JacksCasino",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_promo_7_c1d6d66a.mp4",
  },
  {
    captionEn: "⚡ Fuel up for the casino floor! Border Boost and Brew™ has the energy drinks and coffee creations to keep you going all day. Find us inside 4 Jacks Casino, Jackpot NV. See you soon!",
    captionEs: "⚡ ¡Recarga energías para el piso del casino! Border Boost and Brew™ tiene las bebidas energéticas y creaciones de café para mantenerte activo todo el día. ¡Encuéntranos dentro del Casino 4 Jacks!",
    hashtags: "#BorderBoostAndBrew #CasinoLife #EnergyDrinks #JackpotNV #4JacksCasino #FuelUp #GameOn",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_catering_v1_b47928d6.mp4",
  },
];

let created = 0;
for (let i = 0; i < slots.length; i++) {
  const plan = BREW_POSTS[i % BREW_POSTS.length];
  await db.insert(schema.posts).values({
    platform: 'both',
    captionEn: plan.captionEn,
    captionEs: plan.captionEs,
    hashtags: plan.hashtags,
    imageUrl: plan.imageUrl,
    postType: 'borderline_brew',
    status: 'scheduled',
    scheduledAt: slots[i],
  });
  const d = new Date(slots[i]);
  const isVideo = plan.imageUrl.endsWith('.mp4');
  console.log(`  ✓ ${d.toISOString().substring(0, 10)} — ${isVideo ? '[VIDEO]' : '[IMAGE]'} ${plan.captionEn.substring(0, 50)}…`);
  created++;
}

console.log(`\n✅ Created ${created} Border Boost and Brew™ scheduled posts.`);
await connection.end();
