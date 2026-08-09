'use client';

import React, { useEffect, useState } from 'react';
import { fetchApiInfo } from '../_lib/api';
import type { ApiInfo } from '../_lib/types';

/**
 * 応答しているAPIのバージョンと、そのAPIが収録するABRデータのバージョンを表示する。
 * 取得できるまでとAPIに届かないときは何も描画しない。バージョンは補足情報であり、
 * 出せないことを利用者に知らせても取れる行動がないため、エラーは表に出さない。
 */
const VersionBadge: React.FC = () => {
  const [apiInfo, setApiInfo] = useState<ApiInfo>();

  useEffect(() => {
    let mounted = true;

    fetchApiInfo()
      .then(fetched => {
        if (mounted) setApiInfo(fetched);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  if (!apiInfo?.version || !apiInfo?.db_version) return null;

  return (
    <span className="text-dns-14N-130 text-solid-gray-600">
      API {apiInfo.version} / DB {apiInfo.db_version}
    </span>
  );
};

export default VersionBadge;
