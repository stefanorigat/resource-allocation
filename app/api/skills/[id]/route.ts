import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH - Update a skill
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, category } = body;

    // Check if skill exists
    const existing = await prisma.skill.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    // If changing name, check if new name already exists
    if (name && name !== existing.name) {
      const nameExists = await prisma.skill.findUnique({
        where: { name },
      });

      if (nameExists) {
        return NextResponse.json(
          { error: 'A skill with this name already exists' },
          { status: 400 }
        );
      }
    }

    const skill = await prisma.skill.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category }),
      },
    });

    return NextResponse.json(skill);
  } catch (error) {
    console.error('Error updating skill:', error);
    return NextResponse.json(
      { error: 'Failed to update skill' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a skill with foreign key validation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if skill exists
    const skill = await prisma.skill.findUnique({
      where: { id },
    });

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    // Check if any resources have this skill
    const resourcesWithSkill = await prisma.resourceSkill.count({
      where: {
        skillId: id,
      },
    });

    if (resourcesWithSkill > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete skill "${skill.name}" because it is assigned to ${resourcesWithSkill} engineer(s). Please remove it from their profiles first.`,
          count: resourcesWithSkill 
        },
        { status: 400 }
      );
    }

    await prisma.skill.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Error deleting skill:', error);
    return NextResponse.json(
      { error: 'Failed to delete skill' },
      { status: 500 }
    );
  }
}

