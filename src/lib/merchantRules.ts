import { CATEGORY_NAMES } from './categories';

interface Rule {
  pattern: RegExp;
  category: string;
}

const RULES: Rule[] = [
  { pattern: /swiggy|zomato|dominos|mcdonald|kfc|pizza|biryani|restaurant|cafe|starbucks|chaayos|eatfit/i, category: 'Food & Dining' },
  { pattern: /uber|ola|rapido|metro|fuel|petrol|diesel|irctc|train|bus|parking|cab/i, category: 'Transport' },
  { pattern: /amazon|flipkart|myntra|ajio|meesho|nykaa|decathlon|ikea|bigbasket/i, category: 'Shopping' },
  { pattern: /netflix|spotify|youtube|prime|hotstar|disney|google one|icloud|dropbox|canva|adobe|notion|github/i, category: 'Subscriptions' },
  { pattern: /electricity|water|gas|broadband|wifi|airtel|jio|recharge|mobile|dth|bsnl|act fibernet/i, category: 'Bills & Utilities' },
  { pattern: /bookmyshow|pvr|inox|steam|game|playstation|xbox|concert|movie/i, category: 'Entertainment' },
  { pattern: /apollo|medplus|pharmeasy|practo|hospital|clinic|doctor|lab|diagnostic|1mg|netmeds/i, category: 'Health' },
  { pattern: /makemytrip|goibibo|cleartrip|oyo|airbnb|indigo|vistara|spicejet|hotel|flight/i, category: 'Travel' },
  { pattern: /udemy|coursera|byju|unacademy|skillshare|tuition|college|school|book/i, category: 'Education' },
  { pattern: /salary|stipend|refund|cashback|interest|dividend|reimburse/i, category: 'Income' },
];

export function categorizeByMerchant(merchant: string): string {
  const m = merchant.trim();
  if (!m) return 'Other';
  for (const rule of RULES) {
    if (rule.pattern.test(m)) return rule.category;
  }
  return 'Other';
}

export function isValidCategory(name: string): boolean {
  return CATEGORY_NAMES.includes(name);
}
