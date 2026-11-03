
"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/hooks/use-app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Banknote, Home } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { RupeeIcon } from '@/components/rupee-icon';

export default function AllAccountsPage() {
  const { state } = useAppContext();
  const router = useRouter();

  return (
    <div className="pnb-page min-h-screen bg-gray-50">
      <header className="pnb-page-header sticky top-0 z-20 flex items-center justify-between bg-primary p-4 text-primary-foreground shadow-md">
        <button onClick={() => router.back()} aria-label="Go back"><ArrowLeft className="h-6 w-6 text-white" /></button>
        <h1 className="text-xl font-semibold">All Accounts</h1>
        <Link href="/dashboard" aria-label="Home"><Home className="h-6 w-6 text-white" /></Link>
      </header>
      <main className="space-y-4 p-3 pb-8">
        <div className="rounded-2xl bg-gradient-to-r from-rose-50 to-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Your banking relationships</p>
          <p className="mt-1 text-xs text-gray-500">View your linked PNB accounts and balances</p>
        </div>
        <div className="space-y-3">
        {state.accounts.length > 0 ? state.accounts.map((account) => (
          <Card key={account.id} className="overflow-hidden rounded-2xl border border-rose-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">{account.type} Account</CardTitle>
              <Banknote className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="break-all text-sm text-muted-foreground">{account.accountNumber || 'Account number not set'}</p>
              <p className="mt-2 flex items-center text-2xl font-bold font-headline tracking-tighter">
                <RupeeIcon className="mr-0.5 h-5 w-5" /> {formatCurrency(account.balance)}
              </p>
            </CardContent>
          </Card>
        )) : (
          <div className="rounded-2xl border border-dashed border-rose-200 bg-white p-6 text-center">
            <p className="text-sm font-semibold text-gray-700">No accounts available</p>
            <p className="mt-1 text-xs text-gray-500">Import a valid app backup or add account details in Settings.</p>
            <Link href="/settings" className="mt-4 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">Open Settings</Link>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
