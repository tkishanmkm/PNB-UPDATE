import type { AccountDetails, Payee, Transaction } from '@/lib/types';

export interface LocalSupportContext {
  customerName: string;
  account?: AccountDetails;
  transactions: Transaction[];
  payees: Payee[];
  englishStyle?: '1' | '2' | '3';
}

export interface LocalSupportReply {
  response: string;
  endChat: boolean;
}

const formatRupees = (value: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));

const formatDate = (value: string): string => {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
    : value;
};

const normalize = (value: string): string =>
  value.toLocaleLowerCase('en-IN').replace(/\s+/g, ' ').trim();

const findAmount = (message: string): number | undefined => {
  const match = message.match(/(?:₹|rs\.?\s*)?([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i);
  if (!match) return undefined;
  const amount = Number(match[1].replace(/,/g, ''));
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount * 100) / 100 : undefined;
};

const isEnding = (message: string): boolean =>
  /^(?:bye|goodbye|thanks bye|thank you bye|that's all|that is all|no more help|close chat)$/i.test(message.trim());

const transactionSummary = (transactions: Transaction[]): string =>
  transactions.slice(0, 5).map((transaction, index) => {
    const direction = transaction.type === 'debit' ? 'Debit' : 'Credit';
    const description = transaction.description || transaction.payee || 'Transaction';
    const reference = transaction.reference ? ` (Ref: ${transaction.reference})` : '';
    return `${index + 1}. ${formatDate(transaction.date)} — ${direction} ${formatRupees(transaction.amount)} — ${description}${reference}`;
  }).join('\n');

const stylePrefix = (style: LocalSupportContext['englishStyle']): string => {
  if (style === '2') return 'Thank you for contacting PNB ONE local support.';
  if (style === '3') return 'Thank you for contacting the PNB ONE local support assistant. I can help you review information saved in this browser.';
  return 'Thanks for reaching out to PNB ONE support.';
};

/**
 * Deterministic, browser-local support responses. No model, API, server, or
 * banking endpoint is used. Only the already-open local app state is read.
 */
export function respondToLocalSupport(
  rawMessage: string,
  context: LocalSupportContext,
): LocalSupportReply {
  const message = normalize(rawMessage);
  const prefix = stylePrefix(context.englishStyle);

  if (isEnding(message)) {
    return {
      response: 'Thank you for using this local PNB ONE workspace. This chat is now closed.',
      endChat: true,
    };
  }

  if (/\b(?:otp|mpin|tpin|password|pin)\b/.test(message) && /(?:share|send|tell|give|verify|confirm)/.test(message)) {
    return {
      response: 'For your safety, never share an MPIN, TPIN, OTP, password, or full account number in chat. This local assistant will not ask you for those credentials.',
      endChat: false,
    };
  }

  if (/\b(?:real bank|actual bank|live banking|bank server|pnb server|send real money|real transfer|live balance)\b/.test(message)) {
    return {
      response: 'This PNB ONE reconstruction is an offline, browser-local data manager. It is not connected to PNB systems and cannot fetch live balances, authenticate with the bank, submit payments, or move real money.',
      endChat: false,
    };
  }

  if (/\b(?:balance|available amount|closing balance)\b/.test(message)) {
    if (!context.account) {
      return { response: 'No account is selected in the local workspace yet. Add or import an account in Settings before reviewing a saved balance.', endChat: false };
    }
    return {
      response: `The balance currently saved for account ending ${context.account.accountNumber.replace(/\D/g, '').slice(-4)} is ${formatRupees(context.account.balance)}. This is the value stored in this browser; it is not a live bank balance.`,
      endChat: false,
    };
  }

  if (/\b(?:transaction|debit|credit|payment|statement entry|upi entry)\b/.test(message)) {
    let matches = context.transactions;
    const amount = findAmount(rawMessage);
    if (amount !== undefined) {
      matches = matches.filter(transaction => Math.round(Math.abs(transaction.amount) * 100) === Math.round(amount * 100));
    }
    const dateMatch = rawMessage.match(/\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/);
    if (dateMatch) {
      const [day, month, year] = dateMatch[1].split(/[/-]/);
      const fullYear = year.length === 2 ? `20${year}` : year;
      const target = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      matches = matches.filter(transaction => transaction.date.slice(0, 10) === target);
    }
    const tokens = message.split(/[^a-z0-9]+/).filter(token =>
      token.length > 2 && !['transaction', 'transactions', 'debit', 'credit', 'payment', 'statement', 'entry', 'show', 'find', 'details', 'please', 'about', 'from', 'with', 'that', 'this'].includes(token),
    );
    if (tokens.length) {
      matches = matches.filter(transaction => {
        const searchable = normalize([
          transaction.description,
          transaction.payee || '',
          transaction.reference || '',
          transaction.category || '',
          transaction.remarks || '',
        ].join(' '));
        return tokens.some(token => searchable.includes(token));
      });
    }
    if (!matches.length) {
      return { response: 'I could not find a saved transaction matching those details. Try a date, amount, payee, or a word from the transaction description.', endChat: false };
    }
    return {
      response: `I found ${matches.length} matching local transaction${matches.length === 1 ? '' : 's'}:\n${transactionSummary(matches)}${matches.length > 5 ? '\nOnly the first five matches are shown.' : ''}\nThese entries came from the data stored in this browser.`,
      endChat: false,
    };
  }

  if (/\b(?:payee|beneficiary|recipient)\b/.test(message)) {
    const tokens = message.split(/[^a-z0-9]+/).filter(token =>
      token.length > 2 && !['payee', 'payees', 'beneficiary', 'beneficiaries', 'recipient', 'recipients', 'show', 'find', 'list', 'details', 'please', 'my', 'saved'].includes(token),
    );
    const matched = context.payees.filter(payee => {
      if (!tokens.length) return true;
      const searchable = normalize(`${payee.name} ${payee.nickname || ''} ${payee.bank}`);
      return tokens.some(token => searchable.includes(token));
    });
    if (!matched.length) {
      return { response: 'No saved payee matched that search. You can review the payee list in Settings. This workspace stores payee details locally only.', endChat: false };
    }
    return {
      response: `Saved payees in this browser:\n${matched.slice(0, 8).map(payee =>
        `• ${payee.name} — ${payee.bank || 'Bank not set'} — account ending ${payee.accountNumber.replace(/\D/g, '').slice(-4)}`,
      ).join('\n')}\nFull account numbers are not displayed in chat.`,
      endChat: false,
    };
  }

  if (/\b(?:pdf|statement|import|extract)\b/.test(message)) {
    return {
      response: 'You can open Settings → PDF Import to extract text from a digital statement PDF locally in this browser. The parser does not use AI or OCR; scanned/image-only PDFs are reported as unsupported. Review the preview before choosing Replace App Data, Replace Transactions Only, or Save Transactions.',
      endChat: false,
    };
  }

  if (/\b(?:backup|restore|json|export)\b/.test(message)) {
    return {
      response: 'Open Settings → Data to export or restore a JSON application backup. Customer and transaction data stay in this browser; authentication credentials are excluded from exported backup files and the app requires a fresh login after restoration. Keep your backup file private.',
      endChat: false,
    };
  }

  if (/\b(?:transfer|neft|imps|rtgs|upi|scan and pay|scan & pay)\b/.test(message)) {
    return {
      response: 'The transfer screens in this reconstruction are local demonstrations only. They can update the locally saved ledger for testing, but they do not contact PNB, UPI, NPCI, or another bank and cannot send real funds.',
      endChat: false,
    };
  }

  if (/\b(?:help|support|services|what can you do|how can you help|hello|hi|hii|hey)\b/.test(message)) {
    return {
      response: `${prefix} I can help you review the locally saved balance, search transactions, find saved payees, and explain PDF statement import or JSON backup. I cannot access bank systems or perform real banking operations. Please do not share your PINs, OTPs, passwords, or full account number here.`,
      endChat: false,
    };
  }

  return {
    response: 'I can answer questions about information saved in this browser, including balances, transactions, payees, statement import, and JSON backups. I cannot retrieve live bank information or perform real banking transactions.',
    endChat: false,
  };
}
