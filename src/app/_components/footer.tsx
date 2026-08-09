'use client';

import React from 'react';
import Link from 'next/link';
import VersionBadge from './version-badge';

type FooterLinkProps = {
  url: string;
  text: string;
};

const ExternalLinkIcon = () => (
  <svg
    aria-label="別ウィンドウで開く"
    className="shrink-0"
    fill="none"
    height="16"
    role="img"
    viewBox="0 0 16 16"
    width="16"
  >
    <path
      d="M14 9.5v4a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5h4V1h-4A1.5 1.5 0 0 0 1 2.5v11A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-4h-1Z"
      fill="currentColor"
    />
    <path
      d="M10 1v1h3.3L6.65 8.65l.7.7L14 2.72V6h1V1h-5Z"
      fill="currentColor"
    />
  </svg>
);

const FooterLink: React.FC<FooterLinkProps> = ({ url, text }) => {
  return (
    <Link
      href={url}
      className="inline-flex items-center gap-1 mr-6 text-solid-gray-800 text-dns-16N-130 underline hover:text-blue-900 hover:no-underline focus-visible:outline focus-visible:outline-4 focus-visible:outline-black focus-visible:outline-offset-2 focus-visible:rounded focus-visible:bg-yellow-300"
      target="_blank"
      rel="noopener noreferrer"
    >
      {text}
      <ExternalLinkIcon />
    </Link>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-white pt-4 mx-4 md:mx-20">
      <div className="flex flex-col md:flex-row md:flex-wrap items-start md:items-center gap-4 py-6 border-t border-solid-gray-300">
        <nav aria-label="フッターリンク" className="flex flex-wrap gap-y-2">
          {process.env.NEXT_PUBLIC_TOS_URL && (
            <FooterLink url={process.env.NEXT_PUBLIC_TOS_URL} text="利用規約" />
          )}
          {process.env.NEXT_PUBLIC_PRIVACY_URL && (
            <FooterLink
              url={process.env.NEXT_PUBLIC_PRIVACY_URL}
              text="プライバシーポリシー"
            />
          )}
        </nav>
        <div className="md:ml-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-dns-14N-130 text-solid-gray-600">
          <VersionBadge />
          <span>{process.env.NEXT_PUBLIC_COPYRIGHT}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
