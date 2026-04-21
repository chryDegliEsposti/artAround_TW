# Merge artAround_TW and navigatorV2

## Process Flow & Status
1. **Repository Structure:** Unified both `artAround_TW/backend` and `navigatorV2/backend` underneath one single `merge/backend/` node.js instance. Both frontends were placed adjacent in the `/merge` folder as `client_marketplace` and `client_navigator`.
2. **Backend API Merge:** Migrated routes and mounted them using `app.use('/api/v1/navigator', navigatorRoutes)`.
3. **Database Integration:** Adjusted the Navigator backend queries to replace hardcoded fallback data with MongoDB queries using Mongoose and the Marketplace schemas (e.g. `Visit`, `Museum`, `Item`). Mapped database variables like `latitude` onto `lat` for frontend compatibility, ensuring minimal changes to Navigator's UI layer, while making the application mostly functional dynamically!
4. **Environment Settings:** Added dependencies like `google-tts-api` up to the root package manager and initialized API proxies on React layer. Left the interior map geometry mock data natively intact as per requirement.

## Current State against PRD
- **Single Node Backend:** [x] Done
- **Unified Endpoints & Data Structures:** [x] Done
- **Walkthrough API Update:** [x] Done
- **UI Modifications:** Kept strictly separate; navigator map configuration untouched. The map json generator is loaded properly using mock fallback directly inside state.

---
**Remaining Action:** Everything specified in this sprint handles the DB connection successfully and connects both client interfaces!

