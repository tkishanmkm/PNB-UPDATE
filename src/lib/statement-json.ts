import type { Transaction } from '@/lib/types';

export interface StatementDetailsForJson {
  accountNumber: string | null;
  accountHolder: string;
  customerAddress: string;
  customerCity: string;
  customerPin: string;
  branchName: string;
  branchAddress: string;
  branchCity: string;
  branchPin: string;
  ifsc: string;
  micrCode: string;
  customerId: string;
  ckycNumber: string;
  nominee: string;
  accountType: 'Savings' | 'Current';
  closingBalance: number | null;
}

export interface StatementJsonPreview {
  accountNumber: string;
  accountId: string | null;
  canSave: boolean;
  statementDetails: StatementDetailsForJson | null;
  transactions: Transaction[];
}

const normalizeAccountNumber = (value: string): string => value.replace(/\D/g, '');

const optionalText = (value: unknown): string => typeof value === 'string' ? value : '';

export function createStatementJsonExport(
  accountNumber: string | null,
  statementDetails: StatementDetailsForJson | null,
  transactions: Transaction[],
  timestamp = new Date().toISOString(),
) {
  return {
    schemaVersion: 2,
    accountNumber,
    statementDetails,
    transactions,
    timestamp,
  };
}

export function normalizeStatementJson(
  value: unknown,
  findMatchingAccountId: (normalizedAccountNumber: string) => string | null,
): StatementJsonPreview {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid statement JSON object.');
  const data = value as Record<string, unknown>;
  if (!Array.isArray(data.transactions)) throw new Error('Statement JSON must contain a transactions array.');
  if (data.schemaVersion !== undefined && ![1, 2].includes(Number(data.schemaVersion))) {
    throw new Error('Unsupported statement JSON version.');
  }

  const rawAccountNumber = typeof data.accountNumber === 'string' ? data.accountNumber : '';
  const accountNumber = normalizeAccountNumber(rawAccountNumber);
  // A missing account number is still safe to preview/export, but cannot be saved.
  const accountId = accountNumber ? findMatchingAccountId(accountNumber) : null;

  let statementDetails: StatementDetailsForJson | null = null;
  if (data.statementDetails && typeof data.statementDetails === 'object' && !Array.isArray(data.statementDetails)) {
    const rawDetails = data.statementDetails as Record<string, unknown>;
    const closingBalance = rawDetails.closingBalance === null || rawDetails.closingBalance === undefined || rawDetails.closingBalance === ''
      ? null
      : Number(rawDetails.closingBalance);
    if (closingBalance !== null && !Number.isFinite(closingBalance)) {
      throw new Error('Statement details contain an invalid closing balance.');
    }
    statementDetails = {
      accountNumber,
      accountHolder: optionalText(rawDetails.accountHolder),
      customerAddress: optionalText(rawDetails.customerAddress),
      customerCity: optionalText(rawDetails.customerCity),
      customerPin: optionalText(rawDetails.customerPin),
      branchName: optionalText(rawDetails.branchName),
      branchAddress: optionalText(rawDetails.branchAddress),
      branchCity: optionalText(rawDetails.branchCity),
      branchPin: optionalText(rawDetails.branchPin),
      ifsc: optionalText(rawDetails.ifsc),
      micrCode: optionalText(rawDetails.micrCode),
      customerId: optionalText(rawDetails.customerId),
      ckycNumber: optionalText(rawDetails.ckycNumber),
      nominee: optionalText(rawDetails.nominee),
      accountType: rawDetails.accountType === 'Current' ? 'Current' : 'Savings',
      closingBalance,
    };
  }

  const transactions = data.transactions.map((entry: unknown, index: number): Transaction => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new Error('Invalid transaction ' + (index + 1) + '.');
    }
    const item = entry as Record<string, unknown>;
    const amount = typeof item.amount === 'number'
      ? item.amount
      : typeof item.amount === 'string' && item.amount.trim()
        ? Number(item.amount)
        : Number.NaN;
    if (typeof item.date !== 'string' || !Number.isFinite(Date.parse(item.date)) ||
        typeof item.description !== 'string' || !item.description.trim() || !Number.isFinite(amount)) {
      throw new Error('Invalid transaction ' + (index + 1) + '.');
    }
    if (item.balanceAfter !== undefined &&
        (typeof item.balanceAfter !== 'number' || !Number.isFinite(item.balanceAfter))) {
      throw new Error('Transaction ' + (index + 1) + ' has an invalid running balance.');
    }

    const type: Transaction['type'] = item.type === 'credit' || item.type === 'debit'
      ? item.type
      : amount < 0 ? 'debit' : 'credit';
    const id = typeof item.id === 'string' && item.id.trim()
      ? item.id.trim()
      : 'imported-pdf-' + (index + 1);

    return {
      id,
      accountId: accountId || 'unmatched',
      date: item.date,
      description: item.description.trim(),
      amount: type === 'debit' ? -Math.abs(amount) : Math.abs(amount),
      type,
      ...(typeof item.balanceAfter === 'number' ? { balanceAfter: item.balanceAfter } : {}),
      ...(typeof item.category === 'string' ? { category: item.category } : {}),
      ...(typeof item.reference === 'string' ? { reference: item.reference } : {}),
      ...(typeof item.payee === 'string' ? { payee: item.payee } : {}),
      ...(typeof item.payeeId === 'string' ? { payeeId: item.payeeId } : {}),
      ...(typeof item.remarks === 'string' ? { remarks: item.remarks } : {}),
      ...(typeof item.instrumentId === 'string' ? { instrumentId: item.instrumentId } : {}),
    };
  });

  const uniqueIds = new Set(transactions.map(transaction => transaction.id));
  if (uniqueIds.size !== transactions.length) throw new Error('Statement JSON contains duplicate transaction IDs.');

  return {
    accountNumber,
    accountId,
    // Replace App Data can create a new account when the statement identifies it.
    canSave: Boolean(accountNumber),
    statementDetails,
    transactions,
  };
}
