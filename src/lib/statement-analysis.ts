import { format } from 'date-fns';
import type { Transaction } from '@/lib/types';

export interface LocalStatementAnalysis {
  summary: string;
  insights: string;
  transactionCount: number;
}

const money = (value: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const categoryFor = (transaction: Transaction): string => {
  const existing = transaction.category?.trim();
  if (existing) return existing.replace(/[_-]+/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());

  const text = (transaction.description || '').toLowerCase();
  if (/grocery|supermarket|restaurant|food|swiggy|zomato|cafe/.test(text)) return 'Food & Groceries';
  if (/fuel|petrol|diesel|uber|ola|metro|rail|transport|parking/.test(text)) return 'Transport';
  if (/electric|water bill|gas bill|mobile recharge|broadband|utility/.test(text)) return 'Utilities & Bills';
  if (/amazon|flipkart|shopping|retail|store|mall/.test(text)) return 'Shopping';
  if (/rent|housing|maintenance/.test(text)) return 'Housing';
  if (/school|college|tuition|education/.test(text)) return 'Education';
  if (/hospital|clinic|pharmacy|medical|health/.test(text)) return 'Health';
  if (/imps|neft|rtgs|fund transfer|upi/.test(text)) return 'Transfers';
  return 'Other';
};

export function analyzeStatementLocally(
  transactions: Transaction[],
  accountId: string,
  fromDate: Date,
  toDate: Date,
): LocalStatementAnalysis {
  const start = new Date(fromDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(toDate);
  end.setHours(23, 59, 59, 999);

  const matching = (Array.isArray(transactions) ? transactions : []).filter(transaction => {
    const timestamp = Date.parse(transaction.date);
    return transaction.accountId === accountId &&
      Number.isFinite(timestamp) &&
      timestamp >= start.getTime() &&
      timestamp <= end.getTime() &&
      Number.isFinite(transaction.amount);
  });

  if (matching.length === 0) {
    return {
      summary: 'No transactions were found for this account during the selected period.',
      insights: 'There is no spending activity to analyse for these dates. Try another date range or import the relevant statement.',
      transactionCount: 0,
    };
  }

  const debits = matching.filter(transaction => transaction.type === 'debit');
  const credits = matching.filter(transaction => transaction.type === 'credit');
  const totalDebits = debits.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  const totalCredits = credits.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  const net = totalCredits - totalDebits;

  const categoryTotals = new Map<string, number>();
  for (const transaction of debits) {
    const category = categoryFor(transaction);
    categoryTotals.set(category, (categoryTotals.get(category) || 0) + Math.abs(transaction.amount));
  }
  const topCategories = [...categoryTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const categorySummary = topCategories.length
    ? ' Top debit categories: ' + topCategories.map(([name, value]) => name + ' (' + money(value) + ')').join(', ') + '.'
    : '';

  const summary = [
    'Period: ' + format(start, 'dd MMM yyyy') + ' to ' + format(end, 'dd MMM yyyy') + '.',
    matching.length + ' transactions were recorded (' + debits.length + ' debits and ' + credits.length + ' credits).',
    'Total debits: ' + money(totalDebits) + '.',
    'Total credits: ' + money(totalCredits) + '.',
    'Net cash flow: ' + (net < 0 ? '-' : '+') + money(Math.abs(net)) + '.',
  ].join(' ') + categorySummary;

  const insights: string[] = [];
  if (topCategories[0]) {
    insights.push('Your highest recorded debit category is ' + topCategories[0][0] + ' at ' + money(topCategories[0][1]) + '.');
  }
  if (debits.length > 0) {
    const largestDebit = debits.reduce((largest, transaction) =>
      Math.abs(transaction.amount) > Math.abs(largest.amount) ? transaction : largest
    );
    insights.push('Your largest single debit was ' + money(Math.abs(largestDebit.amount)) +
      (largestDebit.description ? ' for ' + largestDebit.description : '') +
      ' on ' + format(new Date(largestDebit.date), 'dd MMM yyyy') + '.');
  }
  if (credits.length > 0 && totalCredits >= totalDebits) {
    insights.push('Recorded credits were equal to or higher than recorded debits during this period.');
  } else if (debits.length > 0) {
    insights.push('Recorded debits exceeded credits by ' + money(totalDebits - totalCredits) + ' during this period.');
  }
  if (insights.length === 0) insights.push('No debit transactions were recorded during this period.');

  return { summary, insights: insights.join('\n'), transactionCount: matching.length };
}
