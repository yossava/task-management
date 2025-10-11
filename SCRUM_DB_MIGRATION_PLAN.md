# Scrum Database Migration Plan

## ✅ Completed (Phase 1: Database Schema)

### 1. Prisma Schema Created
All scrum entities added to `prisma/schema.prisma`:
- ✅ Sprint - Sprint management with status tracking
- ✅ Epic - Large feature grouping
- ✅ UserStory - User stories with story points
- ✅ ScrumTask - Tasks within stories
- ✅ TeamMember - Team member profiles
- ✅ Retrospective - Sprint retrospectives
- ✅ DailyStandup - Daily standup records
- ✅ SprintReview - Sprint review meetings
- ✅ ScrumSettings - User/guest scrum configuration

### 2. Database Migration
- ✅ Successfully created 9 new MongoDB collections
- ✅ Created 28 indexes for optimal query performance
- ✅ All user/guest isolation implemented with userId/guestId fields

### 3. Initial API Routes
- ✅ `/api/scrum/sprints` - Sprint GET/POST endpoints

## 🚧 Remaining Work (Phase 2-4)

### Phase 2: Complete API Routes

Need to create the following API endpoints:

#### `/api/scrum/sprints/[id]/route.ts`
- GET - Get sprint by ID
- PATCH - Update sprint
- DELETE - Delete sprint

#### `/api/scrum/epics/route.ts`
- GET - List all epics
- POST - Create epic

#### `/api/scrum/epics/[id]/route.ts`
- GET - Get epic by ID
- PATCH - Update epic
- DELETE - Delete epic

#### `/api/scrum/stories/route.ts`
- GET - List all user stories (with filters: sprintId, epicId, status)
- POST - Create user story

#### `/api/scrum/stories/[id]/route.ts`
- GET - Get story by ID
- PATCH - Update story
- DELETE - Delete story

#### `/api/scrum/tasks/route.ts`
- GET - List all scrum tasks (filter by storyId)
- POST - Create scrum task

#### `/api/scrum/tasks/[id]/route.ts`
- GET - Get task by ID
- PATCH - Update task
- DELETE - Delete task

#### `/api/scrum/team/route.ts`
- GET - List team members
- POST - Add team member

#### `/api/scrum/team/[id]/route.ts`
- GET - Get team member
- PATCH - Update team member
- DELETE - Remove team member

#### `/api/scrum/retrospectives/route.ts`
- GET - List retrospectives (filter by sprintId)
- POST - Create retrospective

#### `/api/scrum/retrospectives/[id]/route.ts`
- GET - Get retrospective
- PATCH - Update retrospective
- DELETE - Delete retrospective

#### `/api/scrum/standups/route.ts`
- GET - List standups (filter by sprintId, date)
- POST - Create standup

#### `/api/scrum/standups/[id]/route.ts`
- GET - Get standup
- PATCH - Update standup
- DELETE - Delete standup

#### `/api/scrum/reviews/route.ts`
- GET - List sprint reviews (filter by sprintId)
- POST - Create sprint review

#### `/api/scrum/reviews/[id]/route.ts`
- GET - Get sprint review
- PATCH - Update sprint review
- DELETE - Delete sprint review

#### `/api/scrum/settings/route.ts`
- GET - Get scrum settings
- PUT - Update scrum settings

### Phase 3: React Query Hooks

Create optimized hooks in `src/hooks/scrum/`:

- `useSprintsOptimized.ts` - Sprint operations
- `useEpicsOptimized.ts` - Epic operations
- `useStoriesOptimized.ts` - User story operations
- `useScrumTasksOptimized.ts` - Scrum task operations
- `useTeamOptimized.ts` - Team member operations
- `useRetrospectivesOptimized.ts` - Retrospective operations
- `useStandupsOptimized.ts` - Standup operations
- `useReviewsOptimized.ts` - Sprint review operations
- `useScrumSettingsOptimized.ts` - Settings operations

Each hook should include:
- React Query integration
- Optimistic updates
- Toast notifications
- Error handling with rollback
- Loading states

### Phase 4: Component Updates

Update all scrum components to use new hooks:

#### Sprint Components
- `src/app/scrum/planning/page.tsx`
- `src/components/scrum/SprintPlanning.tsx`
- `src/components/scrum/ActiveSprint.tsx`

#### Backlog Components
- `src/app/scrum/backlog/page.tsx`
- `src/components/scrum/ProductBacklog.tsx`

#### Board Components
- `src/app/scrum/board/page.tsx`
- `src/components/scrum/ScrumBoard.tsx`

#### Epic Components
- `src/components/scrum/EpicList.tsx`
- `src/components/scrum/EpicRoadmap.tsx`

#### Story Components
- `src/components/scrum/StoryDetailsModal.tsx`
- `src/components/scrum/StoryList.tsx`

#### Team Components
- `src/components/scrum/TeamVelocityChart.tsx`
- `src/components/scrum/TeamCapacity.tsx`

#### Ceremony Components
- `src/app/scrum/standup/page.tsx`
- `src/app/scrum/retrospective/page.tsx`
- `src/app/scrum/review/page.tsx`
- `src/components/scrum/DailyStandupTracker.tsx`

### Phase 5: Data Migration Utility

Create `/api/scrum/migrate-localStorage` endpoint:
- Read all localStorage scrum data
- Transform to match new schema
- Bulk insert into MongoDB
- Clear localStorage after successful migration
- Return migration summary

### Phase 6: Testing

Test all functionality:
- ✅ Sprint CRUD operations
- ⬜ Epic CRUD operations
- ⬜ Story CRUD operations
- ⬜ Task CRUD operations
- ⬜ Team member management
- ⬜ Retrospective management
- ⬜ Daily standup tracking
- ⬜ Sprint review management
- ⬜ Settings persistence
- ⬜ Guest to user migration
- ⬜ Offline support
- ⬜ Toast notifications
- ⬜ Optimistic updates

## Architecture Benefits

### Current (localStorage)
- ❌ No data persistence across devices
- ❌ No multi-user support
- ❌ No data backup/recovery
- ❌ Limited to single browser
- ❌ No query optimization

### After Migration (MongoDB)
- ✅ Data persists across devices
- ✅ Multi-user and guest support
- ✅ Automatic backups
- ✅ Accessible from any browser
- ✅ Indexed queries for performance
- ✅ Real-time sync with React Query
- ✅ Optimistic updates for better UX
- ✅ Guest to user migration path

## Estimated Remaining Time

- API Routes: ~2-3 hours (15 route files)
- React Query Hooks: ~1-2 hours (9 hook files)
- Component Updates: ~2-3 hours (20+ components)
- Migration Utility: ~30 minutes
- Testing: ~1 hour

**Total: ~7-9 hours of development time**

## Implementation Strategy

### Option A: Complete Migration (Recommended)
Continue autonomous implementation of all remaining phases

### Option B: Phased Rollout
1. Complete critical paths first (Sprints, Stories, Tasks)
2. Add secondary features later (Retrospectives, Reviews, Standups)
3. Maintain localStorage as fallback during transition

### Option C: Hybrid Approach
- Use new DB for new data
- Keep localStorage for backward compatibility
- Gradual migration utility for user data
