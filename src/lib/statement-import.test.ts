import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { Transaction } from './types';
import { createStatementTransactionId, planStatementAppend, validateStatementReplacement } from './statement-import';

const tx = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: 'stable-1',
  accountId: 'account-a',
  date: '2026-11-02',
  description: 'UPI grocery',
  amount: -250,
  type: 'debit',
  reference: 'UPI/REF/1',
  ...overrides,
});

describe('local statement import modes', () => {
  it('creates deterministic content-derived IDs for repeated identical rows', () => {
    const row = tx();
    const first = createStatementTransactionId('123456789012', row, 1);
    const repeated = createStatementTransactionId('123456789012', row, 2);
    assert.equal(first, createStatementTransactionId('12-3456-789012', row, 1));
    assert.notEqual(first, repeated);
  });

  it('appends new records and skips only exact ID-and-content duplicates', () => {
    const existing = [tx()];
    const plan = planStatementAppend(existing, [
      tx(),
      tx({ id: 'stable-2', description: 'UPI fuel', reference: 'UPI/REF/2' }),
    ], 'account-a');
    assert.equal(plan.skipped, 1);
    assert.deepEqual(plan.added.map(item => item.id), ['stable-2']);
  });

  it('rejects an existing transaction ID when the imported content differs', () => {
    assert.throws(() => planStatementAppend([tx()], [
      tx({ description: 'Different transaction' }),
    ], 'account-a'), /already exists with different data/);
  });

  it('skips identical legacy rows even when their old generated ID differs', () => {
    const plan = planStatementAppend(
      [tx({ id: 'legacy-index-0-20261102' })],
      [tx({ id: 'new-content-derived-id' })],
      'account-a',
    );
    assert.equal(plan.skipped, 1);
    assert.deepEqual(plan.added, []);
  });

  it('preserves the multiplicity of truly repeated identical statement rows', () => {
    const first = tx({ id: createStatementTransactionId('123456789012', tx(), 1) });
    const second = tx({ id: createStatementTransactionId('123456789012', tx(), 2) });
    const plan = planStatementAppend([first], [first, second], 'account-a');
    assert.equal(plan.skipped, 1);
    assert.deepEqual(plan.added.map(item => item.id), [second.id]);
  });

  it('rejects transaction rows belonging to another account', () => {
    assert.throws(() => planStatementAppend([], [
      tx({ accountId: 'account-b' }),
    ], 'account-a'), /different account/);
    assert.throws(() => validateStatementReplacement([
      tx({ accountId: 'account-b' }),
    ], 'account-a'), /different account/);
  });

  it('rejects duplicate transaction IDs in a replacement statement', () => {
    assert.throws(() => validateStatementReplacement([
      tx(),
      tx({ date: '2026-11-03' }),
    ], 'account-a'), /missing or duplicate transaction ID/);
  });

  it('accepts an empty statement replacement for a matched account', () => {
    assert.deepEqual(validateStatementReplacement([], 'account-a'), []);
  });
});
