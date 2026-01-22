import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';

interface MarkdownViewerProps {
  /** マークダウンコンテンツ */
  content: string | null;
  /** 現在の節ID */
  currentSectionId?: string | null;
  /** リンククリック時のハンドラ */
  onLinkClick?: (href: string) => void;
}

export function MarkdownViewer({ content, currentSectionId, onLinkClick }: MarkdownViewerProps) {
  if (content === null) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        節を選択してください
      </div>
    );
  }

  const components: Components = {
    a({ href, children, ...props }) {
      // 相対パス（.md ファイル）へのリンクの場合（./または../で始まる）
      if (href && href.match(/^\.\.?\/.*\.md$/)) {
        const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
          e.preventDefault();
          e.stopPropagation();
          if (onLinkClick && currentSectionId) {
            // 相対パスを解決
            let targetSectionId: string;
            
            if (href.startsWith('../')) {
              // 親ディレクトリへのリンク
              const currentParts = currentSectionId.split('/');
              const relativePath = decodeURIComponent(href.replace('../', ''));
              // phase1/01_xxx.md -> phase2/01_yyy.md
              if (currentParts.length >= 2) {
                targetSectionId = relativePath;
              } else {
                targetSectionId = relativePath;
              }
            } else {
              // 同じディレクトリ内のリンク
              const currentDir = currentSectionId.split('/').slice(0, -1).join('/');
              const fileName = decodeURIComponent(href.replace('./', ''));
              targetSectionId = currentDir ? `${currentDir}/${fileName}` : fileName;
            }
            
            console.log('Link clicked:', {
              href,
              currentSectionId,
              targetSectionId
            });
            onLinkClick(targetSectionId);
          }
          return false;
        };

        return (
          <a
            href="javascript:void(0)"
            onClick={handleClick}
            className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
          >
            {children}
          </a>
        );
      }
      // 外部リンクの場合
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
          {...props}
        >
          {children}
        </a>
      );
    },
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const isInline = !match && !className;
      
      if (isInline) {
        return (
          <code
            className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600"
            {...props}
          >
            {children}
          </code>
        );
      }

      return (
        <SyntaxHighlighter
          style={oneLight}
          language={match ? match[1] : 'text'}
          PreTag="div"
          className="rounded-lg !bg-gray-50 !p-4 text-sm"
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      );
    },
  };

  return (
    <article className="prose prose-gray max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </article>
  );
}
