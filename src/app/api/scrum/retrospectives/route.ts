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

    const retrospectives = await prisma.retrospective.findMany({
      where: {
        OR: [{ userId }, { guestId }].filter(Boolean),
        ...(sprintId && { sprintId }),
      },
      include: {
        sprint: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ retrospectives });
  } catch (error) {
    console.error('Error fetching retrospectives:', error);
    return NextResponse.json(
      { error: 'Failed to fetch retrospectives' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { userId, guestId } = await getUserIdentity(session);
    const body = await request.json();

    const { sprintId, date, wentWell, improve, actionItems } = body;

    if (!sprintId) {
      return NextResponse.json(
        { error: 'Sprint ID is required' },
        { status: 400 }
      );
    }

    const retrospective = await prisma.retrospective.create({
      data: {
        sprintId,
        date: date ? new Date(date) : new Date(),
        wentWell: wentWell || [],
        improve: improve || [],
        actionItems: actionItems || [],
        userId,
        guestId,
      },
      include: {
        sprint: true,
      },
    });

    return NextResponse.json({ retrospective }, { status: 201 });
  } catch (error) {
    console.error('Error creating retrospective:', error);
    return NextResponse.json(
      { error: 'Failed to create retrospective' },
      { status: 500 }
    );
  }
}
