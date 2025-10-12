'use client';

import { useState, useMemo } from 'react';
import type { UserStory, Sprint, Epic } from '@/lib/types/scrum';

interface DependencyVisualizerProps {
  stories: UserStory[];
  sprints: Sprint[];
  epics: Epic[];
  onClose: () => void;
}

interface StoryNode {
  story: UserStory;
  dependencies: UserStory[];
  dependents: UserStory[];
  level: number; // Depth in dependency tree
  hasCircular: boolean;
}

export default function DependencyVisualizer({
  stories,
  sprints,
  epics,
  onClose,
}: DependencyVisualizerProps) {
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [filterSprint, setFilterSprint] = useState<string>('all');
  const [filterEpic, setFilterEpic] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');

  // Filter stories
  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      if (filterSprint !== 'all' && story.sprintId !== filterSprint) return false;
      if (filterEpic !== 'all' && story.epicId !== filterEpic) return false;
      return true;
    });
  }, [stories, filterSprint, filterEpic]);

  // Build dependency graph
  const dependencyGraph = useMemo(() => {
    const graph: Record<string, StoryNode> = {};

    // Initialize all nodes
    filteredStories.forEach((story) => {
      graph[story.id] = {
        story,
        dependencies: [],
        dependents: [],
        level: 0,
        hasCircular: false,
      };
    });

    // Build relationships
    filteredStories.forEach((story) => {
      if (story.dependencies && story.dependencies.length > 0) {
        story.dependencies.forEach((depId) => {
          const depStory = filteredStories.find((s) => s.id === depId);
          if (depStory) {
            graph[story.id].dependencies.push(depStory);
            if (graph[depId]) {
              graph[depId].dependents.push(story);
            }
          }
        });
      }
    });

    // Calculate levels and detect circular dependencies
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const calculateLevel = (storyId: string, depth: number = 0): number => {
      if (visiting.has(storyId)) {
        graph[storyId].hasCircular = true;
        return depth;
      }
      if (visited.has(storyId)) {
        return graph[storyId].level;
      }

      visiting.add(storyId);
      let maxLevel = depth;

      graph[storyId].dependencies.forEach((dep) => {
        const depLevel = calculateLevel(dep.id, depth + 1);
        maxLevel = Math.max(maxLevel, depLevel);
      });

      visiting.delete(storyId);
      visited.add(storyId);
      graph[storyId].level = maxLevel;
      return maxLevel;
    };

    Object.keys(graph).forEach((storyId) => {
      if (!visited.has(storyId)) {
        calculateLevel(storyId);
      }
    });

    return graph;
  }, [filteredStories]);

  // Get stories with dependencies
  const storiesWithDeps = useMemo(() => {
    return filteredStories.filter(
      (s) => (s.dependencies && s.dependencies.length > 0) || dependencyGraph[s.id]?.dependents.length > 0
    );
  }, [filteredStories, dependencyGraph]);

  // Get root stories (no dependencies)
  const rootStories = useMemo(() => {
    return filteredStories.filter((s) => !s.dependencies || s.dependencies.length === 0);
  }, [filteredStories]);

  // Get blocked stories
  const blockedStories = useMemo(() => {
    return filteredStories.filter((s) => {
      if (!s.dependencies || s.dependencies.length === 0) return false;
      return s.dependencies.some((depId) => {
        const depStory = stories.find((st) => st.id === depId);
        return depStory && depStory.status !== 'done';
      });
    });
  }, [filteredStories, stories]);

  // Get critical path (longest dependency chain)
  const criticalPath = useMemo(() => {
    let maxLevel = 0;
    let criticalStory: string | null = null;

    Object.entries(dependencyGraph).forEach(([id, node]) => {
      if (node.level > maxLevel) {
        maxLevel = node.level;
        criticalStory = id;
      }
    });

    if (!criticalStory) return [];

    // Build path from root to critical story
    const path: UserStory[] = [];
    let current = dependencyGraph[criticalStory];

    while (current) {
      path.unshift(current.story);
      if (current.dependencies.length === 0) break;
      // Find dependency with highest level
      const nextDep = current.dependencies.reduce((max, dep) =>
        dependencyGraph[dep.id].level > dependencyGraph[max.id].level ? dep : max
      );
      current = dependencyGraph[nextDep.id];
    }

    return path;
  }, [dependencyGraph]);

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'blocked':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Render story node
  const renderStoryNode = (story: UserStory, depth: number = 0, visited: Set<string> = new Set()) => {
    if (visited.has(story.id)) {
      return (
        <div
          key={`${story.id}-circular`}
          style={{ marginLeft: `${depth * 2}rem` }}
          className="flex items-center gap-2 p-2 border-l-2 border-red-500 text-red-600 dark:text-red-400 text-sm italic"
        >
          Circular dependency detected
        </div>
      );
    }

    visited.add(story.id);
    const node = dependencyGraph[story.id];
    const isSelected = selectedStoryId === story.id;
    const isBlocked = blockedStories.some((s) => s.id === story.id);

    return (
      <div key={story.id} style={{ marginLeft: `${depth * 2}rem` }} className="mb-2">
        <button
          onClick={() => setSelectedStoryId(isSelected ? null : story.id)}
          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
            isSelected
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : isBlocked
              ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10 hover:border-red-400'
              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {isBlocked && (
                  <span className="text-red-600 dark:text-red-400" title="Story is blocked">
                    🚫
                  </span>
                )}
                {node?.hasCircular && (
                  <span className="text-red-600 dark:text-red-400" title="Circular dependency">
                    ⚠️
                  </span>
                )}
                <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
                  {story.title}
                </h4>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(story.priority)}`}>
                  {story.priority}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(story.status)}`}>
                  {story.status}
                </span>
                {story.storyPoints && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    {story.storyPoints} pts
                  </span>
                )}
                {node?.dependencies.length > 0 && (
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {node.dependencies.length} {node.dependencies.length === 1 ? 'dependency' : 'dependencies'}
                  </span>
                )}
                {node?.dependents.length > 0 && (
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {node.dependents.length} {node.dependents.length === 1 ? 'dependent' : 'dependents'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </button>

        {/* Show dependencies recursively */}
        {isSelected && node && node.dependencies.length > 0 && (
          <div className="mt-2 ml-4 border-l-2 border-gray-300 dark:border-gray-700 pl-2">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Depends on:
            </p>
            {node.dependencies.map((dep) => renderStoryNode(dep, depth + 1, new Set(visited)))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Story Dependency Visualizer
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Visualize and analyze story dependencies to identify blockers and critical paths
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Stories</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredStories.length}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">With Dependencies</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {storiesWithDeps.length}
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
              <div className="text-xs text-red-600 dark:text-red-400 mb-1">Blocked Stories</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {blockedStories.length}
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Critical Path Length</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {criticalPath.length}
              </div>
            </div>
          </div>

          {/* Filters and View Mode */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <select
              value={filterSprint}
              onChange={(e) => setFilterSprint(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="all">All Sprints</option>
              {sprints.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.name}
                </option>
              ))}
            </select>

            <select
              value={filterEpic}
              onChange={(e) => setFilterEpic(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="all">All Epics</option>
              {epics.map((epic) => (
                <option key={epic.id} value={epic.id}>
                  {epic.title}
                </option>
              ))}
            </select>

            <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('tree')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'tree'
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Tree View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                List View
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Critical Path */}
          {criticalPath.length > 0 && (
            <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                </svg>
                Critical Path ({criticalPath.length} stories)
              </h3>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {criticalPath.map((story, idx) => (
                  <div key={story.id} className="flex items-center gap-2">
                    <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-lg p-2 min-w-[200px]">
                      <p className="text-xs font-medium text-gray-900 dark:text-white line-clamp-1">
                        {story.title}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${getStatusColor(story.status)}`}>
                          {story.status}
                        </span>
                        {story.storyPoints && (
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {story.storyPoints} pts
                          </span>
                        )}
                      </div>
                    </div>
                    {idx < criticalPath.length - 1 && (
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dependency Tree/List */}
          {viewMode === 'tree' ? (
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Dependency Tree
              </h3>
              {rootStories.length > 0 ? (
                <div className="space-y-2">
                  {rootStories.map((story) => renderStoryNode(story))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                  No root stories found (all stories have dependencies)
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                All Stories with Dependencies
              </h3>
              {storiesWithDeps.length > 0 ? (
                <div className="space-y-2">
                  {storiesWithDeps.map((story) => renderStoryNode(story))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl">🎯</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    No dependencies found in current filter
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
