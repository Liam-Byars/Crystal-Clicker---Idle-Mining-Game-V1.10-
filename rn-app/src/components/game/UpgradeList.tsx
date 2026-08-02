import React, { useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useGameStore, getUpgradesForArea, AREAS, getMaxBuyCount } from '../../stores/gameStore';
import type { BuyQuantity, Upgrade } from '@shared/game/types';
import { UpgradeCard, EFFECT_LABELS, EFFECT_COLORS } from './UpgradeCard';
import { colors, spacing, borderRadius, fontSize } from '../../theme/colors';

const BUY_OPTIONS: BuyQuantity[] = [1, 10, 100, 'max'];
const EFFECT_ORDER: Upgrade['effect'][] = ['clickPower', 'autoRate', 'multiplier', 'goldenChance', 'critChance'];

export function UpgradeList() {
  const currentArea = useGameStore(s => s.currentArea);
  const unlockedAreas = useGameStore(s => s.unlockedAreas);
  const allUpgrades = useGameStore(s => s.upgrades);
  const buyQuantity = useGameStore(s => s.buyQuantity);
  const setBuyQuantity = useGameStore(s => s.setBuyQuantity);
  const buyUpgrade = useGameStore(s => s.buyUpgrade);

  const areaUpgrades = useMemo(
    () => getUpgradesForArea(currentArea, allUpgrades),
    [currentArea, allUpgrades],
  );

  const area = AREAS.find(a => a.id === currentArea);

  const handleBuy = useCallback(
    (upgradeId: string) => {
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

      for (let i = 0; i < count; i++) {
        if (!buyUpgrade(upgradeId)) break;
      }
    },
    [buyUpgrade],
  );

  const handleAreaSelect = useCallback(
    (areaId: string) => {
      useGameStore.getState().switchArea(areaId);
    },
    [],
  );

  const availableAreas = AREAS.filter(a => unlockedAreas.includes(a.id));

  const groupedUpgrades = useMemo(() => {
    const groups: { effect: Upgrade['effect']; upgrades: Upgrade[] }[] = [];
    for (const effect of EFFECT_ORDER) {
      const ups = areaUpgrades.filter(u => u.effect === effect);
      if (ups.length > 0) groups.push({ effect, upgrades: ups });
    }
    return groups;
  }, [areaUpgrades]);

  return (
    <View style={styles.container}>
      {/* Area Selector Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.areaScrollContent}
      >
        {availableAreas.map(a => (
          <Pressable
            key={a.id}
            onPress={() => handleAreaSelect(a.id)}
            style={[
              styles.areaTab,
              currentArea === a.id && styles.areaTabActive,
            ]}
          >
            <Text style={styles.areaTabEmoji}>{a.icon}</Text>
            <Text
              style={[
                styles.areaTabLabel,
                currentArea === a.id && styles.areaTabLabelActive,
              ]}
              numberOfLines={1}
            >
              {a.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Area Info + Buy Quantity */}
      <View style={styles.headerRow}>
        <Text style={styles.areaInfoText}>
          {area ? `${area.icon} ${area.name}` : 'Unknown'} upgrades
        </Text>
        <View style={styles.buyQuantityRow}>
          {BUY_OPTIONS.map(q => (
            <Pressable
              key={String(q)}
              onPress={() => setBuyQuantity(q)}
              style={[
                styles.buyQtyButton,
                buyQuantity === q && styles.buyQtyButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.buyQtyText,
                  buyQuantity === q && styles.buyQtyTextActive,
                ]}
              >
                {q === 'max' ? 'Max' : `x${q}`}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Upgrade List */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {groupedUpgrades.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>⛏️</Text>
            <Text style={styles.emptyText}>No upgrades available for this area</Text>
          </View>
        ) : (
          groupedUpgrades.map(group => (
            <View key={group.effect} style={styles.effectGroup}>
              <Text style={[styles.effectLabel, { color: EFFECT_COLORS[group.effect] }] }>
                {EFFECT_LABELS[group.effect]}
              </Text>
              <View style={styles.upgradeCards}>
                {group.upgrades.map(u => (
                  <UpgradeCard key={u.id} upgrade={u} onBuy={handleBuy} />
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  areaScrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  areaTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  areaTabActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderColor: colors.purple + '44',
  },
  areaTabEmoji: {
    fontSize: 14,
  },
  areaTabLabel: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    color: colors.textDim,
  },
  areaTabLabelActive: {
    color: colors.purpleLight,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  areaInfoText: {
    fontSize: fontSize.xs,
    color: colors.textDim,
  },
  buyQuantityRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(17, 17, 30, 0.6)',
    borderRadius: borderRadius.sm,
    padding: 2,
    gap: 1,
  },
  buyQtyButton: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  buyQtyButtonActive: {
    backgroundColor: colors.purpleDark,
  },
  buyQtyText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textDim,
  },
  buyQtyTextActive: {
    color: colors.text,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  listContent: {
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: spacing.sm,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textDim,
  },
  effectGroup: {
    gap: spacing.xs,
  },
  effectLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  upgradeCards: {
    gap: spacing.xs,
  },
});
