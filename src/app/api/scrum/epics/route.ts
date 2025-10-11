import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserIdentity } from '@/lib/api/utils';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { userId, guestId } = getUserIdentity(session);

    const epics = await prisma.epic.findMany({
      where: {
        OR: [{ userId }, { guestId }].filter(Boolean),
      },
      include: {
        stories: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ epics });
  } catch (error) {
    console.error('Error fetching epics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch epics' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { userId, guestId } = getUserIdentity(session);
    const body = await request.json();

    const { title, description, color, status, startDate, targetDate } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const epic = await prisma.epic.create({
      data: {
        title,
        description,
        color: color || '#8b5cf6',
        status: status || 'active',
        startDate: startDate ? new Date(startDate) : null,
        targetDate: targetDate ? new Date(targetDate) : null,
        userId,
        guestId,
      },
      include: {
        stories: true,
      },
    });

    return NextResponse.json({ epic }, { status: 201 });
  } catch (error) {
    console.error('Error creating epic:', error);
    return NextResponse.json(
      { error: 'Failed to create epic' },
      { status: 500 }
    );
  }
}
