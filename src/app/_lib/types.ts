/** エラー情報型 */
export type ErrorInfo = {
  title: string;
  message: string;
  isApiError?: boolean;
};

/** GeoJSON Feature型 */
export type GeoJSONFeature = {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: Record<string, unknown>;
};

/** ジオコーディングAPIのレスポンス型 */
export type GeocodeResult = {
  features: GeoJSONFeature[];
};

/** ジオコーディング結果の行型 */
export type GeocodingResultRow = Record<string, string | number>;
