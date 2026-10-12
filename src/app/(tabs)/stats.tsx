import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Bars, Donut } from '@/components/charts';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { Card, Empty, IconBubble, Progress, Screen, SectionHeader, Segmented, T } from '@/components/ui';
import { daysInMonth, monthShort, sameMonth, startOfMonth } from '@/lib/dates';
import { currencySymbol, formatCompact, formatMoney, plural } from '@/lib/format';
import { byCategory, dailyExpenses, monthTotals, monthlySeries } from '@/lib/stats';
import { useStore, type TxType } from '@/store';
import { useTheme } from '@/theme';

export default function Stats() {
  const { c } = useTheme();
  const transactions = useStore((s) => s.transactions);
  const categories = useStore((s) => s.categories);
  const currency = useStore((s) => s.settings.currency);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [type, setType] = useState<TxType>('expense');

  const slices = useMemo(() => byCategory(transactions, categories, month, type), [transactions, categories, month, type]);
  const totals = useMemo(() => monthTotals(transactions, month), [transactions, month]);
  const prev = useMemo(() => monthTotals(transactions, new Date(month.getFullYear(), month.getMonth() - 1, 1)), [transactions, month]);
  const series = useMemo(() => monthlySeries(transactions, month, 6), [transactions, month]);
  const days = daysInMonth(month);
  const daily = useMemo(() => dailyExpenses(transactions, month, days), [transactions, month, days]);

  const total = type === 'expense' ? totals.expense : totals.income;
  const prevTotal = type === 'expense' ? prev.expense : prev.income;
  const delta = prevTotal ? (total - prevTotal) / prevTotal : 0;
  const isCurrent = sameMonth(month, new Date());
  const elapsedDays = isCurrent ? new Date().getDate() : days;
  const avgDaily = totals.expense / Math.max(1, elapsedDays);
  const savingsRate = totals.income ? totals.net / totals.income : 0;
  // Bad direction: spending up, or income down.
  const deltaBad = type === 'expense' ? delta > 0 : delta < 0;

  return (
    <Screen>
      <T v="h1" style={{ marginBottom: 16 }}>
        Аналитика
      </T>
      <MonthSwitcher value={month} onChange={setMonth} />
      <Segmented
        style={{ marginTop: 12 }}
        value={type}
        onChange={setType}
        options={[
          { key: 'expense', label: 'Расходы' },
          { key: 'income', label: 'Доходы' },
        ]}
      />

      <Card style={{ marginTop: 16, alignItems: 'center', paddingVertical: 28 }}>
        <Donut data={slices.map((s) => ({ value: s.total, color: s.category.color }))} size={220} stroke={24}>
          <T v="caption" muted>
            {type === 'expense' ? 'Потрачено' : 'Получено'}
          </T>
          <T v="h1" style={{ fontSize: 24 }}>
            {formatMoney(total, currency)}
          </T>
          {prevTotal ? (
            <View style={[styles.pill, { backgroundColor: (deltaBad ? c.expense : c.income) + '22' }]}>
              <T v="caption" color={deltaBad ? c.expense : c.income}>
                {delta > 0 ? '▲' : '▼'} {Math.abs(Math.round(delta * 100))}% к прошлому
              </T>
            </View>
          ) : null}
        </Donut>
      </Card>

      {slices.length ? (
        <Card style={{ marginTop: 12, paddingVertical: 8 }}>
          {slices.map((s) => (
            <View key={s.category.id} style={styles.catRow}>
              <IconBubble icon={s.category.icon} color={s.category.color} size={40} />
              <View style={{ flex: 1, gap: 6 }}>
                <View style={styles.between}>
                  <T v="h3">{s.category.name}</T>
                  <T v="h3">{formatMoney(s.total, currency)}</T>
                </View>
                <Progress value={s.share} color={s.category.color} track={c.surfaceAlt} />
                <View style={styles.between}>
                  <T v="caption" faint>
                    {s.count} {plural(s.count, ['операция', 'операции', 'операций'])}
                  </T>
                  <T v="caption" muted>
                    {Math.round(s.share * 100)}%
                  </T>
                </View>
              </View>
            </View>
          ))}
        </Card>
      ) : (
        <Card style={{ marginTop: 12 }}>
          <Empty icon="pie-chart-outline" title="Нет данных" text="За этот месяц нет операций выбранного типа." />
        </Card>
      )}

      <View style={styles.kpis}>
        <Card style={styles.kpi}>
          <T v="caption" muted>
            В среднем в день
          </T>
          <T v="h3">{formatMoney(Math.round(avgDaily), currency)}</T>
        </Card>
        <Card style={styles.kpi}>
          <T v="caption" muted>
            Сбережения
          </T>
          <T v="h3" color={savingsRate >= 0 ? c.income : c.expense}>
            {totals.income ? `${Math.round(savingsRate * 100)}%` : '—'}
          </T>
        </Card>
        <Card style={styles.kpi}>
          <T v="caption" muted>
            Итог месяца
          </T>
          <T v="h3" color={totals.net >= 0 ? c.income : c.expense}>
            {formatCompact(totals.net)} {currencySymbol(currency)}
          </T>
        </Card>
      </View>

      <SectionHeader title="Расходы по дням" />
      <Card>
        <Bars
          values={daily}
          color={c.accent}
          height={120}
          highlight={isCurrent ? new Date().getDate() - 1 : undefined}
        />
        <View style={[styles.between, { marginTop: 8 }]}>
          <T v="caption" faint>
            1
          </T>
          <T v="caption" faint>
            {Math.ceil(days / 2)}
          </T>
          <T v="caption" faint>
            {days}
          </T>
        </View>
      </Card>

      <SectionHeader title="Полгода" />
      <Card>
        <View style={[styles.legend]}>
          <Legend color={c.income} label="Доходы" />
          <Legend color={c.heroFrom} label="Расходы" />
        </View>
        <Bars
          values={series.map((s) => s.expense)}
          secondary={series.map((s) => s.income)}
          color={c.heroFrom}
          secondaryColor={c.income}
          labels={series.map((s) => monthShort(s.month))}
          highlight={series.length - 1}
          height={140}
        />
      </Card>
    </Screen>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <T v="caption" muted>
        {label}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { marginTop: 8, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kpis: { flexDirection: 'row', gap: 10, marginTop: 12 },
  kpi: { flex: 1, padding: 14, gap: 6 },
  legend: { flexDirection: 'row', gap: 16, marginBottom: 14 },
});
