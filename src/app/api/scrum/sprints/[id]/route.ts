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

    const sprint = await prisma.sprint.findFirst({
      where: {
        id: params.id,
        OR: [{ userId }, { guestId }].filter(Boolean),
      },
      include: {
        stories: {
          include: {
            tasks: true,
            assignee: true,
          },
        },
        retrospectives: true,
        reviews: true,
        standups: true,
      },
    });

    if (!sprint) {
      return NextResponse.json(
        { error: 'Sprint not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ sprint });
  } catch (error) {
    console.error('Error fetching sprint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sprint' },
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

    const { name, goal, startDate, endDate, status, commitment, velocity } = body;

    const sprint = await prisma.sprint.updateMany({
      where: {
        id: params.id,
        OR: [{ userId }, { guestId }].filter(Boolean),
      },
      data: {
        ...(name && { name }),
        ...(goal !== undefined && { goal }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(status && { status }),
        ...(commitment !== undefined && { commitment }),
        ...(velocity !== undefined && { velocity }),
      },
    });

    if (sprint.count === 0) {
      return NextResponse.json(
        { error: 'Sprint not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.sprint.findUnique({
      where: { id: params.id },
      include: {
        stories: true,
        retrospectives: true,
        reviews: true,
        standups: true,
      },
    });

    return NextResponse.json({ sprint: updated });
  } catch (error) {
    console.error('Error updating sprint:', error);
    return NextResponse.json(
      { error: 'Failed to update sprint' },
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

    const result = await prisma.sprint.deleteMany({
      where: {
        id: params.id,
        OR: [{ userId }, { guestId }].filter(Boolean),
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Sprint not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sprint:', error);
    return NextResponse.json(
      { error: 'Failed to delete sprint' },
      { status: 500 }
    );
  }
}
