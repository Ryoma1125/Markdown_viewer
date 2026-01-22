import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from './Sidebar';
import type { Textbook } from '../../types';

const mockTextbook: Textbook = {
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
};

describe('Sidebar', () => {
  it('教科書のタイトルを表示する', () => {
    render(
      <Sidebar
        textbook={mockTextbook}
        currentSectionId={null}
        onToggleChapter={() => {}}
        onSelectSection={() => {}}
      />
    );
    expect(screen.getByText('テスト教科書')).toBeInTheDocument();
  });

  it('全ての章を表示する', () => {
    render(
      <Sidebar
        textbook={mockTextbook}
        currentSectionId={null}
        onToggleChapter={() => {}}
        onSelectSection={() => {}}
      />
    );
    expect(screen.getByText('第1章 基礎編')).toBeInTheDocument();
    expect(screen.getByText('第2章 応用編')).toBeInTheDocument();
  });

  it('展開された章の節を表示する', () => {
    render(
      <Sidebar
        textbook={mockTextbook}
        currentSectionId={null}
        onToggleChapter={() => {}}
        onSelectSection={() => {}}
      />
    );
    expect(screen.getByText('1.1 はじめに')).toBeInTheDocument();
    expect(screen.queryByText('2.1 応用')).not.toBeInTheDocument();
  });

  it('章クリックでonToggleChapterが呼ばれる', async () => {
    const user = userEvent.setup();
    const onToggleChapter = vi.fn();
    render(
      <Sidebar
        textbook={mockTextbook}
        currentSectionId={null}
        onToggleChapter={onToggleChapter}
        onSelectSection={() => {}}
      />
    );

    await user.click(screen.getByText('第2章 応用編'));
    expect(onToggleChapter).toHaveBeenCalledWith('phase2');
  });

  it('節クリックでonSelectSectionが呼ばれる', async () => {
    const user = userEvent.setup();
    const onSelectSection = vi.fn();
    render(
      <Sidebar
        textbook={mockTextbook}
        currentSectionId={null}
        onToggleChapter={() => {}}
        onSelectSection={onSelectSection}
      />
    );

    await user.click(screen.getByText('1.1 はじめに'));
    expect(onSelectSection).toHaveBeenCalledWith('phase1/01_intro');
  });

  it('教科書がない場合はプレースホルダーを表示', () => {
    render(
      <Sidebar
        textbook={null}
        currentSectionId={null}
        onToggleChapter={() => {}}
        onSelectSection={() => {}}
      />
    );
    expect(screen.getByText('フォルダを選択してください')).toBeInTheDocument();
  });
});
