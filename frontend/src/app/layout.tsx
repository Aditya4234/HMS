import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'HotelManager - Enterprise Hotel Management Platform',
  description: 'Automate bookings, manage rooms, streamline operations, and deliver exceptional guest experiences with our all-in-one hotel management platform.',
  keywords: ['hotel management', 'booking system', 'hotel ERP', 'property management', 'hotel software'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
