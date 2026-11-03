import type { AccountDetails, AppState } from '@/lib/types';

export function getActiveAccount(state: Pick<AppState, 'accounts' | 'activeAccountId'>): AccountDetails | undefined {
  if (!Array.isArray(state.accounts) || state.accounts.length === 0) return undefined;
  return state.accounts.find(account => account.id === state.activeAccountId) || state.accounts[0];
}

export function resolveAccountId(
  accounts: AccountDetails[],
  requestedAccountId?: string | null,
  fallbackAccountId?: string | null,
): string | undefined {
  if (requestedAccountId && accounts.some(account => account.id === requestedAccountId)) return requestedAccountId;
  if (fallbackAccountId && accounts.some(account => account.id === fallbackAccountId)) return fallbackAccountId;
  return accounts[0]?.id;
}

export function resolveStatementAccountId(
  accounts: AccountDetails[],
  accountNumber: string,
  requestedAccountId?: string | null,
): string {
  const normalizedNumber = Array.from(accountNumber).filter(char => char >= '0' && char <= '9').join('');
  if (!normalizedNumber) throw new Error('A statement account number is required.');

  const matched = accounts.find(account =>
    Array.from(account.accountNumber).filter(char => char >= '0' && char <= '9').join('') === normalizedNumber,
  );
  if (matched) return matched.id;
  if (requestedAccountId && !accounts.some(account => account.id === requestedAccountId)) return requestedAccountId;

  const baseId = 'statement-' + normalizedNumber;
  if (!accounts.some(account => account.id === baseId)) return baseId;
  let suffix = 2;
  while (accounts.some(account => account.id === baseId + '-' + suffix)) suffix += 1;
  return baseId + '-' + suffix;
}
