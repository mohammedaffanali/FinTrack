import type { CategoryMeta } from './types';

export const CATEGORIES: CategoryMeta[] = [
  { name: 'Food & Dining', color: '#f97316', icon: 'UtensilsCrossed' },
  { name: 'Shopping', color: '#ec4899', icon: 'ShoppingBag' },
  { name: 'Transport', color: '#3b82f6', icon: 'Car' },
  { name: 'Bills & Utilities', color: '#64748b', icon: 'ReceiptText' },
  { name: 'Entertainment', color: '#a855f7', icon: 'Clapperboard' },
  { name: 'Health', color: '#ef4444', icon: 'HeartPulse' },
  { name: 'Travel', color: '#14b8a6', icon: 'Plane' },
  { name: 'Education', color: '#0ea5e9', icon: 'GraduationCap' },
  { name: 'Subscriptions', color: '#8b5cf6', icon: 'Repeat' },
  { name: 'Income', color: '#22c55e', icon: 'ArrowDownLeft' },
  { name: 'Other', color: '#78716c', icon: 'CircleDashed' },
];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);

export const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c.name !== 'Income').map((c) => c.name);

export function categoryMeta(name: string): CategoryMeta {
  return CATEGORIES.find((c) => c.name === name) ?? CATEGORIES[CATEGORIES.length - 1];
}

export function categoryColor(name: string): string {
  return categoryMeta(name).color;
}
