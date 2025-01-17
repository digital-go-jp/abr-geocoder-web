import React from 'react';
import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import './globals.css';
import Footer from './_components/footer';
import Header from './_components/header';

const inter = Noto_Sans_JP({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_TITLE,
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // スクロールが表示・非表示のタイミングでずれるようにみえるので常に表示にする
    <html lang="jp" className="overflow-y-scroll">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Header />
        <div>{children}</div>
        <Footer />
      </body>
    </html>
  );
}
