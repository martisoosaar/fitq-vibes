import './globals.css';
import type { ReactNode } from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import ImpersonationBanner from '@/components/Layout/ImpersonationBanner';
import { AuthProvider } from '@/contexts/AuthContext';
import { Albert_Sans } from 'next/font/google';
import GoogleTagManager from '@/components/Analytics/GoogleTagManager';
import FacebookPixel from '@/components/Analytics/FacebookPixel';
import AsklyWidget from '@/components/Analytics/AsklyWidget';

export const metadata = {
  title: 'FitQ - Eesti suurim online treeningkeskkond',
  description: 'Treeni koos Eesti parimate treeneritega. Üle 500 treeningvideo, programmid, väljakutsed ja palju muud!',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  
  return (
    <html lang="et" className={albert.className}>
      <body className="bg-[#2c313a] text-white">
        <GoogleTagManager />
        <FacebookPixel />
        <AsklyWidget />
        <AuthProvider>
          <ImpersonationBanner />
          <Header />
          <main className="pt-20">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

const albert = Albert_Sans({ subsets: ['latin'], weight: ['400','700'] });
