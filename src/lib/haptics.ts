let _isNative = false;

try {
  _isNative = !!(typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).Capacitor);
} catch {
  // not native
}

export function isNativePlatform(): boolean {
  return _isNative;
}

// Haptic feedback types matching different game events
export type HapticType = 'click' | 'crit' | 'golden' | 'buy' | 'achieve' | 'heavy' | 'light' | 'medium';

/**
 * Fire haptic feedback. Works on Capacitor native (iOS/Android) and
 * falls back to a no-op on web (browsers don't have haptic APIs).
 */
export async function haptic(type: HapticType): Promise<void> {
  if (!_isNative) return;

  try {
    const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics');

    switch (type) {
      case 'click':
      case 'light':
        await Haptics.impact({ style: ImpactStyle.Light });
        break;
      case 'buy':
      case 'medium':
        await Haptics.impact({ style: ImpactStyle.Medium });
        break;
      case 'crit':
      case 'heavy':
        await Haptics.impact({ style: ImpactStyle.Heavy });
        break;
      case 'golden':
      case 'achieve':
        await Haptics.notification({ type: NotificationType.Success });
        break;
    }
  } catch {
    // Silently fail on unsupported devices
  }
}
