import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        pods: {
          include: {
            pod: true,
          },
        },
        allocations: {
          include: {
            resource: true,
          },
          orderBy: [{ year: 'asc' }, { month: 'asc' }],
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const transformed = {
      ...project,
      pods: project.pods.map((pp) => pp.pod.id),
      allocations: project.allocations.map((alloc) => ({
        id: alloc.id,
        resourceId: alloc.resource.id,
        resourceName: alloc.resource.name,
        projectId: project.id,
        projectName: project.name,
        percentage: alloc.percentage,
        month: alloc.month,
        year: alloc.year,
        notes: alloc.notes,
      })),
    };

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PATCH update project
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, owner, status, startDate, endDate, budgetManDays, pods, allocations } = body;

    // Get existing project to check current status
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Determine the effective status and startDate for validation
    const effectiveStatus = status !== undefined ? status : existingProject.status;
    const effectiveStartDate = startDate !== undefined ? startDate : existingProject.startDate;

    // Validation: Planned projects cannot have a start date in the past
    if (effectiveStatus === 'planned' && effectiveStartDate) {
      const start = new Date(effectiveStartDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to beginning of day
      
      if (start < today) {
        return NextResponse.json(
          { error: 'Planned projects cannot have a start date in the past' },
          { status: 400 }
        );
      }
    }

    // Delete existing relations if they're being updated
    if (pods !== undefined) {
      await prisma.projectPod.deleteMany({
        where: { projectId: id },
      });
    }

    if (allocations !== undefined) {
      await prisma.projectAllocation.deleteMany({
        where: { projectId: id },
      });
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(owner !== undefined && { owner }),
        ...(status !== undefined && { status }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(budgetManDays !== undefined && { budgetManDays: parseFloat(budgetManDays) || 0 }),
        ...(pods !== undefined && {
          pods: {
            create: pods.map((podId: string) => ({
              podId,
            })),
          },
        }),
        ...(allocations !== undefined && {
          allocations: {
            create: allocations.map((alloc: any) => ({
              resourceId: alloc.resourceId,
              percentage: parseInt(alloc.percentage),
              month: parseInt(alloc.month),
              year: parseInt(alloc.year),
              notes: alloc.notes || null,
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
        allocations: {
          include: {
            resource: true,
          },
        },
      },
    });

    const transformed = {
      ...project,
      pods: project.pods.map((pp) => pp.pod.id),
      allocations: project.allocations.map((alloc) => ({
        id: alloc.id,
        resourceId: alloc.resource.id,
        resourceName: alloc.resource.name,
        projectId: project.id,
        projectName: project.name,
        percentage: alloc.percentage,
        month: alloc.month,
        year: alloc.year,
        notes: alloc.notes,
      })),
    };

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
