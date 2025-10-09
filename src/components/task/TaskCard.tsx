'use client';

import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/lib/types';
import Card from '@/components/ui/Card';

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, data: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
    if (isEditingTitle) {
      titleRef.current?.focus();
      titleRef.current?.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDescription) {
      descriptionRef.current?.focus();
      descriptionRef.current?.select();
    }
  }, [isEditingDescription]);

  const handleTitleSave = () => {
    setIsEditingTitle(false);
    if (title.trim() && title !== task.title) {
      onUpdate(task.id, { title: title.trim() });
    } else {
      setTitle(task.title);
    }
  };

  const handleDescriptionSave = () => {
    setIsEditingDescription(false);
    if (description.trim() !== task.description) {
      onUpdate(task.id, { description: description.trim() });
    } else {
      setDescription(task.description || '');
    }
  };

  const handlePriorityChange = () => {
    const priorities: Array<'low' | 'medium' | 'high' | 'urgent'> = ['low', 'medium', 'high', 'urgent'];
    const currentIndex = priorities.indexOf(task.priority);
    const nextPriority = priorities[(currentIndex + 1) % priorities.length];
    onUpdate(task.id, { priority: nextPriority });
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className="group hover:shadow-lg transition-all cursor-grab active:cursor-grabbing">
        <div className="p-4" {...listeners}>
        <div className="flex items-start justify-between mb-2">
          {isEditingTitle ? (
            <textarea
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleTitleSave();
                } else if (e.key === 'Escape') {
                  setTitle(task.title);
                  setIsEditingTitle(false);
                }
              }}
              rows={2}
              className="flex-1 pr-2 font-semibold text-gray-900 dark:text-white bg-transparent border-b-2 border-blue-500 focus:outline-none resize-none"
            />
          ) : (
            <h4
              className="font-semibold text-gray-900 dark:text-white flex-1 pr-2 cursor-text hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1 -mx-1 py-0.5"
              onClick={() => setIsEditingTitle(true)}
            >
              {task.title}
            </h4>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this task?')) {
                onDelete(task.id);
              }
            }}
            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Delete task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isEditingDescription ? (
          <textarea
            ref={descriptionRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleDescriptionSave}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setDescription(task.description || '');
                setIsEditingDescription(false);
              }
            }}
            placeholder="Add a description..."
            rows={3}
            className="w-full mb-3 text-sm text-gray-600 dark:text-gray-400 bg-transparent border-b-2 border-blue-500 focus:outline-none resize-none"
          />
        ) : (
          task.description || isEditingDescription ? (
            <p
              className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 cursor-text hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1 -mx-1 py-0.5"
              onClick={() => setIsEditingDescription(true)}
            >
              {task.description || 'Add a description...'}
            </p>
          ) : (
            <button
              onClick={() => setIsEditingDescription(true)}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1 -mx-1 py-0.5"
            >
              Add a description...
            </button>
          )
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePriorityChange}
            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium transition-all hover:scale-105 ${PRIORITY_COLORS[task.priority]}`}
          >
            {task.priority}
          </button>

          {task.tags && task.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {task.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{task.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
        </div>
      </Card>
    </div>
  );
}
