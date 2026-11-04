"use client";

import React, { useState } from "react";
import Image from "next/image";
import { isLocalImageSource } from "@/lib/local-image";

type PnbBrandImageProps = {
  source?: string | null;
  alt?: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
};

/**
 * Prefer the user's locally configured PNB logo, but recover to the bundled
 * repository logo if a saved data URL is stale, truncated, or undecodable.
 * No external image URL is ever requested.
 */
export function PnbBrandImage({
  source,
  alt = "Punjab National Bank",
  width,
  height,
  className,
  priority = false,
}: PnbBrandImageProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const preferredSource = isLocalImageSource(source)
    ? source
    : "/pnb-splash/pnb-logo.png";
  const resolvedSource =
    preferredSource === failedSource
      ? "/pnb-splash/pnb-logo.png"
      : preferredSource;

  return (
    <Image
      src={resolvedSource}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      unoptimized
      onError={() => {
        if (resolvedSource !== "/pnb-splash/pnb-logo.png") {
          setFailedSource(resolvedSource);
        }
      }}
    />
  );
}