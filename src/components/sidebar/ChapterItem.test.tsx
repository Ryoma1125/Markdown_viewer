import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChapterItem } from './ChapterItem';
import type { Chapter } from '../../types';

const mockChapter: Chapter = {
  id: 'phase1',
  number: 1,
  title: '基礎編',
  displayTitle: '第1章 基礎編',
  isExpanded: false,
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
};

describe('ChapterItem', () => {
  it('章のタイトルを表示する', () => {
    render(
      <ChapterItem
        chapter={mockChapter}
        currentSectionId={null}
        onToggle={() => {}}
        onSelectSection={() => {}}
      />
    );
    expect(screen.getByText('第1章 基礎編')).toBeInTheDocument();
  });

  it('折りたたみ状態では節を表示しない', () => {
    render(
      <ChapterItem
        chapter={mockChapter}
        currentSectionId={null}
        onToggle={() => {}}
        onSelectSection={() => {}}
      />
    );
    expect(screen.queryByText('1.1 はじめに')).not.toBeInTheDocument();
  });

  it('展開状態では節を表示する', () => {
    const expandedChapter = { ...mockChapter, isExpanded: true };
    render(
      <ChapterItem
        chapter={expandedChapter}
        currentSectionId={null}
        onToggle={() => {}}
        onSelectSection={() => {}}
      />
    );
    expect(screen.getByText('1.1 はじめに')).toBeInTheDocument();
    expect(screen.getByText('1.2 基本')).toBeInTheDocument();
  });

  it('章タイトルをクリックするとonToggleが呼ばれる', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <ChapterItem
        chapter={mockChapter}
        currentSectionId={null}
        onToggle={onToggle}
        onSelectSection={() => {}}
      />
    );

    await user.click(screen.getByText('第1章 基礎編'));
    expect(onToggle).toHaveBeenCalledWith('phase1');
  });

  it('節をクリックするとonSelectSectionが呼ばれる', async () => {
    const user = userEvent.setup();
    const onSelectSection = vi.fn();
    const expandedChapter = { ...mockChapter, isExpanded: true };
    render(
      <ChapterItem
        chapter={expandedChapter}
        currentSectionId={null}
        onToggle={() => {}}
        onSelectSection={onSelectSection}
      />
    );

    await user.click(screen.getByText('1.1 はじめに'));
    expect(onSelectSection).toHaveBeenCalledWith('phase1/01_intro');
  });

  it('選択中の節がハイライトされる', () => {
    const expandedChapter = { ...mockChapter, isExpanded: true };
    render(
      <ChapterItem
        chapter={expandedChapter}
        currentSectionId="phase1/01_intro"
        onToggle={() => {}}
        onSelectSection={() => {}}
      />
    );

    const sectionButton = screen.getByText('1.1 はじめに');
    expect(sectionButton.closest('button')).toHaveClass('bg-blue-100');
  });
});
