// ====== Shared Game Types ======
// Platform-independent type definitions for the Crystal Clicker game.
// Used by both Next.js (web) and React Native (mobile) clients.

// ====== Area ======
export interface Area {
  id: string;
  name: string;
  location: string;
  flag: string;
  gem: string;
  description: string;
  icon: string;
  unlockAt: number;
  gradient: string;
  glowColor: string;
  bgAccent: string;
}

// ====== Upgrade ======
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseCost: number;
  costMultiplier: number;
  level: number;
  effect: 'clickPower' | 'autoRate' | 'multiplier' | 'goldenChance' | 'critChance';
  value: number;
  maxLevel?: number;
}

// ====== Achievement ======
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  condition: (state: GameState) => boolean;
}

// ====== Floating Text ======
export interface FloatingText {
  id: number;
  value: number;
  valueLog?: number; // log10 of value, for precise display of huge numbers
  x: number;
  y: number;
  type: 'normal' | 'golden' | 'combo' | 'crit' | 'powerup' | 'event' | 'offline' | 'milestone';
  count: number;
  createdAt: number;
}

// ====== Power-Up ======
export interface PowerUp {
  id: string;
  name: string;
  icon: string;
  effect: 'doubleClick' | 'tripleAuto' | 'instantBonus';
  duration: number;
  timer: number;
  value: number;
}

// ====== Game Event ======
export interface GameEvent {
  id: string;
  name: string;
  description: string;
  icon: string;
  effect: 'doubleAuto' | 'doubleClick' | 'tripleGolden';
  duration: number;
  timer: number;
  value: number;
}

// ====== Milestone ======
export interface Milestone {
  id: number;
  value: number;
  label: string;
  icon: string;
  celebrated: boolean;
}

// ====== Buy Quantity ======
export type BuyQuantity = 1 | 10 | 100 | 'max';

// ====== Active Tab ======
export type ActiveTab = 'upgrades' | 'achievements' | 'stats' | 'prestige' | 'map' | 'shop';

// ====== Shop Boosts ======
export interface ShopBoosts {
  doubleClick: number;   // timer ticks remaining
  tripleAuto: number;    // timer ticks remaining
  doubleGolden: number;  // timer ticks remaining
  critBoost: number;     // timer ticks remaining
  multBoost: number;     // timer ticks remaining — +50% all multipliers
  luckyBoost: number;    // timer ticks remaining — 3x golden chance
  doubleAll: number;     // timer ticks remaining (from "ads")
}

// ====== Click Ripple ======
export interface ClickRipple {
  id: number;
  x: number;
  y: number;
  type: FloatingText['type'];
}

// ====== Activity Log Entry ======
export interface LogEntry {
  id: number;
  icon: string;
  text: string;
  color: string;
  time: number;
}

// ====== Game State ======
// Contains all game data AND action function signatures.
// The actual implementations are platform-specific (zustand for web, etc.)
// but the shape is identical across platforms.
export interface GameState {
  // Core resources
  crystals: number;
  crystalsExp: number; // overflow exponent: effective = crystals * 10^crystalsExp
  totalClicks: number;
  totalEarned: number;
  totalEarnedExp: number; // overflow exponent for totalEarned
  clickPower: number;
  clickPowerLog: number; // log10 of clickPower, for precise huge numbers
  multiplier: number;
  multiplierLog: number; // log10 of multiplier
  autoRate: number;
  autoRateLog: number; // log10 of autoRate

  // Prestige
  prestige: number;
  prestigePoints: number;

  // Combo
  combo: number;
  comboTimer: number;
  maxCombo: number;
  lastClickTime: number;

  // Click speed tracking
  clickTimestamps: number[];
  clicksPerSecond: number;
  bestSessionCps: number;

  // Critical hits
  critChance: number;
  critMultiplier: number;
  totalCrits: number;

  // Golden Crystal
  goldenClicks: number;
  goldenChance: number;
  goldenActive: boolean;
  goldenTimer: number;
  goldenClickValue: number;

  // Power-ups
  activePowerUp: PowerUp | null;
  powerUpTimer: number;

  // Game Events
  activeEvent: GameEvent | null;
  eventTimer: number;
  totalEvents: number;

  // Buy quantity
  buyQuantity: BuyQuantity;

  // Session tracking
  sessionStartTime: number;
  sessionClicks: number;
  sessionEarned: number;

  // Milestones
  milestones: Milestone[];

  // Offline earnings
  lastOnlineTime: number;
  offlineEarned: number;
  showOfflineBonus: boolean;

  // Floating texts
  floatingTexts: FloatingText[];
  floatingTextId: number;

  // Achievement notifications
  achievementQueue: Achievement[];
  currentNotification: Achievement | null;
  notificationTimer: number;

  // Click ripples
  ripples: ClickRipple[];
  rippleId: number;

  // Upgrades & Achievements
  upgrades: Upgrade[];
  achievements: Achievement[];

  // Area system
  currentArea: string;
  unlockedAreas: string[];

  // Premium shop
  ownedPremiumItems: string[];

  // UI state
  screenShake: boolean;
  crystalPulse: number;
  activeTab: ActiveTab;

  // QOL: Shop boosts
  shopBoosts: ShopBoosts;
  lastSaveTime: number;   // QOL: timestamp of last save
  adCooldown: number;      // QOL: cooldown ticks for "ad" rewards

  // Actions
  click: (x: number, y: number) => void;
  clickGolden: (x: number, y: number) => void;
  buyUpgrade: (upgradeId: string) => boolean;
  setBuyQuantity: (q: BuyQuantity) => void;
  performPrestige: () => void;
  updateCombo: () => void;
  updateGolden: () => void;
  updatePowerUp: () => void;
  updateEvent: () => void;
  updateNotification: () => void;
  updateClickSpeed: () => void;
  checkMilestones: () => void;
  addFloatingText: (x: number, y: number, value: number, type?: FloatingText['type'], valueLog?: number) => void;
  removeFloatingText: (id: number) => void;
  setActiveTab: (tab: ActiveTab) => void;
  switchArea: (areaId: string) => void;
  checkAreaUnlocks: () => void;
  checkAchievements: () => void;
  resetGame: () => void;
  loadSave: (data: Record<string, unknown>) => void;
  getSaveData: () => Record<string, unknown>;
  claimOfflineEarnings: () => void;
  dismissOfflineBonus: () => void;
  claimReward: (amount: number, prestige?: number) => void;
  buyShopBoost: (boostType: string) => boolean;
  claimAdReward: (adType: string) => boolean;
  buyInstantCrystals: (seconds: number) => boolean;
  tick: () => void;
  setPremiumItems: (items: string[]) => void;
  hasPremiumPerk: (perk: string) => boolean;
}
