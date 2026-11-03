"use client";

import React, { createContext, useReducer, useContext, useEffect } from 'react';
import type { AppState, Action, Transaction } from '@/lib/types';
import { defaultState } from '@/lib/mock-data';
import { getStateFromIndexedDB, saveStateToIndexedDB, clearStateFromIndexedDB } from '@/lib/indexeddb';
import { reconcileTransactionRemoval, reconcileTransactionUpdate } from '@/lib/transaction-ledger';
import { resolveAccountId, resolveStatementAccountId } from '@/lib/accounts';
import { sortTransactionsNewestFirst } from '@/lib/transaction-order';

// Define a new context shape to include appData and setAppData
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);


const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'INITIALIZE_STATE': {
      const activeAccountId = resolveAccountId(action.payload.accounts || [], action.payload.activeAccountId);
      return {
        ...action.payload,
        activeAccountId,
        transactions: sortTransactionsNewestFirst(action.payload.transactions || []),
        isAuthenticated: false,
        loginPending: false,
        isLoggingOut: false,
        isStateInitialized: true,
      };
    }
    case 'LOGIN':
      return { ...state, isAuthenticated: true, loginPending: false };
    case 'LOGIN_PENDING':
        return { ...state, loginPending: true };
    case 'LOGOUT_PENDING':
        return { ...state, isLoggingOut: true };
    case 'LOGOUT_COMPLETE':
      return { ...state, isAuthenticated: false, isLoggingOut: false, loginPending: false };
    case 'SET_TRANSFER_DETAILS':
      return { ...state, currentTransfer: { ...state.currentTransfer, ...action.payload } };
    case 'SET_ACTIVE_ACCOUNT': {
      if (!state.accounts.some(account => account.id === action.payload.accountId)) return state;
      const newState = { ...state, activeAccountId: action.payload.accountId };
      saveStateToIndexedDB(newState).catch(err => console.error("Failed to persist active account selection", err));
      return newState;
    }
    case 'CLEAR_TRANSFER':
      return { ...state, currentTransfer: {} };
    case 'ADD_TRANSACTION': {
      const accountId = resolveAccountId(state.accounts, action.payload.accountId, state.activeAccountId);
      if (!accountId) return state;

      const newTransaction: Transaction = {
          ...action.payload,
          id: action.payload.id || `txn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          accountId,
      };
      if (state.transactions.some(transaction => transaction.id === newTransaction.id)) return state;

      const newState = {
        ...state,
        transactions: sortTransactionsNewestFirst([newTransaction, ...state.transactions]),
      };
      saveStateToIndexedDB(newState).catch(err => console.error("Failed to save state to IndexedDB after adding transaction", err));
      return newState;
    }
    case 'UPDATE_TRANSACTION': {
        const { originalId, updatedTransaction } = action.payload;
        const reconciled = reconcileTransactionUpdate(state.transactions, state.accounts, originalId, updatedTransaction);
        if (!reconciled) return state;
        const newState = { ...state, ...reconciled };
        saveStateToIndexedDB(newState).catch(err => console.error("Failed to save reconciled transaction ledger to IndexedDB", err));
        return newState;
    }
    case 'DELETE_TRANSACTION': {
        const reconciled = reconcileTransactionRemoval(state.transactions, state.accounts, action.payload.id);
        if (!reconciled) return state;
        const newState = { ...state, ...reconciled };
        saveStateToIndexedDB(newState).catch(err => console.error("Failed to save reconciled ledger after transaction deletion", err));
        return newState;
    }
    case 'UPDATE_USER': {
        const newState = {...state, user: {...state.user, ...action.payload}};
        saveStateToIndexedDB(newState).catch(err => console.error("Failed to save state to IndexedDB after updating user", err));
        return newState;
    }
    case 'ADD_ACCOUNT': {
        if (state.accounts.some(account => account.id === action.payload.id ||
            account.accountNumber.replace(/\D/g, '') === action.payload.accountNumber.replace(/\D/g, ''))) return state;
        const newState = { ...state, accounts: [...state.accounts, action.payload] };
        saveStateToIndexedDB(newState).catch(err => console.error("Failed to persist new account", err));
        return newState;
    }
    case 'UPDATE_ACCOUNT': {
        const updatedAccount = action.payload;
        const newState = {
            ...state,
            accounts: state.accounts.map(acc => acc.id === updatedAccount.id ? { ...acc, ...updatedAccount } : acc)
        };
        saveStateToIndexedDB(newState).catch(err => console.error("Failed to save state to IndexedDB after updating account", err));
        return newState;
    }
    case 'COMPLETE_TRANSFER': {
        const { account, debit, charge } = action.payload;
        const currentAccount = state.accounts.find(item => item.id === account.id);
        if (!currentAccount || debit.accountId !== account.id || !debit.id) return state;

        // The debit transaction id is the transfer id. A repeated completion
        // cannot debit the same transfer twice, even after a route refresh.
        if (state.transactions.some(transaction => transaction.id === debit.id)) {
            // Preserve the transfer id until the receipt route has been reached;
            // that lets a verification-page refresh resume to the same receipt.
            return state;
        }

        const transactionsToAdd = [debit, ...(charge ? [charge] : [])]
            .filter(transaction => !state.transactions.some(existing => existing.id === transaction.id))
            .map(transaction => ({ ...transaction, accountId: account.id }));
        const newState: AppState = {
            ...state,
            accounts: state.accounts.map(item => item.id === account.id ? { ...item, ...account } : item),
            transactions: sortTransactionsNewestFirst([...transactionsToAdd, ...state.transactions]),
        };
        saveStateToIndexedDB(newState).catch(err => console.error("Failed to persist completed transfer", err));
        return newState;
    }
    case 'REPLACE_STATEMENT_DATA': {
        const { account, transactions } = action.payload;
        const resolvedAccountId = resolveStatementAccountId(state.accounts, account.accountNumber, account.id);
        const resolvedAccount = { ...account, id: resolvedAccountId };
        const accountExists = state.accounts.some(item => item.id === resolvedAccountId);
        const accounts = accountExists
            ? state.accounts.map(item => item.id === resolvedAccountId ? resolvedAccount : item)
            : [...state.accounts, resolvedAccount];
        const accountTransactions = transactions.map(tx => ({ ...tx, accountId: resolvedAccountId }));
        const newState: AppState = {
            ...state,
            accounts,
            activeAccountId: resolvedAccountId,
            transactions: sortTransactionsNewestFirst([
                ...state.transactions.filter(tx => tx.accountId !== resolvedAccountId),
                ...accountTransactions,
            ]),
            user: { ...state.user, name: resolvedAccount.accountHolder, accounts },
            // A statement replaces account and ledger data only; unrelated payees
            // and support history remain available after a new statement is imported.
            payees: state.payees,
            chatHistory: state.chatHistory,
            currentTransfer: {},
        };
        saveStateToIndexedDB(newState).catch(err => console.error("Failed to persist replacement statement data", err));
        return newState;
    }
    case 'UPDATE_TRANSACTIONS': {
        const ids = new Set(action.payload.map(transaction => transaction.id));
        if (ids.size !== action.payload.length) return state;
        const validAccountIds = new Set(state.accounts.map(account => account.id));
        if (action.payload.some(transaction => !validAccountIds.has(transaction.accountId))) return state;
        const newState = {...state, transactions: sortTransactionsNewestFirst(action.payload)};
        saveStateToIndexedDB(newState).catch(err => console.error("Failed to save state to IndexedDB after updating transactions", err));
        return newState;
    }
    case 'ADD_PAYEE': {
        const newState = {...state, payees: [...state.payees, action.payload]};
        saveStateToIndexedDB(newState).catch(err => console.error("Failed to save state to IndexedDB after adding payee", err));
        return newState;
    }
    case 'DELETE_PAYEE': {
        const newState = {...state, payees: state.payees.filter(p => p.id !== action.payload.id)};
        saveStateToIndexedDB(newState).catch(err => console.error("Failed to save state to IndexedDB after deleting payee", err));
        return newState;
    }
    case 'UPDATE_PAYEES': {
        const newState = {...state, payees: action.payload};
        saveStateToIndexedDB(newState).catch(err => console.error("Failed to save state to IndexedDB after updating payees", err));
        return newState;
    }
    case 'UPDATE_CHAT_HISTORY': {
        const newState = {...state, chatHistory: action.payload};
        saveStateToIndexedDB(newState).catch(err => console.error("Failed to save state to IndexedDB after updating chat history", err));
        return newState;
    }
    case 'UPDATE_SETTINGS': {
        const newState = { ...state, settings: { ...state.settings, ...action.payload } };
        saveStateToIndexedDB(newState).catch(err => console.error("Failed to save state to IndexedDB after updating settings", err));
        return newState;
    }
    case 'SET_STATE_FROM_JSON': {
        const newState = {
          ...action.payload,
          activeAccountId: resolveAccountId(action.payload.accounts, action.payload.activeAccountId),
          transactions: sortTransactionsNewestFirst(action.payload.transactions || []),
          isAuthenticated: false,
          isStateInitialized: true,
          loginPending: false,
          isLoggingOut: false,
        };
        saveStateToIndexedDB(newState).catch(err => console.error("Failed to save imported JSON state to IndexedDB", err));
        return newState;
    }
    case 'RESET_STATE': {
        clearStateFromIndexedDB().catch(err => console.error("Failed to clear IndexedDB on reset", err));
        try { window.localStorage.removeItem(LOCAL_STORAGE_KEY); } catch (error) { console.warn('Could not clear localStorage.', error); }
        const newState = {...defaultState, isAuthenticated: false, isStateInitialized: true, loginPending: false, isLoggingOut: false};
        saveStateToIndexedDB(newState).catch(err => console.error("Failed to save default state to IndexedDB on reset", err));
        return newState;
    }
    default:
      return state;
  }
};

const LOCAL_STORAGE_KEY = 'pnb-ebank-prototype-state';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, {...defaultState, isAuthenticated: false, isStateInitialized: false });

  useEffect(() => {
    let isMounted = true;
    async function initializeApp() {
      try {
        let idbState: AppState | null = null;
        try {
          idbState = await getStateFromIndexedDB();
        } catch (storageError) {
          // Safari private browsing or restrictive storage settings may reject IndexedDB.
          console.warn('IndexedDB unavailable; trying localStorage fallback.', storageError);
        }
        if (!isMounted) return;

        if (idbState) {
          idbState.settings = { ...defaultState.settings, ...idbState.settings };
          idbState.loginPending = false;
          idbState.isLoggingOut = false;
          dispatch({ type: 'INITIALIZE_STATE', payload: idbState });
        } else {
          // Check localStorage as fallback if IDB is empty
          let storedState: string | null = null;
          try {
            storedState = window.localStorage.getItem(LOCAL_STORAGE_KEY);
          } catch (storageError) {
            console.warn('localStorage unavailable in this browser session.', storageError);
          }
          if (storedState) {
            const parsedState: AppState = JSON.parse(storedState);
            parsedState.settings = { ...defaultState.settings, ...parsedState.settings };
            parsedState.loginPending = false;
            parsedState.isLoggingOut = false;
            dispatch({ type: 'INITIALIZE_STATE', payload: parsedState });
            // Keep recovered localStorage data even when Safari refuses IndexedDB access.
            try {
              await saveStateToIndexedDB(parsedState);
            } catch (indexedDbError) {
              console.warn('Recovered app state from localStorage; IndexedDB remains unavailable.', indexedDbError);
            }
          } else {
            dispatch({ type: 'INITIALIZE_STATE', payload: defaultState });
            await saveStateToIndexedDB(defaultState);
          }
        }
      } catch (error) {
        console.error("Failed to load initial state from IndexedDB/localStorage:", error);
        if (isMounted) {
          dispatch({ type: 'INITIALIZE_STATE', payload: defaultState });
        }
      }
    }
    initializeApp();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (state.isStateInitialized) {
        try {
          const stateToSave = { 
            ...state,
            isAuthenticated: state.isAuthenticated,
          };
          saveStateToIndexedDB(stateToSave).catch(err => {
            console.error("Failed to persist state update to IndexedDB", err);
          });
          try {
            window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
          } catch (storageError) {
            // Keep the app usable when Safari blocks localStorage; IndexedDB remains primary.
            console.warn('Could not persist localStorage fallback.', storageError);
          }
        } catch (error) {
          console.error("Failed to save state to localStorage", error);
        }
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const useAppStore = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
      throw new Error('useAppStore must be used within an AppProvider');
    }
    return context;
}

export const useAppState = <T,>(selector: (state: AppState) => T): T => {
    const { state } = useAppContext();
    return selector(state);
};
