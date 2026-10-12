export const currencies = [
  { code: 'RUB', symbol: '₽', name: 'Российский рубль' },
  { code: 'USD', symbol: '$', name: 'Доллар США' },
  { code: 'EUR', symbol: '€', name: 'Евро' },
  { code: 'KZT', symbol: '₸', name: 'Казахстанский тенге' },
  { code: 'UAH', symbol: '₴', name: 'Украинская гривна' },
  { code: 'BYN', symbol: 'Br', name: 'Белорусский рубль' },
  { code: 'GBP', symbol: '£', name: 'Фунт стерлингов' },
];

export const currencySymbol = (code: string) =>
  currencies.find((c) => c.code === code)?.symbol ?? code;

/** "12 345,5" — spaces as thousand separators, no trailing zeros. */
export function formatNumber(n: number, maxFraction = 2) {
  const abs = Math.abs(n);
  const fixed = abs.toFixed(maxFraction).replace(/\.?0+$/, '');
  const [int, frac] = fixed.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (n < 0 ? '−' : '') + grouped + (frac ? ',' + frac : '');
}

export function formatMoney(n: number, currency: string, opts: { sign?: boolean } = {}) {
  const sign = opts.sign ? (n > 0 ? '+' : n < 0 ? '−' : '') : n < 0 ? '−' : '';
  return `${sign}${formatNumber(Math.abs(n))} ${currencySymbol(currency)}`;
}

/** 1.2M / 340K for chart axes. */
export function formatCompact(n: number) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (abs >= 1_000) return Math.round(n / 1_000) + 'K';
  return String(Math.round(n));
}

/** Russian plural form: plural(5, ["операция", "операции", "операций"]) */
export function plural(n: number, forms: [string, string, string]) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return forms[0];
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return forms[1];
  return forms[2];
}
