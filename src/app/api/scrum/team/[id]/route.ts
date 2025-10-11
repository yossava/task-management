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

    const member = await prisma.teamMember.findFirst({
      where: {
        id: id,
        OR: [{ userId }, { guestId }].filter(Boolean),
      },
      include: {
        assignedStories: {
          include: {
            sprint: true,
            epic: true,
          },
        },
        assignedTasks: {
          include: {
            story: true,
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    return NextResponse.json({ member });
  } catch (error) {
    console.error('Error fetching team member:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team member' },
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

    const result = await prisma.teamMember.updateMany({
      where: {
        id: id,
        OR: [{ userId }, { guestId }].filter(Boolean),
      },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.role !== undefined && { role: body.role }),
        ...(body.avatar !== undefined && { avatar: body.avatar }),
        ...(body.capacity !== undefined && { capacity: body.capacity }),
        ...(body.availability !== undefined && { availability: body.availability }),
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    const updated = await prisma.teamMember.findUnique({
      where: { id: id },
      include: {
        assignedStories: true,
        assignedTasks: true,
      },
    });

    return NextResponse.json({ member: updated });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: 'Failed to update team member' },
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

    const result = await prisma.teamMember.deleteMany({
      where: {
        id: id,
        OR: [{ userId }, { guestId }].filter(Boolean),
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json(
      { error: 'Failed to delete team member' },
      { status: 500 }
    );
  }
}
