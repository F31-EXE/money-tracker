export type TxType = 'expense' | 'income';

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TxType;
};

export type Account = {
  id: string;
  name: string;
  icon: string;
  color: string;
  initialBalance: number;
};

export type Transaction = {
  id: string;
  type: TxType;
  amount: number;
  categoryId: string;
  accountId: string;
  note: string;
  /** ISO timestamp */
  date: string;
};

export type ThemePref = 'system' | 'dark' | 'light';

export type Settings = {
  currency: string;
  theme: ThemePref;
  /** Monthly spending limit, 0 = disabled */
  monthlyBudget: number;
};
