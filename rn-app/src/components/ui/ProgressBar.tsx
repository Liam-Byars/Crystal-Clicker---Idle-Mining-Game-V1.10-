import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors, borderRadius } from '../../theme/colors';

interface ProgressBarProps {
  value: number; // 0 to 1
  color?: string;
  height?: number;
}

export function ProgressBar({ value, color = colors.purple, height = 8 }: ProgressBarProps) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  const clampedValue = Math.max(0, Math.min(1, value));

  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: clampedValue,
      useNativeDriver: false,
      speed: 40,
      bounciness: 0,
    }).start();
  }, [clampedValue, widthAnim]);

  return (
    <View
      style={[
        styles.track,
        { height, borderRadius: height / 2 },
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            width: widthAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
            height,
            borderRadius: height / 2,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: 'rgba(55, 65, 81, 0.4)',
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    // width animated via JS
  },
});
