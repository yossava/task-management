import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserIdentity } from '@/lib/api/utils';

interface LocalStorageData {
  sprints?: any[];
  epics?: any[];
  stories?: any[];
  tasks?: any[];
  members?: any[];
  retrospectives?: any[];
  standups?: any[];
  reviews?: any[];
  settings?: any;
}

/**
 * Migration endpoint to transfer localStorage data to MongoDB
 * POST /api/scrum/migrate
 *
 * Expects body: {
 *   sprints: Sprint[],
 *   epics: Epic[],
 *   stories: UserStory[],
 *   tasks: Task[],
 *   members: TeamMember[],
 *   retrospectives: Retrospective[],
 *   standups: DailyStandup[],
 *   reviews: SprintReview[],
 *   settings: ScrumSettings
 * }
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { userId, guestId } = await getUserIdentity(session);
    const data: LocalStorageData = await request.json();

    const results = {
      sprints: 0,
      epics: 0,
      stories: 0,
      tasks: 0,
      members: 0,
      retrospectives: 0,
      standups: 0,
      reviews: 0,
      settings: false,
    };

    // Migrate Sprints
    if (data.sprints && Array.isArray(data.sprints)) {
      for (const sprint of data.sprints) {
        try {
          await prisma.sprint.create({
            data: {
              name: sprint.name,
              goal: sprint.goal,
              startDate: new Date(sprint.startDate),
              endDate: new Date(sprint.endDate),
              status: sprint.status || 'planning',
              commitment: sprint.commitment || 0,
              velocity: sprint.velocity || 0,
              userId,
              guestId,
            },
          });
          results.sprints++;
        } catch (error) {
          console.error('Error migrating sprint:', error);
        }
      }
    }

    // Migrate Epics
    if (data.epics && Array.isArray(data.epics)) {
      for (const epic of data.epics) {
        try {
          await prisma.epic.create({
            data: {
              title: epic.title,
              description: epic.description,
              color: epic.color || '#8b5cf6',
              status: epic.status || 'active',
              progress: epic.progress || 0,
              startDate: epic.startDate ? new Date(epic.startDate) : null,
              targetDate: epic.targetDate ? new Date(epic.targetDate) : null,
              userId,
              guestId,
            },
          });
          results.epics++;
        } catch (error) {
          console.error('Error migrating epic:', error);
        }
      }
    }

    // Migrate Team Members first (needed for stories/tasks)
    const memberIdMap = new Map<string, string>();
    if (data.members && Array.isArray(data.members)) {
      for (const member of data.members) {
        try {
          const created = await prisma.teamMember.create({
            data: {
              name: member.name,
              email: member.email,
              role: member.role,
              avatar: member.avatar,
              capacity: member.capacity || 40,
              availability: member.availability || 100,
              userId,
              guestId,
            },
          });
          memberIdMap.set(member.id, created.id);
          results.members++;
        } catch (error) {
          console.error('Error migrating team member:', error);
        }
      }
    }

    // Get migrated sprints and epics for ID mapping
    const migratedSprints = await prisma.sprint.findMany({
      where: { OR: [{ userId }, { guestId }].filter(Boolean) },
    });
    const migratedEpics = await prisma.epic.findMany({
      where: { OR: [{ userId }, { guestId }].filter(Boolean) },
    });

    const sprintMap = new Map(migratedSprints.map(s => [s.name, s.id]));
    const epicMap = new Map(migratedEpics.map(e => [e.title, e.id]));

    // Migrate Stories
    const storyIdMap = new Map<string, string>();
    if (data.stories && Array.isArray(data.stories)) {
      for (const story of data.stories) {
        try {
          // Find sprint by name match
          const sprintId = story.sprintId && migratedSprints.find(s =>
            data.sprints?.find(ls => ls.id === story.sprintId && ls.name === s.name)
          )?.id;

          // Find epic by title match
          const epicId = story.epicId && migratedEpics.find(e =>
            data.epics?.find(le => le.id === story.epicId && le.title === e.title)
          )?.id;

          // Find assignee by name match
          const assigneeId = story.assigneeId && memberIdMap.get(story.assigneeId);

          const created = await prisma.userStory.create({
            data: {
              title: story.title,
              description: story.description,
              acceptanceCriteria: story.acceptanceCriteria,
              storyPoints: story.storyPoints,
              priority: story.priority || 'medium',
              status: story.status || 'backlog',
              sprintId: sprintId || null,
              epicId: epicId || null,
              assigneeId: assigneeId || null,
              labels: story.labels || [],
              userId,
              guestId,
            },
          });
          storyIdMap.set(story.id, created.id);
          results.stories++;
        } catch (error) {
          console.error('Error migrating story:', error);
        }
      }
    }

    // Migrate Tasks
    if (data.tasks && Array.isArray(data.tasks)) {
      for (const task of data.tasks) {
        try {
          const storyId = task.storyId && storyIdMap.get(task.storyId);
          const assigneeId = task.assigneeId && memberIdMap.get(task.assigneeId);

          await prisma.scrumTask.create({
            data: {
              title: task.title,
              description: task.description,
              storyId: storyId || null,
              assigneeId: assigneeId || null,
              status: task.status || 'todo',
              estimatedHours: task.estimatedHours,
              actualHours: task.actualHours,
              userId,
              guestId,
            },
          });
          results.tasks++;
        } catch (error) {
          console.error('Error migrating task:', error);
        }
      }
    }

    // Migrate Retrospectives
    if (data.retrospectives && Array.isArray(data.retrospectives)) {
      for (const retro of data.retrospectives) {
        try {
          const sprintId = migratedSprints.find(s =>
            data.sprints?.find(ls => ls.id === retro.sprintId && ls.name === s.name)
          )?.id;

          if (sprintId) {
            await prisma.retrospective.create({
              data: {
                sprintId,
                date: retro.date ? new Date(retro.date) : new Date(),
                wentWell: retro.wentWell || [],
                improve: retro.improve || [],
                actionItems: retro.actionItems || [],
                userId,
                guestId,
              },
            });
            results.retrospectives++;
          }
        } catch (error) {
          console.error('Error migrating retrospective:', error);
        }
      }
    }

    // Migrate Daily Standups
    if (data.standups && Array.isArray(data.standups)) {
      for (const standup of data.standups) {
        try {
          const sprintId = migratedSprints.find(s =>
            data.sprints?.find(ls => ls.id === standup.sprintId && ls.name === s.name)
          )?.id;

          if (sprintId) {
            await prisma.dailyStandup.create({
              data: {
                sprintId,
                date: new Date(standup.date),
                updates: standup.updates || [],
                userId,
                guestId,
              },
            });
            results.standups++;
          }
        } catch (error) {
          console.error('Error migrating standup:', error);
        }
      }
    }

    // Migrate Sprint Reviews
    if (data.reviews && Array.isArray(data.reviews)) {
      for (const review of data.reviews) {
        try {
          const sprintId = migratedSprints.find(s =>
            data.sprints?.find(ls => ls.id === review.sprintId && ls.name === s.name)
          )?.id;

          if (sprintId) {
            await prisma.sprintReview.create({
              data: {
                sprintId,
                date: new Date(review.date),
                completedStories: review.completedStories || review.completed || [],
                incompleteStories: review.incompleteStories || [],
                demos: review.demos || [],
                feedback: review.feedback,
                userId,
                guestId,
              },
            });
            results.reviews++;
          }
        } catch (error) {
          console.error('Error migrating review:', error);
        }
      }
    }

    // Migrate Settings
    if (data.settings) {
      try {
        await prisma.scrumSettings.create({
          data: {
            defaultSprintDuration: data.settings.defaultSprintDuration || 2,
            storyPointScale: data.settings.storyPointScale || [1, 2, 3, 5, 8, 13, 21],
            workingDays: data.settings.workingDays || [1, 2, 3, 4, 5],
            dailyCapacity: data.settings.dailyCapacity || 6,
            userId,
            guestId,
          },
        });
        results.settings = true;
      } catch (error) {
        console.error('Error migrating settings:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      results,
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to migrate data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
