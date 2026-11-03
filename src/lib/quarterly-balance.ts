import type { Transaction } from '@/lib/types';

export interface QuarterOption {
  value: string;
  label: string;
}

export interface QuarterRange {
  start: Date;
  end: Date;
}

const QUARTERS = [
  { month: 'Jan-Mar', label: 'Q1 (Jan-Mar)' },
  { month: 'Apr-Jun', label: 'Q2 (Apr-Jun)' },
  { month: 'Jul-Sep', label: 'Q3 (Jul-Sep)' },
  { month: 'Oct-Dec', label: 'Q4 (Oct-Dec)' },
] as const;

export function getQuarterRange(quarterKey: string): QuarterRange {
  const match = /^(\d{4})-Q([1-4])$/.exec(quarterKey);
  if (!match) throw new Error('Invalid quarter selection.');

  const year = Number(match[1]);
  const quarterNumber = Number(match[2]);
  return {
    start: new Date(year, (quarterNumber - 1) * 3, 1, 0, 0, 0, 0),
    end: new Date(year, quarterNumber * 3, 0, 23, 59, 59, 999),
  };
}

export function getQuarterOptions(referenceDate = new Date(), count = 8): QuarterOption[] {
  if (!Number.isFinite(referenceDate.getTime())) throw new Error('Invalid reference date.');
  const safeCount = Math.max(1, Math.min(40, Math.floor(count)));
  const currentQuarter = Math.floor(referenceDate.getMonth() / 3);
  const options: QuarterOption[] = [];

  for (let offset = 0; offset < safeCount; offset++) {
    const absoluteQuarter = referenceDate.getFullYear() * 4 + currentQuarter - offset;
    const year = Math.floor(absoluteQuarter / 4);
    const quarterIndex = ((absoluteQuarter % 4) + 4) % 4;
    options.push({
      value: year + '-Q' + (quarterIndex + 1),
      label: QUARTERS[quarterIndex].label + ' ' + year,
    });
  }
  return options;
}

const signedPaise = (transaction: Transaction): number => {
  const amount = Math.round(Math.abs(transaction.amount) * 100);
  return transaction.type === 'credit' ? amount : -amount;
};

/**
 * Daily-weighted average balance for the selected quarter.
 * The account balance is treated as the balance at asOfDate. Transactions
 * between the quarter start and that anchor date are reversed to recover
 * the quarter opening balance, then quarter days are replayed in paise.
 * An incomplete current quarter is averaged only through asOfDate.
 */
export function calculateAverageQuarterlyBalance(
  transactions: Transaction[],
  accountId: string,
  accountBalance: number,
  quarterKey: string,
  asOfDate = new Date(),
): number {
  if (!Number.isFinite(accountBalance)) throw new Error('Account balance must be a finite number.');
  if (!Number.isFinite(asOfDate.getTime())) throw new Error('Invalid balance date.');

  const { start, end } = getQuarterRange(quarterKey);
  const asOf = new Date(asOfDate);
  const periodEnd = new Date(Math.min(end.getTime(), asOf.getTime()));
  if (periodEnd.getTime() < start.getTime()) {
    throw new Error('The selected quarter has not started yet.');
  }

  const validTransactions = (Array.isArray(transactions) ? transactions : [])
    .filter(transaction =>
      transaction.accountId === accountId &&
      Number.isFinite(Date.parse(transaction.date)) &&
      Number.isFinite(transaction.amount),
    )
    .map(transaction => ({ transaction, time: Date.parse(transaction.date) }))
    .filter(item => item.time >= start.getTime() && item.time <= asOf.getTime());

  const closingPaise = Math.round(accountBalance * 100);
  const netAfterQuarterStart = validTransactions.reduce((sum, item) => sum + signedPaise(item.transaction), 0);
  let runningPaise = closingPaise - netAfterQuarterStart;

  const dailyDeltas = new Map<string, number>();
  for (const item of validTransactions) {
    if (item.time > periodEnd.getTime()) continue;
    const day = new Date(item.time);
    const dayKey = day.getFullYear() + '-' + String(day.getMonth() + 1).padStart(2, '0') + '-' + String(day.getDate()).padStart(2, '0');
    dailyDeltas.set(dayKey, (dailyDeltas.get(dayKey) || 0) + signedPaise(item.transaction));
  }

  let weightedTotalPaise = 0;
  let dayCount = 0;
  for (const cursor = new Date(start); cursor <= periodEnd; cursor.setDate(cursor.getDate() + 1)) {
    const dayKey = cursor.getFullYear() + '-' + String(cursor.getMonth() + 1).padStart(2, '0') + '-' + String(cursor.getDate()).padStart(2, '0');
    runningPaise += dailyDeltas.get(dayKey) || 0;
    weightedTotalPaise += runningPaise;
    dayCount++;
  }

  if (dayCount === 0) return accountBalance;
  return Math.round((weightedTotalPaise / dayCount)) / 100;
}
