// frontend/src/App.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App'; // テスト対象のAppコンポーネントをインポート
import { vi } from 'vitest'; // viをインポート

describe('App Component', () => {
  // 各テストの前にfetchモックをリセットし、特定の挙動を設定
  beforeEach(() => {
    // global.fetchはsetupTests.jsでvi.stubGlobalによって既にモックされているため、
    // ここでmockClear()を呼び出すだけで十分です。
    global.fetch.mockClear();

    // 各テストの冒頭でfetchのモックを再設定し、各テストの初期フェッチが期待通りに動作するようにする
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve(new Response(JSON.stringify({
        response: "I'm Tina. I help you to choose the right insurance policy. May I ask you a few personal questions to make sure I recommend the best policy for you?",
        history: [
          { role: 'user', text: "Start conversation with Tina." },
          { role: 'model', text: "I'm Tina. I help you to choose the right insurance policy. May I ask you a few personal questions to make sure I recommend the best policy for you?" }
        ]
      }), { status: 200 }))
    );
  });

  // テストケース1: コンポーネントが正しくレンダリングされ、初期のAIメッセージが表示されること
  test('renders chat interface and displays initial AI greeting', async () => {
    render(<App />);

    // AIの最初の挨拶が非同期で表示されるのを待つ
    // ロードインジケーターは非常に短時間で表示・非表示される可能性があるため、
    // 最終的なメッセージが表示されることを確認する方が堅牢です。
    await waitFor(() => {
      expect(screen.getByText(/I'm Tina\. I help you to choose the right insurance policy\./i)).toBeInTheDocument();
    }, { timeout: 15000 });

    // ロードインジケーターが消えていることを確認 (queryByTextを使用)
    // AI応答が表示された時点でロードは完了しているはずです。
    expect(screen.queryByText(/Tina is thinking\.\.\./i)).not.toBeInTheDocument();
    
    // その他の要素の存在を確認
    expect(screen.getByPlaceholderText('Type your message here...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download chat as pdf/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start new chat/i })).toBeInTheDocument();
  });

  // テストケース2: ユーザーがメッセージを送信し、AIが応答すること
  test('allows user to send message and AI responds', async () => {
    render(<App />);

    // 初期挨拶を待つ
    await waitFor(() => {
      expect(screen.getByText(/I'm Tina\./i)).toBeInTheDocument();
    }, { timeout: 15000 });

    // ユーザーからのメッセージに対するAIのモック応答を設定
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve(new Response(JSON.stringify({
        response: "Great! Let's start with your vehicle type. What type of vehicle do you need insurance for?",
        history: [
          { role: 'user', text: "Start conversation with Tina." },
          { role: 'model', text: "I'm Tina. I help you to choose the right insurance policy. May I ask you a few personal questions to make sure I recommend the best policy for you?" },
          { role: 'user', text: "Yes, I agree." },
          { role: 'model', text: "Great! Let's start with your vehicle type. What type of vehicle do you need insurance for?" }
        ]
      }), { status: 200 }))
    );

    // ユーザーがメッセージを入力して送信
    const userInput = screen.getByPlaceholderText('Type your message here...');
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(userInput, { target: { value: 'Yes, I agree.' } });
    fireEvent.click(sendButton);

    // ユーザーのメッセージが表示されていることを確認
    // 複数の「Me:」メッセージが存在する可能性があるため、`getAllByText`で取得し、最新のものを確認
    await waitFor(() => {
      const userMessages = screen.getAllByText((content, element) => {
          return element.textContent.includes('Me: Yes, I agree.') && element.classList.contains('message') && element.classList.contains('user');
      });
      // ユーザーメッセージが少なくとも1つ存在し、その最後のものが期待するテキストであるかを確認
      expect(userMessages.length).toBeGreaterThanOrEqual(1);
      expect(userMessages[userMessages.length - 1]).toBeInTheDocument();
    }, { timeout: 15000 });

    // AIの応答が非同期で表示されるのを待つ
    // ロードインジケーターが表示されてから消えるまでのシーケンスを考慮し、最終的なAIメッセージを待つ
    expect(await screen.findByText(/What type of vehicle do you need insurance for\?/i, undefined, { timeout: 15000 })).toBeInTheDocument();

    // ロードインジケーターが消えていることを確認
    expect(screen.queryByText(/Tina is thinking\.\.\./i)).not.toBeInTheDocument();

    // 入力フィールドがクリアされていることを確認
    expect(userInput.value).toBe('');
  });

  // テストケース3: PDFダウンロード機能
  test('PDF download functionality works', async () => {
    render(<App />);

    // 会話履歴をモック（PDF生成に利用される）
    // NOTE: beforeEachで最初のfetchはモックされているため、ここでは次の2つのfetchをモックする
    global.fetch.mockImplementationOnce(() => // ユーザーメッセージ 'Hello Tina!' 後の応答
      Promise.resolve(new Response(JSON.stringify({
        response: "Hi there! How can I help you today?",
        history: [
          { role: 'user', text: "Start conversation with Tina." },
          { role: 'model', text: "I'm Tina. I help you to choose the right insurance policy. May I ask you a few personal questions to make sure I recommend the best policy for you?" },
          { role: 'user', text: 'Hello Tina!' },
          { role: 'model', text: 'Hi there! How can I help you today?' }
        ]
      }), { status: 200 }))
    );

    global.fetch.mockImplementationOnce(() => // ユーザーメッセージ 'I need car insurance.' 後の応答
      Promise.resolve(new Response(JSON.stringify({
        response: "I recommend **Comprehensive Car Insurance**.",
        history: [
          { role: 'user', text: "Start conversation with Tina." },
          { role: 'model', text: "I'm Tina. I help you to choose the right insurance policy. May I ask you a few personal questions to make sure I recommend the best policy for you?" },
          { role: 'user', text: 'Hello Tina!' },
          { role: 'model', text: 'Hi there! How can I help you today?' },
          { role: 'user', text: 'I need car insurance.' },
          { role: 'model', text: 'I recommend **Comprehensive Car Insurance**.' }
        ]
      }), { status: 200 }))
    );

    // 会話が十分に長く表示されるのを待つ (初期挨拶)
    await waitFor(() => {
      expect(screen.getByText(/I'm Tina\. I help you to choose the right insurance policy\./i)).toBeInTheDocument(); // 初期挨拶
    }, { timeout: 15000 });
    
    // 最初のユーザーメッセージとAI応答
    fireEvent.change(screen.getByPlaceholderText('Type your message here...'), { target: { value: 'Hello Tina!' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    // 応答が表示されるのを待つ (findAllByTextで取得し、最後のものを確認)
    await waitFor(() => {
        const messages = screen.getAllByText((content, element) => {
            return element.textContent.includes('Tina: Hi there! How can I help you today?') && element.classList.contains('message') && element.classList.contains('model');
        });
        expect(messages.length).toBeGreaterThanOrEqual(1);
        expect(messages[messages.length - 1]).toBeInTheDocument();
    }, { timeout: 15000 });
    expect(screen.queryByText(/Tina is thinking\.\.\./i)).not.toBeInTheDocument(); // ロードインジケーターが消えていることを確認

    // 2番目のユーザーメッセージとAI応答
    fireEvent.change(screen.getByPlaceholderText('Type your message here...'), { target: { value: 'I need car insurance.' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    // 応答が表示されるのを待つ (findAllByTextで取得し、最後のものを確認)
    await waitFor(() => {
        const messages = screen.getAllByText((content, element) => {
            return element.textContent.includes('Tina: I recommend **Comprehensive Car Insurance**.') && element.classList.contains('message') && element.classList.contains('model');
        });
        expect(messages.length).toBeGreaterThanOrEqual(1);
        expect(messages[messages.length - 1]).toBeInTheDocument();
    }, { timeout: 15000 });
    expect(screen.queryByText(/Tina is thinking\.\.\./i)).not.toBeInTheDocument(); // ロードインジケーターが消えていることを確認


    // PDFダウンロードボタンをクリック
    const downloadButton = screen.getByRole('button', { name: /download chat as pdf/i });
    fireEvent.click(downloadButton);

    // jsPDFのsaveメソッドが呼び出されたことを確認
    // setupTests.js で定義された `mockJsPDFSave` スパイを直接アサートします。
    await waitFor(() => {
      expect(window.jspdf.jsPDF).toHaveBeenCalledTimes(1); // jsPDFコンストラクタが呼び出されたことを確認
      // `mockJsPDFSave` は setupTests.js で定義されたグローバルなスパイです
      expect(window.jspdf.jsPDF.mock.results[0].value.save).toHaveBeenCalledTimes(1); 
    }, { timeout: 15000 });

    // PDFダウンロード完了メッセージが表示されていることを確認
    // テキストが複数要素に分割されているため、関数マッチャーを使用
    expect(await screen.findByText((content, element) => {
        return element.textContent.includes('Tina: Chat history downloaded as PDF!') && element.classList.contains('message') && element.classList.contains('ai');
    }, undefined, { timeout: 15000 })).toBeInTheDocument();
    // ロードインジケーターが消えていることを確認
    expect(screen.queryByText(/Tina is thinking\.\.\./i)).not.toBeInTheDocument();
  });

  // テストケース4: 新しいチャットを開始する機能
  test('start new chat functionality works', async () => {
    render(<App />);

    // 初期挨拶を待つ (findByTextを使用)
    await expect(screen.findByText(/I'm Tina\./i, undefined, { timeout: 15000 })).resolves.toBeInTheDocument();
    // 初期ロード完了後にロードインジケーターが消えていることを確認
    expect(screen.queryByText(/Tina is thinking\.\.\./i)).not.toBeInTheDocument();

    // 新しいチャットが開始されたときに呼び出されるfetchのモック応答を設定
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve(new Response(JSON.stringify({
        response: "I'm Tina. I help you to choose the right insurance policy. May I ask you a few personal questions to make sure I recommend the best policy for you?",
        history: [
          { role: 'user', text: "Start conversation with Tina." },
          { role: 'model', text: "I'm Tina. I. I help you to choose the right insurance policy. May I ask you a few personal questions to make sure I recommend the best policy for you?" }
        ]
      }), { status: 200 }))
    );

    const startNewChatButton = screen.getByRole('button', { name: /start new chat/i });
    fireEvent.click(startNewChatButton);

    // localStorage.removeItemとlocalStorage.setItemが呼ばれたことを確認
    await waitFor(() => {
        expect(localStorage.removeItem).toHaveBeenCalledWith('sessionId');
        expect(localStorage.setItem).toHaveBeenCalledWith(expect.any(String), expect.stringMatching(/^session_/));
    }, { timeout: 15000 });

    // 新しい初期挨拶が表示されることを確認
    // コンポーネントがチャット履歴を完全にリセットすることを想定し、新しい挨拶が唯一の「I'm Tina.」メッセージであることを確認します。
    await waitFor(() => {
      const tinaGreetings = screen.getAllByText(/I'm Tina\./i);
      expect(tinaGreetings.length).toBe(1); // 期待されるのは新しい初期挨拶のみ
      expect(tinaGreetings[0]).toBeInTheDocument();
    }, { timeout: 15000 });

    // ロードインジケーターが消えていることを確認
    expect(screen.queryByText(/Tina is thinking\.\.\./i)).not.toBeInTheDocument();
  });
});
