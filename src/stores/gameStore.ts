import { create } from 'zustand';

// ====== Interfaces ======
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

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  condition: (state: GameState) => boolean;
}

export interface FloatingText {
  id: number;
  value: number;
  x: number;
  y: number;
  type: 'normal' | 'golden' | 'combo' | 'crit' | 'powerup' | 'event' | 'offline' | 'milestone';
}

export interface PowerUp {
  id: string;
  name: string;
  icon: string;
  effect: 'doubleClick' | 'tripleAuto' | 'instantBonus';
  duration: number;
  timer: number;
  value: number;
}

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

export interface Milestone {
  id: number;
  value: number;
  label: string;
  icon: string;
  celebrated: boolean;
}

export type BuyQuantity = 1 | 10 | 'max';

export interface GameState {
  // Core resources
  crystals: number;
  totalClicks: number;
  totalEarned: number;
  clickPower: number;
  multiplier: number;
  autoRate: number;

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
  ripples: { id: number; x: number; y: number; type: FloatingText['type'] }[];
  rippleId: number;

  // Upgrades & Achievements
  upgrades: Upgrade[];
  achievements: Achievement[];

  // UI state
  screenShake: boolean;
  crystalPulse: number;
  activeTab: 'upgrades' | 'achievements' | 'stats' | 'prestige';

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
  addFloatingText: (x: number, y: number, value: number, type?: FloatingText['type']) => void;
  removeFloatingText: (id: number) => void;
  setActiveTab: (tab: 'upgrades' | 'achievements' | 'stats' | 'prestige') => void;
  checkAchievements: () => void;
  resetGame: () => void;
  loadSave: (data: Record<string, unknown>) => void;
  getSaveData: () => Record<string, unknown>;
  claimOfflineEarnings: () => void;
  dismissOfflineBonus: () => void;
}

// ====== Data Definitions ======
const DEFAULT_UPGRADES: Upgrade[] = [
  { id: 'sharpen', name: 'Sharpen Crystal', description: '+1 click power per level', icon: '⚔️', baseCost: 15, costMultiplier: 1.4, level: 0, effect: 'clickPower', value: 1 },
  { id: 'enchanted_touch', name: 'Enchanted Touch', description: '+3 click power per level', icon: '✨', baseCost: 100, costMultiplier: 1.5, level: 0, effect: 'clickPower', value: 3 },
  { id: 'crystal_sword', name: 'Crystal Sword', description: '+10 click power per level', icon: '🗡️', baseCost: 500, costMultiplier: 1.6, level: 0, effect: 'clickPower', value: 10 },
  { id: 'crystal_blade', name: 'Crystal Blade', description: '+25 click power per level', icon: '⚡', baseCost: 5000, costMultiplier: 1.7, level: 0, effect: 'clickPower', value: 25 },
  { id: 'apprentice_miner', name: 'Apprentice Miner', description: '+0.5 crystals/sec', icon: '⛏️', baseCost: 50, costMultiplier: 1.4, level: 0, effect: 'autoRate', value: 0.5 },
  { id: 'crystal_golem', name: 'Crystal Golem', description: '+3 crystals/sec', icon: '🤖', baseCost: 300, costMultiplier: 1.5, level: 0, effect: 'autoRate', value: 3 },
  { id: 'crystal_dragon', name: 'Crystal Dragon', description: '+15 crystals/sec', icon: '🐉', baseCost: 2000, costMultiplier: 1.6, level: 0, effect: 'autoRate', value: 15 },
  { id: 'crystal_mage', name: 'Crystal Mage Guild', description: '+50 crystals/sec', icon: '🧙', baseCost: 10000, costMultiplier: 1.7, level: 0, effect: 'autoRate', value: 50 },
  { id: 'amplifier', name: 'Crystal Amplifier', description: 'x1.2 multiplier per level', icon: '🔮', baseCost: 200, costMultiplier: 1.8, level: 0, effect: 'multiplier', value: 0.2 },
  { id: 'golden_lens', name: 'Golden Lens', description: '+2% golden chance per level', icon: '🌟', baseCost: 1000, costMultiplier: 2.0, level: 0, effect: 'goldenChance', value: 0.02, maxLevel: 25 },
  { id: 'crit_eye', name: 'Critical Eye', description: '+3% crit chance per level', icon: '👁️', baseCost: 800, costMultiplier: 1.8, level: 0, effect: 'critChance', value: 0.03, maxLevel: 20 },
];

const ACHIEVEMENT_DEFS = [
  { id: 'first_click', name: 'First Spark', description: 'Click the crystal for the first time', icon: '⚡' },
  { id: 'clicks_100', name: 'Dedicated Clicker', description: 'Click 100 times', icon: '👆' },
  { id: 'clicks_1000', name: 'Click Master', description: 'Click 1,000 times', icon: '🏆' },
  { id: 'clicks_10000', name: 'Click Legend', description: 'Click 10,000 times', icon: '👑' },
  { id: 'clicks_50000', name: 'Click God', description: 'Click 50,000 times', icon: '🌟' },
  { id: 'crystals_100', name: 'Crystal Collector', description: 'Earn 100 total crystals', icon: '💎' },
  { id: 'crystals_1000', name: 'Crystal Hoarder', description: 'Earn 1,000 total crystals', icon: '💰' },
  { id: 'crystals_10000', name: 'Crystal Tycoon', description: 'Earn 10,000 total crystals', icon: '🏦' },
  { id: 'crystals_100000', name: 'Crystal Empire', description: 'Earn 100,000 total crystals', icon: '🏰' },
  { id: 'crystals_1m', name: 'Crystal God', description: 'Earn 1,000,000 total crystals', icon: '🌍' },
  { id: 'upgrade_first', name: 'First Upgrade', description: 'Buy your first upgrade', icon: '⬆️' },
  { id: 'upgrade_10', name: 'Upgrade Enthusiast', description: 'Buy 10 total upgrades', icon: '🔧' },
  { id: 'upgrade_50', name: 'Upgrade Master', description: 'Buy 50 total upgrades', icon: '🛠️' },
  { id: 'combo_5', name: 'Combo Starter', description: 'Reach a 5x combo', icon: '🔥' },
  { id: 'combo_10', name: 'Combo Master', description: 'Reach a 10x combo', icon: '💥' },
  { id: 'combo_25', name: 'Combo Legend', description: 'Reach a 25x combo', icon: '🌀' },
  { id: 'combo_50', name: 'Combo God', description: 'Reach a 50x combo', icon: '☄️' },
  { id: 'crit_first', name: 'Critical Thinker', description: 'Land your first critical hit', icon: '🎯' },
  { id: 'crit_100', name: 'Critical Master', description: 'Land 100 critical hits', icon: '💫' },
  { id: 'golden_first', name: 'Lucky Strike', description: 'Click a golden crystal', icon: '🥇' },
  { id: 'golden_10', name: 'Golden Touch', description: 'Click 10 golden crystals', icon: '✨' },
  { id: 'golden_50', name: 'Golden King', description: 'Click 50 golden crystals', icon: '👑' },
  { id: 'prestige_1', name: 'Rebirth', description: 'Prestige for the first time', icon: '🔄' },
  { id: 'prestige_5', name: 'Experienced Soul', description: 'Prestige 5 times', icon: '🌈' },
  { id: 'auto_10', name: 'Automated', description: 'Have 10+ auto crystals/sec', icon: '⚙️' },
  { id: 'auto_100', name: 'Factory Owner', description: 'Have 100+ auto crystals/sec', icon: '🏭' },
  { id: 'speed_5', name: 'Speed Demon', description: 'Reach 5+ clicks per second', icon: '⚡' },
  { id: 'speed_10', name: 'Click Machine', description: 'Reach 10+ clicks per second', icon: '🤖' },
  { id: 'event_first', name: 'Eventful', description: 'Experience your first event', icon: '🎉' },
  { id: 'event_10', name: 'Event Veteran', description: 'Experience 10 events', icon: '🎊' },
] as const;

function buildAchievementConditions(): Achievement[] {
  return ACHIEVEMENT_DEFS.map(a => ({
    ...a,
    unlocked: false,
    condition: (s: GameState) => {
      const ul = s.upgrades.reduce((sum, u) => sum + u.level, 0);
      switch (a.id) {
        case 'first_click': return s.totalClicks >= 1;
        case 'clicks_100': return s.totalClicks >= 100;
        case 'clicks_1000': return s.totalClicks >= 1000;
        case 'clicks_10000': return s.totalClicks >= 10000;
        case 'clicks_50000': return s.totalClicks >= 50000;
        case 'crystals_100': return s.totalEarned >= 100;
        case 'crystals_1000': return s.totalEarned >= 1000;
        case 'crystals_10000': return s.totalEarned >= 10000;
        case 'crystals_100000': return s.totalEarned >= 100000;
        case 'crystals_1m': return s.totalEarned >= 1000000;
        case 'upgrade_first': return ul >= 1;
        case 'upgrade_10': return ul >= 10;
        case 'upgrade_50': return ul >= 50;
        case 'combo_5': return s.maxCombo >= 5;
        case 'combo_10': return s.maxCombo >= 10;
        case 'combo_25': return s.maxCombo >= 25;
        case 'combo_50': return s.maxCombo >= 50;
        case 'crit_first': return s.totalCrits >= 1;
        case 'crit_100': return s.totalCrits >= 100;
        case 'golden_first': return s.goldenClicks >= 1;
        case 'golden_10': return s.goldenClicks >= 10;
        case 'golden_50': return s.goldenClicks >= 50;
        case 'prestige_1': return s.prestige >= 1;
        case 'prestige_5': return s.prestige >= 5;
        case 'auto_10': return s.autoRate >= 10;
        case 'auto_100': return s.autoRate >= 100;
        case 'speed_5': return s.clicksPerSecond >= 5;
        case 'speed_10': return s.clicksPerSecond >= 10;
        case 'event_first': return s.totalEvents >= 1;
        case 'event_10': return s.totalEvents >= 10;
        default: return false;
      }
    },
  }));
}

// ====== Utility Functions ======
export const getUpgradeCost = (u: Upgrade) => Math.floor(u.baseCost * Math.pow(u.costMultiplier, u.level));
export const getCostForLevel = (u: Upgrade, lvl: number) => Math.floor(u.baseCost * Math.pow(u.costMultiplier, lvl));

export const getMaxBuyCount = (u: Upgrade, money: number): number => {
  const cap = u.maxLevel ? u.maxLevel - u.level : 10000;
  let total = 0; let count = 0;
  for (let i = 0; i < cap; i++) {
    const c = getCostForLevel(u, u.level + i);
    if (total + c > money) break;
    total += c; count++;
  }
  return count;
};

export const getTotalCostN = (u: Upgrade, n: number): number => {
  let t = 0;
  for (let i = 0; i < n; i++) t += getCostForLevel(u, u.level + i);
  return t;
};

const POWER_UP_DEFS: Omit<PowerUp, 'timer'>[] = [
  { id: 'double_click', name: 'Double Power!', icon: '💪', effect: 'doubleClick', duration: 300, value: 2 },
  { id: 'triple_auto', name: 'Triple Auto!', icon: '⚡', effect: 'tripleAuto', duration: 300, value: 3 },
  { id: 'instant_bonus', name: 'Crystal Rain!', icon: '🌧️', effect: 'instantBonus', duration: 0, value: 0 },
];

const EVENT_DEFS: Omit<GameEvent, 'timer'>[] = [
  { id: 'crystal_storm', name: 'Crystal Storm', description: 'Auto income doubled!', icon: '🌩️', effect: 'doubleAuto', duration: 600, value: 2 },
  { id: 'lucky_hour', name: 'Lucky Hour', description: 'All clicks deal double!', icon: '🍀', effect: 'doubleClick', duration: 600, value: 2 },
  { id: 'golden_fever', name: 'Golden Fever', description: '3x golden spawn rate!', icon: '🌟', effect: 'tripleGolden', duration: 600, value: 3 },
];

const MILESTONE_DEFS: Omit<Milestone, 'celebrated'>[] = [
  { id: 1, value: 100, label: '100 Crystals!', icon: '💎' },
  { id: 2, value: 1000, label: '1,000 Crystals!', icon: '💰' },
  { id: 3, value: 10000, label: '10K Crystals!', icon: '🏆' },
  { id: 4, value: 100000, label: '100K Crystals!', icon: '🏰' },
  { id: 5, value: 1000000, label: '1M Crystals!', icon: '👑' },
  { id: 6, value: 10000000, label: '10M Crystals!', icon: '🌍' },
  { id: 7, value: 100000000, label: '100M Crystals!', icon: '🪐' },
  { id: 8, value: 1000000000, label: '1B Crystals!', icon: '⭐' },
];

function recalcStats(upgrades: Upgrade[]) {
  let clickPower = 1; let autoRate = 0; let multiplier = 1;
  let goldenChance = 0.03; let critChance = 0.05;
  for (const u of upgrades) {
    for (let i = 0; i < u.level; i++) {
      switch (u.effect) {
        case 'clickPower': clickPower += u.value; break;
        case 'autoRate': autoRate += u.value; break;
        case 'multiplier': multiplier += u.value; break;
        case 'goldenChance': goldenChance += u.value; break;
        case 'critChance': critChance += u.value; break;
      }
    }
  }
  return { clickPower, autoRate, multiplier, goldenChance: Math.min(goldenChance, 0.5), critChance: Math.min(critChance, 0.8) };
}

// ====== Store ======
export const useGameStore = create<GameState>((set, get) => ({
  crystals: 0, totalClicks: 0, totalEarned: 0, clickPower: 1, multiplier: 1, autoRate: 0,
  prestige: 0, prestigePoints: 0,
  combo: 0, comboTimer: 0, maxCombo: 0, lastClickTime: 0,
  clickTimestamps: [], clicksPerSecond: 0,
  critChance: 0.05, critMultiplier: 5, totalCrits: 0,
  goldenClicks: 0, goldenChance: 0.03, goldenActive: false, goldenTimer: 0, goldenClickValue: 0,
  activePowerUp: null, powerUpTimer: 0,
  activeEvent: null, eventTimer: 0, totalEvents: 0,
  buyQuantity: 1 as BuyQuantity,
  sessionStartTime: Date.now(), sessionClicks: 0, sessionEarned: 0,
  milestones: MILESTONE_DEFS.map(m => ({ ...m, celebrated: false })),
  lastOnlineTime: Date.now(), offlineEarned: 0, showOfflineBonus: false,
  floatingTexts: [], floatingTextId: 0,
  achievementQueue: [], currentNotification: null, notificationTimer: 0,
  ripples: [], rippleId: 0,
  upgrades: DEFAULT_UPGRADES.map(u => ({ ...u })),
  achievements: buildAchievementConditions(),
  screenShake: false, crystalPulse: 0, activeTab: 'upgrades',

  click: (x, y) => {
    const s = get(); const now = Date.now();
    const recent = [...s.clickTimestamps, now].filter(t => now - t < 1000);
    let newCombo = 1; let newMax = s.maxCombo;
    if (now - s.lastClickTime < 500) newCombo = Math.min(s.combo + 1, 50);
    if (newCombo > newMax) newMax = newCombo;

    const comboMult = 1 + (newCombo - 1) * 0.1;
    const prestMult = 1 + s.prestigePoints * 0.1;
    const puMult = s.activePowerUp?.effect === 'doubleClick' ? s.activePowerUp.value : 1;
    const evMult = s.activeEvent?.effect === 'doubleClick' ? s.activeEvent.value : 1;
    let value = s.clickPower * s.multiplier * comboMult * prestMult * puMult * evMult;

    let isCrit = false;
    if (Math.random() < s.critChance) { isCrit = true; value *= s.critMultiplier; }

    const rv = Math.round(value * 10) / 10;
    const tt: FloatingText['type'] = isCrit ? 'crit' : newCombo > 1 ? 'combo' : 'normal';
    const newRippleId = s.rippleId + 1;

    set({
      crystals: Math.round((s.crystals + rv) * 100) / 100,
      totalClicks: s.totalClicks + 1, totalEarned: Math.round((s.totalEarned + rv) * 100) / 100,
      sessionClicks: s.sessionClicks + 1, sessionEarned: Math.round((s.sessionEarned + rv) * 100) / 100,
      combo: newCombo, comboTimer: 60, maxCombo: newMax, lastClickTime: now,
      totalCrits: isCrit ? s.totalCrits + 1 : s.totalCrits,
      screenShake: isCrit || newCombo >= 10,
      crystalPulse: isCrit ? 3 : newCombo >= 5 ? 2 : 1,
      floatingTextId: s.floatingTextId + 1,
      clickTimestamps: recent, clicksPerSecond: recent.length,
      ripples: [...s.ripples.slice(-6), { id: newRippleId, x, y, type: tt }], rippleId: newRippleId,
    });
    get().addFloatingText(x, y, rv, tt);
    get().checkAchievements();
    get().checkMilestones();
  },

  clickGolden: (x, y) => {
    const s = get();
    if (!s.goldenActive) return;
    const evMult = s.activeEvent?.effect === 'tripleGolden' ? s.activeEvent.value : 1;
    const value = Math.round(s.goldenClickValue * (1 + s.prestigePoints * 0.1) * evMult * 10) / 10;
    set({
      crystals: Math.round((s.crystals + value) * 100) / 100,
      totalEarned: Math.round((s.totalEarned + value) * 100) / 100,
      sessionEarned: Math.round((s.sessionEarned + value) * 100) / 100,
      goldenClicks: s.goldenClicks + 1, goldenActive: false, goldenTimer: 0,
      screenShake: true, crystalPulse: 4,
    });
    get().addFloatingText(x, y, value, 'golden');
    get().checkAchievements(); get().checkMilestones();
  },

  buyUpgrade: (id) => {
    const s = get(); const idx = s.upgrades.findIndex(u => u.id === id);
    if (idx === -1) return false;
    const u = { ...s.upgrades[idx] };
    if (u.maxLevel && u.level >= u.maxLevel) return false;
    const cost = getUpgradeCost(u);
    if (s.crystals < cost) return false;
    const nu = [...s.upgrades]; nu[idx] = { ...u, level: u.level + 1 };
    const stats = recalcStats(nu);
    set({ crystals: Math.round((s.crystals - cost) * 100) / 100, upgrades: nu, ...stats });
    get().checkAchievements(); return true;
  },

  setBuyQuantity: (q) => set({ buyQuantity: q }),

  performPrestige: () => {
    const s = get(); if (s.totalEarned < 1000) return;
    const pts = Math.floor(Math.sqrt(s.totalEarned / 1000));
    set({
      crystals: 0, totalClicks: 0, totalEarned: 0, clickPower: 1, multiplier: 1, autoRate: 0,
      prestige: s.prestige + 1, prestigePoints: s.prestigePoints + pts,
      combo: 0, comboTimer: 0, maxCombo: 0,
      goldenClicks: 0, goldenChance: 0.03, critChance: 0.05, totalCrits: 0,
      goldenActive: false, goldenTimer: 0, activePowerUp: null, powerUpTimer: 0,
      activeEvent: null, eventTimer: 0,
      upgrades: DEFAULT_UPGRADES.map(u => ({ ...u })),
      milestones: MILESTONE_DEFS.map(m => ({ ...m, celebrated: false })),
      floatingTexts: [], ripples: [], screenShake: true, crystalPulse: 5,
      sessionClicks: 0, sessionEarned: 0,
    });
    get().checkAchievements();
  },

  updateCombo: () => {
    const s = get();
    if (s.comboTimer > 0) set({ comboTimer: s.comboTimer - 1, combo: s.comboTimer <= 1 ? 0 : s.combo });
  },

  updateGolden: () => {
    const s = get();
    if (s.goldenActive) {
      if (s.goldenTimer > 0) set({ goldenTimer: s.goldenTimer - 1 });
      else set({ goldenActive: false, goldenTimer: 0 });
    } else {
      let chance = 0.001;
      if (s.activeEvent?.effect === 'tripleGolden') chance *= s.activeEvent.value;
      chance *= (s.goldenChance / 0.03);
      if (Math.random() < chance) {
        const bv = s.clickPower * s.multiplier * 10 * (1 + s.prestigePoints * 0.1);
        set({ goldenActive: true, goldenTimer: 400, goldenClickValue: Math.round(bv * 10) / 10 });
      }
    }
  },

  updateEvent: () => {
    const s = get();
    if (s.activeEvent) {
      if (s.eventTimer > 0) set({ eventTimer: s.eventTimer - 1 });
      else set({ activeEvent: null, eventTimer: 0 });
    } else if (s.totalClicks > 50 && Math.random() < 0.0003) {
      const t = EVENT_DEFS[Math.floor(Math.random() * EVENT_DEFS.length)];
      set({ activeEvent: { ...t, timer: t.duration }, eventTimer: t.duration, totalEvents: s.totalEvents + 1 });
      const q = [...s.achievementQueue];
      q.push({ id: `evt_${Date.now()}`, name: t.name, description: t.description, icon: t.icon, unlocked: true, unlockedAt: Date.now(), condition: () => false });
      set({ achievementQueue: q });
      get().checkAchievements();
    }
  },

  updatePowerUp: () => {
    const s = get();
    if (s.activePowerUp) {
      if (s.powerUpTimer > 0) set({ powerUpTimer: s.powerUpTimer - 1 });
      else set({ activePowerUp: null, powerUpTimer: 0 });
    } else if (s.totalClicks > 20 && Math.random() < 0.0008) {
      const t = POWER_UP_DEFS[Math.floor(Math.random() * POWER_UP_DEFS.length)];
      if (t.effect === 'instantBonus') {
        const b = Math.round((s.autoRate * 30 + s.clickPower * 5) * 10) / 10;
        set({ crystals: Math.round((s.crystals + b) * 100) / 100, totalEarned: Math.round((s.totalEarned + b) * 100) / 100, crystalPulse: 2 });
      } else {
        set({ activePowerUp: { ...t, timer: t.duration }, powerUpTimer: t.duration });
      }
    }
  },

  updateNotification: () => {
    const s = get();
    if (s.currentNotification) {
      if (s.notificationTimer > 0) set({ notificationTimer: s.notificationTimer - 1 });
      else set({ currentNotification: null, notificationTimer: 0 });
    } else if (s.achievementQueue.length > 0) {
      const [next, ...rest] = s.achievementQueue;
      set({ currentNotification: next, notificationTimer: 120, achievementQueue: rest });
    }
  },

  updateClickSpeed: () => {
    const s = get(); const now = Date.now();
    const r = s.clickTimestamps.filter(t => now - t < 1000);
    set({ clickTimestamps: r, clicksPerSecond: r.length });
  },

  checkMilestones: () => {
    const s = get();
    const nm = s.milestones.map(m => (!m.celebrated && s.totalEarned >= m.value ? { ...m, celebrated: true } : m));
    const just = nm.find((m, i) => m.celebrated && !s.milestones[i].celebrated);
    if (just) {
      set({ milestones: nm, screenShake: true, crystalPulse: 5 });
      get().addFloatingText(window.innerWidth / 2, window.innerHeight / 2, 0, 'milestone');
    }
  },

  addFloatingText: (x, y, value, type = 'normal') => {
    const s = get(); const ft: FloatingText = { id: s.floatingTextId, value, x, y, type };
    set({ floatingTexts: [...s.floatingTexts, ft] });
    setTimeout(() => get().removeFloatingText(ft.id), 1200);
  },

  removeFloatingText: (id) => { set({ floatingTexts: get().floatingTexts.filter(t => t.id !== id) }); },

  setActiveTab: (tab) => set({ activeTab: tab }),

  checkAchievements: () => {
    const s = get(); const q = [...s.achievementQueue];
    const na = s.achievements.map(a => {
      if (!a.unlocked && a.condition(s)) { q.push({ ...a, unlocked: true, unlockedAt: Date.now() }); return { ...a, unlocked: true, unlockedAt: Date.now() }; }
      return a;
    });
    set({ achievements: na, achievementQueue: q });
  },

  resetGame: () => {
    set({
      crystals: 0, totalClicks: 0, totalEarned: 0, clickPower: 1, multiplier: 1, autoRate: 0,
      prestige: 0, prestigePoints: 0, combo: 0, comboTimer: 0, maxCombo: 0, lastClickTime: 0,
      clickTimestamps: [], clicksPerSecond: 0, critChance: 0.05, critMultiplier: 5, totalCrits: 0,
      goldenClicks: 0, goldenChance: 0.03, goldenActive: false, goldenTimer: 0, goldenClickValue: 0,
      activePowerUp: null, powerUpTimer: 0, activeEvent: null, eventTimer: 0, totalEvents: 0,
      buyQuantity: 1 as BuyQuantity,
      sessionStartTime: Date.now(), sessionClicks: 0, sessionEarned: 0,
      milestones: MILESTONE_DEFS.map(m => ({ ...m, celebrated: false })),
      lastOnlineTime: Date.now(), offlineEarned: 0, showOfflineBonus: false,
      floatingTexts: [], floatingTextId: 0, achievementQueue: [], currentNotification: null, notificationTimer: 0,
      ripples: [], rippleId: 0,
      upgrades: DEFAULT_UPGRADES.map(u => ({ ...u })), achievements: buildAchievementConditions(),
      screenShake: false, crystalPulse: 0, activeTab: 'upgrades',
    });
  },

  claimOfflineEarnings: () => {
    const s = get(); if (s.offlineEarned <= 0) return;
    set({
      crystals: Math.round((s.crystals + s.offlineEarned) * 100) / 100,
      totalEarned: Math.round((s.totalEarned + s.offlineEarned) * 100) / 100,
      offlineEarned: 0, showOfflineBonus: false,
    });
    get().checkAchievements(); get().checkMilestones();
  },

  dismissOfflineBonus: () => set({ offlineEarned: 0, showOfflineBonus: false }),

  loadSave: (data) => {
    const su = data.upgrades as { id: string; level: number }[] | undefined;
    const upgrades = DEFAULT_UPGRADES.map(u => {
      const saved = su?.find(s => s.id === u.id);
      return { ...u, level: saved?.level ?? 0 };
    });
    const la = data.achievements as { id: string; unlocked: boolean }[] | undefined;
    let achievements = buildAchievementConditions();
    if (la) achievements = achievements.map(a => {
      const l = la.find(x => x.id === a.id);
      return { ...a, unlocked: l?.unlocked ?? false };
    });
    const stats = recalcStats(upgrades);
    const lastOnline = (data.lastOnlineTime as number) || Date.now();
    const elapsed = Date.now() - lastOnline;
    const offlineEarned = stats.autoRate > 0 && elapsed >= 60000
      ? Math.round(stats.autoRate * (Math.min(elapsed, 8 * 3600000) / 1000) * 0.5 * 100) / 100
      : 0;
    set({
      crystals: (data.crystals as number) ?? 0, totalClicks: (data.totalClicks as number) ?? 0,
      totalEarned: (data.totalEarned as number) ?? 0, ...stats,
      prestige: (data.prestige as number) ?? 0, prestigePoints: (data.prestigePoints as number) ?? 0,
      goldenClicks: (data.goldenClicks as number) ?? 0, totalCrits: (data.totalCrits as number) ?? 0,
      maxCombo: (data.maxCombo as number) ?? 0, totalEvents: (data.totalEvents as number) ?? 0,
      upgrades, achievements, lastOnlineTime: Date.now(),
      offlineEarned, showOfflineBonus: offlineEarned > 0,
    });
  },

  getSaveData: () => {
    const s = get();
    return {
      crystals: s.crystals, totalClicks: s.totalClicks, totalEarned: s.totalEarned,
      clickPower: s.clickPower, multiplier: s.multiplier, autoRate: s.autoRate,
      prestige: s.prestige, prestigePoints: s.prestigePoints,
      upgrades: s.upgrades.map(u => ({ id: u.id, level: u.level })),
      achievements: s.achievements.map(a => ({ id: a.id, unlocked: a.unlocked })),
      goldenClicks: s.goldenClicks, totalCrits: s.totalCrits, maxCombo: s.maxCombo,
      totalEvents: s.totalEvents, lastOnlineTime: Date.now(),
    };
  },
}));
