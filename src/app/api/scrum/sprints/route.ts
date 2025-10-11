import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserIdentity } from '@/lib/api/utils';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { userId, guestId } = await getUserIdentity(session);

    const sprints = await prisma.sprint.findMany({
      where: {
        OR: [
          { userId },
          { guestId },
        ].filter(Boolean),
      },
      include: {
        stories: true,
        retrospectives: true,
        reviews: true,
        standups: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return NextResponse.json({ sprints });
  } catch (error) {
    console.error('Error fetching sprints:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sprints' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { userId, guestId } = await getUserIdentity(session);
    const body = await request.json();

    const { name, goal, startDate, endDate, commitment, status } = body;

    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sprint = await prisma.sprint.create({
      data: {
        name,
        goal,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        commitment: commitment || 0,
        status: status || 'planning',
        userId,
        guestId,
      },
      include: {
        stories: true,
        retrospectives: true,
        reviews: true,
        standups: true,
      },
    });

    return NextResponse.json({ sprint }, { status: 201 });
  } catch (error) {
    console.error('Error creating sprint:', error);
    return NextResponse.json(
      { error: 'Failed to create sprint' },
      { status: 500 }
    );
  }
}
