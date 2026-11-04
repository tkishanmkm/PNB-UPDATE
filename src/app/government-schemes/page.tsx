"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, ChevronRight } from "lucide-react";

type Scheme = {
  title: string;
  description: string;
  image: string;
  tone: string;
};

const schemes: Scheme[] = [
  {
    title: "Senior Citizens Savings Scheme",
    description: "Retirement plan for Indian citizens aged 60+.",
    image: "/pnb-one-ui/apk-catalogue-icons/scheme-scss.png",
    tone: "rose",
  },
  {
    title: "Sukanya Samriddhi Account",
    description: "Create a secure future fund for your daughter's education and marriage.",
    image: "/pnb-one-ui/apk-catalogue-icons/scheme-sukanya.png",
    tone: "blue",
  },
  {
    title: "Public Provident Fund",
    description: "Long-term savings with assured returns and tax benefits (18–Unlimited years).",
    image: "/pnb-one-ui/apk-catalogue-icons/scheme-ppf.png",
    tone: "yellow",
  },
  {
    title: "Atal Pension Yojana",
    description: "Secure a steady pension after retirement with small monthly contributions.",
    image: "/pnb-one-ui/apk-catalogue-icons/scheme-apy.png",
    tone: "green",
  },
  {
    title: "Pradhan Mantri Jeevan Jyoti Bima Yojana",
    description: "Get affordable life insurance coverage to protect your family financially.",
    image: "/pnb-one-ui/apk-catalogue-icons/scheme-pmjjby.png",
    tone: "orange",
  },
  {
    title: "Pradhan Mantri Suraksha Bima Yojana",
    description: "Low-cost accident insurance for financial protection against disability or death.",
    image: "/pnb-one-ui/apk-catalogue-icons/scheme-pmsby.png",
    tone: "rose",
  },
  {
    title: "National Pension System",
    description: "Plan for retirement with a market-linked government scheme.",
    image: "/pnb-one-ui/apk-catalogue-icons/scheme-papl.png",
    tone: "green",
  },
];

const tone: Record<string, string> = {
  rose: "bg-rose-100 text-rose-600",
  blue: "bg-sky-100 text-sky-600",
  yellow: "bg-amber-100 text-amber-700",
  green: "bg-emerald-100 text-emerald-700",
  orange: "bg-orange-100 text-orange-600",
};

export default function GovernmentSchemesPage() {
  const router = useRouter();

  return (
    <div className="pnb-reference-screen min-h-screen">
      <header className="pnb-reference-title-head">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="pnb-reference-head-button"
          >
            <ArrowLeft className="h-7 w-7" />
          </button>
          <span className="text-xs font-semibold tracking-wider text-white/80">
            PNB ONE
          </span>
          <Link
            href="/dashboard"
            aria-label="Home"
            className="pnb-reference-head-button"
          >
            <Home className="h-7 w-7" />
          </Link>
        </div>
        <h1>Govt. Schemes</h1>
      </header>

      <main className="pnb-reference-screen-body space-y-3">
        {schemes.map(scheme => (
          <article key={scheme.title} className="pnb-reference-list-card">
            <span className={"pnb-reference-list-icon " + tone[scheme.tone]}>
              <Image
                src={scheme.image}
                alt=""
                width={42}
                height={42}
                unoptimized
                className="h-[42px] w-[42px] object-contain"
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block pnb-invest-title">{scheme.title}</span>
              <span className="block pnb-invest-description">
                {scheme.description}
              </span>
            </span>
            <span
              className={"pnb-reference-list-arrow " + tone[scheme.tone]}
              aria-hidden="true"
            >
              <ChevronRight className="h-4 w-4" />
            </span>
          </article>
        ))}
        <p className="px-2 pb-2 text-[10px] leading-4 text-gray-400">
          Scheme availability, eligibility, rates and terms are determined by the
          applicable official scheme rules. These cards do not submit applications.
        </p>
      </main>
    </div>
  );
}
