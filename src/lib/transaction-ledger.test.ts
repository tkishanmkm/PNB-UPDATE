import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { AccountDetails, Transaction } from './types';
import { reconcileTransactionRemoval, reconcileTransactionUpdate } from './transaction-ledger';

const account: AccountDetails = {
  id: 'account-a', userId: 'user-a', accountNumber: '1234567890', type: 'Savings',
  balance: 900, currencySymbol: '₹', accountHolder: 'Example', customerAddress: '',
  customerCity: '', customerPin: '', branchName: '', branchAddress: '', branchCity: '',
  branchPin: '', ifsc: '', ckycNumber: '', nominee: '',
};

const history: Transaction[] = [
  { id: 't3', accountId: 'account-a', date: '2026-02-03T10:00:00.000Z', description: 'Later credit', amount: 100, type: 'credit', balanceAfter: 900 },
  { id: 't2', accountId: 'account-a', date: '2026-02-02T10:00:00.000Z', description: 'Edited debit', amount: -100, type: 'debit', balanceAfter: 800 },
  { id: 't1', accountId: 'account-a', date: '2026-02-01T10:00:00.000Z', description: 'Earlier credit', amount: 900, type: 'credit', balanceAfter: 900 },
];

describe('transaction ledger reconciliation', () => {
  it('updates the closing balance and later source balance anchors after an amount edit', () => {
    const result = reconcileTransactionUpdate(history, [account], 't2', { ...history[1], amount: -50 });
    assert.ok(result);
    assert.equal(result.accounts[0].balance, 950);
    assert.equal(result.transactions.find(item => item.id === 't2')?.balanceAfter, 850);
    assert.equal(result.transactions.find(item => item.id === 't3')?.balanceAfter, 950);
    assert.equal(result.transactions.find(item => item.id === 't1')?.balanceAfter, 900);
  });

  it('repositions a dated transaction and drops its stale imported balance anchor', () => {
    const edited = { ...history[1], date: '2026-02-04T10:00:00.000Z' };
    const result = reconcileTransactionUpdate(history, [account], 't2', edited);
    assert.ok(result);
    assert.equal(result.accounts[0].balance, 900);
    assert.equal(result.transactions[0].id, 't2');
    assert.equal(result.transactions.find(item => item.id === 't3')?.balanceAfter, 1000);
    assert.equal(result.transactions.find(item => item.id === 't2')?.balanceAfter, undefined);
  });

  it('preserves imported source order for equal timestamps when recalculating running anchors', () => {
    const sameDay: Transaction[] = [
      { id: 'newest', accountId: 'account-a', date: '2026-02-02T10:00:00.000Z', description: 'Newest credit', amount: 100, type: 'credit', balanceAfter: 900 },
      { id: 'middle', accountId: 'account-a', date: '2026-02-02T10:00:00.000Z', description: 'Middle debit', amount: -100, type: 'debit', balanceAfter: 800 },
      { id: 'oldest', accountId: 'account-a', date: '2026-02-02T10:00:00.000Z', description: 'Oldest credit', amount: 900, type: 'credit', balanceAfter: 900 },
    ];
    const result = reconcileTransactionUpdate(sameDay, [{ ...account, balance: 900 }], 'middle', { ...sameDay[1], amount: -50 });
    assert.ok(result);
    assert.deepEqual(result.transactions.map(item => item.id), ['newest', 'middle', 'oldest']);
    assert.equal(result.transactions.find(item => item.id === 'newest')?.balanceAfter, 950);
    assert.equal(result.transactions.find(item => item.id === 'middle')?.balanceAfter, 850);
    assert.equal(result.transactions.find(item => item.id === 'oldest')?.balanceAfter, 900);
  });

  it('rejects primary ID changes, invalid amounts and missing accounts', () => {
    assert.equal(reconcileTransactionUpdate(history, [account], 't2', { ...history[1], id: 'new-id' }), null);
    assert.equal(reconcileTransactionUpdate(history, [account], 't2', { ...history[1], amount: Number.NaN }), null);
    assert.equal(reconcileTransactionUpdate(history, [], 't2', history[1]), null);
  });

  it('reconciles account and later running balances when a debit is deleted', () => {
    const result = reconcileTransactionRemoval(history, [account], 't2');
    assert.ok(result);
    assert.equal(result.transactions.length, 2);
    assert.equal(result.accounts[0].balance, 1000);
    assert.equal(result.transactions.find(item => item.id === 't3')?.balanceAfter, 1000);
    assert.equal(result.transactions.find(item => item.id === 't1')?.balanceAfter, 900);
  });

  it('does not affect transactions belonging to other accounts', () => {
    const other: Transaction = {
      id: 'other', accountId: 'account-b', date: '2026-02-04T10:00:00.000Z',
      description: 'Other account', amount: -50, type: 'debit', balanceAfter: 50,
    };
    const result = reconcileTransactionRemoval([...history, other], [account], 't2');
    assert.ok(result);
    assert.equal(result.transactions.find(item => item.id === 'other')?.balanceAfter, 50);
  });

  it('removes a matching bank-charge row when its completed transfer is deleted', () => {
    const transferRows: Transaction[] = [
      { id: 'later', accountId: 'account-a', date: '2026-02-04T10:00:00.000Z', description: 'Later credit', amount: 10, type: 'credit', balanceAfter: 905 },
      { id: 'transfer-1', accountId: 'account-a', date: '2026-02-03T10:00:00.000Z', description: 'IMPS-IN/transfer-1', amount: -100, type: 'debit', category: 'Transfer', balanceAfter: 900, payeeId: 'payee-1' },
      { id: 'transfer-1-CHG', accountId: 'account-a', date: '2026-02-03T10:00:00.000Z', description: 'IMPS bank charge', amount: -5, type: 'debit', category: 'Bank Charges', balanceAfter: 895 },
      { id: 'opening', accountId: 'account-a', date: '2026-02-02T10:00:00.000Z', description: 'Opening credit', amount: 1000, type: 'credit', balanceAfter: 1000 },
    ];
    const result = reconcileTransactionRemoval(transferRows, [{ ...account, balance: 905 }], 'transfer-1');
    assert.ok(result);
    assert.equal(result.transactions.some(item => item.id === 'transfer-1'), false);
    assert.equal(result.transactions.some(item => item.id === 'transfer-1-CHG'), false);
    assert.equal(result.accounts[0].balance, 1010);
    assert.equal(result.transactions.find(item => item.id === 'later')?.balanceAfter, 1010);
    assert.equal(result.transactions.find(item => item.id === 'opening')?.balanceAfter, 1000);
  });

  it('rejects unknown or unlinked transaction deletions', () => {
    assert.equal(reconcileTransactionRemoval(history, [account], 'missing'), null);
    assert.equal(reconcileTransactionRemoval(history, [], 't2'), null);
  });
});
