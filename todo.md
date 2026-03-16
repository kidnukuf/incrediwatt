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
