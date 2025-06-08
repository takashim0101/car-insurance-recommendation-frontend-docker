// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/chat': {
        target: 'http://localhost:3001', // バックエンドサーバーのアドレス
        changeOrigin: true,
      },
    },
  },
  // テスト設定を追加
  test: {
    globals: true, // `describe`, `it`, `expect` などをグローバルで利用可能にする
    environment: 'jsdom', // テスト環境としてJSDOMを使用
    setupFiles: './src/setupTests.js', // テストセットアップファイル
    css: false, // CSSのインポートをテストで処理しない
    testTimeout: 30000, // グローバルテストタイムアウトを30秒に延長
    hookTimeout: 30000, // 各フック (beforeEach, afterEachなど) のタイムアウトも延長
  },
});