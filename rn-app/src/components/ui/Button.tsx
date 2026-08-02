import React, { useCallback, useRef, useState } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  Animated,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '../../theme/colors';

type ButtonVariant = 'purple' | 'amber' | 'green' | 'cyan' | 'ghost' | 'gray';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: string;
  style?: StyleProp<ViewStyle>;
}

const VARIANT_STYLES: Record<ButtonVariant, { bg: string; text: string; border?: string; pressedBg?: string }> = {
  purple: {
    bg: colors.purpleDark,
    text: colors.text,
    pressedBg: colors.purple,
  },
  amber: {
    bg: colors.amberDark,
    text: '#0a0a1a',
    pressedBg: colors.amber,
  },
  green: {
    bg: '#166534',
    text: colors.text,
    pressedBg: colors.green,
  },
  cyan: {
    bg: '#0e7490',
    text: colors.text,
    pressedBg: colors.cyan,
  },
  ghost: {
    bg: 'transparent',
    text: colors.textMuted,
    pressedBg: 'rgba(255,255,255,0.05)',
  },
  gray: {
    bg: 'rgba(55, 65, 81, 0.5)',
    text: colors.textMuted,
    border: colors.border,
    pressedBg: 'rgba(75, 85, 99, 0.6)',
  },
};

const SIZE_CONFIG: Record<ButtonSize, { paddingV: number; paddingH: number; fontSize: number; iconSize: number }> = {
  sm: { paddingV: 6, paddingH: 12, fontSize: fontSize.sm, iconSize: 14 },
  md: { paddingV: 10, paddingH: 18, fontSize: fontSize.md, iconSize: 16 },
  lg: { paddingV: 14, paddingH: 24, fontSize: fontSize.lg, iconSize: 20 },
};

export function Button({
  title,
  onPress,
  variant = 'purple',
  size = 'md',
  disabled = false,
  fullWidth = false,
  icon,
  style,
}: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = useState(false);

  const variantStyle = VARIANT_STYLES[variant];
  const sizeConfig = SIZE_CONFIG[size];

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    setPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 300,
    }).start();
  }, [disabled, scaleAnim]);

  const handlePressOut = useCallback(() => {
    if (disabled) return;
    setPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 300,
    }).start();
  }, [disabled, scaleAnim]);

  const handlePress = useCallback(() => {
    if (!disabled) {
      onPress();
    }
  }, [disabled, onPress]);

  const backgroundColor = disabled
    ? 'rgba(55, 65, 81, 0.3)'
    : pressed
      ? variantStyle.pressedBg ?? variantStyle.bg
      : variantStyle.bg;

  const textColor = disabled ? colors.textFaint : variantStyle.text;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        fullWidth && styles.fullWidth,
        style,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.button,
          {
            backgroundColor,
            borderColor: variantStyle.border ?? 'transparent',
            paddingVertical: sizeConfig.paddingV,
            paddingHorizontal: sizeConfig.paddingH,
          },
        ]}
      >
        {icon ? (
          <Text
            style={[
              styles.iconText,
              { fontSize: sizeConfig.iconSize, color: textColor },
            ]}
          >
            {icon}
          </Text>
        ) : null}
        <Text
          style={[
            styles.label,
            {
              fontSize: sizeConfig.fontSize,
              color: textColor,
              ...(icon ? styles.labelWithIcon : {}),
            },
          ]}
        >
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: 6,
  },
  iconText: {
    lineHeight: fontSize.md,
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  labelWithIcon: {
    // offset if icon present
  },
});
