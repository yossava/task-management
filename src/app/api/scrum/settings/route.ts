import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserIdentity } from '@/lib/api/utils';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { userId, guestId } = await getUserIdentity(session);

    let settings = await prisma.scrumSettings.findFirst({
      where: {
        OR: [
          userId ? { userId } : undefined,
          guestId ? { guestId } : undefined,
        ].filter((item): item is { userId: string } | { guestId: string } => item !== undefined),
      },
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.scrumSettings.create({
        data: {
          defaultSprintDuration: 2,
          storyPointScale: [1, 2, 3, 5, 8, 13, 21],
          workingDays: [1, 2, 3, 4, 5],
          dailyCapacity: 6,
          userId,
          guestId,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { userId, guestId } = await getUserIdentity(session);
    const body = await request.json();

    // Try to find existing settings
    const existing = await prisma.scrumSettings.findFirst({
      where: {
        OR: [
          userId ? { userId } : undefined,
          guestId ? { guestId } : undefined,
        ].filter((item): item is { userId: string } | { guestId: string } => item !== undefined),
      },
    });

    let settings;

    if (existing) {
      // Update existing settings
      settings = await prisma.scrumSettings.update({
        where: { id: existing.id },
        data: {
          ...(body.defaultSprintDuration !== undefined && { defaultSprintDuration: body.defaultSprintDuration }),
          ...(body.workingDays !== undefined && { workingDays: body.workingDays }),
          ...(body.dailyCapacity !== undefined && { dailyCapacity: body.dailyCapacity }),
          ...(body.storyPointScale !== undefined && { storyPointScale: body.storyPointScale }),
        },
      });
    } else {
      // Create new settings
      settings = await prisma.scrumSettings.create({
        data: {
          defaultSprintDuration: body.defaultSprintDuration ?? 2,
          storyPointScale: body.storyPointScale ?? [1, 2, 3, 5, 8, 13, 21],
          workingDays: body.workingDays ?? [1, 2, 3, 4, 5],
          dailyCapacity: body.dailyCapacity ?? 6,
          userId,
          guestId,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
