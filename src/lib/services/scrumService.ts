/**
 * Scrum Service
 * Core business logic and data persistence for Scrum features
 */

import type {
  Sprint,
  Epic,
  UserStory,
  Task,
  TeamMember,
  Team,
  SprintMetrics,
  BurndownPoint,
  BurnupPoint,
  CFDPoint,
  DailyProgress,
  VelocityData,
  Retrospective,
  DailyStandup,
  SprintReview,
  BoardColumn,
  Label,
  ScrumSettings,
} from '@/lib/types/scrum';

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  SPRINTS: 'scrum_sprints',
  EPICS: 'scrum_epics',
  STORIES: 'scrum_stories',
  TASKS: 'scrum_tasks',
  TEAM_MEMBERS: 'scrum_team_members',
  TEAM: 'scrum_team',
  RETROSPECTIVES: 'scrum_retrospectives',
  DAILY_STANDUPS: 'scrum_daily_standups',
  SPRINT_REVIEWS: 'scrum_sprint_reviews',
  LABELS: 'scrum_labels',
  SETTINGS: 'scrum_settings',
  METRICS: 'scrum_metrics',
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

function getFromStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

// ============================================================================
// Sprint Service
// ============================================================================

export const SprintService = {
  getAll: (): Sprint[] => {
    return getFromStorage<Sprint>(STORAGE_KEYS.SPRINTS);
  },

  getById: (id: string): Sprint | undefined => {
    const sprints = getFromStorage<Sprint>(STORAGE_KEYS.SPRINTS);
    return sprints.find((s) => s.id === id);
  },

  getActive: (): Sprint | undefined => {
    const sprints = getFromStorage<Sprint>(STORAGE_KEYS.SPRINTS);
    return sprints.find((s) => s.status === 'active');
  },

  create: (data: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt' | 'velocity'>): Sprint => {
    const sprint: Sprint = {
      ...data,
      id: generateId(),
      velocity: 0,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    };

    const sprints = getFromStorage<Sprint>(STORAGE_KEYS.SPRINTS);
    sprints.push(sprint);
    saveToStorage(STORAGE_KEYS.SPRINTS, sprints);

    return sprint;
  },

  update: (id: string, data: Partial<Sprint>): Sprint | undefined => {
    const sprints = getFromStorage<Sprint>(STORAGE_KEYS.SPRINTS);
    const index = sprints.findIndex((s) => s.id === id);

    if (index === -1) return undefined;

    sprints[index] = {
      ...sprints[index],
      ...data,
      updatedAt: getCurrentTimestamp(),
    };

    saveToStorage(STORAGE_KEYS.SPRINTS, sprints);
    return sprints[index];
  },

  delete: (id: string): boolean => {
    const sprints = getFromStorage<Sprint>(STORAGE_KEYS.SPRINTS);
    const filtered = sprints.filter((s) => s.id !== id);

    if (filtered.length === sprints.length) return false;

    saveToStorage(STORAGE_KEYS.SPRINTS, filtered);
    return true;
  },

  start: (id: string): Sprint | undefined => {
    // Set any active sprint to completed first
    const sprints = getFromStorage<Sprint>(STORAGE_KEYS.SPRINTS);
    const activeSprint = sprints.find((s) => s.status === 'active');

    if (activeSprint) {
      SprintService.complete(activeSprint.id);
    }

    return SprintService.update(id, { status: 'active' });
  },

  complete: (id: string, incompleteStoryActions?: { storyId: string; targetSprintId: string | null }[]): Sprint | undefined => {
    const sprint = SprintService.getById(id);
    if (!sprint) return undefined;

    // Calculate final velocity
    const stories = StoryService.getBySprintId(id);
    const completedPoints = stories
      .filter((s) => s.status === 'done')
      .reduce((sum, s) => sum + (s.storyPoints || 0), 0);

    // Move incomplete stories if actions provided
    if (incompleteStoryActions) {
      incompleteStoryActions.forEach(({ storyId, targetSprintId }) => {
        StoryService.moveToSprint(storyId, targetSprintId);
      });
    }

    return SprintService.update(id, {
      status: 'completed',
      velocity: completedPoints,
    });
  },
};

// ============================================================================
// Epic Service
// ============================================================================

export const EpicService = {
  getAll: (): Epic[] => {
    return getFromStorage<Epic>(STORAGE_KEYS.EPICS);
  },

  getById: (id: string): Epic | undefined => {
    const epics = getFromStorage<Epic>(STORAGE_KEYS.EPICS);
    return epics.find((e) => e.id === id);
  },

  create: (data: Omit<Epic, 'id' | 'createdAt' | 'updatedAt' | 'progress'>): Epic => {
    const epic: Epic = {
      ...data,
      id: generateId(),
      progress: 0,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    };

    const epics = getFromStorage<Epic>(STORAGE_KEYS.EPICS);
    epics.push(epic);
    saveToStorage(STORAGE_KEYS.EPICS, epics);

    return epic;
  },

  update: (id: string, data: Partial<Epic>): Epic | undefined => {
    const epics = getFromStorage<Epic>(STORAGE_KEYS.EPICS);
    const index = epics.findIndex((e) => e.id === id);

    if (index === -1) return undefined;

    epics[index] = {
      ...epics[index],
      ...data,
      updatedAt: getCurrentTimestamp(),
    };

    saveToStorage(STORAGE_KEYS.EPICS, epics);
    return epics[index];
  },

  delete: (id: string): boolean => {
    const epics = getFromStorage<Epic>(STORAGE_KEYS.EPICS);
    const filtered = epics.filter((e) => e.id !== id);

    if (filtered.length === epics.length) return false;

    saveToStorage(STORAGE_KEYS.EPICS, filtered);
    return true;
  },

  updateProgress: (id: string): void => {
    const stories = StoryService.getAll().filter((s) => s.epicId === id);
    if (stories.length === 0) return;

    const completedStories = stories.filter((s) => s.status === 'done').length;
    const progress = Math.round((completedStories / stories.length) * 100);

    EpicService.update(id, { progress });
  },
};

// ============================================================================
// Story Service
// ============================================================================

export const StoryService = {
  getAll: (): UserStory[] => {
    return getFromStorage<UserStory>(STORAGE_KEYS.STORIES);
  },

  getById: (id: string): UserStory | undefined => {
    const stories = getFromStorage<UserStory>(STORAGE_KEYS.STORIES);
    return stories.find((s) => s.id === id);
  },

  getBySprintId: (sprintId: string): UserStory[] => {
    const stories = getFromStorage<UserStory>(STORAGE_KEYS.STORIES);
    return stories.filter((s) => s.sprintId === sprintId);
  },

  getBacklog: (): UserStory[] => {
    const stories = getFromStorage<UserStory>(STORAGE_KEYS.STORIES);
    return stories.filter((s) => !s.sprintId || s.status === 'backlog');
  },

  create: (data: Omit<UserStory, 'id' | 'createdAt' | 'updatedAt'>): UserStory => {
    const story: UserStory = {
      ...data,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    };

    const stories = getFromStorage<UserStory>(STORAGE_KEYS.STORIES);
    stories.push(story);
    saveToStorage(STORAGE_KEYS.STORIES, stories);

    // Update epic progress if story belongs to an epic
    if (story.epicId) {
      EpicService.updateProgress(story.epicId);
    }

    return story;
  },

  update: (id: string, data: Partial<UserStory>): UserStory | undefined => {
    const stories = getFromStorage<UserStory>(STORAGE_KEYS.STORIES);
    const index = stories.findIndex((s) => s.id === id);

    if (index === -1) return undefined;

    const oldEpicId = stories[index].epicId;
    const newEpicId = data.epicId;

    stories[index] = {
      ...stories[index],
      ...data,
      updatedAt: getCurrentTimestamp(),
    };

    saveToStorage(STORAGE_KEYS.STORIES, stories);

    // Update epic progress if changed
    if (oldEpicId) EpicService.updateProgress(oldEpicId);
    if (newEpicId && newEpicId !== oldEpicId) EpicService.updateProgress(newEpicId);

    return stories[index];
  },

  delete: (id: string): boolean => {
    const stories = getFromStorage<UserStory>(STORAGE_KEYS.STORIES);
    const story = stories.find((s) => s.id === id);
    const filtered = stories.filter((s) => s.id !== id);

    if (filtered.length === stories.length) return false;

    saveToStorage(STORAGE_KEYS.STORIES, filtered);

    // Update epic progress if story belonged to an epic
    if (story?.epicId) {
      EpicService.updateProgress(story.epicId);
    }

    // Delete associated tasks
    const tasks = TaskService.getByStoryId(id);
    tasks.forEach((task) => TaskService.delete(task.id));

    return true;
  },

  moveToSprint: (storyId: string, sprintId: string | null): UserStory | undefined => {
    return StoryService.update(storyId, {
      sprintId: sprintId || undefined,
      status: sprintId ? 'todo' : 'backlog',
    });
  },

  updateStatus: (storyId: string, status: UserStory['status']): UserStory | undefined => {
    return StoryService.update(storyId, { status });
  },
};

// ============================================================================
// Task Service
// ============================================================================

export const TaskService = {
  getAll: (): Task[] => {
    return getFromStorage<Task>(STORAGE_KEYS.TASKS);
  },

  getById: (id: string): Task | undefined => {
    const tasks = getFromStorage<Task>(STORAGE_KEYS.TASKS);
    return tasks.find((t) => t.id === id);
  },

  getByStoryId: (storyId: string): Task[] => {
    const tasks = getFromStorage<Task>(STORAGE_KEYS.TASKS);
    return tasks.filter((t) => t.storyId === storyId).sort((a, b) => a.order - b.order);
  },

  create: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task => {
    const task: Task = {
      ...data,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    };

    const tasks = getFromStorage<Task>(STORAGE_KEYS.TASKS);
    tasks.push(task);
    saveToStorage(STORAGE_KEYS.TASKS, tasks);

    return task;
  },

  update: (id: string, data: Partial<Task>): Task | undefined => {
    const tasks = getFromStorage<Task>(STORAGE_KEYS.TASKS);
    const index = tasks.findIndex((t) => t.id === id);

    if (index === -1) return undefined;

    tasks[index] = {
      ...tasks[index],
      ...data,
      updatedAt: getCurrentTimestamp(),
    };

    saveToStorage(STORAGE_KEYS.TASKS, tasks);
    return tasks[index];
  },

  delete: (id: string): boolean => {
    const tasks = getFromStorage<Task>(STORAGE_KEYS.TASKS);
    const filtered = tasks.filter((t) => t.id !== id);

    if (filtered.length === tasks.length) return false;

    saveToStorage(STORAGE_KEYS.TASKS, filtered);
    return true;
  },
};

// ============================================================================
// Team Service
// ============================================================================

export const TeamService = {
  getTeam: (): Team | null => {
    const teams = getFromStorage<Team>(STORAGE_KEYS.TEAM);
    return teams[0] || null;
  },

  createTeam: (data: Omit<Team, 'id' | 'createdAt' | 'updatedAt' | 'averageVelocity'>): Team => {
    const team: Team = {
      ...data,
      id: generateId(),
      averageVelocity: 0,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    };

    saveToStorage(STORAGE_KEYS.TEAM, [team]);
    return team;
  },

  updateTeam: (data: Partial<Team>): Team | null => {
    const team = TeamService.getTeam();
    if (!team) return null;

    const updated = {
      ...team,
      ...data,
      updatedAt: getCurrentTimestamp(),
    };

    saveToStorage(STORAGE_KEYS.TEAM, [updated]);
    return updated;
  },

  getMembers: (): TeamMember[] => {
    return getFromStorage<TeamMember>(STORAGE_KEYS.TEAM_MEMBERS);
  },

  getMemberById: (id: string): TeamMember | undefined => {
    const members = getFromStorage<TeamMember>(STORAGE_KEYS.TEAM_MEMBERS);
    return members.find((m) => m.id === id);
  },

  addMember: (data: Omit<TeamMember, 'id' | 'joinedAt'>): TeamMember => {
    const member: TeamMember = {
      ...data,
      id: generateId(),
      joinedAt: getCurrentTimestamp(),
    };

    const members = getFromStorage<TeamMember>(STORAGE_KEYS.TEAM_MEMBERS);
    members.push(member);
    saveToStorage(STORAGE_KEYS.TEAM_MEMBERS, members);

    return member;
  },

  updateMember: (id: string, data: Partial<TeamMember>): TeamMember | undefined => {
    const members = getFromStorage<TeamMember>(STORAGE_KEYS.TEAM_MEMBERS);
    const index = members.findIndex((m) => m.id === id);

    if (index === -1) return undefined;

    members[index] = {
      ...members[index],
      ...data,
    };

    saveToStorage(STORAGE_KEYS.TEAM_MEMBERS, members);
    return members[index];
  },

  removeMember: (id: string): boolean => {
    const members = getFromStorage<TeamMember>(STORAGE_KEYS.TEAM_MEMBERS);
    const filtered = members.filter((m) => m.id !== id);

    if (filtered.length === members.length) return false;

    saveToStorage(STORAGE_KEYS.TEAM_MEMBERS, filtered);
    return true;
  },

  getTotalCapacity: (): number => {
    const members = TeamService.getMembers();
    return members.reduce((sum, m) => sum + (m.capacity * m.availability) / 100, 0);
  },
};

// ============================================================================
// Label Service
// ============================================================================

export const LabelService = {
  getAll: (): Label[] => {
    return getFromStorage<Label>(STORAGE_KEYS.LABELS);
  },

  create: (data: Omit<Label, 'id' | 'createdAt'>): Label => {
    const label: Label = {
      ...data,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
    };

    const labels = getFromStorage<Label>(STORAGE_KEYS.LABELS);
    labels.push(label);
    saveToStorage(STORAGE_KEYS.LABELS, labels);

    return label;
  },

  delete: (id: string): boolean => {
    const labels = getFromStorage<Label>(STORAGE_KEYS.LABELS);
    const filtered = labels.filter((l) => l.id !== id);

    if (filtered.length === labels.length) return false;

    saveToStorage(STORAGE_KEYS.LABELS, filtered);
    return true;
  },
};

// ============================================================================
// Settings Service
// ============================================================================

export const SettingsService = {
  get: (): ScrumSettings => {
    const settings = getFromStorage<ScrumSettings>(STORAGE_KEYS.SETTINGS);
    return settings[0] || getDefaultSettings();
  },

  update: (data: Partial<ScrumSettings>): ScrumSettings => {
    const current = SettingsService.get();
    const updated = { ...current, ...data };
    saveToStorage(STORAGE_KEYS.SETTINGS, [updated]);
    return updated;
  },
};

function getDefaultSettings(): ScrumSettings {
  return {
    defaultSprintDuration: 2,
    storyPointScale: [1, 2, 3, 5, 8, 13, 21],
    workingDays: [1, 2, 3, 4, 5], // Monday to Friday
    dailyCapacity: 6,
    defaultColumns: [
      { id: '1', name: 'To Do', status: 'todo', order: 1, color: '#3B82F6' },
      { id: '2', name: 'In Progress', status: 'in-progress', order: 2, color: '#F59E0B' },
      { id: '3', name: 'Review', status: 'review', order: 3, color: '#8B5CF6' },
      { id: '4', name: 'Testing', status: 'testing', order: 4, color: '#EC4899' },
      { id: '5', name: 'Done', status: 'done', order: 5, color: '#10B981' },
    ],
    notifications: {
      email: true,
      push: true,
      mentions: true,
      assignments: true,
    },
  };
}

// ============================================================================
// Metrics Service
// ============================================================================

export const MetricsService = {
  getSprintMetrics: (sprintId: string): SprintMetrics | null => {
    const sprint = SprintService.getById(sprintId);
    if (!sprint) return null;

    const stories = StoryService.getBySprintId(sprintId);

    const totalStoryPoints = stories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
    const completedStoryPoints = stories
      .filter((s) => s.status === 'done')
      .reduce((sum, s) => sum + (s.storyPoints || 0), 0);
    const remainingStoryPoints = totalStoryPoints - completedStoryPoints;

    const completionRate = totalStoryPoints > 0 ? (completedStoryPoints / totalStoryPoints) * 100 : 0;

    return {
      sprintId,
      totalStoryPoints,
      completedStoryPoints,
      remainingStoryPoints,
      addedStoryPoints: 0, // TODO: Track scope changes
      removedStoryPoints: 0,
      velocity: sprint.velocity,
      completionRate,
      scopeChange: 0,
      burndownData: MetricsService.calculateBurndown(sprint, stories),
      burnupData: MetricsService.calculateBurnup(sprint, stories),
      cumulativeFlowData: [],
      dailyProgress: [],
    };
  },

  calculateBurndown: (sprint: Sprint, stories: UserStory[]): BurndownPoint[] => {
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPoints = stories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);

    const points: BurndownPoint[] = [];
    for (let i = 0; i <= totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      const ideal = totalPoints - (totalPoints / totalDays) * i;

      // For now, use simple simulation - in real app, track actual daily progress
      const completedPoints = stories
        .filter((s) => s.status === 'done')
        .reduce((sum, s) => sum + (s.storyPoints || 0), 0);
      const actual = totalPoints - completedPoints;

      points.push({
        date: date.toISOString().split('T')[0],
        ideal: Math.max(0, ideal),
        actual: Math.max(0, actual),
      });
    }

    return points;
  },

  calculateBurnup: (sprint: Sprint, stories: UserStory[]): BurnupPoint[] => {
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPoints = stories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);

    const points: BurnupPoint[] = [];
    for (let i = 0; i <= totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      const completedPoints = stories
        .filter((s) => s.status === 'done')
        .reduce((sum, s) => sum + (s.storyPoints || 0), 0);

      points.push({
        date: date.toISOString().split('T')[0],
        completed: completedPoints,
        total: totalPoints,
      });
    }

    return points;
  },

  getVelocityData: (): VelocityData[] => {
    const sprints = SprintService.getAll()
      .filter((s) => s.status === 'completed')
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(-6); // Last 6 sprints

    return sprints.map((sprint) => ({
      sprintId: sprint.id,
      sprintName: sprint.name,
      planned: sprint.commitment,
      completed: sprint.velocity,
      date: sprint.endDate,
    }));
  },
};

// ============================================================================
// Retrospective Service
// ============================================================================

export const RetrospectiveService = {
  getAll: (): Retrospective[] => {
    return getFromStorage<Retrospective>(STORAGE_KEYS.RETROSPECTIVES);
  },

  getBySprintId: (sprintId: string): Retrospective | undefined => {
    const retrospectives = getFromStorage<Retrospective>(STORAGE_KEYS.RETROSPECTIVES);
    return retrospectives.find((r) => r.sprintId === sprintId);
  },

  create: (data: Omit<Retrospective, 'id' | 'createdAt'>): Retrospective => {
    const retrospective: Retrospective = {
      ...data,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
    };

    const retrospectives = getFromStorage<Retrospective>(STORAGE_KEYS.RETROSPECTIVES);
    retrospectives.push(retrospective);
    saveToStorage(STORAGE_KEYS.RETROSPECTIVES, retrospectives);

    return retrospective;
  },

  update: (id: string, data: Partial<Retrospective>): Retrospective | undefined => {
    const retrospectives = getFromStorage<Retrospective>(STORAGE_KEYS.RETROSPECTIVES);
    const index = retrospectives.findIndex((r) => r.id === id);

    if (index === -1) return undefined;

    retrospectives[index] = {
      ...retrospectives[index],
      ...data,
    };

    saveToStorage(STORAGE_KEYS.RETROSPECTIVES, retrospectives);
    return retrospectives[index];
  },

  delete: (id: string): boolean => {
    const retrospectives = getFromStorage<Retrospective>(STORAGE_KEYS.RETROSPECTIVES);
    const filtered = retrospectives.filter((r) => r.id !== id);

    if (filtered.length === retrospectives.length) return false;

    saveToStorage(STORAGE_KEYS.RETROSPECTIVES, filtered);
    return true;
  },
};

// ============================================================================
// Sprint Review Service
// ============================================================================

export const SprintReviewService = {
  getAll: (): SprintReview[] => {
    return getFromStorage<SprintReview>(STORAGE_KEYS.SPRINT_REVIEWS);
  },

  getBySprintId: (sprintId: string): SprintReview | undefined => {
    const reviews = getFromStorage<SprintReview>(STORAGE_KEYS.SPRINT_REVIEWS);
    return reviews.find((r) => r.sprintId === sprintId);
  },

  create: (data: Omit<SprintReview, 'id' | 'createdAt'>): SprintReview => {
    const review: SprintReview = {
      ...data,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
    };

    const reviews = getFromStorage<SprintReview>(STORAGE_KEYS.SPRINT_REVIEWS);
    reviews.push(review);
    saveToStorage(STORAGE_KEYS.SPRINT_REVIEWS, reviews);

    return review;
  },

  update: (id: string, data: Partial<SprintReview>): SprintReview | undefined => {
    const reviews = getFromStorage<SprintReview>(STORAGE_KEYS.SPRINT_REVIEWS);
    const index = reviews.findIndex((r) => r.id === id);

    if (index === -1) return undefined;

    reviews[index] = {
      ...reviews[index],
      ...data,
    };

    saveToStorage(STORAGE_KEYS.SPRINT_REVIEWS, reviews);
    return reviews[index];
  },

  delete: (id: string): boolean => {
    const reviews = getFromStorage<SprintReview>(STORAGE_KEYS.SPRINT_REVIEWS);
    const filtered = reviews.filter((r) => r.id !== id);

    if (filtered.length === reviews.length) return false;

    saveToStorage(STORAGE_KEYS.SPRINT_REVIEWS, filtered);
    return true;
  },
};

// ============================================================================
// Daily Standup Service
// ============================================================================

export const DailyStandupService = {
  getAll: (): DailyStandup[] => {
    return getFromStorage<DailyStandup>(STORAGE_KEYS.DAILY_STANDUPS);
  },

  getBySprintId: (sprintId: string): DailyStandup[] => {
    const standups = getFromStorage<DailyStandup>(STORAGE_KEYS.DAILY_STANDUPS);
    return standups.filter((s) => s.sprintId === sprintId).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },

  getByDate: (sprintId: string, date: string): DailyStandup | undefined => {
    const standups = getFromStorage<DailyStandup>(STORAGE_KEYS.DAILY_STANDUPS);
    return standups.find((s) => s.sprintId === sprintId && s.date === date);
  },

  create: (data: Omit<DailyStandup, 'id' | 'createdAt'>): DailyStandup => {
    const standup: DailyStandup = {
      ...data,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
    };

    const standups = getFromStorage<DailyStandup>(STORAGE_KEYS.DAILY_STANDUPS);
    standups.push(standup);
    saveToStorage(STORAGE_KEYS.DAILY_STANDUPS, standups);

    return standup;
  },

  update: (id: string, data: Partial<DailyStandup>): DailyStandup | undefined => {
    const standups = getFromStorage<DailyStandup>(STORAGE_KEYS.DAILY_STANDUPS);
    const index = standups.findIndex((s) => s.id === id);

    if (index === -1) return undefined;

    standups[index] = {
      ...standups[index],
      ...data,
    };

    saveToStorage(STORAGE_KEYS.DAILY_STANDUPS, standups);
    return standups[index];
  },

  delete: (id: string): boolean => {
    const standups = getFromStorage<DailyStandup>(STORAGE_KEYS.DAILY_STANDUPS);
    const filtered = standups.filter((s) => s.id !== id);

    if (filtered.length === standups.length) return false;

    saveToStorage(STORAGE_KEYS.DAILY_STANDUPS, filtered);
    return true;
  },
};

// ============================================================================
// Export all services
// ============================================================================

export const ScrumService = {
  Sprint: SprintService,
  Epic: EpicService,
  Story: StoryService,
  Task: TaskService,
  Team: TeamService,
  Label: LabelService,
  Settings: SettingsService,
  Metrics: MetricsService,
  Retrospective: RetrospectiveService,
  SprintReview: SprintReviewService,
  DailyStandup: DailyStandupService,
};

export default ScrumService;
