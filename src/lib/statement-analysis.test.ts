import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { Transaction } from './types';
import { analyzeStatementLocally } from './statement-analysis';

const tx = (overrides: Partial<Transaction> & Pick<Transaction, 'id' | 'accountId' | 'date' | 'description' | 'amount' | 'type'>): Transaction => ({ ...overrides });

describe('local statement analysis', () => {
  it('returns a completed no-transactions result for an empty account history', () => {
    const result = analyzeStatementLocally([], 'account-a', new Date('2026-11-01'), new Date('2026-11-03'));
    assert.equal(result.transactionCount, 0);
    assert.match(result.summary, /No transactions were found/);
    assert.ok(result.insights.length > 0);
  });

  it('filters by account and includes both ends of the selected dates', () => {
    const transactions = [
      tx({ id: 'debit', accountId: 'account-a', date: new Date(2026, 10, 1, 0, 0, 0).toISOString(), description: 'Grocery store', category: 'Food', amount: -120.5, type: 'debit' }),
      tx({ id: 'credit', accountId: 'account-a', date: new Date(2026, 10, 3, 23, 59, 59).toISOString(), description: 'Salary', amount: 500, type: 'credit' }),
      tx({ id: 'other-account', accountId: 'account-b', date: new Date(2026, 10, 2, 10, 0, 0).toISOString(), description: 'Other account debit', amount: -9999, type: 'debit' }),
      tx({ id: 'outside', accountId: 'account-a', date: new Date(2026, 10, 4, 0, 0, 0).toISOString(), description: 'Outside range', amount: -50, type: 'debit' }),
    ];
    const result = analyzeStatementLocally(transactions, 'account-a', new Date(2026, 10, 1), new Date(2026, 10, 3));
    assert.equal(result.transactionCount, 2);
    assert.match(result.summary, /Total debits: ₹120\.50/);
    assert.match(result.summary, /Total credits: ₹500\.00/);
    assert.match(result.summary, /Net cash flow: \+₹379\.50/);
  });

  it('produces deterministic category and largest-debit insights', () => {
    const transactions = [
      tx({ id: '1', accountId: 'account-a', date: '2026-11-02T10:00:00.000Z', description: 'Grocery store', amount: -80, type: 'debit' }),
      tx({ id: '2', accountId: 'account-a', date: '2026-11-02T11:00:00.000Z', description: 'Supermarket', amount: -120, type: 'debit' }),
    ];
    const result = analyzeStatementLocally(transactions, 'account-a', new Date('2026-11-01'), new Date('2026-11-03'));
    assert.match(result.summary, /Food & Groceries \(₹200\.00\)/);
    assert.match(result.insights, /Food & Groceries/);
    assert.match(result.insights, /₹120\.00/);
  });
});
