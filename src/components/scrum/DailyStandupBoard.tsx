'use client';

import { useState, useEffect } from 'react';
import { DailyStandupService, TeamService } from '@/lib/services/scrumService';
import type { DailyStandup, StandupUpdate, Blocker, TeamMember } from '@/lib/types/scrum';

interface DailyStandupBoardProps {
  sprintId: string;
  sprintName: string;
}

export default function DailyStandupBoard({ sprintId, sprintName }: DailyStandupBoardProps) {
  const [standup, setStandup] = useState<DailyStandup | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newBlocker, setNewBlocker] = useState({
    description: '',
    affectedMember: '',
    severity: 'medium' as Blocker['severity'],
  });

  // Load team members and standup data
  useEffect(() => {
    const members = TeamService.getMembers();
    setTeamMembers(members);

    const existing = DailyStandupService.getByDate(sprintId, selectedDate);
    if (existing) {
      setStandup(existing);
    } else {
      const newStandup: Omit<DailyStandup, 'id' | 'createdAt'> = {
        sprintId,
        date: selectedDate,
        attendees: [],
        updates: members.map(m => ({
          memberId: m.id,
          yesterday: '',
          today: '',
          blockers: '',
        })),
        blockers: [],
        duration: 15,
        createdBy: 'current-user',
      };
      const created = DailyStandupService.create(newStandup);
      setStandup(created);
    }
    setLoading(false);
  }, [sprintId, selectedDate]);

  const updateMemberUpdate = (memberId: string, field: keyof StandupUpdate, value: string) => {
    if (!standup) return;

    const updates: Partial<DailyStandup> = {
      updates: standup.updates.map(update =>
        update.memberId === memberId
          ? { ...update, [field]: value }
          : update
      ),
    };

    const updated = DailyStandupService.update(standup.id, updates);
    if (updated) setStandup(updated);
  };

  const toggleAttendance = (memberId: string) => {
    if (!standup) return;

    const updates: Partial<DailyStandup> = {
      attendees: standup.attendees.includes(memberId)
        ? standup.attendees.filter(id => id !== memberId)
        : [...standup.attendees, memberId],
    };

    const updated = DailyStandupService.update(standup.id, updates);
    if (updated) setStandup(updated);
  };

  const addBlocker = () => {
    if (!standup || !newBlocker.description.trim() || !newBlocker.affectedMember) return;

    const blocker: Blocker = {
      id: Date.now().toString(),
      description: newBlocker.description,
      affectedMember: newBlocker.affectedMember,
      severity: newBlocker.severity,
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    const updates: Partial<DailyStandup> = {
      blockers: [...standup.blockers, blocker],
    };

    const updated = DailyStandupService.update(standup.id, updates);
    if (updated) {
      setStandup(updated);
      setNewBlocker({ description: '', affectedMember: '', severity: 'medium' });
    }
  };

  const updateBlockerStatus = (blockerId: string, status: Blocker['status']) => {
    if (!standup) return;

    const updates: Partial<DailyStandup> = {
      blockers: standup.blockers.map(blocker =>
        blocker.id === blockerId
          ? { ...blocker, status, resolvedAt: status === 'resolved' ? new Date().toISOString() : undefined }
          : blocker
      ),
    };

    const updated = DailyStandupService.update(standup.id, updates);
    if (updated) setStandup(updated);
  };

  const deleteBlocker = (blockerId: string) => {
    if (!standup) return;

    const updates: Partial<DailyStandup> = {
      blockers: standup.blockers.filter(b => b.id !== blockerId),
    };

    const updated = DailyStandupService.update(standup.id, updates);
    if (updated) setStandup(updated);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!standup) {
    return <div className="text-center py-8">Unable to load daily standup</div>;
  }

  const getMemberById = (id: string) => teamMembers.find(m => m.id === id);

  const severityColors = {
    low: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
    medium: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300',
    high: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300',
    critical: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
  };

  const statusColors = {
    open: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    'in-progress': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    resolved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Daily Standup
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{sprintName}</p>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>
      </div>

      {/* Team Updates */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Team Updates
        </h3>
        <div className="space-y-4">
          {standup.updates.map((update) => {
            const member = getMemberById(update.memberId);
            if (!member) return null;

            const isPresent = standup.attendees.includes(member.id);

            return (
              <div
                key={member.id}
                className={`border rounded-lg p-4 ${
                  isPresent
                    ? 'border-gray-200 dark:border-gray-700'
                    : 'border-gray-200 dark:border-gray-700 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {member.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {member.role}
                      </div>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPresent}
                      onChange={() => toggleAttendance(member.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Present</span>
                  </label>
                </div>

                {isPresent && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Yesterday
                      </label>
                      <textarea
                        value={update.yesterday}
                        onChange={(e) => updateMemberUpdate(member.id, 'yesterday', e.target.value)}
                        placeholder="What did you work on?"
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Today
                      </label>
                      <textarea
                        value={update.today}
                        onChange={(e) => updateMemberUpdate(member.id, 'today', e.target.value)}
                        placeholder="What will you work on?"
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Blockers
                      </label>
                      <textarea
                        value={update.blockers || ''}
                        onChange={(e) => updateMemberUpdate(member.id, 'blockers', e.target.value)}
                        placeholder="Any blockers?"
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Blockers */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Team Blockers
        </h3>

        {/* Add Blocker Form */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <select
              value={newBlocker.affectedMember}
              onChange={(e) => setNewBlocker({ ...newBlocker, affectedMember: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="">Select member...</option>
              {teamMembers.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
            <select
              value={newBlocker.severity}
              onChange={(e) => setNewBlocker({ ...newBlocker, severity: e.target.value as Blocker['severity'] })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newBlocker.description}
              onChange={(e) => setNewBlocker({ ...newBlocker, description: e.target.value })}
              placeholder="Describe the blocker..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <button
              onClick={addBlocker}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Add Blocker
            </button>
          </div>
        </div>

        {/* Blockers List */}
        {standup.blockers.length > 0 ? (
          <div className="space-y-3">
            {standup.blockers.map((blocker) => {
              const member = getMemberById(blocker.affectedMember);
              return (
                <div
                  key={blocker.id}
                  className={`border-2 rounded-lg p-4 ${severityColors[blocker.severity]}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-0.5 bg-white/50 dark:bg-black/20 rounded font-medium">
                          {blocker.severity.toUpperCase()}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${statusColors[blocker.status]}`}>
                          {blocker.status}
                        </span>
                        {member && (
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            → {member.name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm mb-2">{blocker.description}</p>
                      <div className="flex items-center gap-2">
                        <select
                          value={blocker.status}
                          onChange={(e) => updateBlockerStatus(blocker.id, e.target.value as Blocker['status'])}
                          className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900"
                        >
                          <option value="open">Open</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteBlocker(blocker.id)}
                      className="text-xs hover:underline ml-4"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-500 py-6">
            No blockers reported
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Summary
        </h3>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {standup.attendees.length}/{teamMembers.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Attendance
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {standup.blockers.filter(b => b.status === 'open').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Open Blockers
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {standup.duration}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Minutes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
