import type { Metadata } from 'next';
import './globals.css';
import { AuthSessionProvider } from '@/context/AuthSessionProvider';
import { DownloadBasketProvider } from '@/context/DownloadBasketContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DownloadBasket } from '@/components/basket/DownloadBasket';
import { ZenithChatWidget } from '@/components/ai/ZenithChatWidget';

export const metadata: Metadata = {
  title: 'Zenith Software Hub | Games, Apps & Developer Tools Download Platform',
  description:
    'Commercial software and computer games download platform. Verified high-speed CDN delivery, isolated user history, and AI-grounded discovery.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 antialiased min-h-screen flex flex-col selection:bg-cyan-500 selection:text-slate-950">
        <AuthSessionProvider>
          <DownloadBasketProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            {/* Global Multi-Select Bulk Download Basket Drawer & Floating Dock */}
            <DownloadBasket />
            {/* Global AI Chatbot Floating Widget */}
            <ZenithChatWidget />
          </DownloadBasketProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
