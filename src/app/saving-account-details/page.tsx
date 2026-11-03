
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/hooks/use-app-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Home, Info, ChevronUp, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns";
import type { Transaction } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { RupeeIcon } from "@/components/rupee-icon";
import { calculateAverageQuarterlyBalance, getQuarterOptions } from "@/lib/quarterly-balance";
import { getActiveAccount } from "@/lib/accounts";

const BalanceDetailRow = ({ label, value }: { label: string; value: number }) => (
    <div className="flex items-center justify-between gap-3 py-1">
        <div className="flex min-w-0 items-center gap-1.5">
            <span className="text-xs text-gray-600">{label}</span>
            <Info className="h-3.5 w-3.5 shrink-0 text-gray-400" />
        </div>
        <span className="flex shrink-0 items-center font-semibold text-sm tracking-tighter text-gray-800">
            <RupeeIcon className="mr-0.5 h-3.5 w-3.5" /> {formatCurrency(value)}
        </span>
    </div>
);


const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
    const isDebit = transaction.type === 'debit';
    const formattedAmount = formatCurrency(Math.abs(transaction.amount));

    return (
        <div className="flex w-full min-w-0 items-start justify-between gap-3 py-2">
            <div className="min-w-0 flex-1">
                <p className="break-words whitespace-normal text-left text-xs font-semibold text-gray-700">{transaction.description}</p>
                <p className="text-xs text-gray-500">{format(new Date(transaction.date), 'MMM dd, yyyy')}</p>
            </div>
            <p className={`max-w-[42%] shrink-0 whitespace-nowrap text-right text-sm font-bold flex items-center justify-end tracking-tighter ${isDebit ? 'text-red-600' : 'text-green-600'}`}>
                {isDebit ? '-' : '+'} <RupeeIcon className="w-3 h-3 mx-0.5" />{formattedAmount}
            </p>
        </div>
    );
};


export default function SavingAccountDetailsPage() {
    const { state } = useAppContext();
    const router = useRouter();
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);
    const quarterOptions = getQuarterOptions();
    const [selectedQuarter, setSelectedQuarter] = useState(() => quarterOptions[0]?.value || '2026-Q1');

    if (!state) return null;

    const account = getActiveAccount(state);
    if (!account) {
        return (
            <div className="pnb-page flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
                <p className="text-sm text-gray-600">No account is available. Import a valid app backup or add an account in Settings.</p>
                <Link href="/settings"><Button>Open Settings</Button></Link>
            </div>
        );
    }
    const { transactions, user } = state;
    const formattedBalance = formatCurrency(account.balance);
    const accountHolderParts = (user.name || "Customer").split(" ");
    const firstName = accountHolderParts[0];
    const lastName = accountHolderParts.slice(1).join(" ");
    
    const automaticQuarterBalance = calculateAverageQuarterlyBalance(
        transactions,
        account.id,
        account.balance,
        selectedQuarter,
    );
    const averageQuarterlyBalance = account.averageQuarterlyBalance !== undefined && account.averageQuarterlyBalance !== null
        ? account.averageQuarterlyBalance
        : automaticQuarterBalance;

    const last10Transactions = transactions
        .filter(transaction => transaction.accountId === account.id)
        .slice()
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

    return (
        <div className="pnb-page flex flex-col min-h-screen bg-gray-50">
            <header className="pnb-page-header bg-primary text-primary-foreground p-4 flex items-center justify-between shadow-md sticky top-0 z-20">
                <button onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6 text-accent" />
                </button>
                <h1 className="text-xl font-semibold">{account.type} Account</h1>
                <Link href="/dashboard">
                     <Home className="h-6 w-6 text-accent" />
                </Link>
            </header>

            <main className="flex-1 p-2 space-y-2 overflow-y-auto pb-24">
                <Card className="bg-primary text-primary-foreground rounded-xl shadow-lg relative overflow-hidden">
                    <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full z-0"></div>
                     <CardContent className="p-3 space-y-1 z-10 relative">
                        <div>
                            <p className="text-base font-bold tracking-wide">{firstName.toUpperCase()}</p>
                            <p className="text-base font-bold tracking-wide">{lastName.toUpperCase()}</p>
                            <p className="text-xs opacity-80 mt-0.5">{account.accountNumber}</p>
                        </div>
                        <div className="pt-1">
                            <p className="text-2xl font-bold flex items-center tracking-tighter"><RupeeIcon className="w-5 h-5 mr-0.5" />{formattedBalance}</p>
                            <p className="text-xs opacity-80">Available Balance</p>
                        </div>
                         <button 
                            onClick={() => setIsDetailsVisible(!isDetailsVisible)}
                            className="flex items-center gap-1.5 text-xs text-accent font-semibold pt-1"
                        >
                            {isDetailsVisible ? "Hide Balance Details" : "See Balance Details"}
                            {isDetailsVisible ? <ChevronUp className="h-3.5 w-3.5"/> : <ChevronDown className="h-3.5 w-3.5"/>}
                        </button>
                    </CardContent>
                </Card>

                {isDetailsVisible && (
                    <Card className="bg-rose-50/50">
                        <CardContent className="p-3 divide-y">
                            <BalanceDetailRow label="Effective Available Balance" value={account.balance} />
                            <BalanceDetailRow label="Ledger Balance" value={account.balance} />
                            <BalanceDetailRow label="Sweep Balance" value={0} />
                            <BalanceDetailRow label="Float Balance" value={0} />
                            <BalanceDetailRow label="Lien Balance" value={0} />
                            <BalanceDetailRow label="Unclear Amount Balance" value={0} />
                        </CardContent>
                    </Card>
                )}
                
                <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <div className="flex items-center gap-2">
                            <h2 className="font-semibold text-sm text-gray-700">Account Summary</h2>
                            <Info className="h-3.5 w-3.5 text-gray-500" />
                        </div>
                        <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                            <SelectTrigger className="w-auto border-none shadow-none text-xs h-8 bg-transparent">
                                <SelectValue placeholder="Select Quarter" />
                            </SelectTrigger>
                            <SelectContent>
                                {quarterOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Card>
                        <CardContent className="p-3">
                            <p className="font-bold text-base text-gray-800 flex items-center tracking-tighter">
                                <RupeeIcon className="w-4 h-4 mr-0.5" />{formatCurrency(averageQuarterlyBalance)}
                            </p>
                            <p className="text-xs text-gray-500">Average Quarterly Balance</p>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="px-1 pt-2">
                    <h3 className="text-xs font-bold text-primary tracking-wider">LAST 10 TRANSACTIONS</h3>
                    <div className="divide-y mt-1">
                        {last10Transactions.length > 0 ? last10Transactions.map((tx, index) => (
                            <TransactionItem key={`${tx.id}-${index}`} transaction={tx} />
                        )) : (
                            <p className="py-5 text-center text-xs text-gray-500">No recent transactions for this account.</p>
                        )}
                    </div>
                </div>

            </main>

            <footer className="p-4 border-t bg-background fixed bottom-0 z-10 w-full max-w-md mx-auto">
                 <Link href="/account-statement" className="w-full">
                    <Button className="w-full" size="lg">Get Statement</Button>
                 </Link>
            </footer>
        </div>
    );
}
