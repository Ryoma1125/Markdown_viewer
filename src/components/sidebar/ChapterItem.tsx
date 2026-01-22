import type { Chapter } from '../../types';

interface ChapterItemProps {
  /** 章データ */
  chapter: Chapter;
  /** 現在選択中の節ID */
  currentSectionId: string | null;
  /** 章の展開/折りたたみ切り替え */
  onToggle: (chapterId: string) => void;
  /** 節の選択 */
  onSelectSection: (sectionId: string) => void;
}

export function ChapterItem({
  chapter,
  currentSectionId,
  onToggle,
  onSelectSection,
}: ChapterItemProps) {
  return (
    <div className="mb-2">
      {/* 章ヘッダー */}
      <button
        onClick={() => onToggle(chapter.id)}
        className="w-full flex items-center justify-between px-3 py-2 text-left font-semibold text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <span>{chapter.displayTitle}</span>
        <span
          className={`transform transition-transform ${
            chapter.isExpanded ? 'rotate-90' : ''
          }`}
        >
          ▶
        </span>
      </button>

      {/* 節リスト */}
      {chapter.isExpanded && (
        <div className="ml-4 mt-1 space-y-1">
          {chapter.sections.map((section) => {
            const isSelected = section.id === currentSectionId;
            return (
              <button
                key={section.id}
                onClick={() => onSelectSection(section.id)}
                className={`w-full px-3 py-1.5 text-left text-sm rounded-lg transition-colors ${
                  isSelected
                    ? 'bg-blue-100 text-blue-800 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {section.displayTitle}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
