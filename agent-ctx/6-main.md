---
Task ID: 6
Agent: main
Task: Implement Premium Currency (Gems), In-Game Store, Booster Items, and Ad Watch Area

Work Log:
- Added `BoosterDef` and `BoosterState` interfaces to gameStore.ts
- Added `BOOSTER_DEFS` constant with 6 booster types: Double Click, Triple Auto, Golden Frenzy, Crystal Rain, Mega Boost, Lucky Charm
- Added `buildDefaultBoosters()` helper and `getBoosterMultiplier()` utility function
- Added `boosters: Record<string, BoosterState>` to GameState (multi-booster system)
- Added `addGems()`, `spendGems()`, `purchaseBooster()`, `activateBooster()` actions
- Applied booster multipliers in `click()` (doubleClick, megaBoost, luckyCharm) and `tick()` (tripleAuto, megaBoost, goldenFrenzy)
- Added booster expiry checking in `tick()` — deactivated expired boosters
- Updated `loadSave()` to restore boosters state with offline-expiry handling
- Updated `getSaveData()` to include boosters
- Updated `resetGame()` to reset boosters
- Updated Prisma schema with `gems Float @default(0)` and `boosters String @default("{}")` fields
- Ran `prisma db push` and `prisma generate`
- Updated save API route to include gems and boosters (both Firestore and SQLite)
- Updated load API route to include gems and boosters with JSON parsing
- Rewrote Store tab UI with new BOOSTER_DEFS-based booster cards
- Added Watch Ad section with 3s countdown timer, 30s cooldown, COPPA age check
- Added active boosters display as glowing badges near crystal count
- Added active boosters section in Store tab with countdown progress bars
- Updated stores/index.ts exports for new types and constants

Stage Summary:
- Full premium currency + booster system implemented
- 6 booster types with proper cost/duration/effects
- Multiple concurrent boosters supported
- Ad watching simulated with countdown and cooldown
- COPPA-compliant: under-13 users see disabled state
- Save/load fully integrated (localStorage + API + Prisma)
- Lint passes clean