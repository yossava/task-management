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
import ExportImportModal from '@/components/export/ExportImportModal';
import KeyboardShortcutsModal from '@/components/keyboard/KeyboardShortcutsModal';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import NotificationBell from '@/components/notifications/NotificationBell';
import NotificationsPanel from '@/components/notifications/NotificationsPanel';
import { NotificationService } from '@/lib/services/notificationService';
import { RecurringTaskService } from '@/lib/services/recurringTaskService';
import CalendarView from '@/components/calendar/CalendarView';
import ListView from '@/components/list/ListView';
import CommandPalette from '@/components/command/CommandPalette';
import { AuthNav } from '@/components/navigation/AuthNav';
import type { ViewMode } from '@/lib/types';

export default function BoardsPage() {
  const { boards, loading, createBoard, updateBoard, deleteBoard, reorderBoards } = useBoards();
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showExportImport, setShowExportImport] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('board');
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

  // Load header from API
  useEffect(() => {
    const loadHeader = async () => {
      try {
        const { settingsApi } = await import('@/lib/api/client');
        const response = await settingsApi.getHeader();
        if (response.header) {
          setPageTitle(response.header.title);
          setPageSubtitle(response.header.subtitle);
        }
      } catch (err) {
        // Use default values on error
        console.error('Failed to load header:', err);
      }
    };
    loadHeader();
  }, []);

  // Save header to API
  const saveHeader = async (title: string, subtitle: string) => {
    try {
      const { settingsApi } = await import('@/lib/api/client');
      await settingsApi.updateHeader({ title, subtitle });
    } catch (err) {
      console.error('Failed to save header:', err);
    }
  };

  // Check for due date notifications periodically
  useEffect(() => {
    const checkNotifications = () => {
      if (boards.length > 0) {
        NotificationService.checkDueDates(boards);
      }
    };

    // Check immediately on mount and when boards change
    checkNotifications();

    // Then check every 5 minutes
    const interval = setInterval(checkNotifications, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [boards]);

  // Generate recurring tasks periodically
  useEffect(() => {
    const generateRecurringTasks = () => {
      const generatedCount = RecurringTaskService.generateDueTasks();
      if (generatedCount > 0) {
        console.log(`Generated ${generatedCount} recurring task${generatedCount > 1 ? 's' : ''}`);
        // Force reload to show new tasks
        window.location.reload();
      }
    };

    // Check immediately on mount
    generateRecurringTasks();

    // Then check every hour
    const interval = setInterval(generateRecurringTasks, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

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

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSearch: () => setShowSearch(true),
    onHelp: () => setShowKeyboardHelp(true),
    onNewBoard: () => setIsCreatingBoard(true),
    onTemplate: () => setShowTemplateGallery(true),
    onExport: () => setShowExportImport(true),
    onBoardView: () => setViewMode('board'),
    onListView: () => setViewMode('list'),
    onCalendarView: () => setViewMode('calendar'),
  });

  // Command Palette shortcut (Cmd/Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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

      // Check if dropping on a calendar day
      if (over.data.current?.type === 'calendar-day') {
        const newDueDate = over.data.current.date as number;
        const board = boards.find(b => b.id === sourceBoardId);
        if (!board) return;

        const updatedTasks = board.tasks.map(t =>
          t.id === task.id ? { ...t, dueDate: newDueDate } : t
        );

        BoardService.update(sourceBoardId, { tasks: updatedTasks });
        updateBoard(sourceBoardId, { tasks: updatedTasks });
        return;
      }

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

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.priorities.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.dateFilter !== 'all') count++;
    if (!filters.showCompleted) count++;
    if (filters.searchQuery) count++;
    return count;
  }, [filters]);

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
      <div className="max-w-7xl mx-auto px-4 py-8">
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
            <NotificationBell
              onClick={() => setShowNotifications(!showNotifications)}
              isOpen={showNotifications}
            />
            <button
              onClick={() => setShowKeyboardHelp(true)}
              className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Keyboard shortcuts (?)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
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
            <AuthNav />
          </div>
        </div>

        {/* View Mode Switcher and Filters */}
        <div className="mb-6 flex items-center gap-4">
          {/* View Mode Tabs */}
          <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1">
            <button
              onClick={() => setViewMode('board')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                viewMode === 'board'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              title="Board view (1)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              title="List view (2)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              title="Calendar view (3)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Calendar</span>
            </button>
          </div>

          {/* Filters Button - Separate */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 border relative ${
              showFilters
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            title="Filters & Sort"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 text-xs font-bold rounded-full ${
                showFilters
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-600 text-white'
              }`}>
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="mb-6">
            <CalendarView
              boards={boards}
              onTaskUpdate={(boardId, taskId, updates) => {
                const board = boards.find(b => b.id === boardId);
                if (!board) return;

                const updatedTasks = board.tasks.map(task =>
                  task.id === taskId ? { ...task, ...updates } : task
                );

                BoardService.update(boardId, { tasks: updatedTasks });
                updateBoard(boardId, { tasks: updatedTasks });
              }}
            />
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="mb-6">
            <ListView
              boards={boardsWithFilteredTasks}
              onTaskUpdate={(boardId, taskId, updates) => {
                const board = boards.find(b => b.id === boardId);
                if (!board) return;

                const updatedTasks = board.tasks.map(task =>
                  task.id === taskId ? { ...task, ...updates } : task
                );

                BoardService.update(boardId, { tasks: updatedTasks });
                updateBoard(boardId, { tasks: updatedTasks });
              }}
              onTaskDelete={(boardId, taskId) => {
                const board = boards.find(b => b.id === boardId);
                if (!board) return;

                const updatedTasks = board.tasks.filter(task => task.id !== taskId);

                BoardService.update(boardId, { tasks: updatedTasks });
                updateBoard(boardId, { tasks: updatedTasks });
              }}
            />
          </div>
        )}

        {/* Boards Grid - Only show in board view */}
        {viewMode === 'board' && (
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
        )}
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

      {/* Keyboard Shortcuts Help Modal */}
      {showKeyboardHelp && (
        <KeyboardShortcutsModal onClose={() => setShowKeyboardHelp(false)} />
      )}

      {/* Notifications Panel */}
      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNewBoard={() => setIsCreatingBoard(true)}
        onSearch={() => setShowSearch(true)}
        onViewMode={setViewMode}
      />

      {/* Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
              onClick={() => setShowFilters(false)}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-800">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Filters & Sort</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {filteredTaskCount} of {totalTaskCount} tasks
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <FilterPanel
                  filters={filters}
                  sort={sort}
                  availableTags={allTags}
                  onFiltersChange={setFilters}
                  onSortChange={setSort}
                  taskCount={totalTaskCount}
                  filteredCount={filteredTaskCount}
                  onClose={() => setShowFilters(false)}
                />
              </div>
            </div>
          </div>
        </div>
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
