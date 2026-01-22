import type { BreadcrumbItem } from '../../types';

interface BreadcrumbsProps {
  /** パンくずアイテムの配列 */
  items: BreadcrumbItem[];
  /** ナビゲーションハンドラ */
  onNavigate: (item: BreadcrumbItem) => void;
}

export function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps) {
  if (items.length === 0) {
    return <nav className="text-sm text-gray-600" aria-label="パンくずリスト" />;
  }

  return (
    <nav className="text-sm text-gray-600" aria-label="パンくずリスト">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={item.id} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-400">/</span>
              )}
              {isLast ? (
                <span className="text-gray-800 font-medium">{item.label}</span>
              ) : (
                <button
                  onClick={() => onNavigate(item)}
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
