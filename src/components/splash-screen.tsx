"use client";

import React from "react";
import Image from "next/image";

/**
 * Original PNB ONE 4.43 splash composition extracted from the supplied APK.
 * This is a single source image, not a redrawn approximation.
 */
export const SplashScreen = () => (
  <main
    aria-label="PNB ONE loading"
    className="fixed inset-0 z-[200] grid h-[100dvh] w-full place-items-center overflow-hidden bg-white"
  >
    <Image
      src="/pnb-one-ui/apk-mapped/splash/assets_pnb_splashscreen_final.png"
      alt="PNB ONE splash screen"
      width={1284}
      height={2778}
      priority
      unoptimized
      className="h-full w-full object-contain"
    />
  </main>
);
