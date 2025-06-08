// frontend/src/setupTests.js
import '@testing-library/jest-dom';
import { vi } from 'vitest'; // Vitestのユーティリティをインポート

// fetchをグローバルにモックする
// vi.stubGlobalを使用することで、テスト環境がセットアップされる際に
// global.fetchが確実にモック関数として定義されます。
vi.stubGlobal('fetch', vi.fn());

// html2canvas をグローバルにモックする (PDFダウンロードテストのため)
// vi.stubGlobalを使用することで、html2canvasも確実にモック関数として定義されます。
vi.stubGlobal('html2canvas', vi.fn(() => Promise.resolve({
  toDataURL: vi.fn(() => 'data:image/png;base64,mockImageData') // モックされたBase64画像データ
})));

// jsPDFの.save()メソッドのためのグローバルなスパイを定義
// これをjsPDFのモック実装内で使用し、各テストでクリアします。
const mockJsPDFSave = vi.fn();

// jsPDFをグローバルにモックする
// beforeEachで毎回モックの実装を設定し、スパイをクリアするため、
// ここでは基本的なモック関数として定義します。
vi.stubGlobal('jspdf', {
  jsPDF: vi.fn().mockImplementation(() => ({
    internal: {
      pageSize: {
        getHeight: vi.fn(() => 842), // A4高さのpt換算
        getWidth: vi.fn(() => 595),  // A4幅のpt換算
      },
    },
    setFontSize: vi.fn(),
    text: vi.fn(),
    setDrawColor: vi.fn(),
    line: vi.fn(),
    splitTextToSize: vi.fn((text, width) => text.split('\n')), // テキストを分割する簡易モック
    setFillColor: vi.fn(),
    setTextColor: vi.fn(),
    roundedRect: vi.fn(),
    getTextWidth: vi.fn((text) => text.length * 5), // 簡易的なテキスト幅モック
    addPage: vi.fn(),
    save: mockJsPDFSave, // <--- ここでグローバルなスパイを使用
  })),
});


// 各テストの前にモックをリセットする
beforeEach(() => {
  // global.fetchの呼び出し履歴とモック実装をクリア
  global.fetch.mockClear();

  // html2canvas のモックもリセット
  global.html2canvas.mockClear();
  global.html2canvas.mockImplementation(() => Promise.resolve({
    toDataURL: vi.fn(() => 'data:image/png;base64,mockImageData')
  }));

  // jsPDFのsaveメソッドのスパイをクリアする
  // これにより、各テストでsaveメソッドの呼び出し履歴がリセットされる
  mockJsPDFSave.mockClear(); // <-- グローバルなスパイをクリア

  // localStorageのメソッドをVi.fn()でモックし、ウィンドウオブジェクトに定義する
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(() => {
      mockLocalStorage.getItem.mockClear();
      mockLocalStorage.setItem.mockClear();
      mockLocalStorage.removeItem.mockClear();
    }),
  };
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });

  // speechSynthesisをモock
  Object.defineProperty(window, 'speechSynthesis', {
    writable: true,
    value: {
      getVoices: vi.fn(() => []),
      speak: vi.fn(),
      cancel: vi.fn(),
      speaking: false,
      onvoiceschanged: null,
    },
  });
});

// 各テストの後にlocalStorageをクリア
afterEach(() => {
    window.localStorage.clear();
});