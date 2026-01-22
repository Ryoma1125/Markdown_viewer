import { useEffect, useCallback } from 'react';

interface UseKeyboardNavigationOptions {
  /** 前の節ID */
  previousId: string | null;
  /** 次の節ID */
  nextId: string | null;
  /** ナビゲーションハンドラ */
  onNavigate: (sectionId: string) => void;
  /** 有効かどうか */
  enabled?: boolean;
}

/**
 * キーボードナビゲーションフック
 * - 左矢印キー: 前の節へ
 * - 右矢印キー: 次の節へ
 */
export function useKeyboardNavigation({
  previousId,
  nextId,
  onNavigate,
  enabled = true,
}: UseKeyboardNavigationOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // 入力フィールドにフォーカスがある場合は無視
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          if (previousId) {
            event.preventDefault();
            onNavigate(previousId);
          }
          break;
        case 'ArrowRight':
          if (nextId) {
            event.preventDefault();
            onNavigate(nextId);
          }
          break;
      }
    },
    [previousId, nextId, onNavigate]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}
