"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, ChevronRight, BadgePercent, CalendarDays, LockKeyhole, ChartNoAxesCombined, Landmark, FileText, Building2, Wallet } from "lucide-react";

const products = [
  { title:"Open Fixed Deposit", description:"Save with a fixed deposit, subject to applicable rates and terms.", icon:BadgePercent, tone:"rose" },
  { title:"Open Recurring Deposit", description:"Build savings with regular deposits.", icon:CalendarDays, tone:"blue" },
  { title:"Apply IPO / ASBA", description:"Apply for eligible public issues through ASBA.", icon:LockKeyhole, tone:"yellow" },
  { title:"Demat & Trading Account", description:"Explore demat and trading account services.", icon:Building2, tone:"green" },
  { title:"Mutual Funds", description:"Explore mutual fund investment products.", icon:ChartNoAxesCombined, tone:"orange" },
  { title:"Invest / Apply Bank Products", description:"View banking products and application information.", icon:Landmark, tone:"rose" },
  { title:"Apply Online", description:"Explore online application services.", icon:FileText, tone:"blue" },
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
            <span className={"pnb-reference-list-icon "+tone[product.tone]}><Icon className="h-9 w-9" strokeWidth={1.6}/></span>
            <span className="min-w-0 flex-1"><span className="block text-[15px] font-semibold leading-5 text-gray-900">{product.title}</span><span className="mt-1 block text-xs leading-5 text-gray-500">{product.description}</span></span>
            <span className="pnb-reference-list-arrow" aria-hidden="true"><ChevronRight className="h-5 w-5"/></span>
          </article>;
        })}
        <p className="px-2 pb-2 text-[10px] leading-4 text-gray-400">Product applications and investment transactions are not enabled by these visual catalogue cards. Use a supported PNB-UPDATE workflow where available.</p>
      </main>
    </div>
  );
}
