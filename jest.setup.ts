import '@testing-library/jest-dom';

// Mock react-syntax-highlighter to avoid ESM issues in Jest
jest.mock('react-syntax-highlighter', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ children }: { children: string }) =>
      React.createElement('pre', { 'data-testid': 'syntax-highlighter' }, children),
  };
});

jest.mock('react-syntax-highlighter/dist/cjs/styles/hljs', () => ({
  nightOwl: {},
}));

// 環境変数設定
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3000/';
process.env.NEXT_PUBLIC_API_KEY = 'api-key';
process.env.NEXT_PUBLIC_APP_TITLE = 'ジオコーダー';
process.env.NEXT_PUBLIC_FILE_MAX_LINE = '1000';
