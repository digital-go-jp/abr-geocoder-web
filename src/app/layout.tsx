import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Noto_Sans_JP } from 'next/font/google';
import './globals.css';
import Footer from './_components/footer';
import Header from './_components/header';

const notoSansJP = Noto_Sans_JP({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_TITLE,
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="jp" className="overflow-y-scroll">
      <body className={`${notoSansJP.className} flex flex-col min-h-screen`}>
        <Header />
        <div>{children}</div>
        <Footer />
      </body>
    </html>
  );
}
