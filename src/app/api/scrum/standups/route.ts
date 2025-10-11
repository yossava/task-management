import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserIdentity } from '@/lib/api/utils';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { userId, guestId } = getUserIdentity(session);

    const { searchParams } = new URL(request.url);
    const sprintId = searchParams.get('sprintId');

    const standups = await prisma.dailyStandup.findMany({
      where: {
        OR: [{ userId }, { guestId }].filter(Boolean),
        ...(sprintId && { sprintId }),
      },
      include: {
        sprint: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json({ standups });
  } catch (error) {
    console.error('Error fetching standups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch standups' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { userId, guestId } = getUserIdentity(session);
    const body = await request.json();

    const { sprintId, date, updates } = body;

    if (!sprintId || !date) {
      return NextResponse.json(
        { error: 'Sprint ID and date are required' },
        { status: 400 }
      );
    }

    const standup = await prisma.dailyStandup.create({
      data: {
        sprintId,
        date: new Date(date),
        updates: updates || [],
        userId,
        guestId,
      },
      include: {
        sprint: true,
      },
    });

    return NextResponse.json({ standup }, { status: 201 });
  } catch (error) {
    console.error('Error creating standup:', error);
    return NextResponse.json(
      { error: 'Failed to create standup' },
      { status: 500 }
    );
  }
}
