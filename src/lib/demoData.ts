import type { Transaction, Budget, Subscription } from './types';

function iso(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

let counter = 0;
function id(): string {
  counter += 1;
  return `demo-${counter}`;
}

interface Seed {
  merchant: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  daysAgo: number;
  payment_method: Transaction['payment_method'];
  notes?: string;
}

const SEED: Seed[] = [
  { merchant: 'Salary', amount: 65000, type: 'income', category: 'Income', daysAgo: 28, payment_method: 'Bank Transfer', notes: 'Monthly salary' },
  { merchant: 'Freelance Project', amount: 7000, type: 'income', category: 'Income', daysAgo: 12, payment_method: 'UPI' },
  { merchant: 'Swiggy', amount: 420, type: 'expense', category: 'Food & Dining', daysAgo: 1, payment_method: 'UPI' },
  { merchant: 'Zomato', amount: 680, type: 'expense', category: 'Food & Dining', daysAgo: 3, payment_method: 'UPI' },
  { merchant: 'Swiggy Instamart', amount: 320, type: 'expense', category: 'Food & Dining', daysAgo: 5, payment_method: 'UPI' },
  { merchant: 'Dominos', amount: 850, type: 'expense', category: 'Food & Dining', daysAgo: 7, payment_method: 'Credit Card' },
  { merchant: 'Starbucks', amount: 460, type: 'expense', category: 'Food & Dining', daysAgo: 9, payment_method: 'Credit Card' },
  { merchant: 'Chaayos', amount: 180, type: 'expense', category: 'Food & Dining', daysAgo: 11, payment_method: 'UPI' },
  { merchant: 'Restaurant', amount: 1240, type: 'expense', category: 'Food & Dining', daysAgo: 14, payment_method: 'Credit Card' },
  { merchant: 'KFC', amount: 540, type: 'expense', category: 'Food & Dining', daysAgo: 16, payment_method: 'UPI' },
  { merchant: 'Amazon', amount: 2499, type: 'expense', category: 'Shopping', daysAgo: 2, payment_method: 'Credit Card', notes: 'Headphones' },
  { merchant: 'Flipkart', amount: 1799, type: 'expense', category: 'Shopping', daysAgo: 4, payment_method: 'Debit Card' },
  { merchant: 'Myntra', amount: 3299, type: 'expense', category: 'Shopping', daysAgo: 6, payment_method: 'Credit Card' },
  { merchant: 'Decathlon', amount: 2200, type: 'expense', category: 'Shopping', daysAgo: 10, payment_method: 'Credit Card' },
  { merchant: 'Nykaa', amount: 1450, type: 'expense', category: 'Shopping', daysAgo: 15, payment_method: 'UPI' },
  { merchant: 'Uber', amount: 240, type: 'expense', category: 'Transport', daysAgo: 0, payment_method: 'UPI' },
  { merchant: 'Ola', amount: 180, type: 'expense', category: 'Transport', daysAgo: 2, payment_method: 'UPI' },
  { merchant: 'Uber', amount: 320, type: 'expense', category: 'Transport', daysAgo: 4, payment_method: 'UPI' },
  { merchant: 'Indian Oil', amount: 2000, type: 'expense', category: 'Transport', daysAgo: 8, payment_method: 'Credit Card', notes: 'Fuel' },
  { merchant: 'Metro', amount: 60, type: 'expense', category: 'Transport', daysAgo: 12, payment_method: 'Wallet' },
  { merchant: 'Electricity Board', amount: 2100, type: 'expense', category: 'Bills & Utilities', daysAgo: 6, payment_method: 'UPI', notes: 'Electricity bill' },
  { merchant: 'Airtel Mobile Recharge', amount: 399, type: 'expense', category: 'Bills & Utilities', daysAgo: 9, payment_method: 'UPI' },
  { merchant: 'ACT Fibernet', amount: 1200, type: 'expense', category: 'Bills & Utilities', daysAgo: 13, payment_method: 'UPI', notes: 'Broadband' },
  { merchant: 'Water Bill', amount: 480, type: 'expense', category: 'Bills & Utilities', daysAgo: 18, payment_method: 'UPI' },
  { merchant: 'BookMyShow', amount: 600, type: 'expense', category: 'Entertainment', daysAgo: 5, payment_method: 'UPI', notes: 'Movie tickets' },
  { merchant: 'Steam', amount: 1299, type: 'expense', category: 'Entertainment', daysAgo: 11, payment_method: 'Credit Card' },
  { merchant: 'Netflix', amount: 649, type: 'expense', category: 'Subscriptions', daysAgo: 4, payment_method: 'UPI' },
  { merchant: 'Spotify', amount: 119, type: 'expense', category: 'Subscriptions', daysAgo: 4, payment_method: 'UPI' },
  { merchant: 'YouTube Premium', amount: 149, type: 'expense', category: 'Subscriptions', daysAgo: 4, payment_method: 'UPI' },
  { merchant: 'Google One', amount: 130, type: 'expense', category: 'Subscriptions', daysAgo: 4, payment_method: 'UPI' },
  { merchant: 'Apollo Pharmacy', amount: 540, type: 'expense', category: 'Health', daysAgo: 7, payment_method: 'UPI' },
  { merchant: 'Practo', amount: 800, type: 'expense', category: 'Health', daysAgo: 17, payment_method: 'UPI', notes: 'Doctor consultation' },
  { merchant: 'MakeMyTrip', amount: 8500, type: 'expense', category: 'Travel', daysAgo: 20, payment_method: 'Credit Card', notes: 'Weekend trip' },
  { merchant: 'Udemy', amount: 499, type: 'expense', category: 'Education', daysAgo: 10, payment_method: 'Credit Card' },
  { merchant: 'BigBasket', amount: 1800, type: 'expense', category: 'Food & Dining', daysAgo: 8, payment_method: 'UPI', notes: 'Groceries' },
  { merchant: 'Cash withdrawal', amount: 2000, type: 'expense', category: 'Other', daysAgo: 3, payment_method: 'Cash' },
];

export function demoTransactions(): Transaction[] {
  return SEED.map((s) => ({
    id: id(),
    merchant: s.merchant,
    amount: s.amount,
    type: s.type,
    category: s.category,
    date: iso(s.daysAgo),
    payment_method: s.payment_method,
    notes: s.notes ?? '',
  }));
}

export function demoBudgets(): Budget[] {
  const mk = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  })();
  return [
    { id: id(), category: 'Food & Dining', monthly_limit: 10000, month: mk },
    { id: id(), category: 'Shopping', monthly_limit: 8000, month: mk },
    { id: id(), category: 'Transport', monthly_limit: 4000, month: mk },
    { id: id(), category: 'Bills & Utilities', monthly_limit: 5000, month: mk },
    { id: id(), category: 'Entertainment', monthly_limit: 3000, month: mk },
  ];
}

export function demoSubscriptions(): Subscription[] {
  const inDays = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  return [
    { id: id(), name: 'Netflix', amount: 649, frequency: 'monthly', next_payment_date: inDays(6), active: true },
    { id: id(), name: 'Spotify', amount: 119, frequency: 'monthly', next_payment_date: inDays(12), active: true },
    { id: id(), name: 'YouTube Premium', amount: 149, frequency: 'monthly', next_payment_date: inDays(3), active: true },
    { id: id(), name: 'Google One', amount: 130, frequency: 'monthly', next_payment_date: inDays(20), active: true },
  ];
}
