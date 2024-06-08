import React from 'react';
import {
  render,
  fireEvent,
} from '@testing-library/react';
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
            "matching_level": 8,
            "lg_code": "131016",
            "pref": "東京都",
            "city": "千代田区",
            "machiaza": "紀尾井町",
            "machiaza_id": "0056000",
            "blk_num": "1",
            "blk_id": "001",
            "rsdt_num": "3",
            "rsdt_id": "003",
            "rsdt_num2": null,
            "rsdt2_id": null,
            "prc_num1": null,
            "prc_num2": null,
            "prc_num3": null,
            "prc_id": null,
            "other": null,
            "lat": 35.679107172,
            "lon": 139.736394597
          }
        }
      ];;
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponseData),
      });

      const { getByLabelText, findByText, findByTestId, findAllByTestId } = render(
        <OneLineGeocoding />
      );

      // 住所入力してジオコーディング開始
      // ボタンのenabled/disabled の制御でfireEventがうまく動かなかったのでuserEventで代替
      userEvent.type(await findByTestId('input-address'), '東京都千代田区紀尾井町1-3');
      expect(await findByText('ジオコーディング開始')).toBeEnabled();

      userEvent.click(getByLabelText('住所を検索'));
      userEvent.click(getByLabelText('Table（表）'));
      userEvent.click(await findByText('ジオコーディング開始'));

      // 結果画面確認
      expect(await findByText('ジオコーディング結果')).toBeInTheDocument();
      const keyElm = await findAllByTestId("geocoding-result-table-key");
      const valueElm = await findAllByTestId("geocoding-result-table-value");

      // テーブル表示のため以下のようにしてキーと値assert
      expect(keyElm[0].textContent).toBe('input');
      expect(keyElm[1].textContent).toBe('output');
      expect(keyElm[2].textContent).toBe('matching_level');
      expect(keyElm[3].textContent).toBe('lg_code');
      expect(keyElm[4].textContent).toBe('pref');
      expect(keyElm[5].textContent).toBe('city');
      expect(keyElm[6].textContent).toBe('machiaza');
      expect(keyElm[7].textContent).toBe('machiaza_id');
      expect(keyElm[8].textContent).toBe('blk_num');
      expect(keyElm[9].textContent).toBe('blk_id');
      expect(keyElm[10].textContent).toBe('rsdt_num');
      expect(keyElm[11].textContent).toBe('rsdt_id');
      expect(keyElm[12].textContent).toBe('rsdt_num2');
      expect(keyElm[13].textContent).toBe('rsdt2_id');
      expect(keyElm[14].textContent).toBe('prc_num1');
      expect(keyElm[15].textContent).toBe('prc_num2');
      expect(keyElm[16].textContent).toBe('prc_num3');
      expect(keyElm[17].textContent).toBe('prc_id');
      expect(keyElm[18].textContent).toBe('other');
      expect(keyElm[19].textContent).toBe('lat');
      expect(keyElm[20].textContent).toBe('lon');

      expect(valueElm[0].textContent).toBe('東京都千代田区紀尾井町1-3');
      expect(valueElm[1].textContent).toBe('東京都千代田区紀尾井町1-3');
      expect(valueElm[2].textContent).toBe('8');
      expect(valueElm[3].textContent).toBe('131016');
      expect(valueElm[4].textContent).toBe('東京都');
      expect(valueElm[5].textContent).toBe('千代田区');
      expect(valueElm[6].textContent).toBe('紀尾井町');
      expect(valueElm[7].textContent).toBe('0056000');
      expect(valueElm[8].textContent).toBe('1');
      expect(valueElm[9].textContent).toBe('001');
      expect(valueElm[10].textContent).toBe('3');
      expect(valueElm[11].textContent).toBe('003');
      expect(valueElm[12].textContent).toBe('null');
      expect(valueElm[13].textContent).toBe('null');
      expect(valueElm[14].textContent).toBe('null');
      expect(valueElm[15].textContent).toBe('null');
      expect(valueElm[16].textContent).toBe('null');
      expect(valueElm[17].textContent).toBe('null');
      expect(valueElm[18].textContent).toBe('null');
      expect(valueElm[19].textContent).toBe('35.679107172');
      expect(valueElm[20].textContent).toBe('139.736394597');
    });

    it('CSV指定でジオコーディング結果が表示される', async () => {
      /** テスト準備 */
      // mockレスポンス
      const mockResponseData = 'input, output, matching_level, lg_code, pref, city, machiaza, machiaza_id, blk_num, blk_id, rsdt_num, rsdt_id, rsdt_num2, rsdt2_id, prc_num1, prc_num2, prc_num3, prc_id, other, lat, lon\n"東京都千代田区紀尾井町1-3,"東京都千代田区紀尾井町1 - 3",8,131016,東京都,千代田区,紀尾井町,0056000,1,001,3,003,,,,,,,,35.679107172,139.736394597';
      mockFetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(mockResponseData),
      });

      const { getByLabelText, findByText, findByTestId } = render(
        <OneLineGeocoding />
      );
      // 住所入力してジオコーディング開始
      // ボタンのenabled/disabled の制御でfireEventがうまく動かなかったのでuserEventで代替
      userEvent.type(await findByTestId('input-address'), '東京都千代田区紀尾井町1-3');
      expect(await findByText('ジオコーディング開始')).toBeEnabled();

      userEvent.click(getByLabelText('住所を検索'));
      userEvent.click(getByLabelText('CSV'));
      userEvent.click(await findByText('ジオコーディング開始'));

      /** テスト結果確認 */
      // 結果画面確認
      expect(await findByText('ジオコーディング結果')).toBeInTheDocument();
      const elm = await findByTestId("geocoding-result-other");
      expect(elm.textContent).toBe('input, output, matching_level, lg_code, pref, city, machiaza, machiaza_id, blk_num, blk_id, rsdt_num, rsdt_id, rsdt_num2, rsdt2_id, prc_num1, prc_num2, prc_num3, prc_id, other, lat, lon\n"東京都千代田区紀尾井町1-3,"東京都千代田区紀尾井町1 - 3",8,131016,東京都,千代田区,紀尾井町,0056000,1,001,3,003,,,,,,,,35.679107172,139.736394597');
    })

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
            "matching_level": 8,
            "lg_code": "131016",
            "pref": "東京都",
            "city": "千代田区",
            "machiaza": "紀尾井町",
            "machiaza_id": "0056000",
            "blk_num": "1",
            "blk_id": "001",
            "rsdt_num": "3",
            "rsdt_id": "003",
            "rsdt_num2": null,
            "rsdt2_id": null,
            "prc_num1": null,
            "prc_num2": null,
            "prc_num3": null,
            "prc_id": null,
            "other": null,
            "lat": 35.679107172,
            "lon": 139.736394597
          }
        }
      ];;
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponseData),
      });

      const { getByLabelText, findByText, findByTestId } = render(
        <OneLineGeocoding />
      );

      // 住所入力してジオコーディング開始
      // ボタンのenabled/disabled の制御でfireEventがうまく動かなかったのでuserEventで代替
      userEvent.type(await findByTestId('input-address'), '東京都千代田区紀尾井町1-3');
      expect(await findByText('ジオコーディング開始')).toBeEnabled();

      userEvent.click(getByLabelText('住所を検索'));
      userEvent.click(getByLabelText('JSON'));
      userEvent.click(await findByText('ジオコーディング開始'));

      // 結果画面確認
      expect(await findByText('ジオコーディング結果')).toBeInTheDocument();
      /** テスト結果確認 */
      // 結果画面確認
      expect(await findByText('ジオコーディング結果')).toBeInTheDocument();
      const elm = await findByTestId("geocoding-result-other");
      expect(elm.textContent).toBe(JSON.stringify([
        {
          "query": {
            "input": "東京都千代田区紀尾井町1-3"
          },
          "result": {
            "output": "東京都千代田区紀尾井町1-3",
            "matching_level": 8,
            "lg_code": "131016",
            "pref": "東京都",
            "city": "千代田区",
            "machiaza": "紀尾井町",
            "machiaza_id": "0056000",
            "blk_num": "1",
            "blk_id": "001",
            "rsdt_num": "3",
            "rsdt_id": "003",
            "rsdt_num2": null,
            "rsdt2_id": null,
            "prc_num1": null,
            "prc_num2": null,
            "prc_num3": null,
            "prc_id": null,
            "other": null,
            "lat": 35.679107172,
            "lon": 139.736394597
          }
        }
      ], null, 2));
    })

    it('NDJSON指定でジオコーディング結果が表示される', async () => {
      /** テスト準備 */
      // mockレスポンス
      const mockResponseData = {
        "query": {
          "input": "東京都千代田区紀尾井町1-3"
        },
        "result": {
          "output": "東京都千代田区紀尾井町1-3",
          "matching_level": 8,
          "lg_code": "131016",
          "pref": "東京都",
          "city": "千代田区",
          "machiaza": "紀尾井町",
          "machiaza_id": "0056000",
          "blk_num": "1",
          "blk_id": "001",
          "rsdt_num": "3",
          "rsdt_id": "003",
          "rsdt_num2": null,
          "rsdt2_id": null,
          "prc_num1": null,
          "prc_num2": null,
          "prc_num3": null,
          "prc_id": null,
          "other": null,
          "lat": 35.679107172,
          "lon": 139.736394597
        }
      };
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponseData),
      });

      const { getByLabelText, findByText, findByTestId } = render(
        <OneLineGeocoding />
      );

      // 住所入力してジオコーディング開始
      // ボタンのenabled/disabled の制御でfireEventがうまく動かなかったのでuserEventで代替
      userEvent.type(await findByTestId('input-address'), '東京都千代田区紀尾井町1-3');
      expect(await findByText('ジオコーディング開始')).toBeEnabled();

      userEvent.click(getByLabelText('住所を検索'));
      userEvent.click(getByLabelText('NDJSON'));
      userEvent.click(await findByText('ジオコーディング開始'));

      // 結果画面確認
      expect(await findByText('ジオコーディング結果')).toBeInTheDocument();
      /** テスト結果確認 */
      // 結果画面確認
      expect(await findByText('ジオコーディング結果')).toBeInTheDocument();
      const elm = await findByTestId("geocoding-result-other");
      expect(elm.textContent).toBe(JSON.stringify({
        "query": {
          "input": "東京都千代田区紀尾井町1-3"
        },
        "result": {
          "output": "東京都千代田区紀尾井町1-3",
          "matching_level": 8,
          "lg_code": "131016",
          "pref": "東京都",
          "city": "千代田区",
          "machiaza": "紀尾井町",
          "machiaza_id": "0056000",
          "blk_num": "1",
          "blk_id": "001",
          "rsdt_num": "3",
          "rsdt_id": "003",
          "rsdt_num2": null,
          "rsdt2_id": null,
          "prc_num1": null,
          "prc_num2": null,
          "prc_num3": null,
          "prc_id": null,
          "other": null,
          "lat": 35.679107172,
          "lon": 139.736394597
        }
      }));
    })

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
                "matching_level": 8,
                "lg_code": "131016",
                "pref": "東京都",
                "city": "千代田区",
                "machiaza": "紀尾井町",
                "machiaza_id": "0056000",
                "blk_num": "1",
                "blk_id": "001",
                "rsdt_num": "3",
                "rsdt_id": "003",
                "rsdt_num2": null,
                "rsdt2_id": null,
                "prc_num1": null,
                "prc_num2": null,
                "prc_num3": null,
                "prc_id": null,
                "other": null
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
      // ボタンのenabled/disabled の制御でfireEventがうまく動かなかったのでuserEventで代替
      userEvent.type(await findByTestId('input-address'), '東京都千代田区紀尾井町1-3');
      expect(await findByText('ジオコーディング開始')).toBeEnabled();

      userEvent.click(getByLabelText('住所を検索'));
      userEvent.click(getByLabelText('GeoJSON'));
      userEvent.click(await findByText('ジオコーディング開始'));

      // 結果画面確認
      expect(await findByText('ジオコーディング結果')).toBeInTheDocument();
      /** テスト結果確認 */
      // 結果画面確認
      expect(await findByText('ジオコーディング結果')).toBeInTheDocument();
      const elm = await findByTestId("geocoding-result-other");
      expect(elm.textContent).toBe(JSON.stringify({
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
                "matching_level": 8,
                "lg_code": "131016",
                "pref": "東京都",
                "city": "千代田区",
                "machiaza": "紀尾井町",
                "machiaza_id": "0056000",
                "blk_num": "1",
                "blk_id": "001",
                "rsdt_num": "3",
                "rsdt_id": "003",
                "rsdt_num2": null,
                "rsdt2_id": null,
                "prc_num1": null,
                "prc_num2": null,
                "prc_num3": null,
                "prc_id": null,
                "other": null
              }
            }
          }
        ]
      }, null, 2));
    })

    it('NDGeoJSON指定でジオコーディング結果が表示される', async () => {
      /** テスト準備 */
      // mockレスポンス
      const mockResponseData = {
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
            "matching_level": 8,
            "lg_code": "131016",
            "pref": "東京都",
            "city": "千代田区",
            "machiaza": "紀尾井町",
            "machiaza_id": "0056000",
            "blk_num": "1",
            "blk_id": "001",
            "rsdt_num": "3",
            "rsdt_id": "003",
            "rsdt_num2": null,
            "rsdt2_id": null,
            "prc_num1": null,
            "prc_num2": null,
            "prc_num3": null,
            "prc_id": null,
            "other": null
          }
        }
      };
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponseData),
      });

      const { getByLabelText, findByText, findByTestId } = render(
        <OneLineGeocoding />
      );

      // 住所入力してジオコーディング開始
      // ボタンのenabled/disabled の制御でfireEventがうまく動かなかったのでuserEventで代替
      userEvent.type(await findByTestId('input-address'), '東京都千代田区紀尾井町1-3');
      expect(await findByText('ジオコーディング開始')).toBeEnabled();

      userEvent.click(getByLabelText('住所を検索'));
      userEvent.click(getByLabelText('NDGeoJSON'));
      userEvent.click(await findByText('ジオコーディング開始'));

      // 結果画面確認
      expect(await findByText('ジオコーディング結果')).toBeInTheDocument();
      /** テスト結果確認 */
      // 結果画面確認
      expect(await findByText('ジオコーディング結果')).toBeInTheDocument();
      const elm = await findByTestId("geocoding-result-other");
      expect(elm.textContent).toBe(JSON.stringify({
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
            "matching_level": 8,
            "lg_code": "131016",
            "pref": "東京都",
            "city": "千代田区",
            "machiaza": "紀尾井町",
            "machiaza_id": "0056000",
            "blk_num": "1",
            "blk_id": "001",
            "rsdt_num": "3",
            "rsdt_id": "003",
            "rsdt_num2": null,
            "rsdt2_id": null,
            "prc_num1": null,
            "prc_num2": null,
            "prc_num3": null,
            "prc_id": null,
            "other": null
          }
        }
      }));
    })

    it('必須入力エラー', async () => {
      const { getByLabelText, findByText } = render(<OneLineGeocoding />);

      // 住所入力→削除して空文字に
      fireEvent.change(getByLabelText('住所を入力してください'), {
        target: { value: 'test' },
      });
      fireEvent.change(getByLabelText('住所を入力してください'), {
        target: { value: '' },
      });
      // 結果画面確認
      expect(await findByText('1文字以上入力してください')).toBeInTheDocument();
    });
  });
});
