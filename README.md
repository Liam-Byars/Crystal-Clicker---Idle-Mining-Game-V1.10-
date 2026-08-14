# 💎 Crystal Clicker — Idle Mining Game

An addictive idle/incremental game where you mine crystals, buy upgrades, unlock new areas, and reach astronomical numbers.

Built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, and **Capacitor** for iOS/Android.

---

## ✨ Features

- **⭐ Idle Mining** — Click to mine crystals, buy upgrades, earn while away
- **📊 10+ Upgrade Types** — Click power, auto-miners, multipliers, crit chance, golden chance
- **🗺️ World Map** — Unlock 7+ mining areas with unique themes and upgrade trees
- **🎰 Lucky Spin** — Spin the wheel for rewards (30 min cooldown)
- **🏆 79 Achievements** — Track milestones and earn bragging rights
- **🔄 Prestige System** — Reset for permanent multipliers
- **🛒 Premium Shop** — Buy permanent boosts with earned crystals
- **🔥 Combo System** — Click fast for combo multipliers
- **🌈 Golden Crystals** — Random golden click events for bonus rewards
- **👥 Account System** — Google Sign-In or Guest mode with cloud saves
- **📱 Native Mobile** — Capacitor-wrapped for App Store / Google Play
- **🔊 Sound Effects** — Procedural audio with haptic feedback on mobile
- **🌙 Offline Earnings** — Earn 50% crystals while away (up to 8 hours)
- **🎁 Daily Rewards** — Claim daily login bonuses

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| State | Zustand |
| Database | Prisma ORM (SQLite) |
| Auth | Firebase Auth (Google + Guest) |
| Cloud Saves | Firebase Firestore + SQLite fallback |
| Mobile | Capacitor (iOS + Android) |
| Animations | Framer Motion |

## 📁 Project Structure

```
├── src/
│   ├── app/              # Next.js pages and API routes
│   ├── components/       # React components
│   │   └── ui/            # shadcn/ui components
│   ├── lib/              # Utilities, auth, firebase, math
│   └── stores/           # Zustand game store
├── android/              # Capacitor Android project
├── ios/                  # Capacitor iOS project
├── public/               # Static assets
├── prisma/               # Database schema
├── capacitor.config.ts   # Capacitor configuration
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- Firebase project (for auth/cloud saves) — optional, works in guest mode

### Install & Run

```bash
# Install dependencies
bun install

# Set up database
bun run db:push

# Start dev server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create `.env.local` for Firebase:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Mobile Build (Capacitor)

```bash
# Sync web assets to native projects
bun run cap:sync

# Open in Xcode (macOS required)
bun run cap:ios

# Open in Android Studio
bun run cap:android
```

> **Note:** Deploy your Next.js app first, then update `capacitor.config.ts` with the deployed URL before building for stores.

## 📝 Versioning

- **Minor (+0.1)** — New features and changes
- **Patch (+0.0.1)** — Bug fixes
- **Major (+1.0)** — Major milestones (on request)

## 📄 License

All rights reserved.
