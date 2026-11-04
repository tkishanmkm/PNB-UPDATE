import React from "react";
import { useAppContext } from "@/hooks/use-app-store";
import { PnbBrandImage } from "@/components/pnb-brand-image";

export const PNBLogo = ({ className }: { className?: string }) => {
  const { state } = useAppContext();

  return (
    <PnbBrandImage
      source={state.settings.appLogo}
      alt="Punjab National Bank"
      width={120}
      height={54}
      className={className}
      priority
    />
  );
};