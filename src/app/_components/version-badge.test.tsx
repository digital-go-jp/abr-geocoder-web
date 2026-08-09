import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import VersionBadge from './version-badge';
import { fetchApiInfo } from '../_lib/api';

jest.mock('../_lib/api');

const mockFetchApiInfo = fetchApiInfo as jest.MockedFunction<
  typeof fetchApiInfo
>;

describe('VersionBadgeコンポーネント', () => {
  beforeEach(() => {
    mockFetchApiInfo.mockReset();
  });

  it('APIが返したバージョンを表示する', async () => {
    mockFetchApiInfo.mockResolvedValue({
      version: '3.0.51',
      db_version: '3.0.18',
    });

    render(<VersionBadge />);

    expect(await screen.findByText('API 3.0.51 / DB 3.0.18')).toBeVisible();
  });

  it('取得前は何も表示しない', () => {
    mockFetchApiInfo.mockReturnValue(new Promise(() => {}));

    const { container } = render(<VersionBadge />);

    expect(container).toBeEmptyDOMElement();
  });

  it('APIに届かないときは何も表示しない', async () => {
    mockFetchApiInfo.mockRejectedValue(new Error('エラーコード: 503'));

    const { container } = render(<VersionBadge />);

    await waitFor(() => expect(mockFetchApiInfo).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it('バージョンが欠けているときは何も表示しない', async () => {
    mockFetchApiInfo.mockResolvedValue({ version: '3.0.51' });

    const { container } = render(<VersionBadge />);

    await waitFor(() => expect(mockFetchApiInfo).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it('取得は1回だけ行う', async () => {
    mockFetchApiInfo.mockResolvedValue({
      version: '3.0.51',
      db_version: '3.0.18',
    });

    const { rerender } = render(<VersionBadge />);
    await screen.findByText('API 3.0.51 / DB 3.0.18');
    rerender(<VersionBadge />);

    expect(mockFetchApiInfo).toHaveBeenCalledTimes(1);
  });
});
