# ProjectHub User Manual

Welcome to ProjectHub - your comprehensive project management solution with advanced task tracking, team collaboration, and productivity features.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Core Features](#core-features)
3. [Boards & Tasks](#boards--tasks)
4. [Subtasks & Nested Tasks](#subtasks--nested-tasks)
5. [Task Dependencies](#task-dependencies)
6. [Time Tracking](#time-tracking)
7. [Team Collaboration](#team-collaboration)
8. [Advanced Search](#advanced-search)
9. [Command Palette](#command-palette)
10. [Comments & Activity](#comments--activity)
11. [Recurring Tasks](#recurring-tasks)
12. [Templates](#templates)
13. [Dashboard & Analytics](#dashboard--analytics)
14. [Keyboard Shortcuts](#keyboard-shortcuts)
15. [Offline Mode](#offline-mode)
16. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### First Launch

When you first open ProjectHub, you'll see the dashboard with:
- Welcome message
- Quick action buttons to create your first board
- Getting started guide

### Creating Your First Board

1. Click **"New Board"** button or use `Cmd/Ctrl + K` → "New Board"
2. Enter a board name (e.g., "Marketing Campaign", "Product Development")
3. Click **Create** or press `Enter`
4. Your new board will open in board view

### Understanding Views

ProjectHub offers three view modes:

- **Board View** - Kanban-style columns with draggable tasks
- **List View** - Compact list format with filtering
- **Calendar View** - Date-based visualization of tasks with due dates

Switch views using the view selector or Command Palette (`Cmd/Ctrl + K`).

---

## Core Features

### Boards

**Boards** are containers for organizing related tasks. Each board can represent:
- A project
- A team workspace
- A workflow stage
- Any organizational unit

**Board Actions:**
- Create, edit, rename, archive boards
- Add custom columns
- Configure board settings
- Export/import board data

### Tasks

**Tasks** are work items within boards. Each task includes:
- Title and description (supports Markdown)
- Priority level (Low, Medium, High, Urgent)
- Due date
- Tags for categorization
- Progress tracking (0-100%)
- Comments and attachments
- Activity history

**Task States:**
- Active (in progress)
- Completed (checked off)
- Blocked by dependencies

---

## Boards & Tasks

### Creating Tasks

**Quick Add:**
1. Click **"+ Add Task"** in any column
2. Type task title
3. Press `Enter` to create

**Detailed Add:**
1. Click **"New Task"** button
2. Fill in all details (title, description, priority, due date, tags)
3. Click **Create Task**

### Moving Tasks

**Drag & Drop:**
- Click and hold a task card
- Drag to desired column
- Release to drop

**Via Task Detail:**
1. Open task by clicking it
2. Change status in dropdown
3. Task moves automatically

### Task Priority

Set priority to help team focus on important work:

- **🔴 Urgent** - Critical, needs immediate attention
- **🟠 High** - Important, high priority
- **🟡 Medium** - Normal priority
- **🟢 Low** - Nice to have, low priority

### Task Progress

Track completion percentage:
1. Open task detail modal
2. Use progress slider (0-100%)
3. Progress updates automatically with subtasks

### Tags

Organize tasks with tags:
1. Open task detail
2. Click **"Add Tag"**
3. Type tag name and press `Enter`
4. Filter tasks by tags in list view

---

## Subtasks & Nested Tasks

Break down complex tasks into smaller, manageable pieces.

### Creating Subtasks

1. Open parent task
2. Scroll to **"Subtasks"** section
3. Click **"Add Subtask"**
4. Enter subtask title
5. Click **Add** or press `Enter`

### Subtask Features

- **Completion Tracking** - Parent task progress updates automatically
- **Quick Toggle** - Check/uncheck subtasks inline
- **Promote to Task** - Convert subtask to standalone task
- **Delete** - Remove subtasks with confirmation

### Progress Calculation

Parent task progress is automatically calculated based on completed subtasks:
- 3 of 6 subtasks completed = 50% progress
- All subtasks completed = 100% progress
- Manual progress overrides automatic calculation

### Promoting Subtasks

To convert a subtask to a full task:
1. Click **"Promote to Task"** icon next to subtask
2. Subtask becomes standalone task in the same column
3. Parent task progress recalculates

---

## Task Dependencies

Manage task relationships and blocking dependencies.

### Adding Dependencies

1. Open task detail modal
2. Scroll to **"Dependencies"** section
3. Click **"Add Dependency"**
4. Select tasks that must be completed first
5. Click **Add**

### Dependency Types

**Blocked By:**
- Current task cannot start until dependency completes
- Task shows blocked status indicator
- Visual warning if you try to complete blocked task

### Dependency Indicators

- **🔗 Badge** - Shows number of dependencies on task card
- **⚠️ Warning** - Appears if task is blocked by incomplete dependencies
- **✅ Clear** - All dependencies completed, task unblocked

### Managing Dependencies

- **View All** - See all dependencies in task detail
- **Remove** - Click X to remove dependency
- **Navigate** - Click dependency to open that task

---

## Time Tracking

Track time spent on tasks and compare against estimates.

### Starting a Timer

1. Open task detail modal
2. Scroll to **"Time Tracking"** section
3. Click **"Start Timer"**
4. Timer begins counting

**Active Timer Indicators:**
- Timer shows elapsed time
- Updates every minute
- Persists across page reloads

### Stopping a Timer

1. Open task with active timer
2. Click **"Stop Timer"**
3. Optionally add note about work done
4. Time log is created automatically

### Setting Time Estimates

1. Open task detail
2. Find **"Estimated Time"** field
3. Enter minutes or use format: `2h 30m`
4. Save estimate

### Time Log History

View all time entries for a task:
- Start/end timestamps
- Duration
- Notes
- User who logged time

**Actions:**
- View logs in chronological order
- Delete incorrect entries
- Export time data

### Time Tracking Reports

Access statistics for your board:
- Total estimated time
- Total actual time
- Time remaining
- Completion rate (actual vs estimated)
- Tasks with time tracking

---

## Team Collaboration

Assign tasks, manage users, and collaborate with your team.

### User Management

**Default Users:**
ProjectHub comes with demo users:
- You (default current user)
- Alice Johnson
- Bob Smith
- Carol White

**User Profiles:**
Each user has:
- Name and email
- Avatar (initials-based)
- Color coding
- User ID

### Assigning Tasks

1. Open task detail modal
2. Find **"Assignees"** section
3. Click **"Assign User"**
4. Select one or more users
5. Users appear as colored avatars on task card

### Viewing Assignments

- **Task Card** - Shows assignee avatars
- **List View** - Filter by assignee
- **Dashboard** - See your assigned tasks
- **Search** - Find tasks by assignee

### User Search

Find team members quickly:
1. Use search field in assignment picker
2. Type name or email
3. Results filter in real-time

---

## Advanced Search

Powerful search with multiple filters and saved queries.

### Basic Search

1. Click search icon or use `Cmd/Ctrl + K` → "Search"
2. Enter search text
3. Results show matching tasks across all boards

### Advanced Filters

Build complex queries with:

**Text Search:**
- Search in task title and description
- Case-insensitive matching

**Priority Filter:**
- Filter by Low, Medium, High, Urgent
- Select multiple priorities

**Tag Filter:**
- Filter by one or more tags
- AND/OR logic available

**Assignee Filter:**
- Find tasks assigned to specific users
- Select multiple assignees

**Date Range:**
- Filter by due date range
- Start date, end date, or both

**Board Filter:**
- Search within specific boards
- Select multiple boards

**Advanced Criteria:**
- Has Subtasks (yes/no)
- Has Dependencies (yes/no)
- Is Recurring (yes/no)
- Estimated Time Range (min-max)

### Saved Searches

Save frequently used queries:

1. Build your search query
2. Click **"Save Search"**
3. Enter name (e.g., "My High Priority Tasks")
4. Search saves automatically

**Using Saved Searches:**
- Access from saved searches dropdown
- Click to re-run instantly
- Last used timestamp updates
- Delete obsolete saved searches

### Search History

- Last 50 searches automatically saved
- View recent searches
- Click to re-run
- Clear history anytime

### Search Suggestions

As you type, get suggestions from:
- Recent searches
- Popular queries
- Similar past searches

---

## Command Palette

Quick keyboard-driven navigation and actions.

### Opening Command Palette

**Keyboard Shortcut:**
- Mac: `Cmd + K`
- Windows/Linux: `Ctrl + K`

**Button:**
Click command palette icon in top navigation

### Using the Palette

1. Palette opens with command list
2. Type to filter commands
3. Use arrow keys to navigate
4. Press `Enter` to execute
5. Press `Esc` to close

### Available Commands

**Navigation:**
- Dashboard - Go to dashboard
- Boards - View all boards
- Board View - Switch to board view
- List View - Switch to list view
- Calendar View - Switch to calendar view

**Actions:**
- New Board - Create new board
- New Task - Create new task
- Search - Open advanced search

**Board Navigation:**
- Lists all your boards
- Shows task count per board
- Quick jump to any board

### Keyboard Navigation

- `↑` / `↓` - Navigate commands
- `Enter` - Execute command
- `Esc` - Close palette
- Type - Filter commands

---

## Comments & Activity

Collaborate on tasks with comments and view activity history.

### Adding Comments

1. Open task detail modal
2. Scroll to **"Comments"** section
3. Type comment in text area (Markdown supported)
4. Click **"Add Comment"** or press `Cmd/Ctrl + Enter`

### Comment Features

- **Markdown Support** - Use formatting, links, lists
- **Timestamps** - Shows when comment was added
- **Edit** - Modify your comments
- **Delete** - Remove comments with confirmation
- **User Attribution** - Shows who wrote each comment

### Activity Log

Track all changes to a task:
- Task created
- Status changed
- Priority updated
- Assignees added/removed
- Due date modified
- Dependencies added
- Timer started/stopped
- Subtasks created
- Comments added

**Activity Format:**
```
[User] [Action] [Details] [Timestamp]
```

### Board Activity

View board-level activity:
1. Go to dashboard
2. Find **"Recent Activity"** widget
3. See latest actions across all boards
4. Filter by board or activity type

---

## Recurring Tasks

Automate task creation with recurring task templates.

### Creating Recurring Tasks

1. Click **"Recurring Tasks"** in navigation
2. Click **"New Recurring Task"**
3. Fill in template:
   - Task title and description
   - Priority and tags
   - Recurrence pattern
   - Board/column assignment
4. Click **Create**

### Recurrence Patterns

**Daily:**
- Every day
- Every N days
- Weekdays only

**Weekly:**
- Every week on specific days
- Every N weeks

**Monthly:**
- Specific day of month (e.g., 15th)
- Relative day (e.g., first Monday)
- Last day of month

**Custom:**
- Advanced CRON-like expressions

### Managing Recurring Tasks

- **Pause** - Stop generating new instances
- **Edit** - Modify template (affects future tasks only)
- **Delete** - Remove template and optionally delete instances
- **View Instances** - See all generated tasks

### Auto-Generation

Tasks are generated:
- On schedule based on pattern
- When previous instance completes
- Up to N tasks ahead (configurable)

---

## Templates

Save and reuse task configurations.

### Creating Templates

**From Existing Task:**
1. Open task detail
2. Click **"Save as Template"**
3. Enter template name
4. Template saves with all settings

**From Scratch:**
1. Go to Templates section
2. Click **"New Template"**
3. Configure template properties
4. Save template

### Template Contents

Templates include:
- Task title (with placeholders)
- Description (Markdown)
- Priority level
- Default tags
- Estimated time
- Subtasks structure
- Dependencies (relative)

### Using Templates

1. Click **"New Task from Template"**
2. Select template
3. Template populates task details
4. Customize as needed
5. Create task

### Exporting/Importing Templates

**Export:**
1. Select templates to export
2. Click **"Export"**
3. Download JSON file

**Import:**
1. Click **"Import Templates"**
2. Select JSON file
3. Templates added to library

### Template Placeholders

Use variables in templates:
- `{{date}}` - Current date
- `{{week}}` - Current week number
- `{{month}}` - Current month
- `{{user}}` - Current user name

Example: "Weekly Report - {{week}}"

---

## Dashboard & Analytics

Monitor progress and gain insights into your work.

### Dashboard Widgets

**Overview Cards:**
- Total Boards
- Total Tasks
- Completed Tasks
- Completion Rate

**Recent Activity:**
- Latest task updates
- Recent completions
- Team activity
- Quick links to tasks

**Task Breakdown:**
- By priority (pie chart)
- By status (progress bars)
- By board (summary table)

**Time Tracking Stats:**
- Total time tracked
- Time by board
- Estimated vs actual
- Team member time

**Upcoming Deadlines:**
- Tasks due soon
- Overdue tasks
- This week's tasks
- Next week preview

### Analytics Views

Access detailed analytics:
1. Click **"Analytics"** in navigation
2. Select report type
3. Choose date range
4. View charts and metrics

**Available Reports:**
- Task Velocity - Tasks completed over time
- Burndown Chart - Work remaining vs time
- Completion Rate - Percentage by period
- Time Analysis - Time tracking metrics
- Team Performance - Individual contributions

### Filtering Analytics

Customize reports with filters:
- Date range (last 7, 30, 90 days, custom)
- Specific boards
- Priority levels
- Team members
- Tags

### Exporting Reports

1. Configure your report
2. Click **"Export"**
3. Choose format (CSV, PDF, PNG)
4. Download file

---

## Keyboard Shortcuts

Boost productivity with keyboard shortcuts.

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open Command Palette |
| `Cmd/Ctrl + N` | New Task |
| `Cmd/Ctrl + B` | New Board |
| `Cmd/Ctrl + F` | Search |
| `Cmd/Ctrl + /` | Show shortcuts help |
| `Esc` | Close modal/dialog |

### Navigation Shortcuts

| Shortcut | Action |
|----------|--------|
| `G then D` | Go to Dashboard |
| `G then B` | Go to Boards |
| `G then A` | Go to Analytics |
| `G then T` | Go to Templates |

### Board View Shortcuts

| Shortcut | Action |
|----------|--------|
| `1` | Switch to Board View |
| `2` | Switch to List View |
| `3` | Switch to Calendar View |
| `F` | Toggle filter panel |
| `S` | Focus search box |

### Task Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Toggle task completion |
| `E` | Edit task |
| `D` | Delete task |
| `C` | Add comment |
| `T` | Start/stop timer |
| `Arrow Keys` | Navigate tasks |

### Modal Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Enter` | Save/Submit |
| `Cmd/Ctrl + S` | Save changes |
| `Esc` | Close modal |
| `Tab` | Next field |
| `Shift + Tab` | Previous field |

---

## Offline Mode

ProjectHub works offline as a Progressive Web App (PWA).

### PWA Installation

**Desktop:**
1. Visit ProjectHub in Chrome/Edge
2. Click install icon in address bar
3. Click **Install**
4. App appears in Applications

**Mobile:**
1. Visit ProjectHub in Safari/Chrome
2. Tap **Share** button
3. Select **"Add to Home Screen"**
4. App appears on home screen

### Offline Functionality

**Works Offline:**
- View all boards and tasks
- Create new tasks
- Edit existing tasks
- Mark tasks complete
- Add comments
- Track time

**Requires Online:**
- Syncing with server
- Real-time collaboration
- Image uploads
- External integrations

### Sync Status

Monitor sync status:
- **Green Dot** - Online and synced
- **Yellow Dot** - Pending sync
- **Red Dot** - Offline, changes queued

### Offline Changes

Changes made offline:
1. Saved locally in browser
2. Queued for sync
3. Auto-sync when online
4. Conflict resolution if needed

---

## Tips & Best Practices

### Getting Started Tips

1. **Start Small** - Create one board, add a few tasks
2. **Use Templates** - Save time with task templates
3. **Set Priorities** - Help team focus on important work
4. **Add Due Dates** - Track deadlines effectively
5. **Break Down Tasks** - Use subtasks for complex work

### Organization Tips

1. **Consistent Naming** - Use clear, descriptive names
2. **Tag Everything** - Makes filtering and search easier
3. **Regular Reviews** - Weekly review of tasks and priorities
4. **Archive Old Boards** - Keep workspace clean
5. **Use Dependencies** - Show task relationships

### Collaboration Tips

1. **Assign Clearly** - Every task should have owner
2. **Comment Often** - Keep communication in context
3. **Update Progress** - Keep team informed
4. **Use @mentions** - Notify specific team members
5. **Share Templates** - Standardize team workflows

### Time Management Tips

1. **Estimate Everything** - Improves planning accuracy
2. **Track Actual Time** - Learn estimation patterns
3. **Review Time Reports** - Identify time sinks
4. **Set Time Limits** - Use estimates as goals
5. **Break Long Tasks** - Use subtasks for better tracking

### Productivity Tips

1. **Master Shortcuts** - Learn `Cmd+K` command palette
2. **Use Quick Filters** - Save common searches
3. **Batch Similar Tasks** - Group by context or priority
4. **Limit WIP** - Focus on fewer tasks at once
5. **Regular Cleanup** - Archive completed tasks

### Advanced Workflows

**Sprint Planning:**
1. Create board per sprint
2. Use dependencies for task ordering
3. Set time estimates
4. Track progress with burndown
5. Review analytics at sprint end

**Kanban Flow:**
1. Limit tasks per column
2. Focus on task flow
3. Track cycle time
4. Identify bottlenecks
5. Continuous improvement

**GTD (Getting Things Done):**
1. Inbox board for capture
2. Next Actions list view
3. Waiting For with dependencies
4. Someday/Maybe low priority
5. Weekly review routine

---

## Troubleshooting

### Common Issues

**Tasks Not Saving:**
- Check internet connection
- Check browser console for errors
- Clear browser cache and reload
- Check localStorage quota

**Slow Performance:**
- Too many tasks in one board (>500)
- Split into multiple boards
- Archive old completed tasks
- Use list view instead of board view

**Missing Features:**
- Update to latest version
- Clear browser cache
- Check browser compatibility
- Enable JavaScript

**Sync Issues:**
- Check network connection
- Check sync status indicator
- Force refresh (Cmd/Ctrl + Shift + R)
- Check for pending changes

### Browser Compatibility

**Fully Supported:**
- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+

**Limited Support:**
- Older browsers may lack PWA features
- Some keyboard shortcuts may differ
- Update browser for best experience

### Data & Privacy

**Local Storage:**
- All data stored in browser localStorage
- No server required for basic usage
- Data persists across sessions
- Clear site data removes all data

**Backup:**
- Export boards regularly
- Download as JSON
- Keep offline copies
- No automatic cloud backup

### Getting Help

**Resources:**
- Check this manual
- Visit project wiki
- Search FAQ section
- Check GitHub issues

**Support:**
- Create GitHub issue
- Include browser/version
- Describe steps to reproduce
- Attach screenshots if helpful

---

## Appendix

### Glossary

**Board** - Container for related tasks and workflow

**Task** - Work item with title, description, and metadata

**Subtask** - Nested task under parent task

**Dependency** - Relationship where one task blocks another

**Tag** - Label for categorizing tasks

**Priority** - Importance level (Low, Medium, High, Urgent)

**Progress** - Completion percentage (0-100%)

**Due Date** - Deadline for task completion

**Assignee** - User responsible for task

**Time Log** - Record of time spent on task

**Template** - Reusable task configuration

**Recurring Task** - Auto-generated task on schedule

**Command Palette** - Keyboard-driven command interface

**PWA** - Progressive Web App (offline-capable)

### Version History

**v1.0** - Initial release
- Basic boards and tasks
- Kanban board view
- Task management

**v2.0** - Advanced features
- Dashboard and analytics
- Comments and activity
- Task templates
- Recurring tasks

**v3.0** - Collaboration & productivity (Current)
- Subtasks and nesting
- Team collaboration
- Advanced search
- Time tracking
- Command palette
- PWA support

### Credits

Built with:
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- LocalStorage API
- Service Workers

---

**Last Updated:** 2025-10-10
**Version:** 3.0
**License:** MIT
