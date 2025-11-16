import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all pods (teams)
export async function GET() {
  try {
    const pods = await prisma.pod.findMany({
      include: {
        members: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const transformedPods = pods.map((pod) => ({
      ...pod,
      memberCount: pod._count.members,
      members: pod.members.map((member) => ({
        ...member,
        skills: member.skills.map((rs) => rs.skill),
      })),
    }));

    return NextResponse.json(transformedPods);
  } catch (error) {
    console.error('Error fetching pods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pods' },
      { status: 500 }
    );
  }
}

// POST create new pod (team)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, status } = body;

    const pod = await prisma.pod.create({
      data: {
        name,
        description,
        status: status || 'active',
      },
      include: {
        members: {
          include: {
            skills: {
              include: {
                skill: true,
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
      members: pod.members.map((member) => ({
        ...member,
        skills: member.skills.map((rs) => rs.skill),
      })),
    };

    return NextResponse.json(transformed, { status: 201 });
  } catch (error) {
    console.error('Error creating pod:', error);
    return NextResponse.json(
      { error: 'Failed to create pod' },
      { status: 500 }
    );
  }
}
