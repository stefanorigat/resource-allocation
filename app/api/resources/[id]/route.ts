import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single resource
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        pods: {
          include: {
            pod: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        allocations: {
          include: {
            project: true,
          },
          orderBy: [{ year: 'asc' }, { month: 'asc' }],
        },
      },
    });

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    const transformed = {
      ...resource,
      pods: resource.pods.map((rp) => rp.pod),
      skills: resource.skills.map((rs) => rs.skill),
    };

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error fetching resource:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    );
  }
}

// PATCH update resource
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, role, seniority, status, podIds, skills } = body;

    // Validate name if provided
    if (name !== undefined && (!name || !name.trim())) {
      return NextResponse.json(
        { error: 'Name cannot be empty' },
        { status: 400 }
      );
    }

    // Check for duplicate name (excluding current resource)
    if (name !== undefined && name.trim()) {
      const existingName = await prisma.resource.findFirst({
        where: {
          name: {
            equals: name.trim(),
            mode: 'insensitive',
          },
          NOT: {
            id,
          },
        },
      });

      if (existingName) {
        return NextResponse.json(
          { error: 'A resource with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Check for duplicate email if provided (excluding current resource)
    if (email !== undefined && email && email.trim()) {
      const existingEmail = await prisma.resource.findFirst({
        where: {
          email: {
            equals: email.trim(),
            mode: 'insensitive',
          },
          NOT: {
            id,
          },
        },
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: 'A resource with this email already exists' },
          { status: 409 }
        );
      }
    }

    // If skills are being updated, delete existing and create new ones
    if (skills !== undefined) {
      await prisma.resourceSkill.deleteMany({
        where: { resourceId: id },
      });
    }

    // If pods are being updated, delete existing and create new ones
    if (podIds !== undefined) {
      await prisma.resourcePod.deleteMany({
        where: { resourceId: id },
      });
    }

    const resource = await prisma.resource.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(role !== undefined && { role }),
        ...(seniority !== undefined && { seniority }),
        ...(status !== undefined && { status }),
        ...(podIds !== undefined && {
          pods: {
            create: podIds.map((podId: string) => ({
              podId,
            })),
          },
        }),
        ...(skills !== undefined && {
          skills: {
            create: skills.map((skillId: string) => ({
              skillId,
            })),
          },
        }),
      },
      include: {
        pods: {
          include: {
            pod: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    const transformed = {
      ...resource,
      pods: resource.pods.map((rp) => rp.pod),
      skills: resource.skills.map((rs) => rs.skill),
    };

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error updating resource:', error);
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    );
  }
}

// DELETE resource
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.resource.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    );
  }
}
