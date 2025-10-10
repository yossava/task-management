'use client';

import { useState } from 'react';

interface RetroItem {
  id: string;
  content: string;
  votes: number;
  category: 'went-well' | 'to-improve' | 'action-items';
}

interface RetrospectiveBoardProps {
  sprintName: string;
}

export default function RetrospectiveBoard({ sprintName }: RetrospectiveBoardProps) {
  const [items, setItems] = useState<RetroItem[]>([]);
  const [newItem, setNewItem] = useState({ category: 'went-well' as RetroItem['category'], content: '' });

  const addItem = () => {
    if (newItem.content.trim()) {
      setItems([
        ...items,
        {
          id: Date.now().toString(),
          content: newItem.content,
          votes: 0,
          category: newItem.category,
        },
      ]);
      setNewItem({ ...newItem, content: '' });
    }
  };

  const voteItem = (id: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, votes: item.votes + 1 } : item)));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const getItemsByCategory = (category: RetroItem['category']) => {
    return items
      .filter((item) => item.category === category)
      .sort((a, b) => b.votes - a.votes);
  };

  const categories = [
    {
      id: 'went-well' as const,
      title: 'What Went Well',
      icon: '✅',
      color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    },
    {
      id: 'to-improve' as const,
      title: 'To Improve',
      icon: '🔧',
      color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    },
    {
      id: 'action-items' as const,
      title: 'Action Items',
      icon: '🎯',
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Sprint Retrospective
        </h2>
        <p className="text-gray-600 dark:text-gray-400">{sprintName}</p>
      </div>

      {/* Add Item Form */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Add Your Thoughts
        </h3>
        <div className="flex gap-3">
          <select
            value={newItem.category}
            onChange={(e) =>
              setNewItem({ ...newItem, category: e.target.value as RetroItem['category'] })
            }
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="went-well">What Went Well</option>
            <option value="to-improve">To Improve</option>
            <option value="action-items">Action Item</option>
          </select>
          <input
            type="text"
            value={newItem.content}
            onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
            placeholder="Type your thought..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          <button
            onClick={addItem}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Retrospective Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category) => {
          const categoryItems = getItemsByCategory(category.id);
          return (
            <div key={category.id} className={`border-2 rounded-lg p-6 ${category.color}`}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{category.icon}</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {category.title}
                </h3>
                <span className="ml-auto text-sm text-gray-600 dark:text-gray-400">
                  {categoryItems.length}
                </span>
              </div>

              <div className="space-y-3">
                {categoryItems.length > 0 ? (
                  categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                    >
                      <p className="text-sm text-gray-900 dark:text-white mb-2">
                        {item.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => voteItem(item.id)}
                          className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                          <span>{item.votes}</span>
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-gray-500 dark:text-gray-500 py-8">
                    No items yet
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Summary
          </h3>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {getItemsByCategory('went-well').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Positive Items
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {getItemsByCategory('to-improve').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Improvements
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {getItemsByCategory('action-items').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Action Items
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
