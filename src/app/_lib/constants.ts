/** ファイル入力をプレビュー表示する際の最大行数 */
export const FILE_PREVIEW_MAX_LINE = 5 as const;

export const OUTPUT_FORMAT = {
  TABLE: 'table',
  CSV: 'csv',
  JSON: 'json',
  GEO_JSON: 'geojson',
  ND_JSON: 'ndjson',
  ND_GEO_JSON: 'ndgeojson',
} as const;
