"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, ChevronRight, BadgePercent, CalendarDays, LockKeyhole, ChartNoAxesCombined, Landmark, FileText, Building2, Wallet } from "lucide-react";

const products = [
  { title:"Open Fixed Deposit", description:"Save easily with fixed deposits, assured returns and flexible terms.", icon:BadgePercent, tone:"rose" },
  { title:"Open Recurring Deposit", description:"Start saving regularly and enjoy attractive returns with easy access.", icon:CalendarDays, tone:"blue" },
  { title:"Apply IPO/ASBA", description:"Authorization to block the application money in the bank account.", icon:LockKeyhole, tone:"yellow" },
  { title:"Demat & Trading Account", description:"Open and manage directly.", icon:Building2, tone:"green" },
  { title:"Mutual Funds", description:"Invest in schemes from top mutual fund companies.", icon:ChartNoAxesCombined, tone:"orange" },
  { title:"Invest / Apply Bank Products", description:"Raise a request to get a callback from the bank before investing.", icon:Landmark, tone:"rose" },
  { title:"Apply Online", description:"Apply/invest online.", icon:FileText, tone:"blue" },
  { title:"RBI Retail Direct", description:"Explore government securities through RBI Retail Direct.", icon:Wallet, tone:"yellow" },
];
const tone: Record<string,string> = { rose:"bg-rose-100 text-rose-600", blue:"bg-sky-100 text-sky-600", yellow:"bg-amber-100 text-amber-700", green:"bg-emerald-100 text-emerald-700", orange:"bg-orange-100 text-orange-600" };

export default function InvestPage() {
  const router=useRouter();
  return (
    <div className="pnb-reference-screen min-h-screen">
      <header className="pnb-reference-title-head">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} aria-label="Go back" className="pnb-reference-head-button"><ArrowLeft className="h-7 w-7"/></button>
          <span className="text-xs font-semibold tracking-wider text-white/80">PNB ONE</span>
          <Link href="/dashboard" aria-label="Home" className="pnb-reference-head-button"><Home className="h-7 w-7"/></Link>
        </div>
        <h1>Invest</h1>
      </header>
      <main className="pnb-reference-screen-body space-y-3">
        {products.map((product) => {
          const Icon=product.icon;
          return <article key={product.title} className="pnb-reference-list-card">
            <span className={"pnb-reference-list-icon "+tone[product.tone]}><Icon className="h-8 w-8" strokeWidth={1.6}/></span>
            <span className="min-w-0 flex-1"><span className="block pnb-invest-title">{product.title}</span><span className="block pnb-invest-description">{product.description}</span></span>
            <span className="pnb-reference-list-arrow" aria-hidden="true"><ChevronRight className="h-4 w-4"/></span>
          </article>;
        })}
        <p className="px-2 pb-2 text-[10px] leading-4 text-gray-400">Product applications and investment transactions are not enabled by these visual catalogue cards. Use a supported PNB-UPDATE workflow where available.</p>
      </main>
    </div>
  );
}
