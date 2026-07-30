/** ジオコーディングAPIのクエリパラメータ */
export type GeocodeParams = {
  /** 処理する住所 */
  address: string;
  /** 検索対象 (all/basic/rsdtdsp/parcel)。省略時はサーバーの enabled_category に従う */
  category?: string;
  /** 検索対象の都道府県コード。省略時はサーバーの enabled_pref に従う */
  pref?: string;
  /** 結果の最大数 (1〜5) */
  limit?: number;
};

/**
 * ジオコーディング結果を取得する。
 * エラーレスポンスは本文の message を載せた Error にする。APIは本文に message を
 * 返すが、経路上のプロキシなどJSON以外を返す相手もあるため、読めなければ
 * statusText で代替する。
 */
export const fetchGeocodeData = async ({
  address,
  category,
  pref,
  limit = 1,
}: GeocodeParams) => {
  const query = new URLSearchParams({ address, limit: String(limit) });
  if (category) query.set('category', category);
  if (pref) query.set('pref', pref);

  // 設定値の末尾のスラッシュはパスの二重スラッシュになるので落とす
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(
    /\/+$/,
    ''
  );

  const response = await fetch(`${baseUrl}/geocode?${query.toString()}`, {
    method: 'GET',
    headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY ?? '' },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => undefined);
    const detail = body?.message ?? response.statusText;
    throw new Error(`エラーコード: ${response.status}, エラー内容: ${detail}`);
  }

  return response.json();
};
