'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type FooterLinkProps = {
  url: string;
  text: string;
};

const FooterLink: React.FC<FooterLinkProps> = ({ url, text }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <Link href={url} className="text-center" target="_blank" rel="noopener noreferrer">
      <div
        className="flex h-full content-center items-center xs:justify-center mr-4"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={`text-l pr-2 ${isHovered ? 'text-main-900' : 'text-main-800'}`}>
          {text}
        </div>
        <div>
          <Image
            src={isHovered ? "/link_hovered.svg" : "/link.svg"}
            alt=""
            width={16}
            height={20}
            priority
          />
        </div>
      </div>
    </Link>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto grid gap-4 grid-cols-12 contents-grid-margin-x bg-white pt-4">
      <div className="mt-10 flex xs:block xs:justify-self-center contents-grid-span-start mb-6 text-main-800">
        {process.env.NEXT_PUBLIC_TOS_URL && (
          <FooterLink url={process.env.NEXT_PUBLIC_TOS_URL} text="利用規約" />
        )}
        {process.env.NEXT_PUBLIC_PRIVACY_URL && (
          <FooterLink url={process.env.NEXT_PUBLIC_PRIVACY_URL} text="プライバシーポリシー" />
        )}
        <div className="ml-auto text-m text-sumi-600">
          {process.env.NEXT_PUBLIC_COPYRIGHT}
        </div>
      </div>
    </footer>
  );
};

export default Footer;