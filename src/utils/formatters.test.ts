import { describe, it, expect } from 'vitest';
import {
  parseChapterFolder,
  parseSectionFile,
  formatChapterTitle,
  formatSectionTitle,
} from './formatters';

describe('parseChapterFolder', () => {
  it('phase1 から章番号1を抽出する', () => {
    expect(parseChapterFolder('phase1')).toEqual({
      number: 1,
      title: '',
    });
  });

  it('phase2_基礎編 から章番号2とタイトルを抽出する', () => {
    expect(parseChapterFolder('phase2_基礎編')).toEqual({
      number: 2,
      title: '基礎編',
    });
  });

  it('phase10_応用編 から章番号10とタイトルを抽出する', () => {
    expect(parseChapterFolder('phase10_応用編')).toEqual({
      number: 10,
      title: '応用編',
    });
  });

  it('無効なフォルダ名はnullを返す', () => {
    expect(parseChapterFolder('invalid')).toBeNull();
    expect(parseChapterFolder('chapter1')).toBeNull();
    expect(parseChapterFolder('')).toBeNull();
  });
});

describe('parseSectionFile', () => {
  it('01_はじめに.md から節番号1とタイトルを抽出する', () => {
    expect(parseSectionFile('01_はじめに.md')).toEqual({
      number: 1,
      title: 'はじめに',
    });
  });

  it('02_introduction.md から節番号2とタイトルを抽出する', () => {
    expect(parseSectionFile('02_introduction.md')).toEqual({
      number: 2,
      title: 'introduction',
    });
  });

  it('12_advanced_topics.md から節番号12とタイトルを抽出する', () => {
    expect(parseSectionFile('12_advanced_topics.md')).toEqual({
      number: 12,
      title: 'advanced_topics',
    });
  });

  it('無効なファイル名はnullを返す', () => {
    expect(parseSectionFile('invalid')).toBeNull();
    expect(parseSectionFile('section1.md')).toBeNull();
    expect(parseSectionFile('01_test.txt')).toBeNull();
    expect(parseSectionFile('')).toBeNull();
  });
});

describe('formatChapterTitle', () => {
  it('章番号とタイトルから表示用タイトルを生成する', () => {
    expect(formatChapterTitle(1, '基礎編')).toBe('第1章 基礎編');
    expect(formatChapterTitle(2, '応用編')).toBe('第2章 応用編');
  });

  it('タイトルが空の場合は章番号のみ', () => {
    expect(formatChapterTitle(1, '')).toBe('第1章');
  });
});

describe('formatSectionTitle', () => {
  it('章番号と節番号とタイトルから表示用タイトルを生成する', () => {
    expect(formatSectionTitle(1, 1, 'はじめに')).toBe('1.1 はじめに');
    expect(formatSectionTitle(2, 3, '応用トピック')).toBe('2.3 応用トピック');
  });

  it('タイトルが空の場合は番号のみ', () => {
    expect(formatSectionTitle(1, 1, '')).toBe('1.1');
  });
});
