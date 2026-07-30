import { fetchGeocodeData } from './api';

describe('fetchGeocodeData', () => {
  const mockFetch = jest.fn();
  (global as any).fetch = mockFetch;

  const okResponse = (body: unknown = { features: [] }) => ({
    ok: true,
    json: jest.fn().mockResolvedValue(body),
  });

  const errorResponse = (
    status: number,
    statusText: string,
    body?: unknown
  ) => ({
    ok: false,
    status,
    statusText,
    json: body
      ? jest.fn().mockResolvedValue(body)
      : jest.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
  });

  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue(okResponse());
  });

  const requestedUrl = () => new URL(mockFetch.mock.calls[0][0]);

  it('省略した category と pref はクエリに含めない', async () => {
    await fetchGeocodeData({ address: '東京都千代田区紀尾井町1-3' });

    const url = requestedUrl();
    expect(url.pathname).toBe('/geocode');
    expect(url.searchParams.get('address')).toBe('東京都千代田区紀尾井町1-3');
    expect(url.searchParams.get('limit')).toBe('1');
    expect(url.searchParams.has('category')).toBe(false);
    expect(url.searchParams.has('pref')).toBe(false);
  });

  it('category・pref・limit をクエリに載せる', async () => {
    await fetchGeocodeData({
      address: '東京都千代田区紀尾井町1-3',
      category: 'rsdtdsp',
      pref: '13',
      limit: 5,
    });

    const url = requestedUrl();
    expect(url.searchParams.get('category')).toBe('rsdtdsp');
    expect(url.searchParams.get('pref')).toBe('13');
    expect(url.searchParams.get('limit')).toBe('5');
  });

  it('APIキーをヘッダーに載せる', async () => {
    await fetchGeocodeData({ address: '東京都千代田区紀尾井町1-3' });

    expect(mockFetch.mock.calls[0][1].headers).toEqual({
      'x-api-key': 'api-key',
    });
  });

  it('レスポンス本文を返す', async () => {
    const body = { type: 'FeatureCollection', features: [] };
    mockFetch.mockResolvedValue(okResponse(body));

    await expect(
      fetchGeocodeData({ address: '東京都千代田区紀尾井町1-3' })
    ).resolves.toEqual(body);
  });

  it('エラーレスポンスの message を Error にする', async () => {
    mockFetch.mockResolvedValue(
      errorResponse(400, 'Bad Request', {
        status: 'error',
        message: 'invalid pref',
      })
    );

    await expect(
      fetchGeocodeData({ address: '東京都千代田区紀尾井町1-3', pref: '99' })
    ).rejects.toThrow('エラーコード: 400, エラー内容: invalid pref');
  });

  it('データが利用できない 503 も message を Error にする', async () => {
    mockFetch.mockResolvedValue(
      errorResponse(503, 'Service Unavailable', {
        status: 'error',
        message: 'parcel data not available in current cache',
      })
    );

    await expect(
      fetchGeocodeData({ address: '東京都千代田区紀尾井町1-3' })
    ).rejects.toThrow(
      'エラーコード: 503, エラー内容: parcel data not available in current cache'
    );
  });

  it('JSON以外の本文では statusText を使う', async () => {
    mockFetch.mockResolvedValue(errorResponse(502, 'Bad Gateway'));

    await expect(
      fetchGeocodeData({ address: '東京都千代田区紀尾井町1-3' })
    ).rejects.toThrow('エラーコード: 502, エラー内容: Bad Gateway');
  });
});
