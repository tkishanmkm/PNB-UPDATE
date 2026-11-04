import type { Transaction } from '@/lib/types';

const canonicalTransaction = (transaction: Transaction, includeId = true): string =>
  JSON.stringify(
    Object.fromEntries(
      Object.entries(transaction)
        .filter(([key]) => includeId || key !== 'id')
        .sort(([left], [right]) => left.localeCompare(right)),
    ),
  );

/**
 * Stable statement IDs are derived from account and transaction content rather
 * than a random import timestamp. A repeated, identical row gets an occurrence
 * suffix so repeated same-day transactions are not collapsed.
 */
export function createStatementTransactionId(
  accountNumber: string,
  transaction: Pick<Transaction, 'date' | 'description' | 'amount' | 'type' | 'reference' | 'instrumentId' | 'remarks'>,
  occurrence = 1,
): string {
  const source = [
    accountNumber.replace(/\D/g, ''),
    transaction.date,
    transaction.type,
    Math.round(Math.abs(transaction.amount) * 100),
    transaction.description.trim(),
    transaction.reference || '',
    transaction.instrumentId || '',
    transaction.remarks || '',
    occurrence,
  ].join('|');
  let first = 0x811c9dc5;
  let second = 0x9e3779b9;
  for (let index = 0; index < source.length; index++) {
    const code = source.charCodeAt(index);
    first = Math.imul(first ^ code, 0x01000193);
    second = Math.imul(second ^ code, 0x85ebca6b);
  }
  const hash = (value: number) => (value >>> 0).toString(16).padStart(8, '0');
  return `stmt-${hash(first)}${hash(second)}`;
}

export interface TransactionSavePlan {
  added: Transaction[];
  skipped: number;
}

/**
 * Validate a statement append as one atomic operation. A stable transaction ID
 * is idempotent only when the complete record is identical; conflicting reuse
 * of an ID aborts the operation instead of silently overwriting ledger data.
 */
export function planStatementAppend(
  existing: Transaction[],
  incoming: Transaction[],
  accountId: string,
): TransactionSavePlan {
  if (!accountId) throw new Error('Select a saved account before saving transactions.');
  const existingById = new Map<string, Transaction>();
  const existingByContent = new Map<string, number>();
  for (const transaction of existing) {
    if (!transaction.id) throw new Error('The saved ledger contains a transaction without an ID.');
    if (existingById.has(transaction.id)) {
      throw new Error('The saved ledger contains duplicate transaction IDs. Resolve these before importing.');
    }
    existingById.set(transaction.id, transaction);
    const contentKey = canonicalTransaction(transaction, false);
    existingByContent.set(contentKey, (existingByContent.get(contentKey) || 0) + 1);
  }

  const incomingById = new Map<string, Transaction>();
  for (const transaction of incoming) {
    if (!transaction.id || !transaction.id.trim()) {
      throw new Error('Every imported transaction must have a stable ID.');
    }
    if (transaction.accountId !== accountId) {
      throw new Error('The imported statement contains a transaction linked to a different account.');
    }
    if (!Number.isFinite(Date.parse(transaction.date)) ||
        !Number.isFinite(transaction.amount) ||
        !transaction.description.trim()) {
      throw new Error('The imported statement contains an invalid transaction.');
    }

    const duplicateInImport = incomingById.get(transaction.id);
    if (duplicateInImport) {
      if (canonicalTransaction(duplicateInImport) !== canonicalTransaction(transaction)) {
        throw new Error('The statement reuses a transaction ID with different data. Nothing was saved.');
      }
      continue;
    }
    incomingById.set(transaction.id, transaction);

    const duplicateInLedger = existingById.get(transaction.id);
    if (duplicateInLedger &&
        canonicalTransaction(duplicateInLedger) !== canonicalTransaction(transaction)) {
      throw new Error('A transaction ID already exists with different data. Nothing was saved.');
    }
  }

  const added: Transaction[] = [];
  let skipped = 0;
  for (const transaction of incomingById.values()) {
    // An exact ID match consumes one matching legacy-content occurrence too;
    // otherwise a second identical payment could be incorrectly skipped.
    const contentKey = canonicalTransaction(transaction, false);
    const existingOccurrences = existingByContent.get(contentKey) || 0;

    if (existingById.has(transaction.id)) {
      if (existingOccurrences > 0) {
        existingByContent.set(contentKey, existingOccurrences - 1);
      }
      skipped++;
      continue;
    }

    // An older import may have used a different generated row ID. Match the
    // exact statement content as a multiset so repeated identical payments
    // remain distinct while already-saved identical rows are not re-added.
    if (existingOccurrences > 0) {
      existingByContent.set(contentKey, existingOccurrences - 1);
      skipped++;
      continue;
    }
    added.push(transaction);
  }
  return { added, skipped };
}

/** Validate transaction replacement for one account without touching others. */
export function validateStatementReplacement(
  transactions: Transaction[],
  accountId: string,
): Transaction[] {
  if (!accountId) throw new Error('A saved account is required for transaction-only replacement.');
  const ids = new Set<string>();
  return transactions.map(transaction => {
    if (!transaction.id || ids.has(transaction.id)) {
      throw new Error('The statement contains a missing or duplicate transaction ID.');
    }
    if (transaction.accountId !== accountId) {
      throw new Error('The imported statement contains a transaction linked to a different account.');
    }
    if (!Number.isFinite(Date.parse(transaction.date)) ||
        !Number.isFinite(transaction.amount) ||
        !transaction.description.trim()) {
      throw new Error('The imported statement contains an invalid transaction.');
    }
    ids.add(transaction.id);
    return transaction;
  });
}
