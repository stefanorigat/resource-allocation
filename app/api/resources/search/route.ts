import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Search resources by name
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'active';

    const whereClause: any = {
      status,
    };

    // Search by name (first name or last name)
    if (query) {
      whereClause.name = {
        contains: query,
        mode: 'insensitive',
      };
    }

    const resources = await prisma.resource.findMany({
      where: whereClause,
      take: limit,
      orderBy: {
        name: 'asc',
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    // Transform to match frontend interface
    const transformed = resources.map((resource) => ({
      id: resource.id,
      name: resource.name,
      email: resource.email,
      role: resource.role,
      seniority: resource.seniority,
      status: resource.status,
      skills: resource.skills.map((rs) => rs.skill.name),
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error searching resources:', error);
    return NextResponse.json(
      { error: 'Failed to search resources' },
      { status: 500 }
    );
  }
}

