import { Tag } from '@/lib/types';

interface TagBadgeProps {
  tag: Tag;
  size?: 'sm' | 'md';
  onRemove?: () => void;
}

export default function TagBadge({ tag, size = 'sm', onRemove }: TagBadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 ${sizeClasses} rounded font-normal transition-all`}
      style={{
        backgroundColor: `${tag.color}20`,
        color: tag.color,
      }}
    >
      <span>{tag.name}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-70 transition-opacity"
          aria-label={`Remove ${tag.name} tag`}
        >
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}
