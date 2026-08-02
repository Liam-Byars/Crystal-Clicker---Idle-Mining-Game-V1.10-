import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../../theme/colors';

interface StatRowProps {
  label: string;
  value: string;
  icon?: string;
}

export function StatRow({ label, value, icon }: StatRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.labelContainer}>
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs + 1,
    minHeight: 28,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginRight: spacing.sm,
  },
  icon: {
    fontSize: fontSize.md,
    marginRight: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    flexShrink: 1,
  },
  value: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'right',
    flexShrink: 1,
  },
});
