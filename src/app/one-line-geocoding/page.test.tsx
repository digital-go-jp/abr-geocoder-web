import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import OneLineGeocoding from './page';
import userEvent from '@testing-library/user-event';

describe('OneLineGeocodingコンポーネント', () => {
  // fetchをmock関数に置き換える
  const mockFetch = jest.fn();
  (global as any).fetch = mockFetch;

  describe('ジオコーディング結果が表示される', () => {
    it('テーブル指定でジオコーディング結果が表示される', async () => {
      // mockレスポンス
      const mockResponseData = [
        {
          "query": {
            "input": "東京都千代田区紀尾井町1-3"
          },
          "result": {
            "output": "東京都千代田区紀尾井町1-3",
            "score": 1,
            "other": null,
            "match_level": "residential_detail",
            "lg_code": "131016",
            "pref": "東京都",
            "county": null,
            "city": "千代田区",
            "ward": null,
            "machiaza_id": "0056000",
            "oaza_cho": "紀尾井町",
            "chome": null,
            "koaza": null,
            "blk_num": "1",
            "blk_id": "001",
            "rsdt_num": 3,
            "rsdt_id": "003",
            "rsdt_num2": null,
            "rsdt2_id": null,
            "rsdt_addr_flg": 1,
            "prc_num1": null,
            "prc_num2": null,
            "prc_num3": null,
            "prc_id": null,
            "lat": 35.679107172,
            "lon": 139.736394597,
            "coordinate_level": "residential_detail"
          }
        }
      ];
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponseData),
      });

      const { getByLabelText, findByText, findByTestId, findAllByTestId } = render(
        <OneLineGeocoding />
      );

      // 住所入力してジオコーディング開始
      userEvent.type(await findByTestId('input-address'), '東京都千代田区紀尾井町1-3');
      expect(await findByText('ジオコーディング開始')).toBeEnabled();

      userEvent.click(getByLabelText('住居表示 + 地番'));
      userEvent.click(getByLabelText('Table（表）'));
      userEvent.click(await findByText('ジオコーディング開始'));

      // 結果画面確認
      expect(await findByText('ジオコーディング結果')).toBeInTheDocument();
      const keyElm = await findAllByTestId("geocoding-result-table-key");
      const valueElm = await findAllByTestId("geocoding-result-table-value");

      // テーブル表示のため以下のようにしてキーと値assert
      expect(keyElm[0].textContent).toBe('input');
      expect(keyElm[1].textContent).toBe('output');
      expect(keyElm[2].textContent).toBe('score');
      expect(keyElm[3].textContent).toBe('other');
      expect(keyElm[4].textContent).toBe('match_level');
      expect(keyElm[5].textContent).toBe('lg_code');
      expect(keyElm[6].textContent).toBe('pref');
      expect(keyElm[7].textContent).toBe('county');
      expect(keyElm[8].textContent).toBe('city');
      expect(keyElm[9].textContent).toBe('ward');
      expect(keyElm[10].textContent).toBe('machiaza_id');
      expect(keyElm[11].textContent).toBe('oaza_cho');
      expect(keyElm[12].textContent).toBe('chome');
      expect(keyElm[13].textContent).toBe('koaza');
      expect(keyElm[14].textContent).toBe('blk_num');
      expect(keyElm[15].textContent).toBe('blk_id');
      expect(keyElm[16].textContent).toBe('rsdt_num');
      expect(keyElm[17].textContent).toBe('rsdt_id');
      expect(keyElm[18].textContent).toBe('rsdt_num2');
      expect(keyElm[19].textContent).toBe('rsdt2_id');
      expect(keyElm[20].textContent).toBe('rsdt_addr_flg');
      expect(keyElm[21].textContent).toBe('prc_num1');
      expect(keyElm[22].textContent).toBe('prc_num2');
      expect(keyElm[23].textContent).toBe('prc_num3');
      expect(keyElm[24].textContent).toBe('prc_id');
      expect(keyElm[25].textContent).toBe('lat');
      expect(keyElm[26].textContent).toBe('lon');
      expect(keyElm[27].textContent).toBe('coordinate_level');

      expect(valueElm[0].textContent).toBe('東京都千代田区紀尾井町1-3');
      expect(valueElm[1].textContent).toBe('東京都千代田区紀尾井町1-3');
      expect(valueElm[2].textContent).toBe('1');
      expect(valueElm[3].textContent).toBe('null');
      expect(valueElm[4].textContent).toBe('residential_detail');
      expect(valueElm[5].textContent).toBe('131016');
      expect(valueElm[6].textContent).toBe('東京都');
      expect(valueElm[7].textContent).toBe('null');
      expect(valueElm[8].textContent).toBe('千代田区');
      expect(valueElm[9].textContent).toBe('null');
      expect(valueElm[10].textContent).toBe('0056000');
      expect(valueElm[11].textContent).toBe('紀尾井町');
      expect(valueElm[12].textContent).toBe('null');
      expect(valueElm[13].textContent).toBe('null');
      expect(valueElm[14].textContent).toBe('1');
      expect(valueElm[15].textContent).toBe('001');
      expect(valueElm[16].textContent).toBe('3');
      expect(valueElm[17].textContent).toBe('003');
      expect(valueElm[18].textContent).toBe('null');
      expect(valueElm[19].textContent).toBe('null');
      expect(valueElm[20].textContent).toBe('1');
      expect(valueElm[21].textContent).toBe('null');
      expect(valueElm[22].textContent).toBe('null');
      expect(valueElm[23].textContent).toBe('null');
      expect(valueElm[24].textContent).toBe('null');
      expect(valueElm[25].textContent).toBe('35.679107172');
      expect(valueElm[26].textContent).toBe('139.736394597');
      expect(valueElm[27].textContent).toBe('residential_detail');
    });

    it('CSV指定でジオコーディング結果が表示される', async () => {
      /** テスト準備 */
      // mockレスポンス
      const mockResponseData = 'input, output, score, other, match_level, lg_code, pref, county, city, ward, machiaza_id, oaza_cho, chome, koaza, blk_num, blk_id, rsdt_num, rsdt_id, rsdt_num2, rsdt2_id, rsdt_addr_flg, prc_num1, prc_num2, prc_num3, prc_id, lat, lon, coordinate_level\n"東京都千代田区紀尾井町1-3", "東京都千代田区紀尾井町1-3", 1, null, residential_detail, 131016, 東京都, null, 千代田区, null, 0056000, 紀尾井町, null, null, 1, 001, 3, 003, null, null, 1, null, null, null, null, 35.679107172, 139.736394597, residential_detail';
      mockFetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(mockResponseData),
      });

      const { getByLabelText, findByText, findByTestId } = render(
        <OneLineGeocoding />
      );
      // 住所入力してジオコーディング開始
      userEvent.type(await findByTestId('input-address'), '東京都千代田区紀尾井町1-3');
      expect(await findByText('ジオコーディング開始')).toBeEnabled();

      userEvent.click(getByLabelText('住居表示 + 地番'));
      userEvent.click(getByLabelText('CSV'));
      userEvent.click(await findByText('ジオコーディング開始'));

      /** テスト結果確認 */
      // 結果画面確認
      expect(await findByText('ジオコーディング結果')).toBeInTheDocument();
      const elm = await findByTestId("geocoding-result-other");
      expect(elm.textContent).toBe(mockResponseData);
    });

    it('JSON指定でジオコーディング結果が表示される', async () => {
      /** テスト準備 */
      // mockレスポンス
      const mockResponseData = [
        {
          "query": {
            "input": "東京都千代田区紀尾井町1-3"
          },
          "result": {
            "output": "東京都千代田区紀尾井町1-3",
            "score": 1,
            "other": null,
            "match_level": "residential_detail",
            "lg_code": "131016",
            "pref": "東京都",
            "county": null,
            "city": "千代田区",
            "ward": null,
            "machiaza_id": "0056000",
            "oaza_cho": "紀尾井町",
            "chome": null,
            "koaza": null,
            "blk_num": "1",
            "blk_id": "001",
            "rsdt_num": 3,
            "rsdt_id": "003",
            "rsdt_num2": null,
            "rsdt2_id": null,
            "rsdt_addr_flg": 1,
            "prc_num1": null,
            "prc_num2": null,
            "prc_num3": null,
            "prc_id": null,
            "lat": 35.679107172,
            "lon": 139.736394597,
            "coordinate_level": "residential_detail"
          }
        }
      ];
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponseData),
      });

      const { getByLabelText, findByText, findByTestId } = render(
        <OneLineGeocoding />
      );

      // 住所入力してジオコーディング開始
      userEvent.type(await findByTestId('input-address'), '東京都千代田区紀尾井町1-3');
      expect(await findByText('ジオコーディング開始')).toBeEnabled();

      userEvent.click(getByLabelText('住居表示 + 地番'));
      userEvent.click(getByLabelText('JSON'));
      userEvent.click(await findByText('ジオコーディング開始'));

      // 結果画面確認
      expect(await findByText('ジオコーディング結果')).toBeInTheDocument();
      const elm = await findByTestId("geocoding-result-other");
      expect(elm.textContent).toBe(JSON.stringify(mockResponseData, null, 2));
    });

    it('GeoJSON指定でジオコーディング結果が表示される', async () => {
      /** テスト準備 */
      // mockレスポンス
      const mockResponseData = {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                139.736394597,
                35.679107172
              ]
            },
            "properties": {
              "query": {
                "input": "東京都千代田区紀尾井町1-3"
              },
              "result": {
                "output": "東京都千代田区紀尾井町1-3",
                "score": 1,
                "other": null,
                "match_level": "residential_detail",
                "lg_code": "131016",
                "pref": "東京都",
                "county": null,
                "city": "千代田区",
                "ward": null,
                "machiaza_id": "0056000",
                "oaza_cho": "紀尾井町",
                "chome": null,
                "koaza": null,
                "blk_num": "1",
                "blk_id": "001",
                "rsdt_num": 3,
                "rsdt_id": "003",
                "rsdt_num2": null,
                "rsdt2_id": null,
                "rsdt_addr_flg": 1,
                "prc_num1": null,
                "prc_num2": null,
                "prc_num3": null,
                "prc_id": null,
                "lat": 35.679107172,
                "lon": 139.736394597,
                "coordinate_level": "residential_detail"
              }
            }
          }
        ]
      };
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponseData),
      });

      const { getByLabelText, findByText, findByTestId } = render(
        <OneLineGeocoding />
      );

      // 住所入力してジオコーディング開始
      userEvent.type(await findByTestId('input-address'), '東京都千代田区紀尾井町1-3');
      expect(await findByText('ジオコーディング開始')).toBeEnabled();

      userEvent.click(getByLabelText('住居表示 + 地番'));
      userEvent.click(getByLabelText('GeoJSON'));
      userEvent.click(await findByText('ジオコーディング開始'));

      // 結果画面確認
      expect(await findByText('ジオコーディング結果')).toBeInTheDocument();
      const elm = await findByTestId("geocoding-result-other");
      expect(elm.textContent).toBe(JSON.stringify(mockResponseData, null, 2));
    });

    it('必須入力エラー', async () => {
      const { getByLabelText, findByText } = render(<OneLineGeocoding />);

      // 住所入力→削除して空文字に
      fireEvent.change(getByLabelText('住所'), {
        target: { value: 'test' },
      });
      fireEvent.change(getByLabelText('住所'), {
        target: { value: '' },
      });
      // 結果画面確認
      expect(await findByText('1文字以上入力してください')).toBeInTheDocument();
    });
  });
});
