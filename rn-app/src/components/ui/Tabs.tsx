import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../../theme/colors';

interface TabItem {
  key: string;
  label: string;
  icon?: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  const indicatorAnim = useRef(
    new Animated.Value(tabs.findIndex(t => t.key === activeTab) || 0)
  ).current;

  const handleTabPress = useCallback(
    (key: string, index: number) => {
      Animated.spring(indicatorAnim, {
        toValue: index,
        useNativeDriver: false,
        speed: 40,
        bounciness: 0,
      }).start();
      onTabChange(key);
    },
    [indicatorAnim, onTabChange]
  );

  const tabWidth = 1 / Math.max(tabs.length, 1);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab, index) => {
          const isActive = tab.key === activeTab;

          return (
            <Pressable
              key={tab.key}
              onPress={() => handleTabPress(tab.key, index)}
              style={[styles.tab, { width: undefined, minWidth: 72 }]}
            >
              {tab.icon ? (
                <Text
                  style={[
                    styles.icon,
                    isActive ? styles.iconActive : styles.iconInactive,
                  ]}
                >
                  {tab.icon}
                </Text>
              ) : null}
              <Text
                style={[
                  styles.label,
                  isActive ? styles.labelActive : styles.labelInactive,
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
              {isActive ? <View style={styles.activeDot} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10, 10, 26, 0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 8,
    // Safe area handled by parent or safe-area-view
  },
  scrollContent: {
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'row',
    width: '100%',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flex: 1,
    minWidth: 60,
  },
  icon: {
    fontSize: 20,
    marginBottom: 2,
  },
  iconActive: {
    // default text color
  },
  iconInactive: {
    opacity: 0.45,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  labelActive: {
    color: colors.purpleLight,
  },
  labelInactive: {
    color: colors.textDim,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.purple,
    marginTop: 3,
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    shadowOpacity: 0.6,
  },
});
