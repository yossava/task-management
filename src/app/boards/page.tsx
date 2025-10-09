'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { BoardCard } from '@/components/board/BoardCard';
import { InlineBoardForm } from '@/components/board/InlineBoardForm';
import { useBoards } from '@/hooks/useBoards';
import { Board } from '@/lib/types';

export default function BoardsPage() {
  const { boards, loading, createBoard, updateBoard, deleteBoard, reorderBoards } = useBoards();
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleCreate = (data: Omit<Board, 'id' | 'createdAt' | 'updatedAt' | 'columns' | 'tasks'>) => {
    createBoard(data);
    setIsCreatingBoard(false);
  };

  const handleUpdate = (id: string, data: Partial<Board>) => {
    updateBoard(id, data);
  };

  const handleDelete = (id: string) => {
    deleteBoard(id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = boards.findIndex(b => b.id === active.id);
      const newIndex = boards.findIndex(b => b.id === over.id);

      const newBoards = arrayMove(boards, oldIndex, newIndex);
      reorderBoards(newBoards);
    }
  };

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
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
              Your Boards
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Organize and manage all your projects in one place
            </p>
          </div>
        </div>

        {/* Boards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SortableContext
            items={boards.map(b => b.id)}
            strategy={rectSortingStrategy}
          >
            {boards.map((board) => (
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
            <button
              onClick={() => setIsCreatingBoard(true)}
              className="min-h-[200px] bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all flex flex-col items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium group focus:outline-none"
            >
              <div className="mb-3 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-md opacity-0 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
              <span className="text-lg">Create New Board</span>
              <span className="text-sm text-gray-400 dark:text-gray-500 mt-1">Click to add a board</span>
            </button>
          )}
        </div>
      </div>
    </DndContext>
  );
}
