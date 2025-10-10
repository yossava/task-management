'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  closestCorners,
  DragOverlay,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { BoardCard } from '@/components/board/BoardCard';
import { InlineBoardForm } from '@/components/board/InlineBoardForm';
import { useBoards } from '@/hooks/useBoards';
import { Board, BoardTask, TaskFilters, TaskSort, Tag, BoardTemplate } from '@/lib/types';
import { BoardService } from '@/lib/services/boardService';
import { filterAndSortTasks } from '@/lib/utils/taskFilters';
import Card from '@/components/ui/Card';
import FilterPanel from '@/components/ui/FilterPanel';
import GlobalSearch from '@/components/search/GlobalSearch';
import TemplateGallery from '@/components/board/TemplateGallery';
import { TemplateService } from '@/lib/services/templateService';
import ActivityFeed from '@/components/activity/ActivityFeed';
import ExportImportModal from '@/components/export/ExportImportModal';

const HEADER_STORAGE_KEY = 'boards_page_header';

export default function BoardsPage() {
  const { boards, loading, createBoard, updateBoard, deleteBoard, reorderBoards } = useBoards();
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showExportImport, setShowExportImport] = useState(false);
  const [activeTask, setActiveTask] = useState<BoardTask | null>(null);
  const [activeBoard, setActiveBoard] = useState<Board | null>(null);
  const [pageTitle, setPageTitle] = useState('Your Boards');
  const [pageSubtitle, setPageSubtitle] = useState('Organize and manage all your projects in one place');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingSubtitle, setIsEditingSubtitle] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const subtitleRef = useRef<HTMLInputElement>(null);

  // Filter and sort state
  const [filters, setFilters] = useState<TaskFilters>({
    priorities: [],
    tags: [],
    dateFilter: 'all',
    showCompleted: true,
    searchQuery: '',
  });
  const [sort, setSort] = useState<TaskSort>({
    option: 'priority',
    direction: 'desc',
  });

  // Load header from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(HEADER_STORAGE_KEY);
    if (saved) {
      try {
        const { title, subtitle } = JSON.parse(saved);
        if (title) setPageTitle(title);
        if (subtitle) setPageSubtitle(subtitle);
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  // Save header to localStorage
  const saveHeader = (title: string, subtitle: string) => {
    localStorage.setItem(HEADER_STORAGE_KEY, JSON.stringify({ title, subtitle }));
  };

  useEffect(() => {
    if (isEditingTitle) {
      titleRef.current?.focus();
      titleRef.current?.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingSubtitle) {
      subtitleRef.current?.focus();
      subtitleRef.current?.select();
    }
  }, [isEditingSubtitle]);

  const handleTitleSave = () => {
    setIsEditingTitle(false);
    const trimmed = pageTitle.trim();
    if (trimmed) {
      setPageTitle(trimmed);
      saveHeader(trimmed, pageSubtitle);
    } else {
      setPageTitle('Your Boards');
      saveHeader('Your Boards', pageSubtitle);
    }
  };

  const handleSubtitleSave = () => {
    setIsEditingSubtitle(false);
    const trimmed = pageSubtitle.trim();
    if (trimmed) {
      setPageSubtitle(trimmed);
      saveHeader(pageTitle, trimmed);
    } else {
      setPageSubtitle('Organize and manage all your projects in one place');
      saveHeader(pageTitle, 'Organize and manage all your projects in one place');
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  const handleCreate = (data: Omit<Board, 'id' | 'createdAt' | 'updatedAt' | 'columns' | 'tasks'>) => {
    createBoard({ ...data, tasks: [] });
    setIsCreatingBoard(false);
  };

  const handleTemplateSelect = (template: BoardTemplate) => {
    TemplateService.createBoardFromTemplate(template);
    setShowTemplateGallery(false);
    // Force reload boards - useBoards hook will pick up the change
    window.location.reload();
  };

  const handleUpdate = (id: string, data: Partial<Board>) => {
    updateBoard(id, data);
  };

  const handleDelete = (id: string) => {
    deleteBoard(id);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskInfo = findTaskInBoards(active.id as string);
    if (taskInfo) {
      setActiveTask(taskInfo.task);
    } else {
      // It's a board being dragged
      const board = boards.find(b => b.id === active.id);
      if (board) {
        setActiveBoard(board);
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Only handle board reordering in onDragOver for smoother visual feedback
    const activeTaskInfo = findTaskInBoards(active.id as string);

    if (!activeTaskInfo && active.id !== over.id) {
      // It's a board being dragged over another board
      const oldIndex = boards.findIndex(b => b.id === active.id);
      const newIndex = boards.findIndex(b => b.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newBoards = arrayMove(boards, oldIndex, newIndex);
        reorderBoards(newBoards);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    setActiveBoard(null);
    const { active, over } = event;

    if (!over) return;

    // Check if we're dragging a task
    const activeTaskInfo = findTaskInBoards(active.id as string);
    const overTaskInfo = findTaskInBoards(over.id as string);

    if (activeTaskInfo) {
      // Dragging a task
      const { sourceBoardId, task } = activeTaskInfo;

      if (overTaskInfo) {
        // Dropping on another task - reorder within same board or move to target board
        const { sourceBoardId: targetBoardId } = overTaskInfo;

        if (sourceBoardId === targetBoardId) {
          // Reorder within the same board
          const sourceBoard = boards.find(b => b.id === sourceBoardId);
          if (!sourceBoard) return;

          const tasks = sourceBoard.tasks || [];
          const oldIndex = tasks.findIndex((t) => t.id === active.id);
          const newIndex = tasks.findIndex((t) => t.id === over.id);

          if (oldIndex !== newIndex) {
            const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);
            BoardService.update(sourceBoardId, { tasks: reorderedTasks });
            updateBoard(sourceBoardId, { tasks: reorderedTasks });
          }
        } else {
          // Move to a different board (insert at the position of the target task)
          moveTaskBetweenBoards(sourceBoardId, targetBoardId, task, over.id as string);
        }
      } else {
        // Check if we're dropping on a board card itself
        const targetBoard = boards.find(b => b.id === over.id);

        if (targetBoard && sourceBoardId !== targetBoard.id) {
          // Move task to different board (append to end)
          moveTaskBetweenBoards(sourceBoardId, targetBoard.id, task);
        }
      }
    }
    // Board reordering is now handled in onDragOver for smoother animation
  };

  const findTaskInBoards = (taskId: string): { sourceBoardId: string; task: BoardTask } | null => {
    for (const board of boards) {
      const task = board.tasks?.find(t => t.id === taskId);
      if (task) {
        return { sourceBoardId: board.id, task };
      }
    }
    return null;
  };

  const moveTaskBetweenBoards = (sourceBoardId: string, targetBoardId: string, task: BoardTask, targetTaskId?: string) => {
    const sourceBoard = boards.find(b => b.id === sourceBoardId);
    const targetBoard = boards.find(b => b.id === targetBoardId);

    if (!sourceBoard || !targetBoard) return;

    // Remove task from source board
    const updatedSourceTasks = sourceBoard.tasks.filter(t => t.id !== task.id);

    // Add task to target board
    let updatedTargetTasks: BoardTask[];
    if (targetTaskId) {
      // Insert at specific position
      const targetIndex = targetBoard.tasks.findIndex(t => t.id === targetTaskId);
      updatedTargetTasks = [...targetBoard.tasks];
      updatedTargetTasks.splice(targetIndex, 0, task);
    } else {
      // Append to end
      updatedTargetTasks = [...(targetBoard.tasks || []), task];
    }

    // Update storage
    BoardService.update(sourceBoardId, { tasks: updatedSourceTasks });
    BoardService.update(targetBoardId, { tasks: updatedTargetTasks });

    // Update state
    updateBoard(sourceBoardId, { tasks: updatedSourceTasks });
    updateBoard(targetBoardId, { tasks: updatedTargetTasks });
  };

  // Collect all unique tags from all boards
  const allTags = useMemo(() => {
    const tagMap = new Map<string, Tag>();
    boards.forEach(board => {
      board.tags?.forEach(tag => {
        if (!tagMap.has(tag.id)) {
          tagMap.set(tag.id, tag);
        }
      });
    });
    return Array.from(tagMap.values());
  }, [boards]);

  // Calculate total task count across all boards
  const totalTaskCount = useMemo(() => {
    return boards.reduce((count, board) => count + (board.tasks?.length || 0), 0);
  }, [boards]);

  // Calculate filtered task count
  const filteredTaskCount = useMemo(() => {
    let count = 0;
    boards.forEach(board => {
      const filteredTasks = filterAndSortTasks(board.tasks || [], filters, sort);
      count += filteredTasks.length;
    });
    return count;
  }, [boards, filters, sort]);

  // Create boards with filtered tasks
  const boardsWithFilteredTasks = useMemo(() => {
    return boards.map(board => ({
      ...board,
      tasks: filterAndSortTasks(board.tasks || [], filters, sort),
    }));
  }, [boards, filters, sort]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-20">
          <div className="animate-pulse text-gray-400">Loading boards...</div>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 gap-6">
          <div className="flex-1">
            {isEditingTitle ? (
              <input
                ref={titleRef}
                type="text"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTitleSave();
                  } else if (e.key === 'Escape') {
                    setPageTitle(pageTitle);
                    setIsEditingTitle(false);
                  }
                }}
                className="text-4xl font-black text-gray-900 dark:text-white bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none focus:ring-0 w-full max-w-2xl mb-2"
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="text-4xl font-black text-gray-900 dark:text-white mb-2 cursor-text hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-block"
              >
                {pageTitle}
              </h1>
            )}
            {isEditingSubtitle ? (
              <input
                ref={subtitleRef}
                type="text"
                value={pageSubtitle}
                onChange={(e) => setPageSubtitle(e.target.value)}
                onBlur={handleSubtitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubtitleSave();
                  } else if (e.key === 'Escape') {
                    setPageSubtitle(pageSubtitle);
                    setIsEditingSubtitle(false);
                  }
                }}
                className="text-lg text-gray-600 dark:text-gray-400 bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none focus:ring-0 w-full max-w-2xl block"
              />
            ) : (
              <p
                onClick={() => setIsEditingSubtitle(true)}
                className="text-lg text-gray-600 dark:text-gray-400 cursor-text hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                {pageSubtitle}
              </p>
            )}
          </div>
          <div className="flex-shrink-0 flex items-center gap-3">
            <button
              onClick={() => setShowExportImport(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Export/Import
            </button>
            <GlobalSearch boards={boards} />
          </div>
        </div>

        {/* Filter Panel */}
        <div className="mb-6">
          <FilterPanel
            filters={filters}
            sort={sort}
            availableTags={allTags}
            onFiltersChange={setFilters}
            onSortChange={setSort}
            taskCount={totalTaskCount}
            filteredCount={filteredTaskCount}
          />
        </div>

        {/* Activity Feed */}
        <div className="mb-6">
          <ActivityFeed limit={20} />
        </div>

        {/* Boards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SortableContext
            items={boards.map(b => b.id)}
            strategy={rectSortingStrategy}
          >
            {boardsWithFilteredTasks.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </SortableContext>

          {/* Inline Create Board Card */}
          {isCreatingBoard ? (
            <InlineBoardForm
              onSubmit={handleCreate}
              onCancel={() => setIsCreatingBoard(false)}
            />
          ) : (
            <div className="min-h-[200px] flex flex-col gap-3">
              <button
                onClick={() => setIsCreatingBoard(true)}
                className="flex-1 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all flex flex-col items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium group focus:outline-none"
              >
                <div className="mb-2 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-md opacity-0 group-hover:opacity-75 transition-opacity" />
                  <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
                <span className="text-base">Create Blank Board</span>
              </button>
              <button
                onClick={() => setShowTemplateGallery(true)}
                className="flex-1 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900 dark:hover:to-blue-900 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all flex flex-col items-center justify-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium group focus:outline-none"
              >
                <div className="mb-2 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur-md opacity-0 group-hover:opacity-75 transition-opacity" />
                  <div className="relative w-12 h-12 bg-gradient-to-br from-purple-600 via-purple-700 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  </div>
                </div>
                <span className="text-base">Use Template</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Template Gallery Modal */}
      {showTemplateGallery && (
        <TemplateGallery
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplateGallery(false)}
        />
      )}

      {/* Export/Import Modal */}
      {showExportImport && (
        <ExportImportModal onClose={() => setShowExportImport(false)} />
      )}

      {/* Drag Overlay - shows the task or board being dragged */}
      <DragOverlay>
        {activeTask ? (
          <div className="flex items-center gap-2.5 bg-white dark:bg-gray-800 rounded-lg px-3 py-2.5 shadow-2xl border border-gray-300 dark:border-gray-600 opacity-90 relative">
            {/* Drag Handle */}
            <div className="flex-shrink-0 p-1 text-gray-400">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
              </svg>
            </div>

            {/* Checkbox */}
            <div
              className={`flex-shrink-0 w-4 h-4 rounded-full border-2 transition-all duration-150 flex items-center justify-center`}
              style={{
                backgroundColor: activeTask.completed ? '#10b981' : 'transparent',
                borderColor: activeTask.completed ? '#10b981' : '#d1d5db',
              }}
            >
              {activeTask.completed && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <span
                className={`text-sm ${
                  activeTask.completed
                    ? 'text-gray-500 dark:text-gray-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {activeTask.text}
              </span>
            </div>

            {/* Color Gradient Background */}
            {activeTask.color && (
              <>
                {activeTask.showGradient !== false && (
                  <div
                    className="absolute inset-0 rounded-lg opacity-20"
                    style={{
                      background: `linear-gradient(to right, ${activeTask.color}, white)`
                    }}
                  />
                )}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                  style={{ backgroundColor: activeTask.color }}
                />
              </>
            )}
          </div>
        ) : activeBoard ? (
          <Card className="opacity-90 shadow-2xl w-[400px] rotate-3">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                {activeBoard.color && (
                  <div
                    className="w-8 h-8 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: activeBoard.color }}
                  />
                )}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {activeBoard.title}
                </h3>
              </div>
              {activeBoard.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {activeBoard.description}
                </p>
              )}
              {activeBoard.tasks && activeBoard.tasks.length > 0 && (
                <div className="mt-4 text-sm text-gray-400">
                  {activeBoard.tasks.length} {activeBoard.tasks.length === 1 ? 'item' : 'items'}
                </div>
              )}
            </div>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
