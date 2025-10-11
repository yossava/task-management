import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserIdentity } from '@/lib/api/utils';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { userId, guestId } = getUserIdentity(session);

    let settings = await prisma.scrumSettings.findFirst({
      where: {
        OR: [
          userId ? { userId } : null,
          guestId ? { guestId } : null,
        ].filter(Boolean),
      },
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.scrumSettings.create({
        data: {
          sprintDuration: 14,
          workingDaysPerWeek: 5,
          hoursPerDay: 8,
          velocityTracking: true,
          burndownChart: true,
          storyPointScale: [1, 2, 3, 5, 8, 13, 21],
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
    const { userId, guestId } = getUserIdentity(session);
    const body = await request.json();

    // Try to find existing settings
    const existing = await prisma.scrumSettings.findFirst({
      where: {
        OR: [
          userId ? { userId } : null,
          guestId ? { guestId } : null,
        ].filter(Boolean),
      },
    });

    let settings;

    if (existing) {
      // Update existing settings
      settings = await prisma.scrumSettings.update({
        where: { id: existing.id },
        data: {
          ...(body.sprintDuration !== undefined && { sprintDuration: body.sprintDuration }),
          ...(body.workingDaysPerWeek !== undefined && { workingDaysPerWeek: body.workingDaysPerWeek }),
          ...(body.hoursPerDay !== undefined && { hoursPerDay: body.hoursPerDay }),
          ...(body.velocityTracking !== undefined && { velocityTracking: body.velocityTracking }),
          ...(body.burndownChart !== undefined && { burndownChart: body.burndownChart }),
          ...(body.storyPointScale !== undefined && { storyPointScale: body.storyPointScale }),
        },
      });
    } else {
      // Create new settings
      settings = await prisma.scrumSettings.create({
        data: {
          sprintDuration: body.sprintDuration ?? 14,
          workingDaysPerWeek: body.workingDaysPerWeek ?? 5,
          hoursPerDay: body.hoursPerDay ?? 8,
          velocityTracking: body.velocityTracking ?? true,
          burndownChart: body.burndownChart ?? true,
          storyPointScale: body.storyPointScale ?? [1, 2, 3, 5, 8, 13, 21],
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
