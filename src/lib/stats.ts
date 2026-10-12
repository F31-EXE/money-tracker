import type { Account, Category, Transaction } from '@/store';
import { addMonths, sameMonth } from './dates';

export const signed = (t: Transaction) => (t.type === 'income' ? t.amount : -t.amount);

export function totalBalance(transactions: Transaction[], accounts: Account[]) {
  return accounts.reduce((s, a) => s + a.initialBalance, 0) + transactions.reduce((s, t) => s + signed(t), 0);
}

export function accountBalance(account: Account, transactions: Transaction[]) {
  return transactions
    .filter((t) => t.accountId === account.id)
    .reduce((s, t) => s + signed(t), account.initialBalance);
}

export function monthTotals(transactions: Transaction[], month: Date) {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (!sameMonth(new Date(t.date), month)) continue;
    if (t.type === 'income') income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, net: income - expense };
}

export type CategorySlice = { category: Category; total: number; count: number; share: number };

export function byCategory(
  transactions: Transaction[],
  categories: Category[],
  month: Date,
  type: 'expense' | 'income',
): CategorySlice[] {
  const map = new Map<string, { total: number; count: number }>();
  for (const t of transactions) {
    if (t.type !== type || !sameMonth(new Date(t.date), month)) continue;
    const e = map.get(t.categoryId) ?? { total: 0, count: 0 };
    e.total += t.amount;
    e.count += 1;
    map.set(t.categoryId, e);
  }
  const sum = [...map.values()].reduce((s, e) => s + e.total, 0) || 1;
  return [...map.entries()]
    .map(([id, e]) => ({
      category: categories.find((c) => c.id === id) ?? {
        id, name: 'Без категории', icon: 'help', color: '#9A9AAE', type,
      },
      ...e,
      share: e.total / sum,
    }))
    .sort((a, b) => b.total - a.total);
}

/** Income/expense per month for the N months ending at `end`. */
export function monthlySeries(transactions: Transaction[], end: Date, count: number) {
  return Array.from({ length: count }, (_, i) => {
    const m = addMonths(end, i - count + 1);
    return { month: m, ...monthTotals(transactions, m) };
  });
}

/** Expense per day of the month. */
export function dailyExpenses(transactions: Transaction[], month: Date, days: number) {
  const arr = new Array(days).fill(0);
  for (const t of transactions) {
    const d = new Date(t.date);
    if (t.type === 'expense' && sameMonth(d, month)) arr[d.getDate() - 1] += t.amount;
  }
  return arr as number[];
}
