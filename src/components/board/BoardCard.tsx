'use client';

import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Board, BoardTask, Priority } from '@/lib/types';
import Card from '@/components/ui/Card';
import { BoardService } from '@/lib/services/boardService';
import { SortableTaskItem } from './SortableTaskItem';
import TaskDetailModal from '@/components/task/TaskDetailModal';

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
  const [priorityPickerOpen, setPriorityPickerOpen] = useState<string | null>(null);
  const [boardColorPickerOpen, setBoardColorPickerOpen] = useState(false);
  const [taskDetailOpen, setTaskDetailOpen] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const newTaskRef = useRef<HTMLInputElement>(null);
  const editTaskRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
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
    transition: transition || 'transform 200ms ease',
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


  const handleSetDueDate = (task: BoardTask, timestamp: number) => {
    const dueDate = timestamp || undefined; // 0 means clear date
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

  const handleSetTaskPriority = (task: BoardTask, priority: Priority | undefined) => {
    BoardService.updateTask(board.id, task.id, { priority });
    const updatedTasks = board.tasks.map(t =>
      t.id === task.id ? { ...t, priority } : t
    );
    onUpdate(board.id, { tasks: updatedTasks });
    setPriorityPickerOpen(null);
    setTaskMenuOpen(null);
  };

  const handleUpdateTaskDetails = (task: BoardTask, updates: Partial<BoardTask>) => {
    BoardService.updateTask(board.id, task.id, updates);
    const updatedTasks = board.tasks.map(t =>
      t.id === task.id ? { ...t, ...updates } : t
    );
    onUpdate(board.id, { tasks: updatedTasks });
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = board.tasks.filter(t => t.id !== taskId);
    BoardService.deleteTask(board.id, taskId);
    onUpdate(board.id, { tasks: updatedTasks });
  };

  const calculateBoardProgress = () => {
    if (!board.tasks || board.tasks.length === 0) return 0;
    const completedTasks = board.tasks.filter(t => t.completed).length;
    return Math.round((completedTasks / board.tasks.length) * 100);
  };

  const boardProgress = calculateBoardProgress();

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        zIndex: (taskMenuOpen || colorPickerOpen || datePickerOpen || priorityPickerOpen) ? 9999 : 'auto'
      }}
      {...attributes}
      data-board-id={board.id}
    >
      <Card className="group hover:shadow-lg transition-shadow">
        <div className="p-6">
        {/* Header with drag handle */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
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
              <h3
                onClick={() => setIsEditingTitle(true)}
                className="text-xl font-bold text-gray-900 dark:text-white cursor-text hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1 -mx-1"
              >
                {board.title}
              </h3>
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
          <div className="relative ml-4 flex-shrink-0 flex items-center gap-2">
            {/* Circular Progress Indicator */}
            {board.tasks && board.tasks.length > 0 && (
              <div className="relative w-7 h-7 flex-shrink-0">
                <svg className="w-7 h-7 transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="14"
                    cy="14"
                    r="11"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="14"
                    cy="14"
                    r="11"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 11}`}
                    strokeDashoffset={`${2 * Math.PI * 11 * (1 - boardProgress / 100)}`}
                    className={`transition-all duration-300 ${
                      boardProgress === 100
                        ? 'text-green-500'
                        : boardProgress >= 50
                        ? 'text-blue-500'
                        : 'text-gray-400'
                    }`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  {boardProgress === 100 ? (
                    <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-[9px] font-semibold text-gray-700 dark:text-gray-300 tabular-nums">
                      {boardProgress}
                    </span>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setBoardColorPickerOpen(!boardColorPickerOpen);
              }}
              className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors focus:outline-none"
              style={{ backgroundColor: board.color || '#3b82f6' }}
              aria-label="Change board color"
            />

            {/* Drag Handle Icon */}
            <div
              className="flex-shrink-0 cursor-grab active:cursor-grabbing"
              {...listeners}
            >
              <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" fill="currentColor" viewBox="0 0 16 16">
                <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
              </svg>
            </div>

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
            <SortableContext
              items={board.tasks?.map((task) => task.id) || []}
              strategy={verticalListSortingStrategy}
            >
                {board.tasks?.map((task) => (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
                    onToggle={() => handleToggleTask(task)}
                    onEdit={() => handleEditTask(task)}
                    onSaveEdit={() => handleSaveTaskEdit(task)}
                    onDelete={() => handleDeleteTask(task.id)}
                    isEditing={editingTaskId === task.id}
                    editingText={editingTaskText}
                    onEditingTextChange={setEditingTaskText}
                    taskMenuOpen={taskMenuOpen === task.id}
                    onTaskMenuToggle={() => setTaskMenuOpen(taskMenuOpen === task.id ? null : task.id)}
                    datePickerOpen={datePickerOpen === task.id}
                    onDatePickerToggle={() => setDatePickerOpen(datePickerOpen === task.id ? null : task.id)}
                    colorPickerOpen={colorPickerOpen === task.id}
                    onColorPickerToggle={() => setColorPickerOpen(colorPickerOpen === task.id ? null : task.id)}
                    priorityPickerOpen={priorityPickerOpen === task.id}
                    onPriorityPickerToggle={() => setPriorityPickerOpen(priorityPickerOpen === task.id ? null : task.id)}
                    onSetDueDate={(timestamp) => handleSetDueDate(task, timestamp)}
                    onSetColor={(color) => handleSetTaskColor(task, color)}
                    onToggleGradient={() => handleToggleGradient(task)}
                    onSetPriority={(priority) => handleSetTaskPriority(task, priority)}
                    onOpenDetail={() => {
                      setTaskDetailOpen(task.id);
                      setTaskMenuOpen(null);
                    }}
                    isOverdue={isOverdue}
                    formatDueDate={formatDueDate}
                    menuRef={menuRef}
                    editTaskRef={editTaskRef}
                    presetColors={PRESET_COLORS}
                  />
                ))}
            </SortableContext>

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

      {/* Task Detail Modal */}
      {taskDetailOpen && board.tasks?.find(t => t.id === taskDetailOpen) && (
        <TaskDetailModal
          task={board.tasks.find(t => t.id === taskDetailOpen)!}
          isOpen={!!taskDetailOpen}
          onClose={() => setTaskDetailOpen(null)}
          onUpdate={(updates) => handleUpdateTaskDetails(board.tasks.find(t => t.id === taskDetailOpen)!, updates)}
        />
      )}
    </div>
  );
}
