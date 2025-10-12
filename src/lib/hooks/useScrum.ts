/**
 * Scrum React Hooks
 * Custom hooks for managing scrum state and operations
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  Sprint,
  Epic,
  UserStory,
  Task,
  TeamMember,
  Team,
  SprintMetrics,
  VelocityData,
  Label,
  ScrumSettings,
} from '@/lib/types/scrum';
import { ScrumService } from '@/lib/services/scrumService';

// ============================================================================
// useSprints Hook
// ============================================================================

export function useSprints() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSprints = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/scrum/sprints');
      const data = await response.json();
      setSprints(data.sprints || []);
    } catch (error) {
      console.error('Error loading sprints:', error);
      setSprints([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSprints();
  }, [loadSprints]);

  const createSprint = useCallback(
    (data: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt' | 'velocity'>) => {
      const sprint = ScrumService.Sprint.create(data);
      loadSprints();
      return sprint;
    },
    [loadSprints]
  );

  const updateSprint = useCallback(
    (id: string, data: Partial<Sprint>) => {
      const sprint = ScrumService.Sprint.update(id, data);
      loadSprints();
      return sprint;
    },
    [loadSprints]
  );

  const deleteSprint = useCallback(
    (id: string) => {
      const success = ScrumService.Sprint.delete(id);
      if (success) loadSprints();
      return success;
    },
    [loadSprints]
  );

  const startSprint = useCallback(
    (id: string) => {
      const sprint = ScrumService.Sprint.start(id);
      loadSprints();
      return sprint;
    },
    [loadSprints]
  );

  const completeSprint = useCallback(
    (id: string, incompleteStoryActions?: { storyId: string; targetSprintId: string | null }[]) => {
      const sprint = ScrumService.Sprint.complete(id, incompleteStoryActions);
      loadSprints();
      return sprint;
    },
    [loadSprints]
  );

  const activeSprint = sprints.find((s) => s.status === 'active');

  return {
    sprints,
    activeSprint,
    loading,
    createSprint,
    updateSprint,
    deleteSprint,
    startSprint,
    completeSprint,
    refresh: loadSprints,
  };
}

// ============================================================================
// useEpics Hook
// ============================================================================

export function useEpics() {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEpics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/scrum/epics');
      const data = await response.json();
      setEpics(data.epics || []);
    } catch (error) {
      console.error('Error loading epics:', error);
      setEpics([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEpics();
  }, [loadEpics]);

  const createEpic = useCallback(
    (data: Omit<Epic, 'id' | 'createdAt' | 'updatedAt' | 'progress'>) => {
      const epic = ScrumService.Epic.create(data);
      loadEpics();
      return epic;
    },
    [loadEpics]
  );

  const updateEpic = useCallback(
    (id: string, data: Partial<Epic>) => {
      const epic = ScrumService.Epic.update(id, data);
      loadEpics();
      return epic;
    },
    [loadEpics]
  );

  const deleteEpic = useCallback(
    (id: string) => {
      const success = ScrumService.Epic.delete(id);
      if (success) loadEpics();
      return success;
    },
    [loadEpics]
  );

  return {
    epics,
    loading,
    createEpic,
    updateEpic,
    deleteEpic,
    refresh: loadEpics,
  };
}

// ============================================================================
// useStories Hook
// ============================================================================

export function useStories(sprintId?: string) {
  const [stories, setStories] = useState<UserStory[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStories = useCallback(async () => {
    setLoading(true);
    try {
      const url = sprintId ? `/api/scrum/stories?sprintId=${sprintId}` : '/api/scrum/stories';
      const response = await fetch(url);
      const data = await response.json();
      setStories(data.stories || []);
    } catch (error) {
      console.error('Error loading stories:', error);
      setStories([]);
    } finally {
      setLoading(false);
    }
  }, [sprintId]);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  const createStory = useCallback(
    (data: Omit<UserStory, 'id' | 'createdAt' | 'updatedAt'>) => {
      const story = ScrumService.Story.create(data);
      loadStories();
      return story;
    },
    [loadStories]
  );

  const updateStory = useCallback(
    (id: string, data: Partial<UserStory>) => {
      const story = ScrumService.Story.update(id, data);
      loadStories();
      return story;
    },
    [loadStories]
  );

  const deleteStory = useCallback(
    (id: string) => {
      const success = ScrumService.Story.delete(id);
      if (success) loadStories();
      return success;
    },
    [loadStories]
  );

  const moveToSprint = useCallback(
    (storyId: string, targetSprintId: string | null) => {
      const story = ScrumService.Story.moveToSprint(storyId, targetSprintId);
      loadStories();
      return story;
    },
    [loadStories]
  );

  const updateStatus = useCallback(
    (storyId: string, status: UserStory['status']) => {
      const story = ScrumService.Story.updateStatus(storyId, status);
      loadStories();
      return story;
    },
    [loadStories]
  );

  return {
    stories,
    loading,
    createStory,
    updateStory,
    deleteStory,
    moveToSprint,
    updateStatus,
    refresh: loadStories,
  };
}

// ============================================================================
// useBacklog Hook
// ============================================================================

export function useBacklog() {
  const [backlog, setBacklog] = useState<UserStory[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBacklog = useCallback(() => {
    setLoading(true);
    const data = ScrumService.Story.getBacklog();
    setBacklog(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadBacklog();
  }, [loadBacklog]);

  return {
    backlog,
    loading,
    refresh: loadBacklog,
  };
}

// ============================================================================
// useTasks Hook
// ============================================================================

export function useTasks(storyId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(() => {
    setLoading(true);
    let data: Task[];
    if (storyId) {
      data = ScrumService.Task.getByStoryId(storyId);
    } else {
      data = ScrumService.Task.getAll();
    }
    setTasks(data);
    setLoading(false);
  }, [storyId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const createTask = useCallback(
    (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
      const task = ScrumService.Task.create(data);
      loadTasks();
      return task;
    },
    [loadTasks]
  );

  const updateTask = useCallback(
    (id: string, data: Partial<Task>) => {
      const task = ScrumService.Task.update(id, data);
      loadTasks();
      return task;
    },
    [loadTasks]
  );

  const deleteTask = useCallback(
    (id: string) => {
      const success = ScrumService.Task.delete(id);
      if (success) loadTasks();
      return success;
    },
    [loadTasks]
  );

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    refresh: loadTasks,
  };
}

// ============================================================================
// useTeam Hook
// ============================================================================

export function useTeam() {
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTeam = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/scrum/team');
      const data = await response.json();
      setTeam(data.team || null);
      setMembers(data.members || []);
    } catch (error) {
      console.error('Error loading team:', error);
      setTeam(null);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const createTeam = useCallback(
    (data: Omit<Team, 'id' | 'createdAt' | 'updatedAt' | 'averageVelocity'>) => {
      const newTeam = ScrumService.Team.createTeam(data);
      loadTeam();
      return newTeam;
    },
    [loadTeam]
  );

  const updateTeam = useCallback(
    (data: Partial<Team>) => {
      const updated = ScrumService.Team.updateTeam(data);
      loadTeam();
      return updated;
    },
    [loadTeam]
  );

  const addMember = useCallback(
    async (data: Omit<TeamMember, 'id' | 'joinedAt'>) => {
      try {
        const response = await fetch('/api/scrum/team', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        await loadTeam();
        return result.member;
      } catch (error) {
        console.error('Error adding member:', error);
        return null;
      }
    },
    [loadTeam]
  );

  const updateMember = useCallback(
    async (id: string, data: Partial<TeamMember>) => {
      try {
        const response = await fetch(`/api/scrum/team/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        await loadTeam();
        return result.member;
      } catch (error) {
        console.error('Error updating member:', error);
        return null;
      }
    },
    [loadTeam]
  );

  const removeMember = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/scrum/team/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          await loadTeam();
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error removing member:', error);
        return false;
      }
    },
    [loadTeam]
  );

  const totalCapacity = members.reduce((sum, m) => sum + (m.capacity * m.availability) / 100, 0);

  return {
    team,
    members,
    totalCapacity,
    loading,
    createTeam,
    updateTeam,
    addMember,
    updateMember,
    removeMember,
    refresh: loadTeam,
  };
}

// ============================================================================
// useLabels Hook
// ============================================================================

export function useLabels() {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLabels = useCallback(() => {
    setLoading(true);
    const data = ScrumService.Label.getAll();
    setLabels(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadLabels();
  }, [loadLabels]);

  const createLabel = useCallback(
    (data: Omit<Label, 'id' | 'createdAt'>) => {
      const label = ScrumService.Label.create(data);
      loadLabels();
      return label;
    },
    [loadLabels]
  );

  const deleteLabel = useCallback(
    (id: string) => {
      const success = ScrumService.Label.delete(id);
      if (success) loadLabels();
      return success;
    },
    [loadLabels]
  );

  return {
    labels,
    loading,
    createLabel,
    deleteLabel,
    refresh: loadLabels,
  };
}

// ============================================================================
// useSettings Hook
// ============================================================================

export function useSettings() {
  const [settings, setSettings] = useState<ScrumSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/scrum/settings');
      const data = await response.json();
      setSettings(data.settings || null);
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettings(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = useCallback(
    (data: Partial<ScrumSettings>) => {
      const updated = ScrumService.Settings.update(data);
      setSettings(updated);
      return updated;
    },
    []
  );

  return {
    settings,
    loading,
    updateSettings,
    refresh: loadSettings,
  };
}

// ============================================================================
// useSprintMetrics Hook
// ============================================================================

export function useSprintMetrics(sprintId: string) {
  const [metrics, setMetrics] = useState<SprintMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMetrics = useCallback(() => {
    if (!sprintId) {
      setMetrics(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const data = ScrumService.Metrics.getSprintMetrics(sprintId);
    setMetrics(data);
    setLoading(false);
  }, [sprintId]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  return {
    metrics,
    loading,
    refresh: loadMetrics,
  };
}

// ============================================================================
// useVelocity Hook
// ============================================================================

export function useVelocity() {
  const [velocityData, setVelocityData] = useState<VelocityData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVelocity = useCallback(() => {
    setLoading(true);
    const data = ScrumService.Metrics.getVelocityData();
    setVelocityData(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadVelocity();
  }, [loadVelocity]);

  const averageVelocity =
    velocityData.length > 0
      ? velocityData.reduce((sum, d) => sum + d.completed, 0) / velocityData.length
      : 0;

  return {
    velocityData,
    averageVelocity,
    loading,
    refresh: loadVelocity,
  };
}

// ============================================================================
// useScrum - Main Hook (combines common hooks)
// ============================================================================

export function useScrum() {
  const sprintsData = useSprints();
  const epicsData = useEpics();
  const storiesData = useStories();
  const teamData = useTeam();
  const labelsData = useLabels();
  const settingsData = useSettings();

  const loading =
    sprintsData.loading ||
    epicsData.loading ||
    storiesData.loading ||
    teamData.loading ||
    labelsData.loading ||
    settingsData.loading;

  const refreshAll = useCallback(() => {
    sprintsData.refresh();
    epicsData.refresh();
    storiesData.refresh();
    teamData.refresh();
    labelsData.refresh();
    settingsData.refresh();
  }, [sprintsData, epicsData, storiesData, teamData, labelsData, settingsData]);

  return {
    sprints: sprintsData,
    epics: epicsData,
    stories: storiesData,
    team: teamData,
    labels: labelsData,
    settings: settingsData,
    loading,
    refreshAll,
  };
}

// Export all hooks
export default useScrum;
