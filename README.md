# ProjectHub

> Modern, feature-rich project management application built with Next.js, TypeScript, and Tailwind CSS.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## ✨ Features

### Core Features
- 📋 **Kanban Boards** - Drag-and-drop task management
- 📝 **Rich Tasks** - Descriptions, priorities, due dates, tags
- 👁️ **Multiple Views** - Board, List, and Calendar views
- 📊 **Dashboard** - Analytics and insights

### Advanced Features
- 🔢 **Subtasks** - Break down complex tasks into smaller pieces
- 🔗 **Dependencies** - Manage task relationships and blockers
- ⏱️ **Time Tracking** - Estimate and track time with timers
- 💬 **Comments** - Collaborate with team on tasks
- 👥 **Team Collaboration** - Assign tasks to team members
- 🔍 **Advanced Search** - Powerful filtering and saved searches
- ⌨️ **Command Palette** - Keyboard-driven navigation (Cmd+K)
- 🔄 **Recurring Tasks** - Automate repetitive task creation
- 📄 **Templates** - Reusable task configurations
- 📱 **PWA Support** - Work offline, install as app

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or later
- npm 9.x or later

### Installation

```bash
# Clone repository
git clone <repository-url>
cd showcase-1

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### First Steps

1. **Create a Board** - Click "New Board" and enter a name
2. **Add Tasks** - Click "+ Add Task" in any column
3. **Organize** - Drag tasks between columns, set priorities
4. **Use Shortcuts** - Press `Cmd+K` to open command palette

## 📖 Documentation

- **[User Manual](docs/USER_MANUAL.md)** - Complete user guide
- **[Wiki Home](docs/wiki/Home.md)** - Documentation hub
- **[Quick Start Guide](docs/wiki/Quick-Start.md)** - Get started in 5 minutes
- **[Developer Guide](docs/wiki/Developer-Guide.md)** - Development setup and guidelines
- **[Architecture](docs/wiki/Architecture.md)** - System design and patterns

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library with latest features
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 3** - Utility-first styling

### Data & Storage
- **LocalStorage** - Client-side persistence
- **Service Workers** - Offline support and caching

### Build Tools
- **TypeScript Compiler** - Type checking
- **ESLint** - Code linting
- **PostCSS** - CSS processing

## 📁 Project Structure

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
│   │   ├── boards/        # Board routes
│   │   ├── dashboard/     # Dashboard route
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Home page
│   ├── components/         # React components
│   │   ├── board/         # Board components
│   │   ├── command/       # Command palette
│   │   ├── layout/        # Layout components
│   │   └── task/          # Task components
│   └── lib/               # Core library
│       ├── services/      # Business logic
│       ├── types.ts       # TypeScript types
│       ├── storage.ts     # Storage service
│       └── constants.ts   # App constants
└── package.json
```

## 🛠️ Development

### Available Scripts

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
```

### Key Technologies

**Service Layer Pattern:**
All business logic is in service classes:
```typescript
import { BoardService } from '@/lib/services/boardService';

const boards = BoardService.getAll();
const board = BoardService.create('New Board');
```

**Type Safety:**
Everything is typed with TypeScript:
```typescript
interface BoardTask {
  id: string;
  text: string;
  priority: Priority;
  // ... more fields
}
```

**Storage Abstraction:**
Clean API for data persistence:
```typescript
import { StorageService } from '@/lib/storage';

const data = StorageService.get<Board[]>(STORAGE_KEYS.BOARDS, []);
StorageService.set(STORAGE_KEYS.BOARDS, updatedData);
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open Command Palette |
| `Cmd/Ctrl + N` | New Task |
| `Cmd/Ctrl + B` | New Board |
| `Cmd/Ctrl + F` | Search |
| `1` / `2` / `3` | Switch views |
| `Esc` | Close modal |

See [full shortcuts list](docs/USER_MANUAL.md#keyboard-shortcuts) in the user manual.

## 🎯 Core Concepts

### Boards
Containers for organizing related tasks. Each board has customizable columns and can represent projects, teams, or workflows.

### Tasks
Work items with rich metadata:
- Title and description (Markdown supported)
- Priority levels (Low, Medium, High, Urgent)
- Due dates and progress tracking
- Tags, comments, and attachments

### Subtasks
Break down complex tasks into smaller, manageable pieces. Parent task progress automatically calculated from subtasks.

### Dependencies
Manage task relationships. Tasks can be blocked by other tasks, preventing premature completion.

### Time Tracking
Track time spent on tasks with built-in timer. Compare actual time against estimates.

### Command Palette
Quick keyboard-driven navigation. Press `Cmd+K` to access all commands and navigate anywhere instantly.

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Static Export

```bash
# Build static files
npm run build

# Deploy /out directory to any static host
```

### Docker

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

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](docs/wiki/Developer-Guide.md) for details.

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS approach
- React team for the UI library
- Open source community

## 📧 Support

- 📖 [Documentation](docs/USER_MANUAL.md)
- 🐛 [Report Issues](https://github.com/your-repo/issues)
- 💬 [Discussions](https://github.com/your-repo/discussions)

---

**Made with ❤️ using Next.js, TypeScript, and Tailwind CSS**

**Last Updated:** 2025-10-10 | **Version:** 3.0
