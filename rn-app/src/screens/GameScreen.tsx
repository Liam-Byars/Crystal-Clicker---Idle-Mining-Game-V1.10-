import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore, AREAS } from '../stores/gameStore';
import type { ActiveTab, FloatingText as FloatingTextType } from '@shared/game/types';
import { api } from '../services/api';
import { storage } from '../services/storage';
import { Tabs } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StatRow } from '../components/ui/StatRow';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import { CrystalArea, fmt, fmtExpLog, toLogSafe } from '../components/game/CrystalArea';
import { UpgradeList } from '../components/game/UpgradeList';
import { colors, spacing, borderRadius, fontSize } from '../theme/colors';

// ====== Tab definitions ======
const GAME_TABS = [
  { key: 'upgrades', label: 'Upgrades', icon: '⬆️' },
  { key: 'stats', label: 'Stats', icon: '📊' },
  { key: 'prestige', label: 'Prestige', icon: '🔄' },
  { key: 'shop', label: 'Shop', icon: '🛒' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];

// ====== Helper: fmtTime ======
function fmtTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

// ====== Helper: fmtTimer (ticks / 10) ======
function fmtTimer(ticks: number): string {
  const sec = Math.ceil(ticks / 10);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ====== Shop Boost Definitions ======
const SHOP_BOOSTS = [
  { id: 'doubleClick', icon: '👆', name: '2x Click Power', desc: 'Double your click power', dur: '60s', maxDur: 600 },
  { id: 'tripleAuto', icon: '⚙️', name: '3x Auto Income', desc: 'Triple your passive income', dur: '60s', maxDur: 600 },
  { id: 'multBoost', icon: '📈', name: '+50% Multiplier', desc: 'Boosts all multipliers by 50%', dur: '90s', maxDur: 900 },
  { id: 'critBoost', icon: '🎯', name: '+10% Crit Chance', desc: 'Extra 10% critical hit chance', dur: '60s', maxDur: 600 },
  { id: 'doubleGolden', icon: '🌟', name: '2x Golden Chance', desc: 'Double golden spawn rate', dur: '2min', maxDur: 1200 },
  { id: 'luckyBoost', icon: '🍀', name: '3x Golden Luck', desc: 'Triple golden spawn rate', dur: '2min', maxDur: 1200 },
] as const;

// ====== Crystal Exchange Options ======
const EXCHANGE_OPTIONS = [
  { secs: 60, icon: '⚡', label: '1 Minute' },
  { secs: 300, icon: '🔥', label: '5 Minutes' },
  { secs: 1800, icon: '💫', label: '30 Minutes' },
  { secs: 7200, icon: '🌟', label: '2 Hours' },
] as const;

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [loaded, setLoaded] = useState(false);
  const [prestigeModal, setPrestigeModal] = useState(false);
  const [resetModal, setResetModal] = useState(false);

  // ====== Store selectors ======
  const crystals = useGameStore(s => s.crystals);
  const crystalsExp = useGameStore(s => s.crystalsExp);
  const clickPowerLog = useGameStore(s => s.clickPowerLog);
  const autoRateLog = useGameStore(s => s.autoRateLog);
  const multiplierLog = useGameStore(s => s.multiplierLog);
  const combo = useGameStore(s => s.combo);
  const comboTimer = useGameStore(s => s.comboTimer);
  const goldenActive = useGameStore(s => s.goldenActive);
  const goldenTimer = useGameStore(s => s.goldenTimer);
  const goldenClickValue = useGameStore(s => s.goldenClickValue);
  const critChance = useGameStore(s => s.critChance);
  const currentArea = useGameStore(s => s.currentArea);
  const prestige = useGameStore(s => s.prestige);
  const prestigePoints = useGameStore(s => s.prestigePoints);
  const totalClicks = useGameStore(s => s.totalClicks);
  const totalEarned = useGameStore(s => s.totalEarned);
  const totalEarnedExp = useGameStore(s => s.totalEarnedExp);
  const sessionClicks = useGameStore(s => s.sessionClicks);
  const sessionEarned = useGameStore(s => s.sessionEarned);
  const maxCombo = useGameStore(s => s.maxCombo);
  const clicksPerSecond = useGameStore(s => s.clicksPerSecond);
  const bestSessionCps = useGameStore(s => s.bestSessionCps);
  const totalCrits = useGameStore(s => s.totalCrits);
  const goldenClicks = useGameStore(s => s.goldenClicks);
  const goldenChance = useGameStore(s => s.goldenChance);
  const totalEvents = useGameStore(s => s.totalEvents);
  const shopBoosts = useGameStore(s => s.shopBoosts);
  const adCooldown = useGameStore(s => s.adCooldown);
  const milestones = useGameStore(s => s.milestones);
  const achievements = useGameStore(s => s.achievements);
  const floatingTexts = useGameStore(s => s.floatingTexts);
  const crystalPulse = useGameStore(s => s.crystalPulse);
  const activeTab = useGameStore(s => s.activeTab);
  const screenShake = useGameStore(s => s.screenShake);
  const activePowerUp = useGameStore(s => s.activePowerUp);
  const powerUpTimer = useGameStore(s => s.powerUpTimer);
  const activeEvent = useGameStore(s => s.activeEvent);
  const eventTimer = useGameStore(s => s.eventTimer);
  const currentNotification = useGameStore(s => s.currentNotification);
  const notificationTimer = useGameStore(s => s.notificationTimer);

  const click = useGameStore(s => s.click);
  const clickGolden = useGameStore(s => s.clickGolden);
  const tick = useGameStore(s => s.tick);
  const buyShopBoost = useGameStore(s => s.buyShopBoost);
  const buyInstantCrystals = useGameStore(s => s.buyInstantCrystals);
  const performPrestige = useGameStore(s => s.performPrestige);
  const resetGame = useGameStore(s => s.resetGame);
  const setActiveTab = useGameStore(s => s.setActiveTab);
  const getSaveData = useGameStore(s => s.getSaveData);
  const loadSave = useGameStore(s => s.loadSave);
  const removeFloatingText = useGameStore(s => s.removeFloatingText);
  const claimAdReward = useGameStore(s => s.claimAdReward);

  // ====== Derived ======
  const formattedCrystals = useMemo(() => fmt(crystals, crystalsExp), [crystals, crystalsExp]);
  const formattedCps = useMemo(() => fmtExpLog(autoRateLog) + '/s', [autoRateLog]);
  const clickPowerStr = useMemo(() => fmtExpLog(clickPowerLog), [clickPowerLog]);
  const autoRateStr = useMemo(() => fmtExpLog(autoRateLog), [autoRateLog]);
  const multiplierStr = useMemo(() => fmtExpLog(multiplierLog), [multiplierLog]);
  const prestigeBonusStr = useMemo(
    () => prestigePoints > 0 ? `+${fmt(prestigePoints * 10)}% all income` : null,
    [prestigePoints],
  );

  const unlockedCount = useMemo(() => achievements.filter(a => a.unlocked).length, [achievements]);
  const totalUpgrades = useGameStore(s => s.upgrades.reduce((sum, u) => sum + u.level, 0));
  const nextMilestone = useMemo(() => milestones.find(m => !m.celebrated), [milestones]);
  const milestoneProgress = useMemo(
    () => nextMilestone ? Math.min((totalEarned / nextMilestone.value) * 100, 100) : 100,
    [totalEarned, nextMilestone],
  );

  // ====== Init: Get or create userId ======
  useEffect(() => {
    (async () => {
      let id = await storage.getUserId();
      if (!id) {
        id = 'guest_' + Math.random().toString(36).slice(2, 14);
        await storage.setUserId(id);
      }
      setUserId(id);
    })();
  }, []);

  // ====== Load save on mount ======
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        let localData: Record<string, unknown> | null = null;
        try {
          const raw = await storage.getLocalSave(userId);
          if (raw) localData = JSON.parse(raw);
        } catch { /* ignore */ }

        let serverData: Record<string, unknown> | null = null;
        try {
          const json = await api.loadGame(userId);
          if (json.data && (json.data as Record<string, unknown>).crystals !== undefined) {
            serverData = json.data as Record<string, unknown>;
          }
        } catch { /* ignore */ }

        let bestData: Record<string, unknown> | null = null;
        if (serverData && localData) {
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
        }
      } catch { /* no save exists yet */ }
      setLoaded(true);
    })();
  }, [userId, loadSave]);

  // ====== Game tick (100ms) ======
  useEffect(() => {
    const iv = setInterval(() => tick(), 100);
    return () => clearInterval(iv);
  }, [tick]);

  // ====== Session timer ======
  useEffect(() => {
    const startTime = Date.now();
    const iv = setInterval(() => setSessionTime(Date.now() - startTime), 1000);
    return () => clearInterval(iv);
  }, []);

  // ====== Auto-save (5min) ======
  useEffect(() => {
    if (!userId) return;
    const iv = setInterval(async () => {
      try {
        setSaveStatus('saving');
        const data = getSaveData();
        const payload = { ...data, userId };
        await storage.setLocalSave(userId, JSON.stringify(data));
        await api.saveGame(payload);
        setSaveStatus('saved');
        useGameStore.setState({ lastSaveTime: Date.now() });
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    }, 300000);
    return () => clearInterval(iv);
  }, [userId, getSaveData]);

  // ====== Click handler ======
  const handleCrystalClick = useCallback(
    (x: number, y: number) => {
      click(x, y);
    },
    [click],
  );

  const handleGoldenClick = useCallback(
    (x: number, y: number) => {
      clickGolden(x, y);
    },
    [clickGolden],
  );

  // ====== Prestige calculation ======
  const prestigeInfo = useMemo(() => {
    const effectiveLog = toLogSafe(totalEarned) + totalEarnedExp;
    const ptsLog = 0.5 * (effectiveLog - 3);
    const canPrestige = effectiveLog >= 3;
    let newPts = 0;
    if (canPrestige) {
      newPts = ptsLog > 15 ? Math.floor(Math.pow(10, 15)) : Math.floor(Math.pow(10, ptsLog));
    }
    return {
      canPrestige,
      newPts,
      newTotalBonus: prestigePoints + newPts,
      newBonusPercent: (prestigePoints + newPts) * 10,
    };
  }, [totalEarned, totalEarnedExp, prestigePoints]);

  // ====== Handle prestige ======
  const handlePrestige = useCallback(() => {
    performPrestige();
    setPrestigeModal(false);
  }, [performPrestige]);

  // ====== Handle reset ======
  const handleReset = useCallback(() => {
    resetGame();
    setResetModal(false);
  }, [resetGame]);

  // ====== Shop: buy boost ======
  const handleBuyBoost = useCallback(
    (boostId: string) => {
      buyShopBoost(boostId);
    },
    [buyShopBoost],
  );

  // ====== Shop: buy instant crystals ======
  const handleBuyInstant = useCallback(
    (secs: number) => {
      buyInstantCrystals(secs);
    },
    [buyInstantCrystals],
  );

  // ====== Render tab content ======
  const renderTabContent = () => {
    switch (activeTab) {
      case 'upgrades':
        return <UpgradeList />;

      case 'stats':
        return (
          <ScrollView style={styles.tabScroll} contentContainerStyle={styles.tabScrollContent} showsVerticalScrollIndicator={false}>
            {/* Resources */}
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Resources</Text>
              <StatRow label="Playtime" value={fmtTime(sessionTime)} icon="🕐" />
              <StatRow label="Crystals" value={fmt(crystals, crystalsExp)} icon="💎" />
              <StatRow label="Total Earned" value={fmt(totalEarned, totalEarnedExp)} icon="💰" />
              <StatRow label="Click Power" value={fmtExpLog(clickPowerLog)} icon="⚔️" />
              <StatRow label="Auto Rate" value={`${fmtExpLog(autoRateLog)}/s`} icon="⚙️" />
              <StatRow label="Multiplier" value={`x${fmtExpLog(multiplierLog)}`} icon="✖️" />
              <StatRow label="Prestige Points" value={String(prestigePoints)} icon="🌟" />
            </Card>

            {/* Clicking */}
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Clicking</Text>
              <StatRow label="Total Clicks" value={fmt(totalClicks)} icon="👆" />
              <StatRow label="Session Clicks" value={fmt(sessionClicks)} icon="🖱️" />
              <StatRow label="Click Speed" value={`${clicksPerSecond}/s`} icon="⚡" />
              <StatRow label="Best CPS" value={`${bestSessionCps}/s`} icon="🚀" />
              <StatRow label="Max Combo" value={`${maxCombo}x`} icon="🔥" />
              <StatRow label="Crit Chance" value={`${(critChance * 100).toFixed(1)}%`} icon="🎯" />
              <StatRow label="Total Crits" value={fmt(totalCrits)} icon="💥" />
            </Card>

            {/* Special */}
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Special</Text>
              <StatRow label="Golden Clicks" value={fmt(goldenClicks)} icon="🥇" />
              <StatRow label="Golden Chance" value={`${(goldenChance * 100).toFixed(1)}%`} icon="🌟" />
              <StatRow label="Events Experienced" value={String(totalEvents)} icon="🎉" />
              <StatRow label="Total Upgrades" value={String(totalUpgrades)} icon="⬆️" />
              <StatRow label="Prestige Count" value={String(prestige)} icon="🔄" />
              <StatRow label="Session Earned" value={fmt(sessionEarned)} icon="📈" />
            </Card>

            {/* Active Boosts */}
            {Object.entries(shopBoosts).some(([, v]) => v > 0) && (
              <Card style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Active Boosts</Text>
                {shopBoosts.doubleClick > 0 && <StatRow label="2x Click Power" value={`${Math.ceil(shopBoosts.doubleClick / 10)}s`} icon="👆" />}
                {shopBoosts.tripleAuto > 0 && <StatRow label="3x Auto Income" value={`${Math.ceil(shopBoosts.tripleAuto / 10)}s`} icon="⚙️" />}
                {shopBoosts.multBoost > 0 && <StatRow label="+50% Multiplier" value={`${Math.ceil(shopBoosts.multBoost / 10)}s`} icon="📈" />}
                {shopBoosts.critBoost > 0 && <StatRow label="+10% Crit Chance" value={`${Math.ceil(shopBoosts.critBoost / 10)}s`} icon="🎯" />}
                {shopBoosts.doubleGolden > 0 && <StatRow label="2x Golden Chance" value={`${Math.ceil(shopBoosts.doubleGolden / 10)}s`} icon="🌟" />}
                {shopBoosts.luckyBoost > 0 && <StatRow label="3x Golden Luck" value={`${Math.ceil(shopBoosts.luckyBoost / 10)}s`} icon="🍀" />}
                {shopBoosts.doubleAll > 0 && <StatRow label="2x All Income" value={`${Math.ceil(shopBoosts.doubleAll / 10)}s`} icon="🚀" />}
              </Card>
            )}

            {/* Milestones */}
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Milestones</Text>
              {milestones.map(m => (
                <StatRow
                  key={m.id}
                  label={`${m.icon} ${m.label}`}
                  value={m.celebrated ? '✓' : ''}
                  icon={undefined}
                />
              ))}
            </Card>

            {/* Danger Zone */}
            <View style={styles.dangerZone}>
              <Button
                title="🗑️ Reset Game"
                onPress={() => setResetModal(true)}
                variant="ghost"
                size="sm"
              />
            </View>
          </ScrollView>
        );

      case 'prestige':
        return (
          <ScrollView style={styles.tabScroll} contentContainerStyle={styles.tabScrollContent} showsVerticalScrollIndicator={false}>
            <Card style={[styles.sectionCard, { borderColor: 'rgba(236, 72, 153, 0.2)' }]}>
              <Text style={[styles.sectionTitle, { color: colors.pinkLight }]}>🔄 Prestige System</Text>
              <Text style={styles.prestigeDesc}>
                Reset your crystals and upgrades to earn Prestige Points, which permanently boost all income by +10% per point.
              </Text>

              <StatRow label="Current Prestige" value={`${prestige} times`} />
              <StatRow label="Prestige Points" value={String(prestigePoints)} icon="🌟" />
              <StatRow label="Current Bonus" value={`+${prestigePoints * 10}%`} />
              <StatRow label="Total Earned" value={fmt(totalEarned, totalEarnedExp)} />

              <View style={styles.separator} />

              <StatRow label="Points on Prestige" value={prestigeInfo.canPrestige ? `+${fmt(prestigeInfo.newPts)}` : 'Need 1K total'} />
              <StatRow label="New Total Bonus" value={prestigeInfo.canPrestige ? `+${prestigeInfo.newBonusPercent}%` : '—'} />

              <Button
                title={prestigeInfo.canPrestige ? '🔄 Perform Prestige' : '🔒 Earn 1,000 total crystals first'}
                onPress={() => setPrestigeModal(true)}
                disabled={!prestigeInfo.canPrestige}
                variant="purple"
                fullWidth
              />
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Prestige Tiers</Text>
              {[
                { pts: 1, bonus: '10%', earned: '1K' },
                { pts: 3, bonus: '30%', earned: '9K' },
                { pts: 5, bonus: '50%', earned: '25K' },
                { pts: 10, bonus: '100%', earned: '100K' },
                { pts: 20, bonus: '200%', earned: '400K' },
                { pts: 50, bonus: '500%', earned: '2.5M' },
              ].map(t => (
                <StatRow
                  key={t.pts}
                  label={`${t.pts} pts → +${t.bonus} bonus`}
                  value={`(${t.earned} total)`}
                />
              ))}
            </Card>
          </ScrollView>
        );

      case 'shop':
        return (
          <ScrollView style={styles.tabScroll} contentContainerStyle={styles.tabScrollContent} showsVerticalScrollIndicator={false}>
            {/* Boosts */}
            <Card style={styles.sectionCard}>
              <View style={styles.shopHeader}>
                <Text style={styles.sectionTitle}>⚡ Temporary Boosts</Text>
                <Text style={styles.shopSubtext}>Cost: 30min auto income each</Text>
              </View>
              {SHOP_BOOSTS.map(b => {
                const timer = shopBoosts[b.id as keyof typeof shopBoosts] as number;
                const isActive = timer > 0;
                const myLog = toLogSafe(crystals) + crystalsExp;
                const costLog = autoRateLog + Math.log10(1800);
                const canBuy = myLog >= costLog && !isActive;
                return (
                  <View key={b.id} style={[styles.shopItem, isActive && styles.shopItemActive]}>
                    <View style={styles.shopItemIconBox}>
                      <Text style={styles.shopItemEmoji}>{b.icon}</Text>
                      {isActive && <View style={styles.activeDot} />}
                    </View>
                    <View style={styles.shopItemInfo}>
                      <View style={styles.shopItemNameRow}>
                        <Text style={styles.shopItemName}>{b.name}</Text>
                        <Badge color="gray" small>{b.dur}</Badge>
                      </View>
                      <Text style={styles.shopItemDesc}>{b.desc}</Text>
                      {isActive && (
                        <View style={styles.boostProgressContainer}>
                          <ProgressBar value={timer / b.maxDur} color={colors.green} height={3} />
                          <Text style={styles.boostTimerText}>{Math.ceil(timer / 10)}s left</Text>
                        </View>
                      )}
                    </View>
                    <Button
                      title={isActive ? 'Active' : 'Buy'}
                      onPress={() => handleBuyBoost(b.id)}
                      disabled={!canBuy}
                      variant={isActive ? 'gray' : canBuy ? 'purple' : 'gray'}
                      size="sm"
                    />
                  </View>
                );
              })}
            </Card>

            {/* Crystal Exchange */}
            <Card style={styles.sectionCard}>
              <View style={styles.shopHeader}>
                <Text style={styles.sectionTitle}>💎 Crystal Exchange</Text>
                <Text style={styles.shopSubtext}>1:1 trade rate</Text>
              </View>
              {EXCHANGE_OPTIONS.map(q => {
                const costLog = autoRateLog + Math.log10(q.secs);
                const myLog = toLogSafe(crystals) + crystalsExp;
                const canBuy = myLog >= costLog && autoRateLog > -Infinity;
                return (
                  <View key={q.secs} style={[styles.shopItem, !canBuy && styles.shopItemDisabled]}>
                    <View style={[styles.shopItemIconBox, { backgroundColor: 'rgba(217, 119, 6, 0.1)' }]}>
                      <Text style={styles.shopItemEmoji}>{q.icon}</Text>
                    </View>
                    <View style={styles.shopItemInfo}>
                      <Text style={styles.shopItemName}>Buy {q.label}</Text>
                      <Text style={styles.shopItemDesc}>of auto income</Text>
                    </View>
                    <Button
                      title={fmtExpLog(costLog)}
                      onPress={() => handleBuyInstant(q.secs)}
                      disabled={!canBuy}
                      variant={canBuy ? 'amber' : 'gray'}
                      size="sm"
                    />
                  </View>
                );
              })}
            </Card>
          </ScrollView>
        );

      case 'settings':
        return (
          <ScrollView style={styles.tabScroll} contentContainerStyle={styles.tabScrollContent} showsVerticalScrollIndicator={false}>
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>⚙️ Settings</Text>
              <StatRow label="User ID" value={userId ?? '...'} />
              <StatRow label="Save Status" value={saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved ✓' : saveStatus === 'error' ? 'Error' : 'Idle'} />
              <StatRow label="Session Time" value={fmtTime(sessionTime)} icon="🕐" />
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>💾 Save Data</Text>
              <Button
                title="Save Now"
                onPress={async () => {
                  if (!userId) return;
                  try {
                    setSaveStatus('saving');
                    const data = getSaveData();
                    await storage.setLocalSave(userId, JSON.stringify(data));
                    await api.saveGame({ ...data, userId });
                    setSaveStatus('saved');
                    useGameStore.setState({ lastSaveTime: Date.now() });
                    setTimeout(() => setSaveStatus('idle'), 2000);
                  } catch {
                    setSaveStatus('error');
                    setTimeout(() => setSaveStatus('idle'), 3000);
                  }
                }}
                variant="green"
                fullWidth
              />
            </Card>

            <View style={styles.dangerZone}>
              <Button
                title="🗑️ Reset Game"
                onPress={() => setResetModal(true)}
                variant="ghost"
                size="sm"
              />
            </View>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  // ====== Event banner ======
  const renderEventBanner = () => {
    if (!activeEvent) return null;
    return (
      <View style={styles.eventBanner}>
        <Text style={styles.eventBannerEmoji}>{activeEvent.icon}</Text>
        <Text style={styles.eventBannerText} numberOfLines={1}>{activeEvent.name}</Text>
        <Badge color="purple" small>{fmtTimer(eventTimer)}</Badge>
      </View>
    );
  };

  // ====== Power-up indicator ======
  const renderPowerUpIndicator = () => {
    if (!activePowerUp) return null;
    return (
      <View style={styles.powerUpBanner}>
        <Text style={styles.powerUpEmoji}>{activePowerUp.icon}</Text>
        <Text style={styles.powerUpText} numberOfLines={1}>{activePowerUp.name}</Text>
        <Badge color="cyan" small>{fmtTimer(powerUpTimer)}</Badge>
      </View>
    );
  };

  // ====== Achievement notification ======
  const renderAchievementNotification = () => {
    if (!currentNotification) return null;
    return (
      <View style={styles.achievementNotification}>
        <Text style={styles.achievementIcon}>{currentNotification.icon}</Text>
        <View style={styles.achievementInfo}>
          <Text style={styles.achievementTitle}>Achievement Unlocked!</Text>
          <Text style={styles.achievementName} numberOfLines={1}>{currentNotification.name}</Text>
        </View>
        <View style={styles.achievementProgressTrack}>
          <View style={[styles.achievementProgressFill, { width: `${((30 - notificationTimer) / 30) * 100}%` }]} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <View style={styles.root}>
        {/* Loading */}
        {!loaded ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingSpinner} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <>
            {/* Event Banner */}
            {renderEventBanner()}

            {/* Power-up Indicator */}
            {renderPowerUpIndicator()}

            {/* Achievement Notification */}
            {renderAchievementNotification()}

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.headerCrystals} numberOfLines={1}>{formattedCrystals}</Text>
                <Text style={styles.headerCps}>{formattedCps}</Text>
              </View>
              <View style={styles.headerRight}>
                <Text style={styles.saveStatusText}>
                  {saveStatus === 'saving' ? '💾 Saving...' : saveStatus === 'saved' ? '✅ Saved' : saveStatus === 'error' ? '❌ Error' : ''}
                </Text>
              </View>
            </View>

            {/* Crystal Area */}
            <View style={styles.crystalSection}>
              <CrystalArea
                currentArea={currentArea}
                goldenActive={goldenActive}
                goldenTimer={goldenTimer}
                goldenClickValue={goldenClickValue}
                combo={combo}
                comboTimer={comboTimer}
                comboMaxTimer={60}
                crystalPulse={crystalPulse}
                crystals={crystals}
                crystalsExp={crystalsExp}
                floatingTexts={floatingTexts}
                onCrystalClick={handleCrystalClick}
                onGoldenClick={handleGoldenClick}
                onRemoveFloatingText={removeFloatingText}
                formattedCrystals={formattedCrystals}
                formattedCps={formattedCps}
                clickPower={clickPowerStr}
                autoRate={autoRateStr}
                multiplier={multiplierStr}
                prestigeBonus={prestigeBonusStr}
              />
            </View>

            {/* Milestone Progress */}
            {nextMilestone && (
              <View style={styles.milestoneContainer}>
                <Text style={styles.milestoneLabel}>
                  {nextMilestone.icon} {nextMilestone.label}: {fmt(totalEarned, totalEarnedExp)} / {fmt(nextMilestone.value)}
                </Text>
                <ProgressBar value={milestoneProgress / 100} color={colors.purple} height={6} />
              </View>
            )}

            {/* Tab Content Area */}
            <View style={styles.tabContentArea}>
              {renderTabContent()}
            </View>

            {/* Bottom Tab Bar */}
            <Tabs
              tabs={GAME_TABS}
              activeTab={activeTab}
              onTabChange={(key) => setActiveTab(key as ActiveTab)}
            />

            {/* Prestige Confirmation Modal */}
            <Modal
              visible={prestigeModal}
              onClose={() => setPrestigeModal(false)}
              title="🔄 Confirm Prestige"
              actions={[
                { title: 'Cancel', onPress: () => setPrestigeModal(false), variant: 'gray' },
                { title: 'Perform Prestige', onPress: handlePrestige, variant: 'purple' },
              ]}
            >
              <Text style={styles.modalText}>
                This will reset your crystals and upgrades. You keep achievements, prestige points, and golden/crit stats.
              </Text>
              <Text style={styles.modalHighlight}>
                You will earn +{fmt(prestigeInfo.newPts)} prestige points (total: +{prestigeInfo.newBonusPercent}% bonus)
              </Text>
            </Modal>

            {/* Reset Confirmation Modal */}
            <Modal
              visible={resetModal}
              onClose={() => setResetModal(false)}
              title="⚠️ Reset Game"
              actions={[
                { title: 'Cancel', onPress: () => setResetModal(false), variant: 'gray' },
                { title: 'Reset Everything', onPress: handleReset, variant: 'ghost' },
              ]}
            >
              <Text style={styles.modalText}>
                Are you sure you want to reset ALL progress? This cannot be undone!
              </Text>
            </Modal>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

// ====== Styles ======
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    position: 'relative',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  loadingSpinner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: `${colors.purple}44`,
    borderTopColor: colors.purple,
    // RN doesn't have animate-spin, but the game tick will re-render fast enough
  },
  loadingText: {
    color: `${colors.purpleLight}88`,
    fontSize: fontSize.md,
  },

  // Event Banner
  eventBanner: {
    backgroundColor: 'rgba(147, 51, 234, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    zIndex: 20,
  },
  eventBannerEmoji: {
    fontSize: fontSize.lg,
  },
  eventBannerText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },

  // Power-up Indicator
  powerUpBanner: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.cyan}33`,
    zIndex: 20,
  },
  powerUpEmoji: {
    fontSize: fontSize.lg,
  },
  powerUpText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.cyanLight,
    flex: 1,
  },

  // Achievement Notification
  achievementNotification: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(120, 53, 15, 0.9)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
    zIndex: 50,
    shadowColor: colors.amber,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    shadowOpacity: 0.2,
  },
  achievementIcon: {
    fontSize: fontSize.xxl,
  },
  achievementInfo: {
    flex: 1,
    gap: 2,
  },
  achievementTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.amberLight,
  },
  achievementName: {
    fontSize: fontSize.xs,
    color: `${colors.amberLight}cc`,
  },
  achievementProgressTrack: {
    width: 48,
    height: 6,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  achievementProgressFill: {
    height: '100%',
    backgroundColor: colors.amberLight,
    borderRadius: 3,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    zIndex: 10,
  },
  headerLeft: {
    gap: 2,
  },
  headerCrystals: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.purpleLight,
    textShadowColor: colors.purple,
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 0 },
  },
  headerCps: {
    fontSize: fontSize.xs,
    color: colors.textDim,
  },
  headerRight: {
    gap: spacing.sm,
  },
  saveStatusText: {
    fontSize: fontSize.xs,
    color: colors.textDim,
  },

  // Crystal Section
  crystalSection: {
    alignItems: 'center',
    zIndex: 5,
  },

  // Milestone
  milestoneContainer: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  milestoneLabel: {
    fontSize: fontSize.xs,
    color: colors.textDim,
    textAlign: 'center',
  },

  // Tab Content
  tabContentArea: {
    flex: 1,
    minHeight: 0,
    zIndex: 5,
  },
  tabScroll: {
    flex: 1,
  },
  tabScrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl + spacing.xxl,
    gap: spacing.md,
  },

  // Section Card
  sectionCard: {
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(75, 85, 99, 0.3)',
    marginVertical: spacing.sm,
  },

  // Prestige
  prestigeDesc: {
    fontSize: fontSize.sm,
    color: colors.textDim,
    lineHeight: 20,
    marginBottom: spacing.md,
  },

  // Shop
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  shopSubtext: {
    fontSize: fontSize.xs,
    color: colors.textFaint,
  },
  shopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(55, 65, 81, 0.15)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    padding: spacing.sm,
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  shopItemActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderColor: 'rgba(34, 197, 94, 0.15)',
  },
  shopItemDisabled: {
    opacity: 0.5,
  },
  shopItemIconBox: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  shopItemEmoji: {
    fontSize: 18,
  },
  activeDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.green,
  },
  shopItemInfo: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  shopItemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  shopItemName: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
  },
  shopItemDesc: {
    fontSize: fontSize.xs,
    color: colors.textDim,
  },
  boostProgressContainer: {
    marginTop: 4,
    gap: 2,
  },
  boostTimerText: {
    fontSize: fontSize.xs,
    color: colors.greenLight,
  },

  // Danger Zone
  dangerZone: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },

  // Modal
  modalText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    lineHeight: 22,
  },
  modalHighlight: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.amberLight,
    marginTop: spacing.md,
  },
});
