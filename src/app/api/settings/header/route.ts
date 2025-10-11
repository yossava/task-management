import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/utils/session';
import { getOrCreateGuestId } from '@/lib/utils/guest';
import { z } from 'zod';

const updateHeaderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string(),
});

// GET /api/settings/header - Get page header
export async function GET() {
  try {
    const userId = await getCurrentUserId();

    let header;
    if (userId) {
      header = await prisma.pageHeader.findFirst({
        where: { userId },
      });

      if (!header) {
        // Create default header for user
        header = await prisma.pageHeader.create({
          data: {
            userId,
            title: 'Your Boards',
            subtitle: 'Organize and manage all your projects in one place',
          },
        });
      }
    } else {
      const guestId = await getOrCreateGuestId();
      header = await prisma.pageHeader.findUnique({
        where: { guestId },
      });

      if (!header) {
        // Create default header for guest
        header = await prisma.pageHeader.create({
          data: {
            guestId,
            title: 'Your Boards',
            subtitle: 'Organize and manage all your projects in one place',
          },
        });
      }
    }

    return NextResponse.json({ header });
  } catch (error) {
    console.error('Error fetching header:', error);
    return NextResponse.json(
      { error: 'Failed to fetch header' },
      { status: 500 }
    );
  }
}

// PATCH /api/settings/header - Update page header
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const validatedData = updateHeaderSchema.parse(body);

    const userId = await getCurrentUserId();

    let header;
    if (userId) {
      // Find existing header
      const existing = await prisma.pageHeader.findFirst({
        where: { userId },
      });

      if (existing) {
        // Update existing
        header = await prisma.pageHeader.update({
          where: { id: existing.id },
          data: validatedData,
        });
      } else {
        // Create new
        header = await prisma.pageHeader.create({
          data: {
            ...validatedData,
            userId,
          },
        });
      }
    } else {
      const guestId = await getOrCreateGuestId();
      // Update or create for guest
      header = await prisma.pageHeader.upsert({
        where: { guestId },
        update: validatedData,
        create: {
          ...validatedData,
          guestId,
        },
      });
    }

    return NextResponse.json({ header });
  } catch (error) {
    console.error('Error updating header:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update header' },
      { status: 500 }
    );
  }
}
