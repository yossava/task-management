'use client';

import { useState, useMemo } from 'react';
import type { Sprint, TeamMember } from '@/lib/types/scrum';

interface SprintRetrospectiveProps {
  sprint: Sprint;
  teamMembers: TeamMember[];
  onSaveRetro?: (retro: RetroData) => void;
}

type RetroTemplate = 'start-stop-continue' | 'mad-sad-glad' | '4ls' | 'custom';

interface RetroItem {
  id: string;
  content: string;
  votes: number;
  votedBy: string[];
  createdBy: string;
}

interface ActionItem {
  id: string;
  description: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
}

interface RetroData {
  id: string;
  sprintId: string;
  date: string;
  attendees: string[];
  template: RetroTemplate;
  wentWell: RetroItem[];
  toImprove: RetroItem[];
  actionItems: ActionItem[];
  mood: 'excellent' | 'good' | 'neutral' | 'poor';
  notes: string;
}

export default function SprintRetrospective({
  sprint,
  teamMembers,
  onSaveRetro,
}: SprintRetrospectiveProps) {
  const [template, setTemplate] = useState<RetroTemplate>('start-stop-continue');
  const [attendees, setAttendees] = useState<string[]>(teamMembers.map((m) => m.id));
  const [currentUser] = useState(teamMembers[0]?.id || 'user-1');

  // Retro items
  const [wentWell, setWentWell] = useState<RetroItem[]>([]);
  const [toImprove, setToImprove] = useState<RetroItem[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  // Form states
  const [newWentWell, setNewWentWell] = useState('');
  const [newToImprove, setNewToImprove] = useState('');
  const [newAction, setNewAction] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState('');
  const [newActionPriority, setNewActionPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const [mood, setMood] = useState<'excellent' | 'good' | 'neutral' | 'poor'>('good');
  const [notes, setNotes] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  // Toggle attendee
  const toggleAttendee = (memberId: string) => {
    setAttendees((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  // Add went well item
  const addWentWell = () => {
    if (newWentWell.trim()) {
      setWentWell((prev) => [
        ...prev,
        {
          id: `well-${Date.now()}`,
          content: newWentWell,
          votes: 0,
          votedBy: [],
          createdBy: currentUser,
        },
      ]);
      setNewWentWell('');
    }
  };

  // Add to improve item
  const addToImprove = () => {
    if (newToImprove.trim()) {
      setToImprove((prev) => [
        ...prev,
        {
          id: `improve-${Date.now()}`,
          content: newToImprove,
          votes: 0,
          votedBy: [],
          createdBy: currentUser,
        },
      ]);
      setNewToImprove('');
    }
  };

  // Add action item
  const addActionItem = () => {
    if (newAction.trim() && newActionAssignee) {
      setActionItems((prev) => [
        ...prev,
        {
          id: `action-${Date.now()}`,
          description: newAction,
          assignee: newActionAssignee,
          priority: newActionPriority,
          status: 'pending',
        },
      ]);
      setNewAction('');
      setNewActionAssignee('');
      setNewActionPriority('medium');
    }
  };

  // Vote on item
  const toggleVote = (itemId: string, category: 'wentWell' | 'toImprove') => {
    const updateFn = category === 'wentWell' ? setWentWell : setToImprove;

    updateFn((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const hasVoted = item.votedBy.includes(currentUser);
          return {
            ...item,
            votes: hasVoted ? item.votes - 1 : item.votes + 1,
            votedBy: hasVoted
              ? item.votedBy.filter((id) => id !== currentUser)
              : [...item.votedBy, currentUser],
          };
        }
        return item;
      })
    );
  };

  // Delete item
  const deleteItem = (itemId: string, category: 'wentWell' | 'toImprove') => {
    const updateFn = category === 'wentWell' ? setWentWell : setToImprove;
    updateFn((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Update action item status
  const updateActionStatus = (actionId: string, status: ActionItem['status']) => {
    setActionItems((prev) =>
      prev.map((item) => (item.id === actionId ? { ...item, status } : item))
    );
  };

  // Delete action item
  const deleteAction = (actionId: string) => {
    setActionItems((prev) => prev.filter((item) => item.id !== actionId));
  };

  // Save retrospective
  const saveRetrospective = () => {
    const retroData: RetroData = {
      id: `retro-${Date.now()}`,
      sprintId: sprint.id,
      date: new Date().toISOString(),
      attendees,
      template,
      wentWell: wentWell.sort((a, b) => b.votes - a.votes),
      toImprove: toImprove.sort((a, b) => b.votes - a.votes),
      actionItems,
      mood,
      notes,
    };

    if (onSaveRetro) {
      onSaveRetro(retroData);
    }

    setShowSummary(true);
  };

  // Template labels
  const getTemplateLabels = () => {
    switch (template) {
      case 'start-stop-continue':
        return { positive: 'Continue', negative: 'Stop', neutral: 'Start' };
      case 'mad-sad-glad':
        return { positive: 'Glad', negative: 'Mad', neutral: 'Sad' };
      case '4ls':
        return { positive: 'Liked', negative: 'Lacked', neutral: 'Learned/Longed For' };
      default:
        return { positive: 'Went Well', negative: 'To Improve' };
    }
  };

  const labels = getTemplateLabels();

  // Analytics
  const analytics = useMemo(() => {
    const totalItems = wentWell.length + toImprove.length;
    const totalVotes = wentWell.reduce((sum, i) => sum + i.votes, 0) + toImprove.reduce((sum, i) => sum + i.votes, 0);
    const completedActions = actionItems.filter((a) => a.status === 'completed').length;
    const pendingActions = actionItems.filter((a) => a.status === 'pending').length;

    return {
      totalItems,
      totalVotes,
      completedActions,
      pendingActions,
      attendanceRate: teamMembers.length > 0 ? Math.round((attendees.length / teamMembers.length) * 100) : 0,
    };
  }, [wentWell, toImprove, actionItems, attendees, teamMembers]);

  // Get mood color
  const getMoodColor = (moodValue: typeof mood) => {
    switch (moodValue) {
      case 'excellent':
        return 'text-green-600 dark:text-green-400';
      case 'good':
        return 'text-blue-600 dark:text-blue-400';
      case 'neutral':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'poor':
        return 'text-red-600 dark:text-red-400';
    }
  };

  const getMoodEmoji = (moodValue: typeof mood) => {
    switch (moodValue) {
      case 'excellent':
        return '🎉';
      case 'good':
        return '😊';
      case 'neutral':
        return '😐';
      case 'poor':
        return '😞';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Sprint Retrospective
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Reflect on {sprint.name} and identify improvements
            </p>
          </div>

          {/* Mood Selector */}
          <div className="flex items-center gap-2">
            {(['excellent', 'good', 'neutral', 'poor'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`p-3 rounded-lg text-2xl transition-all ${
                  mood === m
                    ? 'bg-blue-100 dark:bg-blue-900/30 scale-110'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={m.charAt(0).toUpperCase() + m.slice(1)}
              >
                {getMoodEmoji(m)}
              </button>
            ))}
          </div>
        </div>

        {/* Template Selector & Attendance */}
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Template
            </label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value as RetroTemplate)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="start-stop-continue">Start/Stop/Continue</option>
              <option value="mad-sad-glad">Mad/Sad/Glad</option>
              <option value="4ls">4 Ls (Liked/Lacked/Learned/Longed)</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="flex-1">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Attendance ({attendees.length}/{teamMembers.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {teamMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => toggleAttendee(member.id)}
                  className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                    attendees.includes(member.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {member.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Retro Board */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Went Well Column */}
          <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h3 className="text-lg font-bold text-green-900 dark:text-green-300 mb-3">
              ✅ {labels.positive}
            </h3>

            {/* Input */}
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newWentWell}
                  onChange={(e) => setNewWentWell(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addWentWell()}
                  placeholder="What went well?"
                  className="flex-1 px-3 py-2 text-sm border border-green-300 dark:border-green-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <button
                  onClick={addWentWell}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              {wentWell.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-900 border border-green-200 dark:border-green-800 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="flex-1 text-sm text-gray-900 dark:text-white">{item.content}</p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleVote(item.id, 'wentWell')}
                        className={`px-2 py-1 text-xs rounded ${
                          item.votedBy.includes(currentUser)
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        👍 {item.votes}
                      </button>
                      <button
                        onClick={() => deleteItem(item.id, 'wentWell')}
                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* To Improve Column */}
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h3 className="text-lg font-bold text-red-900 dark:text-red-300 mb-3">
              🔧 {labels.negative}
            </h3>

            {/* Input */}
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newToImprove}
                  onChange={(e) => setNewToImprove(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addToImprove()}
                  placeholder="What can be improved?"
                  className="flex-1 px-3 py-2 text-sm border border-red-300 dark:border-red-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <button
                  onClick={addToImprove}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              {toImprove.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="flex-1 text-sm text-gray-900 dark:text-white">{item.content}</p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleVote(item.id, 'toImprove')}
                        className={`px-2 py-1 text-xs rounded ${
                          item.votedBy.includes(currentUser)
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        👍 {item.votes}
                      </button>
                      <button
                        onClick={() => deleteItem(item.id, 'toImprove')}
                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-3">
            🎯 Action Items
          </h3>

          {/* Input */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-12 gap-2">
            <input
              type="text"
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addActionItem()}
              placeholder="Action item description..."
              className="md:col-span-6 px-3 py-2 text-sm border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <select
              value={newActionAssignee}
              onChange={(e) => setNewActionAssignee(e.target.value)}
              className="md:col-span-3 px-3 py-2 text-sm border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Assign to...</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <select
              value={newActionPriority}
              onChange={(e) => setNewActionPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="md:col-span-2 px-3 py-2 text-sm border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button
              onClick={addActionItem}
              className="md:col-span-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>

          {/* Action Items List */}
          <div className="space-y-2">
            {actionItems.map((action) => {
              const assignee = teamMembers.find((m) => m.id === action.assignee);
              return (
                <div
                  key={action.id}
                  className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white mb-1">
                        {action.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <span>👤 {assignee?.name}</span>
                        <span className={`px-2 py-0.5 rounded ${
                          action.priority === 'high'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            : action.priority === 'medium'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}>
                          {action.priority}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <select
                        value={action.status}
                        onChange={(e) => updateActionStatus(action.id, e.target.value as ActionItem['status'])}
                        className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      <button
                        onClick={() => deleteAction(action.id)}
                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Additional Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes or insights from the retrospective..."
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>
      </div>

      {/* Analytics Bar */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4">
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getMoodColor(mood)}`}>{getMoodEmoji(mood)}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Team Mood</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {analytics.attendanceRate}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Attendance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {analytics.totalItems}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {analytics.totalVotes}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Votes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {actionItems.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Actions</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-6">
        <div className="flex gap-3">
          <button
            onClick={() => setShowSummary(!showSummary)}
            className="flex-1 px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {showSummary ? 'Hide Summary' : 'View Summary'}
          </button>
          <button
            onClick={saveRetrospective}
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Save Retrospective
          </button>
        </div>
      </div>

      {/* Summary */}
      {showSummary && (
        <div className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50 dark:bg-gray-950">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Retrospective Summary
          </h3>

          <div className="space-y-4">
            {/* Top Voted Items */}
            {wentWell.slice(0, 3).length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800 p-4">
                <h4 className="text-sm font-bold text-green-900 dark:text-green-300 mb-2">
                  Top 3 Positive Highlights
                </h4>
                <ol className="list-decimal list-inside text-sm text-green-800 dark:text-green-200 space-y-1">
                  {wentWell
                    .sort((a, b) => b.votes - a.votes)
                    .slice(0, 3)
                    .map((item) => (
                      <li key={item.id}>
                        {item.content} ({item.votes} votes)
                      </li>
                    ))}
                </ol>
              </div>
            )}

            {toImprove.slice(0, 3).length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800 p-4">
                <h4 className="text-sm font-bold text-red-900 dark:text-red-300 mb-2">
                  Top 3 Improvement Areas
                </h4>
                <ol className="list-decimal list-inside text-sm text-red-800 dark:text-red-200 space-y-1">
                  {toImprove
                    .sort((a, b) => b.votes - a.votes)
                    .slice(0, 3)
                    .map((item) => (
                      <li key={item.id}>
                        {item.content} ({item.votes} votes)
                      </li>
                    ))}
                </ol>
              </div>
            )}

            {actionItems.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
                <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-2">
                  Action Items ({actionItems.length})
                </h4>
                <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  {actionItems.map((action) => {
                    const assignee = teamMembers.find((m) => m.id === action.assignee);
                    return (
                      <li key={action.id}>
                        {action.description} - {assignee?.name} ({action.priority} priority)
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
