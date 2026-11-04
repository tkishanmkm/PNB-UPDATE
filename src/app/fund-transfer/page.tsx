
"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, Landmark, Repeat, ChevronRight, Globe2, Banknote, PiggyBank } from "lucide-react";
import { RupeeIcon } from "@/components/rupee-icon";
import { LocalDemoNotice } from "@/components/local-demo-notice";

const TransferFundsIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const QuickTransferIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 4.5l-4-4L7 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11 0.5V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 10.5v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 15.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


const transferOptions = [
    {
        icon: TransferFundsIcon,
        title: "Payee (Added)",
        description: "Send money to a saved beneficiary",
        href: "/fund-transfer/beneficiary",
        id: "beneficiary-transfer"
    },
    {
        icon: QuickTransferIcon,
        title: "One Time (Bank)",
        description: "Send upto ",
        amount: "10,000",
        descriptionSuffix: " without adding beneficiary",
        href: "#",
        id: "quick-transfer"
    },
    {
        icon: Landmark,
        title: "Self (Own Account)",
        description: "Transfer between your own PNB accounts",
        href: "#",
        id: "self-transfer"
    },
    {
        icon: Repeat,
        title: "Send Money Nepal",
        description: "Send money from India to Nepal, up to \u20B92 lakh per transaction.",
        href: "#",
        id: "indo-nepal"
    },
];

export default function FundTransferPage() {
    const router = useRouter();

    const handleOptionClick = (href: string) => {
        router.push(href);
    };

    const primaryOptions = transferOptions.filter((item) =>
        ["self-transfer", "beneficiary-transfer", "quick-transfer"].includes(item.id)
    );
    const internationalOption = transferOptions.find((item) => item.id === "indo-nepal")!;

    const renderTransferTile = (item: typeof transferOptions[number]) => (
        <button
            key={item.id}
            type="button"
            disabled={item.href === "#"}
            onClick={() => handleOptionClick(item.href)}
            className="pnb-send-money-tile group flex min-h-[132px] min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-white px-1 py-4 text-center shadow-sm transition-colors hover:bg-rose-50 active:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-65"
        >
            <span className="grid h-[66px] w-[66px] place-items-center rounded-full bg-rose-50 text-primary shadow-sm transition-transform group-hover:-translate-y-0.5">
                <item.icon className="h-8 w-8" strokeWidth={1.6} />
            </span>
            <span className="line-clamp-2 text-[11px] font-bold leading-4 text-gray-800">{item.title}</span>
            {"amount" in item && (
                <span className="text-[10px] leading-4 text-gray-500">
                    {item.description}<RupeeIcon className="relative -top-px inline h-2.5 w-2.5" />{item.amount}{item.descriptionSuffix}
                </span>
            )}
        </button>
    );

    return (
        <div className="pnb-page flex min-h-screen flex-col bg-gray-50">
            <header className="pnb-page-header sticky top-0 z-20 flex items-center justify-between bg-primary p-4 text-primary-foreground shadow-md">
                <button onClick={() => router.back()} aria-label="Go back">
                    <ArrowLeft className="h-6 w-6 text-white" />
                </button>
                <h1 className="text-xl font-semibold">Send Money</h1>
                <Link href="/dashboard" aria-label="Home">
                    <Home className="h-6 w-6 text-white" />
                </Link>
            </header>

            <LocalDemoNotice />
            <main className="pnb-send-main flex-1 space-y-4 p-3 pb-8">
                <section className="rounded-2xl border border-rose-100 bg-white p-3 shadow-sm">
                    <div className="mb-3 flex items-center justify-between px-1">
                        <h2 className="text-sm font-bold text-gray-800">Send Money to</h2>
                        <Link href="/fund-transfer/beneficiary/list" className="text-xs font-semibold text-primary underline">Manage Payee</Link>
                    </div>
                    <div className="grid grid-cols-4 gap-1 sm:gap-2">
                        {primaryOptions.map(renderTransferTile)}
                        <div className="flex min-h-[122px] min-w-0 flex-col items-center justify-center gap-2 px-1 py-4 text-center opacity-80" aria-disabled="true">
                            <span className="grid h-[66px] w-[66px] place-items-center rounded-full bg-rose-50 text-primary shadow-sm"><Image src="/pnb-one-ui/payment-logos/ic_upi_logo.svg" alt="" width={40} height={40} unoptimized/></span>
                            <span className="line-clamp-2 text-[11px] font-bold leading-4 text-gray-800">UPI (Payments)</span>
                        </div>
                    </div>
                </section>

                {internationalOption && (
                    <section className="space-y-2">
                        <div className="px-1">
                            <h2 className="text-sm font-bold text-gray-800">Make International Payment</h2>
                            <p className="mt-0.5 text-[11px] text-gray-500">Send money through supported remittance services</p>
                        </div>
                        <div className="flex w-full items-center gap-3 rounded-2xl border border-rose-100 bg-white p-4 text-left shadow-sm opacity-80" aria-disabled="true">
                            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-700">
                                <Globe2 className="h-6 w-6" strokeWidth={1.8}/>
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-bold text-gray-800">Send Money Outside India</span>
                                <span className="mt-1 block text-xs leading-5 text-gray-500">Send up to USD 250,000 per financial year (April\u2013March) abroad.</span>
                            </span>
                            <ChevronRight className="h-5 w-5 shrink-0 text-gray-400"/>
                        </div>
                        <button
                            type="button"
                            disabled={internationalOption.href === "#"}
                            onClick={() => handleOptionClick(internationalOption.href)}
                            className="flex w-full items-center gap-3 rounded-2xl border border-rose-100 bg-white p-4 text-left shadow-sm transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-65"
                        >
                            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-700">
                                <internationalOption.icon className="h-6 w-6" strokeWidth={1.8} />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-bold text-gray-800">{internationalOption.title}</span>
                                <span className="mt-1 block text-xs leading-5 text-gray-500">{internationalOption.description}</span>
                            </span>
                            <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
                        </button>
                    </section>
                )}
                <section className="space-y-3">
                    <h2 className="px-1 text-sm font-bold text-gray-800">Others</h2>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { title: "Cardless Cash", Icon: Banknote, tone: "bg-rose-50 text-rose-700" },
                            { title: "To Other Sukanya Samriddhi Account", Icon: PiggyBank, tone: "bg-amber-50 text-amber-700" },
                            { title: "To PPF Account", Icon: Landmark, tone: "bg-emerald-50 text-emerald-700" }
                        ].map(({title, Icon, tone}) => (
                            <div key={title} className="flex min-h-[118px] min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-white px-2 py-3 text-center shadow-sm opacity-80" aria-disabled="true">
                                <span className={"grid h-12 w-12 place-items-center rounded-2xl " + tone}>
                                    <Icon className="h-6 w-6" strokeWidth={1.8}/>
                                </span>
                                <span className="text-[10px] font-bold leading-4 text-gray-700">{title}</span>
                            </div>
                        ))}
                    </div>
                </section>

            </main>
        </div>
    );
}
