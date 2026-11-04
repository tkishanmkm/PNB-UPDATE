"use client";

import Link from "next/link";
import { ArrowLeft, UserRound, MessageSquare, ShieldCheck, CreditCard, KeyRound, CheckCircle2 } from "lucide-react";
import { LocalDemoNotice } from "@/components/local-demo-notice";

const registrationSteps = [
  { title: "Choose NEW USER", detail: "Start the registration journey from the PNB ONE login screen.", icon: UserRound },
  { title: "Enter Customer ID", detail: "Use the Customer ID printed on the front page of your passbook.", icon: MessageSquare },
  { title: "Verify OTP", detail: "Enter the OTP sent for the registered mobile-number verification step.", icon: ShieldCheck },
  { title: "Verify debit card and account", detail: "Provide the debit-card details and linked account number requested by the bank flow.", icon: CreditCard },
  { title: "Set your password", detail: "Create the password, then return to login with the registered credentials.", icon: KeyRound },
];

export default function RegistrationPage() {
  return (
    <div className="pnb-page flex min-h-screen flex-col bg-gray-50">
      <header className="pnb-page-header sticky top-0 z-20 flex items-center justify-between bg-primary p-4 text-primary-foreground shadow-md">
        <Link href="/" aria-label="Back to login" className="inline-flex h-10 w-10 items-center justify-center rounded-xl">
          <ArrowLeft className="h-6 w-6 text-white" />
        </Link>
        <h1 className="text-lg font-semibold">New User Registration</h1>
        <Link href="/" aria-label="Login" className="text-sm font-semibold text-white">Login</Link>
      </header>

      <main className="flex-1 space-y-4 p-4 pb-10">
        <LocalDemoNotice />
        <section className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-primary">
              <UserRound className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-primary">PNB ONE 4.43</p>
              <h2 className="text-lg font-bold text-gray-900">Register for mobile banking</h2>
            </div>
          </div>
          <p className="text-sm leading-6 text-gray-600">
            The APK help text describes this existing-customer registration sequence. This page records the verified steps only; it does not collect card details, passwords or OTPs.
          </p>
        </section>

        <section className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-gray-900">Registration steps</h2>
          <ol className="space-y-4">
            {registrationSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="flex gap-3">
                  <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-rose-50 text-primary">
                    <Icon className="h-5 w-5" />
                    <span className="absolute -left-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">{index + 1}</span>
                  </span>
                  <span className="min-w-0 flex-1 pt-0.5">
                    <span className="block text-sm font-bold text-gray-900">{step.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-gray-600">{step.detail}</span>
                  </span>
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-rose-300" />
                </li>
              );
            })}
          </ol>
        </section>

        <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">
          Visual reference only. No bank endpoint is called and no registration, OTP verification, debit-card validation or password creation is performed in PNB-UPDATE.
        </p>
        <Link href="/" className="block rounded-xl bg-primary px-4 py-3 text-center text-sm font-bold text-white shadow-sm">
          Back to MPIN Login
        </Link>
      </main>
    </div>
  );
}
