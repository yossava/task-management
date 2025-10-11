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

    const standup = await prisma.dailyStandup.findFirst({
      where: {
        id: params.id,
        OR: [{ userId }, { guestId }].filter(Boolean),
      },
      include: {
        sprint: {
          include: {
            stories: true,
          },
        },
      },
    });

    if (!standup) {
      return NextResponse.json({ error: 'Standup not found' }, { status: 404 });
    }

    return NextResponse.json({ standup });
  } catch (error) {
    console.error('Error fetching standup:', error);
    return NextResponse.json(
      { error: 'Failed to fetch standup' },
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

    const result = await prisma.dailyStandup.updateMany({
      where: {
        id: params.id,
        OR: [{ userId }, { guestId }].filter(Boolean),
      },
      data: {
        ...(body.date && { date: new Date(body.date) }),
        ...(body.updates !== undefined && { updates: body.updates }),
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Standup not found' }, { status: 404 });
    }

    const updated = await prisma.dailyStandup.findUnique({
      where: { id: params.id },
      include: {
        sprint: true,
      },
    });

    return NextResponse.json({ standup: updated });
  } catch (error) {
    console.error('Error updating standup:', error);
    return NextResponse.json(
      { error: 'Failed to update standup' },
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

    const result = await prisma.dailyStandup.deleteMany({
      where: {
        id: params.id,
        OR: [{ userId }, { guestId }].filter(Boolean),
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Standup not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting standup:', error);
    return NextResponse.json(
      { error: 'Failed to delete standup' },
      { status: 500 }
    );
  }
}
