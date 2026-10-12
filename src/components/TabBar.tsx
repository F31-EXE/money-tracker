import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { T, Tap, haptic } from './ui';

export const WIDE_BREAKPOINT = 900;

export const tabMeta: Record<string, { label: string; icon: string; iconActive: string }> = {
  index: { label: 'Главная', icon: 'home-outline', iconActive: 'home' },
  history: { label: 'История', icon: 'list-outline', iconActive: 'list' },
  stats: { label: 'Аналитика', icon: 'pie-chart-outline', iconActive: 'pie-chart' },
  settings: { label: 'Профиль', icon: 'person-circle-outline', iconActive: 'person-circle' },
};

const openNew = () => router.push('/transaction/new');

/** Floating pill bar on phones with the "add" button in the middle. */
export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const items = state.routes.map((route, index) => {
    const meta = tabMeta[route.name];
    const focused = state.index === index;
    return (
      <Pressable
        key={route.key}
        style={styles.item}
        onPress={() => {
          haptic('select');
          const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
        }}
      >
        <Ionicons name={(focused ? meta.iconActive : meta.icon) as any} size={22} color={focused ? c.text : c.textFaint} />
        <View style={[styles.dot, { backgroundColor: focused ? c.accent : 'transparent' }]} />
      </Pressable>
    );
  });

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 14) }]}>
      <LinearGradient
        pointerEvents="none"
        colors={[c.bg + '00', c.bg]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.bar, { backgroundColor: c.surface, borderColor: c.border }]}>
        {items.slice(0, 2)}
        <Tap onPress={openNew} style={[styles.add, { backgroundColor: c.accent }]} scale={0.9}>
          <Ionicons name="add" size={30} color={c.accentText} />
        </Tap>
        {items.slice(2)}
      </View>
    </View>
  );
}

/** Sidebar for wide (desktop web) layouts. */
export function SideBar({ state, navigation }: BottomTabBarProps) {
  const { c } = useTheme();
  return (
    <View style={[styles.side, { backgroundColor: c.bg, borderRightColor: c.border }]}>
      <View style={styles.brand}>
        <LinearGradient colors={[c.heroFrom, c.heroTo]} style={styles.logo}>
          <Ionicons name="sparkles" size={18} color="#fff" />
        </LinearGradient>
        <T v="h2">Moneta</T>
      </View>
      <Tap onPress={openNew} style={[styles.sideAdd, { backgroundColor: c.accent }]}>
        <Ionicons name="add" size={22} color={c.accentText} />
        <T v="h3" color={c.accentText}>
          Новая операция
        </T>
      </Tap>
      <View style={{ gap: 4, marginTop: 12 }}>
        {state.routes.map((route, index) => {
          const meta = tabMeta[route.name];
          const focused = state.index === index;
          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={({ hovered }: any) => [
                styles.sideItem,
                { backgroundColor: focused ? c.surface : hovered ? c.surface + '80' : 'transparent' },
              ]}
            >
              <Ionicons name={(focused ? meta.iconActive : meta.icon) as any} size={20} color={focused ? c.text : c.textMuted} />
              <T v="h3" color={focused ? c.text : c.textMuted}>
                {meta.label}
              </T>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 24, alignItems: 'center' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 68,
    borderRadius: 34,
    paddingHorizontal: 10,
    width: '90%',
    maxWidth: 420,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%', gap: 5 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  add: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginHorizontal: 6 },
  side: { width: 260, paddingHorizontal: 18, paddingTop: 28, borderRightWidth: StyleSheet.hairlineWidth },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, marginBottom: 28 },
  logo: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  sideAdd: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 16 },
  sideItem: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 46, borderRadius: 14, paddingHorizontal: 14 },
});
