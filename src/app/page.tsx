'use client';

import { useEffect, useCallback, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, getUpgradeCost } from '@/stores/gameStore';
import type { Upgrade, FloatingText, Achievement } from '@/stores/gameStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sparkles, Trophy, BarChart3, RotateCcw, Zap, MousePointerClick, Coins,
  Flame, Star, Crown, Save, RotateCw, Target, Shield, Gem, TrendingUp,
  Clock, Crosshair, Gauge,
} from 'lucide-react';

function formatNumber(n: number): string {
  if (n >= 1e15) return (n / 1e15).toFixed(2) + 'Q';
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  if (n >= 100) return Math.floor(n).toString();
  if (n >= 10) return n.toFixed(1);
  return n.toFixed(2);
}

// ====== Ambient Background Particles ======
function AmbientParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      duration: 15 + Math.random() * 25,
      delay: Math.random() * 10,
      opacity: 0.1 + Math.random() * 0.3,
    })),
  []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-purple-400/30"
          style={{
            width: p.size, height: p.size,
            left: `${p.x}%`, top: `${p.y}%`,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.sin(p.id) * 20, 0],
            opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.5],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ====== Achievement Toast Notification ======
function AchievementToast({ achievement }: { achievement: Achievement }) {
  return (
    <motion.div
      className="fixed left-1/2 top-4 z-[100] -translate-x-1/2"
      initial={{ opacity: 0, y: -80, scale: 0.5 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -40, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="flex items-center gap-3 rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-950/90 to-yellow-950/90 px-5 py-3 shadow-[0_0_30px_rgba(245,158,11,0.3)] backdrop-blur-md">
        <motion.div
          className="text-3xl"
          animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
        >
          {achievement.icon}
        </motion.div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-amber-400">Achievement Unlocked!</p>
          <p className="text-sm font-bold text-amber-100">{achievement.name}</p>
          <p className="text-xs text-amber-300/70">{achievement.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ====== Floating Text Component ======
function FloatingTextParticle({ text }: { text: FloatingText }) {
  const config = {
    normal: { color: 'text-purple-300', shadow: 'drop-shadow-[0_0_6px_rgba(196,181,253,0.6)]', prefix: '' },
    golden: { color: 'text-amber-300', shadow: 'drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]', prefix: '🌟 ' },
    combo: { color: 'text-orange-400', shadow: 'drop-shadow-[0_0_8px_rgba(251,146,60,0.7)]', prefix: '🔥 ' },
    crit: { color: 'text-red-400', shadow: 'drop-shadow-[0_0_12px_rgba(248,113,113,0.9)]', prefix: '💥 CRIT! ' },
    powerup: { color: 'text-emerald-400', shadow: 'drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]', prefix: '⬆️ ' },
  }[text.type];

  return (
    <motion.div
      key={text.id}
      className={`pointer-events-none fixed z-50 text-lg font-black select-none ${config.color} ${config.shadow}`}
      initial={{ opacity: 1, y: 0, scale: text.type === 'crit' ? 0.3 : 0.5 }}
      animate={{ opacity: 0, y: -100, scale: text.type === 'crit' ? 1.5 : 1.2, rotate: text.type === 'crit' ? [0, -5, 5, 0] : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      style={{ left: text.x, top: text.y }}
    >
      {config.prefix}+{formatNumber(text.value)}
    </motion.div>
  );
}

// ====== Particle Burst on Click ======
function ClickParticles({ x, y, type }: { x: number; y: number; type: FloatingText['type'] }) {
  const count = type === 'crit' ? 16 : type === 'golden' ? 12 : type === 'combo' ? 8 : 6;
  const colorClass = type === 'crit'
    ? 'bg-red-400'
    : type === 'golden'
      ? 'bg-amber-400'
      : type === 'combo'
        ? 'bg-orange-400'
        : 'bg-purple-400';

  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      angle: (i * 360) / count + (Math.random() - 0.5) * 40,
      distance: 30 + Math.random() * 80,
      size: 2 + Math.random() * 5,
    })),
  [count],
  );

  return (
    <div className="pointer-events-none fixed z-40" style={{ left: x, top: y }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full ${colorClass}`}
          style={{ width: p.size, height: p.size }}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{
            opacity: 0,
            x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
            y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
            scale: 0,
          }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

// ====== Golden Crystal (floating entity) ======
function GoldenCrystalEntity() {
  const { goldenActive, goldenTimer, goldenClickValue, clickGolden } = useGameStore();

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    clickGolden(rect.left + rect.width / 2, rect.top);
  }, [clickGolden]);

  return (
    <AnimatePresence>
      {goldenActive && (
        <motion.button
          onClick={handleClick}
          className="absolute z-20 cursor-pointer rounded-full border-2 border-amber-400/50 shadow-[0_0_40px_rgba(251,191,36,0.6)]"
          style={{ top: '15%', right: '10%' }}
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{
            opacity: 1, scale: [1, 1.1, 1], rotate: [0, 5, -5, 0],
            y: [0, -10, 0],
          }}
          exit={{ opacity: 0, scale: 0, rotate: 180 }}
          transition={{
            opacity: { duration: 0.3 },
            scale: { repeat: Infinity, duration: 1.5 },
            rotate: { repeat: Infinity, duration: 2 },
            y: { repeat: Infinity, duration: 1.2 },
          }}
          aria-label="Click the golden crystal for bonus!"
        >
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 sm:h-20 sm:w-20">
            <motion.span
              className="text-3xl sm:text-4xl drop-shadow-lg"
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            >
              🌟
            </motion.span>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-900/80 px-2 py-0.5 text-[10px] font-bold text-amber-200 shadow">
              +{formatNumber(goldenClickValue)}
            </div>
          </div>
          {/* Timer ring */}
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(251,191,36,0.3)" strokeWidth="2" />
            <circle
              cx="50" cy="50" r="48" fill="none" stroke="#fbbf24" strokeWidth="2.5"
              strokeLinecap="round"
              style={{
                strokeDasharray: `${2 * Math.PI * 48}`,
                strokeDashoffset: `${2 * Math.PI * 48 * (1 - goldenTimer / 400)}`,
                transition: 'stroke-dashoffset 0.1s linear',
              }}
            />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ====== Main Crystal Button ======
function CrystalButton() {
  const { click, combo, comboTimer, crystalPulse, screenShake, activePowerUp, powerUpTimer } = useGameStore();
  const [clickEffects, setClickEffects] = useState<{ x: number; y: number; id: number; type: FloatingText['type'] }[]>([]);
  const [isPressed, setIsPressed] = useState(false);
  const clickIdRef = useState(() => ({ current: 0 }))[0];

  const handleClick = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    const state = useGameStore.getState();
    const isCrit = Math.random() < state.critChance;

    click(x, y);

    const id = ++clickIdRef.current;
    const type: FloatingText['type'] = isCrit ? 'crit' : state.combo > 1 ? 'combo' : 'normal';
    setClickEffects((prev) => [...prev.slice(-8), { x, y, id, type }]);
    setTimeout(() => setClickEffects((prev) => prev.filter((p) => p.id !== id)), 800);

    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 80);
  }, [click]);

  const glowColor = activePowerUp?.effect === 'doubleClick'
    ? 'shadow-[0_0_50px_rgba(16,185,129,0.5),0_0_100px_rgba(16,185,129,0.3)]'
    : 'shadow-[0_0_50px_rgba(168,85,247,0.5),0_0_100px_rgba(168,85,247,0.3)]';

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="absolute h-72 w-72 rounded-full border border-purple-500/10 sm:h-80 sm:w-80 lg:h-96 lg:w-96"
          animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute h-64 w-64 rounded-full border border-fuchsia-500/10 sm:h-72 sm:w-72 lg:h-84 lg:w-84"
          animate={{ scale: [1.05, 1, 1.05], opacity: [0.2, 0.5, 0.2] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', delay: 0.5 }}
        />
      </div>

      {/* Combo Timer Ring */}
      <div className="absolute">
        <svg width="220" height="220" className="-rotate-90 sm:w-[240px] sm:h-[240px] lg:w-[260px] lg:h-[260px]">
          <circle cx="110" cy="110" r="105" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/5" />
          {combo > 0 && (
            <circle cx="110" cy="110" r="105" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" className="text-orange-500"
              style={{
                strokeDasharray: `${2 * Math.PI * 105}`,
                strokeDashoffset: `${2 * Math.PI * 105 * (1 - comboTimer / 60)}`,
                transition: 'stroke-dashoffset 0.1s linear',
              }}
            />
          )}
        </svg>
      </div>

      {/* Click Particles */}
      <AnimatePresence>
        {clickEffects.map((pos) => (
          <ClickParticles key={pos.id} x={pos.x} y={pos.y} type={pos.type} />
        ))}
      </AnimatePresence>

      {/* Crystal Button */}
      <motion.button
        onClick={handleClick}
        className={`relative z-10 flex h-44 w-44 cursor-pointer items-center justify-center rounded-full transition-shadow duration-150 sm:h-52 sm:w-52 lg:h-60 lg:w-60 ${glowColor} ${screenShake ? 'animate-shake' : ''}`}
        animate={{ scale: isPressed ? 0.88 : crystalPulse > 0 ? 1 + crystalPulse * 0.04 : 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 12 }}
        whileHover={{ scale: 1.06 }}
        aria-label="Click the crystal to earn crystals"
      >
        <div className="relative h-full w-full overflow-hidden rounded-full">
          {/* Background gradient */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 via-violet-600 to-fuchsia-700" />
          {/* Inner highlight */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-white/20" />
          {/* Crystal image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.img
              src="/crystal.png" alt="Magic Crystal"
              className="h-28 w-28 object-contain drop-shadow-2xl sm:h-36 sm:w-36 lg:h-44 lg:w-44"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              draggable={false}
            />
          </div>
          {/* Power-up overlay */}
          <AnimatePresence>
            {activePowerUp && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center rounded-full bg-emerald-500/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                exit={{ opacity: 0 }}
                transition={{ opacity: { repeat: Infinity, duration: 1 } }}
              >
                <span className="text-4xl">{activePowerUp.icon}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>

      {/* Combo indicator */}
      <AnimatePresence>
        {combo > 1 && (
          <motion.div className="absolute -right-1 -top-2 sm:-right-3 sm:-top-3" initial={{ opacity: 0, scale: 0, x: 20 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0 }}>
            <Badge className="border-0 bg-gradient-to-r from-orange-500 to-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg sm:text-sm">
              <Flame className="mr-1 h-3 w-3" />{combo}x
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Golden Crystal floating entity */}
      <GoldenCrystalEntity />
    </div>
  );
}

// ====== Upgrade Card ======
function UpgradeCard({ upgrade }: { upgrade: Upgrade }) {
  const crystals = useGameStore((s) => s.crystals);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);
  const cost = getUpgradeCost(upgrade);
  const canAfford = crystals >= cost;
  const isMaxed = upgrade.maxLevel ? upgrade.level >= upgrade.maxLevel : false;

  const effectColor = {
    clickPower: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    autoRate: 'text-green-400 bg-green-400/10 border-green-400/20',
    multiplier: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
    goldenChance: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    critChance: 'text-red-400 bg-red-400/10 border-red-400/20',
  }[upgrade.effect];

  return (
    <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}>
      <Card className={`border transition-all duration-200 ${canAfford && !isMaxed
        ? 'border-purple-500/40 bg-gradient-to-r from-purple-950/40 to-fuchsia-950/20 hover:border-purple-400/60 hover:from-purple-950/60 hover:to-fuchsia-950/30'
        : 'border-white/5 bg-white/[0.02]'}`}>
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-xl shadow-inner">
              {upgrade.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="truncate text-sm font-semibold text-foreground/90">{upgrade.name}</h4>
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="shrink-0 text-[10px] font-mono">
                    Lv.{upgrade.level}
                  </Badge>
                  <span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-semibold ${effectColor}`}>
                    {upgrade.effect === 'clickPower' ? 'ATK' : upgrade.effect === 'autoRate' ? 'AUTO' : upgrade.effect === 'multiplier' ? 'MULT' : upgrade.effect === 'goldenChance' ? 'GLD' : 'CRT'}
                  </span>
                </div>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground/70">{upgrade.description}</p>
              <div className="mt-2 flex items-center justify-between">
                <Button
                  size="sm" disabled={!canAfford || isMaxed} onClick={() => buyUpgrade(upgrade.id)}
                  className={`h-7 text-xs font-semibold ${canAfford && !isMaxed
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)] hover:from-purple-500 hover:to-fuchsia-500'
                    : ''}`}
                >
                  <Coins className="mr-1 h-3 w-3" />
                  {isMaxed ? 'MAXED' : formatNumber(cost)}
                </Button>
                {upgrade.maxLevel && (
                  <span className="text-[10px] text-muted-foreground">{upgrade.level}/{upgrade.maxLevel}</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ====== Achievement Card ======
function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <motion.div whileHover={{ scale: 1.01 }} className={achievement.unlocked ? '' : 'opacity-40 grayscale'}>
      <Card className={`border transition-all duration-200 ${achievement.unlocked
        ? 'border-amber-500/40 bg-gradient-to-r from-amber-950/30 to-yellow-950/10'
        : 'border-white/5 bg-white/[0.02]'}`}>
        <CardContent className="flex items-center gap-3 p-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl ${achievement.unlocked
            ? 'bg-amber-500/20 shadow-[0_0_16px_rgba(245,158,11,0.25)]'
            : 'bg-white/5'}`}>
            {achievement.unlocked ? achievement.icon : '🔒'}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-semibold">{achievement.name}</h4>
            <p className="text-xs text-muted-foreground/70">{achievement.description}</p>
          </div>
          {achievement.unlocked && <Star className="h-4 w-4 shrink-0 text-amber-400 fill-amber-400" />}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ====== Stats Panel ======
function StatsPanel() {
  const s = useGameStore((s) => ({
    totalClicks: s.totalClicks, totalEarned: s.totalEarned, clickPower: s.clickPower,
    autoRate: s.autoRate, multiplier: s.multiplier, prestige: s.prestige,
    prestigePoints: s.prestigePoints, maxCombo: s.maxCombo, goldenClicks: s.goldenClicks,
    totalCrits: s.totalCrits, clicksPerSecond: s.clicksPerSecond, critChance: s.critChance,
    achievements: s.achievements.filter((a) => a.unlocked).length,
    totalAchievements: s.achievements.length,
    upgrades: s.upgrades.reduce((sum, u) => sum + u.level, 0),
  }));

  const items = [
    { icon: MousePointerClick, label: 'Total Clicks', value: formatNumber(s.totalClicks), color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { icon: Gauge, label: 'Click Speed', value: `${s.clicksPerSecond}/s`, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { icon: Coins, label: 'Total Earned', value: formatNumber(s.totalEarned), color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { icon: Zap, label: 'Click Power', value: formatNumber(s.clickPower), color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { icon: TrendingUp, label: 'Auto Rate', value: `${formatNumber(s.autoRate)}/s`, color: 'text-green-400', bg: 'bg-green-400/10' },
    { icon: Sparkles, label: 'Multiplier', value: `x${s.multiplier.toFixed(1)}`, color: 'text-pink-400', bg: 'bg-pink-400/10' },
    { icon: Crosshair, label: 'Crit Chance', value: `${(s.critChance * 100).toFixed(0)}%`, color: 'text-red-400', bg: 'bg-red-400/10' },
    { icon: Flame, label: 'Max Combo', value: `${s.maxCombo}x`, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { icon: Star, label: 'Total Crits', value: formatNumber(s.totalCrits), color: 'text-red-300', bg: 'bg-red-300/10' },
    { icon: Star, label: 'Golden Clicks', value: formatNumber(s.goldenClicks), color: 'text-amber-300', bg: 'bg-amber-300/10' },
    { icon: Crown, label: 'Prestige Level', value: s.prestige.toString(), color: 'text-violet-400', bg: 'bg-violet-400/10' },
    { icon: Shield, label: 'Prestige Points', value: s.prestigePoints.toString(), color: 'text-cyan-300', bg: 'bg-cyan-300/10' },
    { icon: Target, label: 'Upgrades', value: s.upgrades.toString(), color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { icon: Trophy, label: 'Achievements', value: `${s.achievements}/${s.totalAchievements}`, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-1">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.bg}`}>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">{item.label}</p>
            <p className="text-sm font-bold">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ====== Prestige Panel ======
function PrestigePanel() {
  const { totalEarned, prestige, prestigePoints, performPrestige } = useGameStore();
  const canPrestige = totalEarned >= 1000;
  const newPoints = canPrestige ? Math.floor(Math.sqrt(totalEarned / 1000)) : 0;
  const progress = Math.min((totalEarned / 1000) * 100, 100);
  const prestigeMultiplier = 1 + prestigePoints * 0.1;

  return (
    <div className="space-y-4">
      <Card className="border-violet-500/30 bg-gradient-to-br from-violet-950/30 to-fuchsia-950/10">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <Crown className="h-5 w-5 text-violet-400" />
            <h3 className="text-lg font-bold text-violet-300">Prestige System</h3>
          </div>
          <p className="mb-4 text-sm text-muted-foreground/70">
            Reset your progress to earn permanent Prestige Points that boost ALL crystal gains by 10% each!
          </p>

          <div className="mb-4 space-y-2.5">
            {[
              { label: 'Current Prestige', value: `Level ${prestige}`, color: 'text-violet-300' },
              { label: 'Prestige Points', value: prestigePoints.toString(), color: 'text-cyan-300' },
              { label: 'Global Multiplier', value: `x${prestigeMultiplier.toFixed(1)}`, color: 'text-emerald-300' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-muted-foreground/60">{item.label}</span>
                <span className={`font-semibold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>

          <Separator className="mb-4 bg-white/5" />

          <div className="mb-4">
            <div className="mb-1.5 flex justify-between text-xs text-muted-foreground/60">
              <span>Next Prestige</span>
              <span className="font-mono">{formatNumber(totalEarned)} / 1,000</span>
            </div>
            <Progress value={progress} className="h-2.5" />
            {canPrestige && (
              <motion.p className="mt-2 text-xs font-medium text-amber-400" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                🎉 Prestige now for <strong>+{newPoints} point{newPoints > 1 ? 's' : ''}</strong>!
              </motion.p>
            )}
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="w-full border-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:from-violet-500 hover:to-fuchsia-500" disabled={!canPrestige} onClick={performPrestige}>
                  <RotateCcw className="mr-2 h-4 w-4" />Prestige Now
                </Button>
              </TooltipTrigger>
              {!canPrestige && <TooltipContent><p>Earn 1,000 total crystals to prestige</p></TooltipContent>}
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
}

// ====== Main Game ======
export default function CrystalClickerPage() {
  const {
    crystals, clickPower, autoRate, multiplier, prestigePoints, prestige,
    upgrades, achievements, combo, floatingTexts,
    activePowerUp, powerUpTimer, currentNotification, clicksPerSecond,
    activeTab, setActiveTab, updateCombo, updateGolden, updatePowerUp,
    updateNotification, updateClickSpeed, getSaveData, loadSave, resetGame,
  } = useGameStore();

  const [saveStatus, setSaveStatus] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/clicker/load').then((r) => r.json()).then((d) => {
      if (d.success && d.data) loadSave(d.data);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, [loadSave]);

  const saveGame = useCallback(async () => {
    try {
      await fetch('/api/clicker/save', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getSaveData()),
      });
      setSaveStatus('Saved!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch { /* silent */ }
  }, [getSaveData]);

  const handleReset = useCallback(() => {
    resetGame();
    setSaveStatus('Reset!');
    setTimeout(() => setSaveStatus(''), 2000);
  }, [resetGame]);

  // Auto-save
  useEffect(() => {
    const iv = setInterval(saveGame, 15000);
    return () => clearInterval(iv);
  }, [saveGame]);

  // Game tick
  useEffect(() => {
    const tick = 100;
    const iv = setInterval(() => {
      const st = useGameStore.getState();
      if (st.autoRate > 0) {
        const puMult = st.activePowerUp?.effect === 'tripleAuto' ? st.activePowerUp.value : 1;
        const earned = (st.autoRate * puMult * tick) / 1000;
        useGameStore.setState({
          crystals: Math.round((st.crystals + earned) * 100) / 100,
          totalEarned: Math.round((st.totalEarned + earned) * 100) / 100,
        });
      }
      st.updateCombo();
      st.updateGolden();
      st.updatePowerUp();
      st.updateNotification();
      st.updateClickSpeed();
    }, tick);
    return () => clearInterval(iv);
  }, [updateCombo, updateGolden, updatePowerUp, updateNotification, updateClickSpeed]);

  // Reset screen shake
  useEffect(() => {
    const st = useGameStore.getState();
    if (st.screenShake) {
      const t = setTimeout(() => useGameStore.setState({ screenShake: false, crystalPulse: 0 }), 250);
      return () => clearTimeout(t);
    }
  });

  const prestigeMultiplier = 1 + prestigePoints * 0.1;
  const comboMultiplier = combo > 0 ? 1 + (combo - 1) * 0.1 : 1;
  const totalMultiplier = multiplier * prestigeMultiplier * comboMultiplier;
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07060e]">
        <motion.div className="text-center" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <motion.div className="text-6xl" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>💎</motion.div>
          <p className="mt-4 text-lg text-purple-300">Loading Crystal Clicker...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="relative flex min-h-screen flex-col bg-[#07060e] text-foreground overflow-hidden">
        {/* Background */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-purple-700/[0.07] blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-fuchsia-700/[0.05] blur-[100px]" />
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/[0.04] blur-[80px]" />
        </div>
        <AmbientParticles />

        {/* Floating texts */}
        <AnimatePresence>
          {floatingTexts.map((t) => <FloatingTextParticle key={t.id} text={t} />)}
        </AnimatePresence>

        {/* Achievement notification */}
        <AnimatePresence>
          {currentNotification && <AchievementToast achievement={currentNotification} />}
        </AnimatePresence>

        {/* Header */}
        <header className="relative z-10 border-b border-white/[0.06] bg-black/30 px-3 py-2.5 backdrop-blur-md sm:px-4 sm:py-3">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}>
                <Gem className="h-5 w-5 text-purple-400 sm:h-6 sm:w-6" />
              </motion.div>
              <h1 className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-lg font-black tracking-tight text-transparent sm:text-2xl">
                Crystal Clicker
              </h1>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {prestige > 0 && (
                <Badge variant="outline" className="border-violet-500/40 bg-violet-950/50 text-[10px] text-violet-300 sm:text-xs">
                  <Crown className="mr-0.5 h-3 w-3" />P{prestige}
                </Badge>
              )}
              <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-gradient-to-r from-amber-950/60 to-yellow-950/40 px-2.5 py-1 sm:px-3 sm:py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400 sm:h-4 sm:w-4" />
                <span className="min-w-[3.5rem] text-right text-sm font-black text-amber-300 sm:min-w-[4rem] sm:text-lg">
                  {formatNumber(crystals)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Tooltip><TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={saveGame}>
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger><TooltipContent>Save Game</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleReset}>
                  <RotateCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger><TooltipContent>Reset Game</TooltipContent></Tooltip>
              {saveStatus && <motion.span className="text-xs text-emerald-400" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{saveStatus}</motion.span>}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 flex flex-1 flex-col lg:flex-row">
          {/* Left: Crystal Area */}
          <div className="flex flex-1 flex-col items-center justify-center px-4 py-6 sm:py-10 lg:py-12">
            {/* Stats Bar */}
            <div className="mb-5 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {[
                { icon: Zap, label: 'Power', value: formatNumber(clickPower), color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/15' },
                { icon: TrendingUp, label: 'Auto', value: `${formatNumber(autoRate)}/s`, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/15' },
                { icon: Sparkles, label: 'Multi', value: `x${totalMultiplier.toFixed(1)}`, color: 'text-pink-400', bg: 'bg-pink-400/10 border-pink-400/15' },
                { icon: Gauge, label: 'CPS', value: `${clicksPerSecond}/s`, color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-400/15' },
              ].map((s) => (
                <div key={s.label} className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] sm:px-3 sm:py-1.5 sm:text-xs ${s.bg}`}>
                  <s.icon className={`h-3 w-3 ${s.color}`} />
                  <span className="text-muted-foreground/50">{s.label}</span>
                  <span className={`font-bold ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Crystal */}
            <CrystalButton />

            {/* Power-up indicator */}
            <AnimatePresence>
              {activePowerUp && (
                <motion.div className="mt-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <Badge className="border-0 bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1 text-xs font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                    {activePowerUp.icon} {activePowerUp.name}
                    <span className="ml-1.5 font-mono text-[10px] opacity-80">{Math.ceil(powerUpTimer / 10)}s</span>
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hint text */}
            <motion.p className="mt-4 text-xs text-muted-foreground/40 sm:text-sm" animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 3 }}>
              {combo > 1 ? `🔥 ${combo}x combo — keep clicking!` : 'Click the crystal to mine!'}
            </motion.p>

            {/* Quick info */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full border border-amber-500/15 bg-amber-950/15 px-3 py-1 text-[10px] sm:text-xs">
                <Trophy className="h-3 w-3 text-amber-400" />
                <span className="text-amber-300/80">{unlockedCount}/{achievements.length}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-purple-500/15 bg-purple-950/15 px-3 py-1 text-[10px] sm:text-xs">
                <Clock className="h-3 w-3 text-purple-400" />
                <span className="text-purple-300/80">Auto-saves</span>
              </div>
              {prestigePoints > 0 && (
                <div className="flex items-center gap-1.5 rounded-full border border-cyan-500/15 bg-cyan-950/15 px-3 py-1 text-[10px] sm:text-xs">
                  <Shield className="h-3 w-3 text-cyan-400" />
                  <span className="text-cyan-300/80">+{(prestigePoints * 10)}% prestige bonus</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Panel */}
          <div className="w-full border-t border-white/[0.06] bg-black/20 backdrop-blur-sm lg:w-[400px] xl:w-[420px] lg:border-l lg:border-t-0">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex h-full flex-col">
              <TabsList className="mx-3 mt-3 grid w-auto grid-cols-4 rounded-lg bg-white/[0.03] p-0.5">
                {[
                  { value: 'upgrades', label: 'Upgrades', Icon: Zap, activeClass: 'bg-purple-600' },
                  { value: 'achievements', label: 'Awards', Icon: Trophy, activeClass: 'bg-amber-600', badge: unlockedCount },
                  { value: 'stats', label: 'Stats', Icon: BarChart3, activeClass: 'bg-emerald-600' },
                  { value: 'prestige', label: 'Prestige', Icon: Crown, activeClass: 'bg-violet-600' },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value} value={tab.value}
                    className={`relative rounded-md text-[11px] font-medium data-[state=active]:${tab.activeClass} data-[state=active]:text-white sm:text-xs`}
                  >
                    <tab.Icon className="mr-0.5 h-3 w-3 hidden sm:inline-block" />
                    {tab.label}
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
                        {tab.badge}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="upgrades" className="flex-1 overflow-hidden p-3">
                <ScrollArea className="h-[calc(100vh-260px)] sm:h-[calc(100vh-220px)]">
                  <div className="space-y-2 pb-4">
                    {[
                      { effect: 'clickPower' as const, title: '⚔️ Click Power', color: 'text-yellow-400' },
                      { effect: 'autoRate' as const, title: '⛏️ Auto Mining', color: 'text-green-400' },
                      { effect: 'multiplier' as const, title: '✨ Multipliers & Special', color: 'text-pink-400' },
                    ].map((section) => {
                      const sectionUpgrades = upgrades.filter((u) =>
                        section.effect === u.effect ||
                        (section.effect === 'multiplier' && (u.effect === 'multiplier' || u.effect === 'goldenChance' || u.effect === 'critChance')),
                      );
                      return (
                        <div key={section.effect} className="mb-2">
                          <h3 className={`mb-2 text-[10px] font-bold uppercase tracking-widest ${section.color}`}>
                            {section.title}
                          </h3>
                          <div className="space-y-2">
                            {sectionUpgrades.map((u) => <UpgradeCard key={u.id} upgrade={u} />)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="achievements" className="flex-1 overflow-hidden p-3">
                <ScrollArea className="h-[calc(100vh-260px)] sm:h-[calc(100vh-220px)]">
                  <div className="space-y-2 pb-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-amber-300">🏆 Achievements</h3>
                      <div className="flex items-center gap-2">
                        <Progress value={(unlockedCount / achievements.length) * 100} className="h-1.5 w-20" />
                        <span className="text-[10px] text-muted-foreground">{unlockedCount}/{achievements.length}</span>
                      </div>
                    </div>
                    {achievements.map((a) => <AchievementCard key={a.id} achievement={a} />)}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="stats" className="flex-1 overflow-hidden p-3">
                <ScrollArea className="h-[calc(100vh-260px)] sm:h-[calc(100vh-220px)]">
                  <div className="pb-4">
                    <h3 className="mb-3 text-sm font-bold text-emerald-300">📊 Game Statistics</h3>
                    <StatsPanel />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="prestige" className="flex-1 overflow-hidden p-3">
                <ScrollArea className="h-[calc(100vh-260px)] sm:h-[calc(100vh-220px)]">
                  <div className="pb-4"><PrestigePanel /></div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 mt-auto border-t border-white/[0.06] bg-black/30 px-4 py-2 text-center backdrop-blur-sm">
          <p className="text-[11px] text-muted-foreground/40 sm:text-xs">
            💎 Crystal Clicker — Click, Upgrade, Prestige, Repeat! ⚡ Crits 🌟 Golden Crystals 🏆 Achievements
          </p>
        </footer>
      </div>
    </TooltipProvider>
  );
}