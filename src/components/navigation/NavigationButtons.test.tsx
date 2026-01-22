import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavigationButtons } from './NavigationButtons';

describe('NavigationButtons', () => {
  it('前へ・次へボタンを表示する', () => {
    render(
      <NavigationButtons
        previousId="phase1/01_intro"
        nextId="phase1/03_summary"
        onNavigate={() => {}}
      />
    );
    expect(screen.getByText('← 前へ')).toBeInTheDocument();
    expect(screen.getByText('次へ →')).toBeInTheDocument();
  });

  it('前の節がない場合、前へボタンは無効', () => {
    render(
      <NavigationButtons
        previousId={null}
        nextId="phase1/02_basics"
        onNavigate={() => {}}
      />
    );
    expect(screen.getByText('← 前へ')).toBeDisabled();
    expect(screen.getByText('次へ →')).not.toBeDisabled();
  });

  it('次の節がない場合、次へボタンは無効', () => {
    render(
      <NavigationButtons
        previousId="phase1/01_intro"
        nextId={null}
        onNavigate={() => {}}
      />
    );
    expect(screen.getByText('← 前へ')).not.toBeDisabled();
    expect(screen.getByText('次へ →')).toBeDisabled();
  });

  it('前へボタンクリックでonNavigateが呼ばれる', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <NavigationButtons
        previousId="phase1/01_intro"
        nextId="phase1/03_summary"
        onNavigate={onNavigate}
      />
    );

    await user.click(screen.getByText('← 前へ'));
    expect(onNavigate).toHaveBeenCalledWith('phase1/01_intro');
  });

  it('次へボタンクリックでonNavigateが呼ばれる', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <NavigationButtons
        previousId="phase1/01_intro"
        nextId="phase1/03_summary"
        onNavigate={onNavigate}
      />
    );

    await user.click(screen.getByText('次へ →'));
    expect(onNavigate).toHaveBeenCalledWith('phase1/03_summary');
  });

  it('両方nullの場合もレンダリングされる', () => {
    render(
      <NavigationButtons
        previousId={null}
        nextId={null}
        onNavigate={() => {}}
      />
    );
    expect(screen.getByText('← 前へ')).toBeDisabled();
    expect(screen.getByText('次へ →')).toBeDisabled();
  });
});
