import fetch from 'node-fetch';
import fs from 'fs';

const USER_ID = '61579670390263';
const ACCESS_TOKEN = 'EAAXQN04B0W8BQwVfG3qX5GKNgZBZCNcneSXHIM8AerlTpuzHD8ANe4ZAi0Q8l6bPSPlBzBdAGH90fJwkE5NOY3c2LJCpMPM8ue4vLS3GS2J1K6S1ApksckdICam9t70r1ZAQqB0IdkZC6zaXFEZBCMFR1rPlnPbIoxHcHtK6xfQvxfpkU2MuWUZAjDnmGB7idbsOaZBAd8YOPbba0lwc27trbvzYrfriKaDSgxYFQOq12VOHYoNHZAWMZD';

const posts = [
  {
    date: '2026-03-16',
    message: '🌮 Asada Tacos - Our signature slow-cooked beef tacos, seasoned to perfection.\n\n¡Tacos de Asada! Carne de res cocinada lentamente, sazonada a la perfección.\n\n#SoprisRestaurant #AsadaTacos #MexicanFood #JackpotNV #FoodLove',
    media_url: 'https://d2l4x3x8nxwt8j.cloudfront.net/sopris_asada_tacos_v2.jpg'
  },
  {
    date: '2026-03-17',
    message: '❤️ Our Story: Named after our daughters Sophie & Iris, Sopris is a dream brought to life.\n\nNuestra Historia: Nombrado después de nuestras hijas Sophie e Iris, Sopris es un sueño hecho realidad.\n\n#SoprisRestaurant #FamilyBusiness #RestaurantLife #JackpotNV',
    media_url: 'https://d2l4x3x8nxwt8j.cloudfront.net/sopris_story_sophie_iris_v2.jpg'
  }
];

async function postToFacebook(post) {
  try {
    const formData = new URLSearchParams();
    formData.append('message', post.message);
    formData.append('link', post.media_url);
    formData.append('access_token', ACCESS_TOKEN);

    const response = await fetch(`https://graph.facebook.com/${USER_ID}/feed`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    
    if (data.error) {
      console.error(`❌ Failed to post (${post.date}):`, data.error.message);
    } else {
      console.log(`✅ Posted successfully (${post.date}):`, data.id);
    }
  } catch (error) {
    console.error(`Error posting (${post.date}):`, error.message);
  }
}

async function main() {
  console.log('Starting to post to Sopris Restaurant...\n');
  
  for (const post of posts) {
    await postToFacebook(post);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between posts
  }
  
  console.log('\n✅ All posts completed!');
}

main();
