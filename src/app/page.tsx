'use client';

import React, { useEffect, useCallback, useRef, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore, getUpgradeCost, getMaxBuyCount, getTotalCostN } from '@/stores';
import type { BuyQuantity, FloatingText, Upgrade } from '@/stores';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';

// ====== Sound Engine (Web Audio API) ======
const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || (window as unknown as Record<string, unknown>).webkitAudioContext)() : null;
let soundEnabled = true;

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', vol = 0.1) {
  if (!soundEnabled || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

export const sfx = {
  click: () => playTone(600 + Math.random() * 200, 0.08, 'sine', 0.06),
  crit: () => { playTone(800, 0.1, 'square', 0.08); playTone(1200, 0.15, 'sine', 0.06); },
  golden: () => { playTone(880, 0.1, 'sine', 0.08); setTimeout(() => playTone(1100, 0.1, 'sine', 0.08), 80); setTimeout(() => playTone(1320, 0.15, 'sine', 0.07), 160); },
  buy: () => playTone(400, 0.06, 'triangle', 0.05),
  achieve: () => { playTone(523, 0.1, 'sine', 0.07); setTimeout(() => playTone(659, 0.1, 'sine', 0.07), 100); setTimeout(() => playTone(784, 0.2, 'sine', 0.08), 200); },
  prestige: () => { [523,659,784,1047].forEach((f,i) => setTimeout(() => playTone(f, 0.2, 'sine', 0.08), i*100)); },
  error: () => playTone(200, 0.15, 'square', 0.04),
};

// ====== Settings State ======
let settingsState = { sound: true, particles: true, shake: true };
const settingsListeners = new Set<() => void>();
export function getSettings() { return settingsState; }
export function setSettings(partial: Partial<typeof settingsState>) {
  settingsState = { ...settingsState, ...partial };
  soundEnabled = settingsState.sound;
  settingsListeners.forEach(l => l());
}
export function useSettings() {
  const [, forceRender] = useState(0);
  useEffect(() => {
    const listener = () => forceRender(n => n + 1);
    settingsListeners.add(listener);
    return () => { settingsListeners.delete(listener); };
  }, []);
  return settingsState;
}

// ====== Formatters ======
function fmt(n: number): string {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  if (n >= 100) return Math.floor(n).toString();
  if (n >= 10) return n.toFixed(1);
  return n.toFixed(n % 1 === 0 ? 0 : 1);
}

function fmtTime(seconds: number): string {
  const s = Math.ceil(seconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `${sec}s`;
}

function fmtDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// ====== Floating text color ======
function floatColor(type: FloatingText['type']): string {
  switch (type) {
    case 'golden': return 'text-yellow-300';
    case 'crit': return 'text-red-400';
    case 'combo': return 'text-orange-400';
    case 'powerup': return 'text-cyan-300';
    case 'event': return 'text-purple-300';
    case 'offline': return 'text-emerald-300';
    case 'milestone': return 'text-amber-300';
    default: return 'text-purple-200';
  }
}

function floatLabel(type: FloatingText['type'], value: number): string {
  switch (type) {
    case 'crit': return `CRIT! +${fmt(value)}`;
    case 'golden': return `GOLDEN! +${fmt(value)}`;
    case 'combo': return `x${fmt(value)}`;
    case 'powerup': return `POWER UP!`;
    case 'event': return `EVENT!`;
    case 'offline': return `OFFLINE +${fmt(value)}`;
    case 'milestone': return `MILESTONE!`;
    default: return `+${fmt(value)}`;
  }
}

// ====== Ambient Particles Component ======
function AmbientParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.4 + 0.1,
    })), []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-purple-400/30"
          style={{ left: `${p.x}%`, width: p.size, height: p.size }}
          animate={{ y: ['100vh', '-10px'], opacity: [0, p.opacity, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  );
}

// ====== Floating Texts Component ======
function FloatingTexts() {
  const texts = useGameStore(useShallow(s => s.floatingTexts));
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      <AnimatePresence>
        {texts.map(t => (
          <motion.div
            key={t.id}
            className={`absolute text-lg font-bold ${floatColor(t.type)} drop-shadow-lg`}
            style={{ left: t.x, top: t.y }}
            initial={{ opacity: 1, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, y: -80, scale: t.type === 'crit' || t.type === 'golden' ? 1.5 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            {floatLabel(t.type, t.value)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ====== Ripple Effects ======
function RippleEffects() {
  const ripples = useGameStore(useShallow(s => s.ripples));
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      <AnimatePresence>
        {ripples.map(r => (
          <motion.div
            key={r.id}
            className={`absolute rounded-full border-2 ${
              r.type === 'crit' ? 'border-red-400' :
              r.type === 'golden' ? 'border-yellow-300' :
              r.type === 'combo' ? 'border-orange-400' :
              'border-purple-400/50'
            }`}
            style={{ left: r.x - 20, top: r.y - 20, width: 40, height: 40 }}
            initial={{ scale: 0.5, opacity: 0.8 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ====== Achievement Toast ======
function AchievementToast() {
  const notification = useGameStore(useShallow(s => s.currentNotification));
  if (!notification) return null;
  return (
    <motion.div
      className="fixed left-1/2 top-20 z-50 -translate-x-1/2"
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-900/90 to-purple-900/90 px-6 py-3 shadow-2xl shadow-amber-500/20 backdrop-blur-sm">
        <span className="text-2xl">{notification.icon}</span>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-300">Achievement Unlocked!</div>
          <div className="text-sm font-bold text-white">{notification.name}</div>
          <div className="text-xs text-amber-200/70">{notification.description}</div>
        </div>
      </div>
    </motion.div>
  );
}

// ====== Event Banner ======
function EventBanner() {
  const event = useGameStore(useShallow(s => s.activeEvent));
  const timer = useGameStore(useShallow(s => s.eventTimer));
  if (!event) return null;
  return (
    <motion.div
      className="fixed left-1/2 top-2 z-50 -translate-x-1/2"
      initial={{ opacity: 0, y: -30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex items-center gap-2 rounded-full border border-purple-500/40 bg-gradient-to-r from-purple-900/95 to-pink-900/95 px-5 py-2 shadow-xl shadow-purple-500/20 backdrop-blur-sm">
        <span className="text-lg">{event.icon}</span>
        <span className="text-sm font-bold text-purple-100">{event.name}</span>
        <span className="text-xs text-purple-300/80">{event.description}</span>
        <Badge variant="outline" className="border-purple-400/50 text-purple-200 text-xs">
          {fmtTime(timer / 10)}
        </Badge>
      </div>
    </motion.div>
  );
}

// ====== PowerUp Indicator ======
function PowerUpIndicator() {
  const pu = useGameStore(useShallow(s => s.activePowerUp));
  const timer = useGameStore(useShallow(s => s.powerUpTimer));
  if (!pu) return null;
  return (
    <motion.div
      className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 sm:bottom-28"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-900/90 px-4 py-1.5 shadow-lg shadow-cyan-500/20 backdrop-blur-sm">
        <span className="text-base">{pu.icon}</span>
        <span className="text-sm font-bold text-cyan-100">{pu.name}</span>
        <span className="text-xs text-cyan-300/80">{fmtTime(timer / 10)}</span>
      </div>
    </motion.div>
  );
}

// ====== Offline Earnings Modal ======
function OfflineEarningsModal() {
  const show = useGameStore(useShallow(s => s.showOfflineBonus));
  const earned = useGameStore(useShallow(s => s.offlineEarned));
  const claim = useGameStore(useShallow(s => s.claimOfflineEarnings));
  const dismiss = useGameStore(useShallow(s => s.dismissOfflineBonus));
  if (!show) return null;
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="mx-4 max-w-sm rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/95 to-purple-950/95 p-6 text-center shadow-2xl shadow-emerald-500/20"
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="mb-2 text-4xl">🌙</div>
        <h2 className="mb-1 text-xl font-bold text-emerald-300">Welcome Back!</h2>
        <p className="mb-4 text-sm text-emerald-200/70">Your miners were busy while you were away</p>
        <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-900/30 p-4">
          <div className="text-3xl font-black text-emerald-300">+{fmt(earned)}</div>
          <div className="text-xs text-emerald-400/60">crystals earned offline (50% efficiency)</div>
        </div>
        <div className="flex gap-3">
          <Button onClick={claim} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
            Claim Crystals!
          </Button>
          <Button onClick={dismiss} variant="outline" className="border-gray-600 text-gray-400 hover:text-gray-200">
            Dismiss
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ====== Buy Quantity Toggle ======
function BuyQuantityToggle() {
  const qty = useGameStore(useShallow(s => s.buyQuantity));
  const setQty = useGameStore(useShallow(s => s.setBuyQuantity));
  const options: { value: BuyQuantity; label: string }[] = [
    { value: 1, label: 'x1' },
    { value: 10, label: 'x10' },
    { value: 'max', label: 'xMax' },
  ];
  return (
    <div className="flex items-center gap-1 rounded-lg border border-purple-500/20 bg-purple-950/40 p-1">
      {options.map(o => (
        <button
          key={o.label}
          onClick={() => setQty(o.value)}
          className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
            qty === o.value
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
              : 'text-purple-300/60 hover:bg-purple-900/50 hover:text-purple-200'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ====== Upgrade Card ======
function UpgradeCard({ upgrade }: { upgrade: Upgrade }) {
  const crystals = useGameStore(useShallow(s => s.crystals));
  const buyQty = useGameStore(useShallow(s => s.buyQuantity));
  const buyUpgrade = useGameStore(useShallow(s => s.buyUpgrade));

  const maxed = upgrade.maxLevel != null && upgrade.level >= upgrade.maxLevel;

  let displayCost: number;
  let buyCount: number;
  let canAfford: boolean;

  if (maxed) {
    displayCost = 0;
    buyCount = 0;
    canAfford = false;
  } else if (buyQty === 1) {
    displayCost = getUpgradeCost(upgrade);
    buyCount = 1;
    canAfford = crystals >= displayCost;
  } else if (buyQty === 10) {
    buyCount = Math.min(10, upgrade.maxLevel ? upgrade.maxLevel - upgrade.level : 10);
    displayCost = buyCount > 0 ? getTotalCostN(upgrade, buyCount) : 0;
    canAfford = crystals >= displayCost && buyCount > 0;
  } else {
    buyCount = getMaxBuyCount(upgrade, crystals);
    displayCost = buyCount > 0 ? getTotalCostN(upgrade, buyCount) : 0;
    canAfford = buyCount > 0;
  }

  const handleBuy = () => {
    if (buyQty === 1) {
      buyUpgrade(upgrade.id);
    } else {
      const n = buyQty === 'max' ? buyCount : Math.min(10, upgrade.maxLevel ? upgrade.maxLevel - upgrade.level : 10);
      for (let i = 0; i < n; i++) {
        if (!buyUpgrade(upgrade.id)) break;
      }
    }
  };

  const nextCost = maxed ? 0 : getUpgradeCost(upgrade);
  const progressPct = upgrade.maxLevel ? (upgrade.level / upgrade.maxLevel) * 100 : undefined;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={`group relative cursor-pointer border transition-all duration-200 upgrade-card-hover ${
              maxed
                ? 'border-emerald-500/20 bg-emerald-950/20 shimmer-bg'
                : canAfford
                  ? 'border-purple-500/30 bg-purple-950/30 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/10 hover:bg-purple-950/40'
                  : 'border-gray-700/30 bg-gray-900/20 opacity-70'
            }`}
            onClick={handleBuy}
          >
            <CardContent className="flex items-center gap-3 p-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl ${
                maxed ? 'bg-emerald-900/40' : 'bg-purple-900/40'
              }`}>
                {upgrade.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm font-bold truncate ${maxed ? 'text-emerald-300' : 'text-purple-100'}`}>
                    {upgrade.name}
                  </span>
                  <Badge variant="outline" className={`shrink-0 text-xs ${
                    maxed ? 'border-emerald-500/40 text-emerald-300' : 'border-purple-500/40 text-purple-300'
                  }`}>
                    Lv.{upgrade.level}{upgrade.maxLevel ? `/${upgrade.maxLevel}` : ''}
                  </Badge>
                </div>
                <div className="mt-0.5 text-xs text-gray-400">{upgrade.description}</div>
                {progressPct != null && (
                  <Progress value={progressPct} className="mt-1.5 h-1 bg-gray-800 [&>div]:bg-emerald-500" />
                )}
                <div className="mt-1 flex items-center justify-between">
                  <span className={`text-xs font-semibold ${canAfford ? 'text-purple-300' : 'text-gray-500'}`}>
                    {maxed ? 'MAXED' : buyQty === 1 ? `Cost: ${fmt(nextCost)}` : `${buyCount > 0 ? `Buy ${buyCount} for ${fmt(displayCost)}` : 'Cannot afford'}`}
                  </span>
                  {!maxed && canAfford && (
                    <motion.span
                      className="text-xs font-bold text-purple-400"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      BUY
                    </motion.span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent side="left" className="border-purple-500/30 bg-purple-950/95 text-purple-100 max-w-xs">
          <div className="text-xs">
            <div className="font-bold">{upgrade.name}</div>
            <div>{upgrade.description}</div>
            {upgrade.maxLevel && <div>Max Level: {upgrade.maxLevel}</div>}
            <div>Next single cost: {fmt(nextCost)}</div>
            <div>Cost multiplier: x{upgrade.costMultiplier}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ====== Upgrades Panel ======
function UpgradesPanel() {
  const upgrades = useGameStore(useShallow(s => s.upgrades));
  const effectGroups = useMemo(() => ({
    click: upgrades.filter(u => u.effect === 'clickPower'),
    auto: upgrades.filter(u => u.effect === 'autoRate'),
    special: upgrades.filter(u => !['clickPower', 'autoRate'].includes(u.effect)),
  }), [upgrades]);

  return (
    <div className="space-y-4">
      <BuyQuantityToggle />
      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-purple-400">⚔️ Click Power</h3>
        <div className="space-y-2">
          {effectGroups.click.map(u => <UpgradeCard key={u.id} upgrade={u} />)}
        </div>
      </div>
      <Separator className="bg-purple-800/20" />
      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-cyan-400">⛏️ Auto Mining</h3>
        <div className="space-y-2">
          {effectGroups.auto.map(u => <UpgradeCard key={u.id} upgrade={u} />)}
        </div>
      </div>
      <Separator className="bg-purple-800/20" />
      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-400">🔮 Special</h3>
        <div className="space-y-2">
          {effectGroups.special.map(u => <UpgradeCard key={u.id} upgrade={u} />)}
        </div>
      </div>
    </div>
  );
}

// ====== Achievements Panel ======
function AchievementsPanel() {
  const achievements = useGameStore(useShallow(s => s.achievements));
  const unlocked = achievements.filter(a => a.unlocked).length;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-amber-300">🏆 Achievements</h3>
        <Badge variant="outline" className="border-amber-500/40 text-amber-300">
          {unlocked}/{achievements.length}
        </Badge>
      </div>
      <Progress value={(unlocked / achievements.length) * 100} className="h-2 bg-gray-800 [&>div]:bg-amber-500" />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {achievements.map(a => (
          <Card
            key={a.id}
            className={`border transition-all ${
              a.unlocked
                ? 'border-amber-500/30 bg-amber-950/20'
                : 'border-gray-800/30 bg-gray-900/10 opacity-50'
            }`}
          >
            <CardContent className="flex items-center gap-3 p-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg ${
                a.unlocked ? 'bg-amber-900/40' : 'bg-gray-800/40 grayscale'
              }`}>
                {a.icon}
              </div>
              <div className="min-w-0">
                <div className={`text-xs font-bold truncate ${a.unlocked ? 'text-amber-200' : 'text-gray-500'}`}>
                  {a.name}
                </div>
                <div className="text-xs text-gray-500 truncate">{a.description}</div>
              </div>
              {a.unlocked && (
                <Badge className="ml-auto shrink-0 bg-amber-600 text-white text-[10px]">✓</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ====== Stats Panel ======
function StatsPanel() {
  const stats = useGameStore(useShallow(s => ({
    crystals: s.crystals,
    totalClicks: s.totalClicks,
    totalEarned: s.totalEarned,
    clickPower: s.clickPower,
    autoRate: s.autoRate,
    multiplier: s.multiplier,
    prestige: s.prestige,
    prestigePoints: s.prestigePoints,
    maxCombo: s.maxCombo,
    totalCrits: s.totalCrits,
    goldenClicks: s.goldenClicks,
    totalEvents: s.totalEvents,
    critChance: s.critChance,
    goldenChance: s.goldenChance,
    sessionClicks: s.sessionClicks,
    sessionEarned: s.sessionEarned,
    sessionStartTime: s.sessionStartTime,
    clicksPerSecond: s.clicksPerSecond,
    totalUpgradeLevels: s.upgrades.reduce((sum, u) => sum + u.level, 0),
    unlockedAchievements: s.achievements.filter(a => a.unlocked).length,
  })));

  const sessionTime = Date.now() - stats.sessionStartTime;

  const statItems = [
    { label: 'Crystals', value: fmt(stats.crystals), color: 'text-purple-300', icon: '💎', border: 'border-l-purple-500/50' },
    { label: 'Total Earned', value: fmt(stats.totalEarned), color: 'text-purple-200', icon: '💰', border: 'border-l-purple-400/40' },
    { label: 'Total Clicks', value: stats.totalClicks.toLocaleString(), color: 'text-cyan-300', icon: '👆', border: 'border-l-cyan-500/40' },
    { label: 'Click Power', value: fmt(stats.clickPower), color: 'text-red-300', icon: '⚔️', border: 'border-l-red-500/40' },
    { label: 'Auto Rate', value: `${fmt(stats.autoRate)}/s`, color: 'text-green-300', icon: '⛏️', border: 'border-l-green-500/40' },
    { label: 'Multiplier', value: `x${stats.multiplier.toFixed(1)}`, color: 'text-amber-300', icon: '✨', border: 'border-l-amber-500/40' },
    { label: 'Prestige', value: `${stats.prestige} (${stats.prestigePoints} pts)`, color: 'text-pink-300', icon: '🔄', border: 'border-l-pink-500/40' },
    { label: 'Max Combo', value: `${stats.maxCombo}x`, color: 'text-orange-300', icon: '🔥', border: 'border-l-orange-500/40' },
    { label: 'Critical Hits', value: stats.totalCrits.toLocaleString(), color: 'text-red-400', icon: '💥', border: 'border-l-red-400/40' },
    { label: 'Crit Chance', value: `${(stats.critChance * 100).toFixed(1)}%`, color: 'text-red-300', icon: '🎯', border: 'border-l-red-500/30' },
    { label: 'Golden Clicks', value: stats.goldenClicks.toLocaleString(), color: 'text-yellow-300', icon: '🌟', border: 'border-l-yellow-500/40' },
    { label: 'Golden Chance', value: `${(stats.goldenChance * 100).toFixed(1)}%`, color: 'text-yellow-200', icon: '⭐', border: 'border-l-yellow-400/30' },
    { label: 'Events Done', value: stats.totalEvents.toString(), color: 'text-purple-400', icon: '🎉', border: 'border-l-purple-400/40' },
    { label: 'Click Speed', value: `${stats.clicksPerSecond} CPS`, color: 'text-cyan-400', icon: '⚡', border: 'border-l-cyan-400/40' },
    { label: 'Upgrade Lvl', value: stats.totalUpgradeLevels.toString(), color: 'text-blue-300', icon: '⬆️', border: 'border-l-blue-500/40' },
    { label: 'Achievements', value: `${stats.unlockedAchievements}/30`, color: 'text-amber-300', icon: '🏆', border: 'border-l-amber-500/40' },
    { label: 'Session Clicks', value: stats.sessionClicks.toLocaleString(), color: 'text-gray-300', icon: '🖱️', border: 'border-l-gray-500/30' },
    { label: 'Session Earned', value: fmt(stats.sessionEarned), color: 'text-emerald-300', icon: '💵', border: 'border-l-emerald-500/30' },
    { label: 'Session Time', value: fmtDuration(sessionTime), color: 'text-gray-400', icon: '⏱️', border: 'border-l-gray-500/30' },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-cyan-300">📊 Statistics</h3>
      <IncomeSparkline />
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {statItems.map(item => (
          <div key={item.label} className={`flex items-center gap-2 rounded-lg border-l-2 px-3 py-2 ${item.border} bg-gray-900/20`)}>
            <span className="text-sm w-5 text-center">{item.icon}</span>
            <span className="text-[11px] text-gray-500 flex-1">{item.label}</span>
            <span className={`text-xs font-bold ${item.color}`}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ====== Prestige Panel ======
function PrestigePanel() {
  const prestige = useGameStore(useShallow(s => s.prestige));
  const prestigePoints = useGameStore(useShallow(s => s.prestigePoints));
  const totalEarned = useGameStore(useShallow(s => s.totalEarned));
  const performPrestige = useGameStore(useShallow(s => s.performPrestige));
  const resetGame = useGameStore(useShallow(s => s.resetGame));

  const nextPrestigePoints = Math.floor(Math.sqrt(totalEarned / 1000));
  const canPrestige = totalEarned >= 1000;
  const prestigeBonus = `+${(prestigePoints * 10).toFixed(0)}% all income`;

  return (
    <div className="space-y-4">
      <Card className="border-purple-500/20 bg-gradient-to-b from-purple-950/40 to-pink-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-purple-200">🔄 Prestige</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-purple-500/20 bg-purple-900/20 p-3 text-center">
              <div className="text-2xl font-black text-purple-300">{prestige}</div>
              <div className="text-xs text-purple-400/60">Prestige Count</div>
            </div>
            <div className="rounded-xl border border-pink-500/20 bg-pink-900/20 p-3 text-center">
              <div className="text-2xl font-black text-pink-300">{prestigePoints}</div>
              <div className="text-xs text-pink-400/60">Prestige Points</div>
            </div>
          </div>
          <div className="rounded-lg border border-amber-500/20 bg-amber-900/10 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-300/80">Current Bonus</span>
              <span className="text-sm font-bold text-amber-300">{prestigeBonus}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-gray-400">Next Prestige Points</span>
              <span className="text-sm font-bold text-purple-300">+{nextPrestigePoints} pts</span>
            </div>
          </div>
          <div className="space-y-2 text-xs text-gray-400">
            <p>💎 Prestiging resets your crystals, clicks, upgrades, and progress.</p>
            <p>🌟 You earn Prestige Points based on total crystals earned: √(total/1000)</p>
            <p>🔥 Each Prestige Point gives +10% to all income (clicks + auto).</p>
            <p>📈 Requires at least 1,000 total earned crystals to prestige.</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={performPrestige}
              disabled={!canPrestige}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-white hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 disabled:from-gray-700 disabled:to-gray-700"
            >
              {canPrestige ? `🌟 Prestige (+${nextPrestigePoints} pts)` : 'Need 1,000 total earned'}
            </Button>
          </div>
          <Separator className="bg-gray-800/30" />
          <div className="text-center">
            <p className="mb-2 text-xs text-gray-500">Danger Zone</p>
            <Button
              onClick={resetGame}
              variant="outline"
              size="sm"
              className="border-red-500/30 text-red-400 hover:bg-red-950/30 hover:text-red-300"
            >
              🗑️ Reset All Progress
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ====== Income Sparkline ======
function IncomeSparkline() {
  const [history, setHistory] = useState<number[]>(() => Array(60).fill(0));
  const prevCrystals = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const crystals = useGameStore.getState().crystals;
      const income = Math.max(0, crystals - prevCrystals.current);
      prevCrystals.current = crystals;
      setHistory(h => [...h.slice(1), income]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const maxVal = Math.max(1, ...history);
  const width = 200;
  const height = 40;
  const points = history.map((v, i) => {
    const x = (i / (history.length - 1)) * width;
    const y = height - (v / maxVal) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  const areaPath = `M0,${height} L${points.split(' ').map((p, i) => {
    const [x, y] = p.split(',');
    return i === 0 ? `${x},${y}` : `L${x},${y}`;
  }).join(' ')} L${width},${height} Z`;

  return (
    <div className="rounded-lg border border-gray-800/30 bg-gray-900/20 p-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-gray-500">📈 Income/Sec (60s)</span>
        <span className="text-xs font-bold text-green-300">{fmt(history[history.length - 1])}/s</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-10" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(74, 222, 128)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(74, 222, 128)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#sparkGrad)" />
        <polyline points={points} fill="none" stroke="rgb(74, 222, 128)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ====== Settings Panel ======
function SettingsPanel() {
  const settings = useSettings();
  const resetGame = useGameStore(useShallow(s => s.resetGame));
  const [showConfirm, setShowConfirm] = useState(false);

  const toggle = (key: 'sound' | 'particles' | 'shake') => {
    setSettings({ [key]: !settings[key] });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-purple-300">⚙️ Settings</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-gray-800/30 bg-gray-900/20 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm">🔊</span>
            <div>
              <div className="text-xs font-medium text-gray-300">Sound Effects</div>
              <div className="text-[10px] text-gray-500">Click, crit, golden, achievement sounds</div>
            </div>
          </div>
          <Switch checked={settings.sound} onCheckedChange={() => toggle('sound')} />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-gray-800/30 bg-gray-900/20 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm">✨</span>
            <div>
              <div className="text-xs font-medium text-gray-300">Ambient Particles</div>
              <div className="text-[10px] text-gray-500">Floating particle effects in background</div>
            </div>
          </div>
          <Switch checked={settings.particles} onCheckedChange={() => toggle('particles')} />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-gray-800/30 bg-gray-900/20 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm">📳</span>
            <div>
              <div className="text-xs font-medium text-gray-300">Screen Shake</div>
              <div className="text-[10px] text-gray-500">Screen shake on crits and combos</div>
            </div>
          </div>
          <Switch checked={settings.shake} onCheckedChange={() => toggle('shake')} />
        </div>
        <Separator className="bg-gray-800/30" />
        <div className="space-y-2">
          <p className="text-xs text-gray-500">⌨️ <strong>Keyboard Shortcuts:</strong></p>
          <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-500">
            <span><kbd className="rounded border border-gray-700 bg-gray-800 px-1.5 py-0.5 text-gray-400">1</kbd>-<kbd className="rounded border border-gray-700 bg-gray-800 px-1.5 py-0.5 text-gray-400">9</kbd> Buy upgrades</span>
            <span><kbd className="rounded border border-gray-700 bg-gray-800 px-1.5 py-0.5 text-gray-400">Space</kbd> Click crystal</span>
          </div>
        </div>
        <Separator className="bg-gray-800/30" />
        <div className="text-center">
          {!showConfirm ? (
            <Button onClick={() => setShowConfirm(true)} variant="outline" size="sm" className="border-red-500/20 text-red-400/60 hover:text-red-300 hover:border-red-500/40">
              🗑️ Reset All Progress
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs text-red-400">Are you sure?</span>
              <Button onClick={() => { resetGame(); setShowConfirm(false); }} size="sm" className="bg-red-600 text-white hover:bg-red-500">Yes</Button>
              <Button onClick={() => setShowConfirm(false)} variant="outline" size="sm" className="border-gray-600 text-gray-400">No</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ====== Main Game Component ======
export default function CrystalClicker() {
  const crystalRef = useRef<HTMLDivElement>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const forceUpdate = useRef(0);

  // Game state selectors
  const crystals = useGameStore(useShallow(s => s.crystals));
  const clickPower = useGameStore(useShallow(s => s.clickPower));
  const autoRate = useGameStore(useShallow(s => s.autoRate));
  const multiplier = useGameStore(useShallow(s => s.multiplier));
  const combo = useGameStore(useShallow(s => s.combo));
  const comboTimer = useGameStore(useShallow(s => s.comboTimer));
  const prestigePoints = useGameStore(useShallow(s => s.prestigePoints));
  const clicksPerSecond = useGameStore(useShallow(s => s.clicksPerSecond));
  const goldenActive = useGameStore(useShallow(s => s.goldenActive));
  const goldenTimer = useGameStore(useShallow(s => s.goldenTimer));
  const goldenClickValue = useGameStore(useShallow(s => s.goldenClickValue));
  const screenShake = useGameStore(useShallow(s => s.screenShake));
  const crystalPulse = useGameStore(useShallow(s => s.crystalPulse));
  const activeTab = useGameStore(useShallow(s => s.activeTab));
  const sessionStartTime = useGameStore(useShallow(s => s.sessionStartTime));
  const celebratedMilestone = useGameStore(useShallow(s => {
    const celebrated = s.milestones.filter(m => m.celebrated);
    return celebrated.length > 0 ? celebrated[celebrated.length - 1] : null;
  }));
  const nextMilestone = useGameStore(useShallow(s => {
    return s.milestones.find(m => !m.celebrated) || null;
  }));
  const totalEarnedDisplay = useGameStore(useShallow(s => s.totalEarned));
  const [showMilestone, setShowMilestone] = useState(false);
  const lastShownMilestone = useRef<string | null>(null);

  useEffect(() => {
    if (celebratedMilestone && celebratedMilestone.label !== lastShownMilestone.current) {
      lastShownMilestone.current = celebratedMilestone.label;
      setShowMilestone(true);
      const t = setTimeout(() => setShowMilestone(false), 2000);
      return () => clearTimeout(t);
    }
  }, [celebratedMilestone]);

  const click = useGameStore(useShallow(s => s.click));
  const clickGolden = useGameStore(useShallow(s => s.clickGolden));
  const setActiveTab = useGameStore(useShallow(s => s.setActiveTab));
  const buyUpgrade = useGameStore(useShallow(s => s.buyUpgrade));
  const upgrades = useGameStore(useShallow(s => s.upgrades));
  const settings = useSettings();

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        const u = upgrades[num - 1];
        if (u) { buyUpgrade(u.id); sfx.buy(); }
      }
      if (e.code === 'Space') {
        e.preventDefault();
        const rect = crystalRef.current?.getBoundingClientRect();
        if (rect) click(rect.width / 2, rect.height / 2);
        sfx.click();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [upgrades, buyUpgrade, click]);

  // Derived values
  // We read activeEvent/activePowerUp directly in tick, so effectiveAuto only for display
  const effectiveAuto = useMemo(() => {
    return autoRate * multiplier * (1 + prestigePoints * 0.1);
  }, [autoRate, multiplier, prestigePoints]);

  const sessionTime = Date.now() - sessionStartTime;

  // Game tick (100ms) — handles auto income, combo decay, golden spawning, power-ups, events, notifications
  const tick = useCallback(() => {
    const s = useGameStore.getState();
    // Auto income
    if (s.autoRate > 0) {
      const evAuto = s.activeEvent?.effect === 'doubleAuto' ? s.activeEvent.value : 1;
      const puAuto = s.activePowerUp?.effect === 'tripleAuto' ? s.activePowerUp.value : 1;
      const income = s.autoRate * s.multiplier * (1 + s.prestigePoints * 0.1) * evAuto * puAuto * 0.1; // 100ms tick
      const rounded = Math.round(income * 100) / 100;
      if (rounded > 0) {
        useGameStore.setState(state => ({
          crystals: Math.round((state.crystals + rounded) * 100) / 100,
          totalEarned: Math.round((state.totalEarned + rounded) * 100) / 100,
          sessionEarned: Math.round((state.sessionEarned + rounded) * 100) / 100,
        }));
      }
    }
    s.updateCombo();
    s.updateGolden();
    s.updatePowerUp();
    s.updateEvent();
    s.updateNotification();
    s.updateClickSpeed();
    // Force re-render periodically for derived values
    if (Math.random() < 0.1) forceUpdate.current++;
  }, []);

  // Click handler with position
  const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const rect = crystalRef.current?.getBoundingClientRect();
    if (!rect) return;
    let x: number, y: number;
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      x = touch.clientX - rect.left;
      y = touch.clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    click(x, y);
    sfx.click();
  }, [click]);

  const handleGoldenClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const rect = crystalRef.current?.getBoundingClientRect();
    if (!rect) return;
    let x: number, y: number;
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      x = touch.clientX - rect.left;
      y = touch.clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    clickGolden(x, y);
    sfx.golden();
  }, [clickGolden]);

  // Load save on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/clicker/load');
        const json = await res.json();
        if (json.success && json.data) {
          useGameStore.getState().loadSave(json.data);
        }
      } catch (e) {
        console.error('Failed to load save:', e);
      }
    })();
  }, []);

  // Game tick
  useEffect(() => {
    tickRef.current = setInterval(tick, 100);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [tick]);

  // Auto-save every 15 seconds
  useEffect(() => {
    autoSaveTimer.current = setInterval(() => {
      const data = useGameStore.getState().getSaveData();
      fetch('/api/clicker/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch(() => {});
    }, 15000);
    return () => { if (autoSaveTimer.current) clearInterval(autoSaveTimer.current); };
  }, []);

  // Session timer updater (every second for display)
  const [, setTick] = useState(0);
  useEffect(() => {
    sessionTimerRef.current = setInterval(() => setTick(t => t + 1), 1000);
    return () => { if (sessionTimerRef.current) clearInterval(sessionTimerRef.current); };
  }, []);

  // Screen shake effect
  useEffect(() => {
    if (screenShake) {
      const timer = setTimeout(() => useGameStore.setState({ screenShake: false }), 300);
      return () => clearTimeout(timer);
    }
  }, [screenShake]);

  return (
    <TooltipProvider>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0a0a1a] via-[#0d0b2e] to-[#0a0a1a] text-white bg-grid-pattern">
        {settings.particles && <AmbientParticles />}
        <FloatingTexts />
        <RippleEffects />
        <EventBanner />
        <PowerUpIndicator />
        <AchievementToast />
        <OfflineEarningsModal />

        <main className="relative z-10 mx-auto flex max-w-7xl flex-col gap-4 p-4 lg:flex-row lg:gap-6 lg:p-6">
          {/* ====== Left: Crystal Area ====== */}
          <div className="flex flex-1 flex-col items-center">
            {/* Top Stats Bar */}
            <div className="mb-4 flex w-full max-w-md flex-wrap items-center justify-center gap-3">
              <div className="rounded-xl border border-purple-500/20 bg-purple-950/40 px-4 py-2 text-center shadow-lg shadow-purple-500/5">
                <div className="text-2xl font-black text-purple-200 sm:text-3xl">{fmt(crystals)}</div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-purple-400/60">💎 Crystals</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 rounded-lg border border-cyan-500/15 bg-cyan-950/30 px-3 py-1">
                  <span className="text-[10px] text-cyan-400/60">⚡ Power</span>
                  <span className="text-xs font-bold text-cyan-300">{fmt(clickPower)}</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-green-500/15 bg-green-950/30 px-3 py-1">
                  <span className="text-[10px] text-green-400/60">⛏️ Auto</span>
                  <span className="text-xs font-bold text-green-300">{fmt(effectiveAuto)}/s</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/15 bg-amber-950/30 px-3 py-1">
                  <span className="text-[10px] text-amber-400/60">✨ Mult</span>
                  <span className="text-xs font-bold text-amber-300">x{multiplier.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Crystal Click Area */}
            <div
              className={`relative ${screenShake && settings.shake ? 'animate-shake' : ''}`}
            >
              {/* Combo Ring */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                {combo > 0 && (
                  <motion.div
                    className="absolute rounded-full border-2 border-orange-500/40"
                    initial={{ width: 100, height: 100, opacity: 0.8 }}
                    animate={{
                      width: 100 + combo * 3,
                      height: 100 + combo * 3,
                      opacity: comboTimer / 60 * 0.6,
                    }}
                    transition={{ duration: 0.1 }}
                  />
                )}
              </div>

              {/* Golden Crystal Overlay */}
              {goldenActive && (
                <motion.div
                  className="absolute inset-0 z-20 flex cursor-pointer items-center justify-center"
                  onClick={handleGoldenClick}
                  onTouchStart={(e) => { e.preventDefault(); handleGoldenClick(e); }}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                >
                  <motion.div
                    className="relative"
                    animate={{
                      y: [0, -8, 0],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <div className="text-7xl drop-shadow-[0_0_20px_rgba(250,204,21,0.6)] sm:text-8xl">
                      ✨💎✨
                    </div>
                    <div className="mt-1 text-center text-sm font-bold text-yellow-300">
                      +{fmt(goldenClickValue)} 💎
                    </div>
                    <div className="text-center text-xs text-yellow-400/60">
                      {fmtTime(goldenTimer / 10)} remaining
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* Main Crystal Button */}
              <motion.div
                ref={crystalRef}
                className={`relative flex h-36 w-36 cursor-pointer items-center justify-center rounded-full sm:h-44 sm:w-44 ${
                  goldenActive ? 'pointer-events-none' : ''
                }`}
                style={{
                  background: crystalPulse > 0
                    ? `radial-gradient(circle, rgba(168,85,247,${0.3 + crystalPulse * 0.1}) 0%, rgba(88,28,135,${0.2 + crystalPulse * 0.05}) 50%, transparent 70%)`
                    : 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, rgba(88,28,135,0.1) 50%, transparent 70%)',
                }}
                onClick={handleClick}
                onTouchStart={(e) => { e.preventDefault(); handleClick(e); }}
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.03 }}
              >
                {/* Pulsing outer ring */}
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-full border border-purple-500/20"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="pointer-events-none absolute inset-[-8px] rounded-full border border-purple-500/10"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                />

                <motion.img
                  src="/crystal.png"
                  alt="Crystal"
                  className={`h-28 w-28 select-none sm:h-36 sm:w-36 crystal-glow ${
                    crystalPulse > 2 ? 'saturate-150' : ''
                  }`}
                  animate={crystalPulse > 0 ? {
                    scale: [1, 1 + crystalPulse * 0.03, 1],
                    rotate: [0, crystalPulse * 0.5, -crystalPulse * 0.5, 0],
                  } : {}}
                  transition={{ duration: 0.3 }}
                  draggable={false}
                />

                {/* Combo Display */}
                {combo > 1 && (
                  <motion.div
                    className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-xs font-black text-white shadow-lg sm:h-10 sm:w-10 sm:text-sm"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    {combo}x
                  </motion.div>
                )}
              </motion.div>

              {/* Click hint */}
              <motion.div
                className="mt-3 text-center text-xs text-gray-500"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Tap the crystal to mine!
              </motion.div>
            </div>

            {/* Session Info & CPS */}
            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="flex items-center gap-4 text-[10px] text-gray-600">
                <span>⏱️ {fmtDuration(sessionTime)}</span>
                {prestigePoints > 0 && (
                  <Badge variant="outline" className="border-pink-500/30 text-pink-400/70 text-[10px] px-2 py-0">
                    +{(prestigePoints * 10)}% prestige
                  </Badge>
                )}
                {clicksPerSecond > 0 && (
                  <span className="text-cyan-500/70">🔥 {clicksPerSecond} CPS</span>
                )}
              </div>
              {autoRate > 0 && (
                <div className="flex items-center gap-1.5 text-[10px] text-green-400/60">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400 auto-income-pulse" />
                  Earning {fmt(effectiveAuto)}/s automatically
                </div>
              )}
            </div>

            {/* Milestone celebration flash */}
            <AnimatePresence>
              {showMilestone && celebratedMilestone && (
                <motion.div
                  className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.3, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5 }}
                >
                  <div className="absolute inset-0 bg-amber-400/10" />
                  <motion.div
                    className="relative text-center"
                    initial={{ scale: 0.5, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 1.2, opacity: 0 }}
                    transition={{ duration: 1.2 }}
                  >
                    <div className="text-5xl">{celebratedMilestone.icon}</div>
                    <div className="text-lg font-black text-amber-300 drop-shadow-lg">{celebratedMilestone.label}</div>
                    <div className="text-xs text-amber-400/60">Milestone Reached!</div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ====== Right: Tabs Panel ====== */}
          <div className="w-full lg:w-[420px] xl:w-[460px]">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-purple-950/50 border border-purple-500/15">
                <TabsTrigger value="upgrades" className="text-xs data-[state=active]:bg-purple-600/80 data-[state=active]:text-white text-purple-300/60">
                  ⬆️ Upgrades
                </TabsTrigger>
                <TabsTrigger value="achievements" className="text-xs data-[state=active]:bg-amber-600/80 data-[state=active]:text-white text-amber-300/60">
                  🏆 Achieve
                </TabsTrigger>
                <TabsTrigger value="stats" className="text-xs data-[state=active]:bg-cyan-600/80 data-[state=active]:text-white text-cyan-300/60">
                  📊 Stats
                </TabsTrigger>
                <TabsTrigger value="prestige" className="text-xs data-[state=active]:bg-pink-600/80 data-[state=active]:text-white text-pink-300/60">
                  🔄 Prestige
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs data-[state=active]:bg-gray-600/80 data-[state=active]:text-white text-gray-400/60">
                  ⚙️ Settings
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="mt-3 h-[calc(100vh-180px)] max-h-[600px] lg:h-[calc(100vh-140px)]">
                <TabsContent value="upgrades" className="mt-0 pr-3">
                  <UpgradesPanel />
                </TabsContent>
                <TabsContent value="achievements" className="mt-0 pr-3">
                  <AchievementsPanel />
                </TabsContent>
                <TabsContent value="stats" className="mt-0 pr-3">
                  <StatsPanel />
                </TabsContent>
                <TabsContent value="prestige" className="mt-0 pr-3">
                  <PrestigePanel />
                </TabsContent>
                <TabsContent value="settings" className="mt-0 pr-3">
                  <SettingsPanel />
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        </main>

        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-purple-900/20 bg-[#0a0a1a]/90 px-4 py-2 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <p className="text-[10px] text-gray-600">
              Crystal Clicker v1.0
            </p>
            <div className="flex items-center gap-3 text-[10px] text-gray-600">
              <span className="flex items-center gap-1">
                <span className="inline-block h-1 w-1 rounded-full bg-green-500" />
                Auto-saves every 15s
              </span>
              <span>💜</span>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
