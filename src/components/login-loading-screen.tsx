
'use client';

import React from 'react';
import { useAppContext } from '@/hooks/use-app-store';
import { PnbBrandImage } from "@/components/pnb-brand-image";


const LoadingAnimation = () => (
    <div className="flex items-center justify-center space-x-2">
        <div className="w-6 h-6 rounded-md bg-primary animate-square-loader" style={{ animationDelay: '0s' }}></div>
        <div className="w-6 h-6 rounded-md bg-accent animate-square-loader" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-6 h-6 rounded-md bg-primary animate-square-loader" style={{ animationDelay: '0.4s' }}></div>
        <div className="w-6 h-6 rounded-md bg-accent animate-square-loader" style={{ animationDelay: '0.6s' }}></div>
    </div>
);


export const LoginLoadingScreen = () => {
    const { state } = useAppContext();

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-8">
            <div className="flex flex-col items-center justify-center text-center space-y-6">
                 <PnbBrandImage
                    source={state.settings.appLogo}
                    width={150}
                    height={54}
                    alt="Punjab National Bank"
                    className="h-14 w-auto object-contain"
                />
                <LoadingAnimation />
                <p className="text-muted-foreground">Signing in...</p>
            </div>
        </div>
    );
};
