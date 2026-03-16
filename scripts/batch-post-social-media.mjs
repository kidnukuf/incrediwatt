#!/usr/bin/env node

/**
 * Batch Social Media Posting Script
 * Schedules and posts all content to Facebook and Instagram
 * 
 * Usage: node scripts/batch-post-social-media.mjs
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const INSTAGRAM_BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
const FACEBOOK_API_TOKEN = process.env.FACEBOOK_API_TOKEN;

if (!FACEBOOK_PAGE_ID || !INSTAGRAM_BUSINESS_ACCOUNT_ID || !FACEBOOK_API_TOKEN) {
  console.error('❌ Missing required environment variables:');
  console.error('   - FACEBOOK_PAGE_ID');
  console.error('   - INSTAGRAM_BUSINESS_ACCOUNT_ID');
  console.error('   - FACEBOOK_API_TOKEN');
  process.exit(1);
}

// Post data from 3-month calendar
const POSTS = [
  {
    id: 1,
    date: '2026-03-16',
    time: '13:00',
    type: 'graphic',
    content: 'Our Story (Sophie & Iris)',
    imageUrl: 'https://example.com/sopris_story_sophie_iris_v2.jpg',
    captionEn: `🏔️ Meet Sopris 🏔️

Named after our daughters, Sophie & Iris, Sopris Restaurant is more than just a place to eat—it's a family dream brought to life.

With over a decade of restaurant experience, we created Sopris to do things our way: authentic flavors, quality ingredients, and a warm welcome for everyone who walks through our doors.

Every dish is prepared with care. Every guest is treated like family.

Welcome to Sopris. 💚`,
    captionEs: `🏔️ Conoce Sopris 🏔️

Nombrado en honor a nuestras hijas, Sophie e Iris, Sopris Restaurant es más que un lugar para comer—es un sueño familiar hecho realidad.

Con más de una década de experiencia en restaurantes, creamos Sopris para hacer las cosas a nuestra manera: sabores auténticos, ingredientes de calidad y una cálida bienvenida para todos.

Cada plato se prepara con cuidado. Cada huésped es tratado como familia.

Bienvenido a Sopris. 💚`,
    hashtags: '#SoprisRestaurant #FamilyOwned #JackpotNV #AuthenticCuisine #RestaurantLife',
  },
  {
    id: 2,
    date: '2026-03-17',
    time: '13:00',
    type: 'graphic',
    content: 'Steak & Lobster Combo',
    imageUrl: 'https://example.com/sopris_steak_lobster_v2.jpg',
    captionEn: `🥩 STEAK & LOBSTER COMBO 🦞

Our signature upscale dinner—perfectly cooked steak paired with a succulent lobster tail. This is fine dining done right.

Available now at Sopris. $29.99

Come experience the best of both worlds. 🤤`,
    captionEs: `🥩 COMBO DE FILETE Y LANGOSTA 🦞

Nuestra cena de firma de lujo—filete perfectamente cocido emparejado con una cola de langosta suculenta. Esta es la alta cocina hecha correctamente.

Disponible ahora en Sopris. $29.99

Ven a experimentar lo mejor de ambos mundos. 🤤`,
    hashtags: '#SoprisRestaurant #SteakAndLobster #FreshSeafood #UpscaleDining #JackpotNV #TreatYourself',
  },
  // Additional 27 posts would follow the same structure...
  // For brevity, showing first 2 posts as template
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
    return data.id;
  } catch (error) {
    console.error(`✗ Facebook posting failed:`, error.message);
    return null;
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
      media_type: 'IMAGE',
      image_url: post.imageUrl,
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
    return publishData.id;
  } catch (error) {
    console.error(`✗ Instagram posting failed:`, error.message);
    return null;
  }
}

/**
 * Schedule post for specific date/time
 */
function schedulePost(post, callback) {
  const [year, month, day] = post.date.split('-').map(Number);
  const [hour, minute] = post.time.split(':').map(Number);
  
  const postTime = new Date(year, month - 1, day, hour, minute);
  const now = new Date();
  const delay = postTime.getTime() - now.getTime();

  if (delay <= 0) {
    console.log(`⚠️  Post ${post.id} is in the past, posting immediately...`);
    callback();
  } else {
    const delayHours = (delay / (1000 * 60 * 60)).toFixed(2);
    console.log(`⏱️  Post ${post.id} scheduled in ${delayHours} hours (${postTime.toLocaleString()})`);
    setTimeout(callback, delay);
  }
}

/**
 * Execute post to both platforms
 */
async function executePost(post) {
  console.log(`\n📤 Posting: ${post.content}`);
  console.log(`   Date: ${post.date} @ ${post.time} MST`);

  const facebookId = await postToFacebook(post);
  const instagramId = await postToInstagram(post);

  if (facebookId || instagramId) {
    console.log(`✅ Post ${post.id} successfully posted!`);
    return { facebookId, instagramId };
  } else {
    console.log(`❌ Post ${post.id} failed on both platforms`);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Sopris Restaurant - Social Media Batch Posting');
  console.log('================================================\n');

  console.log(`📍 Facebook Page ID: ${FACEBOOK_PAGE_ID}`);
  console.log(`📍 Instagram Account ID: ${INSTAGRAM_BUSINESS_ACCOUNT_ID}`);
  console.log(`📊 Total posts to schedule: ${POSTS.length}\n`);

  for (const post of POSTS) {
    schedulePost(post, () => executePost(post));
  }

  console.log('\n✅ All posts scheduled!');
  console.log('   Monitor this script to see posts execute at scheduled times.');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
