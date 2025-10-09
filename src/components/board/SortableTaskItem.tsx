'use client';

import { useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BoardTask } from '@/lib/types';
import DatePicker from '@/components/ui/DatePicker';
import ColorPicker from '@/components/ui/ColorPicker';

interface SortableTaskItemProps {
  task: BoardTask;
  onToggle: () => void;
  onEdit: () => void;
  onSaveEdit: () => void;
  isEditing: boolean;
  editingText: string;
  onEditingTextChange: (text: string) => void;
  taskMenuOpen: boolean;
  onTaskMenuToggle: () => void;
  datePickerOpen: boolean;
  onDatePickerToggle: () => void;
  colorPickerOpen: boolean;
  onColorPickerToggle: () => void;
  onSetDueDate: (timestamp: number) => void;
  onSetColor: (color: string) => void;
  onToggleGradient: () => void;
  isOverdue: (dueDate: number) => boolean;
  formatDueDate: (timestamp: number) => string;
  menuRef: React.RefObject<HTMLDivElement | null>;
  editTaskRef: React.RefObject<HTMLInputElement | null>;
  presetColors: string[];
}

export function SortableTaskItem({
  task,
  onToggle,
  onEdit,
  onSaveEdit,
  isEditing,
  editingText,
  onEditingTextChange,
  taskMenuOpen,
  onTaskMenuToggle,
  datePickerOpen,
  onDatePickerToggle,
  colorPickerOpen,
  onColorPickerToggle,
  onSetDueDate,
  onSetColor,
  onToggleGradient,
  isOverdue,
  formatDueDate,
  menuRef,
  editTaskRef,
  presetColors,
}: SortableTaskItemProps) {
  const pickerTriggerRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      data-task-id={task.id}
      className="flex items-center gap-2.5 group/task bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg px-3 py-2.5 transition-all relative border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Checkbox - positioned absolutely on the left */}
      <button
        onClick={onToggle}
        className={`absolute left-3 flex-shrink-0 w-4 h-4 rounded-full border-2 transition-all duration-150 flex items-center justify-center z-10 focus:outline-none ${
          task.completed ? 'opacity-100' : 'opacity-0 group-hover/task:opacity-100'
        }`}
        style={{
          backgroundColor: task.completed ? '#10b981' : 'transparent',
          borderColor: task.completed ? '#10b981' : '#d1d5db',
        }}
      >
        {task.completed && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Text content - with left margin when checkbox is visible */}
      <div
        className={`flex-1 min-w-0 transition-all duration-150 relative z-10 ${
          task.completed || 'group-hover/task:ml-6'
        } ${task.completed ? 'ml-6' : ''}`}
      >
        {isEditing ? (
          <input
            ref={editTaskRef}
            type="text"
            value={editingText}
            onChange={(e) => onEditingTextChange(e.target.value)}
            onBlur={onSaveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSaveEdit();
              } else if (e.key === 'Escape') {
                onSaveEdit();
              }
            }}
            className="w-full text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 focus:shadow-md text-gray-900 dark:text-white transition-all"
          />
        ) : (
          <div className="flex flex-col gap-1">
            <span
              onClick={onEdit}
              className={`text-sm cursor-text select-none ${
                task.completed
                  ? 'text-gray-500 dark:text-gray-400'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {task.text}
            </span>
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    isOverdue(task.dueDate) && !task.completed
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {formatDueDate(task.dueDate)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div ref={pickerTriggerRef} className="flex items-center gap-1 relative z-10">
        {/* Drag Handle */}
        <button
          type="button"
          {...listeners}
          className="flex-shrink-0 p-0.5 opacity-0 group-hover/task:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
          aria-label="Drag to reorder"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
            <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
          </svg>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onTaskMenuToggle();
          }}
          className="flex-shrink-0 opacity-0 group-hover/task:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-0.5 focus:outline-none"
          aria-label="Edit task"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {taskMenuOpen && (
          <div
            ref={menuRef}
            className="absolute right-0 top-8 w-56 bg-white rounded-lg shadow-2xl border border-gray-200 py-2"
            style={{ zIndex: 99999 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                // TODO: Implement open card functionality
                onTaskMenuToggle();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>Open card</span>
            </button>
            <button
              onClick={() => {
                onColorPickerToggle();
                onTaskMenuToggle();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <span>Change color</span>
            </button>
            <button
              onClick={() => {
                onDatePickerToggle();
                onTaskMenuToggle();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Edit dates</span>
            </button>
          </div>
        )}

        {/* Date Picker */}
        {datePickerOpen && (
          <DatePicker
            value={task.dueDate}
            onChange={onSetDueDate}
            onClose={onDatePickerToggle}
            triggerRef={pickerTriggerRef}
          />
        )}

        {/* Color Picker */}
        {colorPickerOpen && (
          <ColorPicker
            value={task.color}
            showGradient={task.showGradient}
            onChange={onSetColor}
            onToggleGradient={onToggleGradient}
            onClose={onColorPickerToggle}
            triggerRef={pickerTriggerRef}
            presetColors={presetColors}
          />
        )}
      </div>

      {/* Color Gradient Background */}
      {task.color && (
        <>
          {task.showGradient !== false && (
            <div
              className="absolute inset-0 rounded-lg opacity-20"
              style={{
                background: `linear-gradient(to right, ${task.color}, white)`
              }}
            />
          )}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
            style={{ backgroundColor: task.color }}
          />
        </>
      )}
    </div>
  );
}
