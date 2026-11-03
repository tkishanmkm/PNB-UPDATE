import type { AccountDetails, Transaction } from '@/lib/types';

export interface TransactionLedgerUpdate {
  transactions: Transaction[];
  accounts: AccountDetails[];
}

const signedAmountPaise = (transaction: Transaction): number => {
  const amount = Math.round(Math.abs(transaction.amount) * 100);
  return transaction.type === 'debit' ? -amount : amount;
};

const compareChronologically = (
  leftTime: number,
  leftIndex: number,
  rightTime: number,
  rightIndex: number,
): number => leftTime - rightTime || rightIndex - leftIndex;

export function reconcileTransactionUpdate(
  transactions: Transaction[],
  accounts: AccountDetails[],
  originalId: string,
  updatedTransaction: Transaction,
): TransactionLedgerUpdate | null {
  const originalIndex = transactions.findIndex(transaction => transaction.id === originalId);
  if (originalIndex < 0) return null;

  const original = transactions[originalIndex];
  const oldTime = Date.parse(original.date);
  const newTime = Date.parse(updatedTransaction.date);
  const newAmount = Number(updatedTransaction.amount);

  if (
    updatedTransaction.id !== originalId ||
    updatedTransaction.accountId !== original.accountId ||
    !Number.isFinite(oldTime) ||
    !Number.isFinite(newTime) ||
    !Number.isFinite(newAmount) ||
    !updatedTransaction.description?.trim()
  ) return null;

  const currentAccount = accounts.find(account => account.id === original.accountId);
  if (!currentAccount || !Number.isFinite(currentAccount.balance)) return null;

  const normalizedUpdated: Transaction = {
    ...updatedTransaction,
    id: originalId,
    accountId: original.accountId,
    description: updatedTransaction.description.trim(),
    amount: updatedTransaction.type === 'debit' ? -Math.abs(newAmount) : Math.abs(newAmount),
  };
  const oldDelta = signedAmountPaise(original);
  const newDelta = signedAmountPaise(normalizedUpdated);
  const sameDate = oldTime === newTime;

  const replaced = transactions.map((transaction, index) => ({
    transaction: index === originalIndex ? normalizedUpdated : transaction,
    originalIndex: index,
  }));
  const sorted = [...replaced].sort((a, b) => {
    const aTime = Date.parse(a.transaction.date);
    const bTime = Date.parse(b.transaction.date);
    if (!Number.isFinite(aTime) || !Number.isFinite(bTime)) return a.originalIndex - b.originalIndex;
    return bTime - aTime || a.originalIndex - b.originalIndex;
  });
  const newChronologicalIndex = sorted.findIndex(item => item.originalIndex === originalIndex);

  const adjustedTransactions = sorted.map((item, sortedIndex) => {
    const transaction = item.transaction;
    if (transaction.accountId !== original.accountId || typeof transaction.balanceAfter !== 'number' || !Number.isFinite(transaction.balanceAfter)) {
      return transaction;
    }

    if (item.originalIndex === originalIndex) {
      if (!sameDate) return { ...transaction, balanceAfter: undefined };
      return { ...transaction, balanceAfter: (Math.round(transaction.balanceAfter * 100) + newDelta - oldDelta) / 100 };
    }

    const transactionTime = Date.parse(transaction.date);
    if (!Number.isFinite(transactionTime)) return transaction;

    // The stored list is newest-first; equal-date rows retain their stable
    // source order and are replayed in reverse by statement-balance calculation.
    const afterOldPosition = compareChronologically(transactionTime, item.originalIndex, oldTime, originalIndex) > 0;
    const afterNewPosition = compareChronologically(transactionTime, sortedIndex, newTime, newChronologicalIndex) > 0;
    const adjustedPaise = Math.round(transaction.balanceAfter * 100) -
      (afterOldPosition ? oldDelta : 0) +
      (afterNewPosition ? newDelta : 0);

    return adjustedPaise === Math.round(transaction.balanceAfter * 100)
      ? transaction
      : { ...transaction, balanceAfter: adjustedPaise / 100 };
  });

  const balanceDelta = newDelta - oldDelta;
  const nextAccountBalancePaise = Math.round(currentAccount.balance * 100) + balanceDelta;
  const nextAccounts = accounts.map(account => account.id === currentAccount.id
    ? { ...account, balance: nextAccountBalancePaise / 100 }
    : account);

  return { transactions: adjustedTransactions, accounts: nextAccounts };
}

export function reconcileTransactionRemoval(
  transactions: Transaction[],
  accounts: AccountDetails[],
  transactionId: string,
): TransactionLedgerUpdate | null {
  const originalIndex = transactions.findIndex(transaction => transaction.id === transactionId);
  if (originalIndex < 0) return null;

  const original = transactions[originalIndex];
  const currentAccount = accounts.find(account => account.id === original.accountId);
  if (!currentAccount || !Number.isFinite(currentAccount.balance)) return null;

  const removedEntries = [{ transaction: original, index: originalIndex }];
  // A completed transfer and its separate bank-charge row form one receipt.
  // Removing the debit also removes its matching charge so the ledger and
  // receipt cannot retain a charge without the underlying transfer.
  if (original.category === 'Transfer') {
    const chargeIndex = transactions.findIndex(transaction =>
      transaction.id === transactionId + '-CHG' &&
      transaction.accountId === original.accountId &&
      transaction.category === 'Bank Charges',
    );
    if (chargeIndex >= 0) {
      removedEntries.push({ transaction: transactions[chargeIndex], index: chargeIndex });
    }
  }

  const removedDeltas = removedEntries.map(entry => ({
    ...entry,
    time: Date.parse(entry.transaction.date),
    delta: signedAmountPaise(entry.transaction),
  }));
  if (removedDeltas.some(entry => !Number.isFinite(entry.time) || !Number.isFinite(entry.transaction.amount))) {
    return null;
  }

  const removedIndexSet = new Set(removedEntries.map(entry => entry.index));
  const totalRemovedDelta = removedDeltas.reduce((sum, entry) => sum + entry.delta, 0);

  const nextTransactions = transactions
    .map((transaction, index) => ({ transaction, index }))
    .filter(entry => !removedIndexSet.has(entry.index))
    .map(({ transaction, index }) => {
      if (transaction.accountId !== original.accountId ||
          typeof transaction.balanceAfter !== 'number' ||
          !Number.isFinite(transaction.balanceAfter)) return transaction;

      const transactionTime = Date.parse(transaction.date);
      if (!Number.isFinite(transactionTime)) return transaction;
      const adjustment = removedDeltas.reduce((sum, removed) =>
        compareChronologically(transactionTime, index, removed.time, removed.index) > 0
          ? sum + removed.delta
          : sum,
      0);
      if (adjustment === 0) return transaction;

      const adjustedPaise = Math.round(transaction.balanceAfter * 100) - adjustment;
      return { ...transaction, balanceAfter: adjustedPaise / 100 };
    })
    .sort((left, right) => Date.parse(right.date) - Date.parse(left.date));

  const nextAccountBalancePaise = Math.round(currentAccount.balance * 100) - totalRemovedDelta;
  const nextAccounts = accounts.map(account => account.id === currentAccount.id
    ? { ...account, balance: nextAccountBalancePaise / 100 }
    : account);

  return { transactions: nextTransactions, accounts: nextAccounts };
}
