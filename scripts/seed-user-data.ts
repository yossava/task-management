import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const USER_EMAIL = 'vcckaskus@gmail.com';

async function main() {
  console.log('🌱 Starting seed script...\n');

  // Find the user
  const user = await prisma.user.findUnique({
    where: { email: USER_EMAIL },
  });

  if (!user) {
    console.error(`❌ User with email ${USER_EMAIL} not found!`);
    process.exit(1);
  }

  console.log(`✅ Found user: ${user.email}\n`);

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.retrospective.deleteMany({ where: { userId: user.id } });
  await prisma.dailyStandup.deleteMany({ where: { userId: user.id } });
  await prisma.sprintReview.deleteMany({ where: { userId: user.id } });
  await prisma.scrumTask.deleteMany({ where: { userId: user.id } });
  await prisma.userStory.deleteMany({ where: { userId: user.id } });
  await prisma.sprint.deleteMany({ where: { userId: user.id } });
  await prisma.epic.deleteMany({ where: { userId: user.id } });
  await prisma.teamMember.deleteMany({ where: { userId: user.id } });
  await prisma.recurringTask.deleteMany({ where: { userId: user.id } });
  await prisma.task.deleteMany({ where: { board: { userId: user.id } } });
  await prisma.board.deleteMany({ where: { userId: user.id } });
  await prisma.scrumSettings.deleteMany({ where: { userId: user.id } });
  console.log('✅ Cleared existing data\n');

  // Create Scrum Settings
  console.log('⚙️  Creating scrum settings...');
  await prisma.scrumSettings.create({
    data: {
      userId: user.id,
      defaultSprintDuration: 2,
      storyPointScale: [1, 2, 3, 5, 8, 13, 21],
      workingDays: [1, 2, 3, 4, 5],
      dailyCapacity: 6,
    },
  });
  console.log('✅ Created scrum settings\n');

  // Create Team Members
  console.log('👥 Creating team members...');
  const teamMembers = await Promise.all([
    prisma.teamMember.create({
      data: {
        name: 'Sarah Chen',
        email: 'sarah.chen@company.com',
        role: 'scrum-master',
        avatar: '👩‍💼',
        capacity: 8,
        availability: 100,
        userId: user.id,
      },
    }),
    prisma.teamMember.create({
      data: {
        name: 'Alex Rodriguez',
        email: 'alex.rodriguez@company.com',
        role: 'developer',
        avatar: '👨‍💻',
        capacity: 7,
        availability: 90,
        userId: user.id,
      },
    }),
    prisma.teamMember.create({
      data: {
        name: 'Emma Watson',
        email: 'emma.watson@company.com',
        role: 'developer',
        avatar: '👩‍💻',
        capacity: 8,
        availability: 100,
        userId: user.id,
      },
    }),
    prisma.teamMember.create({
      data: {
        name: 'James Park',
        email: 'james.park@company.com',
        role: 'designer',
        avatar: '🎨',
        capacity: 8,
        availability: 100,
        userId: user.id,
      },
    }),
    prisma.teamMember.create({
      data: {
        name: 'Maria Garcia',
        email: 'maria.garcia@company.com',
        role: 'tester',
        avatar: '🧪',
        capacity: 8,
        availability: 80,
        userId: user.id,
      },
    }),
    prisma.teamMember.create({
      data: {
        name: 'David Kim',
        email: 'david.kim@company.com',
        role: 'product-owner',
        avatar: '📊',
        capacity: 6,
        availability: 100,
        userId: user.id,
      },
    }),
  ]);
  console.log(`✅ Created ${teamMembers.length} team members\n`);

  // Create Epics
  console.log('📚 Creating epics...');
  const epics = await Promise.all([
    prisma.epic.create({
      data: {
        title: 'User Authentication & Authorization',
        description: 'Complete authentication system with SSO, MFA, and role-based access control',
        color: '#8b5cf6',
        status: 'active',
        progress: 65,
        startDate: new Date('2025-09-01'),
        targetDate: new Date('2025-11-30'),
        userId: user.id,
      },
    }),
    prisma.epic.create({
      data: {
        title: 'Dashboard Analytics',
        description: 'Real-time analytics dashboard with customizable widgets and reports',
        color: '#3b82f6',
        status: 'active',
        progress: 40,
        startDate: new Date('2025-09-15'),
        targetDate: new Date('2025-12-15'),
        userId: user.id,
      },
    }),
    prisma.epic.create({
      data: {
        title: 'Mobile Application',
        description: 'Native mobile apps for iOS and Android with offline support',
        color: '#10b981',
        status: 'active',
        progress: 20,
        startDate: new Date('2025-10-01'),
        targetDate: new Date('2026-02-28'),
        userId: user.id,
      },
    }),
    prisma.epic.create({
      data: {
        title: 'API Platform',
        description: 'RESTful API with GraphQL support and comprehensive documentation',
        color: '#f59e0b',
        status: 'active',
        progress: 55,
        startDate: new Date('2025-08-15'),
        targetDate: new Date('2025-12-31'),
        userId: user.id,
      },
    }),
  ]);
  console.log(`✅ Created ${epics.length} epics\n`);

  // Create Sprints
  console.log('🏃 Creating sprints...');
  const currentDate = new Date('2025-10-01');
  const sprints = await Promise.all([
    // Past Sprint (Completed)
    prisma.sprint.create({
      data: {
        name: 'Sprint 15 - Authentication Core',
        goal: 'Complete basic authentication flow with JWT tokens',
        startDate: new Date('2025-09-16'),
        endDate: new Date('2025-09-30'),
        status: 'completed',
        commitment: 42,
        velocity: 38,
        userId: user.id,
      },
    }),
    // Current Sprint (Active)
    prisma.sprint.create({
      data: {
        name: 'Sprint 16 - Dashboard & Analytics',
        goal: 'Build core dashboard components with real-time data',
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-10-15'),
        status: 'active',
        commitment: 45,
        velocity: 0,
        userId: user.id,
      },
    }),
    // Next Sprint (Planning)
    prisma.sprint.create({
      data: {
        name: 'Sprint 17 - Mobile Foundation',
        goal: 'Set up mobile project structure and core navigation',
        startDate: new Date('2025-10-16'),
        endDate: new Date('2025-10-30'),
        status: 'planning',
        commitment: 40,
        velocity: 0,
        userId: user.id,
      },
    }),
  ]);
  console.log(`✅ Created ${sprints.length} sprints\n`);

  // Create User Stories for Sprint 15 (Completed)
  console.log('📝 Creating user stories for Sprint 15...');
  const sprint15Stories = await Promise.all([
    prisma.userStory.create({
      data: {
        title: 'User Registration with Email Verification',
        description: 'As a new user, I want to register with my email and receive a verification link',
        acceptanceCriteria: '- Email validation\n- Secure password requirements\n- Verification email sent\n- Account activation on verification',
        storyPoints: 8,
        priority: 'high',
        status: 'done',
        sprintId: sprints[0].id,
        epicId: epics[0].id,
        assigneeId: teamMembers[1].id,
        labels: ['backend', 'security', 'email'],
        userId: user.id,
      },
    }),
    prisma.userStory.create({
      data: {
        title: 'JWT Token Authentication',
        description: 'As a developer, I want to implement JWT-based authentication for API requests',
        acceptanceCriteria: '- Generate JWT on login\n- Refresh token mechanism\n- Token validation middleware\n- Secure token storage',
        storyPoints: 13,
        priority: 'critical',
        status: 'done',
        sprintId: sprints[0].id,
        epicId: epics[0].id,
        assigneeId: teamMembers[2].id,
        labels: ['backend', 'security', 'api'],
        userId: user.id,
      },
    }),
    prisma.userStory.create({
      data: {
        title: 'Login Page UI',
        description: 'As a user, I want a clean and responsive login interface',
        acceptanceCriteria: '- Responsive design\n- Form validation\n- Error handling\n- Remember me option',
        storyPoints: 5,
        priority: 'high',
        status: 'done',
        sprintId: sprints[0].id,
        epicId: epics[0].id,
        assigneeId: teamMembers[3].id,
        labels: ['frontend', 'design', 'ux'],
        userId: user.id,
      },
    }),
    prisma.userStory.create({
      data: {
        title: 'Password Reset Flow',
        description: 'As a user, I want to reset my password if I forget it',
        acceptanceCriteria: '- Email-based reset link\n- Secure token expiration\n- Password strength validation\n- Success confirmation',
        storyPoints: 8,
        priority: 'medium',
        status: 'done',
        sprintId: sprints[0].id,
        epicId: epics[0].id,
        assigneeId: teamMembers[1].id,
        labels: ['backend', 'email', 'security'],
        userId: user.id,
      },
    }),
    prisma.userStory.create({
      data: {
        title: 'Session Management',
        description: 'As a system, I need to manage user sessions securely',
        acceptanceCriteria: '- Session creation\n- Session expiration\n- Concurrent session handling\n- Logout functionality',
        storyPoints: 5,
        priority: 'high',
        status: 'done',
        sprintId: sprints[0].id,
        epicId: epics[0].id,
        assigneeId: teamMembers[2].id,
        labels: ['backend', 'security'],
        userId: user.id,
      },
    }),
  ]);
  console.log(`✅ Created ${sprint15Stories.length} user stories for Sprint 15\n`);

  // Create User Stories for Sprint 16 (Active)
  console.log('📝 Creating user stories for Sprint 16...');
  const sprint16Stories = await Promise.all([
    prisma.userStory.create({
      data: {
        title: 'Dashboard Layout Component',
        description: 'As a developer, I need a flexible dashboard layout system with widget support',
        acceptanceCriteria: '- Grid-based layout\n- Drag and drop widgets\n- Responsive breakpoints\n- Widget configuration',
        storyPoints: 13,
        priority: 'critical',
        status: 'in-progress',
        sprintId: sprints[1].id,
        epicId: epics[1].id,
        assigneeId: teamMembers[2].id,
        labels: ['frontend', 'dashboard', 'components'],
        userId: user.id,
      },
    }),
    prisma.userStory.create({
      data: {
        title: 'Real-time Data Visualization',
        description: 'As a user, I want to see real-time charts and graphs on my dashboard',
        acceptanceCriteria: '- WebSocket connection\n- Multiple chart types\n- Auto-refresh data\n- Performance optimization',
        storyPoints: 21,
        priority: 'high',
        status: 'in-progress',
        sprintId: sprints[1].id,
        epicId: epics[1].id,
        assigneeId: teamMembers[1].id,
        labels: ['frontend', 'backend', 'real-time', 'charts'],
        userId: user.id,
      },
    }),
    prisma.userStory.create({
      data: {
        title: 'Analytics API Endpoints',
        description: 'As a backend developer, I need to create API endpoints for analytics data',
        acceptanceCriteria: '- Data aggregation\n- Time-based filtering\n- Caching strategy\n- Rate limiting',
        storyPoints: 8,
        priority: 'high',
        status: 'review',
        sprintId: sprints[1].id,
        epicId: epics[1].id,
        assigneeId: teamMembers[2].id,
        labels: ['backend', 'api', 'analytics'],
        userId: user.id,
      },
    }),
    prisma.userStory.create({
      data: {
        title: 'Custom Dashboard Widgets',
        description: 'As a user, I want to create and customize my own dashboard widgets',
        acceptanceCriteria: '- Widget library\n- Configuration options\n- Save user preferences\n- Widget marketplace',
        storyPoints: 13,
        priority: 'medium',
        status: 'todo',
        sprintId: sprints[1].id,
        epicId: epics[1].id,
        assigneeId: teamMembers[3].id,
        labels: ['frontend', 'ux', 'customization'],
        userId: user.id,
      },
    }),
    prisma.userStory.create({
      data: {
        title: 'Export Analytics Reports',
        description: 'As a user, I want to export analytics data to CSV/PDF formats',
        acceptanceCriteria: '- CSV export\n- PDF report generation\n- Date range selection\n- Email delivery option',
        storyPoints: 5,
        priority: 'low',
        status: 'todo',
        sprintId: sprints[1].id,
        epicId: epics[1].id,
        assigneeId: teamMembers[1].id,
        labels: ['backend', 'export', 'reports'],
        userId: user.id,
      },
    }),
  ]);
  console.log(`✅ Created ${sprint16Stories.length} user stories for Sprint 16\n`);

  // Create User Stories for Sprint 17 (Planning)
  console.log('📝 Creating user stories for Sprint 17...');
  const sprint17Stories = await Promise.all([
    prisma.userStory.create({
      data: {
        title: 'React Native Project Setup',
        description: 'As a mobile developer, I need to set up the React Native project structure',
        acceptanceCriteria: '- Project initialization\n- Navigation setup\n- State management\n- Build configurations',
        storyPoints: 8,
        priority: 'critical',
        status: 'backlog',
        sprintId: sprints[2].id,
        epicId: epics[2].id,
        assigneeId: teamMembers[1].id,
        labels: ['mobile', 'setup', 'infrastructure'],
        userId: user.id,
      },
    }),
    prisma.userStory.create({
      data: {
        title: 'Mobile Authentication Flow',
        description: 'As a mobile user, I want to authenticate using biometrics or PIN',
        acceptanceCriteria: '- Biometric authentication\n- PIN fallback\n- Token storage\n- Auto-login',
        storyPoints: 13,
        priority: 'high',
        status: 'backlog',
        sprintId: sprints[2].id,
        epicId: epics[2].id,
        assigneeId: teamMembers[2].id,
        labels: ['mobile', 'security', 'authentication'],
        userId: user.id,
      },
    }),
    prisma.userStory.create({
      data: {
        title: 'Offline Data Sync',
        description: 'As a mobile user, I want the app to work offline and sync when online',
        acceptanceCriteria: '- Local database\n- Sync queue\n- Conflict resolution\n- Background sync',
        storyPoints: 21,
        priority: 'high',
        status: 'backlog',
        sprintId: sprints[2].id,
        epicId: epics[2].id,
        assigneeId: teamMembers[1].id,
        labels: ['mobile', 'offline', 'sync'],
        userId: user.id,
      },
    }),
  ]);
  console.log(`✅ Created ${sprint17Stories.length} user stories for Sprint 17\n`);

  // Create Backlog Stories (Not assigned to sprint)
  console.log('📝 Creating backlog stories...');
  const backlogStories = await Promise.all([
    prisma.userStory.create({
      data: {
        title: 'Multi-Factor Authentication',
        description: 'As a user, I want to enable MFA for additional security',
        acceptanceCriteria: '- TOTP support\n- SMS backup\n- Recovery codes\n- QR code generation',
        storyPoints: 13,
        priority: 'high',
        status: 'backlog',
        epicId: epics[0].id,
        assigneeId: teamMembers[2].id,
        labels: ['backend', 'security', 'mfa'],
        userId: user.id,
      },
    }),
    prisma.userStory.create({
      data: {
        title: 'Social Login Integration',
        description: 'As a user, I want to login using Google, GitHub, or Microsoft',
        acceptanceCriteria: '- OAuth2 integration\n- Provider selection\n- Account linking\n- Profile sync',
        storyPoints: 8,
        priority: 'medium',
        status: 'backlog',
        epicId: epics[0].id,
        labels: ['backend', 'oauth', 'integration'],
        userId: user.id,
      },
    }),
    prisma.userStory.create({
      data: {
        title: 'GraphQL API Support',
        description: 'As a developer, I want to query data using GraphQL',
        acceptanceCriteria: '- GraphQL schema\n- Resolvers\n- Playground\n- Documentation',
        storyPoints: 21,
        priority: 'medium',
        status: 'backlog',
        epicId: epics[3].id,
        labels: ['backend', 'api', 'graphql'],
        userId: user.id,
      },
    }),
    prisma.userStory.create({
      data: {
        title: 'Push Notifications',
        description: 'As a mobile user, I want to receive push notifications',
        acceptanceCriteria: '- FCM integration\n- APNS integration\n- Notification preferences\n- Deep linking',
        storyPoints: 13,
        priority: 'medium',
        status: 'backlog',
        epicId: epics[2].id,
        labels: ['mobile', 'notifications'],
        userId: user.id,
      },
    }),
  ]);
  console.log(`✅ Created ${backlogStories.length} backlog stories\n`);

  // Create Tasks for User Stories
  console.log('✅ Creating scrum tasks for user stories...');

  // Tasks for "Dashboard Layout Component" (in-progress)
  await Promise.all([
    prisma.scrumTask.create({
      data: {
        title: 'Design grid system architecture',
        description: 'Research and design the grid layout system with responsive breakpoints',
        status: 'done',
        storyId: sprint16Stories[0].id,
        assigneeId: teamMembers[2].id,
        estimatedHours: 4,
        actualHours: 3,
        order: 1,
        userId: user.id,
      },
    }),
    prisma.scrumTask.create({
      data: {
        title: 'Implement drag and drop functionality',
        description: 'Add drag and drop support using react-dnd or similar library',
        status: 'in-progress',
        storyId: sprint16Stories[0].id,
        assigneeId: teamMembers[2].id,
        estimatedHours: 8,
        actualHours: 5,
        order: 2,
        userId: user.id,
      },
    }),
    prisma.scrumTask.create({
      data: {
        title: 'Create widget configuration panel',
        description: 'Build UI for configuring widget settings and properties',
        status: 'todo',
        storyId: sprint16Stories[0].id,
        assigneeId: teamMembers[3].id,
        estimatedHours: 6,
        order: 3,
        userId: user.id,
      },
    }),
    prisma.scrumTask.create({
      data: {
        title: 'Add responsive breakpoints',
        description: 'Implement responsive behavior for mobile, tablet, and desktop',
        status: 'todo',
        storyId: sprint16Stories[0].id,
        estimatedHours: 4,
        order: 4,
        userId: user.id,
      },
    }),
  ]);

  // Tasks for "Real-time Data Visualization" (in-progress)
  await Promise.all([
    prisma.scrumTask.create({
      data: {
        title: 'Set up WebSocket connection',
        description: 'Configure WebSocket server and client connection handling',
        status: 'done',
        storyId: sprint16Stories[1].id,
        assigneeId: teamMembers[1].id,
        estimatedHours: 6,
        actualHours: 7,
        order: 1,
        userId: user.id,
      },
    }),
    prisma.scrumTask.create({
      data: {
        title: 'Implement chart components',
        description: 'Create reusable chart components (line, bar, pie, area)',
        status: 'in-progress',
        storyId: sprint16Stories[1].id,
        assigneeId: teamMembers[2].id,
        estimatedHours: 12,
        actualHours: 8,
        order: 2,
        userId: user.id,
      },
    }),
    prisma.scrumTask.create({
      data: {
        title: 'Add real-time data updates',
        description: 'Implement real-time chart updates with WebSocket data',
        status: 'todo',
        storyId: sprint16Stories[1].id,
        estimatedHours: 8,
        order: 3,
        userId: user.id,
      },
    }),
    prisma.scrumTask.create({
      data: {
        title: 'Performance optimization',
        description: 'Optimize chart rendering for large datasets',
        status: 'todo',
        storyId: sprint16Stories[1].id,
        estimatedHours: 6,
        order: 4,
        userId: user.id,
      },
    }),
  ]);

  // Tasks for "Analytics API Endpoints" (review)
  await Promise.all([
    prisma.scrumTask.create({
      data: {
        title: 'Design API schema',
        description: 'Define API endpoints, request/response formats',
        status: 'done',
        storyId: sprint16Stories[2].id,
        assigneeId: teamMembers[2].id,
        estimatedHours: 3,
        actualHours: 3,
        order: 1,
        userId: user.id,
      },
    }),
    prisma.scrumTask.create({
      data: {
        title: 'Implement data aggregation',
        description: 'Create database queries for data aggregation',
        status: 'done',
        storyId: sprint16Stories[2].id,
        assigneeId: teamMembers[2].id,
        estimatedHours: 8,
        actualHours: 9,
        order: 2,
        userId: user.id,
      },
    }),
    prisma.scrumTask.create({
      data: {
        title: 'Add caching layer',
        description: 'Implement Redis caching for frequently accessed data',
        status: 'done',
        storyId: sprint16Stories[2].id,
        assigneeId: teamMembers[1].id,
        estimatedHours: 4,
        actualHours: 5,
        order: 3,
        userId: user.id,
      },
    }),
    prisma.scrumTask.create({
      data: {
        title: 'Write API tests',
        description: 'Create integration tests for all endpoints',
        status: 'in-progress',
        storyId: sprint16Stories[2].id,
        assigneeId: teamMembers[4].id,
        estimatedHours: 6,
        actualHours: 3,
        order: 4,
        userId: user.id,
      },
    }),
  ]);

  console.log('✅ Created scrum tasks\n');

  // Create Daily Standup for Sprint 16
  console.log('📅 Creating daily standup...');
  await prisma.dailyStandup.create({
    data: {
      sprintId: sprints[1].id,
      date: new Date('2025-10-12'),
      updates: [
        {
          memberId: teamMembers[1].id,
          memberName: 'Alex Rodriguez',
          yesterday: 'Completed WebSocket connection setup. Started working on chart components.',
          today: 'Continue implementing chart components. Focus on line and bar charts.',
          blockers: 'Need clarification on chart color schemes from design team',
        },
        {
          memberId: teamMembers[2].id,
          memberName: 'Emma Watson',
          yesterday: 'Finished drag and drop functionality for dashboard. Fixed responsive issues.',
          today: 'Work on API endpoint testing. Review analytics API PR.',
          blockers: 'None',
        },
        {
          memberId: teamMembers[3].id,
          memberName: 'James Park',
          yesterday: 'Created mockups for widget configuration panel.',
          today: 'Start implementing widget configuration UI.',
          blockers: 'None',
        },
        {
          memberId: teamMembers[4].id,
          memberName: 'Maria Garcia',
          yesterday: 'Working on API integration tests.',
          today: 'Complete API test suite. Start testing dashboard components.',
          blockers: 'Waiting for test environment setup',
        },
      ],
      impediments: [
        'Test environment configuration taking longer than expected',
        'Design system color palette needs finalization',
      ],
      userId: user.id,
    },
  });
  console.log('✅ Created daily standup\n');

  // Create Sprint Review for Sprint 15
  console.log('📋 Creating sprint review...');
  await prisma.sprintReview.create({
    data: {
      sprintId: sprints[0].id,
      date: new Date('2025-09-30'),
      completedStories: [
        sprint15Stories[0].id,
        sprint15Stories[1].id,
        sprint15Stories[2].id,
        sprint15Stories[3].id,
        sprint15Stories[4].id,
      ],
      incompleteStories: [],
      demos: [
        {
          id: '1',
          storyId: sprint15Stories[0].id,
          title: 'User Registration with Email Verification',
          presenter: 'Alex Rodriguez',
          feedback: 'Great work! Email templates look professional. Consider adding password strength indicator.',
        },
        {
          id: '2',
          storyId: sprint15Stories[1].id,
          title: 'JWT Token Authentication',
          presenter: 'Emma Watson',
          feedback: 'Solid implementation. Token refresh mechanism works smoothly. Good security practices.',
        },
        {
          id: '3',
          storyId: sprint15Stories[2].id,
          title: 'Login Page UI',
          presenter: 'James Park',
          feedback: 'Clean and modern design. Animations are smooth. Mobile experience is excellent.',
        },
      ],
      feedback: 'Excellent sprint! Team delivered all committed stories. Authentication system is production-ready. Consider adding more automated tests for edge cases.',
      userId: user.id,
    },
  });
  console.log('✅ Created sprint review\n');

  // Create Retrospective for Sprint 15
  console.log('🔄 Creating retrospective...');
  await prisma.retrospective.create({
    data: {
      sprintId: sprints[0].id,
      date: new Date('2025-09-30'),
      wentWell: [
        {
          id: '1',
          content: 'Great collaboration between frontend and backend teams',
          votes: 8,
        },
        {
          id: '2',
          content: 'Clear acceptance criteria helped reduce rework',
          votes: 6,
        },
        {
          id: '3',
          content: 'Daily standups kept everyone aligned',
          votes: 5,
        },
        {
          id: '4',
          content: 'Code review process improved code quality',
          votes: 7,
        },
      ],
      improve: [
        {
          id: '1',
          content: 'Need better estimation - some stories took longer than expected',
          votes: 9,
        },
        {
          id: '2',
          content: 'Test environment setup caused delays',
          votes: 7,
        },
        {
          id: '3',
          content: 'Could use more pair programming sessions',
          votes: 4,
        },
      ],
      actionItems: [
        {
          id: '1',
          description: 'Set up automated test environment provisioning',
          assignee: 'Alex Rodriguez',
          status: 'in-progress',
          dueDate: new Date('2025-10-15'),
        },
        {
          id: '2',
          description: 'Create estimation guide with historical data',
          assignee: 'Sarah Chen',
          status: 'todo',
          dueDate: new Date('2025-10-20'),
        },
        {
          id: '3',
          description: 'Schedule weekly pair programming sessions',
          assignee: 'Sarah Chen',
          status: 'todo',
          dueDate: new Date('2025-10-10'),
        },
      ],
      userId: user.id,
    },
  });
  console.log('✅ Created retrospective\n');

  // Create Traditional Boards
  console.log('📋 Creating traditional boards...');

  const personalBoard = await prisma.board.create({
    data: {
      title: 'Personal Development',
      description: 'My learning goals and side projects',
      color: '#8b5cf6',
      order: 1,
      userId: user.id,
    },
  });

  const workBoard = await prisma.board.create({
    data: {
      title: 'Q4 Marketing Campaign',
      description: 'Plan and execute our biggest marketing campaign of the year',
      color: '#3b82f6',
      order: 2,
      userId: user.id,
    },
  });

  const homeBoard = await prisma.board.create({
    data: {
      title: 'Home Renovation',
      description: 'Track progress on kitchen and bathroom remodeling',
      color: '#10b981',
      order: 3,
      userId: user.id,
    },
  });

  const researchBoard = await prisma.board.create({
    data: {
      title: 'Product Research',
      description: 'Research and analysis for new product features',
      color: '#f59e0b',
      order: 4,
      userId: user.id,
    },
  });

  console.log(`✅ Created 4 traditional boards\n`);

  // Create Tasks for Personal Development Board
  console.log('✅ Creating tasks for boards...');
  const personalTasks = await Promise.all([
    prisma.task.create({
      data: {
        text: 'Complete Advanced TypeScript Course',
        completed: false,
        boardId: personalBoard.id,
        order: 1,
        description: 'Finish the advanced TypeScript patterns course on Udemy',
        color: '#8b5cf6',
        dueDate: new Date('2025-11-30'),
        progress: 65,
        priority: 'high',
        estimatedTime: 1200, // 20 hours
        actualTime: 780, // 13 hours
        subtasks: [
          { id: '1', text: 'Generics and Advanced Types', completed: true, createdAt: new Date() },
          { id: '2', text: 'Decorators and Metadata', completed: true, createdAt: new Date() },
          { id: '3', text: 'Type Guards and Assertions', completed: true, createdAt: new Date() },
          { id: '4', text: 'Conditional Types', completed: false, createdAt: new Date() },
          { id: '5', text: 'Template Literal Types', completed: false, createdAt: new Date() },
        ],
        comments: [
          {
            id: '1',
            content: 'The section on conditional types is really challenging but super useful!',
            author: 'You',
            authorId: user.id,
            createdAt: new Date('2025-10-10'),
            updatedAt: new Date('2025-10-10'),
          },
        ],
      },
    }),
    prisma.task.create({
      data: {
        text: 'Build Personal Portfolio Website',
        completed: false,
        boardId: personalBoard.id,
        order: 2,
        description: 'Create a modern portfolio showcasing my projects and skills',
        color: '#3b82f6',
        dueDate: new Date('2025-10-31'),
        progress: 40,
        priority: 'medium',
        estimatedTime: 960, // 16 hours
        actualTime: 384, // 6.4 hours
        subtasks: [
          { id: '1', text: 'Design mockups in Figma', completed: true, createdAt: new Date() },
          { id: '2', text: 'Set up Next.js project', completed: true, createdAt: new Date() },
          { id: '3', text: 'Implement homepage', completed: false, createdAt: new Date() },
          { id: '4', text: 'Create project showcase section', completed: false, createdAt: new Date() },
          { id: '5', text: 'Add contact form', completed: false, createdAt: new Date() },
          { id: '6', text: 'Deploy to Vercel', completed: false, createdAt: new Date() },
        ],
      },
    }),
    prisma.task.create({
      data: {
        text: 'Learn Docker and Kubernetes',
        completed: false,
        boardId: personalBoard.id,
        order: 3,
        description: 'Master containerization and orchestration',
        color: '#10b981',
        dueDate: new Date('2025-12-31'),
        progress: 20,
        priority: 'medium',
        estimatedTime: 1800, // 30 hours
        subtasks: [
          { id: '1', text: 'Docker basics and commands', completed: true, createdAt: new Date() },
          { id: '2', text: 'Docker Compose', completed: false, createdAt: new Date() },
          { id: '3', text: 'Kubernetes fundamentals', completed: false, createdAt: new Date() },
          { id: '4', text: 'Deploy app to K8s cluster', completed: false, createdAt: new Date() },
        ],
      },
    }),
    prisma.task.create({
      data: {
        text: 'Read "Clean Architecture" by Robert Martin',
        completed: true,
        boardId: personalBoard.id,
        order: 4,
        description: 'Comprehensive study of software architecture principles',
        color: '#f59e0b',
        dueDate: new Date('2025-09-30'),
        progress: 100,
        priority: 'low',
        estimatedTime: 600, // 10 hours
        actualTime: 720, // 12 hours
      },
    }),
  ]);

  // Create Tasks for Q4 Marketing Campaign Board
  const marketingTasks = await Promise.all([
    prisma.task.create({
      data: {
        text: 'Develop Campaign Strategy',
        completed: true,
        boardId: workBoard.id,
        order: 1,
        description: 'Define target audience, messaging, and channels',
        color: '#8b5cf6',
        dueDate: new Date('2025-10-05'),
        progress: 100,
        priority: 'critical',
        subtasks: [
          { id: '1', text: 'Market research', completed: true, createdAt: new Date() },
          { id: '2', text: 'Competitor analysis', completed: true, createdAt: new Date() },
          { id: '3', text: 'Define KPIs', completed: true, createdAt: new Date() },
        ],
      },
    }),
    prisma.task.create({
      data: {
        text: 'Create Campaign Content',
        completed: false,
        boardId: workBoard.id,
        order: 2,
        description: 'Blog posts, social media content, and email templates',
        color: '#3b82f6',
        dueDate: new Date('2025-10-20'),
        progress: 55,
        priority: 'high',
        estimatedTime: 2400, // 40 hours
        actualTime: 1320, // 22 hours
        subtasks: [
          { id: '1', text: 'Write 5 blog posts', completed: true, createdAt: new Date() },
          { id: '2', text: 'Design social media graphics', completed: true, createdAt: new Date() },
          { id: '3', text: 'Create email sequences', completed: false, createdAt: new Date() },
          { id: '4', text: 'Produce video content', completed: false, createdAt: new Date() },
        ],
      },
    }),
    prisma.task.create({
      data: {
        text: 'Set up Analytics Tracking',
        completed: false,
        boardId: workBoard.id,
        order: 3,
        description: 'Configure GA4, UTM parameters, and conversion tracking',
        color: '#10b981',
        dueDate: new Date('2025-10-15'),
        progress: 30,
        priority: 'high',
        subtasks: [
          { id: '1', text: 'Set up GA4 property', completed: true, createdAt: new Date() },
          { id: '2', text: 'Create UTM parameters', completed: false, createdAt: new Date() },
          { id: '3', text: 'Configure conversion events', completed: false, createdAt: new Date() },
        ],
      },
    }),
    prisma.task.create({
      data: {
        text: 'Launch Social Media Ads',
        completed: false,
        boardId: workBoard.id,
        order: 4,
        description: 'Create and launch ad campaigns on Facebook, Instagram, and LinkedIn',
        color: '#f59e0b',
        dueDate: new Date('2025-10-25'),
        progress: 10,
        priority: 'high',
        estimatedTime: 960, // 16 hours
      },
    }),
    prisma.task.create({
      data: {
        text: 'Partner with Influencers',
        completed: false,
        boardId: workBoard.id,
        order: 5,
        description: 'Identify and reach out to relevant influencers',
        color: '#ec4899',
        dueDate: new Date('2025-11-01'),
        progress: 0,
        priority: 'medium',
      },
    }),
  ]);

  // Create Tasks for Home Renovation Board
  const homeTasks = await Promise.all([
    prisma.task.create({
      data: {
        text: 'Kitchen Cabinet Installation',
        completed: false,
        boardId: homeBoard.id,
        order: 1,
        description: 'Install new custom cabinets and hardware',
        color: '#8b5cf6',
        dueDate: new Date('2025-10-22'),
        progress: 75,
        priority: 'high',
        subtasks: [
          { id: '1', text: 'Remove old cabinets', completed: true, createdAt: new Date() },
          { id: '2', text: 'Repair wall damage', completed: true, createdAt: new Date() },
          { id: '3', text: 'Install base cabinets', completed: true, createdAt: new Date() },
          { id: '4', text: 'Install wall cabinets', completed: false, createdAt: new Date() },
          { id: '5', text: 'Install hardware and doors', completed: false, createdAt: new Date() },
        ],
      },
    }),
    prisma.task.create({
      data: {
        text: 'Countertop Selection and Installation',
        completed: false,
        boardId: homeBoard.id,
        order: 2,
        description: 'Choose and install quartz countertops',
        color: '#3b82f6',
        dueDate: new Date('2025-10-28'),
        progress: 40,
        priority: 'high',
        subtasks: [
          { id: '1', text: 'Visit showroom', completed: true, createdAt: new Date() },
          { id: '2', text: 'Get quotes', completed: true, createdAt: new Date() },
          { id: '3', text: 'Schedule template', completed: false, createdAt: new Date() },
          { id: '4', text: 'Installation', completed: false, createdAt: new Date() },
        ],
      },
    }),
    prisma.task.create({
      data: {
        text: 'Bathroom Tile Work',
        completed: false,
        boardId: homeBoard.id,
        order: 3,
        description: 'Retile shower and floor with modern design',
        color: '#10b981',
        dueDate: new Date('2025-11-10'),
        progress: 0,
        priority: 'medium',
      },
    }),
    prisma.task.create({
      data: {
        text: 'Paint All Rooms',
        completed: false,
        boardId: homeBoard.id,
        order: 4,
        description: 'Fresh coat of paint throughout the house',
        color: '#f59e0b',
        dueDate: new Date('2025-11-20'),
        progress: 0,
        priority: 'low',
      },
    }),
  ]);

  // Create Tasks for Product Research Board
  const researchTasks = await Promise.all([
    prisma.task.create({
      data: {
        text: 'User Interviews - Mobile App Features',
        completed: false,
        boardId: researchBoard.id,
        order: 1,
        description: 'Conduct 15 user interviews to understand mobile needs',
        color: '#8b5cf6',
        dueDate: new Date('2025-10-18'),
        progress: 60,
        priority: 'high',
        estimatedTime: 900, // 15 hours
        actualTime: 540, // 9 hours
        subtasks: [
          { id: '1', text: 'Prepare interview script', completed: true, createdAt: new Date() },
          { id: '2', text: 'Recruit participants', completed: true, createdAt: new Date() },
          { id: '3', text: 'Conduct interviews (9/15 done)', completed: false, createdAt: new Date() },
          { id: '4', text: 'Analyze findings', completed: false, createdAt: new Date() },
        ],
        comments: [
          {
            id: '1',
            content: 'Users are really interested in offline mode. This should be a priority feature.',
            author: 'Research Team',
            createdAt: new Date('2025-10-08'),
            updatedAt: new Date('2025-10-08'),
          },
        ],
      },
    }),
    prisma.task.create({
      data: {
        text: 'Competitive Feature Analysis',
        completed: true,
        boardId: researchBoard.id,
        order: 2,
        description: 'Analyze features from top 5 competitors',
        color: '#3b82f6',
        dueDate: new Date('2025-10-05'),
        progress: 100,
        priority: 'high',
      },
    }),
    prisma.task.create({
      data: {
        text: 'A/B Test: New Onboarding Flow',
        completed: false,
        boardId: researchBoard.id,
        order: 3,
        description: 'Test new vs old onboarding with 1000 users',
        color: '#10b981',
        dueDate: new Date('2025-10-30'),
        progress: 25,
        priority: 'medium',
        subtasks: [
          { id: '1', text: 'Design experiment', completed: true, createdAt: new Date() },
          { id: '2', text: 'Set up tracking', completed: true, createdAt: new Date() },
          { id: '3', text: 'Launch test', completed: false, createdAt: new Date() },
          { id: '4', text: 'Collect data', completed: false, createdAt: new Date() },
          { id: '5', text: 'Analyze results', completed: false, createdAt: new Date() },
        ],
      },
    }),
    prisma.task.create({
      data: {
        text: 'Survey: Feature Priority Voting',
        completed: false,
        boardId: researchBoard.id,
        order: 4,
        description: 'Survey 500 users to prioritize feature requests',
        color: '#f59e0b',
        dueDate: new Date('2025-10-25'),
        progress: 0,
        priority: 'medium',
      },
    }),
  ]);

  console.log('✅ Created tasks for all boards\n');

  console.log('🎉 Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - Team Members: ${teamMembers.length}`);
  console.log(`   - Epics: ${epics.length}`);
  console.log(`   - Sprints: ${sprints.length}`);
  console.log(`   - User Stories: ${sprint15Stories.length + sprint16Stories.length + sprint17Stories.length + backlogStories.length}`);
  console.log(`   - Traditional Boards: 4`);
  console.log(`   - Tasks: ${personalTasks.length + marketingTasks.length + homeTasks.length + researchTasks.length}`);
  console.log(`   - Daily Standups: 1`);
  console.log(`   - Sprint Reviews: 1`);
  console.log(`   - Retrospectives: 1`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
