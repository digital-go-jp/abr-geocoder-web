/** ジオコーディング結果の型 */
export type GeocodingResult = {
  input: string;
  output: string;
  matching_level: number;
  lg_code: string;
  pref: string;
  city: string;
  machiaza: string;
  machiaza_id: string;
  blk_num: string;
  blk_id: string;
  rsdt_num: string;
  rsdt_id: string;
  rsdt_num2: string;
  rsdt2_id: string;
  prc_num1: string;
  prc_num2: string;
  prc_num3: string;
  prc_id: string;
  other: string;
  lat: number;
  lon: number;
};

// JSON指定のAPIレスポンスの型
export type ApiResponseAsJson = {
  query: {
    input: string;
  };
  result: {
    output: string;
    matching_level: number;
    lg_code: string;
    pref: string;
    city: string;
    machiaza: string;
    machiaza_id: string;
    blk_num: string;
    blk_id: string;
    rsdt_num: string;
    rsdt_id: string;
    rsdt_num2: string;
    rsdt2_id: string;
    prc_num1: string;
    prc_num2: string;
    prc_num3: string;
    prc_id: string;
    other: string;
    lat: number;
    lon: number;
  };
};

/** エラー情報型 */
export type ErrorInfo = {
  title: string;
  message: string;
  isApiError?: boolean;
};
