import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserIdentity } from '@/lib/api/utils';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { userId, guestId } = getUserIdentity(session);

    const task = await prisma.scrumTask.findFirst({
      where: {
        id: params.id,
        OR: [{ userId }, { guestId }].filter(Boolean),
      },
      include: {
        story: true,
        assignee: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error fetching scrum task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scrum task' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { userId, guestId } = getUserIdentity(session);
    const body = await request.json();

    const result = await prisma.scrumTask.updateMany({
      where: {
        id: params.id,
        OR: [{ userId }, { guestId }].filter(Boolean),
      },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.status && { status: body.status }),
        ...(body.storyId !== undefined && { storyId: body.storyId }),
        ...(body.assigneeId !== undefined && { assigneeId: body.assigneeId }),
        ...(body.estimatedHours !== undefined && { estimatedHours: body.estimatedHours }),
        ...(body.actualHours !== undefined && { actualHours: body.actualHours }),
        ...(body.labels !== undefined && { labels: body.labels }),
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const updated = await prisma.scrumTask.findUnique({
      where: { id: params.id },
      include: {
        story: true,
        assignee: true,
      },
    });

    return NextResponse.json({ task: updated });
  } catch (error) {
    console.error('Error updating scrum task:', error);
    return NextResponse.json(
      { error: 'Failed to update scrum task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { userId, guestId } = getUserIdentity(session);

    const result = await prisma.scrumTask.deleteMany({
      where: {
        id: params.id,
        OR: [{ userId }, { guestId }].filter(Boolean),
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting scrum task:', error);
    return NextResponse.json(
      { error: 'Failed to delete scrum task' },
      { status: 500 }
    );
  }
}
