"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft, Home, Search, ChevronDown,
  Send, ReceiptText, QrCode, BadgeCheck, Wallet, Smartphone,
  Users, Contact, CalendarDays, History, FileText,
  HeartHandshake, UserRound, Settings, Landmark, TrendingUp,
  BookOpen, Banknote, CircleHelp
} from "lucide-react";

type ServiceItem = {
  title: string;
  icon: LucideIcon;
  href?: string;
  tone?: string;
  image?: string;
};

const serviceGroups: { title: string; icon: LucideIcon; iconImage?: string; items: ServiceItem[] }[] = [
  { title: "Pay & Transfer", icon: Send, iconImage: "/pnb-one-ui/apk-mapped/service-categories/icons_allservices_pay.png", items: [
    { title: "Fund Transfer", icon: Send, href: "/fund-transfer", tone: "rose", image: "/pnb-one-ui/apk-mapped/service-icons/serviceicon_1.png" },
    { title: "Bill Payments", icon: ReceiptText, tone: "blue", image: "/pnb-one-ui/apk-mapped/service-icons/serviceicon_2.png" },
    { title: "Generate QR", icon: QrCode, tone: "green", image: "/pnb-one-ui/apk-mapped/service-icons/service-generate-qr.png" },
    { title: "Approve to Pay", icon: BadgeCheck, tone: "yellow", image: "/pnb-one-ui/apk-mapped/service-icons/service-approve-to-pay.png" },
    { title: "UPI", icon: Wallet, image: "/pnb-one-ui/apk-mapped/service-icons/serviceicon_3.png", tone: "green" },
    { title: "Pay to Mobile Number", icon: Smartphone, tone: "rose", image: "/pnb-one-ui/apk-mapped/service-icons/service-pay-to-mobile.png" },
    { title: "Manage Beneficiary", icon: Users, href: "/fund-transfer/beneficiary/list", tone: "blue", image: "/pnb-one-ui/apk-mapped/service-icons/serviceicon_4.png" },
    { title: "Pay to Contact", icon: Contact, tone: "yellow", image: "/pnb-one-ui/apk-mapped/service-icons/serviceicon_9.png" },
    { title: "Standing Instructions", icon: CalendarDays, tone: "blue", image: "/pnb-one-ui/apk-mapped/service-icons/serviceicon_10.png" },
    { title: "My Transactions", icon: History, href: "/account-statement", tone: "rose", image: "/pnb-one-ui/apk-mapped/service-icons/serviceicon_8.png" },
    { title: "View/Generate MMID", icon: FileText, tone: "green", image: "/pnb-one-ui/apk-mapped/service-icons/serviceicon_52.png" },
    { title: "Check IMPS Status", icon: BadgeCheck, tone: "yellow", image: "/pnb-one-ui/apk-mapped/service-icons/service-check-imps.png" },
    { title: "PM Care", icon: HeartHandshake, tone: "rose", image: "/pnb-one-ui/apk-mapped/service-icons/serviceicon_11.png" },
    { title: "Cardless Cash Withdrawal", icon: Banknote, tone: "blue", image: "/pnb-one-ui/apk-mapped/service-icons/serviceicon_6.png" },
  ]},
  { title: "Accounts & Services", icon: Landmark, items: [
    { title: "My Account", icon: UserRound, href: "/my-account", tone: "rose" },
    { title: "Account Details", icon: Landmark, href: "/saving-account-details", tone: "blue" },
    { title: "All Accounts", icon: Wallet, href: "/all-accounts", tone: "yellow" },
    { title: "Account Statement", icon: BookOpen, href: "/account-statement", tone: "green" },
    { title: "Contact Us", icon: HeartHandshake, href: "/contact-us", tone: "rose" },
    { title: "FAQs", icon: CircleHelp, href: "/faq", tone: "blue" },
  ]},
  { title: "Profile Settings", icon: UserRound, items: [
    { title: "Profile Settings", icon: UserRound, href: "/my-profile", tone: "rose" },
    { title: "App Settings", icon: Settings, href: "/settings", tone: "blue" },
  ]},
  { title: "Invest & Apply", icon: TrendingUp, items: [
    { title: "Invest", icon: TrendingUp, href: "/invest", tone: "yellow" },
    { title: "Government Schemes", icon: Landmark, href: "/government-schemes", tone: "green" },
  ]},
];

const tones: Record<string,string> = {
  rose: "bg-rose-50 text-[#ad153d]",
  blue: "bg-sky-50 text-sky-700",
  green: "bg-emerald-50 text-emerald-700",
  yellow: "bg-amber-50 text-amber-700",
};

export default function ServicesPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string>("Pay & Transfer");
  const groups = useMemo(() => serviceGroups.map(group => ({
    ...group,
    items: group.items.filter(item => item.title.toLowerCase().includes(query.trim().toLowerCase()))
  })).filter(group => group.items.length > 0), [query]);

  return (
    <div className="pnb-reference-screen min-h-screen">
      <section className="pnb-reference-screen-head">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} aria-label="Go back" className="pnb-reference-head-button"><ArrowLeft className="h-7 w-7"/></button>
          <span className="text-xs font-semibold tracking-wider text-white/80">PNB ONE</span>
          <Link href="/dashboard" aria-label="Home" className="pnb-reference-head-button"><Home className="h-7 w-7"/></Link>
        </div>
        <h1>Services</h1>
        <label className="pnb-service-search">
          <Search className="h-5 w-5 text-gray-400"/>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search services" aria-label="Search services"/>
        </label>
      </section>
      <main className="pnb-reference-screen-body space-y-4">
        {groups.map(group => {
          const GroupIcon = group.icon;
          const isOpen = query.trim().length > 0 || expanded === group.title;
          return (
            <section key={group.title} className="pnb-service-group">
              <button className="pnb-service-group-heading" onClick={() => setExpanded(isOpen && !query.trim() ? "" : group.title)} aria-expanded={isOpen}>
                <span className="pnb-service-group-icon">
                  {group.iconImage
                    ? <Image src={group.iconImage} alt="" width={48} height={48} unoptimized className="h-10 w-10 object-contain"/>
                    : <GroupIcon className="h-7 w-7"/>}
                </span>
                <span className="flex-1 text-left">{group.title}</span>
                <ChevronDown className={"h-6 w-6 text-primary transition-transform " + (isOpen ? "rotate-180" : "")}/>
              </button>
              {isOpen && <div className="grid grid-cols-4 gap-x-2 gap-y-4 px-3 pb-5 pt-2">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const content = <><span className={"pnb-service-tile-icon " + (tones[item.tone || "rose"])}>{item.image ? <Image src={item.image} alt="" width={34} height={34} unoptimized/> : <Icon className="h-7 w-7" strokeWidth={1.7}/>}</span><span className="pnb-service-tile-label">{item.title}</span></>;
                  return item.href
                    ? <Link key={item.title} href={item.href} className="pnb-service-tile">{content}</Link>
                    : <div key={item.title} className="pnb-service-tile pnb-service-tile-disabled" aria-disabled="true">{content}</div>;
                })}
              </div>}
            </section>
          );
        })}
        {groups.length === 0 && <div className="rounded-2xl bg-gray-50 p-8 text-center text-sm text-gray-500">No matching service was found.</div>}
      </main>
    </div>
  );
}
