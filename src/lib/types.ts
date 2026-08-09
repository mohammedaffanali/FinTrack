export type TxnType = 'income' | 'expense';

export type PaymentMethod = 'UPI' | 'Debit Card' | 'Credit Card' | 'Cash' | 'Wallet' | 'Bank Transfer';

export const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Debit Card',
  'Credit Card',
  'Cash',
  'Wallet',
  'Bank Transfer',
];

export interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  type: TxnType;
  category: string;
  date: string; // YYYY-MM-DD
  payment_method: PaymentMethod;
  notes?: string;
}

export interface Budget {
  id: string;
  category: string;
  monthly_limit: number;
  month: string; // YYYY-MM
}

export type SubscriptionFrequency = 'monthly' | 'yearly' | 'weekly';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  frequency: SubscriptionFrequency;
  next_payment_date: string; // YYYY-MM-DD
  active: boolean;
}

export interface CategoryMeta {
  name: string;
  color: string;
  icon: string; // lucide icon name
}

export interface User {
  id: string;
  name: string;
  email: string;
}
