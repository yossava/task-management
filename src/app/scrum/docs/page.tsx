'use client';

import { useState } from 'react';
import ScrumLayout from '@/components/scrum/ScrumLayout';

export default function ScrumDocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      subsections: [
        { id: 'overview', title: 'Overview' },
        { id: 'quick-setup', title: 'Quick Setup' },
        { id: 'first-sprint', title: 'Creating Your First Sprint' },
      ],
    },
    {
      id: 'scrum-basics',
      title: 'Scrum Basics',
      icon: '📚',
      subsections: [
        { id: 'what-is-scrum', title: 'What is Scrum?' },
        { id: 'scrum-roles', title: 'Scrum Roles' },
        { id: 'scrum-events', title: 'Scrum Events' },
        { id: 'scrum-artifacts', title: 'Scrum Artifacts' },
      ],
    },
    {
      id: 'concepts',
      title: 'Core Concepts',
      icon: '🎯',
      subsections: [
        { id: 'user-stories', title: 'User Stories' },
        { id: 'epics', title: 'Epics' },
        { id: 'sprints', title: 'Sprints' },
        { id: 'product-backlog', title: 'Product Backlog' },
        { id: 'sprint-backlog', title: 'Sprint Backlog' },
        { id: 'story-points', title: 'Story Points' },
        { id: 'velocity', title: 'Velocity' },
      ],
    },
    {
      id: 'workflows',
      title: 'Workflows',
      icon: '🔄',
      subsections: [
        { id: 'team-setup', title: 'Setting Up Your Team' },
        { id: 'creating-stories', title: 'Creating User Stories' },
        { id: 'sprint-planning', title: 'Sprint Planning' },
        { id: 'daily-standup', title: 'Daily Standup' },
        { id: 'sprint-review', title: 'Sprint Review' },
        { id: 'retrospective', title: 'Retrospective' },
      ],
    },
    {
      id: 'features',
      title: 'Features',
      icon: '✨',
      subsections: [
        { id: 'sprint-board', title: 'Sprint Board' },
        { id: 'planning-poker', title: 'Planning Poker' },
        { id: 'metrics-analytics', title: 'Metrics & Analytics' },
        { id: 'burndown-charts', title: 'Burndown Charts' },
        { id: 'velocity-tracking', title: 'Velocity Tracking' },
        { id: 'release-planning', title: 'Release Planning' },
      ],
    },
    {
      id: 'best-practices',
      title: 'Best Practices',
      icon: '💡',
      subsections: [
        { id: 'story-writing', title: 'Writing Good Stories' },
        { id: 'estimation', title: 'Estimation Tips' },
        { id: 'sprint-goals', title: 'Defining Sprint Goals' },
        { id: 'team-collaboration', title: 'Team Collaboration' },
      ],
    },
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <ScrumLayout>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Documentation Sidebar */}
        <aside className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto sticky top-0 h-screen">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Documentation
            </h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search docs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <nav className="p-4">
            {sections.map((section) => (
              <div key={section.id} className="mb-4">
                <button
                  onClick={() => scrollToSection(section.id)}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <span>{section.icon}</span>
                  <span>{section.title}</span>
                </button>
                <div className="ml-8 mt-1 space-y-1">
                  {section.subsections.map((subsection) => (
                    <button
                      key={subsection.id}
                      onClick={() => scrollToSection(subsection.id)}
                      className={`block w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        activeSection === subsection.id
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {subsection.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Documentation Content */}
        <main className="flex-1 max-w-4xl mx-auto px-8 py-12">
          <DocumentationContent />
        </main>
      </div>
    </ScrumLayout>
  );
}

function DocumentationContent() {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Getting Started */}
      <section id="getting-started" className="mb-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Scrum Portal Documentation
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Complete guide to using the Scrum portal for agile project management
        </p>

        <div id="overview" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Overview</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Welcome to the Scrum Portal - your comprehensive tool for managing agile software development projects.
            This platform implements the Scrum framework, enabling teams to plan sprints, track progress, and
            collaborate effectively.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">Key Features</h3>
            <ul className="text-blue-800 dark:text-blue-300 space-y-2">
              <li>Sprint planning and management</li>
              <li>User story tracking with epics</li>
              <li>Interactive sprint board</li>
              <li>Planning poker for estimation</li>
              <li>Daily standup tracking</li>
              <li>Sprint reviews and retrospectives</li>
              <li>Advanced metrics and analytics</li>
              <li>Release planning</li>
            </ul>
          </div>
        </div>

        <div id="quick-setup" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Setup</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Follow these steps to get started with the Scrum portal:
          </p>
          <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300 mb-4">
            <li>
              <strong>Set up your team:</strong> Navigate to the Dashboard and click on "Team" tab. Add team members
              with their roles and capacity.
            </li>
            <li>
              <strong>Create epics:</strong> Go to Product Backlog and create epics to organize your user stories into
              larger initiatives.
            </li>
            <li>
              <strong>Add user stories:</strong> Create user stories in your product backlog with descriptions,
              acceptance criteria, and story points.
            </li>
            <li>
              <strong>Plan your first sprint:</strong> Go to Sprint Planning, select stories from the backlog, and
              start your sprint.
            </li>
            <li>
              <strong>Track progress:</strong> Use the Sprint Board to move stories through different stages and track
              your team's progress.
            </li>
          </ol>
        </div>

        <div id="first-sprint" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Creating Your First Sprint
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            A sprint is a time-boxed period (typically 1-4 weeks) where your team commits to completing a set of user
            stories.
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Steps to Create a Sprint:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Navigate to Sprint Planning from the sidebar</li>
              <li>Click "Create New Sprint"</li>
              <li>Enter sprint name (e.g., "Sprint 1" or "July Sprint")</li>
              <li>Define the sprint goal</li>
              <li>Set start and end dates</li>
              <li>Select user stories from the backlog to include</li>
              <li>Ensure total story points don't exceed team capacity</li>
              <li>Click "Start Sprint"</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Scrum Basics */}
      <section id="scrum-basics" className="mb-16">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Scrum Basics</h1>

        <div id="what-is-scrum" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What is Scrum?</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Scrum is an agile framework for managing complex projects. It emphasizes iterative progress, team
            collaboration, and continuous improvement. The framework is built on three pillars:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Transparency</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All work and progress are visible to everyone on the team
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Inspection</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Regular checking of progress and artifacts to detect problems
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Adaptation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Adjusting process and work based on inspection findings
              </p>
            </div>
          </div>
        </div>

        <div id="scrum-roles" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Scrum Roles</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Product Owner
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Responsible for maximizing product value. Manages the product backlog, prioritizes features, and
                ensures the team understands requirements.
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Scrum Master</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Facilitates the Scrum process and removes impediments. Coaches the team on agile practices and ensures
                Scrum ceremonies run smoothly.
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Development Team
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Cross-functional professionals who deliver the product increment. Self-organizing and responsible for
                estimating and completing work.
              </p>
            </div>
          </div>
        </div>

        <div id="scrum-events" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Scrum Events</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Scrum uses five key events to create regularity and minimize the need for other meetings:
          </p>
          <div className="space-y-4">
            <EventCard
              title="Sprint"
              duration="1-4 weeks"
              description="A time-boxed period where work is completed and made ready for review"
            />
            <EventCard
              title="Sprint Planning"
              duration="2-8 hours"
              description="Team selects work from the backlog and creates a plan for the sprint"
            />
            <EventCard
              title="Daily Standup"
              duration="15 minutes"
              description="Daily sync where team members share progress, plans, and blockers"
            />
            <EventCard
              title="Sprint Review"
              duration="1-4 hours"
              description="Team demonstrates completed work to stakeholders and gathers feedback"
            />
            <EventCard
              title="Sprint Retrospective"
              duration="1-3 hours"
              description="Team reflects on the sprint and identifies improvements for the next one"
            />
          </div>
        </div>

        <div id="scrum-artifacts" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Scrum Artifacts</h2>
          <div className="space-y-4">
            <ArtifactCard
              title="Product Backlog"
              icon="📋"
              description="Ordered list of everything needed in the product. Managed by the Product Owner."
            />
            <ArtifactCard
              title="Sprint Backlog"
              icon="📝"
              description="Set of product backlog items selected for the sprint, plus a plan for delivering them."
            />
            <ArtifactCard
              title="Increment"
              icon="📦"
              description="The sum of all completed product backlog items during a sprint and previous sprints."
            />
          </div>
        </div>
      </section>

      {/* Core Concepts */}
      <section id="concepts" className="mb-16">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Core Concepts</h1>

        <div id="user-stories" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">User Stories</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            User stories are short descriptions of features from the end-user's perspective. They follow the format:
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-4">
            <p className="text-gray-900 dark:text-white font-mono">
              "As a [type of user], I want [goal] so that [benefit]"
            </p>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            <strong>Example:</strong> "As a team member, I want to view sprint burndown charts so that I can track our
            progress toward the sprint goal."
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">Story Components:</h3>
            <ul className="text-blue-800 dark:text-blue-300 space-y-2">
              <li><strong>Title:</strong> Brief summary of the feature</li>
              <li><strong>Description:</strong> Detailed explanation of what's needed</li>
              <li><strong>Acceptance Criteria:</strong> Conditions that must be met for the story to be complete</li>
              <li><strong>Story Points:</strong> Estimation of effort/complexity</li>
              <li><strong>Priority:</strong> Importance level (Critical, High, Medium, Low)</li>
              <li><strong>Type:</strong> Feature, Bug, Technical, or Spike</li>
            </ul>
          </div>
        </div>

        <div id="epics" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Epics</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Epics are large bodies of work that can be broken down into multiple user stories. They represent major
            features or initiatives that span multiple sprints.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            <strong>Example:</strong> An epic titled "User Authentication System" might contain stories for login,
            registration, password reset, and social media integration.
          </p>
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300 mb-2">Using Epics:</h3>
            <ul className="text-purple-800 dark:text-purple-300 space-y-2">
              <li>Group related stories together</li>
              <li>Track progress on large initiatives</li>
              <li>Organize backlog by major themes</li>
              <li>Plan releases around epic completion</li>
            </ul>
          </div>
        </div>

        <div id="sprints" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sprints</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Sprints are fixed time periods (typically 1-4 weeks) during which the team works to complete a set of user
            stories. Each sprint has a specific goal and deliverable increment.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">Sprint Properties:</h3>
              <ul className="text-gray-700 dark:text-gray-300 space-y-1 text-sm">
                <li>• Name and goal</li>
                <li>• Start and end dates</li>
                <li>• Team capacity</li>
                <li>• Committed story points</li>
                <li>• Status (Planned, Active, Completed)</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">Sprint Lifecycle:</h3>
              <ul className="text-gray-700 dark:text-gray-300 space-y-1 text-sm">
                <li>1. Planning</li>
                <li>2. Daily execution</li>
                <li>3. Review</li>
                <li>4. Retrospective</li>
                <li>5. Repeat</li>
              </ul>
            </div>
          </div>
        </div>

        <div id="product-backlog" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product Backlog</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The product backlog is a prioritized list of all features, enhancements, fixes, and technical work needed
            for the product. It's a living document that evolves as you learn more about the product and market.
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
              Backlog Management:
            </h3>
            <ul className="text-yellow-800 dark:text-yellow-300 space-y-2">
              <li>• Product Owner owns and prioritizes the backlog</li>
              <li>• Items at the top should be more detailed and refined</li>
              <li>• Regularly groom and refine backlog items</li>
              <li>• Add new items as requirements emerge</li>
            </ul>
          </div>
        </div>

        <div id="sprint-backlog" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sprint Backlog</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The sprint backlog contains all items selected from the product backlog for the current sprint, along with
            the team's plan for completing them. It's owned by the development team and updated daily.
          </p>
        </div>

        <div id="story-points" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Story Points</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Story points are a unit of measure for expressing the effort required to complete a user story. They
            represent complexity, uncertainty, and effort combined - not just time.
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Common Point Scales:
            </h3>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p><strong>Fibonacci:</strong> 1, 2, 3, 5, 8, 13, 21 (Most common)</p>
              <p><strong>T-Shirt:</strong> XS, S, M, L, XL, XXL</p>
              <p><strong>Powers of 2:</strong> 1, 2, 4, 8, 16</p>
            </div>
          </div>
        </div>

        <div id="velocity" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Velocity</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Velocity is the amount of work (in story points) a team completes during a sprint. It's calculated by
            summing the points of all fully completed stories.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Track velocity over multiple sprints to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Predict future capacity</li>
            <li>Identify team performance trends</li>
            <li>Plan sprint commitments realistically</li>
            <li>Forecast release dates</li>
          </ul>
        </div>
      </section>

      {/* Workflows */}
      <section id="workflows" className="mb-16">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Workflows</h1>

        <div id="team-setup" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Setting Up Your Team</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Before starting work, configure your team with members and their capacities:
          </p>
          <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
            <li>Navigate to Dashboard → Team tab</li>
            <li>Click "Add Team Member"</li>
            <li>Enter member details: name, email, role, and capacity (story points per sprint)</li>
            <li>Set availability percentage if someone is part-time or has other commitments</li>
            <li>Add skills to help with smart assignment</li>
            <li>Repeat for all team members</li>
          </ol>
        </div>

        <div id="creating-stories" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Creating User Stories</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Follow these steps to create well-defined user stories:
          </p>
          <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300 mb-4">
            <li>Go to Product Backlog</li>
            <li>Click "New Story"</li>
            <li>Write a clear title using the user story format</li>
            <li>Add detailed description</li>
            <li>Define acceptance criteria (what must be true for the story to be complete)</li>
            <li>Assign to an epic if applicable</li>
            <li>Set priority and type</li>
            <li>Use Planning Poker to estimate story points with the team</li>
            <li>Add labels for categorization</li>
            <li>Save the story to the backlog</li>
          </ol>
        </div>

        <div id="sprint-planning" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sprint Planning</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Sprint planning is where the team decides what to work on during the upcoming sprint:
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">Planning Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-300">
              <li>Product Owner presents top priority items from backlog</li>
              <li>Team discusses each story and asks clarifying questions</li>
              <li>Team estimates stories (if not already estimated)</li>
              <li>Create a sprint goal (what should be accomplished)</li>
              <li>Select stories to include based on team capacity</li>
              <li>Team commits to completing selected stories</li>
              <li>Start the sprint</li>
            </ol>
          </div>
        </div>

        <div id="daily-standup" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Daily Standup</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            A 15-minute daily sync where each team member answers three questions:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">1. Yesterday</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">What did I complete yesterday?</p>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">2. Today</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">What will I work on today?</p>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">3. Blockers</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">What's blocking my progress?</p>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            Use the Daily Standup page to record updates and track blockers across the sprint.
          </p>
        </div>

        <div id="sprint-review" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sprint Review</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            At the end of each sprint, the team demonstrates completed work to stakeholders. This is an opportunity to
            gather feedback and adapt the backlog.
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-2">Review Agenda:</h3>
            <ul className="text-green-800 dark:text-green-300 space-y-2">
              <li>• Scrum Master opens and sets context</li>
              <li>• Product Owner reviews sprint goal and what was completed</li>
              <li>• Team demonstrates each completed story</li>
              <li>• Stakeholders provide feedback</li>
              <li>• Product Owner discusses backlog and potential next steps</li>
              <li>• Team discusses timelines and release dates</li>
            </ul>
          </div>
        </div>

        <div id="retrospective" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Retrospective</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The retrospective is where the team reflects on the sprint and identifies improvements. It's focused on
            process, not product.
          </p>
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 mb-4">
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300 mb-3">
              Common Formats:
            </h3>
            <div className="space-y-3 text-purple-800 dark:text-purple-300">
              <div>
                <strong>Start, Stop, Continue:</strong> What should we start doing, stop doing, and continue doing?
              </div>
              <div>
                <strong>Mad, Sad, Glad:</strong> What made us mad, sad, or glad during the sprint?
              </div>
              <div>
                <strong>4 L's:</strong> What did we Love, Loathe, Learn, and Long for?
              </div>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            Always conclude with action items assigned to specific team members for the next sprint.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mb-16">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Features</h1>

        <div id="sprint-board" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sprint Board</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The Sprint Board provides a visual representation of work in progress. Stories move through columns
            representing different stages:
          </p>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <ColumnBadge label="To Do" color="gray" />
            <ColumnBadge label="In Progress" color="blue" />
            <ColumnBadge label="Review" color="yellow" />
            <ColumnBadge label="Testing" color="orange" />
            <ColumnBadge label="Done" color="green" />
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            Drag and drop stories between columns to update their status. Filter by assignee, epic, or label to focus
            on specific work.
          </p>
        </div>

        <div id="planning-poker" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Planning Poker</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Planning Poker is a consensus-based estimation technique. Team members simultaneously reveal their estimates
            to avoid anchoring bias.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Product Owner presents a user story</li>
            <li>Team discusses and asks questions</li>
            <li>Each member privately selects their estimate</li>
            <li>All estimates are revealed simultaneously</li>
            <li>Discuss differences (especially highest and lowest)</li>
            <li>Re-estimate until consensus is reached</li>
            <li>Record final estimate on the story</li>
          </ol>
        </div>

        <div id="metrics-analytics" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Metrics & Analytics</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Track team performance and sprint health with comprehensive metrics:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetricCard
              title="Burndown Chart"
              description="Visualize remaining work over time in the sprint"
            />
            <MetricCard
              title="Velocity Chart"
              description="Track story points completed per sprint"
            />
            <MetricCard
              title="Cumulative Flow"
              description="See work distribution across stages"
            />
            <MetricCard
              title="Cycle Time"
              description="Measure time from start to completion"
            />
          </div>
        </div>

        <div id="burndown-charts" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Burndown Charts</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Burndown charts show remaining work (story points) over the course of a sprint. The ideal line shows the
            expected progress, while the actual line shows real progress.
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
              Interpreting Burndown:
            </h3>
            <ul className="text-yellow-800 dark:text-yellow-300 space-y-2">
              <li>• Line below ideal = Ahead of schedule</li>
              <li>• Line above ideal = Behind schedule</li>
              <li>• Flat line = No progress (investigate blockers)</li>
              <li>• Upward spike = Scope increase</li>
            </ul>
          </div>
        </div>

        <div id="velocity-tracking" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Velocity Tracking</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The Velocity Chart displays story points completed in each sprint, helping you:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Understand team capacity trends</li>
            <li>Identify sprint overcommitment or undercommitment</li>
            <li>Predict how many sprints needed for a release</li>
            <li>Spot process improvements (increasing velocity)</li>
          </ul>
        </div>

        <div id="release-planning" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Release Planning</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Plan major releases by grouping multiple sprints and epics together. Track progress toward release goals and
            adjust scope based on velocity.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Navigate to Releases to create and manage release plans, assign epics, and track overall progress.
          </p>
        </div>
      </section>

      {/* Best Practices */}
      <section id="best-practices" className="mb-16">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Best Practices</h1>

        <div id="story-writing" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Writing Good Stories</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Use the INVEST criteria to write effective user stories:
          </p>
          <div className="space-y-3">
            <InvestCard letter="I" term="Independent" description="Story can be developed independently" />
            <InvestCard letter="N" term="Negotiable" description="Details can be discussed and refined" />
            <InvestCard letter="V" term="Valuable" description="Provides clear value to users" />
            <InvestCard letter="E" term="Estimable" description="Team can estimate the effort" />
            <InvestCard letter="S" term="Small" description="Can be completed within a sprint" />
            <InvestCard letter="T" term="Testable" description="Has clear acceptance criteria" />
          </div>
        </div>

        <div id="estimation" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Estimation Tips</h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <ul className="text-blue-800 dark:text-blue-300 space-y-3">
              <li>
                <strong>Use relative sizing:</strong> Compare stories to each other rather than estimating absolute
                time
              </li>
              <li>
                <strong>Include all work:</strong> Account for coding, testing, documentation, and code review
              </li>
              <li>
                <strong>Avoid overthinking:</strong> First instinct is often correct; don't debate for too long
              </li>
              <li>
                <strong>Re-estimate when needed:</strong> If story details change significantly, re-estimate
              </li>
              <li>
                <strong>Track and learn:</strong> Compare estimates to actuals to improve over time
              </li>
            </ul>
          </div>
        </div>

        <div id="sprint-goals" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Defining Sprint Goals</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            A good sprint goal is a short statement that describes what the team plans to achieve. It provides focus and
            helps with decision-making during the sprint.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-2">Bad Examples:</h3>
              <ul className="text-red-800 dark:text-red-300 space-y-1 text-sm">
                <li>• "Complete 40 story points"</li>
                <li>• "Finish all the stories"</li>
                <li>• "Work on the backlog"</li>
              </ul>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-2">Good Examples:</h3>
              <ul className="text-green-800 dark:text-green-300 space-y-1 text-sm">
                <li>• "Enable users to create and share boards"</li>
                <li>• "Complete the checkout flow"</li>
                <li>• "Improve page load time by 50%"</li>
              </ul>
            </div>
          </div>
        </div>

        <div id="team-collaboration" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Team Collaboration</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Communication</h3>
              <p>
                Use story comments for discussions, mention team members with @name, and document decisions directly on
                stories.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Transparency</h3>
              <p>
                Keep the board updated in real-time. Move stories to the correct status immediately when circumstances
                change.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Pair Programming</h3>
              <p>
                Assign multiple team members to complex stories. This improves code quality and knowledge sharing.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Continuous Improvement</h3>
              <p>
                Take retrospective action items seriously. Implement at least one improvement each sprint and track the
                results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Help & Support */}
      <section className="mb-16">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Need More Help?</h1>
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Additional Resources</h2>
          <div className="space-y-3">
            <p>
              <strong>Scrum Guide:</strong> The official Scrum Guide from Scrum.org provides the definitive framework
              definition
            </p>
            <p>
              <strong>Agile Manifesto:</strong> Learn the principles and values behind the agile movement
            </p>
            <p>
              <strong>Team Training:</strong> Consider Scrum certification training for your team members
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Helper Components
function EventCard({
  title,
  duration,
  description,
}: {
  title: string;
  duration: string;
  description: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
          {duration}
        </span>
      </div>
      <p className="text-gray-700 dark:text-gray-300 text-sm">{description}</p>
    </div>
  );
}

function ArtifactCard({
  title,
  icon,
  description,
}: {
  title: string;
  icon: string;
  description: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-start gap-4">
      <span className="text-3xl flex-shrink-0">{icon}</span>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
        <p className="text-gray-700 dark:text-gray-300 text-sm">{description}</p>
      </div>
    </div>
  );
}

function ColumnBadge({ label, color }: { label: string; color: string }) {
  const colorClasses = {
    gray: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  };

  return (
    <div
      className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
        colorClasses[color as keyof typeof colorClasses]
      }`}
    >
      {label}
    </div>
  );
}

function MetricCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

function InvestCard({
  letter,
  term,
  description,
}: {
  letter: string;
  term: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
        <span className="text-blue-700 dark:text-blue-300 font-bold text-lg">{letter}</span>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{term}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
}
