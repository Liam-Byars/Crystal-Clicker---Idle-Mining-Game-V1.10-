'use client';

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore, getMaxBuyCount, AREAS, getUpgradesForArea, getUpgradeCostLogSafe, getTotalCostNLogSafe } from '@/stores';
import type { BuyQuantity, FloatingText, Upgrade, Achievement, Area } from '@/stores';
import { WorldMap } from '@/components/world-map';
import { LuckySpin } from '@/components/lucky-spin';
import { ActivityLog } from '@/components/activity-log';
import type { LogEntry } from '@/components/activity-log';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth-context';
import { SignInScreen } from '@/components/sign-in-screen';
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from '@/lib/legal-content';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, UserCircle, Volume2, VolumeX, LogIn, FileText, ShieldCheck, Crown, Sparkles, Star, Settings, Download, Keyboard } from 'lucide-react';
import { PREMIUM_ITEMS, RARITY_COLORS, getFeaturedItems, getPremiumItemsByCategory } from '@/lib/premium-items';
import { usePwaInstall } from '@/lib/use-pwa-install';
import { haptic } from '@/lib/haptics';
import { useNativePlatform, useNetworkStatus } from '@/lib/use-native-platform';

// ====== Helpers ======
function toLogSafe(n: number): number {
  if (!isFinite(n) || n <= 0) return -Infinity;
  return Math.log10(n);
}
function fmtExpLog(log: number): string {
  if (log < 0) return '0';
  if (log < 3) {
    const v = Math.pow(10, log);
    return v < 10 ? v.toFixed(1) : Math.floor(v).toString();
  }
  if (log < 6) return (Math.pow(10, log - 3)).toFixed(1) + 'K';
  if (log < 9) return (Math.pow(10, log - 6)).toFixed(2) + 'M';
  if (log < 12) return (Math.pow(10, log - 9)).toFixed(2) + 'B';
  if (log < 15) return (Math.pow(10, log - 12)).toFixed(2) + 'T';
  // AA-ZZ double-letter suffixes (676 tiers, each 1000x)
  const tier = Math.floor((log - 15) / 3);
  if (tier >= 0 && tier < 676) {
    const first = String.fromCharCode(65 + Math.floor(tier / 26));
    const second = String.fromCharCode(65 + (tier % 26));
    const divisor_log = 15 + tier * 3;
    return (Math.pow(10, log - divisor_log)).toFixed(2) + first + second;
  }
  // Beyond ZZ: triple-letter suffixes (AAA-ZZZ)
  const tier2 = tier - 676;
  if (tier2 >= 0 && tier2 < 17576) {
    const a = String.fromCharCode(65 + Math.floor(tier2 / 676));
    const b = String.fromCharCode(65 + Math.floor((tier2 % 676) / 26));
    const c = String.fromCharCode(65 + (tier2 % 26));
    const divisor_log = 15 + tier * 3;
    return (Math.pow(10, log - divisor_log)).toFixed(2) + a + b + c;
  }
  // Beyond ZZZ: quad-letter suffixes
  const tier3 = tier2 - 17576;
  if (tier3 >= 0 && tier3 < 456976) {
    const a = String.fromCharCode(65 + Math.floor(tier3 / 17576));
    const b = String.fromCharCode(65 + Math.floor((tier3 % 17576) / 676));
    const c = String.fromCharCode(65 + Math.floor(((tier3 % 17576) % 676) / 26));
    const d = String.fromCharCode(65 + (tier3 % 26));
    const divisor_log = 15 + tier * 3;
    return (Math.pow(10, log - divisor_log)).toFixed(2) + a + b + c + d;
  }
  return Math.pow(10, log).toExponential(2);
}

function fmt(n: number, exp = 0): string {
  if (n < 0) return '-' + fmt(-n, exp);
  if (!isFinite(n)) return fmtExpLog(exp + 400);
  if (exp > 0) return fmtExpLog(Math.log10(n) + exp);
  if (n < 1000) return n < 10 ? n.toFixed(1) : Math.floor(n).toString();
  if (n < 1e6) return (n / 1e3).toFixed(1) + 'K';
  if (n < 1e9) return (n / 1e6).toFixed(2) + 'M';
  if (n < 1e12) return (n / 1e9).toFixed(2) + 'B';
  if (n < 1e15) return (n / 1e12).toFixed(2) + 'T';
  // AA-ZZ double-letter suffixes (676 tiers, each 1000x)
  const e = Math.floor(Math.log10(n));
  const tier = Math.floor((e - 15) / 3);
  if (tier >= 0 && tier < 676) {
    const first = String.fromCharCode(65 + Math.floor(tier / 26));
    const second = String.fromCharCode(65 + (tier % 26));
    const divisor = Math.pow(10, 15 + tier * 3);
    return (n / divisor).toFixed(2) + first + second;
  }
  // Beyond ZZ: triple-letter suffixes (AAA-ZZZ, 17,576 more tiers)
  const tier2 = tier - 676;
  if (tier2 >= 0 && tier2 < 17576) {
    const a = String.fromCharCode(65 + Math.floor(tier2 / 676));
    const b = String.fromCharCode(65 + Math.floor((tier2 % 676) / 26));
    const c = String.fromCharCode(65 + (tier2 % 26));
    const divisor = Math.pow(10, 15 + tier * 3);
    return (n / divisor).toFixed(2) + a + b + c;
  }
  // Truly beyond all suffixes
  return n.toExponential(2);
}

function fmtTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function fmtTimer(ticks: number): string {
  const sec = Math.ceil(ticks / 10);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ====== Sound Engine ======
const audioCtx = typeof window !== 'undefined'
  ? new (window.AudioContext || (window as unknown as Record<string, unknown>).webkitAudioContext as typeof AudioContext)()
  : null;
let soundOn = true;

function playTone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.08) {
  if (!soundOn || !audioCtx) return;
  try {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, audioCtx.currentTime);
    g.gain.setValueAtTime(vol, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + dur);
  } catch { /* ignore audio errors */ }
}

function sfxClick() { playTone(800 + Math.random() * 200, 0.08, 'sine', 0.06); haptic('click'); }
function sfxCrit() { playTone(1200, 0.15, 'square', 0.1); playTone(1600, 0.1, 'sine', 0.08); haptic('crit'); }
function sfxGolden() { playTone(1000, 0.1, 'sine', 0.1); playTone(1500, 0.15, 'sine', 0.08); playTone(2000, 0.2, 'sine', 0.06); haptic('golden'); }
function sfxBuy() { playTone(600, 0.06, 'triangle', 0.06); haptic('buy'); }
function sfxAchieve() { playTone(880, 0.15, 'sine', 0.1); playTone(1100, 0.2, 'sine', 0.08); haptic('achieve'); }
function sfxMilestone() { playTone(523, 0.15, 'sine', 0.1); playTone(659, 0.15, 'sine', 0.08); playTone(784, 0.2, 'sine', 0.06); haptic('achieve'); }

// ====== Color Maps for floating text ======
const floatColors: Record<FloatingText['type'], string> = {
  normal: '#c084fc',
  golden: '#fbbf24',
  combo: '#f97316',
  crit: '#ef4444',
  powerup: '#22d3ee',
  event: '#a78bfa',
  offline: '#34d399',
  milestone: '#fbbf24',
};

// ====== Upgrade Category Helpers ======
const effectLabels: Record<Upgrade['effect'], string> = {
  clickPower: 'Click Power',
  autoRate: 'Auto Rate',
  multiplier: 'Multiplier',
  goldenChance: 'Golden Chance',
  critChance: 'Crit Chance',
};

const effectColors: Record<Upgrade['effect'], string> = {
  clickPower: 'text-purple-400',
  autoRate: 'text-cyan-400',
  multiplier: 'text-amber-400',
  goldenChance: 'text-yellow-400',
  critChance: 'text-red-400',
};

// ====== Main Component ======
export default function GamePage() {
  const crystalRef = useRef<HTMLDivElement>(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [legalTosOpen, setLegalTosOpen] = useState(false);
  const [legalPpOpen, setLegalPpOpen] = useState(false);
  const [sparkles, setSparkles] = useState<{id: number; x: number; y: number; delay: number}[]>([]);
  const sparkleIdRef = useRef(0);
  const [zzCelebration, setZzCelebration] = useState(false);
  const prevNotifRef = useRef<string | null>(null);

  // Daily Reward
  const [dailyReward, setDailyReward] = useState<{day: number; crystals: number; prestige: number; cycle: number; streak: number} | null>(null);

  // Lucky Spin & Activity Log
  const [spinOpen, setSpinOpen] = useState(false);
  const logIdRef = useRef(0);
  const [activityLog, setActivityLog] = useState<LogEntry[]>([]);
  const [adTimer, setAdTimer] = useState<{type: string; remaining: number} | null>(null);
  const [saveAge, setSaveAge] = useState('');
  const [premiumPurchaseDialog, setPremiumPurchaseDialog] = useState<{item: typeof PREMIUM_ITEMS[0]; purchasing: boolean} | null>(null);
  const [premiumFilter, setPremiumFilter] = useState<string>('all');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const pwa = usePwaInstall();
  const isNative = useNativePlatform();
  const { connected: isOnline } = useNetworkStatus();
  const addLog = useCallback((icon: string, text: string, color: string) => {
    setActivityLog(prev => [...prev.slice(-49), {id: logIdRef.current++, icon, text, color, time: Date.now()}]);
  }, []);

  // ====== Auth ======
  const { user, loading: authLoading, isGuest, logout, signInWithGoogle, userId, displayName, photoURL } = useAuth();

  // ====== Store Selectors (useShallow for all!) ======
  const crystals = useGameStore(s => s.crystals);
  const crystalsExp = useGameStore(s => s.crystalsExp);
  const clickPowerLog = useGameStore(s => s.clickPowerLog);
  const autoRateLog = useGameStore(s => s.autoRateLog);
  const multiplierLog = useGameStore(s => s.multiplierLog);
  const combo = useGameStore(s => s.combo);
  const comboTimer = useGameStore(s => s.comboTimer);
  const maxCombo = useGameStore(s => s.maxCombo);
  const clicksPerSecond = useGameStore(s => s.clicksPerSecond);
  const critChance = useGameStore(s => s.critChance);
  const goldenActive = useGameStore(s => s.goldenActive);
  const goldenTimer = useGameStore(s => s.goldenTimer);
  const goldenClickValue = useGameStore(s => s.goldenClickValue);
  const goldenChance = useGameStore(s => s.goldenChance);
  const activePowerUp = useGameStore(s => s.activePowerUp);
  const powerUpTimer = useGameStore(s => s.powerUpTimer);
  const activeEvent = useGameStore(s => s.activeEvent);
  const eventTimer = useGameStore(s => s.eventTimer);
  const buyQuantity = useGameStore(s => s.buyQuantity);
  const prestige = useGameStore(s => s.prestige);
  const prestigePoints = useGameStore(s => s.prestigePoints);
  const totalClicks = useGameStore(s => s.totalClicks);
  const totalEarned = useGameStore(s => s.totalEarned);
  const totalEarnedExp = useGameStore(s => s.totalEarnedExp);
  const sessionClicks = useGameStore(s => s.sessionClicks);
  const sessionEarned = useGameStore(s => s.sessionEarned);
  const sessionStartTime = useGameStore(s => s.sessionStartTime);
  const milestones = useGameStore(s => s.milestones);
  const floatingTexts = useGameStore(s => s.floatingTexts);
  const ripples = useGameStore(s => s.ripples);
  const allUpgrades = useGameStore(s => s.upgrades);
  const currentArea = useGameStore(s => s.currentArea);
  const unlockedAreas = useGameStore(s => s.unlockedAreas);
  const areaUpgrades = getUpgradesForArea(currentArea, allUpgrades);
  const achievements = useGameStore(s => s.achievements);
  const currentNotification = useGameStore(s => s.currentNotification);
  const notificationTimer = useGameStore(s => s.notificationTimer);
  const screenShake = useGameStore(s => s.screenShake);
  const crystalPulse = useGameStore(s => s.crystalPulse);
  const activeTab = useGameStore(s => s.activeTab);
  const showOfflineBonus = useGameStore(s => s.showOfflineBonus);
  const offlineEarned = useGameStore(s => s.offlineEarned);
  const totalCrits = useGameStore(s => s.totalCrits);
  const goldenClicks = useGameStore(s => s.goldenClicks);
  const totalEvents = useGameStore(s => s.totalEvents);
  const shopBoosts = useGameStore(s => s.shopBoosts);
  const adCooldown = useGameStore(s => s.adCooldown);
  const lastSaveTime = useGameStore(s => s.lastSaveTime);
  const bestSessionCps = useGameStore(s => s.bestSessionCps);

  const click = useGameStore(s => s.click);
  const clickGolden = useGameStore(s => s.clickGolden);
  const buyUpgrade = useGameStore(s => s.buyUpgrade);
  const setBuyQuantity = useGameStore(s => s.setBuyQuantity);
  const performPrestige = useGameStore(s => s.performPrestige);
  const setActiveTab = useGameStore(s => s.setActiveTab);
  const resetGame = useGameStore(s => s.resetGame);
  const claimOfflineEarnings = useGameStore(s => s.claimOfflineEarnings);
  const dismissOfflineBonus = useGameStore(s => s.dismissOfflineBonus);
  const getSaveData = useGameStore(s => s.getSaveData);
  const loadSave = useGameStore(s => s.loadSave);
  const tick = useGameStore(s => s.tick);
  const buyShopBoost = useGameStore(s => s.buyShopBoost);
  const claimAdReward = useGameStore(s => s.claimAdReward);
  const buyInstantCrystals = useGameStore(s => s.buyInstantCrystals);
  const ownedPremiumItems = useGameStore(s => s.ownedPremiumItems);
  const setPremiumItems = useGameStore(s => s.setPremiumItems);

  // ====== Derived ======
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalUpgrades = allUpgrades.reduce((s, u) => s + u.level, 0);
  const nextMilestone = milestones.find(m => !m.celebrated);
  const milestoneProgress = nextMilestone
    ? Math.min((totalEarned / nextMilestone.value) * 100, 100)
    : 100;

  // ====== Game Tick (100ms) ======
  useEffect(() => {
    const iv = setInterval(() => {
      tick();
    }, 100);
    return () => clearInterval(iv);
  }, [tick]);

  // ====== Session Timer ======
  useEffect(() => {
    const iv = setInterval(() => setSessionTime(Date.now() - sessionStartTime), 1000);
    return () => clearInterval(iv);
  }, [sessionStartTime]);

  // ====== Premium Purchase Handler ======
  const handlePremiumPurchase = async (item: typeof PREMIUM_ITEMS[0]) => {
    if (!userId || ownedPremiumItems.includes(item.id)) return;
    setPremiumPurchaseDialog({ item, purchasing: true });
    try {
      const res = await fetch('/api/clicker/premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, itemId: item.id }),
      });
      const json = await res.json();
      if (json.success) {
        const newItems = [...ownedPremiumItems, item.id];
        setPremiumItems(newItems);
        addLog('💎', `Purchased ${item.name}!`, '#f59e0b');
        sfxMilestone();
      }
    } catch { /* ignore */ }
    setPremiumPurchaseDialog(null);
  };

  // ====== Save Age Updater ======
  useEffect(() => {
    const update = () => {
      const ago = Date.now() - lastSaveTime;
      if (ago < 60000) setSaveAge(`saved ${Math.max(1, Math.floor(ago / 1000))}s ago`);
      else if (ago < 3600000) setSaveAge(`saved ${Math.floor(ago / 60000)}m ago`);
      else setSaveAge(`saved ${Math.floor(ago / 3600000)}h ago`);
    };
    update();
    const iv = setInterval(update, 5000);
    return () => clearInterval(iv);
  }, [lastSaveTime]);

  // ====== Ad Timer ======
  useEffect(() => {
    if (!adTimer) return;
    if (adTimer.remaining <= 0) {
      claimAdReward(adTimer.type);
      setAdTimer(null);
      sfxMilestone();
      return;
    }
    const iv = setInterval(() => {
      setAdTimer(prev => {
        if (!prev || prev.remaining <= 1) return null;
        return { ...prev, remaining: prev.remaining - 1 };
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [adTimer, claimAdReward]);

  // ====== Daily Reward Check ======
  const claimReward = useGameStore(s => s.claimReward);
  useEffect(() => {
    if (!userId) return;
    const timer = setTimeout(() => {
      try {
        const key = `crystal_clicker_daily_${userId}`;
        const raw = localStorage.getItem(key);
        const now = Date.now();
        let lastClaim = 0;
        let streak = 0;
        if (raw) { const d = JSON.parse(raw); lastClaim = d.lastClaim || 0; streak = d.streak || 0; }
        if (now - lastClaim < 86400000) return;
        if (lastClaim > 0 && now - lastClaim >= 172800000) streak = 0;
        streak += 1;
        const dayInCycle = ((streak - 1) % 7) + 1;
        const cycle = Math.floor((streak - 1) / 7);
        const cycleMult = Math.pow(2, cycle);
        const REWARDS = [1000, 5000, 25000, 100000, 500000, 2500000, 10000000];
        const dailyMult = useGameStore.getState().ownedPremiumItems.includes('double_daily') ? 2 : 1;
        setDailyReward({ day: dayInCycle, crystals: REWARDS[dayInCycle - 1] * cycleMult * dailyMult, prestige: dayInCycle === 7 ? Math.ceil(1 * (cycle + 1) * dailyMult) : 0, cycle, streak });
      } catch { /* ignore */ }
    }, 2500);
    return () => clearTimeout(timer);
  }, [userId]);

  // ====== Sparkle Particles ======
  useEffect(() => {
    if (!userId) return;
    const iv = setInterval(() => {
      const id = sparkleIdRef.current++;
      const x = 20 + Math.random() * 160;
      const y = 20 + Math.random() * 160;
      const delay = Math.random() * 0.5;
      setSparkles(prev => [...prev.slice(-12), { id, x, y, delay }]);
      setTimeout(() => setSparkles(prev => prev.filter(s => s.id !== id)), 2000);
    }, 300);
    return () => clearInterval(iv);
  }, [userId]);

  // ====== Auto-save (5min default, 30s with Auto-Save Pro) ======
  useEffect(() => {
    const interval = ownedPremiumItems.includes('auto_save_pro') ? 30000 : 300000;
    const iv = setInterval(async () => {
      try {
        setSaveStatus('saving');
        const data = getSaveData();
        const payload = { ...data, userId };
        // Always save to localStorage as fallback (survives DB wipes)
        try { localStorage.setItem(`crystal_clicker_save_${userId}`, JSON.stringify(data)); } catch { /* ignore */ }
        const savePromise = fetch('/api/clicker/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        await savePromise;
        setSaveStatus('saved');
        useGameStore.setState({ lastSaveTime: Date.now() });
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    }, interval);
    return () => clearInterval(iv);
  }, [getSaveData, userId, ownedPremiumItems]);

  // ====== Load Save on Mount ======
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        // Read both server and localStorage saves, use the most recent
        let localData: Record<string, unknown> | null = null;
        try {
          const raw = localStorage.getItem(`crystal_clicker_save_${userId}`);
          if (raw) localData = JSON.parse(raw);
        } catch { /* ignore */ }

        let serverData: Record<string, unknown> | null = null;
        try {
          const res = await fetch(`/api/clicker/load?userId=${encodeURIComponent(userId)}`);
          if (res.ok) {
            const json = await res.json();
            if (json.data && (json.data as Record<string, unknown>).crystals !== undefined) {
              serverData = json.data as Record<string, unknown>;
            }
            // Load premium items from server
            if (json.ownedPremiumItems && Array.isArray(json.ownedPremiumItems)) {
              setPremiumItems(json.ownedPremiumItems);
            }
          }
        } catch { /* ignore */ }

        // Check for guest→Google migration data
        const migration = localStorage.getItem('crystal_clicker_migration');
        let migrationData: Record<string, unknown> | null = null;
        if (migration) {
          try { migrationData = JSON.parse(migration); } catch { /* ignore */ }
          localStorage.removeItem('crystal_clicker_migration');
        }

        // Pick the best save: migration > compare server vs local by timestamp
        let bestData: Record<string, unknown> | null = null;
        if (migrationData && migrationData.crystals !== undefined) {
          bestData = migrationData;
        } else if (serverData && localData) {
          const sTime = (serverData.lastOnlineTime as number) || 0;
          const lTime = (localData.lastOnlineTime as number) || 0;
          bestData = sTime >= lTime ? serverData : localData;
        } else if (serverData) {
          bestData = serverData;
        } else if (localData) {
          bestData = localData;
        }

        if (bestData && bestData.crystals !== undefined) {
          loadSave(bestData);
          // Sync: upload best data to server if it came from localStorage/migration
          if (bestData !== serverData) {
            try {
              await fetch('/api/clicker/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...bestData, userId }),
              });
            } catch { /* ignore */ }
          }
          // Also update localStorage if it came from server/migration
          if (bestData !== localData) {
            try { localStorage.setItem(`crystal_clicker_save_${userId}`, JSON.stringify(bestData)); } catch { /* ignore */ }
          }
        }
      } catch { /* no save exists yet */ }
    })();
  }, [loadSave, userId]);

  // ====== Achievement sound on unlock ======
  useEffect(() => {
    if (currentNotification) sfxAchieve();
    // Trigger ZZ celebration
    if (currentNotification && currentNotification.id === 'reached_zz' && prevNotifRef.current !== 'reached_zz') {
      setZzCelebration(true);
      setTimeout(() => setZzCelebration(false), 5000);
    }
    if (currentNotification) prevNotifRef.current = currentNotification.id;
  }, [currentNotification]);

  // ====== Save on page close/refresh ======
  useEffect(() => {
    if (!userId) return;
    const handleUnload = () => {
      const data = getSaveData();
      const payload = { ...data, userId };
      // Always save to localStorage as fallback
      try { localStorage.setItem(`crystal_clicker_save_${userId}`, JSON.stringify(data)); } catch { /* ignore */ }
      // Use sendBeacon for reliable save on page close
      navigator.sendBeacon('/api/clicker/save', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [getSaveData, userId]);

  // ====== Click Handler ======
  const handleCrystalClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (goldenActive) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      clickGolden(x, y);
      sfxGolden();
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const isCrit = Math.random() < critChance;
      click(x, y);
      if (isCrit) {
        sfxCrit();
      } else {
        sfxClick();
      }
    }
    // Resume audio context on first interaction
    if (audioCtx?.state === 'suspended') audioCtx.resume();
  }, [click, clickGolden, goldenActive, critChance]);

  // ====== Buy Handler ======
  const handleBuy = useCallback((upgradeId: string) => {
    const st = useGameStore.getState();
    const u = st.upgrades.find(up => up.id === upgradeId);
    if (!u) return;

    let count = 1;
    if (st.buyQuantity === 10) {
      count = Math.min(10, u.maxLevel ? u.maxLevel - u.level : 10);
    } else if (st.buyQuantity === 100) {
      count = Math.min(100, u.maxLevel ? u.maxLevel - u.level : 100);
    } else if (st.buyQuantity === 'max') {
      count = getMaxBuyCount(u, st.crystals, st.crystalsExp);
    }

    let bought = false;
    for (let i = 0; i < count; i++) {
      if (buyUpgrade(upgradeId)) bought = true;
      else break;
    }
    if (bought) sfxBuy();
  }, [buyUpgrade]);

  // ====== Upgrade cost display ======
  const getBuyInfo = useCallback((u: Upgrade) => {
    const st = useGameStore.getState();
    const bq = st.buyQuantity;
    const myLog = toLogSafe(st.crystals) + st.crystalsExp;
    if (bq === 1) {
      const costLog = getUpgradeCostLogSafe(u);
      const canBuy = myLog >= costLog && (!u.maxLevel || u.level < u.maxLevel);
      return { count: 1, costLog, canBuy, label: fmtExpLog(costLog) };
    }
    if (bq === 10) {
      const n = Math.min(10, u.maxLevel ? u.maxLevel - u.level : 10);
      const costLog = n > 0 ? getTotalCostNLogSafe(u, n) : -Infinity;
      const canBuy = n > 0 && myLog >= costLog;
      return { count: n, costLog, canBuy, label: n > 0 ? `${n}x ${fmtExpLog(costLog)}` : '—' };
    }
    if (bq === 100) {
      const n = Math.min(100, u.maxLevel ? u.maxLevel - u.level : 100);
      const costLog = n > 0 ? getTotalCostNLogSafe(u, n) : -Infinity;
      const canBuy = n > 0 && myLog >= costLog;
      return { count: n, costLog, canBuy, label: n > 0 ? `${n}x ${fmtExpLog(costLog)}` : '—' };
    }
    // max
    const n = getMaxBuyCount(u, st.crystals, st.crystalsExp);
    const costLog = n > 0 ? getTotalCostNLogSafe(u, n) : getUpgradeCostLogSafe(u);
    const canBuy = n > 0;
    return { count: n, costLog, canBuy, label: n > 0 ? `${n}x ${fmtExpLog(costLog)}` : fmtExpLog(costLog) };
  }, []);

  // ====== Keyboard Shortcuts ======
  useEffect(() => {
    if (!userId) return;
    const handler = (e: KeyboardEvent) => {
      // Skip if dialog is open
      const dialogEl = document.querySelector('[role="dialog"]');
      if (dialogEl && (dialogEl as HTMLElement).offsetParent !== null) return;
      // Skip if user is typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        const rect = crystalRef.current?.getBoundingClientRect();
        if (rect) {
          const x = rect.width / 2;
          const y = rect.height / 2;
          if (goldenActive) {
            clickGolden(x, y);
            sfxGolden();
          } else {
            click(x, y);
            if (Math.random() < critChance) sfxCrit(); else sfxClick();
          }
          if (audioCtx?.state === 'suspended') audioCtx.resume();
        }
      }
      const tabMap: Record<string, 'upgrades' | 'map' | 'achievements' | 'stats' | 'prestige' | 'shop'> = {
        '1': 'upgrades', '2': 'map', '3': 'achievements', '4': 'stats', '5': 'prestige', '6': 'shop',
      };
      if (tabMap[e.key]) {
        e.preventDefault();
        setActiveTab(tabMap[e.key]);
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setSettingsOpen(s => !s);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [userId, click, clickGolden, goldenActive, critChance, setActiveTab]);

  // ====== Render ======
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a1a' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <span className="text-purple-400/60 text-sm">Loading...</span>
        </div>
      </div>
    );
  }
  if (!userId) {
    return <SignInScreen />;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={`min-h-screen flex flex-col relative overflow-hidden select-none ${screenShake ? 'animate-shake' : ''}`}
        style={{ backgroundColor: '#0a0a1a' }}
      >
        {/* Grid pattern background */}
        <div className="fixed inset-0 bg-grid-pattern pointer-events-none" />

        {/* ====== USER BAR ====== */}
        <div className="relative z-40 flex items-center justify-between px-3 py-1.5 bg-gray-950/60 backdrop-blur-sm border-b border-gray-800/50">
          <div className="flex items-center gap-2">
            <Avatar className="w-7 h-7">
              {photoURL && <AvatarImage src={photoURL} alt={displayName || ''} />}
              <AvatarFallback className="bg-purple-600/30 text-purple-300 text-xs font-semibold">
                {(displayName || 'G')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-300 font-medium max-w-[140px] truncate">
              {displayName || 'Guest'}
            </span>
            {isGuest && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gray-700 text-gray-500">
                Guest
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Save status */}
            <span className="text-[10px] text-gray-600">
              {saveStatus === 'saving' && 'Saving...'}
              {saveStatus === 'saved' && 'Saved ✓'}
              {saveStatus === 'error' && 'Save failed'}
            </span>
            {/* Sound toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"
              onClick={() => { soundOn = !soundOn; }}
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"
                >
                  <UserCircle className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
                {isGuest && (
                  <DropdownMenuItem
                    className="text-blue-400 focus:text-blue-300 focus:bg-blue-500/10 cursor-pointer"
                    onClick={async () => {
                      // Save current guest progress for migration
                      const data = getSaveData();
                      try { localStorage.setItem('crystal_clicker_migration', JSON.stringify(data)); } catch { /* ignore */ }

                      const result = await signInWithGoogle();
                      if (!result.success) {
                        try { localStorage.removeItem('crystal_clicker_migration'); } catch { /* ignore */ }
                        setSaveStatus('error');
                        setTimeout(() => setSaveStatus('idle'), 3000);
                      }
                    }}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign in with Google
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-white/60 focus:text-white/80 focus:bg-white/5 cursor-pointer"
                  onClick={() => setLegalTosOpen(true)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Terms of Service
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-white/60 focus:text-white/80 focus:bg-white/5 cursor-pointer"
                  onClick={() => setLegalPpOpen(true)}
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Privacy Policy
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* ====== EVENT BANNER ====== */}
        <AnimatePresence>
          {activeEvent && (
            <motion.div
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
              className="relative z-50 bg-gradient-to-r from-purple-600/90 via-fuchsia-600/90 to-pink-600/90 backdrop-blur-sm px-4 py-2 flex items-center justify-center gap-3"
            >
              <span className="text-lg">{activeEvent.icon}</span>
              <span className="text-white font-semibold text-sm">{activeEvent.name}</span>
              <span className="text-white/80 text-xs hidden sm:inline">— {activeEvent.description}</span>
              <Badge variant="secondary" className="bg-white/20 text-white text-xs ml-2">
                {fmtTimer(eventTimer)}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ====== POWER-UP INDICATOR ====== */}
        <AnimatePresence>
          {activePowerUp && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="fixed top-4 right-4 z-50 bg-cyan-900/80 backdrop-blur-sm border border-cyan-500/40 rounded-lg px-3 py-2 flex items-center gap-2"
            >
              <span className="text-lg">{activePowerUp.icon}</span>
              <span className="text-cyan-200 text-sm font-medium">{activePowerUp.name}</span>
              <Badge variant="outline" className="border-cyan-400/50 text-cyan-300 text-xs">
                {fmtTimer(powerUpTimer)}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ====== ACHIEVEMENT NOTIFICATION ====== */}
        <AnimatePresence>
          {currentNotification && (
            <motion.div
              initial={{ y: -80, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -80, opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-900/90 to-yellow-900/90 backdrop-blur-sm border border-yellow-500/40 rounded-xl px-5 py-3 flex items-center gap-3 shadow-lg shadow-yellow-500/10"
            >
              <span className="text-2xl">{currentNotification.icon}</span>
              <div className="flex flex-col">
                <span className="text-yellow-300 font-bold text-sm">Achievement Unlocked!</span>
                <span className="text-yellow-100/80 text-xs">{currentNotification.name}</span>
              </div>
              <div className="w-16 h-1.5 bg-yellow-900/50 rounded-full ml-3 overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-100"
                  style={{ width: `${((30 - notificationTimer) / 30) * 100}%` }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ====== ZZ CELEBRATION OVERLAY ====== */}
        <AnimatePresence>
          {zzCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
            >
              {/* Background pulse */}
              <div className="absolute inset-0" style={{ animation: 'zz-bg-pulse 2s ease-in-out infinite' }} />

              {/* Expanding rings */}
              {[0, 300, 600, 900].map(delay => (
                <div
                  key={delay}
                  className="absolute w-32 h-32 rounded-full border-2 border-purple-400/60"
                  style={{ animation: `zz-ring-expand 1.5s ease-out ${delay}ms forwards` }}
                />
              ))}

              {/* Vortex spinner */}
              <div
                className="absolute w-40 h-40 rounded-full border-t-4 border-r-4 border-b-4 border-purple-400/80 border-l-4 border-cyan-400/80"
                style={{ animation: 'zz-vortex-spin 2s ease-in-out forwards' }}
              />
              <div
                className="absolute w-28 h-28 rounded-full border-t-2 border-l-2 border-yellow-400/70 border-r-2 border-pink-400/70"
                style={{ animation: 'zz-vortex-spin 1.5s ease-in-out 0.2s reverse forwards' }}
              />

              {/* Particles */}
              {Array.from({ length: 24 }).map((_, i) => {
                const angle = (i / 24) * Math.PI * 2;
                const dist = 120 + Math.random() * 80;
                return (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      background: ['#ff6b6b','#feca57','#48dbfb','#ff9ff3','#54a0ff','#5f27cd','#00d2d3','#ff9f43'][i % 8],
                      left: '50%', top: '50%',
                      marginLeft: '-4px', marginTop: '-4px',
                      '--px': `${Math.cos(angle) * dist}px`,
                      '--py': `${Math.sin(angle) * dist}px`,
                      animation: `zz-particle 1.2s ease-out ${i * 40}ms forwards`,
                      boxShadow: `0 0 6px ${['#ff6b6b','#feca57','#48dbfb','#ff9ff3','#54a0ff','#5f27cd','#00d2d3','#ff9f43'][i % 8]}`,
                    } as React.CSSProperties}
                  />
                );
              })}

              {/* Center text */}
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.3 }}
                className="relative z-10 text-center"
              >
                <div className="text-6xl sm:text-8xl font-black" style={{ animation: 'zz-rainbow 1.5s linear infinite' }}>
                  ZZ
                </div>
                <div className="text-lg sm:text-2xl font-bold text-white/90 mt-2 tracking-widest">
                  BEYOND INFINITY
                </div>
                <div className="text-sm text-white/50 mt-1">
                  🌀 Achievement Unlocked
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ====== MAIN LAYOUT ====== */}
        <div className="flex-1 flex flex-col lg:flex-row gap-0 relative z-10">
          {/* ====== LEFT: Crystal Area ====== */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center p-4 lg:p-8 lg:w-[420px]">
            {/* Crystal Count */}
            <div className="text-center mb-2">
              <motion.div
                key={crystals}
                initial={crystalPulse > 0 ? { scale: 1 + crystalPulse * 0.03 } : false}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-4xl sm:text-5xl font-bold text-gradient-purple tracking-tight">
                  {fmt(crystals, crystalsExp)}
                </div>
                <div className="text-sm text-purple-300/60 mt-1">crystals</div>
              <div className="text-xs text-gray-500 mt-0.5 flex items-center justify-center gap-1">
                {(() => { const a = AREAS.find(ar => ar.id === currentArea); return a ? `${a.icon} ${a.name} — ${a.gem}` : ''; })()}
              </div>
              </motion.div>
            </div>

            {/* Combo Indicator */}
            <AnimatePresence>
              {combo > 1 && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="mb-2"
                >
                  <Badge
                    className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-sm px-3 py-1"
                    style={{ borderColor: 'rgba(249,115,22,0.3)' }}
                  >
                    {combo}x COMBO
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Combo Timer Bar */}
            {combo > 0 && comboTimer > 0 && (
              <div className="w-32 h-1 bg-gray-800 rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full transition-all duration-100"
                  style={{ width: `${(comboTimer / 60) * 100}%` }}
                />
              </div>
            )}

            {/* Crystal Button */}
            <div
              ref={crystalRef}
              onClick={handleCrystalClick}
              className={`relative w-48 h-48 sm:w-56 sm:h-56 cursor-pointer ${goldenActive ? 'cursor-pointer' : ''}`}
            >
              {/* Ripples */}
              {ripples.map(r => (
                <motion.div
                  key={r.id}
                  initial={{ scale: 0, opacity: 0.6 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    left: r.x - 96,
                    top: r.y - 96,
                    width: 192,
                    height: 192,
                    border: `2px solid ${floatColors[r.type] || '#c084fc'}`,
                  }}
                />
              ))}

              {/* Main Crystal */}
              <motion.div
                animate={crystalPulse > 0 ? { scale: [1, 1 + crystalPulse * 0.05, 1] } : {}}
                transition={{ duration: 0.2 }}
                className={`w-full h-full flex items-center justify-center rounded-full transition-all duration-500 ${
                  goldenActive
                    ? 'golden-pulse bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-500 shadow-lg shadow-amber-500/30'
                    : `bg-gradient-to-br ${(() => { const a = AREAS.find(ar => ar.id === currentArea); return a ? a.gradient : 'from-gray-200 via-white to-cyan-100'; })()} shadow-lg`
                } hover:brightness-110 active:scale-95`}
                style={goldenActive ? undefined : {
                  boxShadow: `0 10px 30px ${(() => { const a = AREAS.find(ar => ar.id === currentArea); return a ? a.glowColor : 'rgba(200, 230, 255, 0.6)'; })()}`,
                }}
              >
                <span className="text-7xl sm:text-8xl drop-shadow-lg" role="img" aria-label="crystal">
                  {goldenActive ? '✨' : (() => { const a = AREAS.find(ar => ar.id === currentArea); return a ? a.icon : '💎'; })()}
                </span>
              </motion.div>

              {/* Golden Timer Ring */}
              {goldenActive && (
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 224 224">
                  <circle
                    cx="112" cy="112" r="108"
                    fill="none" stroke="rgba(251,191,36,0.3)" strokeWidth="3"
                  />
                  <circle
                    cx="112" cy="112" r="108"
                    fill="none" stroke="#fbbf24" strokeWidth="3"
                    strokeDasharray={`${2 * Math.PI * 108}`}
                    strokeDashoffset={`${2 * Math.PI * 108 * (1 - goldenTimer / 400)}`}
                    strokeLinecap="round"
                  />
                </svg>
              )}

              {/* Sparkle Particles */}
              {sparkles.map(s => (
                <div
                  key={s.id}
                  className="crystal-sparkle"
                  style={{
                    left: s.x,
                    top: s.y,
                    animationDelay: `${s.delay}s`,
                    background: goldenActive ? '#fbbf24' : undefined,
                    boxShadow: goldenActive
                      ? '0 0 6px #fbbf24, 0 0 12px rgba(251, 191, 36, 0.3)'
                      : undefined,
                  }}
                />
              ))}
            </div>

            {/* Golden crystal value hint */}
            {goldenActive && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-yellow-300 text-sm font-medium"
              >
                Click for {isFinite(goldenClickValue) ? fmtExpLog(goldenClickValue) : '0'} crystals!
              </motion.div>
            )}

            {/* Floating Texts - Stacked by type (golden/crit/normal) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {floatingTexts.map(ft => {
                const yOffset = ft.type === 'golden' ? -50 : ft.type === 'crit' ? 0 : 50;
                const age = Date.now() - ft.createdAt;
                // Stay fully visible for 10s, then fade over 2s
                const opacity = age > 10000 ? Math.max(0, 1 - (age - 10000) / 2000) : 1;
                // Use valueLog for precise display of huge numbers
                const displayStr = ft.type === 'milestone'
                  ? '🎉 MILESTONE!'
                  : (ft.valueLog != null && ft.valueLog > 15
                    ? fmtExpLog(ft.valueLog)
                    : fmt(ft.value));
                return (
                <div
                  key={ft.id}
                  className="absolute font-bold text-lg pointer-events-none select-none"
                  style={{
                    color: floatColors[ft.type],
                    left: 0,
                    top: ft.y + yOffset,
                    transform: `translateX(${ft.x}px)`,
                    textShadow: '0 0 8px currentColor',
                    opacity,
                    transition: 'opacity 0.3s ease-out',
                  }}
                >
                  {ft.type === 'milestone'
                    ? displayStr
                    : <>{displayStr}{ft.count > 1 && <span className="text-sm opacity-80 ml-0.5">×{ft.count}</span>}</>
                  }
                </div>
                );
              })}
            </div>

            {/* Quick Stats Below Crystal */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-400">
              <span>⚔️ Click: <span className="text-purple-300">{fmtExpLog(clickPowerLog)}</span></span>
              <span>⚙️ Auto: <span className="text-cyan-300">{fmtExpLog(autoRateLog)}/s</span></span>
              <span>✖️ Mult: <span className="text-amber-300">x{fmtExpLog(multiplierLog)}</span></span>
            </div>
            {prestigePoints > 0 && (
              <div className="mt-1 text-xs text-pink-400">
                🌟 Prestige Bonus: +{fmt(prestigePoints * 10)}% all income
              </div>
            )}

            {/* Lucky Spin Button */}
            <Button
              className="mt-4 bg-gradient-to-r from-yellow-600/80 to-amber-600/80 hover:from-yellow-500 hover:to-amber-500 text-white text-xs px-4 h-8 rounded-lg shadow-md shadow-yellow-500/10 cursor-pointer"
              onClick={() => setSpinOpen(true)}
            >
              🎰 Lucky Spin
            </Button>

            {/* Activity Log */}
            <div className="mt-3 w-full max-w-xs mx-auto">
              <ActivityLog entries={activityLog} />
            </div>
          </div>

          {/* ====== RIGHT: Tabs Panel ====== */}
          <div className="flex-1 flex flex-col min-h-0 p-4 lg:p-6">
            {/* Top Bar: Session Info */}
            <div className="flex items-center justify-end mb-4 flex-wrap gap-2">

              {/* Session Info */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>🕐 {fmtTime(sessionTime)}</span>
                <span>👆 {sessionClicks}</span>
                <span className="relative">
                  💾
                  {saveStatus === 'saving' && <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />}
                  {saveStatus === 'saved' && <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-green-400 rounded-full" />}
                  {saveStatus === 'error' && <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-400 rounded-full" />}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-7 text-gray-500 hover:text-red-400"
                  onClick={() => {
                    soundOn = !soundOn;
                  }}
                >
                  {soundOn ? '🔊' : '🔇'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-7 text-gray-500 hover:text-green-400"
                  onClick={async () => {
                    try {
                      setSaveStatus('saving');
                      const data = getSaveData();
                      const payload = { ...data, userId };
                      try { localStorage.setItem(`crystal_clicker_save_${userId}`, JSON.stringify(data)); } catch {}
                      await fetch('/api/clicker/save', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                      });
                      setSaveStatus('saved');
                      useGameStore.setState({ lastSaveTime: Date.now() });
                      setTimeout(() => setSaveStatus('idle'), 2000);
                    } catch {
                      setSaveStatus('error');
                      setTimeout(() => setSaveStatus('idle'), 3000);
                    }
                  }}
                >
                  💾 Save
                </Button>
              </div>
            </div>

            {/* Milestone Progress Bar */}
            {nextMilestone && (
              <div className="mb-4 bg-gray-900/40 rounded-lg px-3 py-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400">
                    {nextMilestone.icon} Next: {nextMilestone.label}
                  </span>
                  <span className="text-gray-500">{fmt(totalEarned, totalEarnedExp)} / {fmt(nextMilestone.value)}</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${milestoneProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as typeof activeTab)}
              className="flex-1 flex flex-col min-h-0"
            >
              <TabsList className="bg-gray-900/60 border border-gray-800/50 w-full grid grid-cols-6 mb-3">
                {[
                  { val: 'upgrades' as const, label: 'Upgrades', icon: '⬆️', cls: 'tab-glow-upgrades' },
                  { val: 'map' as const, label: 'Map', icon: '🗺️', cls: 'tab-glow-map' },
                  { val: 'achievements' as const, label: 'Achieve', icon: '🏆', cls: 'tab-glow-achievements' },
                  { val: 'stats' as const, label: 'Stats', icon: '📊', cls: 'tab-glow-stats' },
                  { val: 'prestige' as const, label: 'Prestige', icon: '🔄', cls: 'tab-glow-prestige' },
                  { val: 'shop' as const, label: 'Shop', icon: '🛒', cls: 'tab-glow-prestige' },
                ].map(t => (
                  <TabsTrigger
                    key={t.val}
                    value={t.val}
                    className={`text-xs sm:text-sm data-[state=active]:${t.cls} data-[state=active]:bg-gray-800/80 text-gray-400 data-[state=active]:text-white`}
                  >
                    <span className="mr-1">{t.icon}</span>
                    <span className="hidden sm:inline">{t.label}</span>
                    {t.val === 'achievements' && (
                      <Badge variant="secondary" className="ml-0.5 sm:ml-1.5 text-[10px] px-1 sm:px-1.5 py-0 bg-yellow-900/50 text-yellow-300">
                        {unlockedCount}/{achievements.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* ====== UPGRADES TAB ====== */}
              <TabsContent value="upgrades" className="flex-1 min-h-0 mt-0">
                <ScrollArea className="h-[calc(100vh-340px)] lg:h-[calc(100vh-320px)]">
                  <div className="space-y-2 pr-3 pb-4">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        {(() => { const a = AREAS.find(ar => ar.id === currentArea); return a ? `${a.icon} ${a.name} — ${a.gem}` : ''; })()} upgrades
                      </div>
                      {/* Buy Quantity Toggle */}
                      <div className="flex items-center gap-1 bg-gray-900/60 rounded-lg p-1">
                        {([1, 10, 100, 'max'] as BuyQuantity[]).map(q => (
                          <Button
                            key={String(q)}
                            size="sm"
                            variant={buyQuantity === q ? 'default' : 'ghost'}
                            onClick={() => setBuyQuantity(q)}
                            className={`text-xs px-3 h-7 ${buyQuantity === q ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'text-gray-400 hover:text-white'}`}
                          >
                            {q === 'max' ? 'Max' : `x${q}`}
                          </Button>
                        ))}
                      </div>
                    </div>
                    {['clickPower', 'autoRate', 'multiplier', 'goldenChance', 'critChance'].map(effect => {
                      const categoryUpgrades = areaUpgrades.filter(u => u.effect === effect);
                      if (categoryUpgrades.length === 0) return null;
                      return (
                        <div key={effect} className="mb-4">
                          <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${effectColors[effect]}`}>
                            {effectLabels[effect]}
                          </div>
                          {categoryUpgrades.map(u => {
                            const info = getBuyInfo(u);
                            return (
                              <Card
                                key={u.id}
                                className="bg-gray-900/40 border-gray-800/50 hover:border-gray-700/50 transition-all upgrade-card-hover mb-2"
                              >
                                <CardContent className="p-3 flex items-center gap-3">
                                  {/* Icon */}
                                  <div className="text-2xl w-10 h-10 flex items-center justify-center bg-gray-800/60 rounded-lg flex-shrink-0">
                                    {u.icon}
                                  </div>
                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-200 truncate">{u.name}</span>
                                      {u.level > 0 && (
                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-purple-900/40 text-purple-300">
                                        {u.maxLevel
                                        ? `Lv.${u.level}/${u.maxLevel}`
                                        : `Lv.${u.level}`}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">{u.description}</p>
                                    {u.maxLevel && (
                                      <Progress
                                        value={(u.level / u.maxLevel) * 100}
                                        className="h-1 mt-1 bg-gray-800"
                                      />
                                    )}
                                  </div>
                                  {/* Buy Button */}
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        disabled={!info.canBuy}
                                        onClick={() => handleBuy(u.id)}
                                        className={`flex-shrink-0 text-xs h-8 min-w-[80px] ${
                                          info.canBuy
                                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                        }`}
                                      >
                                        <span className="text-yellow-400 mr-1">💎</span>
                                        {info.label}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="left" className="bg-gray-900 border-gray-700 text-xs">
                                      {u.maxLevel
                                        ? `Max Level: ${u.maxLevel}`
                                        : `Next cost: ${fmtExpLog(getUpgradeCostLogSafe(u))}`}
                                    </TooltipContent>
                                  </Tooltip>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* ====== MAP TAB ====== */}
              <TabsContent value="map" className="flex-1 min-h-0 mt-0">
                <WorldMap />
              </TabsContent>

              {/* ====== ACHIEVEMENTS TAB ====== */}
              <TabsContent value="achievements" className="flex-1 min-h-0 mt-0">
                <ScrollArea className="h-[calc(100vh-340px)] lg:h-[calc(100vh-320px)]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-3 pb-4">
                    {achievements.map(a => (
                      <Card
                        key={a.id}
                        className={`transition-all ${
                          a.unlocked
                            ? 'bg-amber-900/20 border-amber-700/30'
                            : 'bg-gray-900/30 border-gray-800/30 opacity-60'
                        }`}
                      >
                        <CardContent className="p-3 flex items-center gap-3">
                          <div className={`text-2xl w-10 h-10 flex items-center justify-center rounded-lg flex-shrink-0 ${
                            a.unlocked ? 'bg-amber-900/40' : 'bg-gray-800/40 grayscale'
                          }`}>
                            {a.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-200 truncate">{a.name}</div>
                            <div className="text-xs text-gray-500 truncate">{a.description}</div>
                            {!a.unlocked && (
                              <div className="mt-1.5 h-1 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gray-700 rounded-full w-full opacity-40" />
                              </div>
                            )}
                          </div>
                          {a.unlocked && (
                            <Badge className="bg-amber-600/20 text-amber-400 border-amber-600/30 text-[10px]">
                              ✓
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* ====== STATS TAB ====== */}
              <TabsContent value="stats" className="flex-1 min-h-0 mt-0">
                <ScrollArea className="h-[calc(100vh-340px)] lg:h-[calc(100vh-320px)]">
                  <div className="space-y-3 pr-3 pb-4">
                    {/* Resources */}
                    <Card className="bg-gray-900/40 border-gray-800/50">
                      <CardHeader className="pb-2 pt-3 px-4">
                        <CardTitle className="text-sm text-gray-300">Resources</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-3 space-y-2">
                        <StatRow label="Playtime" value={fmtTime(sessionTime)} icon="🕐" />
                        <StatRow label="Crystals" value={fmt(crystals, crystalsExp)} icon="💎" />
                        <StatRow label="Total Earned" value={fmt(totalEarned, totalEarnedExp)} icon="💰" />
                        <StatRow label="Click Power" value={fmtExpLog(clickPowerLog)} icon="⚔️" />
                        <StatRow label="Auto Rate" value={`${fmtExpLog(autoRateLog)}/s`} icon="⚙️" />
                        <StatRow label="Multiplier" value={`x${fmtExpLog(multiplierLog)}`} icon="✖️" />
                        <StatRow label="Prestige Points" value={fmt(prestigePoints)} icon="🌟" />
                      </CardContent>
                    </Card>

                    {/* Clicking */}
                    <Card className="bg-gray-900/40 border-gray-800/50">
                      <CardHeader className="pb-2 pt-3 px-4">
                        <CardTitle className="text-sm text-gray-300">Clicking</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-3 space-y-2">
                        <StatRow label="Total Clicks" value={fmt(totalClicks)} icon="👆" />
                        <StatRow label="Session Clicks" value={fmt(sessionClicks)} icon="🖱️" />
                        <StatRow label="Click Speed" value={`${clicksPerSecond}/s`} icon="⚡" />
                        <StatRow label="Best CPS" value={`${bestSessionCps}/s`} icon="🚀" />
                        <StatRow label="Max Combo" value={`${maxCombo}x`} icon="🔥" />
                        <StatRow label="Crit Chance" value={`${(critChance * 100).toFixed(1)}%`} icon="🎯" />
                        <StatRow label="Total Crits" value={fmt(totalCrits)} icon="💥" />
                      </CardContent>
                    </Card>

                    {/* Special */}
                    <Card className="bg-gray-900/40 border-gray-800/50">
                      <CardHeader className="pb-2 pt-3 px-4">
                        <CardTitle className="text-sm text-gray-300">Special</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-3 space-y-2">
                        <StatRow label="Golden Clicks" value={fmt(goldenClicks)} icon="🥇" />
                        <StatRow label="Golden Chance" value={`${(goldenChance * 100).toFixed(1)}%`} icon="🌟" />
                        <StatRow label="Events Experienced" value={String(totalEvents)} icon="🎉" />
                        <StatRow label="Total Upgrades" value={String(totalUpgrades)} icon="⬆️" />
                        <StatRow label="Prestige Count" value={String(prestige)} icon="🔄" />
                        <StatRow label="Session Earned" value={fmt(sessionEarned)} icon="📈" />
                        {Object.entries(shopBoosts).some(([, v]) => v > 0) && (
                          <>
                            <Separator className="bg-gray-700/30 my-1" />
                            <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Active Boosts</div>
                            {shopBoosts.doubleClick > 0 && <StatRow label="2x Click Power" value={`${Math.ceil(shopBoosts.doubleClick / 10)}s`} icon="👆" />}
                            {shopBoosts.tripleAuto > 0 && <StatRow label="3x Auto Income" value={`${Math.ceil(shopBoosts.tripleAuto / 10)}s`} icon="⚙️" />}
                            {shopBoosts.multBoost > 0 && <StatRow label="+50% Multiplier" value={`${Math.ceil(shopBoosts.multBoost / 10)}s`} icon="📈" />}
                            {shopBoosts.critBoost > 0 && <StatRow label="+10% Crit Chance" value={`${Math.ceil(shopBoosts.critBoost / 10)}s`} icon="🎯" />}
                            {shopBoosts.doubleGolden > 0 && <StatRow label="2x Golden Chance" value={`${Math.ceil(shopBoosts.doubleGolden / 10)}s`} icon="🌟" />}
                            {shopBoosts.luckyBoost > 0 && <StatRow label="3x Golden Luck" value={`${Math.ceil(shopBoosts.luckyBoost / 10)}s`} icon="🍀" />}
                            {shopBoosts.doubleAll > 0 && <StatRow label="2x All Income" value={`${Math.ceil(shopBoosts.doubleAll / 10)}s`} icon="🚀" />}
                          </>
                        )}
                        {ownedPremiumItems.length > 0 && (
                          <>
                            <Separator className="bg-amber-700/20 my-1" />
                            <div className="text-[10px] uppercase tracking-wider text-amber-500/60 font-semibold flex items-center gap-1"><Crown className="w-3 h-3" /> Premium Perks</div>
                            {ownedPremiumItems.includes('auto_save_pro') && <StatRow label="Auto-Save Pro" value="Active" icon="💾" />}
                            {ownedPremiumItems.includes('offline_master') && <StatRow label="Offline Master" value="75% eff / 16hr" icon="🌙" />}
                            {ownedPremiumItems.includes('double_daily') && <StatRow label="Double Daily" value="2x rewards" icon="📅" />}
                            {ownedPremiumItems.includes('golden_aura') && <StatRow label="Golden Aura" value="+5% chance" icon="✨" />}
                            {ownedPremiumItems.includes('auto_golden') && <StatRow label="Auto-Golden" value="Auto 15s" icon="🧲" />}
                            {ownedPremiumItems.includes('golden_power') && <StatRow label="Golden Power" value="200x base" icon="🌟" />}
                            {ownedPremiumItems.includes('prestige_champion') && <StatRow label="Prestige Champ" value="+25% pts" icon="👑" />}
                            {ownedPremiumItems.includes('prestige_start') && <StatRow label="Prestige Start" value="+0.5x/lvl" icon="🚀" />}
                            {ownedPremiumItems.includes('combo_king') && <StatRow label="Combo King" value="2x window" icon="🔥" />}
                            {ownedPremiumItems.includes('crit_master') && <StatRow label="Crit Master" value="+5% chance" icon="💎" />}
                            {ownedPremiumItems.includes('crit_power') && <StatRow label="Devastating" value="+1x mult" icon="⚡" />}
                          </>
                        )}
                      </CardContent>
                    </Card>

                    {/* Milestones */}
                    <Card className="bg-gray-900/40 border-gray-800/50">
                      <CardHeader className="pb-2 pt-3 px-4">
                        <CardTitle className="text-sm text-gray-300">Milestones</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-3">
                        <div className="space-y-1.5">
                          {milestones.map(m => (
                            <div key={m.id} className="flex items-center justify-between text-xs">
                              <span className={m.celebrated ? 'text-yellow-300' : 'text-gray-600'}>
                                {m.icon} {m.label}
                              </span>
                              {m.celebrated && <span className="text-yellow-500">✓</span>}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Reset */}
                    <Separator className="bg-gray-800/50" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Danger Zone</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-red-500 hover:text-red-400 hover:bg-red-900/20"
                        onClick={() => {
                          if (confirm('Are you sure you want to reset ALL progress? This cannot be undone!')) {
                            resetGame();
                            fetch('/api/clicker/reset', { method: 'POST' });
                          }
                        }}
                      >
                        🗑️ Reset Game
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* ====== PRESTIGE TAB ====== */}
              <TabsContent value="prestige" className="flex-1 min-h-0 mt-0">
                <ScrollArea className="h-[calc(100vh-340px)] lg:h-[calc(100vh-320px)]">
                  <div className="space-y-4 pr-3 pb-4">
                    <Card className="bg-gradient-to-br from-pink-900/20 to-purple-900/20 border-pink-800/30">
                      <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="text-lg text-pink-300 flex items-center gap-2">
                          🔄 Prestige System
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-4 space-y-3">
                        <p className="text-sm text-gray-400">
                          Reset your crystals and upgrades to earn <span className="text-pink-300 font-medium">Prestige Points</span>,
                          which permanently boost all income by <span className="text-pink-300 font-medium">+10% per point</span>.
                        </p>
                        <Separator className="bg-gray-700/30" />
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Current Prestige</span>
                            <span className="text-pink-300 font-medium">{prestige} times</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Prestige Points</span>
                            <span className="text-pink-300 font-medium">{prestigePoints}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Current Bonus</span>
                            <span className="text-pink-300 font-medium">+{prestigePoints * 10}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Total Earned</span>
                            <span className="text-gray-300">{fmt(totalEarned, totalEarnedExp)}</span>
                          </div>
                          <Separator className="bg-gray-700/30" />
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Points on Prestige</span>
                            <span className="text-yellow-300 font-bold">
                              {(() => {
                                const effectiveLog = toLogSafe(totalEarned) + totalEarnedExp;
                                const ptsLog = 0.5 * (effectiveLog - 3); // log10(sqrt(total/1000))
                                if (effectiveLog < 3) return 'Need 1,000 total';
                                const pts = ptsLog > 15 ? '1e15+' : String(Math.floor(Math.pow(10, ptsLog)));
                                return `+${pts}`;
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">New Total Bonus</span>
                            <span className="text-pink-200 font-medium">
                              {(() => {
                                const effectiveLog = toLogSafe(totalEarned) + totalEarnedExp;
                                const ptsLog = 0.5 * (effectiveLog - 3);
                                if (effectiveLog < 3) return '—';
                                const newPts = ptsLog > 15 ? 1e15 : Math.floor(Math.pow(10, ptsLog));
                                return `+${(prestigePoints + newPts) * 10}%`;
                              })()}
                            </span>
                          </div>
                        </div>
                        <Button
                          className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-medium"
                          disabled={toLogSafe(totalEarned) + totalEarnedExp < 3}
                          onClick={() => {
                            if (confirm('Prestige will reset your crystals and upgrades. You keep achievements, prestige points, and golden/crit stats. Continue?')) {
                              performPrestige();
                              sfxMilestone();
                            }
                          }}
                        >
                          {toLogSafe(totalEarned) + totalEarnedExp >= 3 ? '🔄 Perform Prestige' : '🔒 Earn 1,000 total crystals first'}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Prestige Multiplier Info */}
                    <Card className="bg-gray-900/40 border-gray-800/50">
                      <CardHeader className="pb-2 pt-3 px-4">
                        <CardTitle className="text-sm text-gray-300">Prestige Tiers</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-3">
                        <div className="space-y-1.5 text-xs">
                          {[
                            { pts: 1, bonus: '10%', earned: '1K' },
                            { pts: 3, bonus: '30%', earned: '9K' },
                            { pts: 5, bonus: '50%', earned: '25K' },
                            { pts: 10, bonus: '100%', earned: '100K' },
                            { pts: 20, bonus: '200%', earned: '400K' },
                            { pts: 50, bonus: '500%', earned: '2.5M' },
                          ].map(t => (
                            <div key={t.pts} className="flex items-center justify-between text-gray-500">
                              <span>{t.pts} pts → +{t.bonus} bonus</span>
                              <span className="text-gray-600">({t.earned} total)</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* ====== SHOP TAB ====== */}
              <TabsContent value="shop" className="flex-1 min-h-0 mt-0">
                <ScrollArea className="h-[calc(100vh-340px)] lg:h-[calc(100vh-320px)]">
                  <div className="space-y-3 pr-3 pb-4">
                    {/* Section 0: Premium Shop — Real Money Items */}
                    <Card className="bg-gradient-to-b from-amber-950/30 to-gray-900/40 border-amber-500/20">
                      <CardHeader className="pb-2 pt-3 px-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm text-amber-300 flex items-center gap-2">
                            <Crown className="w-4 h-4" /> Premium Shop
                          </CardTitle>
                          <span className="text-[10px] text-amber-500/60">Permanent Upgrades</span>
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 pb-3">
                        {/* Filter tabs */}
                        <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
                          {['all', 'efficiency', 'golden', 'prestige', 'combat', 'qol'].map(cat => (
                            <button
                              key={cat}
                              onClick={() => setPremiumFilter(cat)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${
                                premiumFilter === cat
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-gray-800/40 text-gray-500 border border-transparent hover:text-gray-400'
                              }`}
                            >
                              {cat === 'all' ? '💎 All' : cat === 'efficiency' ? '⚡ Efficiency' : cat === 'golden' ? '✨ Golden' : cat === 'prestige' ? '👑 Prestige' : cat === 'combat' ? '⚔️ Combat' : '🔧 QOL'}
                              {cat !== 'all' && (
                                <span className="ml-1 text-gray-600">{getPremiumItemsByCategory(cat).length}</span>
                              )}
                            </button>
                          ))}
                        </div>

                        {/* Featured items banner */}
                        {premiumFilter === 'all' && (
                          <div className="mb-3 p-2.5 rounded-lg bg-gradient-to-r from-amber-900/20 via-yellow-900/20 to-amber-900/20 border border-amber-500/10">
                            <p className="text-[10px] text-amber-400/60 mb-2 font-medium uppercase tracking-wider">⭐ Featured</p>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                              {getFeaturedItems().map(item => {
                                const owned = ownedPremiumItems.includes(item.id);
                                const rarity = RARITY_COLORS[item.rarity];
                                return (
                                  <button
                                    key={item.id}
                                    onClick={() => !owned && setPremiumPurchaseDialog({ item, purchasing: false })}
                                    className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                                      owned
                                        ? 'bg-green-900/20 border-green-500/20 cursor-default'
                                        : `${rarity.bg} ${rarity.border} hover:scale-[1.02] cursor-pointer ${rarity.glow}`
                                    }`}
                                  >
                                    <span className="text-xl">{item.icon}</span>
                                    <div className="text-left">
                                      <p className={`text-xs font-medium ${owned ? 'text-green-400' : rarity.text}`}>{item.name}</p>
                                      <p className="text-[10px] text-gray-500">{owned ? '✓ Owned' : '$' + item.price.toFixed(2)}</p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* All premium items grid */}
                        <div className="space-y-2">
                          {PREMIUM_ITEMS
                            .filter(item => premiumFilter === 'all' || item.category === premiumFilter)
                            .map(item => {
                              const owned = ownedPremiumItems.includes(item.id);
                              const rarity = RARITY_COLORS[item.rarity];
                              return (
                                <div
                                  key={item.id}
                                  className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                                    owned
                                      ? 'bg-green-900/10 border-green-500/15'
                                      : `${rarity.bg} ${rarity.border} hover:border-opacity-60`
                                  }`}
                                >
                                  <div className={`text-2xl w-10 h-10 flex items-center justify-center rounded-lg flex-shrink-0 relative ${
                                    owned ? 'bg-green-900/30' : 'bg-gray-800/60'
                                  }`}>
                                    {item.icon}
                                    {!owned && item.rarity !== 'common' && (
                                      <span className={`absolute -top-1 -right-1 px-1 py-0 rounded text-[8px] font-bold ${
                                        item.rarity === 'rare' ? 'bg-blue-500/80 text-white'
                                        : item.rarity === 'epic' ? 'bg-purple-500/80 text-white'
                                        : 'bg-amber-500/80 text-black'
                                      }`}>{rarity.label}</span>
                                    )}
                                    {owned && <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center text-[7px]">✓</span>}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className={`text-sm font-medium ${owned ? 'text-green-400' : rarity.text}`}>{item.name}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                                    <p className="text-[10px] text-gray-600 mt-0.5">{item.perkDescription}</p>
                                  </div>
                                  <div className="flex-shrink-0 text-right">
                                    {owned ? (
                                      <span className="text-xs text-green-500 font-medium px-3 py-1.5 rounded-md bg-green-900/20">Owned ✓</span>
                                    ) : (
                                      <Button
                                        size="sm"
                                        onClick={() => setPremiumPurchaseDialog({ item, purchasing: false })}
                                        className={`text-xs h-8 min-w-[70px] font-medium ${
                                          item.rarity === 'legendary'
                                            ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-black'
                                            : item.rarity === 'epic'
                                            ? 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white'
                                            : item.rarity === 'rare'
                                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white'
                                            : 'bg-gray-600 hover:bg-gray-500 text-white'
                                        }`}
                                      >
                                        <span className="mr-1">💎</span>{'$'}{item.price.toFixed(2)}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>

                        {ownedPremiumItems.length > 0 && (
                          <p className="text-[10px] text-gray-600 mt-2 text-center">{ownedPremiumItems.length} of {PREMIUM_ITEMS.length} premium items owned</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Section 1: Boosts */}
                    <Card className="bg-gray-900/40 border-gray-800/50">
                      <CardHeader className="pb-2 pt-3 px-4">
                        <CardTitle className="text-sm text-gray-300">⚡ Temporary Boosts</CardTitle>
                        <p className="text-[10px] text-gray-600 -mt-1">Cost: 30min auto income each</p>
                      </CardHeader>
                      <CardContent className="px-4 pb-3 space-y-2">
                        {[
                          { id: 'doubleClick', icon: '👆', name: '2x Click Power', desc: 'Double your click power', dur: '60s', maxDur: 600 },
                          { id: 'tripleAuto', icon: '⚙️', name: '3x Auto Income', desc: 'Triple your passive income', dur: '60s', maxDur: 600 },
                          { id: 'multBoost', icon: '📈', name: '+50% Multiplier', desc: 'Boosts all multipliers by 50%', dur: '90s', maxDur: 900 },
                          { id: 'critBoost', icon: '🎯', name: '+10% Crit Chance', desc: 'Extra 10% critical hit chance', dur: '60s', maxDur: 600 },
                          { id: 'doubleGolden', icon: '🌟', name: '2x Golden Chance', desc: 'Double golden spawn rate', dur: '2min', maxDur: 1200 },
                          { id: 'luckyBoost', icon: '🍀', name: '3x Golden Luck', desc: 'Triple golden spawn rate', dur: '2min', maxDur: 1200 },
                        ].map(b => {
                          const timer = shopBoosts[b.id as keyof typeof shopBoosts] as number;
                          const isActive = timer > 0;
                          const myLog = toLogSafe(crystals) + crystalsExp;
                          const costLog = autoRateLog + Math.log10(1800);
                          const canBuy = myLog >= costLog && !isActive;
                          return (
                            <div key={b.id} className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${isActive ? 'bg-green-900/15 border-green-500/20' : 'bg-gray-800/30 border-transparent hover:border-gray-700/50'}`}>
                              <div className="text-xl w-10 h-10 flex items-center justify-center bg-gray-800/60 rounded-lg flex-shrink-0 relative">
                                {b.icon}
                                {isActive && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-medium text-gray-200">{b.name}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500">{b.dur}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">{b.desc}</p>
                                {isActive && (
                                  <div className="mt-1">
                                    <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                      <div className="h-full bg-green-500 rounded-full transition-all duration-100" style={{ width: `${Math.min(100, (timer / b.maxDur) * 100)}%` }} />
                                    </div>
                                    <p className="text-[10px] text-green-400 mt-0.5">{Math.ceil(timer / 10)}s left</p>
                                  </div>
                                )}
                              </div>
                              <Button
                                size="sm"
                                disabled={!canBuy}
                                onClick={() => { if (buyShopBoost(b.id)) sfxBuy(); }}
                                className={`flex-shrink-0 text-xs h-8 min-w-[60px] ${
                                  isActive
                                    ? 'bg-green-900/30 text-green-400 border border-green-500/30 cursor-default'
                                    : canBuy
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                }`}
                              >
                                {isActive ? 'Active' : 'Buy'}
                              </Button>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>

                    {/* Section 2: Free Rewards */}
                    <Card className="bg-gray-900/40 border-gray-800/50">
                      <CardHeader className="pb-2 pt-3 px-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm text-gray-300">🎁 Free Rewards</CardTitle>
                          {adCooldown > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-500">
                              {Math.ceil(adCooldown / 10)}s cooldown
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 pb-3 space-y-2">
                        {[
                          { type: 'doubleAll', icon: '🚀', name: '2x All Income', desc: 'Double ALL income for 5 minutes', tag: '5 min boost' },
                          { type: 'instantEarned', icon: '💰', name: '1% of Total Earned', desc: 'Instantly gain 1% of lifetime earnings', tag: 'instant' },
                          { type: 'forceGolden', icon: '🌟', name: 'Golden Crystal', desc: 'Spawn a golden crystal immediately', tag: 'instant' },
                        ].map(r => {
                          const isWatching = adTimer?.type === r.type;
                          const isDisabled = adCooldown > 0 || isWatching;
                          return (
                            <div key={r.type} className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${isWatching ? 'bg-cyan-900/15 border-cyan-500/20' : 'bg-gray-800/30 border-transparent hover:border-gray-700/50'}`}>
                              <div className="text-xl w-10 h-10 flex items-center justify-center bg-gray-800/60 rounded-lg flex-shrink-0 relative">
                                {r.icon}
                                {isWatching && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-500 rounded-full animate-pulse" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-medium text-gray-200">{r.name}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500">{r.tag}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
                                {isWatching && (
                                  <div className="mt-1">
                                    <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                      <div className="h-full bg-cyan-500 rounded-full transition-all duration-1000" style={{ width: `${((30 - adTimer.remaining) / 30) * 100}%` }} />
                                    </div>
                                    <p className="text-[10px] text-cyan-400 mt-0.5">{adTimer.remaining}s...</p>
                                  </div>
                                )}
                              </div>
                              {isWatching ? (
                                <div className="flex-shrink-0 text-xs text-cyan-400 font-mono animate-pulse w-[70px] text-center">
                                  Waiting
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  disabled={isDisabled}
                                  onClick={() => setAdTimer({ type: r.type, remaining: 30 })}
                                  className={`flex-shrink-0 text-xs h-8 min-w-[70px] ${
                                    isDisabled
                                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                      : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                                  }`}
                                >
                                  {isDisabled ? 'Wait' : 'Claim'}
                                </Button>
                              )}
                            </div>
                          );
                        })}
                        <p className="text-[10px] text-gray-600 text-center pt-1">One reward per 3 minutes</p>
                      </CardContent>
                    </Card>

                    {/* Section 3: Crystal Exchange */}
                    <Card className="bg-gray-900/40 border-gray-800/50">
                      <CardHeader className="pb-2 pt-3 px-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm text-gray-300">💎 Crystal Exchange</CardTitle>
                          <span className="text-[10px] text-gray-600">1:1 trade rate</span>
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 pb-3 space-y-2">
                        {[
                          { secs: 60, icon: '⚡', label: '1 Minute', sub: 'of auto income' },
                          { secs: 300, icon: '🔥', label: '5 Minutes', sub: 'of auto income' },
                          { secs: 1800, icon: '💫', label: '30 Minutes', sub: 'of auto income' },
                          { secs: 7200, icon: '🌟', label: '2 Hours', sub: 'of auto income' },
                        ].map(q => {
                          const costLog = autoRateLog + Math.log10(q.secs);
                          const myLog = toLogSafe(crystals) + crystalsExp;
                          const canBuy = myLog >= costLog && autoRateLog > -Infinity;
                          return (
                            <div key={q.secs} className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${canBuy ? 'bg-gray-800/30 border-transparent hover:border-amber-500/20' : 'bg-gray-800/20 border-transparent opacity-60'}`}>
                              <div className="text-xl w-10 h-10 flex items-center justify-center bg-amber-900/20 rounded-lg flex-shrink-0">
                                {q.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium text-gray-200">Buy {q.label}</span>
                                <p className="text-[10px] text-gray-500">{q.sub}</p>
                              </div>
                              <Button
                                size="sm"
                                disabled={!canBuy}
                                onClick={() => { if (buyInstantCrystals(q.secs)) sfxBuy(); }}
                                className={`flex-shrink-0 text-xs h-8 min-w-[80px] ${
                                  canBuy
                                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                }`}
                              >
                                <span className="text-yellow-400 mr-1">💎</span>{fmtExpLog(costLog)}
                              </Button>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* ====== FOOTER ====== */}
        <footer className="relative z-10 border-t border-gray-800/50 bg-gray-950/50 backdrop-blur-sm px-4 py-2 mt-auto">
          <div className="flex items-center justify-between text-xs text-gray-600 max-w-5xl mx-auto">
            <span>Crystal Clicker v1.0</span>
            <div className="flex items-center gap-3">
              {isNative && (
                <span className={isOnline ? 'text-green-500' : 'text-red-500'} title={isOnline ? 'Online' : 'Offline - check connection'}>
                  {isOnline ? '📶' : '📵'}
                </span>
              )}
              <button onClick={() => setSettingsOpen(true)} className="text-gray-500 hover:text-gray-300 transition-colors" title="Settings">
              <Settings className="w-3.5 h-3.5" />
            </button>
            <span className="text-gray-600" title="Save status">
                💾 {saveAge}
              </span>
              <span className={autoRateLog > -Infinity ? 'cps-glow text-cyan-400' : ''}>
                ⚡ {clicksPerSecond} cps
              </span>
              <span>🏆 {unlockedCount}/{achievements.length}</span>
              {prestige > 0 && <span className="text-pink-500">✨ P{prestige}</span>}
            </div>
          </div>
        </footer>

        {/* ====== OFFLINE EARNINGS DIALOG ====== */}
        <Dialog open={showOfflineBonus} onOpenChange={() => {}}>
          <DialogContent className="bg-gray-900 border-gray-700 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl text-center text-green-300">
                Welcome Back! 🌙
              </DialogTitle>
              <DialogDescription className="text-center text-gray-400">
                You earned crystals while you were away
              </DialogDescription>
            </DialogHeader>
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-gradient-green mb-2">
                +{fmt(offlineEarned)}
              </div>
              <p className="text-sm text-gray-500">
                Offline earnings (50% efficiency, 8hr max)
              </p>
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={claimOfflineEarnings}
              >
                Claim Crystals 💎
              </Button>
              <Button
                variant="ghost"
                className="w-full text-gray-500 hover:text-gray-300"
                onClick={dismissOfflineBonus}
              >
                Dismiss
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ====== DAILY REWARD DIALOG ====== */}
        <Dialog open={!!dailyReward} onOpenChange={() => undefined}>
          <DialogContent className="bg-gray-900 border-yellow-700/50 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl text-center text-yellow-300">🎁 Daily Reward!</DialogTitle>
              <DialogDescription className="text-center text-gray-400">Day {dailyReward?.day} of 7 — Streak: {dailyReward?.streak}</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex justify-center gap-1.5 mb-6">
                {[1,2,3,4,5,6,7].map(d => (
                  <div key={d} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    (dailyReward?.day ?? 0) > d ? 'bg-yellow-600/40 text-yellow-300 border border-yellow-500/50'
                    : (dailyReward?.day ?? 0) === d ? 'bg-yellow-500 text-black border-2 border-yellow-300 scale-110'
                    : 'bg-gray-800/60 text-gray-600 border border-gray-700/50'}
                  }`}>{d === 7 ? '🌟' : d}</div>
                ))}
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gradient-gold mb-2">+{dailyReward ? fmt(dailyReward.crystals) : '0'}</div>
                <p className="text-sm text-gray-400">crystals</p>
                {dailyReward && dailyReward.prestige > 0 && <p className="text-sm text-pink-400 mt-2 font-medium">+{dailyReward.prestige} Prestige Point{dailyReward.prestige > 1 ? 's' : ''} 🌟</p>}
              </div>
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white font-medium" onClick={() => {
                if (!dailyReward || !userId) return;
                claimReward(dailyReward.crystals, dailyReward.prestige || undefined);
                try { localStorage.setItem(`crystal_clicker_daily_${userId}`, JSON.stringify({ lastClaim: Date.now(), streak: dailyReward.streak })); } catch { /* ignore */ }
                sfxMilestone(); setDailyReward(null);
              }}>Claim Reward 🎁</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ====== LUCKY SPIN DIALOG ====== */}
        <LuckySpin open={spinOpen} onClose={() => setSpinOpen(false)} onReward={(reward) => {
          if (reward.type === 'crystals') { claimReward(reward.value); addLog('💎', reward.description, '#a855f7'); }
          else if (reward.type === 'golden') { addLog('🌟', reward.description, '#fbbf24'); }
          else { addLog('🎰', reward.description, '#22d3ee'); }
          sfxMilestone();
        }} crystals={crystals} crystalsExp={crystalsExp} autoRateLog={autoRateLog} />

        {/* PREMIUM PURCHASE DIALOG */}
        <Dialog open={!!premiumPurchaseDialog} onOpenChange={(open: boolean) => { if (!open) setPremiumPurchaseDialog(null); }}>
          <DialogContent className="bg-gray-900 border-amber-500/30 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl text-center text-amber-300 flex items-center justify-center gap-2">
                <Crown className="w-5 h-5" />
                Purchase Premium Item
              </DialogTitle>
              <DialogDescription className="text-center text-gray-400">This is a one-time permanent purchase</DialogDescription>
            </DialogHeader>
            {premiumPurchaseDialog && (
              <div className="py-4">
                <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4 bg-gray-800/60 border border-amber-500/30">
                  {premiumPurchaseDialog.item.icon}
                </div>
                <p className="text-center text-lg font-bold text-amber-300">{premiumPurchaseDialog.item.name}</p>
                <p className="text-center text-sm text-gray-400 mt-1">{premiumPurchaseDialog.item.description}</p>
                <div className="mt-4 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                  <p className="text-xs text-gray-500 mb-1">What you get:</p>
                  <p className="text-sm text-gray-300">{premiumPurchaseDialog.item.perkDescription}</p>
                </div>
                <div className="mt-4 text-center">
                  <span className="text-3xl font-bold text-white">{'$'}{premiumPurchaseDialog.item.price.toFixed(2)}</span>
                  <p className="text-xs text-gray-500 mt-1">One-time purchase</p>
                </div>
              </div>
            )}
            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button
                className="w-full font-medium bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
                onClick={() => { if (premiumPurchaseDialog) handlePremiumPurchase(premiumPurchaseDialog.item); }}
                disabled={premiumPurchaseDialog?.purchasing}
              >
                {premiumPurchaseDialog?.purchasing
                  ? <span className="flex items-center gap-2"><span className="animate-spin">⏳</span> Processing...</span>
                  : <span>Purchase for {'$'}{premiumPurchaseDialog?.item.price.toFixed(2)}</span>}
              </Button>
              <Button variant="ghost" className="w-full text-gray-500 hover:text-gray-300" onClick={() => setPremiumPurchaseDialog(null)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* In-Game Legal Document Dialogs */}
        <Dialog open={legalTosOpen} onOpenChange={setLegalTosOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden bg-[#12122a] border-white/10 text-white/90">
            <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-purple-500/15 text-purple-400">
                  <FileText className="w-5 h-5" />
                </div>
                <DialogTitle className="text-xl font-bold text-white">Terms of Service</DialogTitle>
              </div>
            </DialogHeader>
            <Separator className="bg-white/10 shrink-0" />
            <ScrollArea className="flex-1 max-h-[72vh]">
              <div className="px-6 py-5 pr-4">
                <pre className="text-[13px] text-white/55 leading-relaxed whitespace-pre-wrap font-sans m-0">
                  {TERMS_OF_SERVICE}
                </pre>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        <Dialog open={legalPpOpen} onOpenChange={setLegalPpOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden bg-[#12122a] border-white/10 text-white/90">
            <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-cyan-500/15 text-cyan-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <DialogTitle className="text-xl font-bold text-white">Privacy Policy</DialogTitle>
              </div>
            </DialogHeader>
            <Separator className="bg-white/10 shrink-0" />
            <ScrollArea className="flex-1 max-h-[72vh]">
              <div className="px-6 py-5 pr-4">
                <pre className="text-[13px] text-white/55 leading-relaxed whitespace-pre-wrap font-sans m-0">
                  {PRIVACY_POLICY}
                </pre>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* ====== PWA INSTALL BANNER ====== */}
        <AnimatePresence>
          {pwa.showPrompt && pwa.canInstall && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-16 left-3 right-3 sm:left-auto sm:right-4 sm:bottom-4 sm:w-80 z-50 bg-gray-900 border border-purple-500/30 rounded-xl p-3 shadow-lg shadow-purple-500/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                  <Download className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200">Install Crystal Clicker</p>
                  <p className="text-[11px] text-gray-500">Add to home screen for the best experience</p>
                </div>
                <Button size="sm" onClick={pwa.install} className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8 flex-shrink-0">
                  Install
                </Button>
                <button onClick={pwa.dismiss} className="text-gray-600 hover:text-gray-400 ml-1">
                  <span className="text-xs">✕</span>
                </button>
              </div>
            </motion.div>
          )}
          {pwa.showPrompt && pwa.isIOS && !pwa.isInstalled && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-16 left-3 right-3 sm:left-auto sm:right-4 sm:bottom-4 sm:w-80 z-50 bg-gray-900 border border-purple-500/30 rounded-xl p-3 shadow-lg shadow-purple-500/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                  <Download className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200">Install on iPhone</p>
                  <p className="text-[11px] text-gray-500">Tap Share, then "Add to Home Screen"</p>
                </div>
                <button onClick={pwa.dismiss} className="text-gray-600 hover:text-gray-400 ml-1">
                  <span className="text-xs">✕</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ====== SETTINGS DIALOG ====== */}
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent className="bg-gray-900 border-gray-700 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg text-gray-200 flex items-center gap-2">
                <Settings className="w-4 h-4" /> Settings
              </DialogTitle>
              <DialogDescription className="text-gray-500">Game preferences and information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {/* Sound */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                <div className="flex items-center gap-2">
                  {soundOn ? <Volume2 className="w-4 h-4 text-gray-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
                  <div>
                    <p className="text-sm text-gray-300">Sound Effects</p>
                    <p className="text-[10px] text-gray-600">Click, purchase, and event sounds</p>
                  </div>
                </div>
                <button
                  onClick={() => { soundOn = !soundOn; setSettingsOpen(s => !s); }}
                  className={`relative w-10 h-6 rounded-full transition-colors ${soundOn ? 'bg-purple-600' : 'bg-gray-700'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${soundOn ? 'left-5' : 'left-1'}`} />
                </button>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="p-3 rounded-lg bg-gray-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <Keyboard className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-300">Keyboard Shortcuts</p>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-gray-500">Switch tabs</span><span className="text-gray-400 font-mono">1-6</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Buy quantity</span><span className="text-gray-400 font-mono">Q</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Quick save</span><span className="text-gray-400 font-mono">Ctrl+S</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Lucky spin</span><span className="text-gray-400 font-mono">W</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Settings</span><span className="text-gray-400 font-mono">Esc</span></div>
                </div>
              </div>

              {/* Install App */}
              {!pwa.isInstalled && (
                <div className="p-3 rounded-lg bg-gray-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="w-4 h-4 text-purple-400" />
                    <p className="text-sm text-gray-300">Install App</p>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">Install on your device for the best experience.</p>
                  {pwa.canInstall ? (
                    <Button size="sm" onClick={pwa.install} className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs">
                      Install Now
                    </Button>
                  ) : pwa.isIOS ? (
                    <p className="text-[11px] text-gray-400">Use the Share button, then "Add to Home Screen"</p>
                  ) : (
                    <p className="text-[11px] text-gray-400">Use your browser menu to install this app</p>
                  )}
                </div>
              )}

              {/* Version */}
              <div className="text-center pt-2">
                <p className="text-[10px] text-gray-700">Crystal Clicker v1.0</p>
                <p className="text-[10px] text-gray-700">Session: {fmtTime(sessionTime)}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

// ====== Stat Row Component ======
function StatRow({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500 flex items-center gap-1.5">
        <span>{icon}</span>
        {label}
      </span>
      <span className="text-sm text-gray-300 font-medium">{value}</span>
    </div>
  );
}