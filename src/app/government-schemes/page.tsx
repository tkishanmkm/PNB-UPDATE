"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, ChevronRight, Landmark, PiggyBank, ShieldCheck, Users, HeartHandshake, BadgeIndianRupee, CalendarDays } from "lucide-react";

const schemes = [
  { title: "Senior Citizens Savings Scheme", description: "Retirement savings option for eligible senior citizens.", icon: PiggyBank, tone: "rose" },
  { title: "Sukanya Samriddhi Account", description: "Long-term savings for a girl child's future.", icon: Users, tone: "blue" },
  { title: "Public Provident Fund", description: "Long-term savings with applicable tax benefits.", icon: Landmark, tone: "yellow" },
  { title: "Atal Pension Yojana", description: "Pension scheme with regular contributions.", icon: CalendarDays, tone: "green" },
  { title: "Pradhan Mantri Jeevan Jyoti Bima Yojana", description: "Life insurance scheme subject to eligibility and terms.", icon: ShieldCheck, tone: "orange" },
  { title: "Pradhan Mantri Suraksha Bima Yojana", description: "Accident insurance scheme subject to eligibility and terms.", icon: HeartHandshake, tone: "rose" },
  { title: "National Pension System", description: "Retirement planning through a market-linked pension scheme.", icon: BadgeIndianRupee, tone: "green" },
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
            <span className={"pnb-reference-list-icon "+tone[scheme.tone]}><Icon className="h-9 w-9" strokeWidth={1.6}/></span>
            <span className="min-w-0 flex-1"><span className="block text-[15px] font-semibold leading-5 text-gray-900">{scheme.title}</span><span className="mt-1 block text-xs leading-5 text-gray-500">{scheme.description}</span></span>
            <span className="pnb-reference-list-arrow" aria-hidden="true"><ChevronRight className="h-5 w-5"/></span>
          </article>;
        })}
        <p className="px-2 pb-2 text-[10px] leading-4 text-gray-400">Scheme availability, eligibility, rates and terms are determined by the applicable official scheme rules.</p>
      </main>
    </div>
  );
}
