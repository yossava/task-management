import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserIdentity } from '@/lib/api/utils';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { userId, guestId } = await getUserIdentity(session);

    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get('storyId');
    const status = searchParams.get('status');

    const tasks = await prisma.scrumTask.findMany({
      where: {
        OR: [{ userId }, { guestId }].filter(Boolean),
        ...(storyId && { storyId }),
        ...(status && { status }),
      },
      include: {
        story: true,
        assignee: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching scrum tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scrum tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { userId, guestId } = await getUserIdentity(session);
    const body = await request.json();

    const {
      title,
      description,
      storyId,
      assigneeId,
      status,
      estimatedHours,
      actualHours,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const task = await prisma.scrumTask.create({
      data: {
        title,
        description,
        storyId,
        assigneeId,
        status: status || 'todo',
        estimatedHours,
        actualHours,
        userId,
        guestId,
      },
      include: {
        story: true,
        assignee: true,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Error creating scrum task:', error);
    return NextResponse.json(
      { error: 'Failed to create scrum task' },
      { status: 500 }
    );
  }
}
