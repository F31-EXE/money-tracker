import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { GroupedTransactions } from '@/components/TransactionList';
import { Card, Empty, Screen, Segmented, T } from '@/components/ui';
import { sameMonth, startOfMonth } from '@/lib/dates';
import { formatMoney, plural } from '@/lib/format';
import { useStore } from '@/store';
import { font, useTheme } from '@/theme';

type Filter = 'all' | 'expense' | 'income';

export default function History() {
  const { c } = useTheme();
  const transactions = useStore((s) => s.transactions);
  const categories = useStore((s) => s.categories);
  const currency = useStore((s) => s.settings.currency);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((t) => {
      if (filter !== 'all' && t.type !== filter) return false;
      if (q) {
        // Search spans all months.
        const cat = categories.find((x) => x.id === t.categoryId)?.name ?? '';
        return t.note.toLowerCase().includes(q) || cat.toLowerCase().includes(q) || String(t.amount).includes(q);
      }
      return sameMonth(new Date(t.date), month);
    });
  }, [transactions, categories, filter, query, month]);

  const total = items.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0);

  return (
    <Screen>
      <T v="h1" style={{ marginBottom: 16 }}>
        История
      </T>

      <View style={[styles.search, { backgroundColor: c.surface }]}>
        <Ionicons name="search" size={18} color={c.textFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Поиск по заметкам и категориям"
          placeholderTextColor={c.textFaint}
          style={[styles.input, { color: c.text }]}
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={10}>
            <Ionicons name="close" size={18} color={c.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {!query ? (
        <View style={{ marginTop: 12 }}>
          <MonthSwitcher value={month} onChange={setMonth} />
        </View>
      ) : null}

      <Segmented
        style={{ marginTop: 12 }}
        value={filter}
        onChange={setFilter}
        options={[
          { key: 'all', label: 'Все' },
          { key: 'expense', label: 'Расходы' },
          { key: 'income', label: 'Доходы' },
        ]}
      />

      <View style={styles.summary}>
        <T v="label" muted>
          {items.length} {plural(items.length, ['операция', 'операции', 'операций'])}
        </T>
        <T v="label" color={total >= 0 ? c.income : c.expense}>
          {formatMoney(total, currency, { sign: true })}
        </T>
      </View>

      {items.length ? (
        <GroupedTransactions items={items} />
      ) : (
        <Card>
          <Empty
            icon={query ? 'search' : 'calendar-outline'}
            title={query ? 'Ничего не найдено' : 'Нет операций'}
            text={query ? 'Попробуйте другой запрос.' : 'В этом месяце пока ничего не записано.'}
          />
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, paddingHorizontal: 16, height: 50 },
  input: { flex: 1, fontFamily: font.medium, fontSize: 15, height: '100%', outlineStyle: 'none' } as any,
  summary: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 12, paddingHorizontal: 4 },
});
