import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { AppState, AccountDetails } from './types';
import { normalizeAppBackup } from './backup-state';

const account = (overrides: Partial<AccountDetails> = {}): AccountDetails => ({
  id: 'account-a',
  userId: 'user-a',
  accountNumber: '123456789012',
  type: 'Savings',
  balance: 1000,
  currencySymbol: '₹',
  accountHolder: 'Example Customer',
  customerAddress: '12 Example Road',
  customerCity: 'Kota',
  customerPin: '324001',
  branchName: 'Main Branch',
  branchAddress: 'Bank Street',
  branchCity: 'Kota',
  branchPin: '324001',
  ifsc: 'PUNB0001234',
  ckycNumber: 'CKYC123',
  nominee: 'Nominee',
  ...overrides,
});

const defaults = {
  isAuthenticated: false,
  isStateInitialized: false,
  loginPending: false,
  user: {
    id: 'default-user', name: 'Default User', email: 'default@example.com',
    mobileNumber: '9000000000', mpin: '1111', tpin: '2222', avatar: '/avatar.png',
  },
  accounts: [account()],
  transactions: [],
  payees: [],
  chatHistory: [],
  currentTransfer: {},
  settings: {
    appLogo: '/logo.png', loginHelpAvatar: '/help.png', otpAvatar: '/otp.png',
    agentAvatar: '/agent.png', pdfBanner: '/banner.png', currencySymbol: '₹',
    iconAssets: {}, pnbOneLogo: '/pnb-logo.png', pnbBanner: '/pnb-banner.png',
    carouselBanners: [{ src: '/banner.png', alt: 'Default', hint: 'Default banner' }],
  },
} as unknown as AppState;

const validBackup = () => ({
  user: {
    id: 'restored-user', name: 'Restored User', email: 'restored@example.com',
    mobileNumber: '9876543210', mpin: '3456', tpin: '7890', avatar: '/restored.png',
  },
  accounts: [account({ balance: 2250.75, averageQuarterlyBalance: undefined })],
  transactions: [{
    id: 'txn-1', accountId: 'account-a', date: '2026-11-02T10:00:00.000Z',
    description: 'UPI Grocery', amount: -250.5, type: 'debit', balanceAfter: 2250.75,
  }],
  payees: [{ id: 'payee-1', name: 'Payee', accountNumber: '12340000', bank: 'Bank', ifsc: 'BANK0000001' }],
  chatHistory: [{ id: 'msg-1', sender: 'user', content: 'Hello', timestamp: '2026-11-02T10:00:00.000Z' }],
  settings: {
    appLogo: '/custom-logo.png',
    pdfBanner: '/custom-pdf-banner.png',
    currencySymbol: '₹',
    iconAssets: { fundTransfer: 'data:image/png;base64,iVBORw0KGgo=' },
    carouselBanners: [{ src: '/custom-banner.png', alt: 'Custom', hint: 'Custom campaign' }],
  },
  isAuthenticated: true,
  loginPending: true,
  isLoggingOut: true,
});

describe('full app backup normalization', () => {
  it('restores balances, transaction anchors, payees, chat and visual assets while forcing a fresh login', () => {
    const result = normalizeAppBackup(validBackup(), defaults);
    assert.equal(result.accounts[0].balance, 2250.75);
    assert.equal(result.transactions[0].balanceAfter, 2250.75);
    assert.equal(result.user.name, 'Restored User');
    assert.equal(result.payees.length, 1);
    assert.equal(result.chatHistory.length, 1);
    assert.equal(result.settings.appLogo, '/custom-logo.png');
    assert.equal(result.settings.carouselBanners[0].src, '/custom-banner.png');
    assert.equal(result.settings.iconAssets?.fundTransfer, 'data:image/png;base64,iVBORw0KGgo=');
    assert.equal(result.isAuthenticated, false);
    assert.equal(result.loginPending, false);
    assert.equal(result.isLoggingOut, false);
    assert.equal(result.isStateInitialized, true);
  });

  it('preserves current device PINs when the imported backup has invalid PIN values', () => {
    const backup = validBackup();
    backup.user.mpin = 'bad';
    backup.user.tpin = 'also-bad';
    const result = normalizeAppBackup(backup, defaults, { mpin: '4567', tpin: '7654' });
    assert.equal(result.user.mpin, '4567');
    assert.equal(result.user.tpin, '7654');
  });

  it('rejects malformed account balances and negative manual quarterly overrides', () => {
    const backup = validBackup();
    backup.accounts[0].balance = 'not-a-number' as unknown as number;
    assert.throws(() => normalizeAppBackup(backup, defaults), /balance must be a valid number/);

    const second = validBackup();
    second.accounts[0].averageQuarterlyBalance = -1;
    assert.throws(() => normalizeAppBackup(second, defaults), /average quarterly balance cannot be negative/);
  });

  it('rejects duplicate account numbers and duplicate transaction IDs', () => {
    const duplicateAccounts = validBackup();
    duplicateAccounts.accounts.push(account({ id: 'account-b', userId: 'user-a' }));
    assert.throws(() => normalizeAppBackup(duplicateAccounts, defaults), /duplicate account numbers/);

    const duplicateTransactions = validBackup();
    duplicateTransactions.transactions.push({ ...duplicateTransactions.transactions[0] });
    assert.throws(() => normalizeAppBackup(duplicateTransactions, defaults), /duplicate transaction IDs/);
  });

  it('rejects invalid transaction balance anchors and malformed payees before restoration', () => {
    const invalidAnchor = validBackup();
    invalidAnchor.transactions[0].balanceAfter = 'bad' as unknown as number;
    assert.throws(() => normalizeAppBackup(invalidAnchor, defaults), /running balance must be a valid number/);

    const invalidPayee = validBackup();
    invalidPayee.payees = [{ id: 'payee-1', name: '', accountNumber: '1234', bank: 'Bank', ifsc: 'BANK' }];
    assert.throws(() => normalizeAppBackup(invalidPayee, defaults), /missing an ID, name or account number/);
  });

  it('rejects duplicate chat IDs and malformed carousel assets', () => {
    const duplicateChat = validBackup();
    duplicateChat.chatHistory.push({ ...duplicateChat.chatHistory[0] });
    assert.throws(() => normalizeAppBackup(duplicateChat, defaults), /duplicate chat message IDs/);

    const invalidBanners = validBackup();
    invalidBanners.settings.carouselBanners = [{ src: '/banner.png' }] as unknown as typeof invalidBanners.settings.carouselBanners;
    assert.throws(() => normalizeAppBackup(invalidBanners, defaults), /Carousel banner 1 is invalid/);
  });

  it('normalizes account and transaction links to a valid imported account', () => {
    const backup = validBackup();
    backup.transactions[0].accountId = 'unknown-account';
    const result = normalizeAppBackup(backup, defaults);
    assert.equal(result.transactions[0].accountId, result.accounts[0].id);
  });
});
