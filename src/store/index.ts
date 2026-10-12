import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { defaultAccounts, defaultCategories, demoTransactions, makeId } from './defaults';
import type { Account, Category, Settings, Transaction } from './types';

export * from './types';

type State = {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  settings: Settings;
};

type Actions = {
  saveTransaction: (t: Omit<Transaction, 'id'> & { id?: string }) => void;
  deleteTransaction: (id: string) => void;
  saveCategory: (c: Omit<Category, 'id'> & { id?: string }) => void;
  deleteCategory: (id: string) => void;
  saveAccount: (a: Omit<Account, 'id'> & { id?: string }) => void;
  deleteAccount: (id: string) => void;
  updateSettings: (s: Partial<Settings>) => void;
  loadDemo: () => void;
  resetAll: () => void;
};

const initial: State = {
  transactions: [],
  categories: defaultCategories,
  accounts: defaultAccounts,
  settings: { currency: 'RUB', theme: 'system', monthlyBudget: 0 },
};

const sortByDate = (list: Transaction[]) =>
  [...list].sort((a, b) => b.date.localeCompare(a.date));

function upsert<T extends { id: string }>(list: T[], item: Omit<T, 'id'> & { id?: string }): T[] {
  if (item.id && list.some((x) => x.id === item.id)) {
    return list.map((x) => (x.id === item.id ? ({ ...x, ...item } as T) : x));
  }
  return [...list, { ...item, id: item.id ?? makeId() } as T];
}

export const useStore = create<State & Actions>()(
  persist(
    (set) => ({
      ...initial,
      saveTransaction: (t) => set((s) => ({ transactions: sortByDate(upsert(s.transactions, t)) })),
      deleteTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
      saveCategory: (c) => set((s) => ({ categories: upsert(s.categories, c) })),
      deleteCategory: (id) =>
        set((s) => {
          const cat = s.categories.find((c) => c.id === id);
          if (!cat) return s;
          // Keep history intact: move orphaned transactions to the "other" bucket.
          const fallback = cat.type === 'expense' ? 'other-exp' : 'other-inc';
          if (id === fallback) return s;
          return {
            categories: s.categories.filter((c) => c.id !== id),
            transactions: s.transactions.map((t) =>
              t.categoryId === id ? { ...t, categoryId: fallback } : t,
            ),
          };
        }),
      saveAccount: (a) => set((s) => ({ accounts: upsert(s.accounts, a) })),
      deleteAccount: (id) =>
        set((s) => {
          if (s.accounts.length <= 1) return s;
          const rest = s.accounts.filter((a) => a.id !== id);
          return {
            accounts: rest,
            transactions: s.transactions.map((t) =>
              t.accountId === id ? { ...t, accountId: rest[0].id } : t,
            ),
          };
        }),
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      loadDemo: () =>
        set((s) => ({
          transactions: sortByDate([...s.transactions, ...demoTransactions()]),
          // Demo spends some cash, so give that wallet a starting stash.
          accounts: s.accounts.map((a) => (a.id === 'cash' && !a.initialBalance ? { ...a, initialBalance: 40000 } : a)),
          settings: { ...s.settings, monthlyBudget: s.settings.monthlyBudget || 90000 },
        })),
      resetAll: () => set({ ...initial, settings: { ...initial.settings } }),
    }),
    {
      name: 'moneta-store',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/** Persisted state loads asynchronously; render nothing data-dependent until it has. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(() => useStore.persist.hasHydrated());
  useEffect(() => {
    const unsub = useStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useStore.persist.hasHydrated());
    return unsub;
  }, []);
  return hydrated;
}
