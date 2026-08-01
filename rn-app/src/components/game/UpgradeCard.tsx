import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { Upgrade, BuyQuantity } from '@shared/game/types';
import { useGameStore, getUpgradeCostLogSafe, getTotalCostNLogSafe, getMaxBuyCount } from '../../stores/gameStore';
import { colors, spacing, borderRadius, fontSize } from '../../theme/colors';
import { ProgressBar } from '../ui/ProgressBar';

const EFFECT_COLORS: Record<Upgrade['effect'], string> = {
  clickPower: colors.purpleLight,
  autoRate: colors.cyanLight,
  multiplier: colors.amberLight,
  goldenChance: '#fbbf24',
  critChance: colors.red,
};

const EFFECT_LABELS: Record<Upgrade['effect'], string> = {
  clickPower: 'Click Power',
  autoRate: 'Auto Rate',
  multiplier: 'Multiplier',
  goldenChance: 'Golden Chance',
  critChance: 'Crit Chance',
};

export { EFFECT_LABELS, EFFECT_COLORS };

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
  const tier = Math.floor((log - 15) / 3);
  if (tier >= 0 && tier < 676) {
    const first = String.fromCharCode(65 + Math.floor(tier / 26));
    const second = String.fromCharCode(65 + (tier % 26));
    const divisor_log = 15 + tier * 3;
    return (Math.pow(10, log - divisor_log)).toFixed(2) + first + second;
  }
  return Math.pow(10, log).toExponential(2);
}

interface UpgradeCardProps {
  upgrade: Upgrade;
  onBuy: (upgradeId: string) => void;
}

interface BuyInfo {
  count: number;
  costLog: number;
  canBuy: boolean;
  label: string;
}

export const UpgradeCard = memo(function UpgradeCard({ upgrade: u, onBuy }: UpgradeCardProps) {
  const buyQuantity = useGameStore(s => s.buyQuantity);
  const crystals = useGameStore(s => s.crystals);
  const crystalsExp = useGameStore(s => s.crystalsExp);

  const buyInfo: BuyInfo = useMemo(() => {
    const myLog = toLogSafe(crystals) + crystalsExp;
    if (buyQuantity === 1) {
      const costLog = getUpgradeCostLogSafe(u);
      const canBuy = myLog >= costLog && (!u.maxLevel || u.level < u.maxLevel);
      return { count: 1, costLog, canBuy, label: fmtExpLog(costLog) };
    }
    if (buyQuantity === 10) {
      const n = Math.min(10, u.maxLevel ? u.maxLevel - u.level : 10);
      const costLog = n > 0 ? getTotalCostNLogSafe(u, n) : -Infinity;
      const canBuy = n > 0 && myLog >= costLog;
      return { count: n, costLog, canBuy, label: n > 0 ? `${n}x ${fmtExpLog(costLog)}` : '—' };
    }
    if (buyQuantity === 100) {
      const n = Math.min(100, u.maxLevel ? u.maxLevel - u.level : 100);
      const costLog = n > 0 ? getTotalCostNLogSafe(u, n) : -Infinity;
      const canBuy = n > 0 && myLog >= costLog;
      return { count: n, costLog, canBuy, label: n > 0 ? `${n}x ${fmtExpLog(costLog)}` : '—' };
    }
    // max
    const n = getMaxBuyCount(u, crystals, crystalsExp);
    const costLog = n > 0 ? getTotalCostNLogSafe(u, n) : getUpgradeCostLogSafe(u);
    const canBuy = n > 0;
    return { count: n, costLog, canBuy, label: n > 0 ? `${n}x ${fmtExpLog(costLog)}` : fmtExpLog(costLog) };
  }, [buyQuantity, u, crystals, crystalsExp]);

  const handleBuy = useCallback(() => {
    onBuy(u.id);
  }, [u.id, onBuy]);

  // Progress: cost vs current crystals (for affordability visualization)
  const progress = buyInfo.canBuy ? 1 : Math.min(1, Math.max(0, (toLogSafe(crystals) + crystalsExp) / Math.max(1, buyInfo.costLog)));

  const effectColor = EFFECT_COLORS[u.effect];

  return (
    <View style={styles.card}>
      {/* Icon */}
      <View style={[styles.iconBox, { borderColor: effectColor + '33' }]}>
        <Text style={styles.iconEmoji}>{u.icon}</Text>
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.nameText} numberOfLines={1}>{u.name}</Text>
          {u.level > 0 && (
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>
                {u.maxLevel ? `Lv.${u.level}/${u.maxLevel}` : `Lv.${u.level}`}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.descText} numberOfLines={1}>{u.description}</Text>
        {u.maxLevel ? (
          <View style={styles.progressBarContainer}>
            <ProgressBar value={u.level / u.maxLevel} color={effectColor} height={3} />
          </View>
        ) : null}
      </View>

      {/* Buy Button */}
      <Pressable
        onPress={handleBuy}
        disabled={!buyInfo.canBuy}
        style={[
          styles.buyButton,
          buyInfo.canBuy
            ? styles.buyButtonActive
            : styles.buyButtonDisabled,
        ]}
      >
        <Text style={styles.buyEmoji}>💎</Text>
        <Text
          style={[
            styles.buyLabel,
            buyInfo.canBuy ? styles.buyLabelActive : styles.buyLabelDisabled,
          ]}
          numberOfLines={1}
        >
          {buyInfo.label}
        </Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm + 2,
    gap: spacing.sm,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(55, 65, 81, 0.4)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconEmoji: {
    fontSize: 20,
  },
  infoContainer: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  nameText: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
    flexShrink: 1,
  },
  levelBadge: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderRadius: borderRadius.full,
    paddingHorizontal: 5,
    paddingVertical: 1,
    flexShrink: 0,
  },
  levelText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.purpleLight,
  },
  descText: {
    fontSize: fontSize.xs,
    color: colors.textDim,
  },
  progressBarContainer: {
    marginTop: 2,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    flexShrink: 0,
    gap: 2,
    minWidth: 72,
  },
  buyButtonActive: {
    backgroundColor: colors.purpleDark,
    borderColor: colors.purple + '44',
  },
  buyButtonDisabled: {
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
  },
  buyEmoji: {
    fontSize: 11,
  },
  buyLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  buyLabelActive: {
    color: colors.text,
  },
  buyLabelDisabled: {
    color: colors.textFaint,
  },
});
