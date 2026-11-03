
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, FileText, FileDown, LineChart } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { format, isValid, parseISO, startOfDay } from "date-fns";
import StatementPDF from "@/components/statement-pdf";
import { useAppContext } from "@/hooks/use-app-store";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { RupeeIcon } from "@/components/rupee-icon";
import { calculateStatementBalances } from "@/lib/statement-balance";
import { toast } from "@/hooks/use-toast";
import { getActiveAccount } from "@/lib/accounts";

const TransactionRow = ({ transaction }: { transaction: Transaction & { balance: number } }) => {
    const isDebit = transaction.type === 'debit';
    const formattedAmount = formatCurrency(Math.abs(transaction.amount));
    const formattedBalance = formatCurrency(transaction.balance);

    return (
        <div className="py-3 px-4">
            <div className="flex w-full min-w-0 items-start justify-between gap-3">
                <div className="min-w-0 flex-1 pr-2">
                    <p className="break-words whitespace-normal text-left text-sm font-semibold text-gray-800">{transaction.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{format(new Date(transaction.date), 'MMM dd, yyyy')}</p>
                </div>
                <div className="max-w-[44%] shrink-0 text-right">
                    <p className={`text-xs sm:text-base font-bold whitespace-nowrap flex items-center justify-end tracking-tighter ${isDebit ? 'text-red-600' : 'text-green-600'}`}>
                        {isDebit ? '-' : '+'}{' '}
                        <RupeeIcon className="w-3.5 h-3.5 mx-0.5" />{formattedAmount}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Available Balance</p>
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 mt-0.5 flex items-center justify-end tracking-tighter"><RupeeIcon className="w-3 h-3 mr-0.5" />{formattedBalance}</p>
                </div>
            </div>
            <Separator className="mt-3" />
        </div>
    );
};


export function StatementContent() {
    const { state } = useAppContext();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const requestedAccountId = searchParams.get('accountId');
    const account = useMemo(() => requestedAccountId
        ? state.accounts.find(item => item.id === requestedAccountId)
        : getActiveAccount({
            accounts: state.accounts,
            activeAccountId: state.activeAccountId,
        }), [state.accounts, state.activeAccountId, requestedAccountId]);
    const parsedFrom = useMemo(() => from ? parseISO(from) : undefined, [from]);
    const parsedTo = useMemo(() => to ? parseISO(to) : undefined, [to]);
    const isValidPeriod = Boolean(
        parsedFrom && parsedTo &&
        isValid(parsedFrom) && isValid(parsedTo) &&
        parsedFrom.getTime() <= parsedTo.getTime()
    );

    const transactionsWithBalance = useMemo(() => {
        if (!isValidPeriod || !parsedFrom || !parsedTo || !account) return [];
        const fromDate = startOfDay(parsedFrom);
        const toDate = new Date(parsedTo);
        toDate.setHours(23, 59, 59, 999);
        return calculateStatementBalances(state.transactions, account.id, account.balance, fromDate, toDate);
    }, [state.transactions, parsedFrom, parsedTo, isValidPeriod, account]);
    
    const handleDownloadPdf = async () => {
        if (!state) return;
        if (!isValidPeriod || !parsedFrom || !parsedTo) {
            toast({ variant: 'destructive', title: 'Invalid date range', description: 'Select a valid statement start and end date.' });
            return;
        }
        if (!account) {
            toast({ variant: 'destructive', title: 'No account found', description: 'The selected account is no longer available. Select an account and try again.' });
            return;
        }
        setIsGeneratingPdf(true);
        toast({ title: "Generating PDF...", description: "Your statement is being prepared." });

        try {
            const pdfDataUri = await StatementPDF.generatePdfDataUri({
                account,
                transactions: transactionsWithBalance,
                period: { from: parsedFrom, to: parsedTo },
                banner: state.settings.pdfBanner,
                lastPagePdfDataUri: state.settings.lastPagePdfDataUri,
            });
            
            const accountDigits = String(account.accountNumber || '').replace(/\D/g, '');
            const lastFour = accountDigits.slice(-4).padStart(4, '0');
            const downloadDate = format(new Date(), 'ddMMyyyy');
            const filename = 'PNBONE_STMT_XX' + lastFour + '_' + downloadDate + '.pdf';

            // Send the PDF through a same-origin attachment response. iOS Safari
            // often ignores the download attribute on blob: URLs, but honors
            // Content-Disposition: attachment on a normal HTTP response.
            const downloadForm = document.createElement('form');
            downloadForm.method = 'POST';
            downloadForm.action = '/api/download-pdf';
            downloadForm.enctype = 'multipart/form-data';
            downloadForm.target = 'pnb-pdf-download-frame';
            downloadForm.style.display = 'none';
            const dataInput = document.createElement('input');
            dataInput.type = 'hidden';
            dataInput.name = 'pdfData';
            dataInput.value = pdfDataUri;
            const nameInput = document.createElement('input');
            nameInput.type = 'hidden';
            nameInput.name = 'filename';
            nameInput.value = filename;
            downloadForm.append(dataInput, nameInput);
            let downloadFrame = document.querySelector<HTMLIFrameElement>('#pnb-pdf-download-frame');
            if (!downloadFrame) {
                downloadFrame = document.createElement('iframe');
                downloadFrame.id = 'pnb-pdf-download-frame';
                downloadFrame.name = 'pnb-pdf-download-frame';
                downloadFrame.style.display = 'none';
                document.body.appendChild(downloadFrame);
            }
            document.body.appendChild(downloadForm);
            downloadForm.submit();
            downloadForm.remove();
            window.setTimeout(() => downloadFrame?.remove(), 120000);
            toast({ title: 'Download started', description: 'Your statement was sent as a downloadable PDF attachment.' });
        } catch (error) {
            console.error("PDF Generation/Download Error:", error);
            toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Failed to generate or download PDF.' });
        } finally {
            setIsGeneratingPdf(false);
        }
    };
    
    
    if (!state) return null; // Or a loading state
    if (!account) return <div className="p-4 text-center">The selected account is unavailable. Return to Account Statement and choose an available account.</div>;
    if (!isValidPeriod) return <div className="p-4 text-center">Invalid date range provided. Return to Account Statement and select valid dates.</div>

    return (
        <div className="pnb-page flex flex-col min-h-screen bg-white">
            <header className="pnb-page-header p-3 bg-primary text-primary-foreground flex items-center justify-between sticky top-0 z-10">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-accent hover:bg-white/10">
                    <ArrowLeft className="h-6 w-6"/>
                </Button>
                <h1 className="text-xl font-semibold">Statement</h1>
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="size-12 h-12 w-12 min-h-12 min-w-12 shrink-0 text-accent hover:bg-white/10">
                        <Home className="!h-7 !w-7" strokeWidth={2.5} />
                    </Button>
                </Link>
            </header>

            <main className="flex-1 overflow-y-auto pb-20">
                {transactionsWithBalance.length > 0 ? (
                    <div className="divide-y">
                        {transactionsWithBalance.map((tx) => (
                            <TransactionRow key={tx.id} transaction={tx} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center text-gray-500 h-full p-8">
                        <FileText className="h-12 w-12 text-gray-300 mb-4" />
                        <h2 className="text-lg font-semibold">No Transactions Found</h2>
                        <p className="text-sm">There are no transactions for the selected period.</p>
                    </div>
                )}
            </main>
            
            <footer className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto bg-primary text-primary-foreground z-10">
                <div className="flex justify-around items-center h-20">
                    <Button variant="ghost" className="flex flex-col items-center h-full text-white" onClick={handleDownloadPdf} disabled={isGeneratingPdf}>
                        <FileDown className="h-6 w-6" />
                        <span>{isGeneratingPdf ? 'Generating...' : 'Download PDF'}</span>
                    </Button>
                     <Link href={`/statement/analysis?from=${encodeURIComponent(from || '')}&to=${encodeURIComponent(to || '')}&accountId=${encodeURIComponent(account.id)}`} className="flex h-full flex-1">
                        <Button variant="ghost" className="flex h-full w-full flex-col items-center text-white">
                            <LineChart className="h-6 w-6" />
                            <span>Analysis</span>
                        </Button>
                    </Link>
                </div>
            </footer>
        </div>
    );
}
