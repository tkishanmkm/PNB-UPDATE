import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { AccountDetails, AppState } from './types';
import { getActiveAccount, resolveAccountId, resolveStatementAccountId } from './accounts';

const makeAccount = (id: string, accountNumber: string): AccountDetails => ({
  id, userId: 'user', accountNumber, type: 'Savings', balance: 100,
  currencySymbol: '₹', accountHolder: 'Customer', customerAddress: '',
  customerCity: '', customerPin: '', branchName: '', branchAddress: '',
  branchCity: '', branchPin: '', ifsc: '', ckycNumber: '', nominee: '',
});

describe('active account resolution', () => {
  const a = makeAccount('account-a', '1111');
  const b = makeAccount('account-b', '2222');

  it('uses the saved active account instead of the first account', () => {
    const state = { accounts: [a, b], activeAccountId: 'account-b' } as AppState;
    assert.equal(getActiveAccount(state)?.id, 'account-b');
    assert.equal(resolveAccountId(state.accounts, undefined, state.activeAccountId), 'account-b');
  });

  it('falls back safely when the saved account is missing', () => {
    const state = { accounts: [a, b], activeAccountId: 'deleted-account' } as AppState;
    assert.equal(getActiveAccount(state)?.id, 'account-a');
    assert.equal(resolveAccountId(state.accounts, 'deleted-account'), 'account-a');
  });

  it('honours an explicitly requested valid account before the current selection', () => {
    assert.equal(resolveAccountId([a, b], 'account-a', 'account-b'), 'account-a');
    assert.equal(getActiveAccount({ accounts: [], activeAccountId: 'account-a' } as unknown as AppState), undefined);
  });

  it('matches an imported statement by normalized account number and avoids ID collisions', () => {
    const formattedNumber = makeAccount('formatted', '22-22 00 00 22 22');
    assert.equal(resolveStatementAccountId([a, formattedNumber], '222200002222', 'statement-222200002222'), 'formatted');
    assert.equal(resolveStatementAccountId([a], '333300003333'), 'statement-333300003333');
    assert.equal(resolveStatementAccountId(
      [a, makeAccount('statement-444400004444', '555500005555')],
      '444400004444',
    ), 'statement-444400004444-2');
    assert.throws(() => resolveStatementAccountId([a], '----'), /account number is required/);
  });
});
