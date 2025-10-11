import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserIdentity } from '@/lib/api/utils';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { userId, guestId } = await getUserIdentity(session);

    const members = await prisma.teamMember.findMany({
      where: {
        OR: [{ userId }, { guestId }].filter(Boolean),
      },
      include: {
        assignedStories: true,
        assignedTasks: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { userId, guestId } = await getUserIdentity(session);
    const body = await request.json();

    const { name, email, role, avatar, capacity, availability } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const member = await prisma.teamMember.create({
      data: {
        name,
        email,
        role,
        avatar,
        capacity: capacity || 8,
        availability: availability || 100,
        userId,
        guestId,
      },
      include: {
        assignedStories: true,
        assignedTasks: true,
      },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { error: 'Failed to create team member' },
      { status: 500 }
    );
  }
}
