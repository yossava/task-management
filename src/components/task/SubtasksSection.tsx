'use client';

import { useState } from 'react';
import { BoardTask } from '@/lib/types';
import { SubtaskService } from '@/lib/services/subtaskService';

interface SubtasksSectionProps {
  boardId: string;
  taskId: string;
  subtasks: BoardTask[];
  onUpdate: () => void;
}

export default function SubtasksSection({ boardId, taskId, subtasks, onUpdate }: SubtasksSectionProps) {
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;

    SubtaskService.addSubtask(boardId, taskId, {
      text: newSubtaskText.trim(),
      completed: false,
    });

    setNewSubtaskText('');
    setIsAdding(false);
    onUpdate();
  };

  const handleToggleSubtask = (subtaskId: string, completed: boolean) => {
    SubtaskService.updateSubtask(boardId, taskId, subtaskId, { completed });
    onUpdate();
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    if (!confirm('Delete this subtask?')) return;
    SubtaskService.deleteSubtask(boardId, taskId, subtaskId);
    onUpdate();
  };

  const handlePromoteSubtask = (subtaskId: string) => {
    if (!confirm('Promote this subtask to a standalone task?')) return;
    SubtaskService.promoteToTask(boardId, taskId, subtaskId);
    onUpdate();
  };

  const completedCount = subtasks.filter((s) => s.completed).length;
  const progress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Subtasks ({completedCount}/{subtasks.length})
          </h3>
        </div>
        {subtasks.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{progress}%</span>
          </div>
        )}
      </div>

      {/* Subtasks List */}
      {subtasks.length > 0 && (
        <div className="space-y-2">
          {subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className="group flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              <input
                type="checkbox"
                checked={subtask.completed}
                onChange={(e) => handleToggleSubtask(subtask.id, e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <div className={`text-sm ${subtask.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                  {subtask.text}
                </div>
                {subtask.dueDate && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Due: {new Date(subtask.dueDate).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handlePromoteSubtask(subtask.id)}
                  className="p-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  title="Promote to task"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteSubtask(subtask.id)}
                  className="p-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  title="Delete subtask"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Subtask */}
      {isAdding ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newSubtaskText}
            onChange={(e) => setNewSubtaskText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSubtask();
              } else if (e.key === 'Escape') {
                setNewSubtaskText('');
                setIsAdding(false);
              }
            }}
            placeholder="Subtask name..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            onClick={handleAddSubtask}
            disabled={!newSubtaskText.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
          <button
            onClick={() => {
              setNewSubtaskText('');
              setIsAdding(false);
            }}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Subtask
        </button>
      )}

      {/* Info */}
      {subtasks.length === 0 && !isAdding && (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-xs">
          Break down this task into smaller subtasks
        </div>
      )}
    </div>
  );
}
