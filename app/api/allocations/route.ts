import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET allocations with optional year filter
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');

    const whereClause = year ? { year: parseInt(year) } : {};

    const allocations = await prisma.projectAllocation.findMany({
      where: whereClause,
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
        project: true,
      },
      orderBy: [
        { year: 'asc' },
        { month: 'asc' },
      ],
    });

    // Transform to match frontend interface
    const transformed = allocations.map((alloc) => ({
      id: alloc.id,
      resourceId: alloc.resource.id,
      resourceName: alloc.resource.name,
      resourceRole: alloc.resource.role,
      resourceSeniority: alloc.resource.seniority,
      projectId: alloc.project.id,
      projectName: alloc.project.name,
      percentage: alloc.percentage,
      month: alloc.month,
      year: alloc.year,
      notes: alloc.notes,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error fetching allocations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch allocations' },
      { status: 500 }
    );
  }
}

// POST - Create a new allocation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resourceId, projectId, percentage, month, year, notes } = body;

    // Validation
    if (!resourceId || !projectId) {
      return NextResponse.json(
        { error: 'Resource ID and Project ID are required' },
        { status: 400 }
      );
    }

    if (percentage !== undefined) {
      const p = parseFloat(percentage);
      if (isNaN(p) || p < 0 || p > 100) {
        return NextResponse.json(
          { error: 'Percentage must be between 0 and 100' },
          { status: 400 }
        );
      }
    }

    if (!month || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Month must be between 1 and 12' },
        { status: 400 }
      );
    }

    // Create allocation
    const allocation = await prisma.projectAllocation.create({
      data: {
        resourceId,
        projectId,
        percentage: percentage ? parseFloat(percentage) : 0,
        month: parseInt(month),
        year: parseInt(year),
        notes: notes || null,
      },
      include: {
        resource: true,
        project: true,
      },
    });

    // Transform to match frontend interface
    const transformed = {
      id: allocation.id,
      resourceId: allocation.resource.id,
      resourceName: allocation.resource.name,
      resourceRole: allocation.resource.role,
      resourceSeniority: allocation.resource.seniority,
      projectId: allocation.project.id,
      projectName: allocation.project.name,
      percentage: allocation.percentage,
      month: allocation.month,
      year: allocation.year,
      notes: allocation.notes,
    };

    return NextResponse.json(transformed, { status: 201 });
  } catch (error) {
    console.error('Error creating allocation:', error);
    return NextResponse.json(
      { error: 'Failed to create allocation' },
      { status: 500 }
    );
  }
}

