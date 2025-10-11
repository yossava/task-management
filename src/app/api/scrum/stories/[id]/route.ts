import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserIdentity } from '@/lib/api/utils';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    const { userId, guestId } = await getUserIdentity(session);

    const story = await prisma.userStory.findFirst({
      where: {
        id: id,
        OR: [{ userId }, { guestId }].filter(Boolean),
      },
      include: {
        tasks: {
          include: {
            assignee: true,
          },
        },
        assignee: true,
        sprint: true,
        epic: true,
      },
    });

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    return NextResponse.json({ story });
  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    const { userId, guestId } = await getUserIdentity(session);
    const body = await request.json();

    const result = await prisma.userStory.updateMany({
      where: {
        id: id,
        OR: [{ userId }, { guestId }].filter(Boolean),
      },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.acceptanceCriteria !== undefined && { acceptanceCriteria: body.acceptanceCriteria }),
        ...(body.storyPoints !== undefined && { storyPoints: body.storyPoints }),
        ...(body.priority && { priority: body.priority }),
        ...(body.status && { status: body.status }),
        ...(body.sprintId !== undefined && { sprintId: body.sprintId }),
        ...(body.epicId !== undefined && { epicId: body.epicId }),
        ...(body.assigneeId !== undefined && { assigneeId: body.assigneeId }),
        ...(body.labels !== undefined && { labels: body.labels }),
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    const updated = await prisma.userStory.findUnique({
      where: { id: id },
      include: {
        tasks: true,
        assignee: true,
        sprint: true,
        epic: true,
      },
    });

    return NextResponse.json({ story: updated });
  } catch (error) {
    console.error('Error updating story:', error);
    return NextResponse.json(
      { error: 'Failed to update story' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    const { userId, guestId } = await getUserIdentity(session);

    const result = await prisma.userStory.deleteMany({
      where: {
        id: id,
        OR: [{ userId }, { guestId }].filter(Boolean),
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json(
      { error: 'Failed to delete story' },
      { status: 500 }
    );
  }
}
