'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { BoardCard } from '@/components/board/BoardCard';
import { CreateBoardModal } from '@/components/board/CreateBoardModal';
import { useBoards } from '@/hooks/useBoards';
import { Board } from '@/lib/types';

export default function BoardsPage() {
  const { boards, loading, createBoard, updateBoard, deleteBoard } = useBoards();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);

  const handleCreate = (data: Omit<Board, 'id' | 'createdAt' | 'updatedAt' | 'columns'>) => {
    createBoard(data);
  };

  const handleEdit = (board: Board) => {
    setEditingBoard(board);
    setIsModalOpen(true);
  };

  const handleUpdate = (id: string, data: Partial<Board>) => {
    updateBoard(id, data);
    setEditingBoard(null);
  };

  const handleDelete = (id: string) => {
    deleteBoard(id);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBoard(null);
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
        <Button size="lg" onClick={() => setIsModalOpen(true)}>
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create New Board
        </Button>
      </div>

      {/* Boards Grid or Empty State */}
      {boards.length === 0 ? (
        <Card className="p-16 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-3xl" />

          <div className="text-center relative z-10">
            <div className="inline-block mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-lg opacity-75"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/50 transform hover:scale-110 transition-transform">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              No boards yet
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Get started by creating your first board to organize your projects and tasks
            </p>
            <Button size="lg" className="shadow-2xl" onClick={() => setIsModalOpen(true)}>
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Create Your First Board
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Board Modal */}
      <CreateBoardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        editingBoard={editingBoard}
      />
    </div>
  );
}
