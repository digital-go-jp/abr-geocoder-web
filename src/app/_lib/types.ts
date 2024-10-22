/** エラー情報型 */
export type ErrorInfo = {
  title: string;
  message: string;
  isApiError?: boolean;
};

/** フォーム値の型 */
export type FormValues = {
  address: string;
  target: 'all' | 'residential' | 'parcel';
  format: 'table' | 'csv' | 'json' | 'geojson';
};

/** ジオコーディング結果の型 */
type TableRecord = {
  [key: string]: string;
};

export type GeocodingResult = {
  table: TableRecord[];
  others: string;
};
