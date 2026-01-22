# Markdown Textbook Viewer

マークダウンファイルを教科書形式で閲覧できるWebアプリケーション

## 特徴

- 教科書形式の構造: フォルダ構成を章・節として自動認識
- マークダウンレンダリング: GFM（GitHub Flavored Markdown）対応
- シンタックスハイライト: コードブロックの自動ハイライト
- ナビゲーション: パンくずリスト、前後移動ボタン、キーボードショートカット
- レスポンシブデザイン: サイドバー付きの2カラムレイアウト

## フォルダ構造

教科書フォルダは以下の構造にしてください：

- 章フォルダ: `phase{番号}` または `phase{番号}_{タイトル}`（例: phase1, phase2_基礎編）
- 節ファイル: `{2桁番号}_{タイトル}.md`（例: 01_はじめに.md, 02_setup.md）

```
教科書名/
├── phase1_基礎編/
│   ├── 01_はじめに.md
│   └── 02_環境構築.md
└── phase2_応用編/
    └── 01_基本操作.md
```

## 使い方

1. 「フォルダを選択」ボタンをクリック
2. 教科書フォルダを選択
3. サイドバーの目次から節を選択して閲覧

キーボードショートカット: 左右矢印キーで前後の節へ移動

## 開発

```bash
npm install    # 依存関係のインストール
npm run dev    # 開発サーバーの起動
npm run build  # ビルド
npm test       # テスト
npm run lint   # リント
```

技術スタック: React 19, TypeScript 5, Vite, Tailwind CSS v4, react-markdown, Vitest

## ブラウザ対応

File System Access API使用のため Chrome 86+, Edge 86+, Opera 72+ に対応（Firefox, Safari非対応）

## ライセンス

MIT
