
import type { Metadata } from 'next';
import Script from 'next/script';
import { AuthProvider } from '@/components/auth-provider';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';

export const metadata: Metadata = {
  title: 'PNB ONE — Local Data Manager',
  description: 'A local browser-based PNB ONE interface reconstruction. Not connected to live bank systems.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="safari-compatibility-polyfills" strategy="beforeInteractive">{`
          if (typeof Promise.withResolvers !== 'function') {
            Promise.withResolvers = function () {
              var resolve, reject;
              var promise = new Promise(function (res, rej) { resolve = res; reject = rej; });
              return { promise: promise, resolve: resolve, reject: reject };
            };
          }
        `}</Script>
      </head>
      <body className="font-body antialiased">
        <div className="max-w-md mx-auto bg-background">
          <AuthProvider>
              {children}
            <Toaster />
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
