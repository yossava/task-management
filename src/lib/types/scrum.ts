/**
 * Scrum Board TypeScript Type Definitions
 * Complete type system for enterprise-grade Scrum Agile sprint planning
 */

// ============================================================================
// Core Sprint Types
// ============================================================================

export interface Sprint {
  id: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  capacity: number; // Team capacity in story points
  commitment: number; // Committed story points
  velocity: number; // Actual completed story points
  teamId: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Epic Types
// ============================================================================

export interface Epic {
  id: string;
  title: string;
  description: string;
  color: string;
  status: 'planned' | 'in-progress' | 'completed';
  startDate?: string;
  targetDate?: string;
  progress: number; // 0-100
  owner: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// User Story Types
// ============================================================================

export interface UserStory {
  id: string;
  epicId?: string;
  sprintId?: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  storyPoints?: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'testing' | 'done';
  type: 'feature' | 'bug' | 'technical' | 'spike';
  assignees: string[];
  labels: string[];
  dependencies: string[]; // IDs of dependent stories
  blockedBy: string[]; // IDs of blocking issues
  estimation: Estimation;
  customFields: Record<string, any>;
  attachments: Attachment[];
  comments: Comment[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Task Types
// ============================================================================

export interface Task {
  id: string;
  storyId: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  assignee?: string;
  estimatedHours?: number;
  actualHours?: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Estimation Types
// ============================================================================

export interface Estimation {
  method: 'planning-poker' | 't-shirt' | 'fibonacci' | 'hours';
  value?: number;
  size?: 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';
  votes?: EstimationVote[];
  finalizedAt?: string;
  finalizedBy?: string;
}

export interface EstimationVote {
  userId: string;
  userName: string;
  value: number | string;
  votedAt: string;
}

export interface PlanningPokerSession {
  id: string;
  storyId: string;
  status: 'voting' | 'revealed' | 'finalized';
  votes: EstimationVote[];
  consensus?: number;
  createdAt: string;
  finalizedAt?: string;
}

// ============================================================================
// Team Types
// ============================================================================

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'product-owner' | 'scrum-master' | 'developer' | 'tester';
  capacity: number; // Story points per sprint
  availability: number; // Percentage (0-100)
  skills: string[];
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  averageVelocity: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Metrics Types
// ============================================================================

export interface SprintMetrics {
  sprintId: string;
  totalStoryPoints: number;
  completedStoryPoints: number;
  remainingStoryPoints: number;
  addedStoryPoints: number;
  removedStoryPoints: number;
  velocity: number;
  completionRate: number;
  scopeChange: number;
  burndownData: BurndownPoint[];
  burnupData: BurnupPoint[];
  cumulativeFlowData: CFDPoint[];
  dailyProgress: DailyProgress[];
}

export interface BurndownPoint {
  date: string;
  ideal: number;
  actual: number;
  scopeChange?: number;
}

export interface BurnupPoint {
  date: string;
  completed: number;
  total: number;
}

export interface CFDPoint {
  date: string;
  backlog: number;
  todo: number;
  inProgress: number;
  review: number;
  testing: number;
  done: number;
}

export interface DailyProgress {
  date: string;
  storiesCompleted: number;
  pointsCompleted: number;
  storiesAdded: number;
  pointsAdded: number;
  storiesRemoved: number;
  pointsRemoved: number;
}

export interface VelocityData {
  sprintId: string;
  sprintName: string;
  planned: number;
  completed: number;
  date: string;
}

export interface CycleTimeData {
  storyId: string;
  title: string;
  startDate: string;
  endDate: string;
  cycleTime: number; // in days
  status: string;
}

export interface LeadTimeData {
  storyId: string;
  title: string;
  createdDate: string;
  completedDate: string;
  leadTime: number; // in days
}

// ============================================================================
// Ceremony Types
// ============================================================================

export interface DailyStandup {
  id: string;
  sprintId: string;
  date: string;
  attendees: string[];
  updates: StandupUpdate[];
  blockers: Blocker[];
  duration: number; // in minutes
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface StandupUpdate {
  memberId: string;
  yesterday: string;
  today: string;
  blockers?: string;
}

export interface Blocker {
  id: string;
  description: string;
  affectedMember: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

export interface SprintReview {
  id: string;
  sprintId: string;
  date: string;
  attendees: string[];
  demonstratedStories: string[];
  stakeholderFeedback: Feedback[];
  acceptedStories: string[];
  rejectedStories: string[];
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  stakeholder: string;
  comment: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  createdAt: string;
}

export interface Retrospective {
  id: string;
  sprintId: string;
  date: string;
  attendees: string[];
  template: 'start-stop-continue' | 'mad-sad-glad' | '4ls' | 'custom';
  wentWell: RetroItem[];
  toImprove: RetroItem[];
  actionItems: ActionItem[];
  mood: 'excellent' | 'good' | 'neutral' | 'poor';
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface RetroItem {
  id: string;
  content: string;
  votes: number;
  votedBy: string[];
  category?: string;
  createdBy: string;
}

export interface ActionItem {
  id: string;
  description: string;
  assignee: string;
  dueDate?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  completedAt?: string;
}

// ============================================================================
// Board Configuration Types
// ============================================================================

export interface BoardColumn {
  id: string;
  name: string;
  wipLimit?: number;
  order: number;
  color: string;
  status: UserStory['status'];
}

export interface BoardView {
  id: string;
  name: string;
  type: 'board' | 'list' | 'timeline' | 'calendar';
  isDefault: boolean;
  filters: FilterConfig;
  groupBy?: 'assignee' | 'epic' | 'priority' | 'status' | 'none';
  sortBy?: 'priority' | 'points' | 'created' | 'updated';
  sortOrder?: 'asc' | 'desc';
  columns?: BoardColumn[];
  createdAt: string;
  updatedAt: string;
}

export interface FilterConfig {
  assignees?: string[];
  labels?: string[];
  epics?: string[];
  priorities?: ('critical' | 'high' | 'medium' | 'low')[];
  statuses?: UserStory['status'][];
  types?: UserStory['type'][];
  search?: string;
  storyPoints?: {
    min?: number;
    max?: number;
  };
  dateRange?: {
    start?: string;
    end?: string;
  };
}

// ============================================================================
// Attachment & Comment Types
// ============================================================================

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  mentions: string[];
  createdAt: string;
  updatedAt?: string;
  replies?: Comment[];
}

// ============================================================================
// Release Planning Types
// ============================================================================

export interface Release {
  id: string;
  name: string;
  version: string;
  description: string;
  startDate: string;
  targetDate: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  sprints: string[];
  epics: string[];
  goals: string[];
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
}

export interface Roadmap {
  id: string;
  name: string;
  description: string;
  releases: Release[];
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  date: string;
  status: 'upcoming' | 'in-progress' | 'completed';
  dependencies: string[];
  createdAt: string;
}

// ============================================================================
// Story Mapping Types
// ============================================================================

export interface StoryMap {
  id: string;
  name: string;
  userJourneys: UserJourney[];
  releases: StoryMapRelease[];
  createdAt: string;
  updatedAt: string;
}

export interface UserJourney {
  id: string;
  name: string;
  description: string;
  order: number;
  activities: Activity[];
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  order: number;
  stories: string[]; // Story IDs
}

export interface StoryMapRelease {
  id: string;
  name: string;
  order: number;
  stories: string[];
}

// ============================================================================
// Automation & Custom Fields
// ============================================================================

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  createdAt: string;
  updatedAt: string;
}

export interface AutomationTrigger {
  type: 'status-change' | 'assignment' | 'comment-added' | 'due-date' | 'manual';
  value?: any;
}

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'not-equals' | 'contains' | 'greater-than' | 'less-than';
  value: any;
}

export interface AutomationAction {
  type: 'change-status' | 'assign' | 'add-label' | 'send-notification' | 'create-task';
  value: any;
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multi-select' | 'checkbox';
  required: boolean;
  options?: string[];
  defaultValue?: any;
  createdAt: string;
}

// ============================================================================
// Activity & Notification Types
// ============================================================================

export interface Activity {
  id: string;
  type: 'story-created' | 'story-updated' | 'story-moved' | 'comment-added' | 'assignment-changed' | 'sprint-started' | 'sprint-completed';
  entityType: 'story' | 'sprint' | 'epic' | 'comment';
  entityId: string;
  actor: string;
  action: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'mention' | 'assignment' | 'comment' | 'due-date' | 'sprint-event';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
  readAt?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface Label {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: string;
}

export interface StoryTemplate {
  id: string;
  name: string;
  description: string;
  type: UserStory['type'];
  defaultFields: Partial<UserStory>;
  createdAt: string;
}

export interface ScrumSettings {
  defaultSprintDuration: number; // in weeks
  storyPointScale: number[]; // e.g., [1, 2, 3, 5, 8, 13, 21]
  workingDays: number[]; // 0-6, Sunday to Saturday
  dailyCapacity: number; // hours per day
  defaultColumns: BoardColumn[];
  notifications: {
    email: boolean;
    push: boolean;
    mentions: boolean;
    assignments: boolean;
  };
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// Export Helper Types
// ============================================================================

export type StoryStatus = UserStory['status'];
export type StoryPriority = UserStory['priority'];
export type StoryType = UserStory['type'];
export type SprintStatus = Sprint['status'];
export type EstimationMethod = Estimation['method'];
export type TeamRole = TeamMember['role'];
export type RetroTemplate = Retrospective['template'];
