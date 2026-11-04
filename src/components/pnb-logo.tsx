import React from 'react';
import Image from 'next/image';
import { useAppContext } from '@/hooks/use-app-store';
import { isLocalImageSource } from '@/lib/local-image';

export const PNBLogo = ({ className }: { className?: string }) => {
  const { state } = useAppContext();
  const source = isLocalImageSource(state.settings.appLogo)
    ? state.settings.appLogo
    : '/pnb-splash/pnb-logo.png';

  return (
    <Image
      src={source}
      alt="Punjab National Bank"
      width={120}
      height={54}
      className={className}
      priority
      unoptimized
    />
  );
};
