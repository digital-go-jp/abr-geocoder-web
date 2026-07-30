/**
 * ネストされたオブジェクトをフラットな構造に変換
 * 配列はカンマ区切りの文字列に変換される
 */
export function flattenObject(
  obj: Record<string, unknown>,
  res: Record<string, string | number> = {}
): Record<string, string | number> {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (Array.isArray(value)) {
        res[key] = value.join(', ');
      } else if (typeof value === 'object' && value !== null) {
        flattenObject(value as Record<string, unknown>, res);
      } else {
        res[key] = value as string | number;
      }
    }
  }
  return res;
}
