"use client";

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppContext } from '@/hooks/use-app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ArrowLeft, Home, Lightbulb, LineChart } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { analyzeStatementLocally, type LocalStatementAnalysis } from '@/lib/statement-analysis';
import { getActiveAccount } from '@/lib/accounts';

function AnalysisDisplay() {
  const searchParams = useSearchParams();
  const { state } = useAppContext();
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const requestedAccountId = searchParams.get('accountId');

  const [analysis, setAnalysis] = useState<LocalStatementAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state.isStateInitialized) {
      setIsLoading(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    if (!from || !to) {
      setError('The statement date range is missing. Return to Account Statement and choose a period.');
      setIsLoading(false);
      return;
    }

    const startDate = parseISO(from);
    const endDate = parseISO(to);
    if (!isValid(startDate) || !isValid(endDate) || startDate.getTime() > endDate.getTime()) {
      setError('The statement date range is invalid. Choose a valid start and end date.');
      setIsLoading(false);
      return;
    }

    const account = requestedAccountId
      ? state.accounts.find(item => item.id === requestedAccountId)
      : getActiveAccount({
          accounts: state.accounts,
          activeAccountId: state.activeAccountId,
        });
    if (!account?.id) {
      setError('No account is available to analyse. Import an account statement or restore a valid backup.');
      setIsLoading(false);
      return;
    }

    try {
      // All calculations run in this browser. Transaction details are not sent to an AI service.
      const result = analyzeStatementLocally(state.transactions || [], account.id, startDate, endDate);
      setAnalysis(result);
    } catch (analysisError) {
      console.error('Local statement analysis failed:', analysisError);
      setError('Statement analysis could not be calculated from the saved transaction data.');
    } finally {
      setIsLoading(false);
    }
  }, [from, to, requestedAccountId, state.isStateInitialized, state.accounts, state.activeAccountId, state.transactions]);

  if (isLoading) {
    return (
      <div className="space-y-6" aria-label="Loading statement analysis">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Statement analysis unavailable</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">
        Calculated locally from this account’s saved transactions. Your transaction descriptions and amounts are not sent to an external analysis service.
      </p>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
          <div className="rounded-full bg-primary/10 p-2"><LineChart className="h-6 w-6 text-primary" /></div>
          <CardTitle className="font-headline text-lg">Spending Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm text-foreground">{analysis?.summary}</p>
          {analysis && <p className="mt-3 text-xs text-muted-foreground">{analysis.transactionCount} matching transactions</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
          <div className="rounded-full bg-primary/10 p-2"><Lightbulb className="h-6 w-6 text-primary" /></div>
          <CardTitle className="font-headline text-lg">Financial Insights</CardTitle>
        </CardHeader>
        <CardContent><p className="whitespace-pre-wrap text-sm text-foreground">{analysis?.insights}</p></CardContent>
      </Card>
    </div>
  );
}

function AnalysisPageHeader() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const startDate = from ? parseISO(from) : null;
  const endDate = to ? parseISO(to) : null;
  const validPeriod = Boolean(startDate && endDate && isValid(startDate) && isValid(endDate) && startDate <= endDate);

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold font-headline">Statement Analysis</h1>
      {validPeriod && startDate && endDate
        ? <p className="text-muted-foreground">{format(startDate, 'MMM dd, yyyy')} - {format(endDate, 'MMM dd, yyyy')}</p>
        : <p className="text-muted-foreground">Select a valid date range from Account Statement.</p>}
    </div>
  );
}

export default function StatementAnalysisPage() {
  const router = useRouter();
  return (
    <div className="pnb-page min-h-screen bg-gray-50">
      <header className="pnb-page-header sticky top-0 z-20 flex items-center justify-between bg-primary p-4 text-primary-foreground shadow-md">
        <button onClick={() => router.back()} aria-label="Go back"><ArrowLeft className="h-6 w-6 text-white" /></button>
        <h1 className="text-base font-semibold">Statement Analysis</h1>
        <Link href="/dashboard" aria-label="Home"><Home className="h-6 w-6 text-white" /></Link>
      </header>
      <main className="p-4">
        <Suspense fallback={
          <div className="mb-6">
            <Skeleton className="mb-2 h-8 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        }>
          <AnalysisPageHeader />
        </Suspense>
        <Suspense fallback={<div className="space-y-3"><Skeleton className="h-28 w-full" /><Skeleton className="h-28 w-full" /></div>}>
          <AnalysisDisplay />
        </Suspense>
      </main>
    </div>
  );
}
