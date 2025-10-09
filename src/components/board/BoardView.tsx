'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Board } from '@/lib/types';
import Button from '@/components/ui/Button';
import { Column } from '@/components/board/Column';
import Input from '@/components/ui/Input';
import { useColumns } from '@/hooks/useColumns';

interface BoardViewProps {
  board: Board;
}

export function BoardView({ board }: BoardViewProps) {
  const { columns, createColumn, updateColumn, deleteColumn } = useColumns(board.id);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      const order = columns.length;
      createColumn({
        title: newColumnTitle.trim(),
        boardId: board.id,
        order,
      });
      setNewColumnTitle('');
      setIsAddingColumn(false);
    }
  };

  const handleDragStart = (_event: DragStartEvent) => {
    // No task dragging in columns
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // No task dragging in columns
  };

  const handleDragEnd = (_event: DragEndEvent) => {
    // No task dragging in columns
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full flex flex-col">
      {/* Board Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {board.color && (
            <div
              className="w-8 h-8 rounded-lg flex-shrink-0"
              style={{ backgroundColor: board.color }}
            />
          )}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {board.title}
          </h1>
        </div>
        {board.description && (
          <p className="text-gray-600 dark:text-gray-400 ml-11">
            {board.description}
          </p>
        )}
      </div>

      {/* Columns Container */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-6 pb-6">
          <SortableContext
            items={columns.map(c => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            {/* Existing Columns */}
            {columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                boardId={board.id}
                onUpdateColumn={updateColumn}
                onDeleteColumn={deleteColumn}
              />
            ))}
          </SortableContext>

          {/* Add Column */}
          <div className="flex-shrink-0 w-80">
            {isAddingColumn ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <Input
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder="Enter column title"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddColumn();
                    if (e.key === 'Escape') {
                      setIsAddingColumn(false);
                      setNewColumnTitle('');
                    }
                  }}
                  autoFocus
                />
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={handleAddColumn}
                    disabled={!newColumnTitle.trim()}
                  >
                    Add Column
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsAddingColumn(false);
                      setNewColumnTitle('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingColumn(true)}
                className="w-full h-full min-h-[120px] bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Column
              </button>
            )}
          </div>
        </div>
      </div>
      </div>
    </DndContext>
  );
}
