import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';
import { useEffect, useState } from 'react';
import mermaid from 'mermaid';

// Mermaid初期化
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  securityLevel: 'loose',
  themeVariables: {
    primaryColor: '#ffffff',
    primaryBorderColor: '#333333',
    primaryTextColor: '#333333',
    secondaryColor: '#f5f5f5',
    secondaryBorderColor: '#333333',
    tertiaryColor: '#ffffff',
    lineColor: '#333333',
    textColor: '#333333',
    mainBkg: '#ffffff',
    nodeBorder: '#333333',
    clusterBkg: '#f9f9f9',
    clusterBorder: '#333333',
    titleColor: '#333333',
    edgeLabelBackground: '#ffffff',
  },
});

// グローバルなIDカウンター
let mermaidIdCounter = 0;

// Mermaidコンポーネント
function MermaidDiagram({ code }: { code: string }) {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      // 毎回新しいユニークIDを生成
      const id = `mermaid-${Date.now()}-${++mermaidIdCounter}`;
      try {
        // 既存のSVGがあれば削除
        const existingElement = document.getElementById(id);
        if (existingElement) {
          existingElement.remove();
        }
        
        const { svg } = await mermaid.render(id, code);
        setSvg(svg);
        setError(null);
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError(String(err));
        setSvg('');
      }
    };
    renderDiagram();
  }, [code]);

  if (error) {
    return (
      <div className="my-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
        <strong>Mermaid Error:</strong> {error}
        <pre className="mt-2 text-xs overflow-auto">{code}</pre>
      </div>
    );
  }

  return (
    <div
      className="mermaid-container my-4 flex justify-center overflow-auto bg-white p-4 rounded-lg border border-gray-300"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// コードブロックコンポーネント（コピーボタン付き）
function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (language) {
    return (
      <div className="relative group">
        <button
          onClick={handleCopy}
          className="absolute right-2 top-2 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={language}
          PreTag="div"
          className="rounded-lg text-sm"
        >
          {code}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

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
    code({ className, children, node, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      // 親要素がpreかどうかでインラインコードかブロックかを判定
      const isInline = node?.position && !String(children).includes('\n') && !className;
      
      console.log('Code block:', { className, match, isInline, children: String(children).substring(0, 50) });
      
      if (isInline) {
        return (
          <code
            className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800"
            {...props}
          >
            {children}
          </code>
        );
      }

      // Mermaid図の場合
      if (match && match[1] === 'mermaid') {
        return <MermaidDiagram code={String(children).replace(/\n$/, '')} />;
      }

      // 言語指定がある場合はシンタックスハイライト
      if (match) {
        return <CodeBlock code={String(children).replace(/\n$/, '')} language={match[1]} />;
      }

      // 言語指定がない場合も黒背景で表示
      return <CodeBlock code={String(children).replace(/\n$/, '')} />;
    },
  };

  return (
    <article className="prose prose-slate max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </article>
  );
}
