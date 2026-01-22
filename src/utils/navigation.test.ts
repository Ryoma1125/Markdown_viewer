import { describe, it, expect } from 'vitest';
import {
  buildNavigationOrder,
  getAdjacentSections,
  buildBreadcrumbs,
} from './navigation';
import type { Textbook } from '../types';

// テスト用のモックデータ
const createMockTextbook = (): Textbook => ({
  title: 'テスト教科書',
  hasReadme: false,
  chapters: [
    {
      id: 'phase1',
      number: 1,
      title: '基礎編',
      displayTitle: '第1章 基礎編',
      isExpanded: true,
      sections: [
        {
          id: 'phase1/01_intro',
          chapterId: 'phase1',
          number: 1,
          title: 'はじめに',
          displayTitle: '1.1 はじめに',
          files: [],
          isLoaded: false,
        },
        {
          id: 'phase1/02_basics',
          chapterId: 'phase1',
          number: 2,
          title: '基本',
          displayTitle: '1.2 基本',
          files: [],
          isLoaded: false,
        },
      ],
    },
    {
      id: 'phase2',
      number: 2,
      title: '応用編',
      displayTitle: '第2章 応用編',
      isExpanded: false,
      sections: [
        {
          id: 'phase2/01_advanced',
          chapterId: 'phase2',
          number: 1,
          title: '応用',
          displayTitle: '2.1 応用',
          files: [],
          isLoaded: false,
        },
      ],
    },
  ],
});

describe('buildNavigationOrder', () => {
  it('全節をフラットなリストとして返す', () => {
    const textbook = createMockTextbook();
    const order = buildNavigationOrder(textbook);
    expect(order).toHaveLength(3);
    expect(order[0]).toBe('phase1/01_intro');
    expect(order[1]).toBe('phase1/02_basics');
    expect(order[2]).toBe('phase2/01_advanced');
  });

  it('空の教科書は空のリストを返す', () => {
    const textbook: Textbook = { title: '空の教科書', hasReadme: false, chapters: [] };
    const order = buildNavigationOrder(textbook);
    expect(order).toHaveLength(0);
  });
});

describe('getAdjacentSections', () => {
  it('中間の節は前後の節IDを返す', () => {
    const textbook = createMockTextbook();
    const result = getAdjacentSections(textbook, 'phase1/02_basics');
    expect(result.previousId).toBe('phase1/01_intro');
    expect(result.nextId).toBe('phase2/01_advanced');
  });

  it('最初の節は前がnull', () => {
    const textbook = createMockTextbook();
    const result = getAdjacentSections(textbook, 'phase1/01_intro');
    expect(result.previousId).toBeNull();
    expect(result.nextId).toBe('phase1/02_basics');
  });

  it('最後の節は次がnull', () => {
    const textbook = createMockTextbook();
    const result = getAdjacentSections(textbook, 'phase2/01_advanced');
    expect(result.previousId).toBe('phase1/02_basics');
    expect(result.nextId).toBeNull();
  });

  it('存在しない節IDは両方null', () => {
    const textbook = createMockTextbook();
    const result = getAdjacentSections(textbook, 'nonexistent');
    expect(result.previousId).toBeNull();
    expect(result.nextId).toBeNull();
  });
});

describe('buildBreadcrumbs', () => {
  it('節が選択されているとき3階層のパンくずを返す', () => {
    const textbook = createMockTextbook();
    const breadcrumbs = buildBreadcrumbs(textbook, 'phase1/01_intro');
    expect(breadcrumbs).toHaveLength(3);
    expect(breadcrumbs[0]).toEqual({
      label: 'テスト教科書',
      id: 'root',
      type: 'textbook',
    });
    expect(breadcrumbs[1]).toEqual({
      label: '第1章 基礎編',
      id: 'phase1',
      type: 'chapter',
    });
    expect(breadcrumbs[2]).toEqual({
      label: '1.1 はじめに',
      id: 'phase1/01_intro',
      type: 'section',
    });
  });

  it('節が選択されていないとき教科書のみ', () => {
    const textbook = createMockTextbook();
    const breadcrumbs = buildBreadcrumbs(textbook, null);
    expect(breadcrumbs).toHaveLength(1);
    expect(breadcrumbs[0].type).toBe('textbook');
  });

  it('存在しない節IDは教科書のみ', () => {
    const textbook = createMockTextbook();
    const breadcrumbs = buildBreadcrumbs(textbook, 'nonexistent');
    expect(breadcrumbs).toHaveLength(1);
  });
});
