/**
 * ジオコーディング結果を取得するAPIを実行する
 *
 * @param address 住所
 * @param format 出力形式
 * @param target 検索対象
 * @returns
 */
export const fetchGeocodeData = async (
  address: string,
  format: string,
  target: string
) => {
  return fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/geocode?address=${encodeURIComponent(address)}` +
      `${format ? `&format=${format}` : ''}` +
      `${target ? `&target=${target}` : ''}`,
    {
      method: 'GET',
      headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY ?? '' },
    }
  );
};
