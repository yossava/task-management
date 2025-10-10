'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ColorPickerProps {
  value?: string;
  showGradient?: boolean;
  onChange: (color: string) => void;
  onToggleGradient: () => void;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  presetColors: string[];
}

export default function ColorPicker({
  value,
  showGradient,
  onChange,
  onToggleGradient,
  onClose,
  triggerRef,
  presetColors,
}: ColorPickerProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const pickerRef = useRef<HTMLDivElement>(null);

  // Calculate position based on trigger element
  useEffect(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right + window.scrollX - 288, // 288px = w-72 (18rem)
      });
    }
  }, [triggerRef]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleColorSelect = (color: string) => {
    onChange(color);
  };

  const handleRemoveColor = () => {
    onChange('');
    onClose();
  };

  return createPortal(
    <div
      ref={pickerRef}
      className="fixed w-72 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 99999
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Select color</h3>

      {/* Color Grid */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {presetColors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => handleColorSelect(color)}
            className={`w-full h-12 rounded-lg transition-all hover:scale-105 focus:outline-none ${
              value === color
                ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-800'
                : ''
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>

      {/* Remove Color Button */}
      <button
        onClick={handleRemoveColor}
        className="w-full px-3 py-2 mb-3 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        Remove color
      </button>

      {/* Gradient Toggle */}
      {value && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-700 dark:text-gray-300">Show gradient background</span>
            <button
              type="button"
              onClick={onToggleGradient}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                showGradient !== false ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showGradient !== false ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </label>
        </div>
      )}
    </div>,
    document.body
  );
}
