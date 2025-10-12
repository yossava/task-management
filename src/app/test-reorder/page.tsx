'use client';

import { useEffect, useState } from 'react';
import { useBoardsSimple } from '@/hooks/useBoardsSimple';

export default function TestReorderPage() {
  const { boards, loading, createBoard, deleteBoard, reorderBoards, refresh } = useBoardsSimple();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[TestReorder] ${message}`);
  };

  useEffect(() => {
    addLog(`Page loaded. Found ${boards.length} boards`);
  }, [boards.length]);

  const handleCreateBoards = async () => {
    addLog('Creating 2 test boards...');
    try {
      await createBoard({ title: 'Test Board A', description: 'First test board' });
      addLog('Created Board A');
      await createBoard({ title: 'Test Board B', description: 'Second test board' });
      addLog('Created Board B');
      addLog('Waiting 2 seconds for database to commit...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      await refresh();
      addLog('Refreshed boards list');
    } catch (error) {
      addLog(`Error creating boards: ${error}`);
    }
  };

  const handleToggleOrder = async () => {
    if (boards.length < 2) {
      addLog('Need at least 2 boards to toggle order');
      return;
    }

    addLog(`Current order: ${boards.map(b => `"${b.title}" (order: ${b.order})`).join(', ')}`);

    // Reverse the order
    const reversedBoards = [...boards].reverse();
    addLog(`Toggling to: ${reversedBoards.map(b => `"${b.title}"`).join(', ')}`);

    try {
      await reorderBoards(reversedBoards);
      addLog('Reorder API call completed');

      addLog('Waiting 2 seconds before refresh...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      await refresh();
      addLog('Refreshed boards list');

      const newOrder = boards.map(b => `"${b.title}" (order: ${b.order})`).join(', ');
      addLog(`New order after refresh: ${newOrder}`);
    } catch (error) {
      addLog(`Error toggling order: ${error}`);
    }
  };

  const handleDeleteAll = async () => {
    if (boards.length === 0) {
      addLog('No boards to delete');
      return;
    }

    addLog(`Deleting ${boards.length} boards...`);
    try {
      for (const board of boards) {
        await deleteBoard(board.id);
        addLog(`Deleted board: ${board.title}`);
      }
      addLog('All boards deleted');
    } catch (error) {
      addLog(`Error deleting boards: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Board Reorder Test Page (Simplified - No Cache)
        </h1>

        {/* Control Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Controls
          </h2>
          <div className="flex gap-4">
            <button
              onClick={handleCreateBoards}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="create-boards-btn"
            >
              Create 2 Test Boards
            </button>
            <button
              onClick={handleToggleOrder}
              disabled={loading || boards.length < 2}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="toggle-order-btn"
            >
              Toggle Order
            </button>
            <button
              onClick={() => refresh()}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="refresh-btn"
            >
              Refresh
            </button>
            <button
              onClick={handleDeleteAll}
              disabled={loading || boards.length === 0}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="delete-all-btn"
            >
              Delete All Boards
            </button>
          </div>
        </div>

        {/* Boards Display */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Current Boards ({boards.length})
          </h2>
          {loading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          ) : boards.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No boards found. Create some test boards first.</p>
          ) : (
            <div className="space-y-2" data-testid="boards-list">
              {boards.map((board, index) => (
                <div
                  key={board.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  data-testid={`board-item-${index}`}
                  data-board-id={board.id}
                  data-board-order={board.order}
                >
                  <span className="text-2xl font-bold text-gray-400 dark:text-gray-500 w-8">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {board.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ID: {board.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logs Display */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Test Logs
          </h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => setLogs([])}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Clear Logs
          </button>
        </div>
      </div>
    </div>
  );
}
