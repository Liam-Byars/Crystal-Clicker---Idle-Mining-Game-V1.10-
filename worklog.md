# Crystal Clicker - Project Handover Document

## Current Project Status

**Status: ✅ Fully Functional — Game is playable and all core systems are operational.**

The Crystal Clicker idle/incremental game is now complete with a fully rewritten `page.tsx` that matches the `gameStore.ts` API. The game was previously broken because `page.tsx` was empty/stale across multiple sessions. This has been resolved.

### Architecture
- **Framework**: Next.js 16 App Router with `'use client'` components
- **State Management**: Zustand store (`src/stores/gameStore.ts`) with `useShallow` for all complex selectors to avoid infinite re-renders
- **Database**: Prisma + SQLite for save persistence via `/api/clicker/save` and `/api/clicker/load`
- **Animations**: Framer Motion for crystal pulse, floating texts, ripples, achievement toasts, golden crystal, milestone celebrations
- **UI**: shadcn/ui (Tabs, Card, Button, Badge, Progress, ScrollArea, Tooltip, Separator)
- **Styling**: Tailwind CSS 4 with custom CSS classes for glow effects, shimmer, grid pattern, animations

### Key Files
- `src/stores/gameStore.ts` — Complete game logic (601 lines), 11 upgrades, 30 achievements, events, power-ups, milestones
- `src/stores/index.ts` — Clean exports for types and functions
- `src/app/page.tsx` — **COMPLETE REWRITE** (984 lines), fully matching store API
- `src/app/globals.css` — Enhanced with crystal glow, shimmer, grid pattern, pulse animations
- `src/app/api/clicker/save/route.ts` — Save endpoint
- `src/app/api/clicker/load/route.ts` — Load endpoint
- `prisma/schema.prisma` — ClickerSave model

## Current Goals / Completed Modifications / Verification Results

### Completed in This Session
1. **CRITICAL FIX: Complete rewrite of `page.tsx`** — The file was empty/broken. Now implements:
   - Crystal clicker with floating texts and ripple effects
   - Golden crystal overlay with timer and bonus display
   - Buy quantity toggle (x1/x10/xMax) with `getMaxBuyCount`/`getTotalCostN` integration
   - Upgrades tab organized by category (Click Power, Auto Mining, Special)
   - Achievements tab with progress bar and grid layout
   - Stats tab with 19 stat items
   - Prestige tab with bonus calculator and reset option
   - Offline earnings modal (claim/dismiss)
   - Active event banner (top of screen)
   - Power-up indicator (bottom of crystal area)
   - Achievement toast notifications
   - Milestone celebration screen flash
   - Combo ring visual effect
   - CPS (clicks per second) display
   - Next milestone progress bar
   - Auto-income indicator with pulsing dot
   - Session timer display
   - Ambient floating particles
   - Auto-save every 15 seconds
   - Game tick system (100ms interval)
   - Sticky footer

2. **Styling Improvements:**
   - Crystal glow CSS effect (drop-shadow filter)
   - Pulsing outer rings around crystal
   - Subtle grid pattern background
   - Shimmer animation for maxed upgrades
   - Gradient text effect for crystal count
   - Enhanced upgrade card hover (translateX slide)
   - Auto-income pulse indicator
   - Tab glow effects
   - Improved footer with status indicators
   - Saturated crystal on high pulse

3. **QA Verified:**
   - Page renders correctly with no blank/white screen
   - Crystal click increases counter (tested 5 clicks)
   - All 4 tabs switch correctly (Upgrades, Achievements, Stats, Prestige)
   - No console errors or runtime errors in dev.log
   - ESLint passes clean
   - Responsive layout (mobile + desktop)

## Unresolved Issues or Risks

### Minor
- **Milestone re-trigger protection**: Uses a `useRef` + `useState` combo to prevent re-animation. If the component unmounts and remounts, it could show the last milestone again. Low priority.
- **Effective auto-rate display**: The display value doesn't account for event/power-up multipliers in real-time (only updates on re-render). The actual tick correctly applies all multipliers.
- **Golden crystal touch handling**: Uses `onTouchStart` with `preventDefault` which may interfere with scroll on some mobile browsers. The click area is fixed position so this is unlikely.

### Potential Future Enhancements
- Sound effects for clicks, achievements, and events
- More upgrade tiers (currently 11 upgrades)
- Settings panel (sound toggle, notification preferences)
- Statistics graphs/charts (revenue over time)
- Mini-map or world progression system
- Daily login rewards
- Sharing/exporting saves
- More event types
- Cosmetic crystal skins
- Leaderboard (if multiplayer)

### Priority Recommendations for Next Phase
1. **Add sound effects** — Most impactful for game feel
2. **Add more upgrade tiers** — Content depth for long-term engagement
3. **Statistics charts** — Visual progression tracking
4. **Daily rewards** — Retention mechanic
5. **Settings panel** — User control
6. **More visual polish** — Particle effects on milestones, screen transitions, etc.
