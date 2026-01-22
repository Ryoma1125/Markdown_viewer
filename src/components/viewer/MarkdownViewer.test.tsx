import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownViewer } from './MarkdownViewer';

describe('MarkdownViewer', () => {
  it('マークダウンをHTMLとしてレンダリングする', () => {
    render(<MarkdownViewer content="# テスト見出し" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('テスト見出し');
  });

  it('パラグラフをレンダリングする', () => {
    render(<MarkdownViewer content="これはテスト本文です。" />);
    expect(screen.getByText('これはテスト本文です。')).toBeInTheDocument();
  });

  it('リストをレンダリングする', () => {
    const markdown = `
- アイテム1
- アイテム2
- アイテム3
    `;
    render(<MarkdownViewer content={markdown} />);
    expect(screen.getByText('アイテム1')).toBeInTheDocument();
    expect(screen.getByText('アイテム2')).toBeInTheDocument();
    expect(screen.getByText('アイテム3')).toBeInTheDocument();
  });

  it('GFMテーブルをレンダリングする', () => {
    const markdown = `
| 列1 | 列2 |
|-----|-----|
| A   | B   |
    `;
    render(<MarkdownViewer content={markdown} />);
    expect(screen.getByText('列1')).toBeInTheDocument();
    expect(screen.getByText('列2')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('リンクをレンダリングする', () => {
    render(<MarkdownViewer content="[テストリンク](https://example.com)" />);
    const link = screen.getByRole('link');
    expect(link).toHaveTextContent('テストリンク');
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('コードブロックをレンダリングする', () => {
    const markdown = '```javascript\nconst x = 1;\n```';
    render(<MarkdownViewer content={markdown} />);
    // SyntaxHighlighterはトークン分割するため、個別の要素をチェック
    expect(screen.getByText('const')).toBeInTheDocument();
    expect(screen.getByText('x')).toBeInTheDocument();
    expect(screen.getByText('=')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('インラインコードをレンダリングする', () => {
    render(<MarkdownViewer content="これは`インラインコード`です" />);
    expect(screen.getByText('インラインコード')).toBeInTheDocument();
  });

  it('空のコンテンツでもエラーにならない', () => {
    const { container } = render(<MarkdownViewer content="" />);
    expect(container.querySelector('.prose')).toBeInTheDocument();
  });

  it('nullコンテンツでプレースホルダーを表示', () => {
    render(<MarkdownViewer content={null} />);
    expect(screen.getByText('節を選択してください')).toBeInTheDocument();
  });
});
