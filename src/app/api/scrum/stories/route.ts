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
    const sprintId = searchParams.get('sprintId');
    const epicId = searchParams.get('epicId');
    const status = searchParams.get('status');

    const stories = await prisma.userStory.findMany({
      where: {
        OR: [{ userId }, { guestId }].filter(Boolean),
        ...(sprintId && { sprintId }),
        ...(epicId && { epicId }),
        ...(status && { status }),
      },
      include: {
        tasks: true,
        assignee: true,
        sprint: true,
        epic: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ stories });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
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
      acceptanceCriteria,
      storyPoints,
      priority,
      status,
      sprintId,
      epicId,
      assigneeId,
      labels,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const story = await prisma.userStory.create({
      data: {
        title,
        description,
        acceptanceCriteria,
        storyPoints,
        priority: priority || 'medium',
        status: status || 'backlog',
        sprintId,
        epicId,
        assigneeId,
        labels: labels || [],
        userId,
        guestId,
      },
      include: {
        tasks: true,
        assignee: true,
        sprint: true,
        epic: true,
      },
    });

    return NextResponse.json({ story }, { status: 201 });
  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json(
      { error: 'Failed to create story' },
      { status: 500 }
    );
  }
}
