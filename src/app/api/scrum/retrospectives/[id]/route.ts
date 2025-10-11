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

    const retrospective = await prisma.retrospective.findFirst({
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

    if (!retrospective) {
      return NextResponse.json({ error: 'Retrospective not found' }, { status: 404 });
    }

    return NextResponse.json({ retrospective });
  } catch (error) {
    console.error('Error fetching retrospective:', error);
    return NextResponse.json(
      { error: 'Failed to fetch retrospective' },
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

    const result = await prisma.retrospective.updateMany({
      where: {
        id: params.id,
        OR: [{ userId }, { guestId }].filter(Boolean),
      },
      data: {
        ...(body.wentWell !== undefined && { wentWell: body.wentWell }),
        ...(body.improve !== undefined && { improve: body.improve }),
        ...(body.actionItems !== undefined && { actionItems: body.actionItems }),
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Retrospective not found' }, { status: 404 });
    }

    const updated = await prisma.retrospective.findUnique({
      where: { id: params.id },
      include: {
        sprint: true,
      },
    });

    return NextResponse.json({ retrospective: updated });
  } catch (error) {
    console.error('Error updating retrospective:', error);
    return NextResponse.json(
      { error: 'Failed to update retrospective' },
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

    const result = await prisma.retrospective.deleteMany({
      where: {
        id: params.id,
        OR: [{ userId }, { guestId }].filter(Boolean),
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Retrospective not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting retrospective:', error);
    return NextResponse.json(
      { error: 'Failed to delete retrospective' },
      { status: 500 }
    );
  }
}
