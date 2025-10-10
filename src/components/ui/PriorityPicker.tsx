'use client';

import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Priority } from '@/lib/types';

interface PriorityPickerProps {
  value?: Priority;
  onChange: (priority: Priority | undefined) => void;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const PRIORITIES: { value: Priority; label: string; icon: string }[] = [
  { value: 'low', label: 'Low', icon: '▼' },
  { value: 'medium', label: 'Medium', icon: '=' },
  { value: 'high', label: 'High', icon: '▲' },
  { value: 'urgent', label: 'Urgent', icon: '!!' },
];

const PRIORITY_STYLES = {
  low: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    hover: 'hover:bg-green-200 dark:hover:bg-green-900/50',
    border: 'border-green-300 dark:border-green-700',
  },
  medium: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-400',
    hover: 'hover:bg-yellow-200 dark:hover:bg-yellow-900/50',
    border: 'border-yellow-300 dark:border-yellow-700',
  },
  high: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-400',
    hover: 'hover:bg-orange-200 dark:hover:bg-orange-900/50',
    border: 'border-orange-300 dark:border-orange-700',
  },
  urgent: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    hover: 'hover:bg-red-200 dark:hover:bg-red-900/50',
    border: 'border-red-300 dark:border-red-700',
  },
};

export default function PriorityPicker({
  value,
  onChange,
  onClose,
  triggerRef,
}: PriorityPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
  }, [triggerRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, triggerRef]);

  const handleSelect = (priority: Priority) => {
    onChange(priority);
    onClose();
  };

  const handleClear = () => {
    onChange(undefined);
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <div
      ref={pickerRef}
      className="fixed w-56 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-[100000]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-2">
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Set Priority
        </h4>
      </div>

      <div className="space-y-1 px-2">
        {PRIORITIES.map((priority) => {
          const styles = PRIORITY_STYLES[priority.value];
          const isSelected = value === priority.value;

          return (
            <button
              key={priority.value}
              onClick={() => handleSelect(priority.value)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all ${
                isSelected
                  ? `${styles.bg} ${styles.text} ring-2 ${styles.border}`
                  : `hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300`
              }`}
            >
              <span className={`text-sm font-medium ${isSelected ? styles.text : ''}`}>
                {priority.icon}
              </span>
              <span className="text-sm font-medium flex-1 text-left">{priority.label}</span>
              {isSelected && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {value && (
        <>
          <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
          <div className="px-2">
            <button
              onClick={handleClear}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span>Clear Priority</span>
            </button>
          </div>
        </>
      )}
    </div>,
    document.body
  );
}

export { PRIORITY_STYLES };
