import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserIdentity } from '@/lib/api/utils';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    const { userId, guestId } = await getUserIdentity(session);

    const epic = await prisma.epic.findFirst({
      where: {
        id: id,
        OR: [{ userId }, { guestId }].filter(Boolean),
      },
      include: {
        stories: {
          include: {
            tasks: true,
            assignee: true,
          },
        },
      },
    });

    if (!epic) {
      return NextResponse.json({ error: 'Epic not found' }, { status: 404 });
    }

    return NextResponse.json({ epic });
  } catch (error) {
    console.error('Error fetching epic:', error);
    return NextResponse.json(
      { error: 'Failed to fetch epic' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    const { userId, guestId } = await getUserIdentity(session);
    const body = await request.json();

    const { title, description, color, status, progress, startDate, targetDate } = body;

    const result = await prisma.epic.updateMany({
      where: {
        id: id,
        OR: [{ userId }, { guestId }].filter(Boolean),
      },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
        ...(status && { status }),
        ...(progress !== undefined && { progress }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(targetDate !== undefined && { targetDate: targetDate ? new Date(targetDate) : null }),
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Epic not found' }, { status: 404 });
    }

    const updated = await prisma.epic.findUnique({
      where: { id: id },
      include: { stories: true },
    });

    return NextResponse.json({ epic: updated });
  } catch (error) {
    console.error('Error updating epic:', error);
    return NextResponse.json(
      { error: 'Failed to update epic' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    const { userId, guestId } = await getUserIdentity(session);

    const result = await prisma.epic.deleteMany({
      where: {
        id: id,
        OR: [{ userId }, { guestId }].filter(Boolean),
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Epic not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting epic:', error);
    return NextResponse.json(
      { error: 'Failed to delete epic' },
      { status: 500 }
    );
  }
}
