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

    const review = await prisma.sprintReview.findFirst({
      where: {
        id: id,
        OR: [{ userId }, { guestId }].filter(Boolean),
      },
      include: {
        sprint: {
          include: {
            stories: {
              include: {
                tasks: true,
              },
            },
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review' },
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

    const result = await prisma.sprintReview.updateMany({
      where: {
        id: id,
        OR: [{ userId }, { guestId }].filter(Boolean),
      },
      data: {
        ...(body.date && { date: new Date(body.date) }),
        ...(body.completed !== undefined && { completed: body.completed }),
        ...(body.demos !== undefined && { demos: body.demos }),
        ...(body.feedback !== undefined && { feedback: body.feedback }),
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const updated = await prisma.sprintReview.findUnique({
      where: { id: id },
      include: {
        sprint: {
          include: {
            stories: true,
          },
        },
      },
    });

    return NextResponse.json({ review: updated });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
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

    const result = await prisma.sprintReview.deleteMany({
      where: {
        id: id,
        OR: [{ userId }, { guestId }].filter(Boolean),
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
