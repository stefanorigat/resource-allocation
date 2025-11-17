import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single pod
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pod = await prisma.pod.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            resource: {
              include: {
                skills: {
                  include: {
                    skill: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: { members: true },
        },
      },
    });

    if (!pod) {
      return NextResponse.json({ error: 'Pod not found' }, { status: 404 });
    }

    const transformed = {
      ...pod,
      memberCount: pod._count.members,
      members: pod.members.map((rp) => ({
        ...rp.resource,
        skills: rp.resource.skills.map((rs) => rs.skill),
      })),
    };

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error fetching pod:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pod' },
      { status: 500 }
    );
  }
}

// PATCH update pod
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, status } = body;

    const pod = await prisma.pod.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
      },
      include: {
        members: {
          include: {
            resource: {
              include: {
                skills: {
                  include: {
                    skill: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: { members: true },
        },
      },
    });

    const transformed = {
      ...pod,
      memberCount: pod._count.members,
      members: pod.members.map((rp) => ({
        ...rp.resource,
        skills: rp.resource.skills.map((rs) => rs.skill),
      })),
    };

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error updating pod:', error);
    return NextResponse.json(
      { error: 'Failed to update pod' },
      { status: 500 }
    );
  }
}

// DELETE pod
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.pod.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting pod:', error);
    return NextResponse.json(
      { error: 'Failed to delete pod' },
      { status: 500 }
    );
  }
}
