'use client';

import { use, useEffect, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { Board } from '@/lib/types';
import { BoardService } from '@/lib/services/boardService';
import { BoardView } from '@/components/board/BoardView';
import Button from '@/components/ui/Button';

interface BoardPageProps {
  params: Promise<{ id: string }>;
}

export default function BoardPage({ params }: BoardPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      notFound();
    }

    const foundBoard = BoardService.getById(id);
    if (!foundBoard) {
      notFound();
    }

    setBoard(foundBoard);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-20">
          <div className="animate-pulse text-gray-400">Loading board...</div>
        </div>
      </div>
    );
  }

  if (!board) {
    notFound();
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/boards')}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Boards
        </Button>
      </div>

      <BoardView board={board} />
    </div>
  );
}
