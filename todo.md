# Sopris Social Media Manager — TODO

## Phase 1: Database & Schema
- [x] Define schema: menuItems, posts, specials, events, promotions, foodPhotos tables
- [x] Generate and apply migration SQL
- [x] Seed menu items from CSV

## Phase 2: Backend Routers
- [x] menu router: list, getByCategory, getById
- [x] posts router: create, list, update, delete, generateBilingual
- [x] specials router: create, list, delete
- [x] events router: create, list, delete
- [x] promotions router: create, list, toggle active
- [x] foodPhotos router: upload, list, link to menu item

## Phase 3: Frontend — Dashboard & Calendar
- [x] DashboardLayout with sidebar navigation
- [x] Content calendar (3 posts/week, Taco Tuesday auto-slot)
- [x] Post generator modal with menu item selector and bilingual output

## Phase 4: Frontend — Forms & Preview
- [x] Post preview component (Facebook + Instagram formats)
- [x] Specials input form
- [x] Events input form
- [x] Promotions management (review promo, CDL, honor roll, educator)
- [x] Post history view
- [x] Manual post creation form

## Phase 5: Frontend — Images & Extras
- [x] Image upload and management for food photos
- [x] Link photos to menu items
- [x] Borderline Brew & Boost placeholder module
- [x] Global styling: Sopris brand colors (black, white, warm gold)

## Phase 6: Tests & Delivery
- [x] Vitest tests for post generation and promotions routers
- [x] Checkpoint and delivery

## Standing Rules
- [x] ALWAYS use prices from menusopris.csv — never from screenshots or other sources

## Phase 7: Facebook Integration Fix
- [x] Diagnosed wrong Page ID (61579670390263 → correct: 1099719276547374)
- [x] Fixed socialMedia.ts to use /photos endpoint for image posts
- [x] Updated FACEBOOK_PAGE_ID secret to correct Sopris Restaurant page
- [x] Updated FACEBOOK_API_TOKEN to page-level token (not user token)
- [x] All 19 vitest tests passing with updated credentials
- [x] Successfully posted 16 branded posts to correct Sopris Restaurant Facebook page

## Phase 8: Instagram Posting
- [x] Test Instagram Business Account credentials
- [x] Fix Instagram posting logic if needed
- [x] Post 15 curated posts to Instagram (@soprisrestaurant)
- [x] Verify posts are live — 16/16 published successfully

## Phase 9: Three Improvements
- [x] Fix INSTAGRAM_BUSINESS_ACCOUNT_ID secret to 17841445981820762
- [x] Wire Publish Now button in Post Generator to live Facebook + Instagram posting
- [x] Add post scheduling: date/time picker with Mon/Tue/Thu/Sat 1PM MST slots
- [x] Add auto-publish cron scheduler (runs every 5 min, publishes due posts)
- [x] Update socialMedia.ts to use ENV.instagramBusinessAccountId (no hardcode)
- [x] All 21 vitest tests passing

## Phase 10: Three More Features
- [x] Add Publish Now button to Post History page (works for draft and scheduled posts)
- [x] Add food photo image picker to Post Generator (grid picker with live preview in FB/IG cards)
- [x] Build 4-week content plan calendar view (Mon/Tue/Thu/Sat slots, green=filled, amber=empty, + month view toggle)
- [x] All 21 vitest tests passing

## Phase 11: Fill Schedule & Fix Video Catalog
- [x] Audit schedule gaps — 0 posts, 0 photos found
- [x] Audit food photos and video catalog in DB
- [x] Fix video routing: publishNow + processScheduled now detect .mp4 and use videoUrl path
- [x] Import 59 CDN assets (50 images + 9 videos) into food_photos catalog
- [x] Created 16 scheduled posts across Mon/Tue/Thu/Sat slots for next 4 weeks (platform=both)
- [x] Every 4th post uses a promo video; others use food images
- [x] All 21 vitest tests passing

## Phase 12: Border Boost and Brew Independent Schedule
- [x] Renamed all "Borderline Brew" references to "Border Boost and Brew" across 8 files
- [x] borderline_brew post_type already in schema — no migration needed
- [x] Added fillBrewSchedule tRPC procedure for independent schedule management
- [x] Border Boost and Brew page rebuilt with stats, schedule fill button, and content modules
- [x] Seeded 16 Border Boost and Brew™ scheduled posts (Mar 17 – Apr 13, Mon/Tue/Thu/Sat, 8 image + 8 video)
- [x] All 21 vitest tests passing

## Phase 14: Brand Label Audit
- [x] Searched codebase — no "baby" references found; found 7 remaining "borderline" references
- [x] Renamed BorderlineBrew.tsx → BorderBoostAndBrew.tsx, removed old file
- [x] Updated App.tsx: import + routes now use BorderBoostAndBrew and /border-boost-and-brew
- [x] Updated DashboardLayout: sidebar path → /border-boost-and-brew, removed "Soon" badge
- [x] Old /borderline-brew route kept as redirect alias for backward compatibility
- [x] Zero TypeScript errors, all 21 vitest tests passing

## Phase 15: 4/20 Weekend Campaign
- [x] Generated Sopris Restaurant 4/20 food & drink specials ad (infographic)
- [x] Generated Sopris Restaurant 4/20 story/reel format ad
- [x] Generated Border Boost and Brew™ grand opening 4/20 weekend ad
- [x] Generated Border Boost and Brew™ teaser/countdown ad
- [x] Wrote all bilingual captions and hashtags for the campaign
- [x] Delivered all assets to user

## Phase 16: 4/20 Campaign Scheduling
- [x] Uploaded 4 ad images to CDN
- [x] Scheduled 10 Mon/Thu lead-up posts (Mar 17 - Apr 16) alternating Sopris & BBB
- [x] Scheduled 6 daily posts Apr 18, 19, 20 (both brands each day, BBB offset by 1hr)
- [x] Verified 16 new 4/20 campaign posts in database (33 total campaign posts visible)

## Phase 17: Digital TV Signage Display
- [x] Generated 3 real origin story slides (Sophie & Iris, family story)
- [x] Generated Taco Tuesday, Cinco de Mayo, 2-Year Anniversary, 4/20 Weekend, BBB ad slides
- [x] Generated real QR codes for Facebook, Google, and Yelp review pages
- [x] Built full-screen looping Signage.tsx with fade transitions (10-15s per slide)
- [x] Review slide shows all 3 QR codes with platform icons side by side
- [x] Added TV Display to DashboardLayout sidebar (Monitor icon)
- [x] Route /signage added to App.tsx
- [x] 21/21 vitest tests passing

## Phase 18: Additional Digital Signage Assets
- [ ] Audit existing signage slides and plan new categories
- [ ] Generate food highlight slides (signature dishes, prime rib, enchiladas, BBQ ribs)
- [ ] Generate Taco Tuesday feature slide with real menu items
- [ ] Generate happy hour / drinks slide
- [ ] Generate family/community welcome slide
- [ ] Generate 2 more Border Boost and Brew™ slides
- [ ] Upload all new assets to CDN
- [ ] Add all new slides to Signage.tsx rotation
- [x] Save checkpoint

## Phase 18: New Restaurant Videos for Digital Display
- [x] Uploaded 9 new restaurant videos to CDN (all 9/9 succeeded)
- [x] Generated 5 new image slides: Prime Rib, Street Tacos, Happy Hour, BBB Grand Opening, Cheese Enchiladas (no prices)
- [x] Added all 9 videos and 5 new image slides to Signage.tsx rotation (24 total slides)
- [x] Added VideoSlide component with autoplay/muted/loop support
- [x] Zero TypeScript errors

## Phase 19: New Signage Slides — Burger, Online Ordering, Catering
- [x] Find best burger images from food photo catalog
- [x] Generate Burger Ad slide using existing catalog burger image
- [x] DROPPED - replaced with Catering only per user request
- [x] Generate Catering slide (no prices)
- [x] Add 2 new slides to Signage.tsx rotation
- [x] Convert new slides to MP4 and update Roku USB ZIP
- [x] Save checkpoint

## Phase 20: Reaction Vote Social Media Images
- [x] Select 5 best food photos from catalog
- [x] Generate 5 reaction vote images (thumbs up, heart, high five, lol)
- [x] Upload all 5 to CDN
- [x] Deliver to user
- [x] Schedule all 5 posts for consecutive Mondays at 1 PM MT

## Phase 21: New Food Photos - French Dip & Chef's Salad
- [x] Clean up and enhance all 3 photos
- [x] Upload to CDN and add to food_photos catalog
- [x] Create and schedule social media posts for all 3

## Phase 22: Facebook Event Posts
- [x] Generate Taco Tuesday recurring event graphic
- [x] Generate BBB Grand Opening 4/20 weekend event graphic
- [x] Generate 4/20 Weekend Special promotion graphic (BBB + Sopris combined)
- [x] Schedule all 3 events in the database (11 total posts)
- [x] Uploaded 6 new kitchen/BBB videos to CDN and social schedule
- [x] Converted all to Roku-compatible format and added to USB package
- [x] Saved checkpoint (38 clips, 152 MB)

## Phase 23: Enhance 4 Raw Kitchen Videos with Professional Branding
- [ ] Download and prepare source videos (Carne Asada, Pizza Prep, Homemade Sauce, Kitchen Carne Asada)
- [ ] Add Sopris logo watermarks and animated text overlays to all 4 videos
- [ ] Apply color grading, transitions, and professional effects
- [ ] Upload enhanced videos to CDN and replace originals in database
- [ ] Add enhanced videos to Roku USB package

## Phase 24: Fix Facebook CDN URL Showing as Visible Text
- [x] Diagnosed root cause: /feed endpoint with link: param causes Facebook to show raw CDN URL
- [x] Fixed socialMedia.ts: image posts now use /photos endpoint with caption: + url: params
- [x] Save checkpoint

## Phase 25: Permanent Facebook Page Token
- [x] Identified token mismatch: INSTAGRAM_APP_SECRET belongs to different app than the Facebook token
- [x] Obtained Facebook App Secret for app 1636310834073967 (soprisrestaurantsocialmediaman)
- [x] Exchanged short-lived user token for 60-day long-lived user token
- [x] Derived permanent (never-expiring) Page token from long-lived user token
- [x] Stored permanent token as FACEBOOK_API_TOKEN secret
- [x] Stored Facebook App Secret as FACEBOOK_APP_SECRET secret
- [x] Updated ENV to expose facebookAppSecret
- [x] Updated tokenStatus procedure to use app credentials for accurate debug_token calls
- [x] Updated Dashboard to display "Permanent token — never expires" status
- [x] All 21 vitest tests passing
- [x] Save checkpoint
