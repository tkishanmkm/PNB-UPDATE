
"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, User, KeyRound, ShieldCheck, Fingerprint, Languages, Building, XCircle, Landmark, FileText, Wallet } from 'lucide-react';

const options = [
    {
        title: 'Set Account Nickname',
        icon: User,
        href: '#',
    },
    {
        title: 'Change MPIN',
        icon: KeyRound,
        href: '#',
    },
    {
        title: 'Check KYC Status',
        icon: ShieldCheck,
        href: '#',
    },
    {
        title: 'Enable Biometrics',
        icon: Fingerprint,
        href: '#',
    },
    {
        title: 'SMS Preferred Language',
        icon: Languages,
        href: '#',
    },
    {
        title: 'Register For IBS',
        icon: Building,
        href: '#',
    },
    {
        title: 'De-Activation',
        icon: XCircle,
        href: '#',
    },
    {
        title: 'Security Settings',
        icon: ShieldCheck,
        href: '/settings',
    },
];

export default function MyProfilePage() {
    const router = useRouter();
    const accountOptions = [
        { title: 'My Account', icon: User, href: '/my-account' },
        { title: 'Account Details', icon: Landmark, href: '/saving-account-details' },
        { title: 'All Accounts', icon: Wallet, href: '/all-accounts' },
        { title: 'Account Statement', icon: FileText, href: '/account-statement' },
    ];


    const renderOption = (option: typeof options[0], index: number) => (
        option.href === "#" ? (
            <div
                key={option.title + "-" + index}
                aria-disabled="true"
                className="flex min-w-0 cursor-not-allowed flex-col items-center gap-2 rounded-2xl px-1 py-3 text-center opacity-75"
            >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-primary shadow-sm">
                    <option.icon className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <span className="line-clamp-2 min-h-8 text-[10px] font-semibold leading-4 text-gray-700">
                    {option.title}
                </span>
            </div>
        ) : (
            <Link
                href={option.href}
                key={option.title + "-" + index}
                className="group flex min-w-0 flex-col items-center gap-2 rounded-2xl px-1 py-3 text-center transition-colors hover:bg-rose-50 active:bg-rose-100"
            >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-primary shadow-sm transition-transform group-hover:-translate-y-0.5">
                    <option.icon className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <span className="line-clamp-2 min-h-8 text-[10px] font-semibold leading-4 text-gray-700">
                    {option.title}
                </span>
            </Link>
        )
    );

    const renderGroup = (title: string, group: typeof options) => (
        <section className="overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-rose-50 px-4 py-3">
                <h2 className="text-sm font-bold text-gray-800">{title}</h2>
                <span className="h-1.5 w-7 rounded-full bg-rose-200" />
            </div>
            <div className="grid grid-cols-4 gap-1 p-2">
                {group.map((option) => renderOption(option, options.indexOf(option)))}
            </div>
        </section>
    );

    return (
        <div className="pnb-page flex min-h-screen flex-col bg-gray-50">
            <header className="pnb-page-header bg-primary text-primary-foreground sticky top-0 z-20 flex items-center justify-between p-4 shadow-md">
                <button onClick={() => router.back()} aria-label="Go back">
                    <ArrowLeft className="h-6 w-6 text-white" />
                </button>
                <h1 className="text-xl font-semibold">Profile Settings</h1>
                <Link href="/dashboard" aria-label="Home">
                    <Home className="h-6 w-6 text-white" />
                </Link>
            </header>

            <main className="flex-1 space-y-4 p-3 pb-8">
                <section className="rounded-2xl bg-gradient-to-r from-rose-50 to-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">Manage your profile</p>
                    <p className="mt-1 text-xs text-gray-500">Personal details, access and account preferences</p>
                </section>
                {renderGroup("Profile Settings", options)}
                {renderGroup("Account Related Settings", accountOptions)}
            </main>
        </div>
    );
}
