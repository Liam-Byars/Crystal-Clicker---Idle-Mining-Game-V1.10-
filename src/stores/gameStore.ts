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

export type BuyQuantity = 1 | 10 | 100 | 'max';

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

  // Area system
  currentArea: string;
  unlockedAreas: string[];

  // UI state
  screenShake: boolean;
  crystalPulse: number;
  activeTab: 'upgrades' | 'achievements' | 'stats' | 'prestige' | 'map';

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
  setActiveTab: (tab: 'upgrades' | 'achievements' | 'stats' | 'prestige' | 'map') => void;
  switchArea: (areaId: string) => void;
  checkAreaUnlocks: () => void;
  checkAchievements: () => void;
  resetGame: () => void;
  loadSave: (data: Record<string, unknown>) => void;
  getSaveData: () => Record<string, unknown>;
  claimOfflineEarnings: () => void;
  dismissOfflineBonus: () => void;
}

// ====== Data Definitions ======
const DEFAULT_UPGRADES: Upgrade[] = [
  { id: 'sharpen', name: 'Sharpen Crystal', description: '+1 click power per level', icon: '⚔️', baseCost: 15, costMultiplier: 1.4, level: 0, effect: 'clickPower', value: 1, maxLevel: 2000},
  { id: 'enchanted_touch', name: 'Enchanted Touch', description: '+3 click power per level', icon: '✨', baseCost: 100, costMultiplier: 1.5, level: 0, effect: 'clickPower', value: 3, maxLevel: 2000},
  { id: 'crystal_sword', name: 'Crystal Sword', description: '+10 click power per level', icon: '🗡️', baseCost: 500, costMultiplier: 1.6, level: 0, effect: 'clickPower', value: 10, maxLevel: 2000},
  { id: 'crystal_blade', name: 'Crystal Blade', description: '+25 click power per level', icon: '⚡', baseCost: 5000, costMultiplier: 1.7, level: 0, effect: 'clickPower', value: 25, maxLevel: 2000},
  { id: 'apprentice_miner', name: 'Apprentice Miner', description: '+0.5 crystals/sec', icon: '⛏️', baseCost: 50, costMultiplier: 1.4, level: 0, effect: 'autoRate', value: 0.5, maxLevel: 2000},
  { id: 'crystal_golem', name: 'Crystal Golem', description: '+3 crystals/sec', icon: '🤖', baseCost: 300, costMultiplier: 1.5, level: 0, effect: 'autoRate', value: 3, maxLevel: 2000},
  { id: 'crystal_dragon', name: 'Crystal Dragon', description: '+15 crystals/sec', icon: '🐉', baseCost: 2000, costMultiplier: 1.6, level: 0, effect: 'autoRate', value: 15, maxLevel: 2000},
  { id: 'crystal_mage', name: 'Crystal Mage Guild', description: '+50 crystals/sec', icon: '🧙', baseCost: 10000, costMultiplier: 1.7, level: 0, effect: 'autoRate', value: 50, maxLevel: 2000},
  { id: 'amplifier', name: 'Crystal Amplifier', description: 'x1.2 multiplier per level', icon: '🔮', baseCost: 200, costMultiplier: 1.8, level: 0, effect: 'multiplier', value: 0.2, maxLevel: 2000},
  { id: 'golden_lens', name: 'Golden Lens', description: '+2% golden chance per level', icon: '🌟', baseCost: 1000, costMultiplier: 2.0, level: 0, effect: 'goldenChance', value: 0.02, maxLevel: 25 },
  { id: 'crit_eye', name: 'Critical Eye', description: '+3% crit chance per level', icon: '👁️', baseCost: 800, costMultiplier: 1.8, level: 0, effect: 'critChance', value: 0.03, maxLevel: 20 },
];

// ====== Area Definitions ======
export const AREAS: Area[] = [
  {
    id: 'naica', name: 'Naica Crystal Cave', location: 'Mexico', flag: '🇲🇽',
    gem: 'Selenite', description: 'Giant gypsum crystals in an underground cavern', icon: '🪨',
    unlockAt: 0,
    gradient: 'from-gray-200 via-white to-cyan-100',
    glowColor: 'rgba(200, 230, 255, 0.6)',
    bgAccent: 'bg-cyan-950/20',
  },
  {
    id: 'ratnapura', name: 'Ratnapura', location: 'Sri Lanka', flag: '🇱🇰',
    gem: 'Sapphires', description: 'The City of Gems, famed for blue sapphires', icon: '💙',
    unlockAt: 1000,
    gradient: 'from-blue-400 via-blue-600 to-indigo-800',
    glowColor: 'rgba(96, 165, 250, 0.6)',
    bgAccent: 'bg-blue-950/20',
  },
  {
    id: 'muzo', name: 'Muzo Valley', location: 'Colombia', flag: '🇨🇴',
    gem: 'Emeralds', description: 'The world\'s finest emerald mining region', icon: '💚',
    unlockAt: 50000,
    gradient: 'from-green-400 via-emerald-500 to-green-800',
    glowColor: 'rgba(52, 211, 153, 0.6)',
    bgAccent: 'bg-green-950/20',
  },
  {
    id: 'coober_pedy', name: 'Coober Pedy', location: 'Australia', flag: '🇦🇺',
    gem: 'Opals', description: 'The opal capital of the world, underground mining town', icon: '🌈',
    unlockAt: 500000,
    gradient: 'from-pink-300 via-orange-300 to-yellow-200',
    glowColor: 'rgba(251, 146, 60, 0.5)',
    bgAccent: 'bg-orange-950/20',
  },
  {
    id: 'ilakaka', name: 'Ilakaka', location: 'Madagascar', flag: '🇲🇬',
    gem: 'Rare Gems', description: 'A mining boomtown producing rare sapphires and tourmalines', icon: '🌸',
    unlockAt: 5000000,
    gradient: 'from-pink-400 via-fuchsia-500 to-purple-600',
    glowColor: 'rgba(232, 121, 249, 0.5)',
    bgAccent: 'bg-fuchsia-950/20',
  },
  {
    id: 'mogok', name: 'Mogok Valley', location: 'Myanmar', flag: '🇲🇲',
    gem: 'Rubies', description: 'The legendary Valley of Rubies, source of the finest pigeon\'s blood rubies', icon: '❤️',
    unlockAt: 50000000,
    gradient: 'from-red-400 via-red-600 to-rose-900',
    glowColor: 'rgba(248, 113, 113, 0.5)',
    bgAccent: 'bg-red-950/20',
  },
  {
    id: 'skeleton_coast', name: 'Skeleton Coast', location: 'Namibia', flag: '🇳🇦',
    gem: 'Diamonds', description: 'Diamonds washed from the interior to the desolate Atlantic coast', icon: '💠',
    unlockAt: 500000000,
    gradient: 'from-white via-cyan-100 to-blue-200',
    glowColor: 'rgba(224, 242, 254, 0.8)',
    bgAccent: 'bg-sky-950/20',
  },
  {
    id: 'ural_mountains', name: 'Ural Mountains', location: 'Russia', flag: '🇷🇺',
    gem: 'Alexandrite', description: 'The only source of color-changing alexandrite', icon: '🔄',
    unlockAt: 5e10,
    gradient: 'from-emerald-400 via-purple-500 to-emerald-600',
    glowColor: 'rgba(52, 211, 153, 0.5)',
    bgAccent: 'bg-emerald-950/20',
  },
  {
    id: 'mirny_mine', name: 'Mirny Diamond Mine', location: 'Russia', flag: '🇷🇺',
    gem: 'Star Diamonds', description: 'One of the largest excavated holes in the world', icon: '⭐',
    unlockAt: 5e12,
    gradient: 'from-slate-300 via-blue-200 to-slate-400',
    glowColor: 'rgba(203, 213, 225, 0.6)',
    bgAccent: 'bg-slate-950/20',
  },
  {
    id: 'cullinan', name: 'Cullinan Mine', location: 'South Africa', flag: '🇿🇦',
    gem: 'Cullinan Diamonds', description: 'Source of the largest gem diamond ever found', icon: '👑',
    unlockAt: 5e14,
    gradient: 'from-yellow-200 via-white to-cyan-200',
    glowColor: 'rgba(254, 249, 195, 0.8)',
    bgAccent: 'bg-yellow-950/20',
  },
  {
    id: 'argyle', name: 'Argyle Diamond Mine', location: 'Australia', flag: '🇦🇺',
    gem: 'Pink Diamonds', description: "The world's primary source of rare pink diamonds", icon: '💗',
    unlockAt: 5e16,
    gradient: 'from-pink-300 via-rose-400 to-pink-500',
    glowColor: 'rgba(249, 168, 212, 0.6)',
    bgAccent: 'bg-pink-950/20',
  },
  {
    id: 'bahia', name: 'Bahia Emerald', location: 'Brazil', flag: '🇧🇷',
    gem: 'Giant Emeralds', description: 'Home to one of the largest emerald crystals ever found', icon: '🌲',
    unlockAt: 5e18,
    gradient: 'from-green-500 via-emerald-600 to-green-800',
    glowColor: 'rgba(34, 197, 94, 0.6)',
    bgAccent: 'bg-green-950/20',
  },
  {
    id: 'merelani', name: 'Merelani Hills', location: 'Tanzania', flag: '🇹🇿',
    gem: 'Tanzanite', description: 'The exclusive source of violet-blue tanzanite', icon: '🔮',
    unlockAt: 5e20,
    gradient: 'from-violet-400 via-purple-500 to-indigo-600',
    glowColor: 'rgba(167, 139, 250, 0.5)',
    bgAccent: 'bg-violet-950/20',
  },
  {
    id: 'hpakant', name: 'Hpakant Jade Mines', location: 'Myanmar', flag: '🇲🇲',
    gem: 'Imperial Jade', description: 'Legendary jadeite mines producing the finest imperial jade', icon: '🟢',
    unlockAt: 5e22,
    gradient: 'from-lime-400 via-emerald-500 to-teal-600',
    glowColor: 'rgba(163, 230, 53, 0.5)',
    bgAccent: 'bg-lime-950/20',
  },
  {
    id: 'meteor_crater', name: 'Meteor Crater', location: 'USA', flag: '🇺🇸',
    gem: 'Meteorite Crystals', description: 'Ancient impact crater yielding extraterrestrial gems', icon: '☄️',
    unlockAt: 5e24,
    gradient: 'from-amber-400 via-orange-500 to-red-600',
    glowColor: 'rgba(251, 191, 36, 0.5)',
    bgAccent: 'bg-amber-950/20',
  },
  {
    id: 'kola_superdeep', name: 'Kola Superdeep', location: 'Russia', flag: '🇷🇺',
    gem: 'Deep Crystals', description: 'The deepest hole ever drilled revealing unknown crystals', icon: '🔦',
    unlockAt: 5e26,
    gradient: 'from-red-500 via-orange-600 to-yellow-500',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    bgAccent: 'bg-red-950/20',
  },
  {
    id: 'mariana_trench', name: 'Mariana Trench', location: 'Pacific Ocean', flag: '🌊',
    gem: 'Abyssal Gems', description: 'Crystals formed under extreme deep-sea pressure', icon: '🐙',
    unlockAt: 5e28,
    gradient: 'from-blue-900 via-indigo-900 to-slate-900',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    bgAccent: 'bg-blue-950/30',
  },
  {
    id: 'asteroid_belt', name: 'Asteroid Belt', location: 'Space', flag: '🚀',
    gem: 'Asteroid Crystals', description: 'Mining the asteroid belt between Mars and Jupiter', icon: '🌌',
    unlockAt: 5e30,
    gradient: 'from-gray-400 via-zinc-500 to-gray-600',
    glowColor: 'rgba(161, 161, 170, 0.5)',
    bgAccent: 'bg-zinc-950/20',
  },
  {
    id: 'lunar_mare', name: 'Lunar Mare', location: 'The Moon', flag: '🌙',
    gem: 'Moon Gems', description: 'KREEP crystals harvested from the lunar highlands', icon: '🌕',
    unlockAt: 5e32,
    gradient: 'from-gray-100 via-slate-200 to-gray-300',
    glowColor: 'rgba(241, 245, 249, 0.8)',
    bgAccent: 'bg-gray-950/20',
  },
  {
    id: 'olympus_mons', name: 'Olympus Mons', location: 'Mars', flag: '🔴',
    gem: 'Olympus Gems', description: 'Crystals forged in volcanic chambers of the tallest volcano', icon: '🌋',
    unlockAt: 5e34,
    gradient: 'from-red-400 via-orange-500 to-amber-600',
    glowColor: 'rgba(248, 113, 113, 0.5)',
    bgAccent: 'bg-orange-950/20',
  },
  {
    id: 'europa_ice', name: 'Europa Ice Fields', location: 'Jupiter Moon', flag: '🪐',
    gem: 'Europa Ice', description: "Subsurface ocean crystals from Jupiter's frozen moon", icon: '🧊',
    unlockAt: 5e36,
    gradient: 'from-cyan-200 via-blue-300 to-cyan-400',
    glowColor: 'rgba(165, 243, 252, 0.7)',
    bgAccent: 'bg-cyan-950/20',
  },
  {
    id: 'titan_mines', name: 'Titan Methane Caves', location: 'Saturn Moon', flag: '🪐',
    gem: 'Titan Crystal', description: 'Methane-ice crystals from the hydrocarbon lakes of Titan', icon: '🟠',
    unlockAt: 5e38,
    gradient: 'from-orange-400 via-amber-500 to-yellow-600',
    glowColor: 'rgba(251, 146, 60, 0.5)',
    bgAccent: 'bg-orange-950/20',
  },
  {
    id: 'saturn_rings', name: 'Saturn Ring Shards', location: 'Saturn', flag: '🪐',
    gem: 'Ring Shards', description: "Crystallized ice particles mined from Saturn's rings", icon: '💍',
    unlockAt: 5e40,
    gradient: 'from-yellow-300 via-amber-400 to-orange-400',
    glowColor: 'rgba(252, 211, 77, 0.6)',
    bgAccent: 'bg-yellow-950/20',
  },
  {
    id: 'deep_space', name: 'Deep Space Rift', location: 'Interstellar', flag: '✨',
    gem: 'Void Crystals', description: 'Crystals condensed from dark matter in interstellar voids', icon: '🖤',
    unlockAt: 5e42,
    gradient: 'from-purple-900 via-violet-950 to-slate-950',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    bgAccent: 'bg-purple-950/30',
  },
  {
    id: 'nebula_core', name: 'Orion Nebula Core', location: 'Orion Nebula', flag: '🌌',
    gem: 'Nebula Gems', description: 'Stellar nursery crystals formed in newborn star systems', icon: '🌈',
    unlockAt: 5e44,
    gradient: 'from-pink-500 via-purple-500 to-cyan-500',
    glowColor: 'rgba(236, 72, 153, 0.5)',
    bgAccent: 'bg-fuchsia-950/20',
  },
  {
    id: 'neutron_star', name: 'Neutron Star Forge', location: 'Neutron Star', flag: '⚡',
    gem: 'Neutronium', description: "Ultra-dense crystalline matter from a neutron star's crust", icon: '💫',
    unlockAt: 5e46,
    gradient: 'from-cyan-300 via-white to-yellow-200',
    glowColor: 'rgba(255, 255, 255, 0.8)',
    bgAccent: 'bg-cyan-950/20',
  },
  {
    id: 'singularity', name: 'Event Horizon', location: 'Black Hole', flag: '🌀',
    gem: 'Singularity Shards', description: 'Crystals extracted from the edge of spacetime itself', icon: '🕳️',
    unlockAt: 5e48,
    gradient: 'from-gray-900 via-purple-900 to-black',
    glowColor: 'rgba(168, 85, 247, 0.5)',
    bgAccent: 'bg-black/40',
  },
];

// ====== Area Upgrades (areas 2-7) ======
const AREA_UPGRADES: Record<string, Upgrade[]> = {
  ratnapura: [
    { id: 'ratnapura_gem_cutter', name: 'Gem Cutter', description: '+50 click power per level', icon: '💎', baseCost: 2000, costMultiplier: 1.6, level: 0, effect: 'clickPower', value: 50, maxLevel: 2000},
    { id: 'ratnapura_mining_team', name: 'Mining Team', description: '+20 crystals/sec', icon: '👷', baseCost: 5000, costMultiplier: 1.6, level: 0, effect: 'autoRate', value: 20, maxLevel: 2000},
    { id: 'ratnapura_blue_aura', name: 'Blue Aura', description: 'x1.3 multiplier per level', icon: '🔵', baseCost: 3000, costMultiplier: 1.8, level: 0, effect: 'multiplier', value: 0.3, maxLevel: 2000},
    { id: 'ratnapura_star_sapphire', name: 'Star Sapphire', description: '+2% golden chance per level', icon: '⭐', baseCost: 8000, costMultiplier: 2.0, level: 0, effect: 'goldenChance', value: 0.02, maxLevel: 25 },
    { id: 'ratnapura_cavern_heart', name: 'Cavern Heart', description: 'x2 click power, x1.5 auto rate', icon: '🌊', baseCost: 50000, costMultiplier: 2.2, level: 0, effect: 'multiplier', value: 0.5, maxLevel: 2000},
  ],
  muzo: [
    { id: 'muzo_emerald_golem', name: 'Emerald Golem', description: '+200 click power per level', icon: '🤖', baseCost: 100000, costMultiplier: 1.6, level: 0, effect: 'clickPower', value: 200, maxLevel: 2000},
    { id: 'muzo_jungle_expedition', name: 'Jungle Expedition', description: '+100 crystals/sec', icon: '🌴', baseCost: 200000, costMultiplier: 1.6, level: 0, effect: 'autoRate', value: 100, maxLevel: 2000},
    { id: 'muzo_emerald_amplifier', name: 'Emerald Amplifier', description: 'x1.5 multiplier per level', icon: '💚', baseCost: 150000, costMultiplier: 1.8, level: 0, effect: 'multiplier', value: 0.5, maxLevel: 2000},
    { id: 'muzo_lucky_mine', name: 'Lucky Mine', description: '+2% crit chance per level', icon: '🍀', baseCost: 250000, costMultiplier: 2.0, level: 0, effect: 'critChance', value: 0.02, maxLevel: 25 },
    { id: 'muzo_chivor_vein', name: 'Chivor Vein', description: 'Massive x2 multiplier per level', icon: '🏔️', baseCost: 1000000, costMultiplier: 2.5, level: 0, effect: 'multiplier', value: 1.0, maxLevel: 2000},
  ],
  coober_pedy: [
    { id: 'coober_pedy_opal_pick', name: 'Opal Pickaxe', description: '+800 click power per level', icon: '⛏️', baseCost: 1000000, costMultiplier: 1.6, level: 0, effect: 'clickPower', value: 800, maxLevel: 2000},
    { id: 'coober_pedy_digger_fleet', name: 'Digger Fleet', description: '+500 crystals/sec', icon: '🚜', baseCost: 2000000, costMultiplier: 1.6, level: 0, effect: 'autoRate', value: 500, maxLevel: 2000},
    { id: 'coober_pedy_iridescent_lens', name: 'Iridescent Lens', description: 'x1.5 multiplier per level', icon: '🌈', baseCost: 1500000, costMultiplier: 1.8, level: 0, effect: 'multiplier', value: 0.5, maxLevel: 2000},
    { id: 'coober_pedy_flash_fire', name: 'Flash Fire Opal', description: '+1.5% golden chance per level', icon: '🔥', baseCost: 3000000, costMultiplier: 2.0, level: 0, effect: 'goldenChance', value: 0.015, maxLevel: 20 },
    { id: 'coober_pedy_underground_city', name: 'Underground City', description: 'x3 multiplier, +1000 auto rate', icon: '🏘️', baseCost: 20000000, costMultiplier: 2.5, level: 0, effect: 'multiplier', value: 2.0, maxLevel: 2000},
  ],
  ilakaka: [
    { id: 'ilakaka_rare_finder', name: 'Rare Finder', description: '+3,000 click power per level', icon: '🔍', baseCost: 10000000, costMultiplier: 1.6, level: 0, effect: 'clickPower', value: 3000, maxLevel: 2000},
    { id: 'ilakaka_gem_wash', name: 'Gem Wash Plant', description: '+2,000 crystals/sec', icon: '🏭', baseCost: 20000000, costMultiplier: 1.6, level: 0, effect: 'autoRate', value: 2000, maxLevel: 2000},
    { id: 'ilakaka_tourmaline_ring', name: 'Tourmaline Ring', description: 'x2 multiplier per level', icon: '💍', baseCost: 15000000, costMultiplier: 1.8, level: 0, effect: 'multiplier', value: 1.0, maxLevel: 2000},
    { id: 'ilakaka_pink_sapphire', name: 'Pink Sapphire', description: '+1% crit chance per level', icon: '🌸', baseCost: 30000000, costMultiplier: 2.0, level: 0, effect: 'critChance', value: 0.01, maxLevel: 25 },
    { id: 'ilakaka_madagascar_mine', name: 'Madagascar Deep Mine', description: 'x4 multiplier per level', icon: '🌋', baseCost: 200000000, costMultiplier: 2.5, level: 0, effect: 'multiplier', value: 3.0, maxLevel: 2000},
  ],
  mogok: [
    { id: 'mogok_ruby_blade', name: 'Ruby Blade', description: '+12,000 click power per level', icon: '🗡️', baseCost: 100000000, costMultiplier: 1.6, level: 0, effect: 'clickPower', value: 12000, maxLevel: 2000},
    { id: 'mogok_palace_mine', name: 'Palace Mine', description: '+8,000 crystals/sec', icon: '🏯', baseCost: 200000000, costMultiplier: 1.6, level: 0, effect: 'autoRate', value: 8000, maxLevel: 2000},
    { id: 'mogok_blood_gem', name: 'Pigeon\'s Blood Gem', description: 'x2.5 multiplier per level', icon: '🩸', baseCost: 150000000, costMultiplier: 1.8, level: 0, effect: 'multiplier', value: 1.5, maxLevel: 2000},
    { id: 'mogok_dragon_ruby', name: 'Dragon Ruby', description: '+1.5% golden chance per level', icon: '🐉', baseCost: 300000000, costMultiplier: 2.0, level: 0, effect: 'goldenChance', value: 0.015, maxLevel: 20 },
    { id: 'mogok_valley_heart', name: 'Valley of Rubies', description: 'x5 multiplier per level', icon: '❤️‍🔥', baseCost: 2000000000, costMultiplier: 2.5, level: 0, effect: 'multiplier', value: 4.0, maxLevel: 2000},
  ],
  skeleton_coast: [
    { id: 'skeleton_diamond_drill', name: 'Diamond Drill', description: '+50,000 click power per level', icon: '🔩', baseCost: 1000000000, costMultiplier: 1.6, level: 0, effect: 'clickPower', value: 50000, maxLevel: 2000},
    { id: 'skeleton_coast_dredge', name: 'Coastal Dredge', description: '+30,000 crystals/sec', icon: '🚢', baseCost: 2000000000, costMultiplier: 1.6, level: 0, effect: 'autoRate', value: 30000, maxLevel: 2000},
    { id: 'skeleton_diamond_polish', name: 'Diamond Polish', description: 'x3 multiplier per level', icon: '💠', baseCost: 1500000000, costMultiplier: 1.8, level: 0, effect: 'multiplier', value: 2.0, maxLevel: 2000},
    { id: 'skeleton_ice_crit', name: 'Ice Crit', description: '+1% crit chance per level', icon: '🧊', baseCost: 3000000000, costMultiplier: 2.0, level: 0, effect: 'critChance', value: 0.01, maxLevel: 30 },
    { id: 'skeleton_kimberlite_pipe', name: 'Kimberlite Pipe', description: 'x8 multiplier per level', icon: '🌊', baseCost: 20000000000, costMultiplier: 2.5, level: 0, effect: 'multiplier', value: 7.0, maxLevel: 2000},
  ],
  ural_mountains: [
    { id: 'ural_mountains_hammer', name: 'Alexandrite Hammer', description: '+200K click power per level', icon: '🔨', baseCost: 5e9, costMultiplier: 1.6, level: 0, effect: 'clickPower', value: 200000, maxLevel: 2000},
    { id: 'ural_mountains_excavator', name: 'Ural Mountains Excavator', description: '+100K crystals/sec', icon: '⚙️', baseCost: 1.5e10, costMultiplier: 1.6, level: 0, effect: 'autoRate', value: 100000, maxLevel: 2000},
    { id: 'ural_mountains_resonance', name: 'Alexandrite Resonance', description: 'x8 multiplier per level', icon: '🎵', baseCost: 1e10, costMultiplier: 1.8, level: 0, effect: 'multiplier', value: 8, maxLevel: 2000},
    { id: 'ural_mountains_luck', name: 'Golden Fortune', description: '+1.5% golden chance per level', icon: '🍀', baseCost: 2.5e10, costMultiplier: 2.0, level: 0, effect: 'goldenChance', value: 0.015, maxLevel: 25 },
    { id: 'ural_mountains_ultimate', name: 'Alexandrite Heart', description: 'x16 multiplier per level', icon: '💎', baseCost: 5e11, costMultiplier: 2.5, level: 0, effect: 'multiplier', value: 15, maxLevel: 2000},
  ],
  mirny_mine: [
    { id: 'mirny_mine_hammer', name: 'Star Diamond Hammer', description: '+2M click power per level', icon: '🔨', baseCost: 5e11, costMultiplier: 1.6, level: 0, effect: 'clickPower', value: 2e6, maxLevel: 2000},
    { id: 'mirny_mine_excavator', name: 'Mirny Mine Excavator', description: '+1M crystals/sec', icon: '⚙️', baseCost: 1.5e12, costMultiplier: 1.6, level: 0, effect: 'autoRate', value: 1e6, maxLevel: 2000},
    { id: 'mirny_mine_resonance', name: 'Diamond Resonance', description: 'x40 multiplier per level', icon: '🎵', baseCost: 1e12, costMultiplier: 1.8, level: 0, effect: 'multiplier', value: 40, maxLevel: 2000},
    { id: 'mirny_mine_luck', name: 'Critical Fortune', description: '+1.0% crit chance per level', icon: '🍀', baseCost: 2.5e12, costMultiplier: 2.0, level: 0, effect: 'critChance', value: 0.01, maxLevel: 25 },
    { id: 'mirny_mine_ultimate', name: 'Star Diamond Core', description: 'x80 multiplier per level', icon: '⭐', baseCost: 5e13, costMultiplier: 2.5, level: 0, effect: 'multiplier', value: 80, maxLevel: 2000},
  ],
  cullinan: [
    { id: 'cullinan_hammer', name: 'Cullinan Hammer', description: '+20M click power per level', icon: '🔨', baseCost: 5e13, costMultiplier: 1.6, level: 0, effect: 'clickPower', value: 2e7, maxLevel: 2000},
    { id: 'cullinan_excavator', name: 'Cullinan Excavator', description: '+10M crystals/sec', icon: '⚙️', baseCost: 1.5e14, costMultiplier: 1.6, level: 0, effect: 'autoRate', value: 1e7, maxLevel: 2000},
    { id: 'cullinan_resonance', name: 'Cullinan Resonance', description: 'x200 multiplier per level', icon: '🎵', baseCost: 1e14, costMultiplier: 1.8, level: 0, effect: 'multiplier', value: 200, maxLevel: 2000},
    { id: 'cullinan_luck', name: 'Golden Fortune', description: '+1.0% golden chance per level', icon: '🍀', baseCost: 2.5e14, costMultiplier: 2.0, level: 0, effect: 'goldenChance', value: 0.01, maxLevel: 25 },
    { id: 'cullinan_ultimate', name: 'Cullinan Star', description: 'x400 multiplier per level', icon: '👑', baseCost: 5e15, costMultiplier: 2.5, level: 0, effect: 'multiplier', value: 400, maxLevel: 2000},
  ],
  argyle: [
    { id: 'argyle_hammer', name: 'Pink Diamond Hammer', description: '+200M click power per level', icon: '🔨', baseCost: 5e15, costMultiplier: 1.6, level: 0, effect: 'clickPower', value: 2e8, maxLevel: 2000},
    { id: 'argyle_excavator', name: 'Argyle Excavator', description: '+100M crystals/sec', icon: '⚙️', baseCost: 1.5e16, costMultiplier: 1.6, level: 0, effect: 'autoRate', value: 1e8, maxLevel: 2000},
    { id: 'argyle_resonance', name: 'Pink Resonance', description: 'x1K multiplier per level', icon: '🎵', baseCost: 1e16, costMultiplier: 1.8, level: 0, effect: 'multiplier', value: 1000, maxLevel: 2000},
    { id: 'argyle_luck', name: 'Critical Fortune', description: '+0.8% crit chance per level', icon: '🍀', baseCost: 2.5e16, costMultiplier: 2.0, level: 0, effect: 'critChance', value: 0.008, maxLevel: 25 },
    { id: 'argyle_ultimate', name: 'Pink Star', description: 'x2K multiplier per level', icon: '💗', baseCost: 5e17, costMultiplier: 2.5, level: 0, effect: 'multiplier', value: 2000, maxLevel: 2000},
  ],
  bahia: [
    { id: 'bahia_hammer', name: 'Giant Emerald Hammer', description: '+2B click power per level', icon: '🔨', baseCost: 5e17, costMultiplier: 1.6, level: 0, effect: 'clickPower', value: 2e9, maxLevel: 2000},
    { id: 'bahia_excavator', name: 'Bahia Excavator', description: '+1B crystals/sec', icon: '⚙️', baseCost: 1.5e18, costMultiplier: 1.6, level: 0, effect: 'autoRate', value: 1e9, maxLevel: 2000},
    { id: 'bahia_resonance', name: 'Emerald Resonance', description: 'x5K multiplier per level', icon: '🎵', baseCost: 1e18, costMultiplier: 1.8, level: 0, effect: 'multiplier', value: 5000, maxLevel: 2000},
    { id: 'bahia_luck', name: 'Golden Fortune', description: '+0.8% golden chance per level', icon: '🍀', baseCost: 2.5e18, costMultiplier: 2.0, level: 0, effect: 'goldenChance', value: 0.008, maxLevel: 20 },
    { id: 'bahia_ultimate', name: 'Emerald Titan', description: 'x10K multiplier per level', icon: '🌲', baseCost: 5e19, costMultiplier: 2.5, level: 0, effect: 'multiplier', value: 10000, maxLevel: 2000},
  ],
  merelani: [
    { id: 'merelani_hammer', name: 'Tanzanite Hammer', description: '+20B click power per level', icon: '🔨', baseCost: 5e19, costMultiplier: 1.6, level: 0, effect: 'clickPower', value: 2e10, maxLevel: 2000},
    { id: 'merelani_excavator', name: 'Merelani Excavator', description: '+10B crystals/sec', icon: '⚙️', baseCost: 1.5e20, costMultiplier: 1.6, level: 0, effect: 'autoRate', value: 1e10, maxLevel: 2000},
    { id: 'merelani_resonance', name: 'Tanzanite Resonance', description: 'x25K multiplier per level', icon: '🎵', baseCost: 1e20, costMultiplier: 1.8, level: 0, effect: 'multiplier', value: 25000, maxLevel: 2000},
    { id: 'merelani_luck', name: 'Critical Fortune', description: '+0.5% crit chance per level', icon: '🍀', baseCost: 2.5e20, costMultiplier: 2.0, level: 0, effect: 'critChance', value: 0.005, maxLevel: 25 },
    { id: 'merelani_ultimate', name: 'Tanzanite Heart', description: 'x50K multiplier per level', icon: '🔮', baseCost: 5e21, costMultiplier: 2.5, level: 0, effect: 'multiplier', value: 50000, maxLevel: 2000},
  ],
  hpakant: [
    { id: 'hpakant_hammer', name: 'Jade Hammer', description: '+200B click power per level', icon: '🔨', baseCost: 5e21, costMultiplier: 1.6, level: 0, effect: 'clickPower', value: 2e11, maxLevel: 2000},
    { id: 'hpakant_excavator', name: 'Hpakant Excavator', description: '+100B crystals/sec', icon: '⚙️', baseCost: 1.5e22, costMultiplier: 1.6, level: 0, effect: 'autoRate', value: 1e11, maxLevel: 2000},
    { id: 'hpakant_resonance', name: 'Jade Resonance', description: 'x100K multiplier per level', icon: '🎵', baseCost: 1e22, costMultiplier: 1.8, level: 0, effect: 'multiplier', value: 100000, maxLevel: 2000},
    { id: 'hpakant_luck', name: 'Golden Fortune', description: '+0.5% golden chance per level', icon: '🍀', baseCost: 2.5e22, costMultiplier: 2.0, level: 0, effect: 'goldenChance', value: 0.005, maxLevel: 20 },
    { id: 'hpakant_ultimate', name: 'Imperial Heart', description: 'x200K multiplier per level', icon: '🟢', baseCost: 5e23, costMultiplier: 2.5, level: 0, effect: 'multiplier', value: 200000, maxLevel: 2000},
  ],
  meteor_crater: [
    { id: 'meteor_crater_hammer', name: 'Meteorite Hammer', description: '+2T click power per level', icon: '🔨', baseCost: 5e23, costMultiplier: 1.6, level: 0, effect: 'clickPower', value: 2e12, maxLevel: 2000},
    { id: 'meteor_crater_excavator', name: 'Meteor Crater Excavator', description: '+1T crystals/sec', icon: '⚙️', baseCost: 1.5e24, costMultiplier: 1.6, level: 0, effect: 'autoRate', value: 1e12, maxLevel: 2000},
    { id: 'meteor_crater_resonance', name: 'Meteorite Resonance', description: 'x500K multiplier per level', icon: '🎵', baseCost: 1e24, costMultiplier: 1.8, level: 0, effect: 'multiplier', value: 500000, maxLevel: 2000},
    { id: 'meteor_crater_luck', name: 'Critical Fortune', description: '+0.3% crit chance per level', icon: '🍀', baseCost: 2.5e24, costMultiplier: 2.0, level: 0, effect: 'critChance', value: 0.003, maxLevel: 25 },
    { id: 'meteor_crater_ultimate', name: 'Impact Core', description: 'x1M multiplier per level', icon: '☄️', baseCost: 5e25, costMultiplier: 2.5, level: 0, effect: 'multiplier', value: 1e6, maxLevel: 2000},
  ],
  kola_superdeep: [
    { id: 'kola_superdeep_hammer', name: 'Deep Crystal Hammer', description: '+20T click power per level', icon: '🔨', baseCost: 5e25, costMultiplier: 1.6, level: 0, effect: 'clickPower', value: 2e13, maxLevel: 2000},
    { id: 'kola_superdeep_excavator', name: 'Kola Superdeep Excavator', description: '+10T crystals/sec', icon: '⚙️', baseCost: 1.5e26, costMultiplier: 1.6, level: 0, effect: 'autoRate', value: 1e13, maxLevel: 2000},
    { id: 'kola_superdeep_resonance', name: 'Deep Resonance', description: 'x2M multiplier per level', icon: '🎵', baseCost: 1e26, costMultiplier: 1.8, level: 0, effect: 'multiplier', value: 2e6, maxLevel: 2000},
    { id: 'kola_superdeep_luck', name: 'Golden Fortune', description: '+0.3% golden chance per level', icon: '🍀', baseCost: 2.5e26, costMultiplier: 2.0, level: 0, effect: 'goldenChance', value: 0.003, maxLevel: 20 },
    { id: 'kola_superdeep_ultimate', name: 'Core Amplifier', description: 'x5M multiplier per level', icon: '🔦', baseCost: 5e27, costMultiplier: 2.5, level: 0, effect: 'multiplier', value: 5e6, maxLevel: 2000},
  ],
  mariana_trench: [
    { id: 'mariana_trench_hammer', name: 'Abyssal Hammer', description: '+200T click power per level', icon: '🔨', baseCost: 5e27, costMultiplier: 1.6, level: 0, effect: 'clickPower', value: 2e14, maxLevel: 2000},
    { id: 'mariana_trench_excavator', name: 'Mariana Trench Excavator', description: '+100T crystals/sec', icon: '⚙️', baseCost: 1.5e28, costMultiplier: 1.6, level: 0, effect: 'autoRate', value: 1e14, maxLevel: 2000},
    { id: 'mariana_trench_resonance', name: 'Abyssal Resonance', description: 'x10M multiplier per level', icon: '🎵', baseCost: 1e28, costMultiplier: 1.8, level: 0, effect: 'multiplier', value: 1e7, maxLevel: 2000},
    { id: 'mariana_trench_luck', name: 'Critical Fortune', description: '+0.2% crit chance per level', icon: '🍀', baseCost: 2.5e28, costMultiplier: 2.0, level: 0, effect: 'critChance', value: 0.002, maxLevel: 25 },
    { id: 'mariana_trench_ultimate', name: 'Leviathan Heart', description: 'x20M multiplier per level', icon: '🐙', baseCost: 5e29, costMultiplier: 2.5, level: 0, effect: 'multiplier', value: 2e7, maxLevel: 2000},
  ],
  asteroid_belt: [
    { id: 'asteroid_belt_hammer', name: 'Asteroid Hammer', description: '+2AA click power per level', icon: '🔨', baseCost: 5e29, costMultiplier: 1.6, level: 0, effect: 'clickPower', value: 2e15, maxLevel: 2000},
    { id: 'asteroid_belt_excavator', name: 'Asteroid Belt Excavator', description: '+1AA crystals/sec', icon: '⚙️', baseCost: 1.5e30, costMultiplier: 1.6, level: 0, effect: 'autoRate', value: 1e15, maxLevel: 2000},
    { id: 'asteroid_belt_resonance', name: 'Asteroid Resonance', description: 'x50M multiplier per level', icon: '🎵', baseCost: 1e30, costMultiplier: 1.8, level: 0, effect: 'multiplier', value: 5e7, maxLevel: 2000},
    { id: 'asteroid_belt_luck', name: 'Golden Fortune', description: '+0.2% golden chance per level', icon: '🍀', baseCost: 2.5e30, costMultiplier: 2.0, level: 0, effect: 'goldenChance', value: 0.002, maxLevel: 20 },
    { id: 'asteroid_belt_ultimate', name: 'Ceres Core', description: 'x100M multiplier per level', icon: '🌌', baseCost: 5e31, costMultiplier: 2.5, level: 0, effect: 'multiplier', value: 1e8, maxLevel: 2000},
  ],
  lunar_mare: [
    { id: 'lunar_mare_hammer', name: 'Lunar Hammer', description: '+20AA click power per level', icon: '🔨', baseCost: 5e31, costMultiplier: 1.6, level: 0, effect: 'clickPower', value: 2e16, maxLevel: 2000},
    { id: 'lunar_mare_excavator', name: 'Lunar Mare Excavator', description: '+10AA crystals/sec', icon: '⚙️', baseCost: 1.5e32, costMultiplier: 1.6, level: 0, effect: 'autoRate', value: 1e16, maxLevel: 2000},
    { id: 'lunar_mare_resonance', name: 'Lunar Resonance', description: 'x200M multiplier per level', icon: '🎵', baseCost: 1e32, costMultiplier: 1.8, level: 0, effect: 'multiplier', value: 2e8, maxLevel: 2000},
    { id: 'lunar_mare_luck', name: 'Critical Fortune', description: '+0.1% crit chance per level', icon: '🍀', baseCost: 2.5e32, costMultiplier: 2.0, level: 0, effect: 'critChance', value: 0.001, maxLevel: 25 },
    { id: 'lunar_mare_ultimate', name: 'Moonstone Core', description: 'x500M multiplier per level', icon: '🌕', baseCost: 5e33, costMultiplier: 2.5, level: 0, effect: 'multiplier', value: 5e8, maxLevel: 2000},
  ],
  olympus_mons: [
    { id: 'olympus_mons_hammer', name: 'Olympus Hammer', description: '+200AA click power per level', icon: '🔨', baseCost: 5e33, costMultiplier: 1.6, level: 0, effect: 'clickPower', value: 2e17, maxLevel: 2000},
    { id: 'olympus_mons_excavator', name: 'Olympus Mons Excavator', description: '+100AA crystals/sec', icon: '⚙️', baseCost: 1.5e34, costMultiplier: 1.6, level: 0, effect: 'autoRate', value: 1e17, maxLevel: 2000},
    { id: 'olympus_mons_resonance', name: 'Olympus Resonance', description: 'x1B multiplier per level', icon: '🎵', baseCost: 1e34, costMultiplier: 1.8, level: 0, effect: 'multiplier', value: 1e9, maxLevel: 2000},
    { id: 'olympus_mons_luck', name: 'Golden Fortune', description: '+0.1% golden chance per level', icon: '🍀', baseCost: 2.5e34, costMultiplier: 2.0, level: 0, effect: 'goldenChance', value: 0.001, maxLevel: 20 },
    { id: 'olympus_mons_ultimate', name: 'Mars Core', description: 'x2B multiplier per level', icon: '🌋', baseCost: 5e35, costMultiplier: 2.5, level: 0, effect: 'multiplier', value: 2e9, maxLevel: 2000},
  ],
  europa_ice: [
    { id: 'europa_ice_hammer', name: 'Europa Hammer', description: '+2AB click power per level', icon: '🔨', baseCost: 5e35, costMultiplier: 1.6, level: 0, effect: 'clickPower', value: 2e18, maxLevel: 2000},
    { id: 'europa_ice_excavator', name: 'Europa Ice Excavator', description: '+1AB crystals/sec', icon: '⚙️', baseCost: 1.5e36, costMultiplier: 1.6, level: 0, effect: 'autoRate', value: 1e18, maxLevel: 2000},
    { id: 'europa_ice_resonance', name: 'Europa Resonance', description: 'x5B multiplier per level', icon: '🎵', baseCost: 1e36, costMultiplier: 1.8, level: 0, effect: 'multiplier', value: 5e9, maxLevel: 2000},
    { id: 'europa_ice_luck', name: 'Critical Fortune', description: '+0.1% crit chance per level', icon: '🍀', baseCost: 2.5e36, costMultiplier: 2.0, level: 0, effect: 'critChance', value: 0.001, maxLevel: 25 },
    { id: 'europa_ice_ultimate', name: 'Ice Core', description: 'x10B multiplier per level', icon: '🧊', baseCost: 5e37, costMultiplier: 2.5, level: 0, effect: 'multiplier', value: 1e10, maxLevel: 2000},
  ],
  titan_mines: [
    { id: 'titan_mines_hammer', name: 'Titan Hammer', description: '+20AB click power per level', icon: '🔨', baseCost: 5e37, costMultiplier: 1.6, level: 0, effect: 'clickPower', value: 2e19, maxLevel: 2000},
    { id: 'titan_mines_excavator', name: 'Titan Mines Excavator', description: '+10AB crystals/sec', icon: '⚙️', baseCost: 1.5e38, costMultiplier: 1.6, level: 0, effect: 'autoRate', value: 1e19, maxLevel: 2000},
    { id: 'titan_mines_resonance', name: 'Titan Resonance', description: 'x20B multiplier per level', icon: '🎵', baseCost: 1e38, costMultiplier: 1.8, level: 0, effect: 'multiplier', value: 2e10, maxLevel: 2000},
    { id: 'titan_mines_luck', name: 'Golden Fortune', description: '+0.05% golden chance per level', icon: '🍀', baseCost: 2.5e38, costMultiplier: 2.0, level: 0, effect: 'goldenChance', value: 0.0005, maxLevel: 20 },
    { id: 'titan_mines_ultimate', name: 'Titan Core', description: 'x50B multiplier per level', icon: '🟠', baseCost: 5e39, costMultiplier: 2.5, level: 0, effect: 'multiplier', value: 5e10, maxLevel: 2000},
  ],
  saturn_rings: [
    { id: 'saturn_rings_hammer', name: 'Ring Hammer', description: '+200AB click power per level', icon: '🔨', baseCost: 5e39, costMultiplier: 1.6, level: 0, effect: 'clickPower', value: 2e20, maxLevel: 2000},
    { id: 'saturn_rings_excavator', name: 'Saturn Rings Excavator', description: '+100AB crystals/sec', icon: '⚙️', baseCost: 1.5e40, costMultiplier: 1.6, level: 0, effect: 'autoRate', value: 1e20, maxLevel: 2000},
    { id: 'saturn_rings_resonance', name: 'Ring Resonance', description: 'x100B multiplier per level', icon: '🎵', baseCost: 1e40, costMultiplier: 1.8, level: 0, effect: 'multiplier', value: 1e11, maxLevel: 2000},
    { id: 'saturn_rings_luck', name: 'Critical Fortune', description: '+0.05% crit chance per level', icon: '🍀', baseCost: 2.5e40, costMultiplier: 2.0, level: 0, effect: 'critChance', value: 0.0005, maxLevel: 25 },
    { id: 'saturn_rings_ultimate', name: 'Ring Lord', description: 'x200B multiplier per level', icon: '💍', baseCost: 5e41, costMultiplier: 2.5, level: 0, effect: 'multiplier', value: 2e11, maxLevel: 2000},
  ],
  deep_space: [
    { id: 'deep_space_hammer', name: 'Void Hammer', description: '+2AC click power per level', icon: '🔨', baseCost: 5e41, costMultiplier: 1.6, level: 0, effect: 'clickPower', value: 2e21, maxLevel: 2000},
    { id: 'deep_space_excavator', name: 'Deep Space Excavator', description: '+1AC crystals/sec', icon: '⚙️', baseCost: 1.5e42, costMultiplier: 1.6, level: 0, effect: 'autoRate', value: 1e21, maxLevel: 2000},
    { id: 'deep_space_resonance', name: 'Void Resonance', description: 'x500B multiplier per level', icon: '🎵', baseCost: 1e42, costMultiplier: 1.8, level: 0, effect: 'multiplier', value: 5e11, maxLevel: 2000},
    { id: 'deep_space_luck', name: 'Golden Fortune', description: '+0.05% golden chance per level', icon: '🍀', baseCost: 2.5e42, costMultiplier: 2.0, level: 0, effect: 'goldenChance', value: 0.0005, maxLevel: 20 },
    { id: 'deep_space_ultimate', name: 'Dark Matter Core', description: 'x1T multiplier per level', icon: '🖤', baseCost: 5e43, costMultiplier: 2.5, level: 0, effect: 'multiplier', value: 1e12, maxLevel: 2000},
  ],
  nebula_core: [
    { id: 'nebula_core_hammer', name: 'Nebula Hammer', description: '+20AC click power per level', icon: '🔨', baseCost: 5e43, costMultiplier: 1.6, level: 0, effect: 'clickPower', value: 2e22, maxLevel: 2000},
    { id: 'nebula_core_excavator', name: 'Nebula Core Excavator', description: '+10AC crystals/sec', icon: '⚙️', baseCost: 1.5e44, costMultiplier: 1.6, level: 0, effect: 'autoRate', value: 1e22, maxLevel: 2000},
    { id: 'nebula_core_resonance', name: 'Nebula Resonance', description: 'x2T multiplier per level', icon: '🎵', baseCost: 1e44, costMultiplier: 1.8, level: 0, effect: 'multiplier', value: 2e12, maxLevel: 2000},
    { id: 'nebula_core_luck', name: 'Critical Fortune', description: '+0.05% crit chance per level', icon: '🍀', baseCost: 2.5e44, costMultiplier: 2.0, level: 0, effect: 'critChance', value: 0.0005, maxLevel: 25 },
    { id: 'nebula_core_ultimate', name: 'Stellar Forge', description: 'x5T multiplier per level', icon: '🌈', baseCost: 5e45, costMultiplier: 2.5, level: 0, effect: 'multiplier', value: 5e12, maxLevel: 2000},
  ],
  neutron_star: [
    { id: 'neutron_star_hammer', name: 'Neutron Hammer', description: '+200AC click power per level', icon: '🔨', baseCost: 5e45, costMultiplier: 1.6, level: 0, effect: 'clickPower', value: 2e23, maxLevel: 2000},
    { id: 'neutron_star_excavator', name: 'Neutron Star Excavator', description: '+100AC crystals/sec', icon: '⚙️', baseCost: 1.5e46, costMultiplier: 1.6, level: 0, effect: 'autoRate', value: 1e23, maxLevel: 2000},
    { id: 'neutron_star_resonance', name: 'Neutron Resonance', description: 'x10T multiplier per level', icon: '🎵', baseCost: 1e46, costMultiplier: 1.8, level: 0, effect: 'multiplier', value: 1e13, maxLevel: 2000},
    { id: 'neutron_star_luck', name: 'Golden Fortune', description: '+0.03% golden chance per level', icon: '🍀', baseCost: 2.5e46, costMultiplier: 2.0, level: 0, effect: 'goldenChance', value: 0.0003, maxLevel: 20 },
    { id: 'neutron_star_ultimate', name: 'Neutronium Core', description: 'x20T multiplier per level', icon: '💫', baseCost: 5e47, costMultiplier: 2.5, level: 0, effect: 'multiplier', value: 2e13, maxLevel: 2000},
  ],
  singularity: [
    { id: 'singularity_hammer', name: 'Singularity Hammer', description: '+2AD click power per level', icon: '🔨', baseCost: 5e47, costMultiplier: 1.6, level: 0, effect: 'clickPower', value: 2e24, maxLevel: 2000},
    { id: 'singularity_excavator', name: 'Event Horizon Excavator', description: '+1AD crystals/sec', icon: '⚙️', baseCost: 5e48, costMultiplier: 1.6, level: 0, effect: 'autoRate', value: 1e24, maxLevel: 2000},
    { id: 'singularity_resonance', name: 'Singularity Resonance', description: 'x50T multiplier per level', icon: '🎵', baseCost: 5e48, costMultiplier: 1.8, level: 0, effect: 'multiplier', value: 5e13, maxLevel: 2000},
    { id: 'singularity_luck', name: 'Critical Fortune', description: '+0.03% crit chance per level', icon: '🍀', baseCost: 5e48, costMultiplier: 2.0, level: 0, effect: 'critChance', value: 0.0003, maxLevel: 25 },
    { id: 'singularity_ultimate', name: 'Infinity Shard', description: 'x100T multiplier per level', icon: '🕳️', baseCost: 5e49, costMultiplier: 2.5, level: 0, effect: 'multiplier', value: 1e14, maxLevel: 2000},
  ],
};

// All upgrade IDs belonging to the naica area (default upgrades)
const NAICA_UPGRADE_IDS = new Set(DEFAULT_UPGRADES.map(u => u.id));

// Helper to get upgrades for a specific area
export function getUpgradesForArea(areaId: string, allUpgrades: Upgrade[]): Upgrade[] {
  if (areaId === 'naica') return allUpgrades.filter(u => NAICA_UPGRADE_IDS.has(u.id));
  return allUpgrades.filter(u => u.id.startsWith(areaId + '_'));
}

const ACHIEVEMENT_DEFS = [
  { id: 'first_click', name: 'First Spark', description: 'Click the crystal for the first time', icon: '⚡' },
  { id: 'clicks_100', name: 'Dedicated Clicker', description: 'Click 100 times', icon: '👆' },
  { id: 'clicks_1000', name: 'Click Master', description: 'Click 1,000 times', icon: '🏆' },
  { id: 'clicks_10000', name: 'Click Legend', description: 'Click 10,000 times', icon: '👑' },
  { id: 'clicks_50000', name: 'Click God', description: 'Click 50,000 times', icon: '🌟' },
  { id: 'clicks_100k', name: 'Beyond Human', description: 'Click 100,000 times', icon: '🤯' },
  { id: 'clicks_500k', name: 'Click Dimension', description: 'Click 500,000 times', icon: '🌌' },
  { id: 'clicks_1m', name: 'Eternal Clicker', description: 'Click 1,000,000 times', icon: '♾️' },
  { id: 'crystals_100', name: 'Crystal Collector', description: 'Earn 100 total crystals', icon: '💎' },
  { id: 'crystals_1000', name: 'Crystal Hoarder', description: 'Earn 1,000 total crystals', icon: '💰' },
  { id: 'crystals_10000', name: 'Crystal Tycoon', description: 'Earn 10,000 total crystals', icon: '🏦' },
  { id: 'crystals_100000', name: 'Crystal Empire', description: 'Earn 100,000 total crystals', icon: '🏰' },
  { id: 'crystals_1m', name: 'Crystal God', description: 'Earn 1,000,000 total crystals', icon: '🌍' },
  { id: 'crystals_10m', name: 'Crystal Universe', description: 'Earn 10M total crystals', icon: '🪐' },
  { id: 'crystals_1b', name: 'Crystal Multiverse', description: 'Earn 1B total crystals', icon: '🌌' },
  { id: 'crystals_1t', name: 'Crystal Infinity', description: 'Earn 1T total crystals', icon: '🌀' },
  { id: 'upgrade_first', name: 'First Upgrade', description: 'Buy your first upgrade', icon: '⬆️' },
  { id: 'upgrade_10', name: 'Upgrade Enthusiast', description: 'Buy 10 total upgrades', icon: '🔧' },
  { id: 'upgrade_50', name: 'Upgrade Master', description: 'Buy 50 total upgrades', icon: '🛠️' },
  { id: 'upgrade_100', name: 'Upgrade Expert', description: 'Buy 100 total upgrades', icon: '🔧' },
  { id: 'upgrade_500', name: 'Upgrade Legend', description: 'Buy 500 total upgrades', icon: '⚙️' },
  { id: 'upgrade_1000', name: 'Upgrade God', description: 'Buy 1,000 total upgrades', icon: '🏗️' },
  { id: 'combo_5', name: 'Combo Starter', description: 'Reach a 5x combo', icon: '🔥' },
  { id: 'combo_10', name: 'Combo Master', description: 'Reach a 10x combo', icon: '💥' },
  { id: 'combo_25', name: 'Combo Legend', description: 'Reach a 25x combo', icon: '🌀' },
  { id: 'combo_50', name: 'Combo God', description: 'Reach a 50x combo', icon: '☄️' },
  { id: 'crit_first', name: 'Critical Thinker', description: 'Land your first critical hit', icon: '🎯' },
  { id: 'crit_100', name: 'Critical Master', description: 'Land 100 critical hits', icon: '💫' },
  { id: 'crit_500', name: 'Critical Legend', description: 'Land 500 critical hits', icon: '💥' },
  { id: 'crit_1000', name: 'Critical God', description: 'Land 1,000 critical hits', icon: '⚡' },
  { id: 'golden_first', name: 'Lucky Strike', description: 'Click a golden crystal', icon: '🥇' },
  { id: 'golden_10', name: 'Golden Touch', description: 'Click 10 golden crystals', icon: '✨' },
  { id: 'golden_50', name: 'Golden King', description: 'Click 50 golden crystals', icon: '👑' },
  { id: 'golden_100', name: 'Golden Emperor', description: 'Click 100 golden crystals', icon: '🏅' },
  { id: 'golden_500', name: 'Golden Deity', description: 'Click 500 golden crystals', icon: '🌟' },
  { id: 'prestige_1', name: 'Rebirth', description: 'Prestige for the first time', icon: '🔄' },
  { id: 'prestige_5', name: 'Experienced Soul', description: 'Prestige 5 times', icon: '🌈' },
  { id: 'prestige_10', name: 'Prestige Veteran', description: 'Prestige 10 times', icon: '🔮' },
  { id: 'prestige_25', name: 'Prestige Legend', description: 'Prestige 25 times', icon: '👑' },
  { id: 'prestige_50', name: 'Transcendent', description: 'Prestige 50 times', icon: '🌌' },
  { id: 'auto_10', name: 'Automated', description: 'Have 10+ auto crystals/sec', icon: '⚙️' },
  { id: 'auto_100', name: 'Factory Owner', description: 'Have 100+ auto crystals/sec', icon: '🏭' },
  { id: 'auto_500', name: 'Industrialist', description: 'Have 500+ auto crystals/sec', icon: '🏗️' },
  { id: 'auto_1000', name: 'Auto God', description: 'Have 1,000+ auto crystals/sec', icon: '🤖' },
  { id: 'speed_5', name: 'Speed Demon', description: 'Reach 5+ clicks per second', icon: '⚡' },
  { id: 'speed_10', name: 'Click Machine', description: 'Reach 10+ clicks per second', icon: '🤖' },
  { id: 'speed_15', name: 'Inhuman Speed', description: 'Reach 15+ clicks per second', icon: '💨' },
  { id: 'speed_20', name: 'Speed Lord', description: 'Reach 20+ clicks per second', icon: '🌪️' },
  { id: 'event_first', name: 'Eventful', description: 'Experience your first event', icon: '🎉' },
  { id: 'event_10', name: 'Event Veteran', description: 'Experience 10 events', icon: '🎊' },
  { id: 'event_25', name: 'Event Master', description: 'Experience 25 events', icon: '🎪' },
  { id: 'event_50', name: 'Event Lord', description: 'Experience 50 events', icon: '🎭' },
  { id: 'areas_3', name: 'World Traveler', description: 'Unlock 3 mine locations', icon: '✈️' },
  { id: 'areas_5', name: 'Globe Trotter', description: 'Unlock 5 mine locations', icon: '🌎' },
  { id: 'areas_10', name: 'Mining Mogul', description: 'Unlock 10 mine locations', icon: '🗺️' },
  { id: 'areas_15', name: 'Planetary Explorer', description: 'Unlock 15 mine locations', icon: '🚀' },
  { id: 'areas_all', name: 'Master of the Cosmos', description: 'Unlock all mine locations', icon: '🌌' },
  { id: 'multiplier_5', name: 'Power Surge', description: 'Reach a 5x multiplier', icon: '📈' },
  { id: 'multiplier_10', name: 'Multiplier King', description: 'Reach a 10x multiplier', icon: '🚀' },
  { id: 'multiplier_50', name: 'Exponential Growth', description: 'Reach a 50x multiplier', icon: '📈' },
  { id: 'multiplier_100', name: 'Multiplier God', description: 'Reach a 100x multiplier', icon: '💠' },
  { id: 'clickpower_10', name: 'Strong Arm', description: 'Reach 10+ click power', icon: '💪' },
  { id: 'clickpower_100', name: 'Crystal Crusher', description: 'Reach 100+ click power', icon: '🔨' },
  { id: 'clickpower_1000', name: 'Crystal Annihilator', description: 'Reach 1,000+ click power', icon: '💣' },
  { id: 'session_10k', name: 'Productive Session', description: 'Earn 10,000 crystals in one session', icon: '📊' },
  { id: 'session_1m', name: 'Epic Session', description: 'Earn 1M crystals in one session', icon: '🏆' },
  { id: 'session_1b', name: 'Legendary Session', description: 'Earn 1B crystals in one session', icon: '👑' },
  { id: 'prestige_points_10', name: 'Prestige Power', description: 'Accumulate 10+ prestige points', icon: '✨' },
  { id: 'prestige_points_50', name: 'Prestige Force', description: 'Accumulate 50+ prestige points', icon: '💫' },
  { id: 'prestige_points_100', name: 'Prestige Almighty', description: 'Accumulate 100+ prestige points', icon: '🌟' },
  { id: 'offline_earn', name: 'Idle Riches', description: 'Earn crystals while offline', icon: '😴' },
  { id: 'offline_big', name: 'Sleeping Millionaire', description: 'Earn 1M+ crystals while offline', icon: '🛌' },
  { id: 'reached_zz', name: 'Beyond Infinity', description: 'Reach ZZ crystals — the absolute limit', icon: '🌀' },
] as const;

function buildAchievementConditions(): Achievement[] {
  return ACHIEVEMENT_DEFS.map(a => ({
    ...a,
    unlocked: false,
    condition: (s: GameState) => {
      const ul = s.upgrades.reduce((sum, u) => sum + u.level, 0);
      const areaCount = s.unlockedAreas.length;
      switch (a.id) {
        case 'first_click': return s.totalClicks >= 1;
        case 'clicks_100': return s.totalClicks >= 100;
        case 'clicks_1000': return s.totalClicks >= 1000;
        case 'clicks_10000': return s.totalClicks >= 10000;
        case 'clicks_50000': return s.totalClicks >= 50000;
        case 'clicks_100k': return s.totalClicks >= 100000;
        case 'clicks_500k': return s.totalClicks >= 500000;
        case 'clicks_1m': return s.totalClicks >= 1000000;
        case 'crystals_100': return s.totalEarned >= 100;
        case 'crystals_1000': return s.totalEarned >= 1000;
        case 'crystals_10000': return s.totalEarned >= 10000;
        case 'crystals_100000': return s.totalEarned >= 100000;
        case 'crystals_1m': return s.totalEarned >= 1000000;
        case 'crystals_10m': return s.totalEarned >= 10000000;
        case 'crystals_1b': return s.totalEarned >= 1e9;
        case 'crystals_1t': return s.totalEarned >= 1e12;
        case 'upgrade_first': return ul >= 1;
        case 'upgrade_10': return ul >= 10;
        case 'upgrade_50': return ul >= 50;
        case 'upgrade_100': return ul >= 100;
        case 'upgrade_500': return ul >= 500;
        case 'upgrade_1000': return ul >= 1000;
        case 'combo_5': return s.maxCombo >= 5;
        case 'combo_10': return s.maxCombo >= 10;
        case 'combo_25': return s.maxCombo >= 25;
        case 'combo_50': return s.maxCombo >= 50;
        case 'crit_first': return s.totalCrits >= 1;
        case 'crit_100': return s.totalCrits >= 100;
        case 'crit_500': return s.totalCrits >= 500;
        case 'crit_1000': return s.totalCrits >= 1000;
        case 'golden_first': return s.goldenClicks >= 1;
        case 'golden_10': return s.goldenClicks >= 10;
        case 'golden_50': return s.goldenClicks >= 50;
        case 'golden_100': return s.goldenClicks >= 100;
        case 'golden_500': return s.goldenClicks >= 500;
        case 'prestige_1': return s.prestige >= 1;
        case 'prestige_5': return s.prestige >= 5;
        case 'prestige_10': return s.prestige >= 10;
        case 'prestige_25': return s.prestige >= 25;
        case 'prestige_50': return s.prestige >= 50;
        case 'auto_10': return s.autoRate >= 10;
        case 'auto_100': return s.autoRate >= 100;
        case 'auto_500': return s.autoRate >= 500;
        case 'auto_1000': return s.autoRate >= 1000;
        case 'speed_5': return s.clicksPerSecond >= 5;
        case 'speed_10': return s.clicksPerSecond >= 10;
        case 'speed_15': return s.clicksPerSecond >= 15;
        case 'speed_20': return s.clicksPerSecond >= 20;
        case 'event_first': return s.totalEvents >= 1;
        case 'event_10': return s.totalEvents >= 10;
        case 'event_25': return s.totalEvents >= 25;
        case 'event_50': return s.totalEvents >= 50;
        case 'areas_3': return areaCount >= 3;
        case 'areas_5': return areaCount >= 5;
        case 'areas_10': return areaCount >= 10;
        case 'areas_15': return areaCount >= 15;
        case 'areas_all': return areaCount >= AREAS.length;
        case 'multiplier_5': return s.multiplier >= 5;
        case 'multiplier_10': return s.multiplier >= 10;
        case 'multiplier_50': return s.multiplier >= 50;
        case 'multiplier_100': return s.multiplier >= 100;
        case 'clickpower_10': return s.clickPower >= 10;
        case 'clickpower_100': return s.clickPower >= 100;
        case 'clickpower_1000': return s.clickPower >= 1000;
        case 'session_10k': return s.sessionEarned >= 10000;
        case 'session_1m': return s.sessionEarned >= 1000000;
        case 'session_1b': return s.sessionEarned >= 1e9;
        case 'prestige_points_10': return s.prestigePoints >= 10;
        case 'prestige_points_50': return s.prestigePoints >= 50;
        case 'prestige_points_100': return s.prestigePoints >= 100;
        case 'offline_earn': return s.offlineEarned > 0;
        case 'offline_big': return s.offlineEarned >= 1000000;
        case 'reached_zz': return s.crystals >= 1e2040;
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
  currentArea: 'naica',
  unlockedAreas: ['naica'],
  upgrades: [
    ...DEFAULT_UPGRADES.map(u => ({ ...u })),
    ...Object.values(AREA_UPGRADES).flat().map(u => ({ ...u })),
  ],
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
    get().checkAchievements();
    get().checkAreaUnlocks();
    return true;
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
      upgrades: [
        ...DEFAULT_UPGRADES.map(u => ({ ...u })),
        ...Object.values(AREA_UPGRADES).flat().map(u => ({ ...u })),
      ],
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
      set({ currentNotification: next, notificationTimer: 30, achievementQueue: rest });
    }
  },

  updateClickSpeed: () => {
    const s = get(); const now = Date.now();
    const r = s.clickTimestamps.filter(t => now - t < 1000);
    set({ clickTimestamps: r, clicksPerSecond: r.length });
  },

  // Batched tick — all 100ms updates in a single setState for performance
  tick: () => {
    const s = get();
    const updates: Partial<GameState> = {};

    // Auto income
    if (s.autoRate > 0) {
      let rate = s.autoRate;
      const puBonus = s.activePowerUp?.effect === 'tripleAuto' ? s.activePowerUp.value : 1;
      const evBonus = s.activeEvent?.effect === 'doubleAuto' ? s.activeEvent.value : 1;
      rate *= puBonus * evBonus;
      const prestMult = 1 + s.prestigePoints * 0.1;
      const income = rate * prestMult * 0.1;
      updates.crystals = Math.round((s.crystals + income) * 100) / 100;
      updates.totalEarned = Math.round((s.totalEarned + income) * 100) / 100;
      updates.sessionEarned = Math.round((s.sessionEarned + income) * 100) / 100;
    }

    // Combo decay
    if (s.comboTimer > 0) {
      updates.comboTimer = s.comboTimer - 1;
      if (s.comboTimer <= 1) updates.combo = 0;
    }

    // Golden crystal
    if (s.goldenActive) {
      if (s.goldenTimer > 0) updates.goldenTimer = s.goldenTimer - 1;
      else { updates.goldenActive = false; updates.goldenTimer = 0; }
    } else {
      let chance = 0.001;
      if (s.activeEvent?.effect === 'tripleGolden') chance *= s.activeEvent.value;
      chance *= (s.goldenChance / 0.03);
      if (Math.random() < chance) {
        const bv = s.clickPower * s.multiplier * 10 * (1 + s.prestigePoints * 0.1);
        updates.goldenActive = true;
        updates.goldenTimer = 400;
        updates.goldenClickValue = Math.round(bv * 10) / 10;
      }
    }

    // Event timer
    if (s.activeEvent) {
      if (s.eventTimer > 0) updates.eventTimer = s.eventTimer - 1;
      else { updates.activeEvent = null; updates.eventTimer = 0; }
    } else if (s.totalClicks > 50 && Math.random() < 0.0003) {
      const t = EVENT_DEFS[Math.floor(Math.random() * EVENT_DEFS.length)];
      updates.activeEvent = { ...t, timer: t.duration };
      updates.eventTimer = t.duration;
      updates.totalEvents = s.totalEvents + 1;
      const q = [...s.achievementQueue];
      q.push({ id: `evt_${Date.now()}`, name: t.name, description: t.description, icon: t.icon, unlocked: true, unlockedAt: Date.now(), condition: () => false });
      updates.achievementQueue = q;
      // Schedule achievement check after this set
      setTimeout(() => get().checkAchievements(), 0);
    }

    // Power-up timer
    if (s.activePowerUp) {
      if (s.powerUpTimer > 0) updates.powerUpTimer = s.powerUpTimer - 1;
      else { updates.activePowerUp = null; updates.powerUpTimer = 0; }
    } else if (s.totalClicks > 20 && Math.random() < 0.0008) {
      const t = POWER_UP_DEFS[Math.floor(Math.random() * POWER_UP_DEFS.length)];
      if (t.effect === 'instantBonus') {
        const b = Math.round((s.autoRate * 30 + s.clickPower * 5) * 10) / 10;
        updates.crystals = Math.round(((updates.crystals ?? s.crystals) + b) * 100) / 100;
        updates.totalEarned = Math.round(((updates.totalEarned ?? s.totalEarned) + b) * 100) / 100;
        updates.crystalPulse = 2;
      } else {
        updates.activePowerUp = { ...t, timer: t.duration };
        updates.powerUpTimer = t.duration;
      }
    }

    // Notification timer
    if (s.currentNotification) {
      if (s.notificationTimer > 0) updates.notificationTimer = s.notificationTimer - 1;
      else { updates.currentNotification = null; updates.notificationTimer = 0; }
    } else if (s.achievementQueue.length > 0) {
      const [next, ...rest] = s.achievementQueue;
      updates.currentNotification = next;
      updates.notificationTimer = 30;
      updates.achievementQueue = rest;
    }

    // Click speed
    const now = Date.now();
    const r = s.clickTimestamps.filter(t => now - t < 1000);
    updates.clickTimestamps = r;
    updates.clicksPerSecond = r.length;

    // Screen shake / crystal pulse clear
    if (s.screenShake) setTimeout(() => set({ screenShake: false }), 150);
    if (s.crystalPulse > 0) setTimeout(() => set({ crystalPulse: 0 }), 200);

    if (Object.keys(updates).length > 0) set(updates);
  },

  switchArea: (areaId) => set({ currentArea: areaId }),

  checkAreaUnlocks: () => {
    const s = get();
    const newlyUnlocked = AREAS.filter(a => a.unlockAt > 0 && s.totalEarned >= a.unlockAt && !s.unlockedAreas.includes(a.id)).map(a => a.id);
    if (newlyUnlocked.length > 0) set({ unlockedAreas: [...s.unlockedAreas, ...newlyUnlocked] });
  },

  checkMilestones: () => {
    const s = get();
    get().checkAreaUnlocks();
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
      currentArea: 'naica', unlockedAreas: ['naica'],
      upgrades: [
        ...DEFAULT_UPGRADES.map(u => ({ ...u })),
        ...Object.values(AREA_UPGRADES).flat().map(u => ({ ...u })),
      ], achievements: buildAchievementConditions(),
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
    const allDefaults = [
      ...DEFAULT_UPGRADES,
      ...Object.values(AREA_UPGRADES).flat(),
    ];
    const upgrades = allDefaults.map(u => {
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
    const prestigeMult = 1 + (data.prestige as number || 0) * 0.1;
    const offlineEarned = stats.autoRate > 0 && elapsed >= 60000
      ? Math.round(stats.autoRate * prestigeMult * (Math.min(elapsed, 8 * 3600000) / 1000) * 0.5 * 100) / 100
      : 0;
    const currentArea = (data.currentArea as string) || 'naica';
    const unlockedAreas = (data.unlockedAreas as string[]) || ['naica'];
    set({
      crystals: (data.crystals as number) ?? 0, totalClicks: (data.totalClicks as number) ?? 0,
      totalEarned: (data.totalEarned as number) ?? 0, ...stats,
      prestige: (data.prestige as number) ?? 0, prestigePoints: (data.prestigePoints as number) ?? 0,
      goldenClicks: (data.goldenClicks as number) ?? 0, totalCrits: (data.totalCrits as number) ?? 0,
      maxCombo: (data.maxCombo as number) ?? 0, totalEvents: (data.totalEvents as number) ?? 0,
      upgrades, achievements, lastOnlineTime: Date.now(),
      offlineEarned, showOfflineBonus: offlineEarned > 0,
      currentArea, unlockedAreas,
    });
    get().checkAreaUnlocks();
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
      currentArea: s.currentArea, unlockedAreas: s.unlockedAreas,
    };
  },
}));
