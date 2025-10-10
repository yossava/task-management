import { BoardTemplate, Board, BoardTask, Tag } from '@/lib/types';
import { StorageService, STORAGE_KEYS } from '@/lib/storage';
import { BoardService } from './boardService';

// Pre-built templates
const BUILT_IN_TEMPLATES: BoardTemplate[] = [
  {
    id: 'sprint-planning',
    name: 'Sprint Planning',
    description: 'Agile sprint planning board with backlog, in progress, review, and done columns',
    category: 'development',
    icon: '🚀',
    color: '#3b82f6',
    tags: [
      { id: 'bug', name: 'Bug', color: '#ef4444' },
      { id: 'feature', name: 'Feature', color: '#10b981' },
      { id: 'enhancement', name: 'Enhancement', color: '#f59e0b' },
    ],
    sampleTasks: [
      { text: 'Define sprint goals', completed: false, priority: 'high' },
      { text: 'Review user stories', completed: false, priority: 'medium' },
      { text: 'Estimate story points', completed: false, priority: 'medium' },
      { text: 'Assign tasks to team members', completed: false, priority: 'low' },
    ],
    isCustom: false,
    createdAt: Date.now(),
  },
  {
    id: 'product-roadmap',
    name: 'Product Roadmap',
    description: 'Strategic product planning with quarterly milestones and feature releases',
    category: 'business',
    icon: '🗺️',
    color: '#8b5cf6',
    tags: [
      { id: 'q1', name: 'Q1', color: '#06b6d4' },
      { id: 'q2', name: 'Q2', color: '#10b981' },
      { id: 'q3', name: 'Q3', color: '#f59e0b' },
      { id: 'q4', name: 'Q4', color: '#ef4444' },
    ],
    sampleTasks: [
      { text: 'Launch mobile app', completed: false, priority: 'urgent', tags: ['q1'] },
      { text: 'Implement AI features', completed: false, priority: 'high', tags: ['q2'] },
      { text: 'Expand to new markets', completed: false, priority: 'medium', tags: ['q3'] },
    ],
    isCustom: false,
    createdAt: Date.now(),
  },
  {
    id: 'content-calendar',
    name: 'Content Calendar',
    description: 'Plan and track content creation, review, and publication schedules',
    category: 'marketing',
    icon: '📅',
    color: '#ec4899',
    tags: [
      { id: 'blog', name: 'Blog', color: '#6366f1' },
      { id: 'social', name: 'Social Media', color: '#ec4899' },
      { id: 'video', name: 'Video', color: '#f43f5e' },
      { id: 'newsletter', name: 'Newsletter', color: '#8b5cf6' },
    ],
    sampleTasks: [
      { text: 'Write blog post about new features', completed: false, priority: 'high', tags: ['blog'] },
      { text: 'Create Instagram carousel', completed: false, priority: 'medium', tags: ['social'] },
      { text: 'Record tutorial video', completed: false, priority: 'medium', tags: ['video'] },
    ],
    isCustom: false,
    createdAt: Date.now(),
  },
  {
    id: 'bug-tracker',
    name: 'Bug Tracker',
    description: 'Track and prioritize bugs with severity levels and resolution workflow',
    category: 'development',
    icon: '🐛',
    color: '#ef4444',
    tags: [
      { id: 'critical', name: 'Critical', color: '#dc2626' },
      { id: 'major', name: 'Major', color: '#f59e0b' },
      { id: 'minor', name: 'Minor', color: '#eab308' },
      { id: 'trivial', name: 'Trivial', color: '#84cc16' },
    ],
    sampleTasks: [
      { text: 'Fix login authentication error', completed: false, priority: 'urgent', tags: ['critical'] },
      { text: 'Resolve data sync issue', completed: false, priority: 'high', tags: ['major'] },
      { text: 'Update deprecated API calls', completed: false, priority: 'medium', tags: ['minor'] },
    ],
    isCustom: false,
    createdAt: Date.now(),
  },
  {
    id: 'weekly-goals',
    name: 'Weekly Goals',
    description: 'Personal productivity board for tracking weekly objectives and habits',
    category: 'personal',
    icon: '🎯',
    color: '#10b981',
    tags: [
      { id: 'health', name: 'Health', color: '#10b981' },
      { id: 'work', name: 'Work', color: '#3b82f6' },
      { id: 'learning', name: 'Learning', color: '#8b5cf6' },
      { id: 'personal', name: 'Personal', color: '#f59e0b' },
    ],
    sampleTasks: [
      { text: 'Exercise 3 times this week', completed: false, priority: 'high', tags: ['health'] },
      { text: 'Complete project proposal', completed: false, priority: 'high', tags: ['work'] },
      { text: 'Read 2 chapters of technical book', completed: false, priority: 'medium', tags: ['learning'] },
    ],
    isCustom: false,
    createdAt: Date.now(),
  },
  {
    id: 'daily-standup',
    name: 'Daily Standup',
    description: 'Track daily progress, blockers, and team commitments',
    category: 'productivity',
    icon: '☀️',
    color: '#f59e0b',
    tags: [
      { id: 'done', name: 'Done', color: '#10b981' },
      { id: 'doing', name: 'Doing', color: '#3b82f6' },
      { id: 'blocked', name: 'Blocked', color: '#ef4444' },
    ],
    sampleTasks: [
      { text: 'Review pull requests', completed: false, priority: 'high', tags: ['doing'] },
      { text: 'Finish API documentation', completed: false, priority: 'medium', tags: ['doing'] },
      { text: 'Deploy to staging', completed: false, priority: 'low', tags: ['doing'] },
    ],
    isCustom: false,
    createdAt: Date.now(),
  },
  {
    id: 'event-planning',
    name: 'Event Planning',
    description: 'Organize events with venue, catering, marketing, and logistics tracking',
    category: 'business',
    icon: '🎉',
    color: '#a855f7',
    tags: [
      { id: 'venue', name: 'Venue', color: '#8b5cf6' },
      { id: 'catering', name: 'Catering', color: '#ec4899' },
      { id: 'marketing', name: 'Marketing', color: '#3b82f6' },
      { id: 'logistics', name: 'Logistics', color: '#f59e0b' },
    ],
    sampleTasks: [
      { text: 'Book conference venue', completed: false, priority: 'urgent', tags: ['venue'] },
      { text: 'Order catering for 100 people', completed: false, priority: 'high', tags: ['catering'] },
      { text: 'Create event landing page', completed: false, priority: 'high', tags: ['marketing'] },
    ],
    isCustom: false,
    createdAt: Date.now(),
  },
  {
    id: 'onboarding',
    name: 'Employee Onboarding',
    description: 'New employee onboarding checklist with training and setup tasks',
    category: 'business',
    icon: '👋',
    color: '#06b6d4',
    tags: [
      { id: 'hr', name: 'HR', color: '#ec4899' },
      { id: 'it', name: 'IT Setup', color: '#3b82f6' },
      { id: 'training', name: 'Training', color: '#8b5cf6' },
    ],
    sampleTasks: [
      { text: 'Complete HR paperwork', completed: false, priority: 'urgent', tags: ['hr'] },
      { text: 'Set up workstation and accounts', completed: false, priority: 'high', tags: ['it'] },
      { text: 'Schedule onboarding sessions', completed: false, priority: 'high', tags: ['training'] },
      { text: 'Assign mentor', completed: false, priority: 'medium', tags: ['hr'] },
    ],
    isCustom: false,
    createdAt: Date.now(),
  },
];

export class TemplateService {
  static getAllTemplates(): BoardTemplate[] {
    const customTemplates = StorageService.get<BoardTemplate[]>(STORAGE_KEYS.TEMPLATES, []);
    return [...BUILT_IN_TEMPLATES, ...customTemplates];
  }

  static getTemplateById(id: string): BoardTemplate | undefined {
    return this.getAllTemplates().find(t => t.id === id);
  }

  static getTemplatesByCategory(category: string): BoardTemplate[] {
    return this.getAllTemplates().filter(t => t.category === category);
  }

  static createBoardFromTemplate(template: BoardTemplate, customTitle?: string): Board {
    // Create tags with proper IDs and timestamps
    const tags: Tag[] = (template.tags || []).map(tag => ({
      ...tag,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    }));

    // Create tag ID mapping for tasks
    const tagIdMap = new Map<string, string>();
    template.tags?.forEach((oldTag, index) => {
      tagIdMap.set(oldTag.id, tags[index].id);
    });

    // Create tasks with proper IDs and timestamps, and remap tag IDs
    const tasks: BoardTask[] = (template.sampleTasks || []).map(task => ({
      ...task,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      tags: task.tags?.map(oldTagId => tagIdMap.get(oldTagId) || oldTagId),
    }));

    // Create the board
    const board = BoardService.create({
      title: customTitle || template.name,
      description: template.description,
      color: template.color,
    });

    // Update with tags and tasks
    BoardService.update(board.id, { tags, tasks });

    return BoardService.getById(board.id)!;
  }

  static saveAsTemplate(
    board: Board,
    name: string,
    description: string,
    category: BoardTemplate['category']
  ): BoardTemplate {
    const customTemplates = StorageService.get<BoardTemplate[]>(STORAGE_KEYS.TEMPLATES, []);

    // Strip IDs and timestamps from tags and tasks for template
    const templateTags = (board.tags || []).map(({ createdAt, ...tag }) => tag);
    const templateTasks = board.tasks.map(({ id, createdAt, ...task }) => task);

    const newTemplate: BoardTemplate = {
      id: crypto.randomUUID(),
      name,
      description,
      category,
      icon: board.color ? '🎨' : '📋',
      color: board.color || '#3b82f6',
      tags: templateTags,
      sampleTasks: templateTasks,
      isCustom: true,
      createdAt: Date.now(),
    };

    customTemplates.push(newTemplate);
    StorageService.set(STORAGE_KEYS.TEMPLATES, customTemplates);

    return newTemplate;
  }

  static deleteTemplate(id: string): boolean {
    const customTemplates = StorageService.get<BoardTemplate[]>(STORAGE_KEYS.TEMPLATES, []);
    const filtered = customTemplates.filter(t => t.id !== id);

    if (filtered.length === customTemplates.length) return false;

    StorageService.set(STORAGE_KEYS.TEMPLATES, filtered);
    return true;
  }
}
