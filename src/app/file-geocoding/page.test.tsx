import userEvent from '@testing-library/user-event';
import FileGeocoding from './page';
import { render, fireEvent, screen } from '@testing-library/react';

describe('FileGeocodingコンポーネント', () => {
  // fetchをmock関数に置き換える
  const mockFetch = jest.fn();
  (global as any).fetch = mockFetch;

  describe('コンポーネントが正しく描画される', () => {
    it('ファイル入力の初期表示は説明が表示される', async () => {
      const { findByText } = render(<FileGeocoding />);
      expect(
        await findByText(
          '以下の形式のテキストファイルがジオコーディング可能です'
        )
      ).toBeInTheDocument();
    });
  });

  describe('ファイルの選択を正しく処理する', () => {
    it('ファイルがエラーなく正常に選択できる', async () => {
      const { findByText, getByTestId } = render(<FileGeocoding />);

      // テストデータ準備
      // 3種類の改行コード確認
      // 入力ファイル
      const file = new File(['東京都千代田区紀尾井町1-3\n', '東京都千代田区紀尾井町1-4\r\n', '東京都千代田区紀尾井町1-5\r'], 'test.txt', {
        type: 'text/plain',
      });
      Object.defineProperty(screen.getByTestId('file-input'), 'files', {
        value: [file],
      });

      // テスト実施
      // react-dropzoneを使用しているためdropで発火
      fireEvent.drop(getByTestId('file-input'));

      // テスト結果検証
      expect(
        await findByText('ファイルの読み込みが完了しました')
      ).toBeInTheDocument();
      // 読み込んだファイル表示される
      expect(await findByText('東京都千代田区紀尾井町1-3')).toBeInTheDocument();
      expect(await findByText('東京都千代田区紀尾井町1-4')).toBeInTheDocument();
      expect(await findByText('東京都千代田区紀尾井町1-5')).toBeInTheDocument();
    });

    it('複数ファイルのためエラーになる', async () => {
      const { findByText, getByTestId } = render(<FileGeocoding />);
      // テストデータ準備
      const file = new File(['住所1\n'], 'test.txt', { type: 'text/plain' });
      const file2 = new File(['住所2\n'], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(getByTestId('file-input'), 'files', {
        value: [file, file2],
      });

      // テスト実施
      fireEvent.drop(getByTestId('file-input'));

      // テスト結果検証
      expect(
        await findByText('ファイルの読み込みでエラーが発生しました')
      ).toBeInTheDocument();
      expect(
        await findByText('複数ファイルはアップロードできません')
      ).toBeInTheDocument();
    });

    it('ファイルの行数が既定値を超えた場合、エラーになるべき', async () => {
      const { findByText, getByTestId } = render(<FileGeocoding />);
      // テストデータ準備
      const contents: string[] = Array.from(
        { length: Number(process.env.NEXT_PUBLIC_FILE_MAX_LINE) + 1 },
        (_, index) => `住所${index}\n`
      );
      // 入力ファイル
      const file = new File(contents, 'test.txt', { type: 'text/plain' });
      Object.defineProperty(getByTestId('file-input'), 'files', {
        value: [file],
      });
      // テスト実施
      fireEvent.drop(getByTestId('file-input'));

      // テスト結果検証
      expect(
        await findByText('ファイルの読み込みでエラーが発生しました')
      ).toBeInTheDocument();
      expect(
        await findByText(`アップロードされたリストが${process.env.NEXT_PUBLIC_FILE_MAX_LINE}件を超えています`)
      ).toBeInTheDocument();
    });
  });

  describe('ファイルのジオコーディングを正しく処理する', () => {
    it('エラーなく正常にジオコーディングできる', async () => {
      // mockレスポンス
      const mockResponseData = 'input, match_level, lg_code, prefecture, city, town, town_id, block, block_id, addr1, addr1_id, addr2, addr2_id, other, lat, lon\n'
        + '"東京都文京区本駒込2-28-8",8,131059,東京都,文京区,本駒込二丁目,0004002,28,028,8,008,,,,35.730461969,139.746687731'
      mockFetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(mockResponseData),
      });
      const file = new File(['東京都文京区本駒込2-28-8\n'], 'text.text', { type: 'text/plain' });

      const { getByTestId, findByText } = render(<FileGeocoding />);
      Object.defineProperty(getByTestId('file-input'), 'files', {
        value: [file],
      });
      // テスト実施
      fireEvent.drop(getByTestId('file-input'));
      fireEvent.click(await findByText('ジオコーディング開始'));

      // テスト結果検証
      // ジオコーディング後ファイルダウンロード画面へ遷移しているかの確認
      expect(await findByText('text_GeocodingResults.csv')).toBeInTheDocument();
      expect(await findByText('ファイルを保存する')).toBeInTheDocument();
    });
  });
});
