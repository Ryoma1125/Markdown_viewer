/** フォルダ名のパース結果 */
export interface ParsedFolder {
  /** 番号 */
  number: number;
  /** タイトル部分 */
  title: string;
}

/**
 * 章フォルダ名をパースする
 * @param folderName フォルダ名（例: "phase1", "phase2_基礎編"）
 * @returns パース結果またはnull
 */
export function parseChapterFolder(folderName: string): ParsedFolder | null {
  const match = folderName.match(/^phase(\d+)(?:_(.+))?$/);
  if (!match) {
    return null;
  }
  return {
    number: parseInt(match[1], 10),
    title: match[2] ?? '',
  };
}

/**
 * 節ファイル名をパースする
 * @param fileName ファイル名（例: "01_はじめに.md", "02_introduction.md"）
 * @returns パース結果またはnull
 */
export function parseSectionFile(fileName: string): ParsedFolder | null {
  const match = fileName.match(/^(\d{2})_(.+)\.md$/);
  if (!match) {
    return null;
  }
  return {
    number: parseInt(match[1], 10),
    title: match[2],
  };
}

/**
 * 章の表示用タイトルを生成する
 * @param chapterNumber 章番号
 * @param title タイトル
 * @returns 表示用タイトル（例: "第1章 基礎編"）
 */
export function formatChapterTitle(chapterNumber: number, title: string): string {
  if (title) {
    return `第${chapterNumber}章 ${title}`;
  }
  return `第${chapterNumber}章`;
}

/**
 * 節の表示用タイトルを生成する
 * @param chapterNumber 章番号
 * @param sectionNumber 節番号
 * @param title タイトル
 * @returns 表示用タイトル（例: "1.1 はじめに"）
 */
export function formatSectionTitle(
  chapterNumber: number,
  sectionNumber: number,
  title: string
): string {
  if (title) {
    return `${chapterNumber}.${sectionNumber} ${title}`;
  }
  return `${chapterNumber}.${sectionNumber}`;
}
