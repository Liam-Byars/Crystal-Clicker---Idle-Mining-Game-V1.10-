import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, fontSize } from '../../theme/colors';

type BadgeColor = 'purple' | 'amber' | 'cyan' | 'green' | 'red' | 'gray';

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  small?: boolean;
}

const COLOR_MAP: Record<BadgeColor, { bg: string; text: string }> = {
  purple: { bg: 'rgba(168, 85, 247, 0.15)', text: colors.purpleLight },
  amber:  { bg: 'rgba(245, 158, 11, 0.15)', text: colors.amberLight },
  cyan:   { bg: 'rgba(6, 182, 212, 0.15)',   text: colors.cyanLight },
  green:  { bg: 'rgba(34, 197, 94, 0.15)',   text: colors.greenLight },
  red:    { bg: 'rgba(239, 68, 68, 0.15)',   text: colors.red },
  gray:   { bg: 'rgba(107, 114, 128, 0.2)', text: colors.textMuted },
};

export function Badge({ children, color = 'purple', small = false }: BadgeProps) {
  const palette = COLOR_MAP[color];

  return (
    <View
      style={[
        styles.badge,
        small ? styles.smallBadge : styles.normalBadge,
        { backgroundColor: palette.bg },
      ]}
    >
      <Text
        style={[
          styles.label,
          small ? styles.smallLabel : styles.normalLabel,
          { color: palette.text },
        ]}
        numberOfLines={1}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  normalBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  smallBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  normalLabel: {
    fontSize: fontSize.sm,
  },
  smallLabel: {
    fontSize: fontSize.xs,
  },
});
