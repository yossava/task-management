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

  const loadSprints = useCallback(() => {
    setLoading(true);
    const data = ScrumService.Sprint.getAll();
    setSprints(data);
    setLoading(false);
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

  const loadEpics = useCallback(() => {
    setLoading(true);
    const data = ScrumService.Epic.getAll();
    setEpics(data);
    setLoading(false);
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

  const loadStories = useCallback(() => {
    setLoading(true);
    let data: UserStory[];
    if (sprintId) {
      data = ScrumService.Story.getBySprintId(sprintId);
    } else {
      data = ScrumService.Story.getAll();
    }
    setStories(data);
    setLoading(false);
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

  const loadTeam = useCallback(() => {
    setLoading(true);
    const teamData = ScrumService.Team.getTeam();
    const membersData = ScrumService.Team.getMembers();
    setTeam(teamData);
    setMembers(membersData);
    setLoading(false);
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
    (data: Omit<TeamMember, 'id' | 'joinedAt'>) => {
      const member = ScrumService.Team.addMember(data);
      loadTeam();
      return member;
    },
    [loadTeam]
  );

  const updateMember = useCallback(
    (id: string, data: Partial<TeamMember>) => {
      const member = ScrumService.Team.updateMember(id, data);
      loadTeam();
      return member;
    },
    [loadTeam]
  );

  const removeMember = useCallback(
    (id: string) => {
      const success = ScrumService.Team.removeMember(id);
      if (success) loadTeam();
      return success;
    },
    [loadTeam]
  );

  const totalCapacity = ScrumService.Team.getTotalCapacity();

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

  const loadSettings = useCallback(() => {
    setLoading(true);
    const data = ScrumService.Settings.get();
    setSettings(data);
    setLoading(false);
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
