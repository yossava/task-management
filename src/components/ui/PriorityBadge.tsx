import { Priority } from '@/lib/types';
import { PRIORITY_STYLES } from './PriorityPicker';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

const PRIORITY_ICONS = {
  low: '▼',
  medium: '=',
  high: '▲',
  urgent: '!!',
};

const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export default function PriorityBadge({ priority, size = 'sm', showIcon = true }: PriorityBadgeProps) {
  const styles = PRIORITY_STYLES[priority];
  const icon = PRIORITY_ICONS[priority];
  const label = PRIORITY_LABELS[priority];

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 ${sizeClasses} rounded-md font-medium ${styles.bg} ${styles.text} border ${styles.border}`}
    >
      {showIcon && <span className="text-[10px]">{icon}</span>}
      <span>{label}</span>
    </span>
  );
}
