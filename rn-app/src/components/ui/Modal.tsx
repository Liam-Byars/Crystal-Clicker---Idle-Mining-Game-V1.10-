import React, { useCallback, useEffect, useRef } from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  Pressable,
  Animated,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, borderRadius, spacing, fontSize } from '../../theme/colors';
import { Button } from './Button';

interface ModalAction {
  title: string;
  onPress: () => void;
  variant?: 'purple' | 'amber' | 'green' | 'cyan' | 'ghost' | 'gray';
}

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  actions?: ModalAction[];
}

export function Modal({ visible, onClose, title, children, actions }: ModalProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const animateIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 40,
        bounciness: 0,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 40,
        bounciness: 0,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  const animateOut = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 30,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  useEffect(() => {
    if (visible) {
      animateIn();
    } else {
      animateOut();
    }
  }, [visible, animateIn, animateOut]);

  const handleRequestClose = useCallback(() => {
    animateOut();
    // Give animation time before closing
    setTimeout(onClose, 160);
  }, [animateOut, onClose]);

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleRequestClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleRequestClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.centerContainer,
            { opacity: fadeAnim },
          ]}
        >
          <Animated.View
            style={[
              styles.modal,
              {
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            {/* Header */}
            {title ? (
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <Pressable onPress={handleRequestClose} hitSlop={12}>
                  <Text style={styles.closeButton}>&times;</Text>
                </Pressable>
              </View>
            ) : null}

            {/* Body */}
            {children ? <View style={styles.body}>{children}</View> : null}

            {/* Footer Actions */}
            {actions && actions.length > 0 ? (
              <View style={styles.footer}>
                {actions.map((action, i) => (
                  <Button
                    key={i}
                    title={action.title}
                    onPress={action.onPress}
                    variant={action.variant ?? (i === actions.length - 1 ? 'purple' : 'gray')}
                    size="md"
                    fullWidth
                  />
                ))}
              </View>
            ) : null}
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  centerContainer: {
    width: '90%',
    maxWidth: 420,
    zIndex: 1,
  },
  modal: {
    backgroundColor: '#111120',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    flexShrink: 1,
  },
  closeButton: {
    fontSize: fontSize.xxl,
    color: colors.textDim,
    lineHeight: fontSize.xxl,
  },
  body: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
});
