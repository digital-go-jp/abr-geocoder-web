'use client';

import React from 'react';
import OneLineGeocoding from './one-line-geocoding/page';

/**
 * トップ画面のコンポーネント
 * @returns
 */
const Home = () => {
  return (
    <main>
      {/* 初期表示はテキスト入力 */}
      <OneLineGeocoding />
    </main>
  );
};

export default Home;
