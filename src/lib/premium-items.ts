// ====== Premium Shop Items ======
// These are permanent, one-time purchases that provide lasting bonuses.

export interface PremiumItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number; // price in USD (display only)
  category: 'efficiency' | 'golden' | 'prestige' | 'combat' | 'qol';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  perk: string; // machine-readable perk identifier
  perkDescription: string; // what the perk actually does
  featured?: boolean; // show as featured/first
}

export const PREMIUM_ITEMS: PremiumItem[] = [
  // ====== EFFICIENCY ======
  {
    id: 'auto_save_pro',
    name: 'Auto-Save Pro',
    description: 'Never lose progress again. Auto-saves every 30 seconds.',
    icon: '💾',
    price: 0.99,
    category: 'qol',
    rarity: 'common',
    perk: 'auto_save_30s',
    perkDescription: 'Auto-saves every 30s instead of manual only',
  },
  {
    id: 'offline_master',
    name: 'Offline Master',
    description: 'Earn more while away. Better efficiency and longer cap.',
    icon: '🌙',
    price: 1.99,
    category: 'efficiency',
    rarity: 'rare',
    perk: 'offline_boost',
    perkDescription: '75% offline efficiency (was 50%), 16hr cap (was 8hr)',
  },
  {
    id: 'double_daily',
    name: 'Double Daily',
    description: 'Your daily login rewards are doubled forever.',
    icon: '📅',
    price: 1.99,
    category: 'efficiency',
    rarity: 'rare',
    perk: 'double_daily_reward',
    perkDescription: '2x daily reward crystals & prestige points',
    featured: true,
  },

  // ====== GOLDEN ======
  {
    id: 'golden_aura',
    name: 'Golden Aura',
    description: 'A permanent glow that attracts more golden crystals.',
    icon: '✨',
    price: 2.99,
    category: 'golden',
    rarity: 'epic',
    perk: 'golden_chance_5',
    perkDescription: '+5% permanent golden crystal spawn chance',
    featured: true,
  },
  {
    id: 'auto_golden',
    name: 'Auto-Golden',
    description: 'Golden crystals auto-collect after 15s. Still clickable for 2x bonus.',
    icon: '🧲',
    price: 4.99,
    category: 'golden',
    rarity: 'legendary',
    perk: 'auto_collect_golden',
    perkDescription: 'Golden auto-collects after 15s (click for 2x bonus)',
  },
  {
    id: 'golden_power',
    name: 'Golden Power',
    description: 'Golden crystals are worth even more.',
    icon: '🌟',
    price: 2.49,
    category: 'golden',
    rarity: 'epic',
    perk: 'golden_value_2x',
    perkDescription: 'Golden crystal base bonus increased to 200x (was 100x)',
  },

  // ====== PRESTIGE ======
  {
    id: 'prestige_champion',
    name: 'Prestige Champion',
    description: 'Gain more prestige points with each reset.',
    icon: '👑',
    price: 3.99,
    category: 'prestige',
    rarity: 'epic',
    perk: 'prestige_gain_25',
    perkDescription: '+25% prestige points on every prestige reset',
    featured: true,
  },
  {
    id: 'prestige_start',
    name: 'Prestige Headstart',
    description: 'Start each prestige with a bonus multiplier.',
    icon: '🚀',
    price: 4.99,
    category: 'prestige',
    rarity: 'legendary',
    perk: 'prestige_start_mult',
    perkDescription: '+0.5x multiplier per prestige level on reset',
  },

  // ====== COMBAT ======
  {
    id: 'combo_king',
    name: 'Combo King',
    description: 'Your combos last much longer.',
    icon: '🔥',
    price: 1.49,
    category: 'combat',
    rarity: 'rare',
    perk: 'combo_timer_2x',
    perkDescription: 'Combo window lasts 2x longer (3s → 6s)',
  },
  {
    id: 'crit_master',
    name: 'Crit Master',
    description: 'Permanently sharper critical hits.',
    icon: '💎',
    price: 2.49,
    category: 'combat',
    rarity: 'epic',
    perk: 'crit_chance_5',
    perkDescription: '+5% permanent critical hit chance',
  },
  {
    id: 'crit_power',
    name: 'Devastating Crits',
    description: 'When you crit, it hits harder.',
    icon: '⚡',
    price: 2.99,
    category: 'combat',
    rarity: 'epic',
    perk: 'crit_mult_1x',
    perkDescription: '+1x crit multiplier (total 6x instead of 5x)',
  },

  // ====== QOL ======
  {
    id: 'click_skin_neon',
    name: 'Neon Click Effect',
    description: 'Upgraded neon particle effects on every click.',
    icon: '🎨',
    price: 0.99,
    category: 'qol',
    rarity: 'common',
    perk: 'neon_click_fx',
    perkDescription: 'Enhanced visual click effects',
  },
  {
    id: 'floating_particles',
    name: 'Ambient Particles',
    description: 'Beautiful ambient crystal particles float around the mine.',
    icon: '💫',
    price: 0.99,
    category: 'qol',
    rarity: 'common',
    perk: 'ambient_particles',
    perkDescription: 'Floating ambient particles in the background',
  },
  {
    id: 'sound_pack',
    name: 'Premium Sound Pack',
    description: 'Enhanced sound effects for clicks, purchases, and events.',
    icon: '🔊',
    price: 1.49,
    category: 'qol',
    rarity: 'rare',
    perk: 'premium_sounds',
    perkDescription: 'Enhanced sound effects throughout the game',
  },
  {
    id: 'stats_pro',
    name: 'Stats Dashboard Pro',
    description: 'Detailed statistics, charts, and session analytics.',
    icon: '📊',
    price: 1.99,
    category: 'qol',
    rarity: 'rare',
    perk: 'pro_stats',
    perkDescription: 'Extended stats tab with detailed analytics',
  },
];

export const PREMIUM_PERKS = PREMIUM_ITEMS.map(item => ({
  itemId: item.id,
  perk: item.perk,
}));

export const RARITY_COLORS: Record<string, { bg: string; border: string; text: string; glow: string; label: string }> = {
  common: { bg: 'bg-gray-700/40', border: 'border-gray-600/50', text: 'text-gray-300', glow: '', label: 'Common' },
  rare: { bg: 'bg-blue-900/30', border: 'border-blue-500/40', text: 'text-blue-300', glow: 'shadow-blue-500/20 shadow-lg', label: 'Rare' },
  epic: { bg: 'bg-purple-900/30', border: 'border-purple-500/40', text: 'text-purple-300', glow: 'shadow-purple-500/20 shadow-lg', label: 'Epic' },
  legendary: { bg: 'bg-amber-900/30', border: 'border-amber-400/50', text: 'text-amber-300', glow: 'shadow-amber-500/30 shadow-lg', label: 'Legendary' },
};

export function getPremiumItemById(id: string): PremiumItem | undefined {
  return PREMIUM_ITEMS.find(i => i.id === id);
}

export function getPremiumItemsByCategory(category: string): PremiumItem[] {
  return PREMIUM_ITEMS.filter(i => i.category === category);
}

export function getFeaturedItems(): PremiumItem[] {
  return PREMIUM_ITEMS.filter(i => i.featured);
}