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

export function BoardCard({ board, onUpdate, onDelete }: BoardCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [title, setTitle] = useState(board.title);
  const [description, setDescription] = useState(board.description || '');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const newTaskRef = useRef<HTMLInputElement>(null);
  const editTaskRef = useRef<HTMLInputElement>(null);

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

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
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
                className="text-xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-blue-500 focus:outline-none w-full"
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
                className="w-full mt-2 text-gray-600 dark:text-gray-400 bg-transparent border-b-2 border-blue-500 focus:outline-none resize-none"
              />
            ) : (
              board.description || isEditingDescription ? (
                <p
                  onClick={() => setIsEditingDescription(true)}
                  className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-2 cursor-text hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1 -mx-1"
                >
                  {board.description || 'Add a description...'}
                </p>
              ) : (
                <button
                  onClick={() => setIsEditingDescription(true)}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mt-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1 -mx-1"
                >
                  Add a description...
                </button>
              )
            )}
          </div>
          {board.color && (
            <div
              className="w-4 h-4 rounded-full ml-4 flex-shrink-0"
              style={{ backgroundColor: board.color }}
            />
          )}
        </div>

        {/* Task List */}
        {(board.tasks && board.tasks.length > 0) || isAddingTask ? (
          <div className="mt-4 space-y-2">
            {board.tasks?.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-2.5 group/task bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg px-3 py-2.5 transition-all cursor-pointer relative border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Checkbox - positioned absolutely on the left */}
                <button
                  onClick={() => handleToggleTask(task)}
                  className={`absolute left-2 flex-shrink-0 w-4 h-4 rounded-full border-2 transition-all duration-150 flex items-center justify-center ${
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
                  className={`flex-1 min-w-0 transition-all duration-150 ${
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
                      className="w-full text-sm bg-white dark:bg-gray-800 border-b border-blue-500 focus:outline-none text-gray-900 dark:text-white px-0.5"
                    />
                  ) : (
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
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditTask(task)}
                    className="flex-shrink-0 opacity-0 group-hover/task:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-0.5"
                    aria-label="Edit task"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="flex-shrink-0 opacity-0 group-hover/task:opacity-100 transition-opacity text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-0.5"
                    aria-label="Delete task"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {isAddingTask && (
              <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="w-4 h-4 flex-shrink-0" /> {/* Spacer for checkbox alignment */}
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
                  className="flex-1 text-sm bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
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
            className="mt-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-gray-700/30 transition-colors flex items-center gap-1.5 px-2 py-1.5 rounded w-full"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add an item
          </button>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Created {formatDate(board.createdAt)}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              if (confirm(`Are you sure you want to delete "${board.title}"? This will also delete all columns and tasks.`)) {
                onDelete(board.id);
              }
            }}
            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
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
