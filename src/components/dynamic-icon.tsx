
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

const DynamicIcon: React.FC<DynamicIconProps> = ({ iconKey, fallback: Fallback, className, ...props }) => {
  const { state } = useAppContext();
  const customIconSrc = state.settings.iconAssets?.[iconKey];

  if (isLocalImageSource(customIconSrc)) {
    // Render an <img> tag if a custom icon source (data URI) is available.
    // The className is passed to allow for sizing from Tailwind classes.
    return <Image src={customIconSrc} alt={`${iconKey} icon`} width={32} height={32} unoptimized className={className} />;
  }

  // Otherwise, render the default fallback SVG component
  return <Fallback className={className} {...props} />;
};

export default DynamicIcon;
