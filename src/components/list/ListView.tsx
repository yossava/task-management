'use client';

import { useState, useMemo } from 'react';
import { Board, BoardTask } from '@/lib/types';
import TaskDetailModal from '@/components/task/TaskDetailModal';

interface ListViewProps {
  boards: Board[];
  onTaskUpdate: (boardId: string, taskId: string, updates: Partial<BoardTask>) => void;
  onTaskDelete?: (boardId: string, taskId: string) => void;
}

type SortColumn = 'title' | 'board' | 'status' | 'priority' | 'dueDate' | 'tags';
type SortDirection = 'asc' | 'desc';

interface TaskWithBoard extends BoardTask {
  boardId: string;
  boardTitle: string;
  boardColor?: string;
}

const PRIORITY_ORDER = { high: 3, medium: 2, low: 1, urgent: 4 };
const STATUS_ORDER = { incomplete: 1, complete: 2 };

export default function ListView({ boards, onTaskUpdate, onTaskDelete }: ListViewProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [detailModalOpen, setDetailModalOpen] = useState<{ boardId: string; taskId: string } | null>(null);

  // Flatten all tasks with their board info
  const allTasks = useMemo(() => {
    const tasks: TaskWithBoard[] = [];
    boards.forEach((board) => {
      board.tasks?.forEach((task) => {
        tasks.push({
          ...task,
          boardId: board.id,
          boardTitle: board.title,
          boardColor: board.color,
        });
      });
    });
    return tasks;
  }, [boards]);

  // Sort tasks
  const sortedTasks = useMemo(() => {
    const sorted = [...allTasks];
    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case 'title':
          comparison = a.text.localeCompare(b.text);
          break;
        case 'board':
          comparison = a.boardTitle.localeCompare(b.boardTitle);
          break;
        case 'status':
          const aStatus = a.completed ? 'complete' : 'incomplete';
          const bStatus = b.completed ? 'complete' : 'incomplete';
          comparison = STATUS_ORDER[aStatus] - STATUS_ORDER[bStatus];
          break;
        case 'priority':
          const aPriority = a.priority || 'low';
          const bPriority = b.priority || 'low';
          comparison = PRIORITY_ORDER[bPriority] - PRIORITY_ORDER[aPriority];
          break;
        case 'dueDate':
          const aDate = a.dueDate || Infinity;
          const bDate = b.dueDate || Infinity;
          comparison = aDate - bDate;
          break;
        case 'tags':
          const aTags = a.tags?.join(',') || '';
          const bTags = b.tags?.join(',') || '';
          comparison = aTags.localeCompare(bTags);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [allTasks, sortColumn, sortDirection]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedTasks.size === sortedTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(sortedTasks.map((t) => `${t.boardId}-${t.id}`)));
    }
  };

  const handleSelectTask = (boardId: string, taskId: string) => {
    const key = `${boardId}-${taskId}`;
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedTasks(newSelected);
  };

  const handleBulkAction = (action: 'delete' | 'complete' | 'incomplete') => {
    selectedTasks.forEach((key) => {
      const [boardId, taskId] = key.split('-');
      if (action === 'delete' && onTaskDelete) {
        onTaskDelete(boardId, taskId);
      } else if (action === 'complete') {
        onTaskUpdate(boardId, taskId, { completed: true });
      } else if (action === 'incomplete') {
        onTaskUpdate(boardId, taskId, { completed: false });
      }
    });
    setSelectedTasks(new Set());
  };

  const handleEditStart = (task: TaskWithBoard) => {
    setEditingTask(`${task.boardId}-${task.id}`);
    setEditValue(task.text);
  };

  const handleEditSave = (boardId: string, taskId: string) => {
    if (editValue.trim()) {
      onTaskUpdate(boardId, taskId, { text: editValue.trim() });
    }
    setEditingTask(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingTask(null);
    setEditValue('');
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getStatusBadge = (completed: boolean) => {
    return completed
      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '-';
    const d = new Date(timestamp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(timestamp);
    taskDate.setHours(0, 0, 0, 0);
    const diffTime = taskDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="text-red-600 dark:text-red-400 font-medium">Overdue</span>;
    } else if (diffDays === 0) {
      return <span className="text-orange-600 dark:text-orange-400 font-medium">Today</span>;
    } else if (diffDays === 1) {
      return <span className="text-yellow-600 dark:text-yellow-400">Tomorrow</span>;
    } else {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedTasks.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {selectedTasks.size} task{selectedTasks.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('complete')}
                className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800 rounded-lg transition-colors"
              >
                Mark Complete
              </button>
              <button
                onClick={() => handleBulkAction('incomplete')}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Mark Incomplete
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedTasks.size === sortedTasks.length && sortedTasks.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </th>
                <th
                  onClick={() => handleSort('title')}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Task
                    <SortIcon column="title" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('board')}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Board
                    <SortIcon column="board" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Status
                    <SortIcon column="status" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('priority')}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Priority
                    <SortIcon column="priority" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('dueDate')}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Due Date
                    <SortIcon column="dueDate" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('tags')}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Tags
                    <SortIcon column="tags" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-sm font-medium">No tasks found</p>
                      <p className="text-xs mt-1">Create a task in a board to see it here</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedTasks.map((task) => {
                  const taskKey = `${task.boardId}-${task.id}`;
                  const isSelected = selectedTasks.has(taskKey);
                  const isEditing = editingTask === taskKey;

                  return (
                    <tr
                      key={taskKey}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-950' : ''
                      }`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectTask(task.boardId, task.id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => handleEditSave(task.boardId, task.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEditSave(task.boardId, task.id);
                              if (e.key === 'Escape') handleEditCancel();
                            }}
                            autoFocus
                            className="w-full px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-blue-600"
                          />
                        ) : (
                          <div
                            onDoubleClick={() => handleEditStart(task)}
                            className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {task.text}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: `${task.boardColor}20`, color: task.boardColor }}
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: task.boardColor }} />
                          {task.boardTitle}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(task.completed)}`}>
                          {task.completed ? 'Complete' : 'Incomplete'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Low'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {formatDate(task.dueDate)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {task.tags && task.tags.length > 0 ? (
                            task.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setDetailModalOpen({ boardId: task.boardId, taskId: task.id })}
                            className="p-1 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEditStart(task)}
                            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {onTaskDelete && (
                            <button
                              onClick={() => onTaskDelete(task.boardId, task.id)}
                              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div>
          Showing <span className="font-medium text-gray-900 dark:text-white">{sortedTasks.length}</span> task{sortedTasks.length !== 1 ? 's' : ''} across{' '}
          <span className="font-medium text-gray-900 dark:text-white">{boards.length}</span> board{boards.length !== 1 ? 's' : ''}
        </div>
        <div className="flex items-center gap-4">
          <span>
            Completed:{' '}
            <span className="font-medium text-green-600 dark:text-green-400">
              {sortedTasks.filter((t) => t.completed).length}
            </span>
          </span>
          <span>
            Incomplete:{' '}
            <span className="font-medium text-gray-600 dark:text-gray-400">
              {sortedTasks.filter((t) => !t.completed).length}
            </span>
          </span>
        </div>
      </div>

      {/* Task Detail Modal */}
      {detailModalOpen && (() => {
        const board = boards.find(b => b.id === detailModalOpen.boardId);
        const task = board?.tasks?.find(t => t.id === detailModalOpen.taskId);

        if (!board || !task) return null;

        return (
          <TaskDetailModal
            task={task}
            boardId={board.id}
            isOpen={true}
            onClose={() => setDetailModalOpen(null)}
            onUpdate={(updates) => onTaskUpdate(detailModalOpen.boardId, detailModalOpen.taskId, updates)}
            availableTags={board.tags || []}
            onManageTags={() => {}} // Tag management not available in list view
          />
        );
      })()}
    </div>
  );
}
