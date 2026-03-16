#!/bin/bash

USER_ID="61579670390263"
TOKEN="EAAXQN04B0W8BQwVfG3qX5GKNgZBZCNcneSXHIM8AerlTpuzHD8ANe4ZAi0Q8l6bPSPlBzBdAGH90fJwkE5NOY3c2LJCpMPM8ue4vLS3GS2J1K6S1ApksckdICam9t70r1ZAQqB0IdkZC6zaXFEZBCMFR1rPlnPbIoxHcHtK6xfQvxfpkU2MuWUZAjDnmGB7idbsOaZBAd8YOPbba0lwc27trbvzYrfriKaDSgxYFQOq12VOHYoNHZAWMZD"

echo "🚀 Starting Sopris Restaurant Social Media Campaign..."
echo "Posting 29 pieces of content to Facebook..."
echo ""

# Post 1: Asada Tacos
curl -s -X POST "https://graph.facebook.com/$USER_ID/feed" \
  -F "message=🌮 Asada Tacos - Our signature slow-cooked beef tacos, seasoned to perfection.%0A%0A¡Tacos de Asada! Carne de res cocinada lentamente, sazonada a la perfección.%0A%0A#SoprisRestaurant #AsadaTacos #MexicanFood #JackpotNV #FoodLove" \
  -F "link=https://d2l4x3x8nxwt8j.cloudfront.net/sopris_asada_tacos_v2.jpg" \
  -F "access_token=$TOKEN" > /dev/null && echo "✅ Post 1: Asada Tacos" || echo "❌ Post 1 failed"
sleep 2

# Post 2: Our Story (Sophie & Iris)
curl -s -X POST "https://graph.facebook.com/$USER_ID/feed" \
  -F "message=❤️ Our Story: Named after our daughters Sophie & Iris, Sopris is a dream brought to life.%0A%0ANuestra Historia: Nombrado después de nuestras hijas Sophie e Iris, Sopris es un sueño hecho realidad.%0A%0A#SoprisRestaurant #FamilyBusiness #RestaurantLife #JackpotNV" \
  -F "link=https://d2l4x3x8nxwt8j.cloudfront.net/sopris_story_sophie_iris_v2.jpg" \
  -F "access_token=$TOKEN" > /dev/null && echo "✅ Post 2: Our Story" || echo "❌ Post 2 failed"
sleep 2

# Post 3: Steak & Lobster
curl -s -X POST "https://graph.facebook.com/$USER_ID/feed" \
  -F "message=🥩🦞 Steak & Lobster Combo - Our most luxurious dinner! Premium cut steak paired with fresh lobster.%0A%0ACombo de Filete y Langosta - ¡Nuestra cena más lujosa! Filete premium emparejado con langosta fresca.%0A%0A$29.99 | #SoprisRestaurant #SteakAndLobster #PremiumDining #JackpotNV" \
  -F "link=https://d2l4x3x8nxwt8j.cloudfront.net/sopris_steak_lobster_v2.jpg" \
  -F "access_token=$TOKEN" > /dev/null && echo "✅ Post 3: Steak & Lobster" || echo "❌ Post 3 failed"
sleep 2

# Post 4: Skilled Chef
curl -s -X POST "https://graph.facebook.com/$USER_ID/feed" \
  -F "message=👨‍🍳 Our Skilled Chef: Over a decade of culinary expertise in every dish we serve.%0A%0ANuestro Chef Experto: Más de una década de experiencia culinaria en cada plato que servimos.%0A%0A#SoprisRestaurant #ChefLife #CulinaryExcellence #JackpotNV" \
  -F "link=https://d2l4x3x8nxwt8j.cloudfront.net/sopris_skilled_chef_v2.jpg" \
  -F "access_token=$TOKEN" > /dev/null && echo "✅ Post 4: Skilled Chef" || echo "❌ Post 4 failed"
sleep 2

# Post 5: Never Rushed
curl -s -X POST "https://graph.facebook.com/$USER_ID/feed" \
  -F "message=⏱️ Never Rushed: Every dish is prepared with care and expertise. Quality over speed—always.%0A%0ANunca Apurado: Cada plato se prepara con cuidado y experiencia. Calidad sobre velocidad—siempre.%0A%0A#SoprisRestaurant #QualityFood #FreshCooking #JackpotNV" \
  -F "link=https://d2l4x3x8nxwt8j.cloudfront.net/sopris_never_rushed_v2.jpg" \
  -F "access_token=$TOKEN" > /dev/null && echo "✅ Post 5: Never Rushed" || echo "❌ Post 5 failed"
sleep 2

echo ""
echo "✅ First 5 posts completed!"
echo "Continue with remaining 24 posts..."
