# Architecture Overview

Technical architecture and design decisions for ProjectHub.

## System Architecture

```
┌─────────────────────────────────────────────────┐
│              Browser (Client)                    │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │         React Components (View)          │  │
│  │  - Task cards, Modals, Forms, etc.      │  │
│  └──────────┬───────────────────────────────┘  │
│             │                                    │
│  ┌──────────▼───────────────────────────────┐  │
│  │      Service Layer (Business Logic)      │  │
│  │  - BoardService, TaskService, etc.       │  │
│  └──────────┬───────────────────────────────┘  │
│             │                                    │
│  ┌──────────▼───────────────────────────────┐  │
│  │     Storage Layer (Persistence)          │  │
│  │  - StorageService, LocalStorage API      │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │    Service Worker (Offline Support)      │  │
│  │  - Cache strategies, Background sync     │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
└─────────────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. View Layer (React Components)

**Purpose:** UI rendering and user interactions

**Responsibilities:**
- Render UI based on data
- Handle user events
- Manage component state
- Call service methods
- Display loading/error states

**Examples:**
- `TaskCard.tsx` - Display task information
- `TaskDetailModal.tsx` - Edit task details
- `BoardView.tsx` - Kanban board layout

**Rules:**
- No business logic
- No direct storage access
- Use services for data operations
- Keep components focused and small

### 2. Service Layer

**Purpose:** Business logic and data manipulation

**Responsibilities:**
- CRUD operations
- Business rules enforcement
- Data validation
- State coordination
- Activity logging

**Examples:**
- `BoardService` - Board management
- `TaskService` - Task operations
- `SubtaskService` - Subtask hierarchy
- `TimeTrackingService` - Timer logic

**Rules:**
- No React dependencies
- Pure TypeScript classes
- Static methods only
- Return typed data
- No side effects except storage

### 3. Storage Layer

**Purpose:** Data persistence abstraction

**Responsibilities:**
- Read/write localStorage
- Type-safe operations
- Default value handling
- Version management
- Error handling

**API:**
```typescript
StorageService.get<T>(key: string, defaultValue: T): T
StorageService.set<T>(key: string, value: T): boolean
StorageService.remove(key: string): void
StorageService.clear(): void
```

**Rules:**
- Single source of truth for storage
- Type-safe operations
- SSR-safe (checks for window)
- Handles quota exceeded

### 4. Service Worker

**Purpose:** Offline support and caching

**Responsibilities:**
- Cache static assets
- Intercept network requests
- Serve cached content offline
- Background sync (future)

**Strategy:**
- Cache-first for static assets
- Network-first for API calls
- Offline fallback page

## Data Flow

### Read Flow

```
Component
    │
    ├─→ useState() to store data
    │
    ├─→ useEffect() on mount
    │
    └─→ Service.get()
            │
            └─→ StorageService.get()
                    │
                    └─→ localStorage.getItem()
                            │
                            ▼
                    Parse JSON
                            │
                            ▼
                    Return data
                            │
                            ▼
            Process data
                            │
                            ▼
    Update state
                            │
                            ▼
    Re-render component
```

### Write Flow

```
Component
    │
    ├─→ User action (click, input)
    │
    ├─→ Event handler
    │
    └─→ Service.update()
            │
            ├─→ Validate input
            │
            ├─→ Apply business rules
            │
            ├─→ Transform data
            │
            └─→ StorageService.set()
                    │
                    └─→ JSON.stringify()
                            │
                            └─→ localStorage.setItem()
                                    │
                                    ▼
                            Success
                                    │
                                    ▼
            Return result
                            │
                            ▼
    Update state
                            │
                            ▼
    Re-render
```

## Technology Stack

### Frontend Framework
- **Next.js 15** - React framework with app router
- **React 19** - UI library with hooks
- **TypeScript 5** - Type safety

### Styling
- **Tailwind CSS 3** - Utility-first CSS
- **PostCSS** - CSS processing
- **CSS Modules** - Scoped styles (when needed)

### Data Persistence
- **LocalStorage API** - Browser storage
- **IndexedDB** - Future: large data sets
- **Service Worker** - Offline caching

### Build Tools
- **Next.js Compiler** - Fast builds
- **TypeScript Compiler** - Type checking
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Design Patterns

### 1. Service Pattern

Centralized business logic in static service classes:

```typescript
export class BoardService {
  static getAll(): Board[] { ... }
  static getById(id: string): Board | null { ... }
  static create(name: string): Board { ... }
  static update(id: string, updates: Partial<Board>): boolean { ... }
  static delete(id: string): boolean { ... }
}
```

**Benefits:**
- Separation of concerns
- Testable business logic
- Reusable across components
- No React dependencies

### 2. Repository Pattern

`StorageService` abstracts storage implementation:

```typescript
class StorageService {
  static get<T>(key: string, defaultValue: T): T { ... }
  static set<T>(key: string, value: T): boolean { ... }
}
```

**Benefits:**
- Easy to swap storage backend
- Consistent API
- Type safety
- Error handling

### 3. Compound Component Pattern

Complex components broken into sub-components:

```typescript
<TaskDetailModal>
  <TaskDetailModal.Header />
  <TaskDetailModal.Body>
    <SubtasksSection />
    <DependenciesSection />
    <CommentsSection />
  </TaskDetailModal.Body>
  <TaskDetailModal.Footer />
</TaskDetailModal>
```

**Benefits:**
- Composable UI
- Reusable parts
- Clear hierarchy
- Flexible layout

### 4. Custom Hooks Pattern

Reusable logic extracted to hooks:

```typescript
function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    return StorageService.get(key, defaultValue);
  });

  const updateValue = (newValue: T) => {
    setValue(newValue);
    StorageService.set(key, newValue);
  };

  return [value, updateValue] as const;
}
```

## Type System

### Core Types

Defined in `src/lib/types.ts`:

```typescript
// Domain entities
Board
BoardTask
Column
User
Tag

// Feature-specific
TimeLog
ActiveTimer
SavedSearch
SearchQuery
ActivityLog
Comment
RecurringTask

// Enums
Priority
ActivityType
ViewMode
```

### Type Hierarchy

```
Board
  ├─ id: string
  ├─ title: string
  ├─ columns: Column[]
  └─ tasks: BoardTask[]
        ├─ id: string
        ├─ text: string
        ├─ subtasks?: BoardTask[]
        ├─ dependencies?: string[]
        ├─ comments?: Comment[]
        ├─ timeLogs?: TimeLog[]
        └─ ...other fields
```

## Performance Considerations

### 1. Component Optimization

**Memoization:**
```typescript
const MemoizedTaskCard = React.memo(TaskCard);

const filteredTasks = useMemo(() => {
  return tasks.filter(matchesFilter);
}, [tasks, filter]);
```

**Lazy Loading:**
```typescript
const CommandPalette = dynamic(() => import('./CommandPalette'), {
  ssr: false
});
```

### 2. Data Optimization

**Batch Updates:**
```typescript
// Bad: Multiple storage writes
tasks.forEach(task => {
  BoardService.updateTask(boardId, task.id, updates);
});

// Good: Single storage write
const updatedTasks = tasks.map(task => ({ ...task, ...updates }));
BoardService.update(boardId, { tasks: updatedTasks });
```

**Pagination:**
```typescript
// For large lists
const ITEMS_PER_PAGE = 50;
const paginatedTasks = tasks.slice(
  page * ITEMS_PER_PAGE,
  (page + 1) * ITEMS_PER_PAGE
);
```

### 3. Storage Optimization

**Size Limits:**
- LocalStorage: ~5-10MB per origin
- Compress data if needed
- Archive old data
- Cleanup unused data

## Security

### Input Sanitization

All user input is validated:
```typescript
function sanitizeTaskText(text: string): string {
  return text.trim().substring(0, 500); // Limit length
}
```

### XSS Prevention

- React escapes by default
- Sanitize markdown output
- No `dangerouslySetInnerHTML` without sanitization

### Content Security Policy

Add CSP headers in `next.config.js`:
```javascript
{
  headers: [
    {
      key: 'Content-Security-Policy',
      value: "default-src 'self'; script-src 'self' 'unsafe-inline'"
    }
  ]
}
```

## Scalability

### Current Limits

- **Tasks per board:** ~500 (performance)
- **Boards:** ~50 (localStorage)
- **Total data:** ~5-10MB (browser limit)

### Future Improvements

1. **Backend API** - Move to server storage
2. **Database** - PostgreSQL or MongoDB
3. **Real-time Sync** - WebSocket connections
4. **File Uploads** - Cloud storage integration
5. **Search Index** - ElasticSearch for large datasets

## Deployment

### Build Process

```bash
npm run build
# Creates optimized production build in .next/
```

### Output Structure

```
.next/
├── static/           # Static assets
├── server/           # Server code
└── cache/           # Build cache
```

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_APP_NAME=ProjectHub
```

---

**Last Updated:** 2025-10-10
