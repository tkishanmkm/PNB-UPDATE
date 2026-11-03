import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { Transaction } from './types';
import { sortTransactionsNewestFirst } from './transaction-order';

const transaction = (id: string, date: string): Transaction => ({
  id, accountId: 'account-a', date, description: id, amount: 1, type: 'credit',
});

describe('transaction history ordering', () => {
  it('sorts newest first while preserving source order for identical timestamps', () => {
    const rows = [
      transaction('same-first', '2026-11-02T10:00:00.000Z'),
      transaction('older', '2026-10-01T10:00:00.000Z'),
      transaction('same-second', '2026-11-02T10:00:00.000Z'),
      transaction('newest', '2026-11-03T10:00:00.000Z'),
    ];
    assert.deepEqual(sortTransactionsNewestFirst(rows).map(item => item.id), [
      'newest', 'same-first', 'same-second', 'older',
    ]);
  });

  it('places invalid timestamps at the end without reordering them', () => {
    const rows = [
      transaction('invalid-first', 'not-a-date'),
      transaction('newest', '2026-11-03T10:00:00.000Z'),
      transaction('invalid-second', ''),
    ];
    assert.deepEqual(sortTransactionsNewestFirst(rows).map(item => item.id), [
      'newest', 'invalid-first', 'invalid-second',
    ]);
  });
});
