import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileGeocoding from './page';

// モックの設定 (新しいGeoJSON API形式)
jest.mock('../_lib/api', () => ({
  fetchGeocodeData: jest.fn(() =>
    Promise.resolve({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [139.736389, 35.679108] },
          properties: {
            matched_address: '東京都千代田区紀尾井町1-3',
            score: 1,
            match_level: 'rsdtdsp_rsdt',
          },
        },
      ],
    })
  ),
}));

describe('FileGeocoding Component', () => {
  it('初期状態で正しく表示される', () => {
    render(<FileGeocoding />);
    expect(screen.getByText('ファイルを選択')).toBeInTheDocument();
    expect(
      screen.getByText(/または、このエリア内にドラッグ＆ドロップ/, {
        exact: false,
      })
    ).toBeInTheDocument();
  });

  it('ファイルがアップロードされると内容がプレビューされる', async () => {
    render(<FileGeocoding />);
    const file = new File(['東京都千代田区紀尾井町1-3'], 'test.txt', {
      type: 'text/plain',
    });
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(
        screen.getByText('ファイルの読み込みが完了しました')
      ).toBeInTheDocument();
      expect(screen.getByText('東京都千代田区紀尾井町1-3')).toBeInTheDocument();
    });
  });

  it('ジオコーディングボタンをクリックするとプロセスが開始される', async () => {
    render(<FileGeocoding />);
    const file = new File(['東京都千代田区紀尾井町1-3'], 'test.txt', {
      type: 'text/plain',
    });
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      const geocodingButton = screen.getByText('ジオコーディング開始');
      fireEvent.click(geocodingButton);
    });

    await waitFor(() => {
      expect(screen.getByText('ファイルを保存する')).toBeInTheDocument();
    });
  });
});
