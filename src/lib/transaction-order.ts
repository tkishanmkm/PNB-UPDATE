import type { Transaction } from '@/lib/types';

/** Stable newest-first ordering; invalid timestamps are kept at the end. */
export function sortTransactionsNewestFirst<T extends Pick<Transaction, 'date'>>(
  transactions: T[],
): T[] {
  return transactions
    .map((transaction, index) => ({ transaction, index, timestamp: Date.parse(transaction.date) }))
    .sort((left, right) => {
      const leftValid = Number.isFinite(left.timestamp);
      const rightValid = Number.isFinite(right.timestamp);
      if (leftValid && rightValid) return right.timestamp - left.timestamp || left.index - right.index;
      if (leftValid) return -1;
      if (rightValid) return 1;
      return left.index - right.index;
    })
    .map(item => item.transaction);
}
