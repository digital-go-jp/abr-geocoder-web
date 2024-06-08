'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Footerコンポーネント
 * @returns
 */
const Footer = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <footer className="mt-auto grid gap-4 grid-cols-12 contents-grid-margin-x bg-white pt-4">
      <div
        className="mt-10 flex xs:block xs:justify-self-center contents-grid-span-start mb-6
       text-main-800"
      >
        <Link
          href={process.env.NEXT_PUBLIC_TOS_URL || ''}
          className="text-center"
          target="_blank"
        >
          {/* 利用規約と画像どちらをhoverしてもどちらも色変えたいので、mouseenter,mouseleaveを使ってisHoveredのstateで制御 */}
          <div
            className="flex h-full content-center items-center xs:justify-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className={`text-l pr-2 ${isHovered ? 'text-main-900' : 'text-main-800'}`}
            >
              利用規約
            </div>
            <div>
              {isHovered ? (
                <Image
                  src="./link_hovered.svg"
                  alt="file"
                  width="16"
                  height="20"
                  priority
                />
              ) : (
                <Image
                  src="./link.svg"
                  alt="file"
                  width="16"
                  height="20"
                  priority
                />
              )}
            </div>
          </div>
        </Link>
        <div className="ml-auto text-m text-sumi-600">
          {process.env.NEXT_PUBLIC_COPYRIGHT}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
