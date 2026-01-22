import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';

interface MarkdownViewerProps {
  /** マークダウンコンテンツ */
  content: string | null;
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  if (content === null) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        節を選択してください
      </div>
    );
  }

  const components: Components = {
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
