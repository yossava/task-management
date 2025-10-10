'use client';

import { useState, useMemo } from 'react';
import type { Sprint, TeamMember } from '@/lib/types/scrum';

interface DailyStandupTrackerProps {
  sprint: Sprint;
  teamMembers: TeamMember[];
  onSaveStandup?: (standup: StandupData) => void;
}

interface StandupUpdate {
  memberId: string;
  memberName: string;
  yesterday: string;
  today: string;
  blockers: string;
}

interface StandupData {
  id: string;
  sprintId: string;
  date: string;
  attendees: string[];
  updates: StandupUpdate[];
  duration: number;
  notes: string;
}

export default function DailyStandupTracker({
  sprint,
  teamMembers,
  onSaveStandup,
}: DailyStandupTrackerProps) {
  const [standupDate, setStandupDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendees, setAttendees] = useState<string[]>(teamMembers.map((m) => m.id));
  const [updates, setUpdates] = useState<StandupUpdate[]>(
    teamMembers.map((m) => ({
      memberId: m.id,
      memberName: m.name,
      yesterday: '',
      today: '',
      blockers: '',
    }))
  );
  const [notes, setNotes] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Timer for standup duration
  const startStandup = () => {
    setStartTime(new Date());
    setIsRunning(true);
  };

  const stopStandup = () => {
    if (startTime) {
      const now = new Date();
      const durationMinutes = Math.round((now.getTime() - startTime.getTime()) / 1000 / 60);
      setDuration(durationMinutes);
    }
    setIsRunning(false);
  };

  // Toggle attendee
  const toggleAttendee = (memberId: string) => {
    setAttendees((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  // Update member's standup
  const updateMemberStandup = (
    memberId: string,
    field: 'yesterday' | 'today' | 'blockers',
    value: string
  ) => {
    setUpdates((prev) =>
      prev.map((update) =>
        update.memberId === memberId ? { ...update, [field]: value } : update
      )
    );
  };

  // Save standup
  const saveStandup = () => {
    const standupData: StandupData = {
      id: `standup-${Date.now()}`,
      sprintId: sprint.id,
      date: standupDate,
      attendees,
      updates: updates.filter((u) => attendees.includes(u.memberId)),
      duration,
      notes,
    };

    if (onSaveStandup) {
      onSaveStandup(standupData);
    }

    setShowSummary(true);
  };

  // Analytics
  const analytics = useMemo(() => {
    const totalBlockers = updates.filter((u) => u.blockers.trim() !== '').length;
    const completionRate = updates.filter((u) => u.yesterday.trim() !== '' || u.today.trim() !== '').length;
    const attendanceRate = attendees.length > 0 ? (attendees.length / teamMembers.length) * 100 : 0;

    return {
      totalBlockers,
      completionRate,
      attendanceRate: Math.round(attendanceRate),
      isOnTime: duration <= 15,
    };
  }, [updates, attendees, teamMembers, duration]);

  // Blockers list
  const blockersList = useMemo(() => {
    return updates
      .filter((u) => u.blockers.trim() !== '' && attendees.includes(u.memberId))
      .map((u) => ({
        member: u.memberName,
        blocker: u.blockers,
      }));
  }, [updates, attendees]);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Daily Standup Tracker
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track daily standup for {sprint.name}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {isRunning && startTime
                  ? Math.floor((Date.now() - startTime.getTime()) / 1000 / 60)
                  : duration} min
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {isRunning ? 'In Progress' : 'Duration'}
              </div>
            </div>

            {/* Timer Controls */}
            {!isRunning ? (
              <button
                onClick={startStandup}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Start Standup
              </button>
            ) : (
              <button
                onClick={stopStandup}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Stop Standup
              </button>
            )}
          </div>
        </div>

        {/* Date and Attendance */}
        <div className="mt-4 flex items-center gap-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Date</label>
            <input
              type="date"
              value={standupDate}
              onChange={(e) => setStandupDate(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
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

      {/* Updates Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 gap-6">
          {teamMembers
            .filter((m) => attendees.includes(m.id))
            .map((member) => {
              const update = updates.find((u) => u.memberId === member.id);
              if (!update) return null;

              return (
                <div
                  key={member.id}
                  className="border border-gray-200 dark:border-gray-800 rounded-lg p-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {member.name.charAt(0)}
                    </div>

                    {/* Update Fields */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                          {member.name}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {member.role}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          ✅ What did you accomplish yesterday?
                        </label>
                        <textarea
                          value={update.yesterday}
                          onChange={(e) =>
                            updateMemberStandup(member.id, 'yesterday', e.target.value)
                          }
                          placeholder="e.g., Completed user authentication flow..."
                          rows={2}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          🎯 What will you work on today?
                        </label>
                        <textarea
                          value={update.today}
                          onChange={(e) =>
                            updateMemberStandup(member.id, 'today', e.target.value)
                          }
                          placeholder="e.g., Implement password reset functionality..."
                          rows={2}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          🚧 Any blockers or impediments?
                        </label>
                        <textarea
                          value={update.blockers}
                          onChange={(e) =>
                            updateMemberStandup(member.id, 'blockers', e.target.value)
                          }
                          placeholder="e.g., Waiting for API documentation..."
                          rows={1}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Notes */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Additional Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes or action items from the standup..."
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>
      </div>

      {/* Analytics Bar */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {analytics.attendanceRate}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Attendance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {duration || 0}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Minutes</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${analytics.totalBlockers > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {analytics.totalBlockers}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Blockers</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${analytics.isOnTime ? 'text-green-600' : 'text-yellow-600'}`}>
              {analytics.isOnTime ? '✓' : '!'}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">On Time</div>
          </div>
        </div>
      </div>

      {/* Blockers Summary */}
      {blockersList.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-800 p-6 bg-red-50 dark:bg-red-900/10">
          <h3 className="text-lg font-bold text-red-900 dark:text-red-300 mb-3">
            🚨 Active Blockers ({blockersList.length})
          </h3>
          <div className="space-y-2">
            {blockersList.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-sm text-red-800 dark:text-red-200"
              >
                <span className="font-medium">{item.member}:</span>
                <span>{item.blocker}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
            onClick={saveStandup}
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Save Standup
          </button>
        </div>
      </div>

      {/* Summary Modal */}
      {showSummary && (
        <div className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50 dark:bg-gray-950">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Standup Summary
          </h3>

          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Date:</strong> {new Date(standupDate).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Duration:</strong> {duration} minutes {analytics.isOnTime ? '(On Time ✓)' : '(Overtime !)'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Attendance:</strong> {attendees.length}/{teamMembers.length} members ({analytics.attendanceRate}%)
              </div>
            </div>

            {blockersList.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800 p-4">
                <h4 className="text-sm font-bold text-red-900 dark:text-red-300 mb-2">
                  Action Required - {blockersList.length} Blocker{blockersList.length > 1 ? 's' : ''}
                </h4>
                <ul className="list-disc list-inside text-sm text-red-800 dark:text-red-200 space-y-1">
                  {blockersList.map((item, idx) => (
                    <li key={idx}>
                      <strong>{item.member}:</strong> {item.blocker}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {notes && (
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Notes</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
