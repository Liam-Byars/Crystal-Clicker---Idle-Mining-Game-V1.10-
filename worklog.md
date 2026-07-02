# Crystal Clicker - Project Handover Document

## Current Project Status

**Status: ✅ Fully Functional — Auth system rebuilt, login screen working, game fully playable.**

### Session 7 Work (Current)
- **Rebuilt entire auth system from scratch** (previous session's auth files were lost)
- **Files created:**
  - `src/lib/firebase.ts` — Firebase config with env var support, `isFirebaseConfigured` flag
  - `src/lib/auth-context.tsx` — AuthProvider with guest mode + Google sign-in, localStorage persistence
  - `src/components/sign-in-screen.tsx` — Beautiful themed sign-in screen with "Play as Guest" and "Sign in with Google" buttons
- **Files modified:**
  - `src/app/layout.tsx` — Wrapped children with `<AuthProvider>`
  - `src/app/page.tsx` — Added auth gate, user bar (avatar, name, guest badge, save status, sound toggle, logout dropdown), updated save/load to use userId, localStorage backup for guests
  - `src/app/api/clicker/save/route.ts` — Now requires `userId` in body, uses `findUnique/upsert` by userId
  - `src/app/api/clicker/load/route.ts` — Now requires `userId` query param, returns `{ data: ... }` structure
  - `prisma/schema.prisma` — Added `userId String @unique` to ClickerSave model (force-reset DB)
- **Installed:** `firebase@12.15.0`
- **Lint:** Passes clean (0 errors)
- **Browser QA verified:**
  - Sign-in screen appears on first visit (no auth state)
  - "Play as Guest" button works → enters game
  - User bar shows: avatar ("G"), "Guest Miner", "Guest" badge, save status, sound toggle, user menu
  - Crystal clicking works, combo system works, achievements unlock
  - Logout dropdown → "Log out" → returns to sign-in screen
  - Zero console errors throughout

### Key Files
- `src/lib/firebase.ts` — Firebase initialization (reads NEXT_PUBLIC_FIREBASE_* env vars)
- `src/lib/auth-context.tsx` — Auth state management with localStorage persistence
- `src/components/sign-in-screen.tsx` — Sign-in screen UI
- `src/app/page.tsx` — Game page with auth gate and user bar (~1060 lines)
- `src/stores/gameStore.ts` — 601 lines, stable
- `src/app/api/clicker/save/route.ts` — Save API (userId-based)
- `src/app/api/clicker/load/route.ts` — Load API (userId-based)
- `prisma/schema.prisma` — ClickerSave with userId @unique

### Auth Architecture
- **Guest mode:** Generates `guest_<random>` ID, persisted to localStorage (`crystal_clicker_auth`), saves to both server (by userId) and localStorage (`crystal_clicker_save`) as backup
- **Google sign-in:** Uses Firebase Auth popup, stores Firebase UID as userId, persisted to localStorage
- **Firebase config:** Read from `NEXT_PUBLIC_FIREBASE_*` env vars. If not configured, Google sign-in button is hidden, only "Play as Guest" shown
- **Auto-restore:** On page reload, reads localStorage to restore guest/Google session without re-login
- **Logout:** Clears localStorage, Firebase signOut, resets to sign-in screen

## Previous Sessions
### Session 6
- Complete rewrite of `src/app/page.tsx` (872 lines)
- All features: buy quantity toggle, offline earnings, events, power-ups, achievements, combos, sound effects, prestige

## Unresolved Issues / Risks
- Firebase Google sign-in not testable in sandbox (no authorized domain) — user needs to add their Firebase config to `.env.local` and add the domain to Firebase Console
- Hydration mismatch possible: SSR renders sign-in screen, client may restore guest session from localStorage (mitigated by suppressHydrationWarning on body)
- Guest logout creates new guest ID — old progress only recoverable via localStorage backup

## Recommended Next Phase Priorities
1. **Firebase config:** User provides env vars and tests Google sign-in
2. **Guest→Google migration:** When a guest signs in with Google, migrate their localStorage save to the server under the Google userId
3. **Visual polish:** Add particle effects, better crystal animation
4. **Stats tab redesign:** Visual bars/sparklines instead of plain lists
5. **Performance:** Batch store selectors to reduce re-renders