import type { Textbook } from '../../types';
import { README_SECTION_ID } from '../../types';
import { ChapterItem } from './ChapterItem';

interface SidebarProps {
  /** 教科書データ */
  textbook: Textbook | null;
  /** 現在選択中の節ID */
  currentSectionId: string | null;
  /** 章の展開/折りたたみ切り替え */
  onToggleChapter: (chapterId: string) => void;
  /** 節の選択 */
  onSelectSection: (sectionId: string) => void;
}

export function Sidebar({
  textbook,
  currentSectionId,
  onToggleChapter,
  onSelectSection,
}: SidebarProps) {
  if (!textbook) {
    return (
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-400">目次</h1>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 text-gray-500 text-center">
          フォルダを選択してください
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
      {/* 教科書タイトル */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-800 truncate" title={textbook.title}>
          {textbook.title}
        </h1>
      </div>

      {/* 章リスト */}
      <nav className="flex-1 overflow-y-auto p-3">
        {/* README リンク */}
        {textbook.hasReadme && (
          <button
            onClick={() => onSelectSection(README_SECTION_ID)}
            className={`w-full text-left px-3 py-2 rounded-lg mb-2 transition-colors ${
              currentSectionId === README_SECTION_ID
                ? 'bg-blue-100 text-blue-800 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            📖 はじめに
          </button>
        )}
        {textbook.chapters.map((chapter) => (
          <ChapterItem
            key={chapter.id}
            chapter={chapter}
            currentSectionId={currentSectionId}
            onToggle={onToggleChapter}
            onSelectSection={onSelectSection}
          />
        ))}
      </nav>
    </aside>
  );
}
