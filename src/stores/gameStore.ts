import { create } from 'zustand';

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
  type: 'normal' | 'golden' | 'combo' | 'crit' | 'powerup';
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

  // Floating texts
  floatingTexts: FloatingText[];
  floatingTextId: number;

  // Achievement notifications
  achievementQueue: Achievement[];
  currentNotification: Achievement | null;
  notificationTimer: number;

  // Upgrades
  upgrades: Upgrade[];
  achievements: Achievement[];

  // UI state
  screenShake: boolean;
  crystalPulse: number;
  activeTab: 'upgrades' | 'achievements' | 'stats' | 'prestige';
  totalPlayTime: number;

  // Actions
  click: (x: number, y: number) => void;
  clickGolden: (x: number, y: number) => void;
  buyUpgrade: (upgradeId: string) => boolean;
  performPrestige: () => void;
  updateCombo: () => void;
  updateGolden: () => void;
  updatePowerUp: () => void;
  updateNotification: () => void;
  updateClickSpeed: () => void;
  addFloatingText: (x: number, y: number, value: number, type?: FloatingText['type']) => void;
  removeFloatingText: (id: number) => void;
  setActiveTab: (tab: 'upgrades' | 'achievements' | 'stats' | 'prestige') => void;
  checkAchievements: () => void;
  resetGame: () => void;
  loadSave: (data: Record<string, unknown>) => void;
  getSaveData: () => Record<string, unknown>;
}

const DEFAULT_UPGRADES: Upgrade[] = [
  {
    id: 'sharpen', name: 'Sharpen Crystal', description: '+1 click power per level',
    icon: '⚔️', baseCost: 15, costMultiplier: 1.4, level: 0, effect: 'clickPower', value: 1,
  },
  {
    id: 'enchanted_touch', name: 'Enchanted Touch', description: '+3 click power per level',
    icon: '✨', baseCost: 100, costMultiplier: 1.5, level: 0, effect: 'clickPower', value: 3,
  },
  {
    id: 'crystal_sword', name: 'Crystal Sword', description: '+10 click power per level',
    icon: '🗡️', baseCost: 500, costMultiplier: 1.6, level: 0, effect: 'clickPower', value: 10,
  },
  {
    id: 'apprentice_miner', name: 'Apprentice Miner', description: '+0.5 crystals/sec per level',
    icon: '⛏️', baseCost: 50, costMultiplier: 1.4, level: 0, effect: 'autoRate', value: 0.5,
  },
  {
    id: 'crystal_golem', name: 'Crystal Golem', description: '+3 crystals/sec per level',
    icon: '🤖', baseCost: 300, costMultiplier: 1.5, level: 0, effect: 'autoRate', value: 3,
  },
  {
    id: 'crystal_dragon', name: 'Crystal Dragon', description: '+15 crystals/sec per level',
    icon: '🐉', baseCost: 2000, costMultiplier: 1.6, level: 0, effect: 'autoRate', value: 15,
  },
  {
    id: 'crystal_mage', name: 'Crystal Mage Guild', description: '+50 crystals/sec per level',
    icon: '🧙', baseCost: 10000, costMultiplier: 1.7, level: 0, effect: 'autoRate', value: 50,
  },
  {
    id: 'amplifier', name: 'Crystal Amplifier', description: 'x1.2 multiplier per level',
    icon: '🔮', baseCost: 200, costMultiplier: 1.8, level: 0, effect: 'multiplier', value: 0.2,
  },
  {
    id: 'golden_lens', name: 'Golden Lens', description: '+2% golden crystal chance per level',
    icon: '🌟', baseCost: 1000, costMultiplier: 2.0, level: 0, effect: 'goldenChance', value: 0.02, maxLevel: 25,
  },
  {
    id: 'crit_eye', name: 'Critical Eye', description: '+3% critical hit chance per level',
    icon: '👁️', baseCost: 800, costMultiplier: 1.8, level: 0, effect: 'critChance', value: 0.03, maxLevel: 20,
  },
];

const ACHIEVEMENT_DEFS: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'condition'>[] = [
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
];

function buildAchievementConditions(achievements: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'condition'>[]): Achievement[] {
  return achievements.map(a => ({
    ...a,
    unlocked: false,
    condition: (state: GameState) => {
      switch (a.id) {
        case 'first_click': return state.totalClicks >= 1;
        case 'clicks_100': return state.totalClicks >= 100;
        case 'clicks_1000': return state.totalClicks >= 1000;
        case 'clicks_10000': return state.totalClicks >= 10000;
        case 'clicks_50000': return state.totalClicks >= 50000;
        case 'crystals_100': return state.totalEarned >= 100;
        case 'crystals_1000': return state.totalEarned >= 1000;
        case 'crystals_10000': return state.totalEarned >= 10000;
        case 'crystals_100000': return state.totalEarned >= 100000;
        case 'crystals_1m': return state.totalEarned >= 1000000;
        case 'upgrade_first': return state.upgrades.reduce((s, u) => s + u.level, 0) >= 1;
        case 'upgrade_10': return state.upgrades.reduce((s, u) => s + u.level, 0) >= 10;
        case 'upgrade_50': return state.upgrades.reduce((s, u) => s + u.level, 0) >= 50;
        case 'combo_5': return state.maxCombo >= 5;
        case 'combo_10': return state.maxCombo >= 10;
        case 'combo_25': return state.maxCombo >= 25;
        case 'combo_50': return state.maxCombo >= 50;
        case 'crit_first': return state.totalCrits >= 1;
        case 'crit_100': return state.totalCrits >= 100;
        case 'golden_first': return state.goldenClicks >= 1;
        case 'golden_10': return state.goldenClicks >= 10;
        case 'golden_50': return state.goldenClicks >= 50;
        case 'prestige_1': return state.prestige >= 1;
        case 'prestige_5': return state.prestige >= 5;
        case 'auto_10': return state.autoRate >= 10;
        case 'auto_100': return state.autoRate >= 100;
        case 'speed_5': return state.clicksPerSecond >= 5;
        case 'speed_10': return state.clicksPerSecond >= 10;
        default: return false;
      }
    },
  }));
}

export const getUpgradeCost = (upgrade: Upgrade): number => {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
};

const POWER_UP_DEFS: Omit<PowerUp, 'timer'>[] = [
  { id: 'double_click', name: 'Double Power!', icon: '💪', effect: 'doubleClick', duration: 300, value: 2 },
  { id: 'triple_auto', name: 'Triple Auto!', icon: '⚡', effect: 'tripleAuto', duration: 300, value: 3 },
  { id: 'instant_bonus', name: 'Crystal Rain!', icon: '🌧️', effect: 'instantBonus', duration: 0, value: 0 },
];

export const useGameStore = create<GameState>((set, get) => ({
  crystals: 0,
  totalClicks: 0,
  totalEarned: 0,
  clickPower: 1,
  multiplier: 1,
  autoRate: 0,
  prestige: 0,
  prestigePoints: 0,
  combo: 0,
  comboTimer: 0,
  maxCombo: 0,
  lastClickTime: 0,
  clickTimestamps: [],
  clicksPerSecond: 0,
  critChance: 0.05,
  critMultiplier: 5,
  totalCrits: 0,
  goldenClicks: 0,
  goldenChance: 0.03,
  goldenActive: false,
  goldenTimer: 0,
  goldenClickValue: 0,
  activePowerUp: null,
  powerUpTimer: 0,
  floatingTexts: [],
  floatingTextId: 0,
  achievementQueue: [],
  currentNotification: null,
  notificationTimer: 0,
  upgrades: DEFAULT_UPGRADES.map(u => ({ ...u })),
  achievements: buildAchievementConditions(ACHIEVEMENT_DEFS),
  screenShake: false,
  crystalPulse: 0,
  activeTab: 'upgrades',
  totalPlayTime: 0,

  click: (x: number, y: number) => {
    const state = get();
    const now = Date.now();

    // Click speed tracking
    const recentClicks = [...state.clickTimestamps, now].filter(t => now - t < 1000);

    // Combo system
    let newCombo = 1;
    let newMaxCombo = state.maxCombo;
    if (now - state.lastClickTime < 500) {
      newCombo = Math.min(state.combo + 1, 50);
    }
    if (newCombo > newMaxCombo) newMaxCombo = newCombo;

    // Calculate click value
    const comboMultiplier = 1 + (newCombo - 1) * 0.1;
    const prestigeMultiplier = 1 + state.prestigePoints * 0.1;
    const powerUpMultiplier = state.activePowerUp?.effect === 'doubleClick' ? state.activePowerUp.value : 1;
    let value = state.clickPower * state.multiplier * comboMultiplier * prestigeMultiplier * powerUpMultiplier;

    // Critical hit
    let isCrit = false;
    if (Math.random() < state.critChance) {
      isCrit = true;
      value *= state.critMultiplier;
    }

    const roundedValue = Math.round(value * 10) / 10;
    const textType: FloatingText['type'] = isCrit ? 'crit' : newCombo > 1 ? 'combo' : 'normal';

    set({
      crystals: Math.round((state.crystals + roundedValue) * 100) / 100,
      totalClicks: state.totalClicks + 1,
      totalEarned: Math.round((state.totalEarned + roundedValue) * 100) / 100,
      combo: newCombo,
      comboTimer: 60,
      maxCombo: newMaxCombo,
      lastClickTime: now,
      totalCrits: isCrit ? state.totalCrits + 1 : state.totalCrits,
      screenShake: isCrit || newCombo >= 10,
      crystalPulse: isCrit ? 3 : newCombo >= 5 ? 2 : 1,
      floatingTextId: state.floatingTextId + 1,
      clickTimestamps: recentClicks,
      clicksPerSecond: recentClicks.length,
    });

    get().addFloatingText(x, y, roundedValue, textType);
    get().checkAchievements();
  },

  clickGolden: (x: number, y: number) => {
    const state = get();
    if (!state.goldenActive) return;

    const prestigeMultiplier = 1 + state.prestigePoints * 0.1;
    const value = state.goldenClickValue * prestigeMultiplier;
    const roundedValue = Math.round(value * 10) / 10;

    set({
      crystals: Math.round((state.crystals + roundedValue) * 100) / 100,
      totalEarned: Math.round((state.totalEarned + roundedValue) * 100) / 100,
      goldenClicks: state.goldenClicks + 1,
      goldenActive: false,
      goldenTimer: 0,
      screenShake: true,
      crystalPulse: 4,
    });

    get().addFloatingText(x, y, roundedValue, 'golden');
    get().checkAchievements();
  },

  buyUpgrade: (upgradeId: string) => {
    const state = get();
    const upgradeIndex = state.upgrades.findIndex(u => u.id === upgradeId);
    if (upgradeIndex === -1) return false;

    const upgrade = { ...state.upgrades[upgradeIndex] };
    if (upgrade.maxLevel && upgrade.level >= upgrade.maxLevel) return false;

    const cost = getUpgradeCost(upgrade);
    if (state.crystals < cost) return false;

    const newUpgrades = [...state.upgrades];
    newUpgrades[upgradeIndex] = { ...upgrade, level: upgrade.level + 1 };

    let newClickPower = 1;
    let newAutoRate = 0;
    let newMultiplier = 1;
    let newGoldenChance = 0.03;
    let newCritChance = 0.05;

    for (const u of newUpgrades) {
      for (let i = 0; i < u.level; i++) {
        switch (u.effect) {
          case 'clickPower': newClickPower += u.value; break;
          case 'autoRate': newAutoRate += u.value; break;
          case 'multiplier': newMultiplier += u.value; break;
          case 'goldenChance': newGoldenChance += u.value; break;
          case 'critChance': newCritChance += u.value; break;
        }
      }
    }

    set({
      crystals: Math.round((state.crystals - cost) * 100) / 100,
      upgrades: newUpgrades,
      clickPower: newClickPower,
      autoRate: newAutoRate,
      multiplier: newMultiplier,
      goldenChance: Math.min(newGoldenChance, 0.5),
      critChance: Math.min(newCritChance, 0.8),
    });

    get().checkAchievements();
    return true;
  },

  performPrestige: () => {
    const state = get();
    if (state.totalEarned < 1000) return;

    const newPrestigePoints = Math.floor(Math.sqrt(state.totalEarned / 1000));

    set({
      crystals: 0,
      totalClicks: 0,
      totalEarned: 0,
      clickPower: 1,
      multiplier: 1,
      autoRate: 0,
      prestige: state.prestige + 1,
      prestigePoints: state.prestigePoints + newPrestigePoints,
      combo: 0,
      comboTimer: 0,
      maxCombo: 0,
      goldenClicks: 0,
      goldenChance: 0.03,
      critChance: 0.05,
      totalCrits: 0,
      goldenActive: false,
      goldenTimer: 0,
      activePowerUp: null,
      powerUpTimer: 0,
      upgrades: DEFAULT_UPGRADES.map(u => ({ ...u })),
      floatingTexts: [],
      screenShake: true,
      crystalPulse: 5,
    });

    get().checkAchievements();
  },

  updateCombo: () => {
    const state = get();
    if (state.comboTimer > 0) {
      set({ comboTimer: state.comboTimer - 1, combo: state.comboTimer <= 1 ? 0 : state.combo });
    }
  },

  updateGolden: () => {
    const state = get();
    if (state.goldenActive) {
      if (state.goldenTimer > 0) {
        set({ goldenTimer: state.goldenTimer - 1 });
      } else {
        set({ goldenActive: false, goldenTimer: 0 });
      }
    } else {
      // Spawn golden crystal randomly
      if (Math.random() < 0.001) {
        const baseValue = state.clickPower * state.multiplier * 10 * (1 + state.prestigePoints * 0.1);
        set({
          goldenActive: true,
          goldenTimer: 400,
          goldenClickValue: Math.round(baseValue * 10) / 10,
        });
      }
    }
  },

  updatePowerUp: () => {
    const state = get();
    if (state.activePowerUp) {
      if (state.powerUpTimer > 0) {
        set({ powerUpTimer: state.powerUpTimer - 1 });
      } else {
        set({ activePowerUp: null, powerUpTimer: 0 });
      }
    } else if (state.totalClicks > 20 && Math.random() < 0.0008) {
      // Random power-up spawn
      const template = POWER_UP_DEFS[Math.floor(Math.random() * POWER_UP_DEFS.length)];
      if (template.effect === 'instantBonus') {
        const bonus = state.autoRate * 30 + state.clickPower * 5;
        const roundedBonus = Math.round(bonus * 10) / 10;
        set({
          crystals: Math.round((state.crystals + roundedBonus) * 100) / 100,
          totalEarned: Math.round((state.totalEarned + roundedBonus) * 100) / 100,
          crystalPulse: 2,
        });
      } else {
        set({ activePowerUp: { ...template, timer: template.duration }, powerUpTimer: template.duration });
      }
    }
  },

  updateNotification: () => {
    const state = get();
    if (state.currentNotification) {
      if (state.notificationTimer > 0) {
        set({ notificationTimer: state.notificationTimer - 1 });
      } else {
        set({ currentNotification: null, notificationTimer: 0 });
      }
    } else if (state.achievementQueue.length > 0) {
      const [next, ...rest] = state.achievementQueue;
      set({ currentNotification: next, notificationTimer: 120, achievementQueue: rest });
    }
  },

  updateClickSpeed: () => {
    const state = get();
    const now = Date.now();
    const recent = state.clickTimestamps.filter(t => now - t < 1000);
    set({ clickTimestamps: recent, clicksPerSecond: recent.length });
  },

  addFloatingText: (x: number, y: number, value: number, type: FloatingText['type'] = 'normal') => {
    const state = get();
    const newText: FloatingText = { id: state.floatingTextId, value, x, y, type };
    set({ floatingTexts: [...state.floatingTexts, newText] });
    setTimeout(() => get().removeFloatingText(newText.id), 1200);
  },

  removeFloatingText: (id: number) => {
    const state = get();
    set({ floatingTexts: state.floatingTexts.filter(t => t.id !== id) });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  checkAchievements: () => {
    const state = get();
    const newQueue = [...state.achievementQueue];
    const newAchievements = state.achievements.map(a => {
      if (!a.unlocked && a.condition(state)) {
        newQueue.push({ ...a, unlocked: true, unlockedAt: Date.now() });
        return { ...a, unlocked: true, unlockedAt: Date.now() };
      }
      return a;
    });
    set({ achievements: newAchievements, achievementQueue: newQueue });
  },

  resetGame: () => {
    set({
      crystals: 0, totalClicks: 0, totalEarned: 0,
      clickPower: 1, multiplier: 1, autoRate: 0,
      prestige: 0, prestigePoints: 0,
      combo: 0, comboTimer: 0, maxCombo: 0, lastClickTime: 0,
      clickTimestamps: [], clicksPerSecond: 0,
      critChance: 0.05, critMultiplier: 5, totalCrits: 0,
      goldenClicks: 0, goldenChance: 0.03,
      goldenActive: false, goldenTimer: 0, goldenClickValue: 0,
      activePowerUp: null, powerUpTimer: 0,
      floatingTexts: [], floatingTextId: 0,
      achievementQueue: [], currentNotification: null, notificationTimer: 0,
      upgrades: DEFAULT_UPGRADES.map(u => ({ ...u })),
      achievements: buildAchievementConditions(ACHIEVEMENT_DEFS),
      screenShake: false, crystalPulse: 0, totalPlayTime: 0,
    });
  },

  loadSave: (data: Record<string, unknown>) => {
    const savedUpgrades = data.upgrades as { id: string; level: number }[] | undefined;
    const upgrades = DEFAULT_UPGRADES.map(u => {
      const saved = savedUpgrades?.find(su => su.id === u.id);
      return { ...u, level: saved?.level ?? 0 };
    });

    const loadedAchievements = data.achievements as { id: string; unlocked: boolean }[] | undefined;
    let achievements = buildAchievementConditions(ACHIEVEMENT_DEFS);
    if (loadedAchievements) {
      achievements = achievements.map(a => {
        const loaded = loadedAchievements.find(la => la.id === a.id);
        return { ...a, unlocked: loaded?.unlocked ?? false };
      });
    }

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

    set({
      crystals: (data.crystals as number) ?? 0,
      totalClicks: (data.totalClicks as number) ?? 0,
      totalEarned: (data.totalEarned as number) ?? 0,
      clickPower, multiplier, autoRate,
      prestige: (data.prestige as number) ?? 0,
      prestigePoints: (data.prestigePoints as number) ?? 0,
      goldenClicks: (data.goldenClicks as number) ?? 0,
      totalCrits: (data.totalCrits as number) ?? 0,
      maxCombo: (data.maxCombo as number) ?? 0,
      goldenChance, critChance,
      upgrades, achievements,
    });
  },

  getSaveData: () => {
    const state = get();
    return {
      crystals: state.crystals,
      totalClicks: state.totalClicks,
      totalEarned: state.totalEarned,
      clickPower: state.clickPower,
      multiplier: state.multiplier,
      autoRate: state.autoRate,
      prestige: state.prestige,
      prestigePoints: state.prestigePoints,
      upgrades: state.upgrades.map(u => ({ id: u.id, level: u.level })),
      achievements: state.achievements.map(a => ({ id: a.id, unlocked: a.unlocked })),
      goldenClicks: state.goldenClicks,
      totalCrits: state.totalCrits,
      maxCombo: state.maxCombo,
    };
  },
}));
