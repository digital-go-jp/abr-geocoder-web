import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileGeocoding from './page';

// モックの設定
jest.mock('../_lib/api', () => ({
  fetchGeocodeData: jest.fn(() => Promise.resolve({ ok: true, text: () => Promise.resolve('header\ndata') })),
}));

describe('FileGeocoding Component', () => {
  it('初期状態で正しく表示される', () => {
    render(<FileGeocoding />);
    expect(screen.getByText('ファイルを選ぶ')).toBeInTheDocument();
    expect(screen.getByText(/ここにファイルをドラッグ＆ドロップしてください/, { exact: false })).toBeInTheDocument();
  });

  it('ファイルがアップロードされると内容がプレビューされる', async () => {
    render(<FileGeocoding />);
    const file = new File(['東京都千代田区紀尾井町1-3'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('ファイルの読み込みが完了しました')).toBeInTheDocument();
      expect(screen.getByText('東京都千代田区紀尾井町1-3')).toBeInTheDocument();
    });
  });

  it('ジオコーディングボタンをクリックするとプロセスが開始される', async () => {
    render(<FileGeocoding />);
    const file = new File(['東京都千代田区紀尾井町1-3'], 'test.txt', { type: 'text/plain' });
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