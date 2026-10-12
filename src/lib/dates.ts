const MONTHS = [
  'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
  'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь',
];
const MONTHS_GEN = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];
const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const WEEKDAYS = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
export const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
export const daysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const sameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

export const dayKey = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

export function monthTitle(d: Date) {
  const now = new Date();
  const name = cap(MONTHS[d.getMonth()]);
  return d.getFullYear() === now.getFullYear() ? name : `${name} ${d.getFullYear()}`;
}

export const monthShort = (d: Date) => MONTHS_SHORT[d.getMonth()];

/** "Сегодня", "Вчера", "Пятница, 3 октября" */
export function dayTitle(d: Date) {
  const today = startOfDay(new Date());
  const diff = Math.round((today.getTime() - startOfDay(d).getTime()) / 86_400_000);
  if (diff === 0) return 'Сегодня';
  if (diff === 1) return 'Вчера';
  const base = `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`;
  const year = d.getFullYear() !== today.getFullYear() ? ` ${d.getFullYear()}` : '';
  return `${cap(WEEKDAYS[d.getDay()])}, ${base}${year}`;
}

export const timeLabel = (d: Date) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
