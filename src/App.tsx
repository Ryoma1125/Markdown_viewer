import { useCallback, useEffect } from 'react';
import './App.css';
import { Sidebar, Breadcrumbs, NavigationButtons, MarkdownViewer } from './components';
import { TextbookProvider, useTextbook } from './contexts/TextbookContext';
import { useFolderLoader, useKeyboardNavigation } from './hooks';
import type { BreadcrumbItem, Textbook } from './types';
import { README_SECTION_ID } from './types';

function AppContent() {
  const { state, dispatch } = useTextbook();
  const { textbook, navigation, currentContent, isLoading, error } = state;

  const handleTextbookLoaded = useCallback(
    (loadedTextbook: Textbook) => {
      dispatch({ type: 'SET_TEXTBOOK', payload: loadedTextbook });
    },
    [dispatch]
  );

  const { selectFolder, loadSectionContent, isLoading: folderLoading } = useFolderLoader(handleTextbookLoaded);

  const handleToggleChapter = useCallback(
    (chapterId: string) => {
      dispatch({ type: 'TOGGLE_CHAPTER', payload: chapterId });
    },
    [dispatch]
  );

  const handleSelectSection = useCallback(
    async (sectionId: string) => {
      // READMEの場合は別のアクションをディスパッチ
      if (sectionId === README_SECTION_ID) {
        dispatch({ type: 'SELECT_README' });
      } else {
        dispatch({ type: 'SELECT_SECTION', payload: sectionId });
      }
      dispatch({ type: 'SET_LOADING', payload: true });

      // スクロールを先頭にリセット
      window.scrollTo({ top: 0, behavior: 'smooth' });

      try {
        const content = await loadSectionContent(sectionId);
        dispatch({ type: 'SET_CONTENT', payload: content });
      } catch (err) {
        dispatch({ type: 'SET_ERROR', payload: (err as Error).message });
      }
    },
    [dispatch, loadSectionContent]
  );

  const handleBreadcrumbNavigate = useCallback(
    (item: BreadcrumbItem) => {
      if (item.type === 'section') {
        handleSelectSection(item.id);
      } else if (item.type === 'chapter') {
        dispatch({ type: 'TOGGLE_CHAPTER', payload: item.id });
      }
      // textbookの場合は何もしない（既にルートにいる）
    },
    [dispatch, handleSelectSection]
  );

  const handleNavigateSection = useCallback(
    (sectionId: string) => {
      handleSelectSection(sectionId);
    },
    [handleSelectSection]
  );

  // キーボードナビゲーション
  useKeyboardNavigation({
    previousId: navigation.previousSectionId,
    nextId: navigation.nextSectionId,
    onNavigate: handleNavigateSection,
    enabled: !!textbook,
  });

  // 最初の節を自動選択（READMEがあればREADMEを最初に表示）
  useEffect(() => {
    if (textbook && !navigation.currentSectionId) {
      if (textbook.hasReadme) {
        handleSelectSection(README_SECTION_ID);
      } else {
        const firstChapter = textbook.chapters[0];
        if (firstChapter?.sections[0]) {
          handleSelectSection(firstChapter.sections[0].id);
        }
      }
    }
  }, [textbook, navigation.currentSectionId, handleSelectSection]);

  const showLoading = isLoading || folderLoading;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* サイドバー */}
      <Sidebar
        textbook={textbook}
        currentSectionId={navigation.currentSectionId}
        onToggleChapter={handleToggleChapter}
        onSelectSection={handleSelectSection}
      />

      {/* メインコンテンツエリア */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* ヘッダー（パンくず + フォルダ選択ボタン） */}
          <div className="mb-6 flex items-center justify-between">
            <Breadcrumbs
              items={navigation.breadcrumbs}
              onNavigate={handleBreadcrumbNavigate}
            />
            <button
              onClick={selectFolder}
              disabled={showLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {showLoading ? '読み込み中...' : 'フォルダを選択'}
            </button>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* コンテンツ */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 min-h-96">
            {showLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : (
              <MarkdownViewer content={currentContent} />
            )}
          </div>

          {/* ナビゲーションボタン */}
          {navigation.currentSectionId && (
            <NavigationButtons
              previousId={navigation.previousSectionId}
              nextId={navigation.nextSectionId}
              onNavigate={handleNavigateSection}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <TextbookProvider>
      <AppContent />
    </TextbookProvider>
  );
}

export default App;
