import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to get working days in a month (excluding weekends)
function getWorkingDaysInMonth(month: number, year: number): number {
  const daysInMonth = new Date(year, month, 0).getDate();
  let workingDays = 0;
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    // Exclude Saturdays (6) and Sundays (0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }
  
  return workingDays;
}

// Calculate Man Days from allocation percentage
function calculateManDays(percentage: number, month: number, year: number): number {
  const workingDays = getWorkingDaysInMonth(month, year);
  return (percentage / 100) * workingDays;
}

// GET budget status for all projects
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        allocations: {
          include: {
            resource: true,
          },
        },
      },
    });

    const budgetData = projects.map((project) => {
      const budgetManDays = project.budgetManDays ?? 0;
      const consumedManDays = project.consumedManDays ?? 0;
      
      // Calculate allocated Man Days from allocations
      const allocatedManDays = project.allocations.reduce((total, allocation) => {
        const manDays = calculateManDays(
          allocation.percentage,
          allocation.month,
          allocation.year
        );
        return total + manDays;
      }, 0);

      const remainingManDays = budgetManDays - consumedManDays;
      const percentageUsed = budgetManDays > 0 
        ? (consumedManDays / budgetManDays) * 100 
        : 0;

      // Determine status based on consumed vs budget
      let status: 'on-track' | 'at-risk' | 'over-budget';
      if (percentageUsed > 100) {
        status = 'over-budget';
      } else if (percentageUsed >= 80) {
        status = 'at-risk';
      } else {
        status = 'on-track';
      }

      return {
        projectId: project.id,
        projectName: project.name,
        projectStatus: project.status,
        owner: project.owner,
        budgetManDays: Math.round(budgetManDays * 10) / 10,
        allocatedManDays: Math.round(allocatedManDays * 10) / 10,
        consumedManDays: Math.round(consumedManDays * 10) / 10,
        remainingManDays: Math.round(remainingManDays * 10) / 10,
        percentageUsed: Math.round(percentageUsed * 10) / 10,
        status,
        startDate: project.startDate,
        endDate: project.endDate,
        allocationCount: project.allocations.length,
      };
    });

    // Sort by status priority (over-budget first, then at-risk, then on-track)
    const statusPriority = { 'over-budget': 0, 'at-risk': 1, 'on-track': 2 };
    budgetData.sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);

    return NextResponse.json(budgetData);
  } catch (error) {
    console.error('Error fetching budget data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget data' },
      { status: 500 }
    );
  }
}

