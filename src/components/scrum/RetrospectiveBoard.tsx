'use client';

import { useState, useEffect } from 'react';
import { RetrospectiveService } from '@/lib/services/scrumService';
import type { Retrospective, RetroItem, ActionItem } from '@/lib/types/scrum';

interface RetrospectiveBoardProps {
  sprintId: string;
  sprintName: string;
}

export default function RetrospectiveBoard({ sprintId, sprintName }: RetrospectiveBoardProps) {
  const [retrospective, setRetrospective] = useState<Retrospective | null>(null);
  const [newItem, setNewItem] = useState({ category: 'went-well' as 'went-well' | 'to-improve' | 'action-items', content: '' });
  const [loading, setLoading] = useState(true);

  // Load existing retrospective or create new one
  useEffect(() => {
    const existing = RetrospectiveService.getBySprintId(sprintId);
    if (existing) {
      setRetrospective(existing);
    } else {
      const newRetro: Omit<Retrospective, 'id' | 'createdAt'> = {
        sprintId,
        date: new Date().toISOString().split('T')[0],
        attendees: [],
        template: 'start-stop-continue',
        wentWell: [],
        toImprove: [],
        actionItems: [],
        mood: 'neutral',
        createdBy: 'current-user',
      };
      const created = RetrospectiveService.create(newRetro);
      setRetrospective(created);
    }
    setLoading(false);
  }, [sprintId]);

  const addItem = () => {
    if (!newItem.content.trim() || !retrospective) return;

    const item: RetroItem = {
      id: Date.now().toString(),
      content: newItem.content,
      votes: 0,
      votedBy: [],
      createdBy: 'current-user',
    };

    const updates: Partial<Retrospective> = {};
    if (newItem.category === 'went-well') {
      updates.wentWell = [...retrospective.wentWell, item];
    } else if (newItem.category === 'to-improve') {
      updates.toImprove = [...retrospective.toImprove, item];
    } else {
      const actionItem: ActionItem = {
        id: item.id,
        description: item.content,
        assignee: '',
        status: 'pending',
        priority: 'medium',
        createdAt: new Date().toISOString(),
      };
      updates.actionItems = [...retrospective.actionItems, actionItem];
    }

    const updated = RetrospectiveService.update(retrospective.id, updates);
    if (updated) {
      setRetrospective(updated);
      setNewItem({ ...newItem, content: '' });
    }
  };

  const voteItem = (itemId: string, category: 'went-well' | 'to-improve') => {
    if (!retrospective) return;

    const updateArray = (items: RetroItem[]) =>
      items.map((item) => {
        if (item.id === itemId) {
          const hasVoted = item.votedBy.includes('current-user');
          return {
            ...item,
            votes: hasVoted ? item.votes - 1 : item.votes + 1,
            votedBy: hasVoted
              ? item.votedBy.filter(id => id !== 'current-user')
              : [...item.votedBy, 'current-user'],
          };
        }
        return item;
      });

    const updates: Partial<Retrospective> = {};
    if (category === 'went-well') {
      updates.wentWell = updateArray(retrospective.wentWell);
    } else {
      updates.toImprove = updateArray(retrospective.toImprove);
    }

    const updated = RetrospectiveService.update(retrospective.id, updates);
    if (updated) setRetrospective(updated);
  };

  const deleteItem = (itemId: string, category: 'went-well' | 'to-improve' | 'action-items') => {
    if (!retrospective) return;

    const updates: Partial<Retrospective> = {};
    if (category === 'went-well') {
      updates.wentWell = retrospective.wentWell.filter(item => item.id !== itemId);
    } else if (category === 'to-improve') {
      updates.toImprove = retrospective.toImprove.filter(item => item.id !== itemId);
    } else {
      updates.actionItems = retrospective.actionItems.filter(item => item.id !== itemId);
    }

    const updated = RetrospectiveService.update(retrospective.id, updates);
    if (updated) setRetrospective(updated);
  };

  const updateActionItem = (itemId: string, status: ActionItem['status']) => {
    if (!retrospective) return;

    const updates: Partial<Retrospective> = {
      actionItems: retrospective.actionItems.map(item =>
        item.id === itemId
          ? { ...item, status, completedAt: status === 'completed' ? new Date().toISOString() : undefined }
          : item
      ),
    };

    const updated = RetrospectiveService.update(retrospective.id, updates);
    if (updated) setRetrospective(updated);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!retrospective) {
    return <div className="text-center py-8">Unable to load retrospective</div>;
  }

  const getItemsByCategory = (category: 'went-well' | 'to-improve') => {
    const items = category === 'went-well' ? retrospective.wentWell : retrospective.toImprove;
    return items.sort((a, b) => b.votes - a.votes);
  };

  const categories = [
    {
      id: 'went-well' as const,
      title: 'What Went Well',
      icon: '✅',
      color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      items: getItemsByCategory('went-well'),
    },
    {
      id: 'to-improve' as const,
      title: 'To Improve',
      icon: '🔧',
      color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
      items: getItemsByCategory('to-improve'),
    },
    {
      id: 'action-items' as const,
      title: 'Action Items',
      icon: '🎯',
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      items: retrospective.actionItems,
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
              setNewItem({ ...newItem, category: e.target.value as typeof newItem.category })
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
        {categories.map((category) => (
          <div key={category.id} className={`border-2 rounded-lg p-6 ${category.color}`}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{category.icon}</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {category.title}
              </h3>
              <span className="ml-auto text-sm text-gray-600 dark:text-gray-400">
                {category.items.length}
              </span>
            </div>

            <div className="space-y-3">
              {category.items.length > 0 ? (
                category.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                  >
                    <p className="text-sm text-gray-900 dark:text-white mb-2">
                      {'description' in item ? item.description : item.content}
                    </p>
                    <div className="flex items-center justify-between">
                      {category.id === 'action-items' ? (
                        <select
                          value={(item as ActionItem).status}
                          onChange={(e) => updateActionItem(item.id, e.target.value as ActionItem['status'])}
                          className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      ) : (
                        <button
                          onClick={() => voteItem(item.id, category.id)}
                          className={`flex items-center gap-1 text-xs transition-colors ${
                            (item as RetroItem).votedBy?.includes('current-user')
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                          }`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                          <span>{(item as RetroItem).votes}</span>
                        </button>
                      )}
                      <button
                        onClick={() => deleteItem(item.id, category.id)}
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
        ))}
      </div>

      {/* Summary */}
      {(retrospective.wentWell.length + retrospective.toImprove.length + retrospective.actionItems.length) > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Summary
          </h3>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {retrospective.wentWell.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Positive Items
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {retrospective.toImprove.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Improvements
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {retrospective.actionItems.filter(a => a.status === 'completed').length}/{retrospective.actionItems.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Actions Completed
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
