import React, { useEffect, useCallback, useRef } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import type { FloatingText as FloatingTextType } from '@shared/game/types';
import { colors, fontSize } from '../../theme/colors';

const FLOAT_COLORS: Record<FloatingTextType['type'], string> = {
  normal: colors.purpleLight,
  golden: colors.amberLight,
  combo: '#f97316',
  crit: colors.red,
  powerup: colors.cyanLight,
  event: '#a78bfa',
  offline: colors.greenLight,
  milestone: colors.amberLight,
};

interface FloatingTextProps {
  text: string;
  type: FloatingTextType['type'];
  x: number;
  y: number;
  count?: number;
  onDone: (id: number) => void;
  id: number;
}

const ANIM_DURATION = 1200;
const FADE_START = 800;

export function FloatingTextComponent({ text, type, x, y, count, onDone, id }: FloatingTextProps) {
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(type === 'crit' || type === 'golden' ? 1.3 : 1);
  const hasCalledDone = useRef(false);

  const callDone = useCallback(() => {
    if (!hasCalledDone.current) {
      hasCalledDone.current = true;
      onDone(id);
    }
  }, [id, onDone]);

  useEffect(() => {
    // Entrance scale for crit/golden
    if (type === 'crit' || type === 'golden') {
      scale.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.back(1.5)) });
    }

    // Float up
    translateY.value = withTiming(-60, {
      duration: ANIM_DURATION,
      easing: Easing.out(Easing.quad),
    });

    // Fade out after delay
    opacity.value = withSequence(
      withTiming(1, { duration: FADE_START }),
      withTiming(0, { duration: ANIM_DURATION - FADE_START, easing: Easing.in(Easing.quad) }, (finished) => {
        'worklet';
        if (finished) {
          runOnJS(callDone)();
        }
      }),
    );
  }, [type, opacity, translateY, scale, callDone]);

  // Auto-cleanup timeout in case animation callback doesn't fire
  useEffect(() => {
    const timer = setTimeout(() => callDone(), ANIM_DURATION + 200);
    return () => clearTimeout(timer);
  }, [callDone]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const yOffset = type === 'golden' ? -30 : type === 'crit' ? 20 : 50;

  return (
    <Animated.View
      style={[
        styles.container,
        { left: x, top: y + yOffset },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      <Text
        style={[
          styles.text,
          { color: FLOAT_COLORS[type], textShadowColor: FLOAT_COLORS[type], textShadowRadius: type === 'golden' || type === 'crit' ? 12 : 8 },
          (type === 'crit' || type === 'golden') && styles.textLarge,
          type === 'milestone' && styles.textMilestone,
        ]}
        numberOfLines={1}
      >
        {type === 'milestone' ? text : (
          <>
            {text}
            {count != null && count > 1 && (
              <Text style={[styles.countText, { color: FLOAT_COLORS[type] }]}>
                {' '}×{count}
              </Text>
            )}
          </>
        )}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  text: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textLarge: {
    fontSize: fontSize.title + 4,
    fontWeight: '900',
  },
  textMilestone: {
    fontSize: fontSize.xl,
    fontWeight: '900',
    color: colors.amberLight,
  },
  countText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    opacity: 0.8,
  },
});
