import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { dayKey, dayTitle, timeLabel } from '@/lib/dates';
import { formatMoney } from '@/lib/format';
import { signed } from '@/lib/stats';
import { useStore, type Transaction } from '@/store';
import { radius, useTheme } from '@/theme';
import { IconBubble, T, Tap } from './ui';

export function TransactionRow({ tx }: { tx: Transaction }) {
  const { c } = useTheme();
  const category = useStore((s) => s.categories.find((x) => x.id === tx.categoryId));
  const account = useStore((s) => s.accounts.find((x) => x.id === tx.accountId));
  const currency = useStore((s) => s.settings.currency);
  const income = tx.type === 'income';
  return (
    <Tap
      scale={0.98}
      onPress={() => router.push({ pathname: '/transaction/[id]', params: { id: tx.id } })}
      style={styles.row}
    >
      <IconBubble icon={category?.icon ?? 'help'} color={category?.color ?? c.textMuted} />
      <View style={{ flex: 1, gap: 2 }}>
        <T v="h3" numberOfLines={1}>
          {tx.note || category?.name || 'Без категории'}
        </T>
        <T v="caption" muted numberOfLines={1}>
          {[tx.note ? category?.name : null, account?.name, timeLabel(new Date(tx.date))].filter(Boolean).join(' · ')}
        </T>
      </View>
      <T v="h3" color={income ? c.income : c.text}>
        {formatMoney(signed(tx), currency, { sign: true })}
      </T>
    </Tap>
  );
}

/** Transactions grouped by day with a per-day total in each header. */
export function GroupedTransactions({ items }: { items: Transaction[] }) {
  const { c } = useTheme();
  const currency = useStore((s) => s.settings.currency);
  const groups = useMemo(() => {
    const out: { key: string; date: Date; items: Transaction[]; total: number }[] = [];
    for (const t of items) {
      const key = dayKey(t.date);
      let g = out[out.length - 1];
      if (!g || g.key !== key) {
        g = { key, date: new Date(t.date), items: [], total: 0 };
        out.push(g);
      }
      g.items.push(t);
      g.total += signed(t);
    }
    return out;
  }, [items]);

  return (
    <View style={{ gap: 20 }}>
      {groups.map((g) => (
        <View key={g.key}>
          <View style={styles.dayHeader}>
            <T v="label" muted>
              {dayTitle(g.date)}
            </T>
            <T v="label" faint>
              {formatMoney(g.total, currency, { sign: true })}
            </T>
          </View>
          <View style={[styles.group, { backgroundColor: c.surface }]}>
            {g.items.map((t, i) => (
              <View key={t.id}>
                {i > 0 ? <View style={[styles.divider, { backgroundColor: c.border }]} /> : null}
                <TransactionRow tx={t} />
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, paddingHorizontal: 14 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 4 },
  group: { borderRadius: radius.lg, overflow: 'hidden', paddingVertical: 4 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 72 },
});
