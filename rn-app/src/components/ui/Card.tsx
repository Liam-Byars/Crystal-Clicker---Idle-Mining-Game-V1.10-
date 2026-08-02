import React from 'react';
import {
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, borderRadius, spacing } from '../../theme/colors';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  borderColor?: string;
}

export function Card({ children, style, borderColor }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        borderColor ? { borderColor } : undefined,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
});
