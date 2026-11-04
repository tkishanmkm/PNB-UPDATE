'use client';

import React from 'react';
import Image from 'next/image';
import { useAppContext } from '@/hooks/use-app-store';
import type { IconAssets } from '@/lib/types';
import { isLocalImageSource } from '@/lib/local-image';

interface DynamicIconProps extends React.SVGProps<SVGSVGElement> {
  iconKey: keyof IconAssets;
  fallback: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

/** APK resources with a proven label/screen association. */
const APK_DEFAULT_ICON_SOURCES: Partial<Record<keyof IconAssets, string>> = {
  upi: '/pnb-one-ui/apk-mapped/dashboard/icons_postloginmidsection_upi.png',
  cardlessCash: '/pnb-one-ui/apk-mapped/send-money/icons_sendmoney_cardless.png',
  pnbShoppe: '/pnb-one-ui/apk-mapped/dashboard/icons_postloginbottombar_profile.png',
  offers: '/pnb-one-ui/apk-mapped/dashboard/icons_postloginbottombar_offers.png',
  scan: '/pnb-one-ui/apk-mapped/dashboard/icons_postloginbottombar_scan.png',
  creditCard: '/pnb-one-ui/apk-mapped/dashboard/icons_postloginbottombar_creditcard.png',
  emergency: '/pnb-one-ui/apk-mapped/dashboard/icons_postloginbottombar_emergency.png',
};

const DynamicIcon: React.FC<DynamicIconProps> = ({ iconKey, fallback: Fallback, className, ...props }) => {
  const { state } = useAppContext();
  const customIconSrc = state.settings.iconAssets?.[iconKey];
  const imageSource = isLocalImageSource(customIconSrc)
    ? customIconSrc
    : APK_DEFAULT_ICON_SOURCES[iconKey];

  if (imageSource) {
    return <Image src={imageSource} alt={`${iconKey} icon`} width={32} height={32} unoptimized className={className} />;
  }

  return <Fallback className={className} {...props} />;
};

export default DynamicIcon;
