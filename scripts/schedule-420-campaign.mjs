/**
 * 4/20 Campaign Scheduling Script
 * 
 * Schedule:
 * - Mon/Thu lead-up posts from Mar 17 to Apr 17 (alternating Sopris & BBB)
 * - Daily posts Apr 18 (Fri), Apr 19 (Sat), Apr 20 (Sun) — both brands each day
 * 
 * All posts at 1 PM MST (20:00 UTC)
 */

import { createConnection } from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

const db = await createConnection(process.env.DATABASE_URL);

const SOPRIS_SPECIALS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/420_sopris_specials_a7645862.png";
const SOPRIS_STORY_IMG    = "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/420_sopris_story_35ae0e36.png";
const BBB_GRAND_IMG       = "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/420_bbb_grand_opening_0eb0ba97.png";
const BBB_STORY_IMG       = "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/420_bbb_story_bb079212.png";

// 1 PM MST = 20:00 UTC
function utcMs(year, month, day) {
  return Date.UTC(year, month - 1, day, 20, 0, 0);
}

// Lead-up Mon/Thu dates from today (Mar 17) to Apr 17
// Mar 17 = Mon, Mar 20 = Thu, Mar 23 = Mon, Mar 27 = Thu,
// Mar 30 = Mon, Apr 3 = Thu, Apr 7 = Mon, Apr 10 = Thu,
// Apr 14 = Mon, Apr 17 = Thu
const leadUpDates = [
  { date: utcMs(2026, 3, 17), day: "Mon Mar 17" },
  { date: utcMs(2026, 3, 19), day: "Thu Mar 19" },
  { date: utcMs(2026, 3, 23), day: "Mon Mar 23" },
  { date: utcMs(2026, 3, 26), day: "Thu Mar 26" },
  { date: utcMs(2026, 3, 30), day: "Mon Mar 30" },
  { date: utcMs(2026, 4, 2),  day: "Thu Apr 2"  },
  { date: utcMs(2026, 4, 6),  day: "Mon Apr 6"  },
  { date: utcMs(2026, 4, 9),  day: "Thu Apr 9"  },
  { date: utcMs(2026, 4, 13), day: "Mon Apr 13" },
  { date: utcMs(2026, 4, 16), day: "Thu Apr 16" },
];

// Weekend posts — both brands post each day
const weekendDates = [
  { date: utcMs(2026, 4, 18), day: "Fri Apr 18 — GRAND OPENING DAY" },
  { date: utcMs(2026, 4, 19), day: "Sat Apr 19" },
  { date: utcMs(2026, 4, 20), day: "Sun Apr 20 — 4/20 DAY" },
];

// Captions rotate through these for lead-up posts
const soprisLeadUpCaptions = [
  {
    en: "🌿 Something BIG is coming to Sopris Restaurant this 4/20 weekend! Mark your calendars for April 18-20 — we're serving up food & drink specials all weekend long. The munchies are real, and we've got you covered! 🍽️🔥 #SoprisRestaurant #JackpotNV #420Weekend #ComingSoon",
    es: "🌿 ¡Algo GRANDE viene a Sopris Restaurant este fin de semana del 4/20! Marca tus calendarios para el 18-20 de abril — ¡tendremos especiales de comida y bebida todo el fin de semana! #SoprisRestaurant #JackpotNV",
    hashtags: "#SoprisRestaurant #JackpotNV #420Weekend #ComingSoon #FoodSpecials #MunchiesSeason #Nevada #TacoTuesday",
    img: SOPRIS_SPECIALS_IMG,
  },
  {
    en: "🌮 4/20 Weekend Specials are almost here! Get ready for our 420 Taco Platter, Double Stack Deal, Happy Hour ALL weekend, and a FREE dessert with every entree. April 18-20 only at Sopris Restaurant in Jackpot, NV! 🍹🍨 #SoprisRestaurant #420Specials",
    es: "🌮 ¡Los especiales del fin de semana 4/20 ya casi llegan! Prepárate para el Plato de Tacos 420, Doble Hamburguesa, Happy Hour todo el fin de semana, y Postre GRATIS con tu orden. ¡Solo del 18-20 de abril! #SoprisRestaurant",
    hashtags: "#SoprisRestaurant #420Specials #JackpotNV #TacoPlatter #HappyHour #FreeDessert #420Weekend #MexicanFood #Nevada",
    img: SOPRIS_SPECIALS_IMG,
  },
  {
    en: "🔥 Only [X] days until our 4/20 Weekend Specials kick off at Sopris Restaurant! Food & drinks specials April 18-20. Come hungry, leave happy. 🍽️❤️ Jackpot, NV #SoprisRestaurant #420Weekend",
    es: "🔥 ¡Solo [X] días para nuestros Especiales del fin de semana 4/20 en Sopris Restaurant! Especiales de comida y bebida del 18-20 de abril. ¡Ven con hambre, sal feliz! #SoprisRestaurant",
    hashtags: "#SoprisRestaurant #420Weekend #JackpotNV #FoodSpecials #HappyHour #LocalEats #Nevada #420 #Countdown",
    img: SOPRIS_STORY_IMG,
  },
];

const bbbLeadUpCaptions = [
  {
    en: "⚡ Something NEW is coming to Jackpot this 4/20 weekend... We can't say much yet — but it involves energy boosts, specialty coffee, signature drinks, and 420 specials you won't find anywhere else. 👀 Grand Opening: April 18-20! #BorderBoostAndBrew #JackpotNV #ComingSoon",
    es: "⚡ Algo NUEVO llega a Jackpot este fin de semana del 4/20... No podemos decir mucho todavía — pero involucra bebidas energéticas, café especial, y especiales del 4/20. Gran Apertura: 18-20 de Abril! #BorderBoostAndBrew",
    hashtags: "#BorderBoostAndBrew #GrandOpening #ComingSoon #JackpotNV #420Weekend #EnergyDrinks #SpecialtyCoffee #NewInJackpot #Nevada",
    img: BBB_STORY_IMG,
  },
  {
    en: "☕⚡ Get ready Jackpot — Border Boost and Brew™ is opening its doors on 4/20 weekend! Energy boosts, specialty coffee, signature drinks, and 420 weekend specials. Grand Opening: April 18-20. See you there! 🎉 #BorderBoostAndBrew #GrandOpening",
    es: "☕⚡ ¡Prepárate Jackpot — Border Boost and Brew™ abre sus puertas el fin de semana del 4/20! Bebidas energéticas, café especial, y especiales del 4/20. Gran Apertura: 18-20 de Abril. ¡Nos vemos! #BorderBoostAndBrew",
    hashtags: "#BorderBoostAndBrew #GrandOpening #JackpotNV #420Weekend #EnergyDrinks #SpecialtyCoffee #SignatureDrinks #Nevada #NewBusiness",
    img: BBB_GRAND_IMG,
  },
  {
    en: "🎉 The countdown is ON! Border Boost and Brew™ Grand Opening is just around the corner — April 18-20 in Jackpot, NV! ⚡ Energy boosts to fuel your 4/20 weekend. ☕ Specialty coffee crafted with care. 🍹 Signature drinks you won't find anywhere else. Come boost your vibe! #BorderBoostAndBrew",
    es: "🎉 ¡La cuenta regresiva ha comenzado! Gran Apertura de Border Boost and Brew™ — 18-20 de Abril en Jackpot, NV! ¡Ven a impulsar tu vibra este fin de semana del 4/20! #BorderBoostAndBrew",
    hashtags: "#BorderBoostAndBrew #GrandOpening #Countdown #JackpotNV #420Weekend #EnergyDrinks #SpecialtyCoffee #Nevada #420 #NewBusiness",
    img: BBB_STORY_IMG,
  },
];

// Weekend captions
const weekendPosts = {
  "Apr 18": {
    sopris: {
      en: "🎉🌿 4/20 WEEKEND SPECIALS START TODAY at Sopris Restaurant! 🌿🎉\n\nCome in and enjoy:\n🌮 420 Taco Platter — Special Price\n🍔 Double Stack Deal\n🍹 Happy Hour ALL Weekend Long\n🍨 Free Dessert with Any Entree\n\nAlso — our neighbors at Border Boost and Brew™ just opened their doors today! Stop by both spots and make it a full 4/20 experience in Jackpot! ⚡\n\n📍 Sopris Restaurant — Jackpot, NV | Open Today!",
      es: "🎉🌿 ¡LOS ESPECIALES DEL FIN DE SEMANA 4/20 COMIENZAN HOY en Sopris Restaurant! Ven a disfrutar nuestros especiales de comida y bebida. ¡También visita a nuestros vecinos en Border Boost and Brew™ que abren hoy! #SoprisRestaurant #JackpotNV",
      hashtags: "#SoprisRestaurant #420Weekend #420Specials #JackpotNV #GrandOpeningWeekend #BorderBoostAndBrew #MunchiesSeason #HappyHour #FreeDessert #LocalEats #Nevada #420",
      img: SOPRIS_SPECIALS_IMG,
      type: "special",
    },
    bbb: {
      en: "⚡🎉 WE ARE OFFICIALLY OPEN! 🎉⚡\n\nBorder Boost and Brew™ is NOW OPEN in Jackpot, NV — and we're kicking off our Grand Opening weekend with 4/20 specials!\n\n⚡ Energy Boost Drinks — custom blends\n☕ Specialty Coffee — lattes, cold brews & more\n🍹 Signature Drinks — our own unique creations\n🎉 420 Weekend Specials — all weekend long!\n\nCome boost your vibe! Also check out our neighbors at Sopris Restaurant for amazing food specials all weekend! 🌮\n\n📍 Border Boost and Brew™ — Jackpot, NV | Grand Opening: April 18-20",
      es: "⚡🎉 ¡ESTAMOS OFICIALMENTE ABIERTOS! Border Boost and Brew™ ya está abierto en Jackpot, NV con especiales del fin de semana 4/20. ¡Ven a celebrar con nosotros! #BorderBoostAndBrew #JackpotNV",
      hashtags: "#BorderBoostAndBrew #GrandOpening #NowOpen #JackpotNV #420Weekend #EnergyDrinks #SpecialtyCoffee #SignatureDrinks #420Specials #Nevada #GrandOpeningWeekend #420",
      img: BBB_GRAND_IMG,
      type: "borderline_brew",
    },
  },
  "Apr 19": {
    sopris: {
      en: "🌮 DAY 2 of our 4/20 Weekend Specials at Sopris Restaurant! Still going strong all day today:\n\n🌮 420 Taco Platter\n🍔 Double Stack Deal\n🍹 Happy Hour Drinks\n🍨 Free Dessert with Entree\n\nDon't miss out — specials end Sunday! Come in today and bring the whole crew. 🙌\n\n📍 Sopris Restaurant — Jackpot, NV | Open Today!",
      es: "🌮 ¡DÍA 2 de nuestros Especiales del fin de semana 4/20 en Sopris Restaurant! Los especiales continúan hoy. ¡Ven con toda la familia! #SoprisRestaurant #JackpotNV #420Weekend",
      hashtags: "#SoprisRestaurant #420Weekend #Day2 #JackpotNV #TacoPlatter #HappyHour #FreeDessert #MunchiesSeason #LocalEats #Nevada #420Specials",
      img: SOPRIS_STORY_IMG,
      type: "special",
    },
    bbb: {
      en: "⚡ DAY 2 of our Grand Opening Weekend at Border Boost and Brew™! \n\nThank you Jackpot for the incredible welcome yesterday! We're back today with all our 4/20 weekend specials:\n\n⚡ Energy Boosts\n☕ Specialty Coffee\n🍹 Signature Drinks\n🎉 420 Specials\n\nCome find us in Jackpot and boost your Saturday! 💪\n\n📍 Border Boost and Brew™ — Jackpot, NV",
      es: "⚡ ¡DÍA 2 de nuestro fin de semana de Gran Apertura en Border Boost and Brew™! Gracias Jackpot por la increíble bienvenida de ayer. ¡Seguimos con todos nuestros especiales del 4/20 hoy! #BorderBoostAndBrew #JackpotNV",
      hashtags: "#BorderBoostAndBrew #GrandOpening #Day2 #JackpotNV #420Weekend #EnergyDrinks #SpecialtyCoffee #Saturday #Nevada #420Specials #GrandOpeningWeekend",
      img: BBB_STORY_IMG,
      type: "borderline_brew",
    },
  },
  "Apr 20": {
    sopris: {
      en: "🌿 HAPPY 4/20! 🌿\n\nThe munchies hit different today — and Sopris Restaurant is ready for you! 🍽️🔥\n\nFood & Drink Specials ALL DAY today:\n🌮 420 Taco Platter\n🍔 Double Stack Deal\n🍹 Happy Hour Drinks\n🍨 Free Dessert with Entree\n\nLAST DAY of our 4/20 Weekend Specials — don't miss out! Also stop by Border Boost and Brew™ next door for the ultimate Jackpot 4/20 experience! ⚡☕\n\n📍 Sopris Restaurant — Jackpot, NV | Open Today!",
      es: "🌿 ¡FELIZ 4/20! 🌿 ¡Los antojos son reales y Sopris Restaurant está listo para ti! Especiales de comida y bebida TODO EL DÍA. ¡Último día de nuestros especiales del fin de semana 4/20! #SoprisRestaurant #JackpotNV #Happy420",
      hashtags: "#SoprisRestaurant #Happy420 #420 #MunchiesSeason #JackpotNV #FoodSpecials #BorderBoostAndBrew #420Weekend #LocalEats #LastDay #Nevada #420Day",
      img: SOPRIS_STORY_IMG,
      type: "special",
    },
    bbb: {
      en: "🌿⚡ HAPPY 4/20 from Border Boost and Brew™! ⚡🌿\n\nIt's the big day and we're celebrating with you! Come boost your 4/20 with:\n\n⚡ Our signature energy boost drinks\n☕ Specialty coffees to elevate your day\n🍹 420 signature cocktails (non-alcoholic)\n🎉 Special 4/20 deals ALL DAY\n\nThank you Jackpot for an incredible Grand Opening weekend! Today is the LAST DAY of our opening specials — come celebrate with us! 🙌\n\n📍 Border Boost and Brew™ — Jackpot, NV",
      es: "🌿⚡ ¡FELIZ 4/20 de parte de Border Boost and Brew™! ¡Es el gran día y lo celebramos contigo! Ven a impulsar tu 4/20 con nuestras bebidas especiales. ¡Gracias Jackpot por un increíble fin de semana de Gran Apertura! #BorderBoostAndBrew #Happy420 #JackpotNV",
      hashtags: "#BorderBoostAndBrew #Happy420 #420 #GrandOpening #JackpotNV #EnergyDrinks #SpecialtyCoffee #420Day #LastDay #Nevada #420Weekend #GrandOpeningWeekend",
      img: BBB_GRAND_IMG,
      type: "borderline_brew",
    },
  },
};

const now = Date.now();
let insertCount = 0;

// Insert lead-up posts (alternating Sopris and BBB)
for (let i = 0; i < leadUpDates.length; i++) {
  const { date, day } = leadUpDates[i];
  
  // Skip dates in the past
  if (date < now) {
    console.log(`⏭️  Skipping past date: ${day}`);
    continue;
  }

  const isBBB = i % 2 === 1; // odd = BBB, even = Sopris
  const capIdx = Math.floor(i / 2) % 3;

  if (isBBB) {
    const cap = bbbLeadUpCaptions[capIdx % bbbLeadUpCaptions.length];
    await db.execute(
      `INSERT INTO posts (platform, caption_en, caption_es, hashtags, image_url, post_type, status, scheduled_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'scheduled', ?, NOW(), NOW())`,
      ["both", cap.en, cap.es, cap.hashtags, cap.img, "borderline_brew", date]
    );
    console.log(`✅ BBB lead-up: ${day}`);
  } else {
    const cap = soprisLeadUpCaptions[capIdx % soprisLeadUpCaptions.length];
    await db.execute(
      `INSERT INTO posts (platform, caption_en, caption_es, hashtags, image_url, post_type, status, scheduled_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'scheduled', ?, NOW(), NOW())`,
      ["both", cap.en, cap.es, cap.hashtags, cap.img, "special", date]
    );
    console.log(`✅ Sopris lead-up: ${day}`);
  }
  insertCount++;
}

// Insert weekend posts — both brands each day
for (const [dayKey, brands] of Object.entries(weekendPosts)) {
  for (const [brand, cap] of Object.entries(brands)) {
    const dateEntry = weekendDates.find(d => d.day.includes(dayKey));
    if (!dateEntry) continue;
    
    // Add 1 hour offset for BBB so they don't post at exact same time
    const postTime = brand === "bbb" ? dateEntry.date + 3600000 : dateEntry.date;
    
    await db.execute(
      `INSERT INTO posts (platform, caption_en, caption_es, hashtags, image_url, post_type, status, scheduled_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'scheduled', ?, NOW(), NOW())`,
      ["both", cap.en, cap.es, cap.hashtags, cap.img, cap.type, postTime]
    );
    console.log(`✅ ${dayKey} ${brand === "bbb" ? "BBB" : "Sopris"}: scheduled`);
    insertCount++;
  }
}

console.log(`\n🎉 Done! Inserted ${insertCount} 4/20 campaign posts.`);
await db.end();
