'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

type GlobalMenuItemProps = {
  href: string;
  text: string;
  iconName: string;
  isActive: boolean;
};

const GlobalMenuItem: React.FC<GlobalMenuItemProps> = ({
  href,
  text,
  iconName,
  isActive,
}) => {
  return (
    <li className="flex items-stretch relative">
      <Link
        href={href}
        className={`
          relative flex items-center gap-1 min-h-16 px-5 py-4
          font-bold text-dns-16B-130 no-underline
          focus-visible:outline focus-visible:outline-4 focus-visible:outline-black focus-visible:outline-offset-[calc(2/16*1rem)] focus-visible:rounded focus-visible:bg-yellow-300 focus-visible:shadow-[0_0_0_calc(2/16*1rem)_theme(colors.yellow.300)]
          ${
            isActive
              ? `bg-white text-blue-1000
                 after:absolute after:right-0 after:bottom-0 after:left-0 after:border-b-4 after:border-blue-900
                 hover:text-blue-900
                 focus-visible:bg-white`
              : `text-solid-gray-900
                 hover:bg-solid-gray-50
                 hover:after:absolute hover:after:right-0 hover:after:bottom-0 hover:after:left-0 hover:after:border-b-2 hover:after:border-black hover:after:content-['']`
          }
        `}
        aria-current={isActive ? 'page' : undefined}
      >
        <Image
          src={`/${iconName}_${isActive ? 'active' : 'inactive'}.svg`}
          alt=""
          width={24}
          height={24}
          className="shrink-0"
          priority
        />
        <span>{text}</span>
      </Link>
    </li>
  );
};

const navLinks = [
  { href: '/one-line-geocoding', text: 'テキスト入力', iconName: 'one_line' },
  { href: '/file-geocoding', text: 'ファイル入力', iconName: 'file' },
];

const Header: React.FC = () => {
  const pathname = usePathname();

  const isActiveLink = (href: string) =>
    href === '/one-line-geocoding'
      ? pathname === '/' || pathname === '/one-line-geocoding'
      : pathname === href;

  return (
    <header className="bg-white border-b border-solid-gray-420">
      <div className="flex flex-wrap md:flex-nowrap justify-items-start md:items-end md:justify-between mx-4 md:mx-20">
        <div className="w-full md:w-auto place-self-center text-center md:text-left py-4">
          <Link href="/" className="text-solid-gray-900 text-std-32B-150">
            {process.env.NEXT_PUBLIC_APP_TITLE}
          </Link>
        </div>
        <nav aria-label="グローバルメニュー">
          <ul className="flex items-stretch m-0 p-0 list-none text-solid-gray-900">
            {navLinks.map(link => (
              <GlobalMenuItem
                key={link.href}
                {...link}
                isActive={isActiveLink(link.href)}
              />
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
