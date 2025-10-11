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

    const reviews = await prisma.sprintReview.findMany({
      where: {
        OR: [{ userId }, { guestId }].filter(Boolean),
        ...(sprintId && { sprintId }),
      },
      include: {
        sprint: {
          include: {
            stories: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { userId, guestId } = getUserIdentity(session);
    const body = await request.json();

    const { sprintId, date, completed, demos, feedback } = body;

    if (!sprintId || !date) {
      return NextResponse.json(
        { error: 'Sprint ID and date are required' },
        { status: 400 }
      );
    }

    const review = await prisma.sprintReview.create({
      data: {
        sprintId,
        date: new Date(date),
        completed: completed || [],
        demos: demos || [],
        feedback: feedback || [],
        userId,
        guestId,
      },
      include: {
        sprint: {
          include: {
            stories: true,
          },
        },
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
