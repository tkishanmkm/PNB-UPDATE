"use client";

import { useState, useCallback, Suspense, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Home, ShieldCheck } from 'lucide-react';
import { useAppContext } from '@/hooks/use-app-store';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { Transaction } from '@/lib/types';
import { getActiveAccount } from '@/lib/accounts';
import { LocalDemoNotice } from '@/components/local-demo-notice';
import { isLocalImageSource } from '@/lib/local-image';

const OtpIcon = ({ avatarUrl }: { avatarUrl: string }) => {
    return isLocalImageSource(avatarUrl)
        ? <Image src={avatarUrl} alt="Local demo OTP avatar" width={40} height={40} className="rounded-full" unoptimized />
        : <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-primary"><ShieldCheck className="h-6 w-6" /></span>;
};


function OtpPopup({ otp, avatarUrl }: { otp: string; avatarUrl: string }) {
    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] z-50">
            <div className="bg-zinc-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-3 text-white/90 animate-in slide-in-from-top-12 duration-500 fade-in-25">
                <div className="flex items-start gap-3">
                     <OtpIcon avatarUrl={avatarUrl}/>
                    <div className="flex-1">
                        <div className="flex justify-between items-center">
                            <p className="text-sm font-bold">PNB ONE DEMO</p>
                            <p className="text-xs text-white/60">now</p>
                        </div>
                        <p className="text-sm mt-0.5">Local demo OTP: <span className="font-bold">{otp}</span>. No SMS was sent and no bank authentication was performed.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}


function VerifyTransfer() {
    const router = useRouter();
    const params = useParams();
    const { state, dispatch } = useAppContext();
    const { toast } = useToast();
    
    const payeeId = params.id as string;
    const { currentTransfer, settings } = state;
    const payee = state.payees.find(p => p.id === payeeId);
    
    const [otp, setOtp] = useState('');
    const otpInputRef = useRef<HTMLInputElement>(null);
    const [countdown, setCountdown] = useState(59);
    const [showOtpPopup, setShowOtpPopup] = useState(false);
    const [currentOtp, setCurrentOtp] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const processingRef = useRef(false);
    const popupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const account = currentTransfer.accountId
        ? state.accounts.find(item => item.id === currentTransfer.accountId)
        : getActiveAccount(state);
    const transferId = currentTransfer.transferId;
    const transferMode = currentTransfer.transferMode || 'imps';
    const existingTransfer = transferId
        ? state.transactions.find(transaction => transaction.id === transferId && transaction.type === 'debit')
        : undefined;

    const buildReceiptUrl = useCallback((referenceId: string, rrn: string) => {
        const queryParams = new URLSearchParams({
            payeeId: payee?.id || payeeId,
            referenceId,
            rrn,
        });
        return `/fund-transfer/success?${queryParams.toString()}`;
    }, [payee, payeeId]);

    useEffect(() => {
        if (existingTransfer && payee && existingTransfer.payeeId === payee.id) {
            router.replace(buildReceiptUrl(existingTransfer.id, existingTransfer.reference || ''));
            return;
        }
        if (!payee || !account || !Number.isFinite(currentTransfer.amount) || !currentTransfer.amount || !transferId) {
            router.replace('/fund-transfer');
        }
    }, [existingTransfer, payee, account, currentTransfer.amount, currentTransfer.accountId, transferId, router, buildReceiptUrl]);

    const generateOtp = useCallback(() => {
        const values = new Uint32Array(1);
        window.crypto.getRandomValues(values);
        const newOtp = String(100000 + (values[0] % 900000));
        setCurrentOtp(newOtp);
        return newOtp;
    }, []);

    const handleSubmit = useCallback((enteredOtp: string) => {
        if (processingRef.current) return;

        if (enteredOtp !== currentOtp) {
            toast({ variant: 'destructive', title: 'Incorrect OTP', description: 'Please try again.' });
            setOtp('');
            otpInputRef.current?.focus();
            return;
        }

        const transferAmount = currentTransfer.amount;
        const activeAccount = account
            ? state.accounts.find(item => item.id === account.id)
            : undefined;
        if (!payee || !activeAccount || !transferId || !Number.isFinite(transferAmount) || !transferAmount || transferAmount <= 0) {
            toast({ variant: 'destructive', title: 'Transfer details unavailable', description: 'Return to the transfer form and review the details.' });
            router.replace('/fund-transfer');
            return;
        }

        const amountPaise = Math.round(transferAmount * 100);
        // Keep the existing local IMPS charge bands; other selected modes do not
        // inherit an IMPS charge in this UI prototype.
        const chargePaise = transferMode === 'imps'
            ? (amountPaise <= 100000 ? 0 : amountPaise <= 10000000 ? 590 : 1180)
            : 0;
        const balancePaise = Math.round(activeAccount.balance * 100);
        if (amountPaise <= 0 || amountPaise + chargePaise > balancePaise) {
            toast({ variant: 'destructive', title: 'Insufficient Funds', description: 'Your balance does not cover the transfer and applicable charge.' });
            setOtp('');
            otpInputRef.current?.focus();
            return;
        }

        processingRef.current = true;
        setIsProcessing(true);
        setShowOtpPopup(false);
        if (popupTimerRef.current) clearTimeout(popupTimerRef.current);

        const completedAt = new Date().toISOString();
        const rrnNumber = String(Math.floor(100000000000 + Math.random() * 900000000000));
        const rrn = `${transferMode.toUpperCase()}/${rrnNumber}`;
        const amount = amountPaise / 100;
        const chargeAmount = chargePaise / 100;
        const payeeFirstName = payee.name.split(' ')[0] || '';
        const debit: Transaction = {
            id: transferId,
            accountId: activeAccount.id,
            date: completedAt,
            description: `${transferMode.toUpperCase()}-IN/${rrnNumber}/${payee.accountNumber}/${payeeFirstName}`,
            amount: -amount,
            type: 'debit',
            category: 'Transfer',
            reference: rrn,
            payeeId: payee.id,
            payee: payee.name,
            remarks: currentTransfer.remarks || '',
        };
        const charge: Transaction | undefined = chargeAmount > 0 ? {
            id: `${transferId}-CHG`,
            accountId: activeAccount.id,
            date: completedAt,
            description: `${transferMode.toUpperCase()}-CHG/${rrnNumber}/${payee.accountNumber}/${payeeFirstName}`,
            amount: -chargeAmount,
            type: 'debit',
            category: 'Bank Charges',
            reference: `CHG/${rrnNumber}`,
            remarks: `${transferMode.toUpperCase()} service charge`,
        } : undefined;

        dispatch({
            type: 'COMPLETE_TRANSFER',
            payload: {
                account: { ...activeAccount, balance: (balancePaise - amountPaise - chargePaise) / 100 },
                debit,
                ...(charge ? { charge } : {}),
            },
        });
        toast({ title: 'OTP Verified', description: 'Transfer recorded. Opening your receipt...' });
        router.replace(buildReceiptUrl(transferId, rrn));
    }, [currentOtp, toast, currentTransfer, state.accounts, account, payee, transferId, transferMode, dispatch, router, buildReceiptUrl]);

    const triggerOtpSequence = useCallback(() => {
        if (processingRef.current) return;
        generateOtp();
        setCountdown(59);
        setShowOtpPopup(true);
        if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
        popupTimerRef.current = setTimeout(() => setShowOtpPopup(false), 5000);
    }, [generateOtp]);

    useEffect(() => {
        if (!payee || !account || !currentTransfer.amount || !transferId || existingTransfer) return;

        const timer = setInterval(() => setCountdown(previous => previous > 0 ? previous - 1 : 0), 1000);
        const showTimer = setTimeout(triggerOtpSequence, 1000);
        otpInputRef.current?.focus();

        return () => {
            clearInterval(timer);
            clearTimeout(showTimer);
            if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
        };
    }, [triggerOtpSequence, payee, account, currentTransfer.amount, currentTransfer.accountId, transferId, existingTransfer]);

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d{0,6}$/.test(value)) {
            setOtp(value);
            if (value.length === 6 && !isProcessing) {
                handleSubmit(value);
            }
        }
    };
    
    if (!payee || !account || !currentTransfer.amount || !transferId || existingTransfer) {
        return <div className="p-4">Checking transfer status...</div>;
    }
    
    const otpDigits = otp.padEnd(6, ' ').split('');
    const otpAvatar = settings.otpAvatar || state.user.avatar;

    return (
        <div className="pnb-page flex flex-col min-h-screen bg-white">
            {showOtpPopup && <OtpPopup otp={currentOtp} avatarUrl={otpAvatar} />}

            <header className="pnb-page-header bg-primary text-primary-foreground p-4 flex items-center justify-between shadow-md sticky top-0 z-20">
                <button onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6 text-accent" />
                </button>
                <h1 className="text-xl font-semibold">Verify</h1>
                <Link href="/dashboard">
                     <Home className="h-6 w-6 text-accent" />
                </Link>
            </header>

            <main className="flex-1 flex flex-col justify-start items-start p-6 pt-12 text-left">
                <div className="w-full">
                    <LocalDemoNotice className="mx-0 mb-4 mt-0" />
                    <p className="text-base text-gray-700 mb-2">A local demo OTP was generated in this browser. No message was sent to your mobile number.</p>
                    
                    <div 
                        className="relative flex justify-start items-center gap-3 my-8 cursor-text"
                        onClick={() => otpInputRef.current?.focus()}
                    >
                        {otpDigits.map((digit, index) => (
                            <div key={index} className="w-10 h-12 flex flex-col items-center justify-center">
                                 <div className={cn("w-4 h-4 bg-gray-300 rounded-full", { "bg-primary": digit !== " " })} />
                                 <div className="w-full h-px bg-gray-400 mt-2" />
                            </div>
                        ))}
                         <input
                            ref={otpInputRef}
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            autoComplete="one-time-code"
                            maxLength={6}
                            value={otp}
                            onChange={handleOtpChange}
                            disabled={isProcessing}
                            className="absolute inset-0 h-full w-full border-none bg-transparent text-transparent outline-none [caret-color:transparent] disabled:cursor-wait"
                        />
                    </div>
                    
                    {countdown > 0 ? (
                        <p className="text-sm text-gray-500">Resend OTP will be enabled in {countdown}s</p>
                    ) : (
                        <button type="button" className="text-sm font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-50" onClick={triggerOtpSequence} disabled={isProcessing}>
                            Resend OTP
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
}

export default function VerifyTransferPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyTransfer />
        </Suspense>
    )
}
