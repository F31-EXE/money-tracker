import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { GroupedTransactions } from '@/components/TransactionList';
import { Button, Card, Empty, IconBubble, Progress, Screen, SectionHeader, T, Tap } from '@/components/ui';
import { daysInMonth, monthTitle } from '@/lib/dates';
import { formatMoney, formatNumber, currencySymbol } from '@/lib/format';
import { accountBalance, byCategory, monthTotals, totalBalance } from '@/lib/stats';
import { useStore } from '@/store';
import { radius, useTheme } from '@/theme';

function greeting() {
  const h = new Date().getHours();
  if (h < 6) return 'Доброй ночи';
  if (h < 12) return 'Доброе утро';
  if (h < 18) return 'Добрый день';
  return 'Добрый вечер';
}

export default function Home() {
  const { c } = useTheme();
  const transactions = useStore((s) => s.transactions);
  const accounts = useStore((s) => s.accounts);
  const categories = useStore((s) => s.categories);
  const { currency, monthlyBudget } = useStore((s) => s.settings);
  const loadDemo = useStore((s) => s.loadDemo);

  const now = new Date();
  const balance = totalBalance(transactions, accounts);
  const month = useMemo(() => monthTotals(transactions, now), [transactions]);
  const top = useMemo(() => byCategory(transactions, categories, now, 'expense').slice(0, 4), [transactions, categories]);
  const recent = transactions.slice(0, 6);

  const [int, frac] = formatNumber(balance).split(',');
  const budgetLeft = monthlyBudget - month.expense;
  const daysLeft = daysInMonth(now) - now.getDate() + 1;

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <T muted>{greeting()}</T>
          <T v="h1">{monthTitle(now)}</T>
        </View>
        <Tap onPress={() => router.push('/(tabs)/stats')} style={[styles.headerBtn, { backgroundColor: c.surface }]}>
          <Ionicons name="stats-chart" size={20} color={c.text} />
        </Tap>
      </View>

      <LinearGradient colors={[c.heroFrom, c.heroTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={[styles.orb, { backgroundColor: '#ffffff14', top: -60, right: -40 }]} />
        <View style={[styles.orb, { backgroundColor: '#C8F55A22', width: 140, height: 140, bottom: -70, left: -30 }]} />
        <T v="label" color={c.heroMuted}>
          Общий баланс
        </T>
        <View style={styles.balanceRow}>
          <T v="display" color={c.heroText}>
            {int}
          </T>
          <T v="h2" color={c.heroMuted} style={{ marginBottom: 6 }}>
            {frac ? `,${frac} ` : ' '}
            {currencySymbol(currency)}
          </T>
        </View>
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <View style={[styles.heroIcon, { backgroundColor: '#ffffff1f' }]}>
              <Ionicons name="arrow-down" size={14} color="#fff" />
            </View>
            <View>
              <T v="caption" color={c.heroMuted}>
                Доходы
              </T>
              <T v="h3" color={c.heroText}>
                {formatMoney(month.income, currency)}
              </T>
            </View>
          </View>
          <View style={styles.heroStat}>
            <View style={[styles.heroIcon, { backgroundColor: '#ffffff1f' }]}>
              <Ionicons name="arrow-up" size={14} color="#fff" />
            </View>
            <View>
              <T v="caption" color={c.heroMuted}>
                Расходы
              </T>
              <T v="h3" color={c.heroText}>
                {formatMoney(month.expense, currency)}
              </T>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -20, marginTop: 14 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
      >
        {accounts.map((a) => (
          <Tap key={a.id} onPress={() => router.push('/accounts')} style={[styles.account, { backgroundColor: c.surface }]}>
            <IconBubble icon={a.icon} color={a.color} size={34} />
            <View>
              <T v="caption" muted>
                {a.name}
              </T>
              <T v="h3">{formatMoney(accountBalance(a, transactions), currency)}</T>
            </View>
          </Tap>
        ))}
        <Tap onPress={() => router.push('/accounts')} style={[styles.account, styles.accountAdd, { borderColor: c.border }]}>
          <Ionicons name="add" size={20} color={c.textMuted} />
        </Tap>
      </ScrollView>

      {monthlyBudget > 0 ? (
        <Card style={{ marginTop: 14 }}>
          <View style={styles.rowBetween}>
            <T v="h3">Бюджет на месяц</T>
            <T v="label" muted>
              {formatMoney(month.expense, currency)} / {formatMoney(monthlyBudget, currency)}
            </T>
          </View>
          <View style={{ marginVertical: 12 }}>
            <Progress
              value={month.expense / monthlyBudget}
              color={budgetLeft < 0 ? c.expense : month.expense / monthlyBudget > 0.8 ? '#FFB547' : c.accent}
              track={c.surfaceAlt}
            />
          </View>
          <T v="caption" muted>
            {budgetLeft >= 0
              ? `Осталось ${formatMoney(budgetLeft, currency)} · ≈ ${formatMoney(Math.floor(budgetLeft / daysLeft), currency)} в день`
              : `Превышение на ${formatMoney(-budgetLeft, currency)}`}
          </T>
        </Card>
      ) : null}

      {top.length > 0 ? (
        <>
          <SectionHeader title="Куда уходят деньги" action="Подробнее" onAction={() => router.push('/(tabs)/stats')} />
          <View style={styles.grid}>
            {top.map((s) => (
              <Card key={s.category.id} style={styles.tile}>
                <IconBubble icon={s.category.icon} color={s.category.color} size={38} />
                <T v="caption" muted style={{ marginTop: 14 }} numberOfLines={1}>
                  {s.category.name}
                </T>
                <T v="h3">{formatMoney(s.total, currency)}</T>
                <View style={{ marginTop: 10 }}>
                  <Progress value={s.share} color={s.category.color} track={c.surfaceAlt} />
                </View>
              </Card>
            ))}
          </View>
        </>
      ) : null}

      <SectionHeader
        title="Последние операции"
        action={recent.length ? 'Все' : undefined}
        onAction={() => router.push('/(tabs)/history')}
      />
      {recent.length ? (
        <GroupedTransactions items={recent} />
      ) : (
        <Card>
          <Empty icon="wallet-outline" title="Пока пусто" text="Добавьте первую операцию кнопкой «+» или загрузите демо-данные, чтобы осмотреться.">
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <Button title="Добавить" icon="add" onPress={() => router.push('/transaction/new')} />
              <Button title="Демо" kind="ghost" icon="sparkles" onPress={loadDemo} style={{ backgroundColor: c.surfaceAlt }} />
            </View>
          </Empty>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  headerBtn: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  hero: { borderRadius: radius.xl, padding: 24, overflow: 'hidden' },
  orb: { position: 'absolute', width: 200, height: 200, borderRadius: 100 },
  balanceRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 6 },
  heroStats: { flexDirection: 'row', gap: 12, marginTop: 26 },
  heroStat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  account: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 18, paddingVertical: 12, paddingLeft: 12, paddingRight: 18 },
  accountAdd: { borderWidth: 1, borderStyle: 'dashed', paddingRight: 12, width: 58, justifyContent: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { flexBasis: '47%', flexGrow: 1, padding: 16 },
});
