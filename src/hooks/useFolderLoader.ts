import { useState, useCallback } from 'react';
import type { Textbook, Chapter, Section } from '../types';
import { README_SECTION_ID } from '../types';
import { parseChapterFolder, parseSectionFile, formatChapterTitle, formatSectionTitle } from '../utils/formatters';

interface UseFolderLoaderResult {
  /** フォルダ選択ダイアログを開く */
  selectFolder: () => Promise<void>;
  /** ファイル内容を読み込む */
  loadSectionContent: (sectionId: string) => Promise<string>;
  /** 読み込み中かどうか */
  isLoading: boolean;
  /** エラー */
  error: string | null;
}

// ファイルハンドルのマップ（節ID → FileHandle）
let fileHandlesMap: Map<string, FileSystemFileHandle> = new Map();

export function useFolderLoader(
  onTextbookLoaded: (textbook: Textbook) => void
): UseFolderLoaderResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectFolder = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    fileHandlesMap = new Map();

    try {
      // フォルダ選択ダイアログを開く
      const handle = await window.showDirectoryPicker({
        mode: 'read',
      });

      const textbook = await parseTextbookFolder(handle);
      onTextbookLoaded(textbook);
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        // ユーザーがキャンセル
        setError(null);
      } else {
        setError((err as Error).message || 'フォルダの読み込みに失敗しました');
      }
    } finally {
      setIsLoading(false);
    }
  }, [onTextbookLoaded]);

  const loadSectionContent = useCallback(async (sectionId: string): Promise<string> => {
    const fileHandle = fileHandlesMap.get(sectionId);
    if (!fileHandle) {
      throw new Error(`Section not found: ${sectionId}`);
    }

    const file = await fileHandle.getFile();
    const content = await file.text();
    return content;
  }, []);

  return {
    selectFolder,
    loadSectionContent,
    isLoading,
    error,
  };
}

/**
 * 教科書フォルダを解析
 */
async function parseTextbookFolder(handle: FileSystemDirectoryHandle): Promise<Textbook> {
  const textbook: Textbook = {
    title: handle.name,
    chapters: [],
    hasReadme: false,
  };

  // 章フォルダ（phase*）を収集
  const chapterEntries: { name: string; handle: FileSystemDirectoryHandle }[] = [];
  
  for await (const entry of handle.values()) {
    if (entry.kind === 'directory' && parseChapterFolder(entry.name)) {
      chapterEntries.push({ name: entry.name, handle: entry });
    }
    // ルートの README.md を検出
    if (entry.kind === 'file' && entry.name.toLowerCase() === 'readme.md') {
      textbook.hasReadme = true;
      fileHandlesMap.set(README_SECTION_ID, entry);
    }
  }

  // 章番号でソート
  chapterEntries.sort((a, b) => {
    const aNum = parseChapterFolder(a.name)?.number ?? 0;
    const bNum = parseChapterFolder(b.name)?.number ?? 0;
    return aNum - bNum;
  });

  // 各章を解析
  for (const chapterEntry of chapterEntries) {
    const parsed = parseChapterFolder(chapterEntry.name);
    if (!parsed) continue;

    const chapter: Chapter = {
      id: chapterEntry.name,
      number: parsed.number,
      title: parsed.title,
      displayTitle: formatChapterTitle(parsed.number, parsed.title),
      isExpanded: false,
      sections: [],
    };

    // 節ファイル（01_xxx.md）を収集
    const sectionFiles: { name: string; handle: FileSystemFileHandle }[] = [];
    
    for await (const entry of chapterEntry.handle.values()) {
      if (entry.kind === 'file' && parseSectionFile(entry.name)) {
        sectionFiles.push({ name: entry.name, handle: entry });
      }
    }

    // 節番号でソート
    sectionFiles.sort((a, b) => {
      const aNum = parseSectionFile(a.name)?.number ?? 0;
      const bNum = parseSectionFile(b.name)?.number ?? 0;
      return aNum - bNum;
    });

    // 各節を解析
    for (const sectionFile of sectionFiles) {
      const parsedSection = parseSectionFile(sectionFile.name);
      if (!parsedSection) continue;

      const sectionId = `${chapterEntry.name}/${sectionFile.name}`;
      
      // ファイルハンドルを保存
      fileHandlesMap.set(sectionId, sectionFile.handle);

      const section: Section = {
        id: sectionId,
        chapterId: chapter.id,
        number: parsedSection.number,
        title: parsedSection.title,
        displayTitle: formatSectionTitle(parsed.number, parsedSection.number, parsedSection.title),
        files: [],
        isLoaded: false,
      };

      chapter.sections.push(section);
    }

    textbook.chapters.push(chapter);
  }

  // 最初の章を展開
  if (textbook.chapters.length > 0) {
    textbook.chapters[0].isExpanded = true;
  }

  return textbook;
}
