import type { Transaction, TxnType, PaymentMethod } from './types';
import { PAYMENT_METHODS } from './types';
import { categorizeByMerchant, isValidCategory } from './merchantRules';

export interface ParsedRow {
  date: string;
  description: string;
  amount: number;
  type: TxnType;
  category: string;
  payment_method: PaymentMethod;
  notes?: string;
  valid: boolean;
  errors: string[];
}

export interface ParseResult {
  rows: ParsedRow[];
  validCount: number;
  invalidCount: number;
  headers: string[];
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[\s_]+/g, '');
}

function parseAmount(raw: string): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[₹,\s]/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseDate(raw: string): string | null {
  if (!raw) return null;
  const s = raw.trim();
  // YYYY-MM-DD
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  // DD/MM/YYYY
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const [_, d, mo, y] = m;
    return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // DD-MM-YYYY
  m = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (m) {
    const [_, d, mo, y] = m;
    return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return null;
}

function splitCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

export function parseCSV(text: string): ParseResult {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return { rows: [], validCount: 0, invalidCount: 0, headers: [] };
  }
  const headerCells = splitCSVLine(lines[0]);
  const headers = headerCells.map(normalizeHeader);
  const findCol = (...names: string[]): number => {
    for (const n of names) {
      const idx = headers.indexOf(n);
      if (idx >= 0) return idx;
    }
    return -1;
  };

  const dateIdx = findCol('date', 'transactiondate');
  const descIdx = findCol('description', 'merchant', 'narration', 'details', 'particulars');
  const amountIdx = findCol('amount', 'value');
  const typeIdx = findCol('type', 'transactiontype');
  const catIdx = findCol('category', 'cat');
  const payIdx = findCol('paymentmethod', 'mode', 'method', 'payment');

  const rows: ParsedRow[] = [];
  let validCount = 0;
  let invalidCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const cells = splitCSVLine(lines[i]);
    const errors: string[] = [];

    const rawDate = dateIdx >= 0 ? cells[dateIdx] : '';
    const date = parseDate(rawDate);
    if (!date) errors.push('Invalid or missing date');

    const description = descIdx >= 0 ? cells[descIdx] : '';
    if (!description) errors.push('Missing description');

    const rawAmount = amountIdx >= 0 ? cells[amountIdx] : '';
    const amount = parseAmount(rawAmount);
    if (amount === null) errors.push('Invalid amount');

    let type: TxnType = 'expense';
    if (typeIdx >= 0 && cells[typeIdx]) {
      const t = cells[typeIdx].toLowerCase();
      if (t.startsWith('inc')) type = 'income';
      else if (t.startsWith('exp') || t === 'debit') type = 'expense';
      else if (t === 'credit') type = 'income';
    } else if (amount !== null && rawAmount.startsWith('-')) {
      type = 'expense';
    }

    let category = catIdx >= 0 ? cells[catIdx] : '';
    if (!category || !isValidCategory(category)) {
      category = categorizeByMerchant(description);
    }

    let payment_method: PaymentMethod = 'UPI';
    if (payIdx >= 0 && cells[payIdx]) {
      const pm = cells[payIdx];
      const found = PAYMENT_METHODS.find((p) => p.toLowerCase() === pm.toLowerCase());
      if (found) payment_method = found;
    }

    const valid = errors.length === 0;
    if (valid) validCount++;
    else invalidCount++;

    rows.push({
      date: date ?? rawDate,
      description: description,
      amount: amount ?? 0,
      type,
      category,
      payment_method,
      valid,
      errors,
    });
  }

  return { rows, validCount, invalidCount, headers };
}

export function rowsToTransactions(rows: ParsedRow[]): Omit<Transaction, 'id'>[] {
  return rows
    .filter((r) => r.valid)
    .map((r) => ({
      merchant: r.description,
      amount: r.amount,
      type: r.type,
      category: r.category,
      date: r.date,
      payment_method: r.payment_method,
      notes: r.notes ?? '',
    }));
}
