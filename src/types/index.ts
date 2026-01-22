// 型定義: Markdown Textbook Viewer

/** README識別子（特別なID） */
export const README_SECTION_ID = '__README__';

/** 教科書全体 */
export interface Textbook {
  /** 教科書のタイトル（ルートフォルダ名） */
  title: string;
  /** 章のリスト（phase1, phase2...の順） */
  chapters: Chapter[];
  /** README.md の有無 */
  hasReadme: boolean;
}

/** 章（phaseフォルダに対応） */
export interface Chapter {
  /** 一意識別子（例: "phase1"） */
  id: string;
  /** 章番号（1, 2, 3...） */
  number: number;
  /** 章タイトル（フォルダ名から抽出、例: "基礎編"） */
  title: string;
  /** 表示用タイトル（例: "第1章 基礎編"） */
  displayTitle: string;
  /** 節のリスト */
  sections: Section[];
  /** 展開状態 */
  isExpanded: boolean;
}

/** 節（01_xxx形式のフォルダに対応） */
export interface Section {
  /** 一意識別子（例: "phase1/01_introduction"） */
  id: string;
  /** 所属する章のID */
  chapterId: string;
  /** 節番号（1, 2, 3...） */
  number: number;
  /** 節タイトル（フォルダ名から抽出、例: "はじめに"） */
  title: string;
  /** 表示用タイトル（例: "1.1 はじめに"） */
  displayTitle: string;
  /** マークダウンファイルのリスト */
  files: MarkdownFile[];
  /** コンテンツが読み込まれているか */
  isLoaded: boolean;
}

/** マークダウンファイル */
export interface MarkdownFile {
  /** ファイル名 */
  name: string;
  /** ファイルパス（相対パス） */
  path: string;
  /** ファイル内容（読み込み後） */
  content: string | null;
  /** File APIのハンドル */
  fileHandle: File | null;
}

/** ナビゲーション状態 */
export interface NavigationState {
  /** 現在選択中の節ID */
  currentSectionId: string | null;
  /** 現在選択中のファイルパス */
  currentFilePath: string | null;
  /** パンくずリスト */
  breadcrumbs: BreadcrumbItem[];
  /** 前の節ID（なければnull） */
  previousSectionId: string | null;
  /** 次の節ID（なければnull） */
  nextSectionId: string | null;
}

/** パンくずアイテム */
export interface BreadcrumbItem {
  /** 表示ラベル */
  label: string;
  /** 章または節のID */
  id: string;
  /** 種別 */
  type: 'textbook' | 'chapter' | 'section';
}

/** アプリケーション状態 */
export interface AppState {
  /** 教科書データ */
  textbook: Textbook | null;
  /** ナビゲーション状態 */
  navigation: NavigationState;
  /** 現在のコンテンツ */
  currentContent: string | null;
  /** 読み込み中かどうか */
  isLoading: boolean;
  /** エラー */
  error: string | null;
}

/** アクションタイプ */
export type AppAction =
  | { type: 'SET_TEXTBOOK'; payload: Textbook }
  | { type: 'TOGGLE_CHAPTER'; payload: string }
  | { type: 'SELECT_SECTION'; payload: string }
  | { type: 'SELECT_README' }
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };
