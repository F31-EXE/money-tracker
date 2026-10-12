import type { Account, Category, Transaction } from './types';

export const defaultCategories: Category[] = [
  { id: 'food', name: 'Продукты', icon: 'cart', color: '#FFB547', type: 'expense' },
  { id: 'cafe', name: 'Кафе', icon: 'cafe', color: '#FF7A59', type: 'expense' },
  { id: 'transport', name: 'Транспорт', icon: 'bus', color: '#4FC3F7', type: 'expense' },
  { id: 'home', name: 'Жильё', icon: 'home', color: '#9C8CFF', type: 'expense' },
  { id: 'shopping', name: 'Покупки', icon: 'bag-handle', color: '#FF6FB1', type: 'expense' },
  { id: 'health', name: 'Здоровье', icon: 'fitness', color: '#5BE3A4', type: 'expense' },
  { id: 'fun', name: 'Развлечения', icon: 'game-controller', color: '#C8F55A', type: 'expense' },
  { id: 'subs', name: 'Подписки', icon: 'repeat', color: '#7DD3FC', type: 'expense' },
  { id: 'travel', name: 'Путешествия', icon: 'airplane', color: '#F59E0B', type: 'expense' },
  { id: 'other-exp', name: 'Другое', icon: 'ellipsis-horizontal', color: '#9A9AAE', type: 'expense' },
  { id: 'salary', name: 'Зарплата', icon: 'briefcase', color: '#5BE3A4', type: 'income' },
  { id: 'freelance', name: 'Фриланс', icon: 'laptop', color: '#7B6CFF', type: 'income' },
  { id: 'gift', name: 'Подарки', icon: 'gift', color: '#FF6FB1', type: 'income' },
  { id: 'invest', name: 'Инвестиции', icon: 'trending-up', color: '#C8F55A', type: 'income' },
  { id: 'other-inc', name: 'Другое', icon: 'ellipsis-horizontal', color: '#9A9AAE', type: 'income' },
];

export const defaultAccounts: Account[] = [
  { id: 'card', name: 'Карта', icon: 'card', color: '#7B6CFF', initialBalance: 0 },
  { id: 'cash', name: 'Наличные', icon: 'cash', color: '#5BE3A4', initialBalance: 0 },
];

export const categoryColors = [
  '#FFB547', '#FF7A59', '#FF6FB1', '#9C8CFF', '#7B6CFF', '#4FC3F7',
  '#7DD3FC', '#5BE3A4', '#C8F55A', '#F59E0B', '#E5484D', '#9A9AAE',
];

export const categoryIcons = [
  'cart', 'cafe', 'restaurant', 'pizza', 'bus', 'car', 'airplane', 'home',
  'flash', 'water', 'wifi', 'phone-portrait', 'bag-handle', 'shirt', 'fitness',
  'medkit', 'game-controller', 'film', 'musical-notes', 'book', 'school',
  'paw', 'gift', 'heart', 'repeat', 'briefcase', 'laptop', 'trending-up',
  'cash', 'card', 'wallet', 'ellipsis-horizontal',
];

export function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** Realistic-looking data for the last ~3 months, for trying the app out. */
export function demoTransactions(): Transaction[] {
  const out: Transaction[] = [];
  const now = new Date();
  let seed = 42;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];
  const at = (daysAgo: number, hour: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, Math.floor(rnd() * 60), 0, 0);
    return d.toISOString();
  };
  const add = (t: Omit<Transaction, 'id'>) => out.push({ ...t, id: makeId() + out.length });

  for (let day = 0; day < 90; day++) {
    const d = new Date(now);
    d.setDate(d.getDate() - day);
    if (d.getDate() === 5) {
      add({ type: 'income', amount: 145000, categoryId: 'salary', accountId: 'card', note: 'Аванс + оклад', date: at(day, 10) });
    }
    if (d.getDate() === 20) {
      add({ type: 'income', amount: 60000, categoryId: 'salary', accountId: 'card', note: '', date: at(day, 10) });
    }
    if (d.getDate() === 1) {
      add({ type: 'expense', amount: 45000, categoryId: 'home', accountId: 'card', note: 'Аренда', date: at(day, 9) });
      add({ type: 'expense', amount: 799, categoryId: 'subs', accountId: 'card', note: 'Музыка', date: at(day, 12) });
    }
    if (d.getDate() === 12) {
      add({ type: 'expense', amount: 5400, categoryId: 'home', accountId: 'card', note: 'Коммуналка', date: at(day, 19) });
    }
    if (rnd() < 0.12) {
      add({ type: 'income', amount: Math.round(8000 + rnd() * 30000), categoryId: 'freelance', accountId: 'card', note: 'Проект', date: at(day, 16) });
    }
    const n = 1 + Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) {
      const cat = pick(['food', 'food', 'food', 'cafe', 'cafe', 'transport', 'transport', 'shopping', 'fun', 'health']);
      const base: Record<string, [number, number]> = {
        food: [400, 3500], cafe: [250, 2200], transport: [60, 900],
        shopping: [900, 9000], fun: [500, 4000], health: [300, 3500],
      };
      const [lo, hi] = base[cat];
      const notes: Record<string, string[]> = {
        food: ['Пятёрочка', 'ВкусВилл', 'Рынок', ''],
        cafe: ['Кофе', 'Обед', 'Ужин с друзьями', ''],
        transport: ['Метро', 'Такси', ''],
        shopping: ['Одежда', 'Для дома', ''],
        fun: ['Кино', 'Концерт', 'Боулинг'],
        health: ['Аптека', 'Спортзал'],
      };
      add({
        type: 'expense',
        amount: Math.round((lo + rnd() * (hi - lo)) / 10) * 10,
        categoryId: cat,
        accountId: rnd() < 0.9 ? 'card' : 'cash',
        note: pick(notes[cat]),
        date: at(day, 8 + Math.floor(rnd() * 13)),
      });
    }
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}
