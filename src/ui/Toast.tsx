import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { View, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Glass } from './Glass';
import { Text } from './Text';
import { color, radius, space } from '@/design/tokens';

interface ToastState {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastApi {
  show(t: ToastState, ms?: number): void;
}

const Ctx = createContext<ToastApi>({ show: () => {} });

/**
 * Undo toast. Every log is optimistic, so undo is how a mis-tap is corrected —
 * it is not a nicety, it is the safety net that lets the sheet close instantly.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const show = useCallback((t: ToastState, ms = 4000) => {
    if (timer.current) clearTimeout(timer.current);
    setToast(t);
    timer.current = setTimeout(() => setToast(null), ms);
  }, []);

  const api = useMemo(() => ({ show }), [show]);

  return (
    <Ctx.Provider value={api}>
      {children}
      {toast ? (
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            left: space.md,
            right: space.md,
            bottom: insets.bottom + 96,
            alignItems: 'center',
          }}
        >
          <Glass radius={radius.control}>
            <View
              accessibilityLiveRegion="polite"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.md,
                paddingVertical: space.m,
                paddingHorizontal: space.md,
                minWidth: 240,
              }}
            >
              <Text variant="subheadline" style={{ flex: 1 }}>{toast.message}</Text>
              {toast.actionLabel ? (
                <Pressable
                  onPress={() => {
                    toast.onAction?.();
                    setToast(null);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={toast.actionLabel}
                  hitSlop={10}
                >
                  <Text variant="headline" color={color.brand.tintLight}>{toast.actionLabel}</Text>
                </Pressable>
              ) : null}
            </View>
          </Glass>
        </View>
      ) : null}
    </Ctx.Provider>
  );
}

export function useToast(): ToastApi {
  return useContext(Ctx);
}

export const isWeb = Platform.OS === 'web';
