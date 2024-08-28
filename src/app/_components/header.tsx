'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

type NavLinkProps = {
  href: string;
  text: string;
  iconName: string;
  isActive: boolean;
};

const NavLink: React.FC<NavLinkProps> = ({
  href,
  text,
  iconName,
  isActive,
}) => {
  const textColorClass = isActive ? 'text-main-900' : 'text-sumi-900';

  return (
    <div className={`h-full xs:h-auto ${textColorClass}`}>
      <Link href={href} className={`text-button ${textColorClass}`}>
        <div className="flex h-full items-center place-content-center px-6 xs:py-2">
          <Image
            src={`/${iconName}_${isActive ? 'active' : 'inactive'}.svg`}
            alt=""
            width={16}
            height={20}
            priority
          />
          <span className="ml-2">{text}</span>
        </div>
      </Link>
      {isActive && (
        <div className="relative -top-1 border-b-4 border-solid border-main-900"></div>
      )}
    </div>
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
    <header className="bg-white border-b border-sumi-500 h-20 xs:h-24 border-solid content-center">
      <nav
        className="flex xs:flex-wrap justify-items-start l:items-center m:items-center l:justify-between m:justify-between h-full contents-grid-margin-x"
        aria-label={process.env.NEXT_PUBLIC_APP_TITLE}
      >
        <div className="xs:w-full place-self-center xs:text-center">
          <Link href="/" className="text-sumi-900 text-heading-m-bold">
            {process.env.NEXT_PUBLIC_APP_TITLE}
          </Link>
        </div>
        <div className="flex h-full xs:h-auto ml-auto xs:ml-0 xs:mr-auto">
          {navLinks.map(link => (
            <NavLink
              key={link.href}
              {...link}
              isActive={isActiveLink(link.href)}
            />
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Header;
