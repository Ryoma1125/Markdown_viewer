import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextbookProvider, useTextbook } from './TextbookContext';
import type { Textbook } from '../types';

// テスト用コンポーネント
function TestConsumer() {
  const { state, dispatch } = useTextbook();
  return (
    <div>
      <div data-testid="textbook-title">
        {state.textbook?.title ?? 'No textbook'}
      </div>
      <div data-testid="current-section">
        {state.navigation.currentSectionId ?? 'None'}
      </div>
      <div data-testid="is-loading">
        {state.isLoading ? 'Loading' : 'Not loading'}
      </div>
      <div data-testid="error">{state.error ?? 'No error'}</div>
      <button
        onClick={() =>
          dispatch({
            type: 'SET_TEXTBOOK',
            payload: createMockTextbook(),
          })
        }
      >
        Set Textbook
      </button>
      <button
        onClick={() =>
          dispatch({ type: 'SELECT_SECTION', payload: 'phase1/01_intro' })
        }
      >
        Select Section
      </button>
      <button onClick={() => dispatch({ type: 'TOGGLE_CHAPTER', payload: 'phase1' })}>
        Toggle Chapter
      </button>
      <button onClick={() => dispatch({ type: 'SET_LOADING', payload: true })}>
        Set Loading
      </button>
      <button
        onClick={() => dispatch({ type: 'SET_ERROR', payload: 'Test error' })}
      >
        Set Error
      </button>
      <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
    </div>
  );
}

const createMockTextbook = (): Textbook => ({
  title: 'テスト教科書',
  hasReadme: false,
  chapters: [
    {
      id: 'phase1',
      number: 1,
      title: '基礎編',
      displayTitle: '第1章 基礎編',
      isExpanded: false,
      sections: [
        {
          id: 'phase1/01_intro',
          chapterId: 'phase1',
          number: 1,
          title: 'はじめに',
          displayTitle: '1.1 はじめに',
          files: [],
          isLoaded: false,
        },
      ],
    },
  ],
});

describe('TextbookContext', () => {
  it('初期状態は教科書なし', () => {
    render(
      <TextbookProvider>
        <TestConsumer />
      </TextbookProvider>
    );
    expect(screen.getByTestId('textbook-title')).toHaveTextContent('No textbook');
    expect(screen.getByTestId('current-section')).toHaveTextContent('None');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('Not loading');
  });

  it('SET_TEXTBOOKで教科書を設定できる', async () => {
    const user = userEvent.setup();
    render(
      <TextbookProvider>
        <TestConsumer />
      </TextbookProvider>
    );

    await user.click(screen.getByText('Set Textbook'));
    expect(screen.getByTestId('textbook-title')).toHaveTextContent('テスト教科書');
  });

  it('SELECT_SECTIONで節を選択できる', async () => {
    const user = userEvent.setup();
    render(
      <TextbookProvider>
        <TestConsumer />
      </TextbookProvider>
    );

    await user.click(screen.getByText('Set Textbook'));
    await user.click(screen.getByText('Select Section'));
    expect(screen.getByTestId('current-section')).toHaveTextContent('phase1/01_intro');
  });

  it('SET_LOADINGでローディング状態を変更できる', async () => {
    const user = userEvent.setup();
    render(
      <TextbookProvider>
        <TestConsumer />
      </TextbookProvider>
    );

    await user.click(screen.getByText('Set Loading'));
    expect(screen.getByTestId('is-loading')).toHaveTextContent('Loading');
  });

  it('SET_ERRORでエラーを設定できる', async () => {
    const user = userEvent.setup();
    render(
      <TextbookProvider>
        <TestConsumer />
      </TextbookProvider>
    );

    await user.click(screen.getByText('Set Error'));
    expect(screen.getByTestId('error')).toHaveTextContent('Test error');
  });

  it('RESETで初期状態に戻る', async () => {
    const user = userEvent.setup();
    render(
      <TextbookProvider>
        <TestConsumer />
      </TextbookProvider>
    );

    await user.click(screen.getByText('Set Textbook'));
    await user.click(screen.getByText('Reset'));
    expect(screen.getByTestId('textbook-title')).toHaveTextContent('No textbook');
  });

  it('Provider外でuseTextbookを使うとエラー', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      'useTextbook must be used within a TextbookProvider'
    );
    consoleError.mockRestore();
  });
});
