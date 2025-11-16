import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('Cleaning existing data...');
  await prisma.projectAllocation.deleteMany();
  await prisma.projectPod.deleteMany();
  await prisma.resourceSkill.deleteMany();
  await prisma.project.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.pod.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.role.deleteMany();

  // Create Roles
  console.log('Creating roles...');
  const roles = await Promise.all([
    prisma.role.create({ 
      data: { 
        name: 'Developer', 
        description: 'Software developer responsible for writing and maintaining code' 
      } 
    }),
    prisma.role.create({ 
      data: { 
        name: 'Senior Developer', 
        description: 'Experienced developer with advanced technical skills and mentorship responsibilities' 
      } 
    }),
    prisma.role.create({ 
      data: { 
        name: 'Team Lead', 
        description: 'Technical leader managing a development team' 
      } 
    }),
    prisma.role.create({ 
      data: { 
        name: 'Tech Lead', 
        description: 'Technical architect and principal engineer for a project or area' 
      } 
    }),
    prisma.role.create({ 
      data: { 
        name: 'Engineering Manager', 
        description: 'Manager responsible for team performance and people management' 
      } 
    }),
    prisma.role.create({ 
      data: { 
        name: 'Architect', 
        description: 'Senior technical leader defining system architecture and technical strategy' 
      } 
    }),
    prisma.role.create({ 
      data: { 
        name: 'Principal Engineer', 
        description: 'Distinguished technical expert providing technical leadership across the organization' 
      } 
    }),
  ]);

  console.log(`✅ Created ${roles.length} roles`);

  // Create Skills/Programming Languages
  console.log('Creating skills...');
  const skills = await Promise.all([
    prisma.skill.create({ data: { name: 'JavaScript', category: 'Programming Language' } }),
    prisma.skill.create({ data: { name: 'TypeScript', category: 'Programming Language' } }),
    prisma.skill.create({ data: { name: 'Python', category: 'Programming Language' } }),
    prisma.skill.create({ data: { name: 'Java', category: 'Programming Language' } }),
    prisma.skill.create({ data: { name: 'Go', category: 'Programming Language' } }),
    prisma.skill.create({ data: { name: 'React', category: 'Framework' } }),
    prisma.skill.create({ data: { name: 'Node.js', category: 'Framework' } }),
    prisma.skill.create({ data: { name: 'Django', category: 'Framework' } }),
    prisma.skill.create({ data: { name: 'Spring Boot', category: 'Framework' } }),
    prisma.skill.create({ data: { name: 'PostgreSQL', category: 'Database' } }),
    prisma.skill.create({ data: { name: 'MongoDB', category: 'Database' } }),
    prisma.skill.create({ data: { name: 'AWS', category: 'Cloud Platform' } }),
    prisma.skill.create({ data: { name: 'Docker', category: 'Tool' } }),
    prisma.skill.create({ data: { name: 'Kubernetes', category: 'Tool' } }),
  ]);

  console.log(`✅ Created ${skills.length} skills`);

  // Create Pods/Teams
  console.log('Creating pods/teams...');
  const pod1 = await prisma.pod.create({
    data: {
      name: 'Team 01 - Frontend',
      description: 'Frontend development team',
      status: 'active',
    },
  });

  const pod2 = await prisma.pod.create({
    data: {
      name: 'Team 02 - Backend',
      description: 'Backend API development team',
      status: 'active',
    },
  });

  const pod3 = await prisma.pod.create({
    data: {
      name: 'Team 03 - Platform',
      description: 'Platform and infrastructure team',
      status: 'active',
    },
  });

  console.log('✅ Created 3 pods/teams');

  // Create Resources (Engineers)
  console.log('Creating resources (engineers)...');
  
  const resource1 = await prisma.resource.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice.johnson@company.com',
      role: 'Senior Developer',
      seniority: 'Senior',
      status: 'active',
      podId: pod1.id,
      skills: {
        create: [
          { skillId: skills[0].id }, // JavaScript
          { skillId: skills[1].id }, // TypeScript
          { skillId: skills[5].id }, // React
        ],
      },
    },
  });

  const resource2 = await prisma.resource.create({
    data: {
      name: 'Bob Smith',
      email: 'bob.smith@company.com',
      role: 'Team Lead',
      seniority: 'Staff',
      status: 'active',
      podId: pod1.id,
      skills: {
        create: [
          { skillId: skills[0].id }, // JavaScript
          { skillId: skills[1].id }, // TypeScript
          { skillId: skills[5].id }, // React
          { skillId: skills[6].id }, // Node.js
        ],
      },
    },
  });

  const resource3 = await prisma.resource.create({
    data: {
      name: 'Carol Davis',
      email: 'carol.davis@company.com',
      role: 'Developer',
      seniority: 'Mid-Level',
      status: 'active',
      podId: pod1.id,
      skills: {
        create: [
          { skillId: skills[0].id }, // JavaScript
          { skillId: skills[5].id }, // React
        ],
      },
    },
  });

  const resource4 = await prisma.resource.create({
    data: {
      name: 'David Wilson',
      email: 'david.wilson@company.com',
      role: 'Tech Lead',
      seniority: 'Principal',
      status: 'active',
      podId: pod2.id,
      skills: {
        create: [
          { skillId: skills[2].id }, // Python
          { skillId: skills[7].id }, // Django
          { skillId: skills[9].id }, // PostgreSQL
          { skillId: skills[11].id }, // AWS
        ],
      },
    },
  });

  const resource5 = await prisma.resource.create({
    data: {
      name: 'Emma Martinez',
      email: 'emma.martinez@company.com',
      role: 'Senior Developer',
      seniority: 'Senior',
      status: 'active',
      podId: pod2.id,
      skills: {
        create: [
          { skillId: skills[3].id }, // Java
          { skillId: skills[8].id }, // Spring Boot
          { skillId: skills[9].id }, // PostgreSQL
        ],
      },
    },
  });

  const resource6 = await prisma.resource.create({
    data: {
      name: 'Frank Brown',
      email: 'frank.brown@company.com',
      role: 'Developer',
      seniority: 'Junior',
      status: 'active',
      podId: pod2.id,
      skills: {
        create: [
          { skillId: skills[2].id }, // Python
          { skillId: skills[9].id }, // PostgreSQL
        ],
      },
    },
  });

  const resource7 = await prisma.resource.create({
    data: {
      name: 'Grace Lee',
      email: 'grace.lee@company.com',
      role: 'Engineering Manager',
      seniority: 'Principal',
      status: 'active',
      podId: pod3.id,
      skills: {
        create: [
          { skillId: skills[4].id }, // Go
          { skillId: skills[11].id }, // AWS
          { skillId: skills[12].id }, // Docker
          { skillId: skills[13].id }, // Kubernetes
        ],
      },
    },
  });

  const resource8 = await prisma.resource.create({
    data: {
      name: 'Henry Taylor',
      email: 'henry.taylor@company.com',
      role: 'Senior Developer',
      seniority: 'Senior',
      status: 'active',
      podId: pod3.id,
      skills: {
        create: [
          { skillId: skills[4].id }, // Go
          { skillId: skills[12].id }, // Docker
          { skillId: skills[13].id }, // Kubernetes
        ],
      },
    },
  });

  console.log('✅ Created 8 engineers');

  // Create Projects
  console.log('Creating projects...');
  const project1 = await prisma.project.create({
    data: {
      name: 'E-Commerce Platform Redesign',
      description: 'Complete redesign of the customer-facing e-commerce platform',
      owner: 'Sarah Chen',
      status: 'active',
      startDate: new Date('2025-11-01'),
      endDate: new Date('2026-06-30'),
      pods: {
        create: [{ podId: pod1.id }, { podId: pod2.id }],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App Development',
      description: 'New mobile application for iOS and Android',
      owner: 'Michael Zhang',
      status: 'active',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      pods: {
        create: [{ podId: pod1.id }],
      },
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Infrastructure Migration',
      description: 'Migrate services to cloud infrastructure',
      owner: 'Grace Lee',
      status: 'active',
      startDate: new Date('2025-12-01'),
      endDate: new Date('2026-03-31'),
      pods: {
        create: [{ podId: pod3.id }],
      },
    },
  });

  console.log('✅ Created 3 projects');

  // Create Project Allocations (time-based, monthly)
  console.log('Creating project allocations...');
  
  const currentYear = 2026;
  const allocations = [];

  // Project 1 allocations (Jan-Jun 2026)
  for (let month = 1; month <= 6; month++) {
    allocations.push(
      // Alice - 75% on Project 1
      prisma.projectAllocation.create({
        data: {
          resourceId: resource1.id,
          projectId: project1.id,
          percentage: 75,
          month,
          year: currentYear,
          notes: 'Frontend development lead',
        },
      }),
      // Bob - 50% on Project 1
      prisma.projectAllocation.create({
        data: {
          resourceId: resource2.id,
          projectId: project1.id,
          percentage: 50,
          month,
          year: currentYear,
          notes: 'Technical oversight and architecture',
        },
      }),
      // Carol - 100% on Project 1
      prisma.projectAllocation.create({
        data: {
          resourceId: resource3.id,
          projectId: project1.id,
          percentage: 100,
          month,
          year: currentYear,
        },
      }),
      // David - 60% on Project 1
      prisma.projectAllocation.create({
        data: {
          resourceId: resource4.id,
          projectId: project1.id,
          percentage: 60,
          month,
          year: currentYear,
          notes: 'Backend API development',
        },
      }),
      // Emma - 80% on Project 1
      prisma.projectAllocation.create({
        data: {
          resourceId: resource5.id,
          projectId: project1.id,
          percentage: 80,
          month,
          year: currentYear,
        },
      })
    );
  }

  // Project 2 allocations (Jan-Dec 2026)
  for (let month = 1; month <= 12; month++) {
    allocations.push(
      // Alice - 25% on Project 2 (remaining capacity)
      prisma.projectAllocation.create({
        data: {
          resourceId: resource1.id,
          projectId: project2.id,
          percentage: 25,
          month,
          year: currentYear,
          notes: 'Mobile UI consulting',
        },
      }),
      // Bob - 50% on Project 2
      prisma.projectAllocation.create({
        data: {
          resourceId: resource2.id,
          projectId: project2.id,
          percentage: 50,
          month,
          year: currentYear,
          notes: 'Project technical lead',
        },
      })
    );
  }

  // Project 3 allocations (Dec 2025 - Mar 2026)
  for (let month = 1; month <= 3; month++) {
    allocations.push(
      // Grace - 100% on Project 3
      prisma.projectAllocation.create({
        data: {
          resourceId: resource7.id,
          projectId: project3.id,
          percentage: 100,
          month,
          year: currentYear,
          notes: 'Project manager and technical lead',
        },
      }),
      // Henry - 100% on Project 3
      prisma.projectAllocation.create({
        data: {
          resourceId: resource8.id,
          projectId: project3.id,
          percentage: 100,
          month,
          year: currentYear,
          notes: 'Infrastructure migration execution',
        },
      })
    );
  }

  await Promise.all(allocations);

  console.log(`✅ Created ${allocations.length} project allocations`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('\nSummary:');
  console.log(`- ${roles.length} roles`);
  console.log(`- ${skills.length} skills/technologies`);
  console.log('- 3 pods/teams');
  console.log('- 8 engineers (resources)');
  console.log('- 3 projects');
  console.log(`- ${allocations.length} monthly allocations`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
