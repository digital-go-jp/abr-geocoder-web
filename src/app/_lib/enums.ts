/**
 * ファイル入力においての各ステップの状態
 */
export enum ProcessStep {
  ERROR = 'error',
  DEFAULT = 'default',
  FILE_LOADED = 'file_loaded',
  GEOCODED = 'geocoded',
}
