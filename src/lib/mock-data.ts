
import type { AppState } from './types';

// Helper to generate random 4-digit strings for PINs
const generateRandomPin = () => Math.floor(1000 + Math.random() * 9000).toString();

// --- Configuration ---
const TRANSACTION_COUNT = 50;
const INITIAL_BALANCE = 50000;

// --- Data Generators ---
const payeesForGeneration = [
    { name: 'Zomato Food Delivery', category: 'Food' },
    { name: 'Netflix Subscription', category: 'Entertainment' },
    { name: 'BigBasket Groceries', category: 'Groceries' },
    { name: 'BSES Electricity Bill', category: 'Utilities' },
    { name: 'Amazon Shopping', category: 'Shopping' },
    { name: 'Uber Ride', category: 'Transport' },
    { name: 'Jane Smith', category: 'Transfer', payeeId: 'payee1' },
    { name: 'Bob Johnson', category: 'Transfer', payeeId: 'payee2' },
    { name: 'Alice Williams', category: 'Transfer', payeeId: 'payee3' },
];

const generateRandomDate = (start: Date, end: Date): Date => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateTransactions = (count: number): { transactions: AppState['transactions'], finalBalance: number } => {
    const transactions: AppState['transactions'] = [];
    let currentBalance = INITIAL_BALANCE;
    const endDate = new Date();
    const startDate = new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate());

    for (let i = 0; i < count; i++) {
        const isCredit = Math.random() < 0.1;
        const randomPayeeInfo = payeesForGeneration[Math.floor(Math.random() * payeesForGeneration.length)];
        const transactionDate = generateRandomDate(startDate, endDate);

        let amount, description, type, category, reference;

        if (isCredit) {
            type = 'credit' as const;
            if (Math.random() > 0.5) {
                amount = Math.floor(Math.random() * 40000) + 35000;
                description = `Salary Credit - Acme Corp`;
                category = 'Salary';
                reference = `NEFT/ACME/${transactionDate.toLocaleString('default', { month: 'short' }).toUpperCase()}${transactionDate.getFullYear()}`;
            } else {
                amount = Math.floor(Math.random() * 1000) + 100;
                description = `Fund Transfer from relative`;
                category = 'Transfer';
                reference = `IMPS/RELATIVE/${Date.now() + i}`;
            }
        } else {
            type = 'debit' as const;
            amount = -(Math.floor(Math.random() * 5000) + 50);
            description = `${randomPayeeInfo.name}`;
            category = randomPayeeInfo.category;
            reference = `UPI/CRD/${Date.now() + i}`;
        }
        
        currentBalance += amount;

        transactions.push({
            id: `txn-${Date.now()}-${i}`,
            accountId: 'acc-001',
            date: transactionDate.toISOString(),
            description,
            amount,
            type,
            category,
            reference,
            payee: randomPayeeInfo.name,
            payeeId: randomPayeeInfo.payeeId,
            remarks: `Transaction ${i + 1}`
        });
    }

    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return { transactions, finalBalance: currentBalance };
};

const { transactions, finalBalance } = generateTransactions(TRANSACTION_COUNT);

export const defaultState: AppState = {
  isAuthenticated: false,
  isStateInitialized: false,
  loginPending: false,
  user: {
    id: 'CUST' + Math.floor(10000 + Math.random() * 90000),
    name: 'Rahul Yadav',
    email: 'rahul.y@example.com',
    mobileNumber: '9876543210',
    mpin: generateRandomPin(), // Randomized MPIN
    tpin: '4278', // User explicitly asked for this to be 4278 previously
    avatar: '',
    dob: '01-01-1990',
  },
  accounts: [
    {
      id: 'acc-001',
      userId: 'CUST56789',
      accountNumber: '1584001700102133',
      type: 'Savings',
      balance: finalBalance,
      currencySymbol: '₹',
      accountHolder: 'Rahul Yadav',
      customerAddress: 'A-123, Rose Apartments, Sector 18',
      customerCity: 'Noida',
      customerPin: '201301',
      branchName: 'Noida Sector 18 Branch',
      branchAddress: 'Ground Floor, Plot 14, Sector 18',
      branchCity: 'Noida',
      branchPin: '201301',
      ifsc: 'PUNB0158400',
      ckycNumber: '60023732987903',
      nominee: 'Priya Yadav',
      averageQuarterlyBalance: 479.78,
      upiId: 'rahul.y@pnb',
      status: 'Active',
    },
  ],
  activeAccountId: 'acc-001',
  transactions,
  payees: [
    { id: 'payee1', name: 'Jane Smith', accountNumber: '50100123456789', bank: 'HDFC Bank', ifsc: 'HDFC0001234', nickname: 'Jane' },
    { id: 'payee2', name: 'Bob Johnson', accountNumber: '001201543210', bank: 'ICICI Bank', ifsc: 'ICIC0005678', nickname: 'Landlord' },
    { id: 'payee3', name: 'Alice Williams', accountNumber: '9876543210987', bank: 'Axis Bank', ifsc: 'AXIS0009876', nickname: 'Alice' },
  ],
  chatHistory: [
    { id: 'msg1', sender: 'system', content: 'Local PNB ONE support chat started.', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
  ],
  currentTransfer: {},
  settings: {
    appLogo: '/pnb-splash/pnb-logo.png',
    loginHelpAvatar: '',
    otpAvatar: '',
    agentAvatar: '',
    pdfBanner: '',
    currencySymbol: '₹',
    iconAssets: {},
    pnbOneLogo: '/pnb-splash/pnb-one-mark.png',
    pnbBanner: '/pnb-splash/punjab-national-bank.png',
    carouselBanners: []
  }
};
