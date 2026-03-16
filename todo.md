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
