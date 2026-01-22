import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages用: リポジトリ名に合わせて変更してください
  // 例: リポジトリが https://github.com/username/my-textbook-viewer の場合
  // base: '/my-textbook-viewer/'
  base: '/Markdown_viewer/',
})
