import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH - Update an allocation
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { percentage, notes } = body;

    // Validation
    if (percentage !== undefined) {
      const p = parseFloat(percentage);
      if (isNaN(p) || p < 0 || p > 100) {
        return NextResponse.json(
          { error: 'Percentage must be between 0 and 100' },
          { status: 400 }
        );
      }
    }

    const allocation = await prisma.projectAllocation.update({
      where: { id },
      data: {
        ...(percentage !== undefined && { percentage: parseFloat(percentage) }),
        ...(notes !== undefined && { notes }),
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

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error updating allocation:', error);
    return NextResponse.json(
      { error: 'Failed to update allocation' },
      { status: 500 }
    );
  }
}

// DELETE - Remove an allocation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.projectAllocation.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Allocation deleted successfully' });
  } catch (error) {
    console.error('Error deleting allocation:', error);
    return NextResponse.json(
      { error: 'Failed to delete allocation' },
      { status: 500 }
    );
  }
}

