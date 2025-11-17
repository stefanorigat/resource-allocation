// People/Engineers (Resources)
export interface Resource {
  id: string;
  name: string;
  email?: string;
  role: string; // Developer, Team Lead, Tech Lead, Engineering Manager, etc.
  seniority: string; // Junior, Mid-Level, Senior, Staff, Principal
  status: string; // active, on-leave, inactive
  pods: Pod[]; // Can belong to multiple pods
  podIds?: string[]; // Helper for forms/API
  skills: Skill[];
  createdAt: Date;
  updatedAt: Date;
}

// Skills/Programming Languages
export interface Skill {
  id: string;
  name: string;
  category: string; // Programming Language, Framework, Tool, etc.
}

// Roles
export interface Role {
  id: string;
  name: string;
  description?: string;
}

// Pods/Teams
export interface Pod {
  id: string;
  name: string;
  description?: string;
  status: string; // active, inactive
  memberCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Projects
export interface Project {
  id: string;
  name: string;
  description?: string;
  owner: string;
  status: string; // active, on-hold, completed
  startDate?: Date;
  endDate?: Date;
  budgetManDays?: number; // Budget in Man Days
  consumedManDays?: number; // Actually consumed Man Days
  pods: string[]; // Pod IDs
  allocations: ProjectAllocation[];
  createdAt: Date;
  updatedAt: Date;
}

// Budget tracking
export interface ProjectBudget {
  projectId: string;
  projectName: string;
  budgetManDays: number;
  allocatedManDays: number; // Calculated from allocation grid
  consumedManDays: number; // Manually entered actual consumption
  remainingManDays: number;
  percentageUsed: number;
  status: 'on-track' | 'at-risk' | 'over-budget';
  startDate?: Date;
  endDate?: Date;
}

// Time-based Project Allocation
export interface ProjectAllocation {
  id?: string;
  resourceId: string;
  resourceName: string;
  projectId?: string;
  projectName?: string;
  percentage: number; // 0-100
  month: number; // 1-12
  year: number;
  notes?: string;
}

// Stats
export interface AllocationStats {
  totalResources: number;
  activeResources: number;
  totalProjects: number;
  totalPods: number;
  averageAllocation: number;
}

// Role and Seniority constants
export const ROLES = [
  'Developer',
  'Senior Developer',
  'Team Lead',
  'Tech Lead',
  'Engineering Manager',
  'Architect',
  'Principal Engineer',
] as const;

export const SENIORITIES = [
  'Junior',
  'Mid-Level',
  'Senior',
  'Staff',
  'Principal',
] as const;

export const SKILL_CATEGORIES = [
  'Programming Language',
  'Framework',
  'Database',
  'Tool',
  'Cloud Platform',
  'Other',
] as const;

export const STATUS_OPTIONS = ['active', 'on-leave', 'inactive'] as const;

export const PROJECT_STATUS_OPTIONS = [
  'planned',
  'active',
  'on-hold',
  'completed',
] as const;

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;
