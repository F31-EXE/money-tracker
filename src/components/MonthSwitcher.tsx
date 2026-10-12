import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { addMonths, monthTitle, sameMonth } from '@/lib/dates';
import { useTheme } from '@/theme';
import { T, haptic } from './ui';

export function MonthSwitcher({ value, onChange }: { value: Date; onChange: (d: Date) => void }) {
  const { c } = useTheme();
  const isCurrent = sameMonth(value, new Date());
  const step = (n: number) => {
    haptic('select');
    onChange(addMonths(value, n));
  };
  return (
    <View style={[styles.wrap, { backgroundColor: c.surface }]}>
      <Pressable onPress={() => step(-1)} hitSlop={8} style={styles.btn}>
        <Ionicons name="chevron-back" size={18} color={c.text} />
      </Pressable>
      <T v="h3">{monthTitle(value)}</T>
      <Pressable onPress={() => step(1)} disabled={isCurrent} hitSlop={8} style={[styles.btn, isCurrent && { opacity: 0.25 }]}>
        <Ionicons name="chevron-forward" size={18} color={c.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 16, padding: 6 },
  btn: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
