import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRef, type ReactNode } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { font, radius, useTheme } from '@/theme';

export const MAX_WIDTH = 560;

export const haptic = (style: 'light' | 'medium' | 'select' = 'light') => {
  if (Platform.OS === 'web') return;
  if (style === 'select') Haptics.selectionAsync();
  else Haptics.impactAsync(style === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
};

type Variant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'label' | 'caption';
const variants: Record<Variant, TextStyle> = {
  display: { fontFamily: font.extrabold, fontSize: 40, letterSpacing: -1.2 },
  h1: { fontFamily: font.extrabold, fontSize: 28, letterSpacing: -0.6 },
  h2: { fontFamily: font.bold, fontSize: 20, letterSpacing: -0.3 },
  h3: { fontFamily: font.bold, fontSize: 16 },
  body: { fontFamily: font.medium, fontSize: 15 },
  label: { fontFamily: font.semibold, fontSize: 13 },
  caption: { fontFamily: font.medium, fontSize: 12 },
};

export function T({
  v = 'body',
  color,
  muted,
  faint,
  style,
  ...rest
}: TextProps & { v?: Variant; color?: string; muted?: boolean; faint?: boolean }) {
  const { c } = useTheme();
  const col = color ?? (faint ? c.textFaint : muted ? c.textMuted : c.text);
  return <Text {...rest} style={[variants[v], { color: col }, style]} />;
}

/** Pressable that gently shrinks while held. */
export function Tap({
  children,
  style,
  scale = 0.96,
  onPress,
  ...rest
}: PressableProps & { style?: StyleProp<ViewStyle>; scale?: number; children: ReactNode }) {
  const v = useRef(new Animated.Value(1)).current;
  const to = (value: number) =>
    Animated.spring(v, { toValue: value, useNativeDriver: Platform.OS !== 'web', speed: 40, bounciness: 6 }).start();
  return (
    <Pressable
      {...rest}
      onPress={(e) => {
        haptic();
        onPress?.(e);
      }}
      onPressIn={() => to(scale)}
      onPressOut={() => to(1)}
    >
      <Animated.View style={[style, { transform: [{ scale: v }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

export function Screen({
  children,
  scroll = true,
  padded = true,
  bottomInset = 120,
}: {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  bottomInset?: number;
}) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const inner = (
    <View style={[styles.column, padded && { paddingHorizontal: 20 }, { paddingTop: insets.top + 12 }]}>
      {children}
    </View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={{ paddingBottom: bottomInset + insets.bottom }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
    </View>
  );
}

export function Card({ children, style, alt }: { children: ReactNode; style?: StyleProp<ViewStyle>; alt?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={[{ backgroundColor: alt ? c.surfaceAlt : c.surface, borderRadius: radius.lg, padding: 18 }, style]}>
      {children}
    </View>
  );
}

export function IconBubble({
  icon,
  color,
  size = 44,
  solid,
}: {
  icon: string;
  color: string;
  size?: number;
  solid?: boolean;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.36,
        backgroundColor: solid ? color : color + '24',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={icon as any} size={size * 0.48} color={solid ? '#0B0B10' : color} />
    </View>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const { c } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <T v="h2">{title}</T>
      {action ? (
        <Pressable onPress={onAction} hitSlop={10}>
          <T v="label" color={c.textMuted}>
            {action}
          </T>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Segmented<K extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: { key: K; label: string }[];
  value: K;
  onChange: (k: K) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  return (
    <View style={[styles.segmented, { backgroundColor: c.surface }, style]}>
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => {
              haptic('select');
              onChange(o.key);
            }}
            style={[styles.segment, active && { backgroundColor: c.surfaceAlt }]}
          >
            <T v="label" color={active ? c.text : c.textMuted}>
              {o.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Progress({ value, color, track }: { value: number; color: string; track: string }) {
  return (
    <View style={{ height: 8, borderRadius: 4, backgroundColor: track, overflow: 'hidden' }}>
      <View style={{ width: `${Math.min(1, Math.max(0, value)) * 100}%`, height: '100%', borderRadius: 4, backgroundColor: color }} />
    </View>
  );
}

export function Button({
  title,
  onPress,
  icon,
  kind = 'primary',
  style,
  disabled,
}: {
  title: string;
  onPress: () => void;
  icon?: string;
  kind?: 'primary' | 'ghost' | 'danger';
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) {
  const { c } = useTheme();
  const bg = kind === 'primary' ? c.accent : kind === 'danger' ? c.expense + '1F' : c.surface;
  const fg = kind === 'primary' ? c.accentText : kind === 'danger' ? c.expense : c.text;
  return (
    <Tap onPress={onPress} disabled={disabled} style={[styles.button, { backgroundColor: bg, opacity: disabled ? 0.4 : 1 }, style]}>
      {icon ? <Ionicons name={icon as any} size={18} color={fg} /> : null}
      <T v="h3" color={fg}>
        {title}
      </T>
    </Tap>
  );
}

export function Empty({ icon, title, text, children }: { icon: string; title: string; text: string; children?: ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: c.surface }]}>
        <Ionicons name={icon as any} size={30} color={c.textMuted} />
      </View>
      <T v="h3" style={{ textAlign: 'center' }}>
        {title}
      </T>
      <T muted style={{ textAlign: 'center', maxWidth: 280 }}>
        {text}
      </T>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  column: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 12,
  },
  segmented: { flexDirection: 'row', borderRadius: 14, padding: 4 },
  segment: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 11 },
  button: {
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  empty: { alignItems: 'center', gap: 10, paddingVertical: 40 },
  emptyIcon: { width: 72, height: 72, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
});
