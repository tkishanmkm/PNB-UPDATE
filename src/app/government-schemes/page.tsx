"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, ChevronRight, Landmark, PiggyBank, ShieldCheck, Users, HeartHandshake, BadgeIndianRupee, CalendarDays } from "lucide-react";

const schemes = [
  { title: "Senior Citizens Savings Scheme", description: "Retirement plan for Indian citizens aged 60+.", icon: PiggyBank, tone: "rose" },
  { title: "Sukanya Samriddhi Account", description: "Create a secure future fund for your daughter's education and marriage.", icon: Users, tone: "blue" },
  { title: "Public Provident Fund", description: "Long-term savings with assured returns and tax benefits (18?Unlimited years).", icon: Landmark, tone: "yellow" },
  { title: "Atal Pension Yojana", description: "Secure a steady pension after retirement with small monthly contributions.", icon: CalendarDays, tone: "green" },
  { title: "Pradhan Mantri Jeevan Jyoti Bima Yojana", description: "Get affordable life insurance coverage to protect your family financially.", icon: ShieldCheck, tone: "orange" },
  { title: "Pradhan Mantri Suraksha Bima Yojana", description: "Low-cost accident insurance for financial protection against disability or death.", icon: HeartHandshake, tone: "rose" },
  { title: "National Pension System", description: "Plan for retirement with a market-linked government scheme.", icon: BadgeIndianRupee, tone: "green" },
];
const tone: Record<string,string> = { rose:"bg-rose-100 text-rose-600", blue:"bg-sky-100 text-sky-600", yellow:"bg-amber-100 text-amber-700", green:"bg-emerald-100 text-emerald-700", orange:"bg-orange-100 text-orange-600" };

export default function GovernmentSchemesPage() {
  const router = useRouter();
  return (
    <div className="pnb-reference-screen min-h-screen">
      <header className="pnb-reference-title-head">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} aria-label="Go back" className="pnb-reference-head-button"><ArrowLeft className="h-7 w-7"/></button>
          <span className="text-xs font-semibold tracking-wider text-white/80">PNB ONE</span>
          <Link href="/dashboard" aria-label="Home" className="pnb-reference-head-button"><Home className="h-7 w-7"/></Link>
        </div>
        <h1>Govt. Schemes</h1>
      </header>
      <main className="pnb-reference-screen-body space-y-3">
        {schemes.map((scheme) => {
          const Icon=scheme.icon;
          return <article key={scheme.title} className="pnb-reference-list-card">
            <span className={"pnb-reference-list-icon "+tone[scheme.tone]}><Icon className="h-8 w-8" strokeWidth={1.6}/></span>
            <span className="min-w-0 flex-1"><span className="block pnb-invest-title">{scheme.title}</span><span className="block pnb-invest-description">{scheme.description}</span></span>
            <span className={"pnb-reference-list-arrow "+tone[scheme.tone]} aria-hidden="true"><ChevronRight className="h-4 w-4"/></span>
          </article>;
        })}
        <p className="px-2 pb-2 text-[10px] leading-4 text-gray-400">Scheme availability, eligibility, rates and terms are determined by the applicable official scheme rules.</p>
      </main>
    </div>
  );
}
