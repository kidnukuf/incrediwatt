/**
 * Fix CloudFront URL posts:
 * 1. Delete the 16 posts that were created with /feed+link (showing raw CDN URL)
 * 2. Repost them cleanly using /photos or /videos endpoint
 */

const token = process.env.FACEBOOK_API_TOKEN;
const pageId = process.env.FACEBOOK_PAGE_ID;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function deletePost(postId) {
  const r = await fetch(`https://graph.facebook.com/v18.0/${postId}?access_token=${token}`, {
    method: 'DELETE'
  });
  const d = await r.json();
  return d;
}

async function repostWithPhoto(message, imageUrl) {
  const params = new URLSearchParams({ caption: message, url: imageUrl, access_token: token });
  const r = await fetch(`https://graph.facebook.com/v18.0/${pageId}/photos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });
  const d = await r.json();
  return d;
}

async function repostWithVideo(message, videoUrl) {
  const params = new URLSearchParams({ description: message, file_url: videoUrl, access_token: token });
  const r = await fetch(`https://graph.facebook.com/v18.0/${pageId}/videos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });
  const d = await r.json();
  return d;
}

// All 16 affected posts with their original message and CDN URL
const postsToFix = [
  {
    id: "1099719276547374_122106077384989013",
    message: "🌮 It's Taco Tuesday at Sopris Restaurant! Come in and enjoy our handcrafted tacos made with fresh ingredients and bold flavors. Whether you prefer carne asada, chicken, or our signature toppings — we've got your Tuesday covered!\n\n🇲🇽 ¡Es Martes de Tacos en Sopris Restaurant! Ven a disfrutar nuestros tacos artesanales hechos con ingredientes frescos y sabores intensos. ¡Ya sea carne asada, pollo o nuestros toppings especiales — tenemos tu martes cubierto!\n\n#TacoTuesday #SoprisRestaurant #JackpotNV #TacoLife #4JacksCasino #MartesDeTacos #CasinoEats #FreshTacos",
    cdnUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_taco_tuesday_event_7af6e5c6.png"
  },
  {
    id: "1099719276547374_122106077216989013",
    message: "🎉 The wait is almost over! Border Boost & Brew™ is opening its doors for the very first time this 4/20 Weekend — April 18-20, 2026! Get ready for handcrafted coffees, specialty energy drinks, smoothies, and more. All inside 4 Jacks Casino, Jackpot NV.\n\n🇲🇽 🎉 ¡La espera casi termina! ¡Border Boost & Brew™ abre sus puertas por primera vez este fin de semana del 4/20 — del 18 al 20 de abril de 2026! Prepárate para cafés artesanales, bebidas energéticas especiales, smoothies y más. Todo dentro de 4 Jacks Casino, Jackpot NV.\n\n#BorderBoostAndBrew #GrandOpening #420Weekend #JackpotNV #4JacksCasino #CoffeeLover #EnergyDrinks #Smoothies #CafeNuevo",
    cdnUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_bbb_grand_opening_event_c3e21e9b.png"
  },
  {
    id: "1099719276547374_122106077102989013",
    message: "🌿🎉 4/20 Weekend is HERE at Sopris Restaurant & Border Boost and Brew™! Celebrate with our special menu, craft drinks, and good vibes all weekend long. April 18-20, 2026 — inside 4 Jacks Casino, Jackpot NV.\n\n🇲🇽 🌿🎉 ¡El fin de semana del 4/20 está AQUÍ en Sopris Restaurant y Border Boost and Brew™! Celebra con nuestro menú especial, bebidas artesanales y buen ambiente todo el fin de semana. Del 18 al 20 de abril de 2026 — dentro de 4 Jacks Casino, Jackpot NV.\n\n#420Weekend #SoprisRestaurant #BorderBoostAndBrew #JackpotNV #4JacksCasino #420Celebration #GoodVibes",
    cdnUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_420_weekend_event_b7a3f912.png"
  },
  {
    id: "1099719276547374_122106076958989013",
    message: "🌿 4/20 Weekend is coming! Sopris Restaurant & Border Boost and Brew™ are celebrating with special menus and craft drinks April 18-20. Mark your calendars and come celebrate with us inside 4 Jacks Casino, Jackpot NV!\n\n🇲🇽 🌿 ¡El fin de semana del 4/20 se acerca! Sopris Restaurant y Border Boost and Brew™ celebran con menús especiales y bebidas artesanales del 18 al 20 de abril. ¡Marca tu calendario y ven a celebrar con nosotros!\n\n#420Weekend #SoprisRestaurant #BorderBoostAndBrew #JackpotNV #4JacksCasino #ComingSoon",
    cdnUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_420_bbb_story_bb079212.png"
  },
  {
    id: "1099719276547374_122106076832989013",
    message: "🌮 It's Taco Tuesday at Sopris Restaurant! Come in and enjoy our handcrafted tacos made with fresh ingredients and bold flavors. Whether you prefer carne asada, chicken, or our signature toppings — we've got your Tuesday covered!\n\n🇲🇽 ¡Es Martes de Tacos en Sopris Restaurant! Ven a disfrutar nuestros tacos artesanales hechos con ingredientes frescos y sabores intensos. ¡Ya sea carne asada, pollo o nuestros toppings especiales — tenemos tu martes cubierto!\n\n#TacoTuesday #SoprisRestaurant #JackpotNV #TacoLife #4JacksCasino #MartesDeTacos #CasinoEats #FreshTacos",
    cdnUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_taco_tuesday_event_7af6e5c6.png"
  },
  {
    id: "1099719276547374_122106076742989013",
    message: "⚡ Power through your day with a loaded energy drink from Border Boost and Brew™! Custom flavors, real energy, and zero compromise. Stop by inside 4 Jacks Casino, Jackpot NV.\n\n🇲🇽 ⚡ ¡Supera tu día con una bebida energética cargada de Border Boost and Brew™! Sabores personalizados, energía real y cero compromisos. ¡Pasa por dentro de 4 Jacks Casino, Jackpot NV.\n\n#BorderBoostAndBrew #EnergyDrink #JackpotNV #4JacksCasino #CustomDrinks #BBB",
    cdnUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/YouCut_20260312_005906346_2740eb72.mp4"
  },
  {
    id: "1099719276547374_122106076550989013",
    message: "🍖 BBQ Ribs that fall right off the bone! Our slow-smoked ribs are tender, saucy, and absolutely worth it. Come in and treat yourself at Sopris Restaurant inside 4 Jacks Casino, Jackpot NV!\n\n🇲🇽 🍖 ¡Costillas BBQ que se caen del hueso! Nuestras costillas ahumadas son tiernas, jugosas y absolutamente deliciosas. ¡Ven a darte un gusto en Sopris Restaurant dentro de 4 Jacks Casino, Jackpot NV!\n\n#BBQRibs #SoprisRestaurant #JackpotNV #4JacksCasino #SlowSmoked #CasinoEats #RibsLovers",
    cdnUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_barbecue_ribs_v2_1e8a67f3.jpg"
  },
  {
    id: "1099719276547374_122106076472989013",
    message: "🍕 Every great pizza starts with the sauce. Ours is made in-house and spread fresh on every pie. Come taste the difference at Sopris Restaurant inside 4 Jacks Casino, Jackpot NV!\n\n🇲🇽 🍕 Toda gran pizza comienza con la salsa. La nuestra se hace en casa y se extiende fresca en cada pizza. ¡Ven a probar la diferencia en Sopris Restaurant dentro de 4 Jacks Casino, Jackpot NV!\n\n#SoprisRestaurant #JackpotNV #PizzaLovers #HomemadeSauce #CasinoEats #4JacksCasino #FreshPizza 🍕🌮🔥\n\n#SoprisRestaurant #JackpotNV #VidaDeCocina #DetrasDeEscena #ComidaReal",
    cdnUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/20260319_174119_b1df3132.mp4"
  },
  {
    id: "1099719276547374_122106076448989013",
    message: "👨‍🍳 This is how we do it every single day. Our kitchen never stops — real ingredients, real passion, real food. Come experience it at Sopris Restaurant inside 4 Jacks Casino, Jackpot NV!\n\n🇲🇽 👨‍🍳 Así lo hacemos todos los días. Nuestra cocina nunca para — ingredientes reales, pasión real, comida real. ¡Ven a experimentarlo en Sopris Restaurant dentro de 4 Jacks Casino, Jackpot NV!\n\n#SoprisRestaurant #JackpotNV #VidaDeCocina #DetrasDeEscena #ComidaReal",
    cdnUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/20260319_174032_5a11a74e.mp4"
  },
  {
    id: "1099719276547374_122106076400989013",
    message: "🥩 Steak & Lobster — a classic combination that never gets old! Our surf and turf is the ultimate indulgence. Treat yourself tonight at Sopris Taqueria inside 4 Jacks Casino, Jackpot NV.\n\n🇲🇽 🥩 Filete y Langosta — ¡una combinación clásica que nunca pasa de moda! Nuestro surf and turf es la máxima indulgencia. Date un gusto esta noche en Sopris Taqueria.\n\n#SteakAndLobster #SurfAndTurf #SoprisTaqueria #JackpotNV #4JacksCasino #FineDining",
    cdnUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_promo_2_6cc6d35a.mp4"
  },
  {
    id: "1099719276547374_122106076376989013",
    message: "Your morning just got an upgrade. ☕ Meet the machine behind every perfect espresso at Border Boost & Brew™ — precision-crafted drinks to fuel your day. Stop by and let us boost your morning! Inside 4 Jacks Casino, Jackpot NV.\n\n🇲🇽 Tu mañana acaba de mejorar. ☕ Conoce la máquina detrás de cada espresso perfecto en Border Boost & Brew™ — bebidas elaboradas con precisión para energizar tu día. ¡Pasa a visitarnos! Dentro de 4 Jacks Casino, Jackpot NV.\n\n#BorderBoostAndBrew #BBB #JackpotNV #EspressoMachine #CoffeeLover #MorningBoost #CasinoCoffee #4JacksCasino #CraftCoffee #CoffeeShop",
    cdnUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/YouCut_20260319_174643282_69d80a7b.mp4"
  },
  {
    id: "1099719276547374_122106076340989013",
    message: "This is what sets us apart. 🍅 Our sauce is made in-house, from scratch, every day. No shortcuts, no cans — just real ingredients and real flavor. Come experience it for yourself at Sopris Restaurant inside 4 Jacks Casino, Jackpot NV!\n\n🇲🇽 Esto es lo que nos distingue. 🍅 Nuestra salsa se hace en casa, desde cero, todos los días. Sin atajos, sin latas — solo ingredientes reales y sabor real. ¡Ven a experimentarlo en Sopris Restaurant dentro de 4 Jacks Casino, Jackpot NV!\n\n#SoprisRestaurant #JackpotNV #MadeFromScratch #HomemadeSauce #CasinoEats #BehindTheScenes #RealFood #4JacksCasino #FreshIngredients #KitchenLife",
    cdnUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/YouCut_20260319_174855844_fa58f893.mp4"
  },
  {
    id: "1099719276547374_122106076304989013",
    message: "🧋 Treat yourself to one of our specialty blended drinks! Smoothies, frappes, and seasonal creations made fresh to order. Border Boost and Brew™ has something sweet for every mood. Stop by 4 Jacks Casino!\n\n🇲🇽 🧋 ¡Date un gusto con una de nuestras bebidas especiales! Smoothies, frappés y creaciones de temporada hechas al momento. ¡Border Boost and Brew™ tiene algo dulce para cada estado de ánimo!\n\n#BorderBoostAndBrew #Smoothie #Frappe #JackpotNV #4JacksCasino #SpecialtyDrinks #BlendedDrinks",
    cdnUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/YouCut_20260308_233528556_ec27e728.mp4"
  },
  {
    id: "1099719276547374_122106076280989013",
    message: "Made fresh, every single day. 🍕 Watch our kitchen team hand-craft your pizza from scratch — sauce spread, toppings loaded, and baked to perfection. Come taste the difference at Sopris Restaurant inside 4 Jacks Casino, Jackpot NV!\n\n🇲🇽 ¡Hecho fresco todos los días! 🍕 Mira a nuestro equipo preparar tu pizza desde cero — salsa, ingredientes y horneada a la perfección. ¡Ven a probar la diferencia en Sopris Restaurant dentro de 4 Jacks Casino, Jackpot NV!\n\n#SoprisRestaurant #JackpotNV #FreshPizza #MadeFromScratch #CasinoEats #BehindTheScenes #PizzaLovers #4JacksCasino #HomemadePizza #KitchenLife",
    cdnUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/YouCut_20260319_175308417_a99187dd.mp4"
  },
  {
    id: "1099719276547374_122106076268989013",
    message: "☕ Good morning, Jackpot! Start your day right with a handcrafted latte from Border Boost and Brew™ inside 4 Jacks Casino. Rich espresso, steamed milk, and your choice of flavors. Come fuel up before you hit the floor!\n\n🇲🇽 ☕ ¡Buenos días, Jackpot! Comienza tu día con un latte artesanal de Border Boost and Brew™ dentro del Casino 4 Jacks. ¡Espresso rico, leche al vapor y tu elección de sabores!\n\n#BorderBoostAndBrew #CoffeeLover #JackpotNV #4JacksCasino #Latte #MorningCoffee #Espresso",
    cdnUrl: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/YouCut_20260308_232848937_cfcc0b6a.mp4"
  }
];

async function run() {
  let deleted = 0;
  let reposted = 0;
  let errors = 0;

  for (const post of postsToFix) {
    const isVideo = post.cdnUrl.endsWith('.mp4');
    console.log(`\nProcessing: ${post.id} (${isVideo ? 'video' : 'image'})`);
    
    // Step 1: Delete the old post
    const delResult = await deletePost(post.id);
    if (delResult.success || delResult === true) {
      console.log(`  ✅ Deleted ${post.id}`);
      deleted++;
    } else {
      console.log(`  ❌ Delete failed:`, JSON.stringify(delResult));
      errors++;
      continue;
    }
    
    await sleep(1000);
    
    // Step 2: Repost cleanly
    let repostResult;
    if (isVideo) {
      repostResult = await repostWithVideo(post.message, post.cdnUrl);
    } else {
      repostResult = await repostWithPhoto(post.message, post.cdnUrl);
    }
    
    if (repostResult.id || repostResult.post_id) {
      console.log(`  ✅ Reposted as ${repostResult.post_id || repostResult.id}`);
      reposted++;
    } else {
      console.log(`  ❌ Repost failed:`, JSON.stringify(repostResult));
      errors++;
    }
    
    // Pace the requests to avoid rate limiting
    await sleep(2000);
  }
  
  console.log(`\n=== DONE ===`);
  console.log(`Deleted: ${deleted}/${postsToFix.length}`);
  console.log(`Reposted: ${reposted}/${postsToFix.length}`);
  console.log(`Errors: ${errors}`);
}

run().catch(console.error);
