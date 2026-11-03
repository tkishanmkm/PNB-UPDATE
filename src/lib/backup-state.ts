import type { AccountDetails, AppState, CarouselBanner, ChatMessage, IconAssets, Payee, Transaction, TransferDetails } from '@/lib/types';

type RecordValue = Record<string, unknown>;

const isRecord = (value: unknown): value is RecordValue =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const textValue = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const finiteNumber = (value: unknown, label: string): number => {
  const parsed = typeof value === 'number'
    ? value
    : typeof value === 'string' && value.trim()
      ? Number(value)
      : Number.NaN;
  if (!Number.isFinite(parsed)) throw new Error(label + ' must be a valid number.');
  return parsed;
};

const optionalText = (value: unknown, label: string): string | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') throw new Error(label + ' must be text.');
  return value;
};

const normalizeBanners = (value: unknown, fallback: CarouselBanner[]): CarouselBanner[] => {
  if (value === undefined || value === null) return fallback;
  if (!Array.isArray(value)) throw new Error('Backup carousel banners must be an array.');
  return value.map((entry, index) => {
    if (!isRecord(entry) || typeof entry.src !== 'string' ||
        typeof entry.alt !== 'string' || typeof entry.hint !== 'string') {
      throw new Error('Carousel banner ' + (index + 1) + ' is invalid.');
    }
    return { src: entry.src, alt: entry.alt, hint: entry.hint };
  });
};

const normalizeIconAssets = (value: unknown, fallback: IconAssets): IconAssets => {
  if (value === undefined || value === null) return fallback;
  if (!isRecord(value)) throw new Error('Backup icon assets must be an object.');
  const result: Record<string, string> = {};
  for (const [key, asset] of Object.entries(value)) {
    if (typeof asset !== 'string') throw new Error('Icon asset ' + key + ' must be text.');
    result[key] = asset;
  }
  return result as IconAssets;
};

const normalizeAccount = (
  value: unknown,
  index: number,
  defaults: AppState,
): AccountDetails => {
  if (!isRecord(value)) throw new Error('Account ' + (index + 1) + ' is invalid.');
  const accountNumber = textValue(value.accountNumber).trim();
  if (!accountNumber || !/\d/.test(accountNumber)) {
    throw new Error('Account ' + (index + 1) + ' is missing an account number.');
  }
  if (value.type !== 'Savings' && value.type !== 'Current') {
    throw new Error('Account ' + (index + 1) + ' has an invalid account type.');
  }
  const balance = finiteNumber(value.balance, 'Account ' + (index + 1) + ' balance');
  const averageQuarterlyBalance = value.averageQuarterlyBalance === undefined ||
    value.averageQuarterlyBalance === null || value.averageQuarterlyBalance === ''
    ? undefined
    : finiteNumber(value.averageQuarterlyBalance, 'Account ' + (index + 1) + ' average quarterly balance');
  if (averageQuarterlyBalance !== undefined && averageQuarterlyBalance < 0) {
    throw new Error('Account ' + (index + 1) + ' average quarterly balance cannot be negative.');
  }

  const id = textValue(value.id).trim() || 'imported-account-' + (index + 1);
  const fallback = defaults.accounts[0];
  return {
    ...fallback,
    ...value,
    id,
    userId: textValue(value.userId, defaults.user.id),
    accountNumber,
    type: value.type,
    balance,
    currencySymbol: textValue(value.currencySymbol, defaults.settings.currencySymbol),
    accountHolder: textValue(value.accountHolder),
    customerAddress: textValue(value.customerAddress),
    customerCity: textValue(value.customerCity),
    customerPin: textValue(value.customerPin),
    branchName: textValue(value.branchName),
    branchAddress: textValue(value.branchAddress),
    branchCity: textValue(value.branchCity),
    branchPin: textValue(value.branchPin),
    ifsc: textValue(value.ifsc),
    micrCode: textValue(value.micrCode),
    customerId: textValue(value.customerId),
    ckycNumber: textValue(value.ckycNumber),
    nominee: textValue(value.nominee),
    averageQuarterlyBalance,
    upiId: optionalText(value.upiId, 'Account UPI ID'),
    status: value.status === 'Active' || value.status === 'Debit Freeze' ? value.status : undefined,
  };
};

const normalizeTransaction = (
  value: unknown,
  index: number,
  accountIds: Set<string>,
  fallbackAccountId: string,
): Transaction => {
  if (!isRecord(value)) throw new Error('Transaction ' + (index + 1) + ' is invalid.');
  const amount = finiteNumber(value.amount, 'Transaction ' + (index + 1) + ' amount');
  if (typeof value.date !== 'string' || !Number.isFinite(Date.parse(value.date))) {
    throw new Error('Transaction ' + (index + 1) + ' has an invalid date.');
  }
  if (typeof value.description !== 'string') {
    throw new Error('Transaction ' + (index + 1) + ' is missing its description.');
  }
  const type: Transaction['type'] = value.type === 'credit' || value.type === 'debit'
    ? value.type
    : amount < 0 ? 'debit' : 'credit';
  const balanceAfter = value.balanceAfter === undefined || value.balanceAfter === null
    ? undefined
    : finiteNumber(value.balanceAfter, 'Transaction ' + (index + 1) + ' running balance');
  const accountId = typeof value.accountId === 'string' && accountIds.has(value.accountId)
    ? value.accountId
    : fallbackAccountId;

  return {
    id: textValue(value.id).trim() || 'imported-transaction-' + (index + 1),
    accountId,
    date: new Date(value.date).toISOString(),
    description: value.description,
    amount: type === 'debit' ? -Math.abs(amount) : Math.abs(amount),
    type,
    ...(balanceAfter !== undefined ? { balanceAfter } : {}),
    ...(typeof value.category === 'string' ? { category: value.category } : {}),
    ...(typeof value.reference === 'string' ? { reference: value.reference } : {}),
    ...(typeof value.payee === 'string' ? { payee: value.payee } : {}),
    ...(typeof value.payeeId === 'string' ? { payeeId: value.payeeId } : {}),
    ...(typeof value.remarks === 'string' ? { remarks: value.remarks } : {}),
    ...(typeof value.instrumentId === 'string' ? { instrumentId: value.instrumentId } : {}),
  };
};

const normalizePayees = (value: unknown): Payee[] => {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new Error('Backup payees must be an array.');
  const payees = value.map((entry, index): Payee => {
    if (!isRecord(entry)) throw new Error('Payee ' + (index + 1) + ' is invalid.');
    const id = textValue(entry.id).trim();
    const name = textValue(entry.name).trim();
    const accountNumber = textValue(entry.accountNumber).trim();
    if (!id || !name || !accountNumber) throw new Error('Payee ' + (index + 1) + ' is missing an ID, name or account number.');
    return {
      id,
      name,
      accountNumber,
      bank: textValue(entry.bank),
      ifsc: textValue(entry.ifsc),
      ...(typeof entry.nickname === 'string' ? { nickname: entry.nickname } : {}),
      ...(typeof entry.avatar === 'string' ? { avatar: entry.avatar } : {}),
    };
  });
  if (new Set(payees.map(payee => payee.id)).size !== payees.length) {
    throw new Error('Backup contains duplicate payee IDs.');
  }
  return payees;
};

const normalizeChatHistory = (value: unknown): ChatMessage[] => {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new Error('Backup chat history must be an array.');
  const messages = value.map((entry, index): ChatMessage => {
    if (!isRecord(entry) || typeof entry.id !== 'string' ||
        !['user', 'agent', 'system'].includes(String(entry.sender)) ||
        typeof entry.content !== 'string' ||
        typeof entry.timestamp !== 'string' || !Number.isFinite(Date.parse(entry.timestamp))) {
      throw new Error('Chat message ' + (index + 1) + ' is invalid.');
    }
    return {
      id: entry.id,
      sender: entry.sender as ChatMessage['sender'],
      content: entry.content,
      timestamp: new Date(entry.timestamp).toISOString(),
      ...(typeof entry.avatarUrl === 'string' ? { avatarUrl: entry.avatarUrl } : {}),
    };
  });
  if (new Set(messages.map(message => message.id)).size !== messages.length) {
    throw new Error('Backup contains duplicate chat message IDs.');
  }
  return messages;
};

const normalizeTransfer = (value: unknown): TransferDetails => {
  if (value === undefined || value === null) return {};
  if (!isRecord(value)) throw new Error('Backup transfer details are invalid.');
  const amount = value.amount === undefined ? undefined : finiteNumber(value.amount, 'Pending transfer amount');
  if (amount !== undefined && amount < 0) throw new Error('Pending transfer amount cannot be negative.');
  const transferMode = value.transferMode === 'imps' || value.transferMode === 'neft' || value.transferMode === 'rtgs'
    ? value.transferMode
    : undefined;
  return {
    ...(typeof value.payeeId === 'string' ? { payeeId: value.payeeId } : {}),
    ...(amount !== undefined ? { amount } : {}),
    ...(typeof value.remarks === 'string' ? { remarks: value.remarks } : {}),
    ...(typeof value.transferId === 'string' ? { transferId: value.transferId } : {}),
    ...(transferMode ? { transferMode } : {}),
  };
};

export function normalizeAppBackup(
  value: unknown,
  defaults: AppState,
  currentCredentials?: { mpin?: string; tpin?: string },
): AppState {
  if (!isRecord(value)) throw new Error('Invalid JSON backup structure.');
  if (!isRecord(value.user)) throw new Error('JSON backup is missing user details.');
  if (!Array.isArray(value.accounts) || value.accounts.length === 0) {
    throw new Error('JSON backup must contain at least one account.');
  }
  if (!Array.isArray(value.transactions)) throw new Error('JSON backup must contain a transactions array.');

  const accounts = value.accounts.map((account, index) => normalizeAccount(account, index, defaults));
  const accountIds = new Set(accounts.map(account => account.id));
  const accountNumbers = new Set(accounts.map(account => account.accountNumber.replace(/\D/g, '')));
  if (accountIds.size !== accounts.length) throw new Error('JSON backup contains duplicate account IDs.');
  if (accountNumbers.size !== accounts.length) throw new Error('JSON backup contains duplicate account numbers.');

  const transactions = value.transactions.map((transaction, index) =>
    normalizeTransaction(transaction, index, accountIds, accounts[0].id),
  );
  if (new Set(transactions.map(transaction => transaction.id)).size !== transactions.length) {
    throw new Error('JSON backup contains duplicate transaction IDs.');
  }

  const rawUser = value.user;
  const currentMpin = typeof currentCredentials?.mpin === 'string' && /^\d{4}$/.test(currentCredentials.mpin)
    ? currentCredentials.mpin
    : defaults.user.mpin;
  const currentTpin = typeof currentCredentials?.tpin === 'string' && /^\d{4}$/.test(currentCredentials.tpin)
    ? currentCredentials.tpin
    : defaults.user.tpin;
  const user = {
    ...defaults.user,
    ...rawUser,
    id: textValue(rawUser.id, defaults.user.id),
    name: textValue(rawUser.name, defaults.user.name),
    email: textValue(rawUser.email, defaults.user.email),
    mobileNumber: textValue(rawUser.mobileNumber, defaults.user.mobileNumber),
    avatar: textValue(rawUser.avatar, defaults.user.avatar),
    mpin: typeof rawUser.mpin === 'string' && /^\d{4}$/.test(rawUser.mpin) ? rawUser.mpin : currentMpin,
    tpin: typeof rawUser.tpin === 'string' && /^\d{4}$/.test(rawUser.tpin) ? rawUser.tpin : currentTpin,
    accounts,
  };

  const rawSettings = value.settings === undefined || value.settings === null ? {} : value.settings;
  if (!isRecord(rawSettings)) throw new Error('Backup settings must be an object.');
  const carouselValue = rawSettings.carouselBanners ?? value.carouselBanners;
  const settings = {
    ...defaults.settings,
    ...rawSettings,
    appLogo: textValue(rawSettings.appLogo, defaults.settings.appLogo),
    loginHelpAvatar: textValue(rawSettings.loginHelpAvatar, defaults.settings.loginHelpAvatar),
    otpAvatar: textValue(rawSettings.otpAvatar, defaults.settings.otpAvatar),
    agentAvatar: textValue(rawSettings.agentAvatar, defaults.settings.agentAvatar),
    pdfBanner: textValue(rawSettings.pdfBanner, defaults.settings.pdfBanner),
    pnbOneLogo: textValue(rawSettings.pnbOneLogo, defaults.settings.pnbOneLogo),
    pnbBanner: textValue(rawSettings.pnbBanner, defaults.settings.pnbBanner),
    currencySymbol: textValue(rawSettings.currencySymbol, defaults.settings.currencySymbol),
    iconAssets: normalizeIconAssets(rawSettings.iconAssets, defaults.settings.iconAssets || {}),
    carouselBanners: normalizeBanners(carouselValue, defaults.settings.carouselBanners),
    ...(typeof rawSettings.pdfPassword === 'string' ? { pdfPassword: rawSettings.pdfPassword } : {}),
    ...(typeof rawSettings.loginPassword === 'string' ? { loginPassword: rawSettings.loginPassword } : {}),
    agentEnglishStyle: rawSettings.agentEnglishStyle === '1' || rawSettings.agentEnglishStyle === '2' || rawSettings.agentEnglishStyle === '3'
      ? rawSettings.agentEnglishStyle
      : defaults.settings.agentEnglishStyle,
  };

  return {
    ...defaults,
    ...value,
    isAuthenticated: false,
    isStateInitialized: true,
    loginPending: false,
    isLoggingOut: false,
    user,
    accounts,
    transactions,
    payees: normalizePayees(value.payees),
    chatHistory: normalizeChatHistory(value.chatHistory),
    currentTransfer: normalizeTransfer(value.currentTransfer),
    settings,
    showSplash: typeof value.showSplash === 'boolean' ? value.showSplash : defaults.showSplash,
  };
}
