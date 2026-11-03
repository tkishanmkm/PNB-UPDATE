"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft, Home, ChevronUp, User, KeyRound, ShieldCheck, Fingerprint,
  XCircle, Landmark, FileText, Wallet, BadgePercent,
  SlidersHorizontal, Eye, Gift, ArrowLeftRight, FileX, Headphones, Settings
} from "lucide-react";

type ProfileItem = { title: string; icon: LucideIcon; href: string };

const profileOptions: ProfileItem[] = [
  { title: "Change MPIN", icon: KeyRound, href: "#" },
  { title: "Set/Reset TPIN", icon: ShieldCheck, href: "/settings?tab=account" },
  { title: "Enable Biometrics", icon: Fingerprint, href: "#" },
  { title: "De-activation", icon: XCircle, href: "#" },
  { title: "Set User ID", icon: User, href: "/settings" },
  { title: "Set Account Nickname", icon: User, href: "#" },
  { title: "Check KYC Status", icon: ShieldCheck, href: "#" },
  { title: "Promotional Content Preference", icon: BadgePercent, href: "#" },
];

const accountOptions: ProfileItem[] = [
  { title: "Modify Account Access", icon: User, href: "/my-account" },
  { title: "Set Limits", icon: SlidersHorizontal, href: "#" },
  { title: "Safety Ring", icon: ShieldCheck, href: "#" },
  { title: "Quick View Balance", icon: Eye, href: "/saving-account-details" },
  { title: "Reward Points", icon: Gift, href: "#" },
  { title: "My Transaction", icon: ArrowLeftRight, href: "/account-statement" },
  { title: "E-Statement Registration", icon: FileText, href: "#" },
  { title: "E-Statement Deregistration", icon: FileX, href: "#" },
  { title: "My Account", icon: User, href: "/my-account" },
  { title: "Account Statement", icon: FileText, href: "/account-statement" },
  { title: "All Accounts", icon: Wallet, href: "/all-accounts" },
  { title: "Contact Us", icon: Headphones, href: "/contact-us" },
  { title: "App Settings", icon: Settings, href: "/settings" },
];

function ProfileTile({ item, index }: { item: ProfileItem; index: number }) {
  const Icon = item.icon;
  const tile = (
    <>
      <span className="pnb-profile-tile-icon"><Icon className="h-8 w-8" strokeWidth={1.65}/></span>
      <span className="pnb-profile-tile-label">{item.title}</span>
    </>
  );
  return item.href === "#"
    ? <div key={item.title + index} className="pnb-profile-tile pnb-profile-tile-disabled" aria-disabled="true">{tile}</div>
    : <Link key={item.title + index} href={item.href} className="pnb-profile-tile">{tile}</Link>;
}

export default function MyProfilePage() {
  const router = useRouter();
  const renderGroup = (title: string, group: ProfileItem[], GroupIcon: LucideIcon, tone: "rose" | "blue") => (
    <section className="pnb-profile-section">
      <header className="pnb-profile-section-header">
        <span className={"pnb-profile-section-icon pnb-profile-section-" + tone}><GroupIcon className="h-9 w-9" strokeWidth={1.6}/></span>
        <h2>{title}</h2>
        <ChevronUp className="h-6 w-6 shrink-0 text-primary"/>
      </header>
      <div className="grid grid-cols-4 gap-x-2 gap-y-4 px-3 pb-5 pt-2">
        {group.map((item,index) => <ProfileTile key={item.title+index} item={item} index={index}/>)}
      </div>
    </section>
  );

  return (
    <div className="pnb-page flex min-h-screen flex-col bg-gray-50">
      <header className="pnb-page-header bg-primary text-primary-foreground sticky top-0 z-20 flex items-center justify-between p-4 shadow-md">
        <button onClick={() => router.back()} aria-label="Go back"><ArrowLeft className="h-6 w-6 text-white"/></button>
        <h1 className="text-xl font-semibold">Profile Settings</h1>
        <Link href="/dashboard" aria-label="Home"><Home className="h-6 w-6 text-white"/></Link>
      </header>
      <main className="pnb-profile-main flex-1 space-y-3 p-3 pb-8">
        {renderGroup("Profile Settings",profileOptions,User,"rose")}
        {renderGroup("Account Related Settings",accountOptions,Landmark,"blue")}
      </main>
    </div>
  );
}
