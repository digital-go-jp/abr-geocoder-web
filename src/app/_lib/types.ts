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

/**
 * ルートが返すAPIの情報型。
 * APIのバージョンはルートでは version、ジオコーディング結果の result_info では
 * api_version という名前で返る。
 */
export type ApiInfo = {
  /** APIのバージョン */
  version?: string;
  /** 収録しているABRデータのバージョン */
  db_version?: string;
};
