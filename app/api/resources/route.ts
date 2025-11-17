import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all resources (engineers)
export async function GET() {
  try {
    const resources = await prisma.resource.findMany({
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
      orderBy: { name: 'asc' },
    });

    // Transform to match frontend interface
    const transformedResources = resources.map((resource) => ({
      ...resource,
      pods: resource.pods.map((rp) => rp.pod),
      skills: resource.skills.map((rs) => rs.skill),
    }));

    return NextResponse.json(transformedResources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

// POST create new resource (engineer)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role, seniority, status, podIds, skills } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Check for duplicate name
    const existingName = await prisma.resource.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (existingName) {
      return NextResponse.json(
        { error: 'A resource with this name already exists' },
        { status: 409 }
      );
    }

    // Check for duplicate email if provided
    if (email && email.trim()) {
      const existingEmail = await prisma.resource.findFirst({
        where: {
          email: {
            equals: email.trim(),
            mode: 'insensitive',
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

    const resource = await prisma.resource.create({
      data: {
        name,
        email,
        role,
        seniority,
        status: status || 'active',
        pods: {
          create: podIds?.map((podId: string) => ({
            podId,
          })) || [],
        },
        skills: {
          create: skills?.map((skillId: string) => ({
            skillId,
          })) || [],
        },
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

    return NextResponse.json(transformed, { status: 201 });
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    );
  }
}
