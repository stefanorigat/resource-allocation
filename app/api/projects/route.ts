import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all projects
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        pods: {
          include: {
            pod: true,
          },
        },
        allocations: {
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
          orderBy: [{ year: 'asc' }, { month: 'asc' }],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to match frontend interface
    const transformedProjects = projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description || '',
      owner: project.owner,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      budgetManDays: project.budgetManDays || 0,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
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
    }));

    return NextResponse.json(transformedProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, owner, status, startDate, endDate, budgetManDays, pods, allocations } = body;

    // Validation: Planned projects cannot have a start date in the past
    if (status === 'planned' && startDate) {
      const start = new Date(startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to beginning of day
      
      if (start < today) {
        return NextResponse.json(
          { error: 'Planned projects cannot have a start date in the past' },
          { status: 400 }
        );
      }
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        owner,
        status,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        budgetManDays: budgetManDays ? parseFloat(budgetManDays) : 0,
        pods: {
          create: pods?.map((podId: string) => ({
            podId,
          })) || [],
        },
        allocations: {
          create: allocations?.map((alloc: any) => ({
            resourceId: alloc.resourceId,
            percentage: parseInt(alloc.percentage),
            month: parseInt(alloc.month),
            year: parseInt(alloc.year),
            notes: alloc.notes || null,
          })) || [],
        },
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

    return NextResponse.json(transformed, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
