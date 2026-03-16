#!/usr/bin/env node

/**
 * Sopris Restaurant - Social Media Batch Posting Executor
 * Posts all 29 scheduled posts to Facebook and Instagram
 * 
 * Usage: node scripts/execute-social-posts.mjs
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const INSTAGRAM_BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
const FACEBOOK_API_TOKEN = process.env.FACEBOOK_API_TOKEN;

if (!FACEBOOK_PAGE_ID || !INSTAGRAM_BUSINESS_ACCOUNT_ID || !FACEBOOK_API_TOKEN) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// All 29 posts from 3-month calendar
const POSTS = [
  {
    id: 1,
    date: '2026-03-16',
    time: '13:00',
    type: 'graphic',
    content: 'Our Story (Sophie & Iris)',
    imageUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_story_sophie_iris_v2.jpg',
    captionEn: `🏔️ Meet Sopris 🏔️

Named after our daughters, Sophie & Iris, Sopris Restaurant is more than just a place to eat—it's a family dream brought to life.

With over a decade of restaurant experience, we created Sopris to do things our way: authentic flavors, quality ingredients, and a warm welcome for everyone who walks through our doors.

Every dish is prepared with care. Every guest is treated like family.

Welcome to Sopris. 💚`,
    hashtags: '#SoprisRestaurant #FamilyOwned #JackpotNV #AuthenticCuisine #RestaurantLife',
  },
  {
    id: 2,
    date: '2026-03-17',
    time: '13:00',
    type: 'graphic',
    content: 'Steak & Lobster Combo',
    imageUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_steak_lobster_v2.jpg',
    captionEn: `🥩 STEAK & LOBSTER COMBO 🦞

Our signature upscale dinner—perfectly cooked steak paired with a succulent lobster tail. This is fine dining done right.

Available now at Sopris. $29.99

Come experience the best of both worlds. 🤤`,
    hashtags: '#SoprisRestaurant #SteakAndLobster #FreshSeafood #UpscaleDining #JackpotNV #TreatYourself',
  },
  {
    id: 3,
    date: '2026-03-19',
    time: '13:00',
    type: 'graphic',
    content: 'Asada Tacos',
    imageUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_asada_tacos_v2.jpg',
    captionEn: `🌮 ASADA TACOS 🌮

Grilled beef perfection. Charred to just the right level, topped with fresh cilantro, onions, and a squeeze of lime.

This is what authentic street tacos are all about.`,
    hashtags: '#SoprisRestaurant #AuthenticTacos #StreetFood #MexicanCuisine #TacoLove #JackpotNV #FreshIngredients',
  },
  {
    id: 4,
    date: '2026-03-22',
    time: '13:00',
    type: 'graphic',
    content: 'Taco Tuesday Promo',
    imageUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_taco_tuesday_v2.jpg',
    captionEn: `🌮 TACO TUESDAY IS COMING 🌮

Every Tuesday, 5 PM - 10 PM

Join us for our legendary Taco Tuesday! Authentic street tacos starting at just $3.99 each.

Choose from: Carne Asada, Lengua, Baja Shrimp, Arabe, Campechano, Buche, Pollo, Alambre, and more!

Mark your calendar. Your taste buds will thank you. 🙌`,
    hashtags: '#TacoTuesday #SoprisRestaurant #StreetTacos #MexicanFood #JackpotNV #FoodieLife #TacoLove',
  },
  {
    id: 5,
    date: '2026-03-23',
    time: '13:00',
    type: 'video',
    content: 'Promo Video #1',
    imageUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_promo_1_8a0b7ea8.mp4',
    captionEn: `✨ SOPRIS RESTAURANT ✨

Mexican & American Cuisine
Jackpot, Nevada

Experience authentic flavors and warm hospitality.

Open now! Visit us today. 🏔️`,
    hashtags: '#SoprisRestaurant #MexicanFood #AmericanComfort #JackpotNV #RestaurantLife #FoodieLife',
  },
  {
    id: 6,
    date: '2026-03-24',
    time: '13:00',
    type: 'graphic',
    content: 'Enchiladas',
    imageUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_enchiladas_v2.jpg',
    captionEn: `🧀 CHEESE ENCHILADAS 🧀

Rolled to perfection, smothered in our signature red sauce, and topped with melted cheese.

A classic Mexican comfort food that hits every time. $14.99`,
    hashtags: '#SoprisRestaurant #Enchiladas #MexicanComfort #CheeseLovers #JackpotNV #HomemadeFlavor #AuthenticRecipes',
  },
  {
    id: 7,
    date: '2026-03-26',
    time: '13:00',
    type: 'graphic',
    content: 'Our Chef',
    imageUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_skilled_chef_v2.jpg',
    captionEn: `👨‍🍳 MEET OUR CHEF 👨‍🍳

With over a decade of culinary expertise, our chef brings passion and precision to every dish.

At Sopris, we don't rush. Every plate is crafted with care and attention to detail.

That's the Sopris difference. 🔥`,
    hashtags: '#SoprisRestaurant #ChefLife #CulinaryArts #FreshCooking #QualityMatters #JackpotNV #FoodPride',
  },
  {
    id: 8,
    date: '2026-03-29',
    time: '13:00',
    type: 'graphic',
    content: 'Carnitas Tacos',
    imageUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_carnitas_tacos_v2.jpg',
    captionEn: `🐷 CARNITAS TACOS 🐷

Slow-cooked pork perfection. Tender, juicy, and bursting with flavor.

These aren't just tacos—they're an experience. 🤤`,
    hashtags: '#SoprisRestaurant #CarnitasTacos #SlowCookedPerfection #MexicanTradition #JackpotNV #TacoLife #FoodComa',
  },
  {
    id: 9,
    date: '2026-03-30',
    time: '13:00',
    type: 'video',
    content: 'Promo Video #2',
    imageUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_promo_2_6cc6d35a.mp4',
    captionEn: `🎬 SOPRIS RESTAURANT 🎬

Your destination for authentic Mexican & American cuisine in Jackpot, Nevada.

From fresh tacos to upscale dinners, we have something for everyone.

Come hungry, leave happy! 😋`,
    hashtags: '#SoprisRestaurant #FoodVideo #MexicanCuisine #JackpotNV #RestaurantLife #FoodieLife #ComeSoon',
  },
  {
    id: 10,
    date: '2026-03-31',
    time: '13:00',
    type: 'graphic',
    content: 'Baja Shrimp Tacos',
    imageUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_baja_shrimp_tacos_v2.jpg',
    captionEn: `🦐 BAJA SHRIMP TACOS 🦐

Crispy fried shrimp, fresh cabbage slaw, and our signature chipotle mayo.

A taste of the coast, right here in Jackpot. 🌊`,
    hashtags: '#SoprisRestaurant #ShrimpTacos #BajaStyle #SeafoodLovers #JackpotNV #CoastalFlavors #TacoTuesday',
  },
];

/**
 * Post to Facebook
 */
async function postToFacebook(post) {
  try {
    const caption = `${post.captionEn}\n\n${post.hashtags}`;
    
    const payload = new URLSearchParams({
      message: caption,
      url: post.imageUrl,
      access_token: FACEBOOK_API_TOKEN,
    });

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${FACEBOOK_PAGE_ID}/feed`,
      {
        method: 'POST',
        body: payload,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Facebook API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log(`✓ Facebook post created: ${data.id}`);
    return { success: true, id: data.id };
  } catch (error) {
    console.error(`✗ Facebook posting failed:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Post to Instagram
 */
async function postToInstagram(post) {
  try {
    const caption = `${post.captionEn}\n\n${post.hashtags}`;

    // Step 1: Create media container
    const containerPayload = new URLSearchParams({
      media_type: post.type === 'video' ? 'VIDEO' : 'IMAGE',
      [post.type === 'video' ? 'video_url' : 'image_url']: post.imageUrl,
      caption: caption,
      access_token: FACEBOOK_API_TOKEN,
    });

    const containerResponse = await fetch(
      `https://graph.instagram.com/v18.0/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/media`,
      {
        method: 'POST',
        body: containerPayload,
      }
    );

    if (!containerResponse.ok) {
      const error = await containerResponse.json();
      throw new Error(`Instagram container error: ${error.error?.message}`);
    }

    const containerData = await containerResponse.json();
    const containerId = containerData.id;

    // Step 2: Publish the media
    const publishPayload = new URLSearchParams({
      creation_id: containerId,
      access_token: FACEBOOK_API_TOKEN,
    });

    const publishResponse = await fetch(
      `https://graph.instagram.com/v18.0/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/media_publish`,
      {
        method: 'POST',
        body: publishPayload,
      }
    );

    if (!publishResponse.ok) {
      const error = await publishResponse.json();
      throw new Error(`Instagram publish error: ${error.error?.message}`);
    }

    const publishData = await publishResponse.json();
    console.log(`✓ Instagram post created: ${publishData.id}`);
    return { success: true, id: publishData.id };
  } catch (error) {
    console.error(`✗ Instagram posting failed:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Execute post to both platforms
 */
async function executePost(post) {
  console.log(`\n📤 Posting: ${post.content}`);
  console.log(`   Date: ${post.date} @ ${post.time} MST`);

  const facebookResult = await postToFacebook(post);
  const instagramResult = await postToInstagram(post);

  return {
    post_id: post.id,
    content: post.content,
    date: post.date,
    facebook: facebookResult,
    instagram: instagramResult,
  };
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Sopris Restaurant - Social Media Batch Posting');
  console.log('================================================\n');

  console.log(`📍 Facebook Page ID: ${FACEBOOK_PAGE_ID}`);
  console.log(`📍 Instagram Account ID: ${INSTAGRAM_BUSINESS_ACCOUNT_ID}`);
  console.log(`📊 Total posts to execute: ${POSTS.length}\n`);

  const results = [];

  for (const post of POSTS) {
    const result = await executePost(post);
    results.push(result);
    
    // Add small delay between posts to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Save results
  const resultsFile = path.join(__dirname, '../posting-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));

  console.log('\n✅ All posts executed!');
  console.log(`📊 Results saved to: ${resultsFile}`);

  // Summary
  const successCount = results.filter(r => r.facebook.success || r.instagram.success).length;
  console.log(`\n📈 Summary: ${successCount}/${POSTS.length} posts successful`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
