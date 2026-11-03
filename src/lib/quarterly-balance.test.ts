import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { Transaction } from './types';
import { calculateAverageQuarterlyBalance, getQuarterOptions, getQuarterRange } from './quarterly-balance';

const tx = (id: string, date: string, amount: number, type: Transaction['type'], accountId = 'account-a'): Transaction => ({
  id, accountId, date, amount, type, description: id,
});

describe('quarterly average balance', () => {
  it('calculates a complete historical quarter using transactions after quarter end as an account-balance bridge', () => {
    const transactions = [
      tx('jan-debit', '2026-01-15T12:00:00.000Z', -100, 'debit'),
      tx('mar-credit', '2026-03-10T12:00:00.000Z', 200, 'credit'),
      tx('apr-debit', '2026-04-02T12:00:00.000Z', -100, 'debit'),
    ];
    const average = calculateAverageQuarterlyBalance(
      transactions,
      'account-a',
      900,
      '2026-Q1',
      new Date('2026-04-03T23:59:59.999Z'),
    );
    assert.equal(average, 864.44);
  });

  it('averages only elapsed days in the current quarter and does not project future days', () => {
    const transactions = [tx('oct-debit', '2026-10-15T10:00:00.000Z', -100, 'debit')];
    const average = calculateAverageQuarterlyBalance(
      transactions,
      'account-a',
      900,
      '2026-Q4',
      new Date(2026, 10, 3, 23, 59, 59, 999),
    );
    assert.equal(average, 941.18);
  });

  it('keeps account isolation and ignores transactions after the balance date', () => {
    const transactions = [
      tx('other-account', '2026-01-15T12:00:00.000Z', -500, 'debit', 'account-b'),
      tx('future', '2026-04-05T12:00:00.000Z', -200, 'debit'),
    ];
    const average = calculateAverageQuarterlyBalance(
      transactions,
      'account-a',
      1000,
      '2026-Q1',
      new Date('2026-04-03T23:59:59.999Z'),
    );
    assert.equal(average, 1000);
  });

  it('returns the constant account balance when no transactions occur in the selected quarter', () => {
    const transactions = [tx('old', '2025-12-31T12:00:00.000Z', -500, 'debit')];
    const average = calculateAverageQuarterlyBalance(
      transactions,
      'account-a',
      1234.56,
      '2026-Q1',
      new Date('2026-03-31T23:59:59.999Z'),
    );
    assert.equal(average, 1234.56);
  });

  it('generates the current quarter and previous quarters across year boundaries', () => {
    const options = getQuarterOptions(new Date(2026, 0, 1), 4);
    assert.deepEqual(options.map(option => option.value), ['2026-Q1', '2025-Q4', '2025-Q3', '2025-Q2']);
    assert.equal(getQuarterRange('2026-Q4').start.getMonth(), 9);
    assert.throws(() => getQuarterRange('2026-Q5'), /Invalid quarter/);
  });

  it('rejects a quarter that has not started', () => {
    assert.throws(() => calculateAverageQuarterlyBalance([], 'account-a', 100, '2026-Q4', new Date(2026, 5, 1)), /has not started/);
  });
});
