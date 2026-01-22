/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from 'react';
import type { AppState, AppAction } from '../types';
import { README_SECTION_ID } from '../types';
import { getAdjacentSections, buildBreadcrumbs } from '../utils/navigation';

/** 初期状態 */
const initialState: AppState = {
  textbook: null,
  navigation: {
    currentSectionId: null,
    currentFilePath: null,
    breadcrumbs: [],
    previousSectionId: null,
    nextSectionId: null,
  },
  currentContent: null,
  isLoading: false,
  error: null,
};

/** リデューサー */
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_TEXTBOOK': {
      const textbook = action.payload;
      return {
        ...state,
        textbook,
        navigation: {
          ...state.navigation,
          breadcrumbs: buildBreadcrumbs(textbook, null),
        },
      };
    }

    case 'TOGGLE_CHAPTER': {
      if (!state.textbook) return state;
      const chapterId = action.payload;
      const updatedChapters = state.textbook.chapters.map((chapter) =>
        chapter.id === chapterId
          ? { ...chapter, isExpanded: !chapter.isExpanded }
          : chapter
      );
      return {
        ...state,
        textbook: {
          ...state.textbook,
          chapters: updatedChapters,
        },
      };
    }

    case 'SELECT_SECTION': {
      if (!state.textbook) return state;
      const sectionId = action.payload;
      const { previousId, nextId } = getAdjacentSections(state.textbook, sectionId);
      const breadcrumbs = buildBreadcrumbs(state.textbook, sectionId);

      // 親章を展開（READMEの場合はスキップ）
      let updatedChapters = state.textbook.chapters;
      if (sectionId !== README_SECTION_ID) {
        const chapterId = sectionId.split('/')[0];
        updatedChapters = state.textbook.chapters.map((chapter) =>
          chapter.id === chapterId ? { ...chapter, isExpanded: true } : chapter
        );
      }

      return {
        ...state,
        textbook: {
          ...state.textbook,
          chapters: updatedChapters,
        },
        navigation: {
          ...state.navigation,
          currentSectionId: sectionId,
          breadcrumbs,
          previousSectionId: previousId,
          nextSectionId: nextId,
        },
      };
    }

    case 'SELECT_README': {
      if (!state.textbook) return state;
      // READMEの場合、次は最初のセクション
      const firstChapter = state.textbook.chapters[0];
      const nextId = firstChapter?.sections[0]?.id ?? null;
      
      return {
        ...state,
        navigation: {
          ...state.navigation,
          currentSectionId: README_SECTION_ID,
          breadcrumbs: [
            {
              label: state.textbook.title,
              id: 'root',
              type: 'textbook',
            },
            {
              label: 'README',
              id: README_SECTION_ID,
              type: 'section',
            },
          ],
          previousSectionId: null,
          nextSectionId: nextId,
        },
      };
    }

    case 'SET_CONTENT':
      return {
        ...state,
        currentContent: action.payload,
        isLoading: false,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

/** コンテキスト型 */
interface TextbookContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}

/** コンテキスト */
const TextbookContext = createContext<TextbookContextValue | null>(null);

/** プロバイダーコンポーネント */
interface TextbookProviderProps {
  children: ReactNode;
}

export function TextbookProvider({ children }: TextbookProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <TextbookContext.Provider value={{ state, dispatch }}>
      {children}
    </TextbookContext.Provider>
  );
}

/** カスタムフック */
export function useTextbook(): TextbookContextValue {
  const context = useContext(TextbookContext);
  if (!context) {
    throw new Error('useTextbook must be used within a TextbookProvider');
  }
  return context;
}
