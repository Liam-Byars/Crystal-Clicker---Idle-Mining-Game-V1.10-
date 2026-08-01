import React, { useCallback, useRef, memo } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import type { FloatingText as FloatingTextType } from '@shared/game/types';
import { colors, spacing, borderRadius, fontSize } from '../../theme/colors';
import { FloatingTextComponent } from './FloatingText';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CRYSTAL_SIZE = Math.min(SCREEN_WIDTH * 0.48, 200);

// Approximate area color mapping (RN can't use Tailwind gradient classes)
const AREA_COLORS: Record<string, { start: string; end: string; glow: string; icon: string }> = {
  naica:           { start: '#e5e7eb', end: '#a5f3fc', glow: 'rgba(200, 230, 255, 0.6)', icon: '🪨' },
  ratnapura:       { start: '#60a5fa', end: '#1e40af', glow: 'rgba(96, 165, 250, 0.6)', icon: '💙' },
  muzo:            { start: '#34d399', end: '#166534', glow: 'rgba(52, 211, 153, 0.6)', icon: '💚' },
  coober_pedy:     { start: '#fdba74', end: '#fde68a', glow: 'rgba(251, 146, 60, 0.5)', icon: '🌈' },
  ilakaka:         { start: '#e879f9', end: '#9333ea', glow: 'rgba(232, 121, 249, 0.5)', icon: '🌸' },
  mogok:           { start: '#f87171', end: '#881337', glow: 'rgba(248, 113, 113, 0.5)', icon: '❤️' },
  skeleton_coast:  { start: '#ffffff', end: '#bfdbfe', glow: 'rgba(224, 242, 254, 0.8)', icon: '💠' },
  ural_mountains:  { start: '#34d399', end: '#7c3aed', glow: 'rgba(52, 211, 153, 0.5)', icon: '🔄' },
  mirny_mine:      { start: '#cbd5e1', end: '#94a3b8', glow: 'rgba(203, 213, 225, 0.6)', icon: '⭐' },
  cullinan:        { start: '#fef9c3', end: '#a5f3fc', glow: 'rgba(254, 249, 195, 0.8)', icon: '👑' },
};

const DEFAULT_AREA = { start: '#c084fc', end: '#7c3aed', glow: 'rgba(200, 130, 252, 0.5)', icon: '💎' };

interface CrystalAreaProps {
  currentArea: string;
  goldenActive: boolean;
  goldenTimer: number;
  goldenClickValue: number;
  combo: number;
  comboTimer: number;
  comboMaxTimer: number;
  crystalPulse: number;
  crystals: number;
  crystalsExp: number;
  floatingTexts: FloatingTextType[];
  onCrystalClick: (x: number, y: number) => void;
  onGoldenClick: (x: number, y: number) => void;
  onRemoveFloatingText: (id: number) => void;
  formattedCrystals: string;
  formattedCps: string;
  clickPower: string;
  autoRate: string;
  multiplier: string;
  prestigeBonus: string | null;
}

export const CrystalArea = memo(function CrystalArea({
  currentArea,
  goldenActive,
  goldenTimer,
  goldenClickValue,
  combo,
  comboTimer,
  comboMaxTimer,
  crystalPulse,
  crystals,
  crystalsExp,
  floatingTexts,
  onCrystalClick,
  onGoldenClick,
  onRemoveFloatingText,
  formattedCrystals,
  formattedCps,
  clickPower,
  autoRate,
  multiplier,
  prestigeBonus,
}: CrystalAreaProps) {
  const scaleVal = useSharedValue(1);
  const pulseVal = useSharedValue(1);
  const goldenGlowVal = useSharedValue(0.4);

  // Pulse animation loop for golden crystal
  React.useEffect(() => {
    if (goldenActive) {
      goldenGlowVal.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 500, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.3, { duration: 500, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        true,
      );
    } else {
      goldenGlowVal.value = 0;
    }
  }, [goldenActive, goldenGlowVal]);

  const handlePressIn = useCallback(() => {
    scaleVal.value = withSpring(0.92, { damping: 15, stiffness: 300 });
  }, [scaleVal]);

  const handlePressOut = useCallback(() => {
    scaleVal.value = withSpring(1, { damping: 12, stiffness: 250 });
  }, [scaleVal]);

  const handlePress = useCallback(
    (e: { nativeEvent: { locationX: number; locationY: number } }) => {
      const { locationX, locationY } = e.nativeEvent;
      if (goldenActive) {
        onGoldenClick(locationX, locationY);
      } else {
        onCrystalClick(locationX, locationY);
      }
    },
    [goldenActive, onCrystalClick, onGoldenClick],
  );

  const crystalScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleVal.value }],
  }));

  const goldenGlowStyle = useAnimatedStyle(() => ({
    opacity: goldenGlowVal.value,
  }));

  const area = AREA_COLORS[currentArea] || DEFAULT_AREA;
  const goldenProgress = goldenTimer / 400; // 400 ticks = 40 seconds

  return (
    <View style={styles.wrapper}>
      {/* Crystal Count */}
      <View style={styles.crystalCountContainer}>
        <Text style={styles.crystalCountText} numberOfLines={1}>
          {formattedCrystals}
        </Text>
        <Text style={styles.crystalLabel}>crystals</Text>
      </View>

      {/* Combo Badge */}
      {combo > 1 && (
        <View style={styles.comboBadge}>
          <Text style={styles.comboText}>{combo}x COMBO</Text>
        </View>
      )}

      {/* Combo Timer Bar */}
      {combo > 0 && comboTimer > 0 && (
        <View style={styles.comboBarTrack}>
          <View style={[styles.comboBarFill, { width: `${(comboTimer / comboMaxTimer) * 100}%` }]} />
        </View>
      )}

      {/* Crystal Button */}
      <View style={styles.crystalOuterContainer}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.crystalPressable}
        >
          <Animated.View style={crystalScaleStyle}>
            <View
              style={[
                styles.crystalBase,
                goldenActive
                  ? styles.crystalGolden
                  : undefined,
              ]}
            >
              {!goldenActive ? (
                <LinearGradient
                  colors={[area.start, area.end]}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 0.8, y: 1 }}
                  style={styles.crystalGradient}
                >
                  <Text style={styles.crystalEmoji}>{area.icon}</Text>
                </LinearGradient>
              ) : (
                <LinearGradient
                  colors={['#fbbf24', '#f59e0b', '#d97706']}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 0.8, y: 1 }}
                  style={styles.crystalGradient}
                >
                  <Text style={styles.crystalEmoji}>✨</Text>
                </LinearGradient>
              )}
            </View>

            {/* Golden Glow Overlay */}
            {goldenActive && (
              <Animated.View
                style={[styles.goldenGlowOverlay, goldenGlowStyle]}
                pointerEvents="none"
              />
            )}
          </Animated.View>

          {/* Golden Timer Ring (SVG-like using a View arc approximation) */}
          {goldenActive && (
            <View style={styles.goldenRingContainer} pointerEvents="none">
              <View
                style={[
                  styles.goldenRingTrack,
                  {
                    // Approximate ring fill via border width on a rotating view
                    transform: [{ rotate: `${-90 + (1 - goldenProgress) * 360}deg` }],
                  },
                ]}
              />
            </View>
          )}
        </Pressable>

        {/* Floating Texts */}
        <View style={styles.floatingTextContainer} pointerEvents="none">
          {floatingTexts.map(ft => {
            const displayStr =
              ft.type === 'milestone'
                ? '🎉 MILESTONE!'
                : ft.valueLog != null && ft.valueLog > 15
                  ? fmtExpLog(ft.valueLog)
                  : fmt(ft.value);
            return (
              <FloatingTextComponent
                key={ft.id}
                id={ft.id}
                text={displayStr}
                type={ft.type}
                x={ft.x}
                y={ft.y}
                count={ft.count}
                onDone={onRemoveFloatingText}
              />
            );
          })}
        </View>
      </View>

      {/* Golden Value Hint */}
      {goldenActive && (
        <Text style={styles.goldenHint}>
          Click for {isFinite(goldenClickValue) ? fmtExpLog(goldenClickValue) : '0'} crystals!
        </Text>
      )}

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <Text style={styles.quickStatText}>
          ⚔️ <Text style={styles.quickStatValue}>{clickPower}</Text>{' '}
          ⚙️ <Text style={[styles.quickStatValue, { color: colors.cyanLight }]}>{autoRate}/s</Text>{' '}
          ✖️ <Text style={[styles.quickStatValue, { color: colors.amberLight }]}>x{multiplier}</Text>
        </Text>
      </View>

      {prestigeBonus ? (
        <Text style={styles.prestigeText}>🌟 Prestige Bonus: {prestigeBonus}</Text>
      ) : null}
    </View>
  );
});

// ====== Number Formatting Helpers ======
// Duplicated here for self-containment; the GameScreen also exports them.

export function toLogSafe(n: number): number {
  if (!isFinite(n) || n <= 0) return -Infinity;
  return Math.log10(n);
}

export function fmtExpLog(log: number): string {
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
  const tier2 = tier - 676;
  if (tier2 >= 0 && tier2 < 17576) {
    const a = String.fromCharCode(65 + Math.floor(tier2 / 676));
    const b = String.fromCharCode(65 + Math.floor((tier2 % 676) / 26));
    const c = String.fromCharCode(65 + (tier2 % 26));
    const divisor_log = 15 + tier * 3;
    return (Math.pow(10, log - divisor_log)).toFixed(2) + a + b + c;
  }
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

export function fmt(n: number, exp = 0): string {
  if (n < 0) return '-' + fmt(-n, exp);
  if (!isFinite(n)) return fmtExpLog(exp + 400);
  if (exp > 0) return fmtExpLog(Math.log10(n) + exp);
  if (n < 1000) return n < 10 ? n.toFixed(1) : Math.floor(n).toString();
  if (n < 1e6) return (n / 1e3).toFixed(1) + 'K';
  if (n < 1e9) return (n / 1e6).toFixed(2) + 'M';
  if (n < 1e12) return (n / 1e9).toFixed(2) + 'B';
  if (n < 1e15) return (n / 1e12).toFixed(2) + 'T';
  const e = Math.floor(Math.log10(n));
  const tier = Math.floor((e - 15) / 3);
  if (tier >= 0 && tier < 676) {
    const first = String.fromCharCode(65 + Math.floor(tier / 26));
    const second = String.fromCharCode(65 + (tier % 26));
    const divisor = Math.pow(10, 15 + tier * 3);
    return (n / divisor).toFixed(2) + first + second;
  }
  const tier2 = tier - 676;
  if (tier2 >= 0 && tier2 < 17576) {
    const a = String.fromCharCode(65 + Math.floor(tier2 / 676));
    const b = String.fromCharCode(65 + Math.floor((tier2 % 676) / 26));
    const c = String.fromCharCode(65 + (tier2 % 26));
    const divisor = Math.pow(10, 15 + tier * 3);
    return (n / divisor).toFixed(2) + a + b + c;
  }
  return n.toExponential(2);
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  crystalCountContainer: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  crystalCountText: {
    fontSize: fontSize.hero,
    fontWeight: '800',
    color: colors.purpleLight,
    letterSpacing: -0.5,
    textShadowColor: colors.purple,
    textShadowRadius: 16,
    textShadowOffset: { width: 0, height: 0 },
  },
  crystalLabel: {
    fontSize: fontSize.sm,
    color: colors.textDim,
    marginTop: 2,
  },
  comboBadge: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    borderColor: 'rgba(249, 115, 22, 0.3)',
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
    marginBottom: spacing.xs,
  },
  comboText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#fb923c',
  },
  comboBarTrack: {
    width: 128,
    height: 4,
    backgroundColor: 'rgba(55, 65, 81, 0.6)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  comboBarFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.amberLight,
  },
  crystalOuterContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: CRYSTAL_SIZE + 20,
    height: CRYSTAL_SIZE + 20,
  },
  crystalPressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  crystalBase: {
    width: CRYSTAL_SIZE,
    height: CRYSTAL_SIZE,
    borderRadius: CRYSTAL_SIZE / 2,
    overflow: 'hidden',
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 30,
    shadowOpacity: 0.4,
  },
  crystalGolden: {
    shadowColor: colors.amberLight,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 35,
    shadowOpacity: 0.5,
  },
  crystalGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crystalEmoji: {
    fontSize: CRYSTAL_SIZE * 0.45,
  },
  goldenGlowOverlay: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: CRYSTAL_SIZE / 2 + 10,
    backgroundColor: 'rgba(251, 191, 36, 0.25)',
    borderWidth: 2,
    borderColor: 'rgba(251, 191, 36, 0.4)',
  },
  goldenRingContainer: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: (CRYSTAL_SIZE + 28) / 2,
    borderWidth: 2,
    borderColor: 'rgba(251, 191, 36, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goldenRingTrack: {
    position: 'absolute',
    width: CRYSTAL_SIZE + 16,
    height: CRYSTAL_SIZE + 16,
    borderRadius: (CRYSTAL_SIZE + 16) / 2,
    borderWidth: 3,
    borderColor: colors.amberLight,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  floatingTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  goldenHint: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.amberLight,
    marginTop: spacing.sm,
  },
  quickStats: {
    marginTop: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  quickStatText: {
    fontSize: fontSize.xs,
    color: colors.textDim,
  },
  quickStatValue: {
    color: colors.purpleLight,
    fontWeight: '500',
  },
  prestigeText: {
    fontSize: fontSize.xs,
    color: colors.pinkLight,
    marginTop: 2,
  },
});
