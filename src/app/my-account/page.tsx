
"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/hooks/use-app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home, UserCircle, Landmark } from 'lucide-react';

const DetailRow = ({ label, value }: { label: string; value: string | undefined }) => (
    <div className="flex items-start justify-between gap-4 py-3">
        <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
        <span className="min-w-0 max-w-[68%] break-words text-right text-sm font-semibold">{value?.trim() || '-'}</span>
    </div>
);

const joinAvailableDetails = (...values: Array<string | undefined>) =>
    values.map(value => value?.trim()).filter((value): value is string => Boolean(value)).join(', ') || '-';

const maskEmail = (email: string) => {
    if (!email) return '';
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return email;
    const maskedLocal = localPart.length > 2 ? `${localPart.substring(0, 2)}****` : `${localPart}****`;
    return `${maskedLocal}@${domain}`;
};

const maskMobile = (mobile: string) => {
    if (!mobile) return '';
    return mobile.length > 4 ? `******${mobile.slice(-4)}` : mobile;
};

export default function MyAccountPage() {
    const router = useRouter();
    const { state } = useAppContext();
    const { user, accounts } = state;
    const account = accounts[0];

    if (!account) {
        return (
            <div className="pnb-page flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
                <p className="text-sm text-gray-600">No account details are available. Import a backup or add account details in Settings.</p>
                <Link href="/settings" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">Open Settings</Link>
            </div>
        );
    }

    return (
        <div className="pnb-page flex flex-col min-h-screen bg-gray-50">
            <header className="pnb-page-header bg-primary text-primary-foreground p-4 flex items-center justify-between shadow-md sticky top-0 z-20">
                <button onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6 text-accent" />
                </button>
                <h1 className="text-xl font-semibold">My Account</h1>
                <Link href="/dashboard">
                     <Home className="h-6 w-6 text-accent" />
                </Link>
            </header>

            <main className="flex-1 p-4 space-y-4 overflow-y-auto">
                 <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <UserCircle className="h-10 w-10 text-primary"/>
                        <div>
                            <CardTitle className="text-lg">Personal Details</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="divide-y">
                        <DetailRow label="Full Name" value={user.name} />
                        <DetailRow label="Customer ID" value={account.customerId} />
                        <DetailRow label="Date of Birth" value={user.dob} />
                        <DetailRow label="Mobile Number" value={maskMobile(user.mobileNumber)} />
                        <DetailRow label="Email ID" value={maskEmail(user.email)} />
                        <DetailRow label="Customer Address" value={joinAvailableDetails(account.customerAddress, account.customerCity, account.customerPin)} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Landmark className="h-10 w-10 text-primary"/>
                        <div>
                            <CardTitle className="text-lg">Account Details</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="divide-y">
                        <DetailRow label="Account Type" value={`${account.type} Account`} />
                        <DetailRow label="Account Number" value={account.accountNumber} />
                        <DetailRow label="Account Status" value={account.status} />
                        <DetailRow label="UPI ID" value={account.upiId} />
                        <DetailRow label="IFSC Code" value={account.ifsc} />
                        <DetailRow label="Branch Address" value={joinAvailableDetails(account.branchAddress, account.branchCity, account.branchPin)} />
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
