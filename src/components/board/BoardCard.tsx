'use client';

import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import { Board, BoardTask } from '@/lib/types';
import Card from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import { BoardService } from '@/lib/services/boardService';

interface BoardCardProps {
  board: Board;
  onUpdate: (id: string, data: Partial<Board>) => void;
  onDelete: (id: string) => void;
}

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ef4444', // red
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#f97316', // orange
  '#84cc16', // lime
  '#06b6d4', // cyan
  '#a855f7', // violet
  '#f43f5e', // rose
  '#eab308', // yellow
  '#22c55e', // green
  '#0ea5e9', // sky
];

export function BoardCard({ board, onUpdate, onDelete }: BoardCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [title, setTitle] = useState(board.title);
  const [description, setDescription] = useState(board.description || '');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState('');
  const [taskMenuOpen, setTaskMenuOpen] = useState<string | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState<string | null>(null);
  const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null);
  const [boardColorPickerOpen, setBoardColorPickerOpen] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const newTaskRef = useRef<HTMLInputElement>(null);
  const editTaskRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const boardColorPickerRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: board.id });

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

  useEffect(() => {
    if (isAddingTask) {
      newTaskRef.current?.focus();
    }
  }, [isAddingTask]);

  useEffect(() => {
    if (editingTaskId) {
      editTaskRef.current?.focus();
      editTaskRef.current?.select();
    }
  }, [editingTaskId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setTaskMenuOpen(null);
      }
    };

    if (taskMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [taskMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (boardColorPickerRef.current && !boardColorPickerRef.current.contains(event.target as Node)) {
        setBoardColorPickerOpen(false);
      }
    };

    if (boardColorPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [boardColorPickerOpen]);

  useEffect(() => {
    if (datePickerOpen && datePickerRef.current) {
      const input = datePickerRef.current as HTMLInputElement;
      input.showPicker?.();
    }
  }, [datePickerOpen]);

  const handleTitleSave = () => {
    setIsEditingTitle(false);
    if (title.trim() && title !== board.title) {
      onUpdate(board.id, { title: title.trim() });
    } else {
      setTitle(board.title);
    }
  };

  const handleDescriptionSave = () => {
    setIsEditingDescription(false);
    if (description.trim() !== board.description) {
      onUpdate(board.id, { description: description.trim() });
    } else {
      setDescription(board.description || '');
    }
  };

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      const newTask = BoardService.addTask(board.id, newTaskText);
      if (newTask) {
        onUpdate(board.id, { tasks: [...(board.tasks || []), newTask] });
      }
      setNewTaskText('');
      setIsAddingTask(false);
    }
  };

  const handleToggleTask = (task: BoardTask) => {
    BoardService.updateTask(board.id, task.id, { completed: !task.completed });
    const updatedTasks = board.tasks.map(t =>
      t.id === task.id ? { ...t, completed: !t.completed } : t
    );
    onUpdate(board.id, { tasks: updatedTasks });
  };

  const handleEditTask = (task: BoardTask) => {
    setEditingTaskId(task.id);
    setEditingTaskText(task.text);
  };

  const handleSaveTaskEdit = (task: BoardTask) => {
    if (editingTaskText.trim() && editingTaskText !== task.text) {
      BoardService.updateTask(board.id, task.id, { text: editingTaskText.trim() });
      const updatedTasks = board.tasks.map(t =>
        t.id === task.id ? { ...t, text: editingTaskText.trim() } : t
      );
      onUpdate(board.id, { tasks: updatedTasks });
    }
    setEditingTaskId(null);
    setEditingTaskText('');
  };

  const handleDeleteTask = (taskId: string) => {
    BoardService.deleteTask(board.id, taskId);
    const updatedTasks = board.tasks.filter(t => t.id !== taskId);
    onUpdate(board.id, { tasks: updatedTasks });
  };

  const handleSetDueDate = (task: BoardTask, date: string) => {
    const dueDate = new Date(date).getTime();
    BoardService.updateTask(board.id, task.id, { dueDate });
    const updatedTasks = board.tasks.map(t =>
      t.id === task.id ? { ...t, dueDate } : t
    );
    onUpdate(board.id, { tasks: updatedTasks });
    setDatePickerOpen(null);
    setTaskMenuOpen(null);
  };

  const isOverdue = (dueDate: number) => {
    return Date.now() > dueDate;
  };

  const formatDueDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const handleSetTaskColor = (task: BoardTask, color: string) => {
    BoardService.updateTask(board.id, task.id, { color, showGradient: task.showGradient ?? true });
    const updatedTasks = board.tasks.map(t =>
      t.id === task.id ? { ...t, color, showGradient: task.showGradient ?? true } : t
    );
    onUpdate(board.id, { tasks: updatedTasks });
    setColorPickerOpen(null);
    setTaskMenuOpen(null);
  };

  const handleToggleGradient = (task: BoardTask) => {
    const newShowGradient = !task.showGradient;
    BoardService.updateTask(board.id, task.id, { showGradient: newShowGradient });
    const updatedTasks = board.tasks.map(t =>
      t.id === task.id ? { ...t, showGradient: newShowGradient } : t
    );
    onUpdate(board.id, { tasks: updatedTasks });
  };

  const handleSetBoardColor = (color: string) => {
    onUpdate(board.id, { color });
    setBoardColorPickerOpen(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        zIndex: (taskMenuOpen || colorPickerOpen || datePickerOpen) ? 9999 : 'auto'
      }}
      {...attributes}
    >
      <Card className="group hover:shadow-lg transition-shadow cursor-grab active:cursor-grabbing">
        <div className="p-6" {...listeners}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {isEditingTitle ? (
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTitleSave();
                  } else if (e.key === 'Escape') {
                    setTitle(board.title);
                    setIsEditingTitle(false);
                  }
                }}
                className="text-xl font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 focus:shadow-md w-full transition-all"
              />
            ) : (
              <Link href={`/boards/${board.id}`}>
                <h3
                  onClick={(e) => {
                    e.preventDefault();
                    setIsEditingTitle(true);
                  }}
                  className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-text hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1 -mx-1"
                >
                  {board.title}
                </h3>
              </Link>
            )}

            {isEditingDescription ? (
              <textarea
                ref={descriptionRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionSave}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setDescription(board.description || '');
                    setIsEditingDescription(false);
                  }
                }}
                placeholder="Add a description..."
                rows={2}
                className="w-full mt-1 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 focus:shadow-md resize-none transition-all"
              />
            ) : (
              board.description || isEditingDescription ? (
                <p
                  onClick={() => setIsEditingDescription(true)}
                  className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 cursor-text hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1 -mx-1"
                >
                  {board.description || 'Add a description...'}
                </p>
              ) : (
                <button
                  onClick={() => setIsEditingDescription(true)}
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mt-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1 -mx-1 focus:outline-none"
                >
                  Add a description...
                </button>
              )
            )}
          </div>
          <div className="relative ml-4 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setBoardColorPickerOpen(!boardColorPickerOpen);
              }}
              className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors focus:outline-none"
              style={{ backgroundColor: board.color || '#3b82f6' }}
              aria-label="Change board color"
            />

            {/* Board Color Picker */}
            {boardColorPickerOpen && (
              <div
                ref={boardColorPickerRef}
                className="absolute right-0 top-8 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Board Color</h3>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleSetBoardColor(color)}
                      className={`w-full h-10 rounded-lg transition-all hover:scale-105 focus:outline-none ${
                        board.color === color
                          ? 'ring-2 ring-offset-2 ring-blue-500'
                          : ''
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Task List */}
        {(board.tasks && board.tasks.length > 0) || isAddingTask ? (
          <div className="mt-4 space-y-2">
            {board.tasks?.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-2.5 group/task bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg px-3 py-2.5 transition-all cursor-pointer relative border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md"
                style={{ zIndex: taskMenuOpen === task.id ? 9999 : 'auto' }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Checkbox - positioned absolutely on the left */}
                <button
                  onClick={() => handleToggleTask(task)}
                  className={`absolute left-2 flex-shrink-0 w-4 h-4 rounded-full border-2 transition-all duration-150 flex items-center justify-center z-10 focus:outline-none ${
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
                  {editingTaskId === task.id ? (
                    <input
                      ref={editTaskRef}
                      type="text"
                      value={editingTaskText}
                      onChange={(e) => setEditingTaskText(e.target.value)}
                      onBlur={() => handleSaveTaskEdit(task)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveTaskEdit(task);
                        } else if (e.key === 'Escape') {
                          setEditingTaskId(null);
                          setEditingTaskText('');
                        }
                      }}
                      className="w-full text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 focus:shadow-md text-gray-900 dark:text-white transition-all"
                    />
                  ) : (
                    <div className="flex flex-col gap-1">
                      <span
                        onClick={() => handleEditTask(task)}
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
                <div className="flex items-center gap-1 relative z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTaskMenuOpen(taskMenuOpen === task.id ? null : task.id);
                    }}
                    className="flex-shrink-0 opacity-0 group-hover/task:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-0.5 focus:outline-none"
                    aria-label="Edit task"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {taskMenuOpen === task.id && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 top-8 w-56 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 py-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          // TODO: Implement open card functionality
                          setTaskMenuOpen(null);
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
                          setColorPickerOpen(task.id);
                          setTaskMenuOpen(null);
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
                          setDatePickerOpen(task.id);
                          setTaskMenuOpen(null);
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
                  {datePickerOpen === task.id && (
                    <input
                      ref={datePickerRef}
                      type="date"
                      onChange={(e) => handleSetDueDate(task, e.target.value)}
                      onBlur={() => setDatePickerOpen(null)}
                      className="absolute right-0 top-8 opacity-0 w-0 h-0 pointer-events-none"
                      defaultValue={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                    />
                  )}

                  {/* Color Picker */}
                  {colorPickerOpen === task.id && (
                    <div
                      className="absolute right-0 top-8 w-72 bg-white rounded-lg shadow-2xl border border-gray-200 p-4"
                      style={{ zIndex: 10000 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Select color</h3>
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => handleSetTaskColor(task, color)}
                            className={`w-full h-12 rounded-lg transition-all hover:scale-105 focus:outline-none ${
                              task.color === color
                                ? 'ring-2 ring-offset-2 ring-blue-500'
                                : ''
                            }`}
                            style={{ backgroundColor: color }}
                            aria-label={`Select color ${color}`}
                          />
                        ))}
                      </div>
                      {task.color && (
                        <div className="border-t border-gray-200 pt-3">
                          <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-sm text-gray-700">Show gradient background</span>
                            <button
                              type="button"
                              onClick={() => handleToggleGradient(task)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                task.showGradient !== false ? 'bg-blue-600' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  task.showGradient !== false ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </label>
                        </div>
                      )}
                    </div>
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
            ))}

            {isAddingTask && (
              <div className="px-3 py-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm focus-within:border-gray-300 dark:focus-within:border-gray-600 focus-within:shadow-md transition-all outline-none focus-within:outline-none">
                <input
                  ref={newTaskRef}
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onBlur={() => {
                    if (newTaskText.trim()) {
                      handleAddTask();
                    } else {
                      setIsAddingTask(false);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTask();
                    } else if (e.key === 'Escape') {
                      setNewTaskText('');
                      setIsAddingTask(false);
                    }
                  }}
                  placeholder="Add an item"
                  className="w-full text-sm bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                />
              </div>
            )}
          </div>
        ) : null}

        {/* Add Task Button */}
        {!isAddingTask && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsAddingTask(true);
            }}
            className="mt-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-gray-700/30 transition-colors flex items-center gap-1.5 px-2 py-1.5 rounded w-full focus:outline-none"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add an item
          </button>
        )}

        <div className="flex items-center justify-end mt-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (confirm(`Are you sure you want to delete "${board.title}"? This will also delete all columns and tasks.`)) {
                onDelete(board.id);
              }
            }}
            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
            aria-label="Delete board"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        </div>
      </Card>
    </div>
  );
}
