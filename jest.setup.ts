// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import '@testing-library/user-event';

// 環境変数設定
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3000/';
process.env.NEXT_PUBLIC_API_VERSION = 'v1';
process.env.NEXT_PUBLIC_API_KEY = 'api-key';
process.env.NEXT_PUBLIC_APP_TITLE = 'ジオコーダー';
process.env.NEXT_PUBLIC_FILE_MAX_LINE = '10000';
