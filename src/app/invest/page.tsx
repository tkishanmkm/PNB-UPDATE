"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, ChevronRight } from "lucide-react";

type InvestProduct = {
  title: string;
  description: string;
  image: string;
  tone: string;
};

const products: InvestProduct[] = [
  {
    title: "Open Fixed Deposit",
    description: "Save easily with fixed deposits, assured returns and flexible terms.",
    image: "/pnb-one-ui/apk-catalogue-icons/invest-open-fd.png",
    tone: "rose",
  },
  {
    title: "Open Recurring Deposit",
    description: "Start saving regularly and enjoy attractive returns with easy access.",
    image: "/pnb-one-ui/apk-catalogue-icons/invest-open-rd.png",
    tone: "blue",
  },
  {
    title: "Apply IPO/ASBA",
    description: "Authorization to block the application money in the bank account.",
    image: "/pnb-one-ui/apk-catalogue-icons/invest-asba.png",
    tone: "yellow",
  },
  {
    title: "Demat & Trading Account",
    description: "Open and manage directly.",
    image: "/pnb-one-ui/apk-catalogue-icons/invest-demat.png",
    tone: "green",
  },
  {
    title: "Mutual Funds",
    description: "Invest in schemes from top mutual fund companies.",
    image: "/pnb-one-ui/apk-catalogue-icons/invest-mutual-funds.png",
    tone: "orange",
  },
  {
    title: "Invest / Apply Bank Products",
    description: "Raise a request to get a callback from the bank before investing.",
    image: "/pnb-one-ui/apk-catalogue-icons/invest-bank-products.png",
    tone: "rose",
  },
  {
    title: "Apply Online",
    description: "Apply/invest online.",
    image: "/pnb-one-ui/apk-catalogue-icons/invest-online.png",
    tone: "blue",
  },
  {
    title: "RBI Retail Direct",
    description: "Explore government securities through RBI Retail Direct.",
    image: "/pnb-one-ui/apk-catalogue-icons/invest-rbi-retail-direct.png",
    tone: "yellow",
  },
];

const tone: Record<string, string> = {
  rose: "bg-rose-100 text-rose-600",
  blue: "bg-sky-100 text-sky-600",
  yellow: "bg-amber-100 text-amber-700",
  green: "bg-emerald-100 text-emerald-700",
  orange: "bg-orange-100 text-orange-600",
};

export default function InvestPage() {
  const router = useRouter();
  const [fdRdOnly, setFdRdOnly] = useState(false);

  useEffect(() => {
    // The APK Invest header explicitly supports pageParams.mode="fdrd_only".
    // This local presentation mode does not open or submit a deposit request.
    const params = new URLSearchParams(window.location.search);
    setFdRdOnly(params.get("mode") === "fdrd_only");
  }, []);

  const visibleProducts = fdRdOnly
    ? products.filter(product =>
        product.title === "Open Fixed Deposit" ||
        product.title === "Open Recurring Deposit",
      )
    : products;

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
        <h1>{fdRdOnly ? "Open FD/RD" : "Invest"}</h1>
      </header>

      <main className="pnb-reference-screen-body space-y-3">
        {visibleProducts.map(product => (
          <article key={product.title} className="pnb-reference-list-card">
            <span className={"pnb-reference-list-icon " + tone[product.tone]}>
              <Image
                src={product.image}
                alt=""
                width={42}
                height={42}
                unoptimized
                className="h-[42px] w-[42px] object-contain"
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block pnb-invest-title">{product.title}</span>
              <span className="block pnb-invest-description">
                {product.description}
              </span>
            </span>
            <span className="pnb-reference-list-arrow" aria-hidden="true">
              <ChevronRight className="h-4 w-4" />
            </span>
          </article>
        ))}
        <p className="px-2 pb-2 text-[10px] leading-4 text-gray-400">
          These catalogue entries are visual references only. Product applications,
          investment orders and bank requests are not submitted from this local app.
        </p>
      </main>
    </div>
  );
}
