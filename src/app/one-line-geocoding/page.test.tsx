import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import OneLineGeocoding from './page';
import userEvent from '@testing-library/user-event';

describe('OneLineGeocodingコンポーネント', () => {
  // fetchをmock関数に置き換える
  const mockFetch = jest.fn();
  (global as any).fetch = mockFetch;

  // 新しいGeoJSON API形式のモックレスポンス
  const mockGeoJsonResponse = {
    type: 'FeatureCollection',
    query: {
      address: '東京都千代田区紀尾井町1-3',
      category: 'all',
      pref: 'all',
      limit: 1,
    },
    result_info: {
      count: 1,
      limit: 1,
      api_version: '3.0.22',
      db_version: '3.0.18',
      enabled_category: 'all',
      enabled_pref: 'all',
      duration_ms: 12.5,
    },
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [139.736389, 35.679108],
        },
        properties: {
          matched_address: '東京都千代田区紀尾井町1-3',
          unmatched_address: null,
          score: 1,
          match_level: 'rsdtdsp_rsdt',
          coordinates_level: 'rsdtdsp_rsdt',
          ids: {
            lg_code: '131016',
            machiaza_id: '0056000',
            rsdt_addr_flg: '1',
            blk_id: '001',
            rsdt_id: '003',
            rsdt2_id: null,
            prc_id: null,
          },
          structured_address: {
            pref: '東京都',
            county: null,
            city: '千代田区',
            ward: null,
            kyoto_st: null,
            oaza_cho: '紀尾井町',
            chome: null,
            koaza: null,
            machiaza_dist: null,
            blk_num: '1',
            rsdt_num: '3',
            rsdt_num2: null,
            prc_num1: null,
            prc_num2: null,
            prc_num3: null,
          },
        },
      },
    ],
  };

  // 曖昧な住所に対して複数候補が返るケース
  const mockMultipleResponse = {
    ...mockGeoJsonResponse,
    query: { ...mockGeoJsonResponse.query, limit: 2 },
    result_info: { ...mockGeoJsonResponse.result_info, count: 2, limit: 2 },
    features: [
      mockGeoJsonResponse.features[0],
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [139.737562, 35.678721] },
        properties: {
          matched_address: '東京都千代田区紀尾井町',
          unmatched_address: null,
          score: 0.6,
          match_level: 'machiaza',
          coordinates_level: 'machiaza',
        },
      },
    ],
  };

  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('ジオコーディング結果が表示される', () => {
    it('テーブル指定でジオコーディング結果が表示される', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockGeoJsonResponse),
      });

      const { getByLabelText, findByText, findByTestId, findAllByTestId } =
        render(<OneLineGeocoding />);

      // 住所入力してジオコーディング開始
      await userEvent.type(
        await findByTestId('input-address'),
        '東京都千代田区紀尾井町1-3'
      );
      await waitFor(() => {
        expect(findByText('ジオコーディング開始')).resolves.toBeTruthy();
      });

      await userEvent.click(getByLabelText('住居表示 + 地番'));
      await userEvent.click(getByLabelText('Table（表）'));
      await userEvent.click(await findByText('ジオコーディング開始'));

      // 結果画面確認
      expect(await findByText('ジオコーディング結果')).toBeInTheDocument();
      const keyElm = await findAllByTestId('geocoding-result-table-key');
      const valueElm = await findAllByTestId('geocoding-result-table-value');

      // テーブル表示のため以下のようにしてキーと値assert
      expect(keyElm[0].textContent).toBe('lng');
      expect(valueElm[0].textContent).toBe('139.736389');

      expect(keyElm[1].textContent).toBe('lat');
      expect(valueElm[1].textContent).toBe('35.679108');

      expect(keyElm[2].textContent).toBe('matched_address');
      expect(valueElm[2].textContent).toBe('東京都千代田区紀尾井町1-3');

      expect(keyElm[3].textContent).toBe('unmatched_address');
      expect(valueElm[3].textContent).toBe('null');
    });

    it('GeoJSON指定でジオコーディング結果が表示される', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockGeoJsonResponse),
      });

      const { getByLabelText, findByText, findByTestId } = render(
        <OneLineGeocoding />
      );

      // 住所入力してジオコーディング開始
      await userEvent.type(
        await findByTestId('input-address'),
        '東京都千代田区紀尾井町1-3'
      );
      await waitFor(() => {
        expect(findByText('ジオコーディング開始')).resolves.toBeTruthy();
      });

      await userEvent.click(getByLabelText('住居表示 + 地番'));
      await userEvent.click(getByLabelText('GeoJSON'));
      await userEvent.click(await findByText('ジオコーディング開始'));

      // 結果画面確認
      expect(await findByText('ジオコーディング結果')).toBeInTheDocument();
      const elm = await findByTestId('geocoding-result-other');
      expect(elm.textContent).toBe(
        JSON.stringify(mockGeoJsonResponse, null, 2)
      );
    });

    it('都道府県と結果件数がクエリに載る', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockGeoJsonResponse),
      });

      const { getByLabelText, findByText, findByTestId } = render(
        <OneLineGeocoding />
      );

      await userEvent.type(
        await findByTestId('input-address'),
        '東京都千代田区紀尾井町1-3'
      );
      await userEvent.selectOptions(getByLabelText('都道府県'), '13');
      await userEvent.selectOptions(getByLabelText('結果件数'), '3');
      await userEvent.click(await findByText('ジオコーディング開始'));

      await waitFor(() => expect(mockFetch).toHaveBeenCalled());
      const url = new URL(mockFetch.mock.calls[0][0]);
      expect(url.searchParams.get('pref')).toBe('13');
      expect(url.searchParams.get('limit')).toBe('3');
    });

    it('都道府県を指定しなければ pref を送らない', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockGeoJsonResponse),
      });

      const { findByText, findByTestId } = render(<OneLineGeocoding />);

      await userEvent.type(
        await findByTestId('input-address'),
        '東京都千代田区紀尾井町1-3'
      );
      await userEvent.click(await findByText('ジオコーディング開始'));

      await waitFor(() => expect(mockFetch).toHaveBeenCalled());
      const url = new URL(mockFetch.mock.calls[0][0]);
      expect(url.searchParams.has('pref')).toBe(false);
      expect(url.searchParams.get('limit')).toBe('1');
    });

    it('複数候補は候補ごとに区切って表示される', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockMultipleResponse),
      });

      const { getByLabelText, findByText, findByTestId, findAllByTestId } =
        render(<OneLineGeocoding />);

      await userEvent.type(
        await findByTestId('input-address'),
        '東京都千代田区紀尾井町1-3'
      );
      await userEvent.selectOptions(getByLabelText('結果件数'), '2');
      await userEvent.click(getByLabelText('Table（表）'));
      await userEvent.click(await findByText('ジオコーディング開始'));

      const candidates = await findAllByTestId('geocoding-result-candidate');
      expect(candidates.map(elm => elm.textContent)).toEqual([
        '候補 1',
        '候補 2',
      ]);

      const values = await findAllByTestId('geocoding-result-table-value');
      expect(values[2].textContent).toBe('東京都千代田区紀尾井町1-3');
    });

    it('マッチしない住所は lng/lat が null と表示される', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          ...mockGeoJsonResponse,
          features: [
            {
              type: 'Feature',
              geometry: null,
              properties: {
                matched_address: '',
                unmatched_address: ['本町1-1'],
                score: -1,
                match_level: 'unknown',
                coordinates_level: null,
              },
            },
          ],
        }),
      });

      const { getByLabelText, findByText, findByTestId, findAllByTestId } =
        render(<OneLineGeocoding />);

      await userEvent.type(await findByTestId('input-address'), '本町1-1');
      await userEvent.click(getByLabelText('Table（表）'));
      await userEvent.click(await findByText('ジオコーディング開始'));

      const values = await findAllByTestId('geocoding-result-table-value');
      expect(values[0].textContent).toBe('null');
      expect(values[1].textContent).toBe('null');
    });

    it('エラーレスポンスの message が表示される', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: jest.fn().mockResolvedValue({
          status: 'error',
          message: 'parcel data not available in current cache',
        }),
      });

      const { getByLabelText, findByText, findByTestId } = render(
        <OneLineGeocoding />
      );

      await userEvent.type(
        await findByTestId('input-address'),
        '東京都千代田区紀尾井町1-3'
      );
      await userEvent.click(getByLabelText('地番'));
      await userEvent.click(await findByText('ジオコーディング開始'));

      expect(
        await findByText(
          'エラーコード: 503, エラー内容: parcel data not available in current cache'
        )
      ).toBeInTheDocument();
    });

    it('必須入力エラー', async () => {
      const { getByTestId, findByText } = render(<OneLineGeocoding />);

      // 住所入力→削除して空文字に
      fireEvent.change(getByTestId('input-address'), {
        target: { value: 'test' },
      });
      fireEvent.change(getByTestId('input-address'), {
        target: { value: '' },
      });
      // 結果画面確認
      expect(await findByText('1文字以上入力してください')).toBeInTheDocument();
    });
  });
});
