import type { Textbook, BreadcrumbItem } from '../types';
import { README_SECTION_ID } from '../types';

/**
 * 教科書の全節をナビゲーション順にフラット化したID配列を作成
 * @param textbook 教科書データ
 * @returns 節IDの配列
 */
export function buildNavigationOrder(textbook: Textbook): string[] {
  const order: string[] = [];
  // READMEがあれば先頭に追加
  if (textbook.hasReadme) {
    order.push(README_SECTION_ID);
  }
  for (const chapter of textbook.chapters) {
    for (const section of chapter.sections) {
      order.push(section.id);
    }
  }
  return order;
}

/**
 * 隣接する節のIDを取得する
 * @param textbook 教科書データ
 * @param currentSectionId 現在の節ID
 * @returns 前後の節ID（存在しない場合はnull）
 */
export function getAdjacentSections(
  textbook: Textbook,
  currentSectionId: string
): { previousId: string | null; nextId: string | null } {
  const order = buildNavigationOrder(textbook);
  const currentIndex = order.indexOf(currentSectionId);

  if (currentIndex === -1) {
    return { previousId: null, nextId: null };
  }

  return {
    previousId: currentIndex > 0 ? order[currentIndex - 1] : null,
    nextId: currentIndex < order.length - 1 ? order[currentIndex + 1] : null,
  };
}

/**
 * パンくずリストを構築する
 * @param textbook 教科書データ
 * @param sectionId 現在の節ID（nullの場合は教科書のみ）
 * @returns パンくずアイテムの配列
 */
export function buildBreadcrumbs(
  textbook: Textbook,
  sectionId: string | null
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: textbook.title,
      id: 'root',
      type: 'textbook',
    },
  ];

  if (!sectionId) {
    return breadcrumbs;
  }

  // 章と節を検索
  for (const chapter of textbook.chapters) {
    const section = chapter.sections.find((s) => s.id === sectionId);
    if (section) {
      breadcrumbs.push({
        label: chapter.displayTitle,
        id: chapter.id,
        type: 'chapter',
      });
      breadcrumbs.push({
        label: section.displayTitle,
        id: section.id,
        type: 'section',
      });
      break;
    }
  }

  return breadcrumbs;
}

/**
 * 節IDから章を検索する
 * @param textbook 教科書データ
 * @param sectionId 節ID
 * @returns 章オブジェクトまたはundefined
 */
export function findChapterBySection(
  textbook: Textbook,
  sectionId: string
) {
  return textbook.chapters.find((chapter) =>
    chapter.sections.some((section) => section.id === sectionId)
  );
}

/**
 * 節IDから節を検索する
 * @param textbook 教科書データ
 * @param sectionId 節ID
 * @returns 節オブジェクトまたはundefined
 */
export function findSection(textbook: Textbook, sectionId: string) {
  for (const chapter of textbook.chapters) {
    const section = chapter.sections.find((s) => s.id === sectionId);
    if (section) {
      return section;
    }
  }
  return undefined;
}
