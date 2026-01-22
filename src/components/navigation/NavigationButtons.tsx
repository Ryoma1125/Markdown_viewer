interface NavigationButtonsProps {
  /** 前の節のID（なければnull） */
  previousId: string | null;
  /** 次の節のID（なければnull） */
  nextId: string | null;
  /** ナビゲーションハンドラ */
  onNavigate: (sectionId: string) => void;
}

export function NavigationButtons({
  previousId,
  nextId,
  onNavigate,
}: NavigationButtonsProps) {
  return (
    <div className="flex justify-between items-center py-4 border-t border-gray-200 mt-8">
      <button
        onClick={() => previousId && onNavigate(previousId)}
        disabled={!previousId}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          previousId
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
        }`}
      >
        ← 前へ
      </button>
      <button
        onClick={() => nextId && onNavigate(nextId)}
        disabled={!nextId}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          nextId
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
        }`}
      >
        次へ →
      </button>
    </div>
  );
}
