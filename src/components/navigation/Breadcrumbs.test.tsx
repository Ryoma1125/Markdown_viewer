import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Breadcrumbs } from './Breadcrumbs';
import type { BreadcrumbItem } from '../../types';

const mockBreadcrumbs: BreadcrumbItem[] = [
  { label: 'テスト教科書', id: 'root', type: 'textbook' },
  { label: '第1章 基礎編', id: 'phase1', type: 'chapter' },
  { label: '1.1 はじめに', id: 'phase1/01_intro', type: 'section' },
];

describe('Breadcrumbs', () => {
  it('パンくずアイテムを表示する', () => {
    render(<Breadcrumbs items={mockBreadcrumbs} onNavigate={() => {}} />);
    expect(screen.getByText('テスト教科書')).toBeInTheDocument();
    expect(screen.getByText('第1章 基礎編')).toBeInTheDocument();
    expect(screen.getByText('1.1 はじめに')).toBeInTheDocument();
  });

  it('クリック可能なアイテムでonNavigateが呼ばれる', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<Breadcrumbs items={mockBreadcrumbs} onNavigate={onNavigate} />);

    await user.click(screen.getByText('テスト教科書'));
    expect(onNavigate).toHaveBeenCalledWith({ label: 'テスト教科書', id: 'root', type: 'textbook' });
  });

  it('最後のアイテムはクリック不可（現在位置）', () => {
    render(<Breadcrumbs items={mockBreadcrumbs} onNavigate={() => {}} />);
    const lastItem = screen.getByText('1.1 はじめに');
    expect(lastItem.tagName).toBe('SPAN');
  });

  it('セパレータを表示する', () => {
    render(<Breadcrumbs items={mockBreadcrumbs} onNavigate={() => {}} />);
    const separators = screen.getAllByText('/');
    expect(separators).toHaveLength(2);
  });

  it('空の場合は何も表示しない', () => {
    const { container } = render(<Breadcrumbs items={[]} onNavigate={() => {}} />);
    expect(container.firstChild).toBeEmptyDOMElement();
  });
});
