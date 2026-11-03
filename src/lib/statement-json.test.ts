import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { Transaction } from './types';
import { createStatementJsonExport, normalizeStatementJson } from './statement-json';

const details = {
  accountNumber: '123456789012',
  accountHolder: 'Example Customer',
  customerAddress: '12 Example Road',
  customerCity: 'Kota',
  customerPin: '324001',
  branchName: 'Main Branch',
  branchAddress: 'Bank Street',
  branchCity: 'Kota',
  branchPin: '324001',
  ifsc: 'PUNB0001234',
  micrCode: '324024002',
  customerId: 'CIF123',
  ckycNumber: 'CKYC123',
  nominee: 'Example Nominee',
  accountType: 'Savings' as const,
  closingBalance: 12500.75,
};

const transactions: Transaction[] = [
  { id: 'txn-1', accountId: 'statement-123456789012', date: '2026-11-02T10:00:00.000Z', description: 'UPI/Grocery', amount: -250.5, type: 'debit', balanceAfter: 12500.75, instrumentId: 'UPI123' },
];

describe('statement JSON import/export consistency', () => {
  it('round-trips extracted account details and transaction running balances', () => {
    const exported = createStatementJsonExport('123456789012', details, transactions, '2026-11-03T00:00:00.000Z');
    const imported = normalizeStatementJson(exported, accountNumber => accountNumber === '123456789012' ? 'saved-account' : null);
    assert.equal(imported.canSave, true);
    assert.equal(imported.accountId, 'saved-account');
    assert.equal(imported.statementDetails?.accountHolder, 'Example Customer');
    assert.equal(imported.statementDetails?.closingBalance, 12500.75);
    assert.equal(imported.transactions[0].accountId, 'saved-account');
    assert.equal(imported.transactions[0].balanceAfter, 12500.75);
    assert.equal(imported.transactions[0].amount, -250.5);
  });

  it('blocks an unmatched account while retaining a safe preview', () => {
    const exported = createStatementJsonExport('999999999999', details, transactions);
    const imported = normalizeStatementJson(exported, () => null);
    assert.equal(imported.canSave, false);
    assert.equal(imported.accountId, null);
    assert.equal(imported.transactions[0].accountId, 'unmatched');
  });

  it('supports legacy statement JSON without schema version or statement details', () => {
    const imported = normalizeStatementJson({
      accountNumber: '12-3456-789012',
      transactions: [{ date: '2026-11-02T10:00:00.000Z', description: 'Salary', amount: 500, type: 'credit' }],
    }, () => 'saved-account');
    assert.equal(imported.canSave, true);
    assert.equal(imported.statementDetails, null);
    assert.equal(imported.transactions[0].id, 'imported-pdf-1');
    assert.equal(imported.transactions[0].accountId, 'saved-account');
  });

  it('allows an empty statement export so account details can still be restored', () => {
    const exported = createStatementJsonExport('123456789012', details, []);
    const imported = normalizeStatementJson(exported, () => 'saved-account');
    assert.equal(imported.transactions.length, 0);
    assert.equal(imported.statementDetails?.closingBalance, 12500.75);
    assert.equal(imported.canSave, true);
  });

  it('allows a missing-account preview to be re-imported without permitting replacement', () => {
    const exported = createStatementJsonExport(null, null, transactions);
    const imported = normalizeStatementJson(exported, () => 'saved-account');
    assert.equal(imported.accountNumber, '');
    assert.equal(imported.canSave, false);
    assert.equal(imported.accountId, null);
    assert.equal(imported.transactions[0].accountId, 'unmatched');
  });

  it('rejects duplicate transaction IDs and invalid balance values', () => {
    assert.throws(() => normalizeStatementJson({
      accountNumber: '123456789012',
      transactions: [
        { id: 'same', date: '2026-11-02', description: 'A', amount: 1, type: 'credit' },
        { id: 'same', date: '2026-11-02', description: 'B', amount: 2, type: 'credit' },
      ],
    }, () => 'saved-account'), /duplicate transaction IDs/);

    assert.throws(() => normalizeStatementJson({
      accountNumber: '123456789012',
      transactions: [{ id: 'bad', date: '2026-11-02', description: 'A', amount: 1, type: 'credit', balanceAfter: 'bad' }],
    }, () => 'saved-account'), /invalid running balance/);
  });
});
