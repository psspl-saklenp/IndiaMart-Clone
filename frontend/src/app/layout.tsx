import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'indiamart-clone | B2B Marketplace',
    template: '%s | indiamart-clone',
  },
  description:
    'B2B marketplace connecting buyers and verified suppliers. Discover products, send inquiries, and grow your business.',
  applicationName: 'indiamart-clone',
  authors: [{ name: 'indiamart-clone' }],
  formatDetection: { email: false, address: false, telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ea580c',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[var(--color-ink-50)] text-[var(--color-ink-800)] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
