# Developer Guide

Complete guide for developers working on ProjectHub.

## Table of Contents

1. [Development Setup](#development-setup)
2. [Project Structure](#project-structure)
3. [Core Concepts](#core-concepts)
4. [Services Architecture](#services-architecture)
5. [Component Development](#component-development)
6. [State Management](#state-management)
7. [Styling Guidelines](#styling-guidelines)
8. [Testing](#testing)
9. [Building & Deployment](#building--deployment)
10. [Best Practices](#best-practices)

---

## Development Setup

### Prerequisites

- Node.js 18.x or later
- npm 9.x or later
- Git
- Code editor (VS Code recommended)

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd showcase-1

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the app.

### Development Scripts

```bash
# Development server with hot reload
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code
npm run format
```

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

---

## Project Structure

```
showcase-1/
├── docs/                    # Documentation
│   ├── USER_MANUAL.md      # User manual
│   └── wiki/               # Wiki pages
├── public/                  # Static assets
│   ├── manifest.json       # PWA manifest
│   ├── sw.js              # Service worker
│   └── offline.html       # Offline page
├── src/
│   ├── app/                # Next.js app router
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Dashboard page
│   │   ├── boards/        # Boards routes
│   │   └── globals.css    # Global styles
│   ├── components/         # React components
│   │   ├── layout/        # Layout components
│   │   ├── task/          # Task components
│   │   ├── board/         # Board components
│   │   └── command/       # Command palette
│   └── lib/               # Core library
│       ├── types.ts       # TypeScript types
│       ├── constants.ts   # App constants
│       ├── storage.ts     # Storage service
│       └── services/      # Business logic services
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

### Key Directories

**`src/app/`** - Next.js 15 app router
- File-based routing
- Server and client components
- Layout hierarchy

**`src/components/`** - Reusable React components
- Organized by feature
- Client components by default
- Typed props with TypeScript

**`src/lib/services/`** - Business logic layer
- Static service classes
- No React dependencies
- Pure TypeScript

**`src/lib/`** - Core utilities
- Type definitions
- Storage abstraction
- Constants and helpers

---

## Core Concepts

### Data Flow

```
Component → Service → Storage → LocalStorage
                ↓
            State Update
                ↓
            Re-render
```

### Service Layer Pattern

Services handle all business logic:
- No React hooks or state
- Pure functions with inputs/outputs
- Isolated, testable units

Example:
```typescript
export class TaskService {
  static create(boardId: string, taskData: CreateTaskInput): BoardTask {
    // Business logic here
    const board = BoardService.getById(boardId);
    // ... create task
    return newTask;
  }
}
```

### Storage Abstraction

`StorageService` wraps `localStorage`:
- Type-safe get/set operations
- Default value handling
- Server-side rendering safety
- Version management

```typescript
// Reading data
const boards = StorageService.get<Board[]>(STORAGE_KEYS.BOARDS, []);

// Writing data
StorageService.set(STORAGE_KEYS.BOARDS, updatedBoards);
```

### Type Safety

Everything is typed with TypeScript:
- Interfaces for all data structures
- Typed service methods
- Typed component props
- No `any` types

---

## Services Architecture

### Available Services

#### BoardService
Manages boards and tasks.

```typescript
import { BoardService } from '@/lib/services/boardService';

// CRUD operations
BoardService.create(name: string): Board
BoardService.getAll(): Board[]
BoardService.getById(id: string): Board | null
BoardService.update(id: string, updates: Partial<Board>): boolean
BoardService.delete(id: string): boolean

// Task operations
BoardService.addTask(boardId: string, task: BoardTask): boolean
BoardService.updateTask(boardId: string, taskId: string, updates): boolean
BoardService.deleteTask(boardId: string, taskId: string): boolean
```

#### SubtaskService
Manages nested subtasks.

```typescript
import { SubtaskService } from '@/lib/services/subtaskService';

SubtaskService.addSubtask(boardId, parentTaskId, subtaskData): BoardTask
SubtaskService.updateSubtask(boardId, parentTaskId, subtaskId, updates): boolean
SubtaskService.deleteSubtask(boardId, parentTaskId, subtaskId): boolean
SubtaskService.promoteToTask(boardId, parentTaskId, subtaskId): BoardTask
SubtaskService.calculateProgressFromSubtasks(task): number
```

#### TimeTrackingService
Handles time tracking and estimates.

```typescript
import { TimeTrackingService } from '@/lib/services/timeTrackingService';

TimeTrackingService.startTimer(boardId, taskId, userId?): ActiveTimer
TimeTrackingService.stopTimer(boardId, taskId, note?): TimeLog
TimeTrackingService.getActiveTimers(): ActiveTimer[]
TimeTrackingService.setEstimatedTime(boardId, taskId, minutes): boolean
TimeTrackingService.getStatistics(boardId): Stats
```

#### UserService
Manages users and assignments.

```typescript
import { UserService } from '@/lib/services/userService';

UserService.getAll(): User[]
UserService.getById(id: string): User | null
UserService.getCurrentUser(): User
UserService.create(userData): User
UserService.search(query: string): User[]
```

#### AdvancedSearchService
Complex search and filtering.

```typescript
import { AdvancedSearchService } from '@/lib/services/advancedSearchService';

AdvancedSearchService.search(query: SearchQuery): SearchResult[]
AdvancedSearchService.saveSearch(name, query): SavedSearch
AdvancedSearchService.getSavedSearches(): SavedSearch[]
AdvancedSearchService.getSearchHistory(): SearchHistory[]
```

#### ActivityService
Logs user actions and changes.

```typescript
import { ActivityService } from '@/lib/services/activityService';

ActivityService.log(
  type: ActivityType,
  boardId: string,
  boardTitle: string,
  options?: ActivityOptions
): ActivityLog

ActivityService.getAll(): ActivityLog[]
ActivityService.getByBoard(boardId): ActivityLog[]
ActivityService.getRecent(limit): ActivityLog[]
```

### Creating a New Service

1. Create file in `src/lib/services/`
2. Define service class with static methods
3. Import required types
4. Implement business logic
5. Add to exports

Example template:
```typescript
// src/lib/services/myService.ts
import { MyType } from '@/lib/types';
import { StorageService } from '@/lib/storage';

const STORAGE_KEY = 'my_data';

export class MyService {
  static getAll(): MyType[] {
    return StorageService.get<MyType[]>(STORAGE_KEY, []);
  }

  static create(data: Omit<MyType, 'id'>): MyType {
    const items = this.getAll();
    const newItem: MyType = {
      ...data,
      id: `item-${Date.now()}`,
    };
    items.push(newItem);
    StorageService.set(STORAGE_KEY, items);
    return newItem;
  }
}
```

---

## Component Development

### Component Structure

```typescript
'use client'; // If using hooks or browser APIs

import React, { useState } from 'react';

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export default function MyComponent({ title, onAction }: MyComponentProps) {
  const [state, setState] = useState<string>('');

  const handleClick = () => {
    // Logic here
    onAction?.();
  };

  return (
    <div className="container">
      <h2>{title}</h2>
      <button onClick={handleClick}>Action</button>
    </div>
  );
}
```

### Component Guidelines

**1. Props Interface**
Always define typed props:
```typescript
interface TaskCardProps {
  task: BoardTask;
  boardId: string;
  onUpdate: () => void;
}
```

**2. Client vs Server Components**
- Use `'use client'` for interactive components
- Server components for static content
- Default to server components when possible

**3. Event Handlers**
Prefix with `handle`:
```typescript
const handleSubmit = () => { ... };
const handleDelete = () => { ... };
const handleChange = (e) => { ... };
```

**4. State Management**
Use React hooks for local state:
```typescript
const [isOpen, setIsOpen] = useState(false);
const [data, setData] = useState<Data[]>([]);
```

**5. Effects**
Use `useEffect` for side effects:
```typescript
useEffect(() => {
  // Effect logic
  return () => {
    // Cleanup
  };
}, [dependencies]);
```

### Common Patterns

**Modal Components:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
```

**List Components:**
```typescript
interface ItemListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  emptyMessage?: string;
}

export default function ItemList<T extends { id: string }>({
  items,
  renderItem,
  emptyMessage = 'No items'
}: ItemListProps<T>) {
  if (items.length === 0) {
    return <div className="empty">{emptyMessage}</div>;
  }

  return (
    <div className="item-list">
      {items.map((item) => (
        <div key={item.id}>{renderItem(item)}</div>
      ))}
    </div>
  );
}
```

---

## State Management

### Local State with useState

For component-local state:
```typescript
const [count, setCount] = useState(0);
const [text, setText] = useState('');
const [data, setData] = useState<Data | null>(null);
```

### Derived State with useMemo

For computed values:
```typescript
const filteredTasks = useMemo(() => {
  return tasks.filter(task => task.completed);
}, [tasks]);
```

### Side Effects with useEffect

For data fetching, subscriptions:
```typescript
useEffect(() => {
  const boards = BoardService.getAll();
  setBoards(boards);
}, []); // Empty deps = run once
```

### Refs with useRef

For DOM references:
```typescript
const inputRef = useRef<HTMLInputElement>(null);

const focusInput = () => {
  inputRef.current?.focus();
};

return <input ref={inputRef} />;
```

### Global State Pattern

For app-wide state, use prop drilling or create a context:

```typescript
// context/AppContext.tsx
import { createContext, useContext, useState } from 'react';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState<User>(UserService.getCurrentUser());

  return (
    <AppContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
```

---

## Styling Guidelines

### Tailwind CSS Classes

Use utility classes:
```tsx
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md">
  <h2 className="text-2xl font-bold text-gray-900">Title</h2>
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Click
  </button>
</div>
```

### Responsive Design

Use responsive prefixes:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

### Dark Mode Support

Use dark mode variants:
```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content
</div>
```

### Custom Classes

Define in `globals.css` when needed:
```css
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition;
  }
}
```

---

## Testing

### Type Checking

```bash
npm run type-check
```

Ensures all TypeScript types are correct.

### Manual Testing Checklist

- [ ] Create board
- [ ] Add tasks
- [ ] Edit tasks
- [ ] Delete tasks
- [ ] Drag and drop
- [ ] Add subtasks
- [ ] Track time
- [ ] Search tasks
- [ ] Use command palette
- [ ] Test offline mode

---

## Building & Deployment

### Production Build

```bash
# Build for production
npm run build

# Test production build locally
npm start
```

### Deployment Options

**Vercel (Recommended):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Static Export:**
```bash
# Add to next.config.js
output: 'export'

# Build
npm run build

# Deploy /out directory to any static host
```

**Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Best Practices

### Code Style

1. **Use TypeScript** - No `any` types
2. **Functional Components** - Use hooks, not classes
3. **Destructure Props** - `function Component({ prop1, prop2 })`
4. **Named Exports** - For utilities and services
5. **Default Exports** - For components

### Performance

1. **useMemo** - For expensive computations
2. **useCallback** - For callback stability
3. **Lazy Loading** - Use `dynamic()` for large components
4. **Image Optimization** - Use Next.js `<Image>`

### Accessibility

1. **Semantic HTML** - Use proper tags
2. **ARIA Labels** - Add for screen readers
3. **Keyboard Navigation** - Support tab, enter, escape
4. **Focus Management** - Trap focus in modals

### Security

1. **No XSS** - Sanitize user input
2. **No eval()** - Never use eval
3. **Content Security Policy** - Add CSP headers
4. **Validate Data** - Check all inputs

### Git Workflow

1. **Feature Branches** - `feature/task-comments`
2. **Descriptive Commits** - `feat: add task comments`
3. **Small Commits** - One logical change per commit
4. **Pull Requests** - Review before merging

---

**Last Updated:** 2025-10-10
