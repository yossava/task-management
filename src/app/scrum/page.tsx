'use client';

import { useState } from 'react';
import { useScrum, useSprints, useSprintMetrics } from '@/lib/hooks/useScrum';
import type { Sprint } from '@/lib/types/scrum';
import ScrumLayout from '@/components/scrum/ScrumLayout';
import TeamManager from '@/components/scrum/TeamManager';
import LabelManager from '@/components/scrum/LabelManager';
import SettingsConfig from '@/components/scrum/SettingsConfig';
import WorkloadWidget from '@/components/scrum/WorkloadWidget';
import DataExportImport from '@/components/scrum/DataExportImport';
import Link from 'next/link';

export default function ScrumDashboard() {
  const { sprints, activeSprint, loading: sprintsLoading } = useSprints();
  const teamHooks = useScrum().team;
  const { team, members, totalCapacity, loading: teamLoading, createTeam, updateTeam, addMember, updateMember, removeMember } = teamHooks;
  const { epics, loading: epicsLoading } = useScrum().epics;
  const { stories, loading: storiesLoading } = useScrum().stories;
  const { metrics } = useSprintMetrics(activeSprint?.id || '');

  const [view, setView] = useState<'overview' | 'team' | 'settings'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const loading = sprintsLoading || teamLoading || epicsLoading || storiesLoading;

  // Calculate statistics
  const totalStories = stories.length;
  const backlogStories = stories.filter((s) => s.status === 'backlog').length;
  const completedStories = stories.filter((s) => s.status === 'done').length;
  const activeEpics = epics.filter((e) => e.status === 'in-progress').length;

  return (
    <ScrumLayout>
      <>
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Scrum Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Agile sprint planning and management
                </p>
              </div>

              <nav className="hidden md:flex items-center gap-4">
                <button
                  onClick={() => setView('overview')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    view === 'overview'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setView('team')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    view === 'team'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Team
                </button>
                <button
                  onClick={() => setView('settings')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    view === 'settings'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Settings
                </button>
              </nav>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
              <div className="md:hidden mt-4 pb-4 px-4 border-t border-gray-200 dark:border-gray-800 pt-4">
                <div className="space-y-2">
                  <button
                    onClick={() => { setView('overview'); setIsMobileMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      view === 'overview'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => { setView('team'); setIsMobileMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      view === 'team'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    Team
                  </button>
                  <button
                    onClick={() => { setView('settings'); setIsMobileMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      view === 'settings'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-gray-50 dark:bg-gray-950">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : view === 'overview' ? (
          <OverviewView
            sprints={sprints}
            activeSprint={activeSprint}
            epics={epics}
            stories={stories}
            members={members}
            totalCapacity={totalCapacity}
            metrics={metrics}
            stats={{
              totalStories,
              backlogStories,
              completedStories,
              activeEpics,
            }}
            setView={setView}
          />
        ) : view === 'team' ? (
          <TeamManager
            team={team}
            members={members}
            onCreateTeam={createTeam}
            onUpdateTeam={updateTeam}
            onAddMember={addMember}
            onUpdateMember={updateMember}
            onRemoveMember={removeMember}
          />
        ) : (
          <SettingsView />
        )}
      </main>
      </>
    </ScrumLayout>
  );
}

// ============================================================================
// Overview View
// ============================================================================

function OverviewView({ sprints, activeSprint, epics, stories, members, totalCapacity, metrics, stats, setView }: any) {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Welcome to Scrum Board</h2>
        <p className="text-blue-100">
          Manage your agile sprints, track progress, and collaborate with your team. Use the sidebar to navigate between different Scrum sections.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Stories"
          value={stats.totalStories}
          icon="📝"
          color="blue"
        />
        <StatCard
          title="Backlog Items"
          value={stats.backlogStories}
          icon="📋"
          color="gray"
        />
        <StatCard
          title="Completed"
          value={stats.completedStories}
          icon="✅"
          color="green"
        />
        <StatCard
          title="Active Epics"
          value={stats.activeEpics}
          icon="🎯"
          color="purple"
        />
      </div>

      {/* Active Sprint */}
      {activeSprint ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Active Sprint
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {activeSprint.name}
              </p>
            </div>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium rounded-full">
              Active
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Sprint Goal</span>
              </div>
              <p className="text-gray-900 dark:text-white">{activeSprint.goal}</p>
            </div>

            {metrics && (
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {Math.round(metrics.completionRate)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
                    style={{ width: `${metrics.completionRate}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-gray-500 dark:text-gray-500">
                    {metrics.completedStoryPoints} / {metrics.totalStoryPoints} points
                  </span>
                  <span className="text-gray-500 dark:text-gray-500">
                    {new Date(activeSprint.startDate).toLocaleDateString()} -{' '}
                    {new Date(activeSprint.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Link
              href="/scrum/board"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
            >
              View Board
            </Link>
            <Link
              href={`/scrum/metrics/${activeSprint.id}`}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
            >
              View Metrics
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚀</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Active Sprint
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start a new sprint to begin tracking your team's progress
          </p>
          <Link
            href="/scrum/planning"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Create Sprint
          </Link>
        </div>
      )}

      {/* Workload Widget */}
      {members.length > 0 && (
        <WorkloadWidget
          members={members}
          stories={stories}
          sprints={sprints}
          epics={epics}
        />
      )}

      {/* Team & Recent Sprints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Summary */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Team
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Members</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {members.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Capacity</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {totalCapacity} points
              </span>
            </div>
          </div>
          <button
            onClick={() => setView('team')}
            className="w-full mt-4 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Manage Team
          </button>
        </div>

        {/* Recent Sprints */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Sprints
          </h3>
          <div className="space-y-3">
            {sprints.slice(0, 3).map((sprint: Sprint) => (
              <div
                key={sprint.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {sprint.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {sprint.velocity} points completed
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    sprint.status === 'active'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : sprint.status === 'completed'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {sprint.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Settings View
// ============================================================================

function SettingsView() {
  const [activeTab, setActiveTab] = useState<'labels' | 'general' | 'data'>('labels');
  const [showExportImport, setShowExportImport] = useState(false);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="flex gap-4 px-6" aria-label="Settings tabs">
            <button
              onClick={() => setActiveTab('labels')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'labels'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Labels
            </button>
            <button
              onClick={() => setActiveTab('general')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'general'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              General Settings
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'data'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Data Management
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'labels' ? (
            <LabelManager />
          ) : activeTab === 'general' ? (
            <SettingsConfig />
          ) : (
            <DataManagementPanel onOpenExportImport={() => setShowExportImport(true)} />
          )}
        </div>
      </div>

      {/* Export/Import Modal */}
      {showExportImport && (
        <DataExportImport onClose={() => setShowExportImport(false)} />
      )}
    </div>
  );
}

// ============================================================================
// Data Management Panel Component
// ============================================================================

function DataManagementPanel({ onOpenExportImport }: { onOpenExportImport: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Data Management
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Export and import your Scrum data for backup or migration purposes.
        </p>
      </div>

      {/* Export/Import Section */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              Export & Import Data
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Download all your Scrum data as JSON or import data from a previous export. This includes sprints, stories, epics, and team members.
            </p>
            <button
              onClick={onOpenExportImport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Manage Data
            </button>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h5 className="text-sm font-semibold text-yellow-900 dark:text-yellow-300 mb-1">
              Important Information
            </h5>
            <ul className="text-sm text-yellow-800 dark:text-yellow-400 space-y-1">
              <li>• Export your data regularly to prevent data loss</li>
              <li>• Import will add new items to your existing data</li>
              <li>• Always backup before importing to avoid conflicts</li>
              <li>• Export files contain all sprints, stories, epics, and team data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Stat Card Component
// ============================================================================

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    gray: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            colorClasses[color as keyof typeof colorClasses]
          }`}
        >
          {value}
        </span>
      </div>
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
    </div>
  );
}
