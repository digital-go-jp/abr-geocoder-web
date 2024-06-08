'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Header コンポーネント
 * @returns
 */
const Header = () => {
  const pathname = usePathname();
  return (
    <header className="bg-white border-b border-sumi-500 h-20 xs:h-24 border-solid content-center">
      <nav
        className="flex xs:flex-wrap justify-items-start
        l:items-center m:items-center l:justify-between m:justify-between
        h-full contents-grid-margin-x"
        aria-label={process.env.NEXT_PUBLIC_APP_TITLE}
      >
        <div className="xs:w-full place-self-center xs:text-center">
          <Link href="/" className=" text-sumi-900 text-heading-m-bold">
            {process.env.NEXT_PUBLIC_APP_TITLE}
          </Link>
        </div>
        <div className={'h-full xs:h-auto ml-auto xs:ml-auto text-sumi-900'}>
          <Link
            href="/one-line-geocoding"
            className={`text-button ${pathname === '/one-line-geocoding' || pathname === '/' ? 'text-main-900 ' : 'text-sumi-900'}`}
          >
            <div className="flex h-full items-center place-content-center px-6 xs:py-2">
              <div>
                {pathname === '/one-line-geocoding' || pathname === '/' ? (
                  <Image
                    src="./one_line_active.svg"
                    alt="one_line"
                    width="16"
                    height="20"
                    priority
                  />
                ) : (
                  <Image
                    src="./one_line_inactive.svg"
                    alt="one_line"
                    width="16"
                    height="20"
                    priority
                  />
                )}
              </div>
              <div className="ml-2">テキスト入力</div>
            </div>
          </Link>
          {/* 下線をメニューの要素にそのままつけると、文字が上にずれるので別途ボーダー用の要素作成 */}
          {(pathname === '/one-line-geocoding' || pathname === '/') && (
            <div className="relative -top-1 border-b-4 border-solid border-main-900"></div>
          )}
        </div>
        <div className={'h-full xs:h-auto xs:mr-auto text-sumi-900'}>
          <Link
            href="/file-geocoding"
            className={`text-button ${pathname === '/file-geocoding' ? 'text-main-900 ' : 'text-sumi-900'}`}
          >
            <div className="flex h-full items-center place-content-center px-6 xs:py-2">
              <div>
                {pathname === '/file-geocoding' ? (
                  <Image
                    src="./file_active.svg"
                    alt="file"
                    width="16"
                    height="20"
                    priority
                  />
                ) : (
                  <Image
                    src="./file_inactive.svg"
                    alt="file"
                    width="16"
                    height="20"
                    priority
                  />
                )}
              </div>
              <div className="ml-2">ファイル入力</div>
            </div>
          </Link>
          {pathname === '/file-geocoding' && (
            <div className="relative -top-1 border-b-4 border-solid border-main-900"></div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
