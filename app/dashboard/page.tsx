'use client';

import { useData } from '@/context/DataContext';
import StatCard from '@/components/StatCard';
import Link from 'next/link';

export default function Dashboard() {
  const { resources, pods, projects } = useData();

  const activeEngineers = resources.filter((r) => r.status === 'active').length;
  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const activeTeams = pods.filter((p) => p.status === 'active').length;

  // Calculate average allocation
  const totalAllocations = projects.reduce(
    (sum, project) =>
      sum + project.allocations.reduce((s, a) => s + a.percentage, 0),
    0
  );
  const allocationCount = projects.reduce(
    (sum, project) => sum + project.allocations.length,
    0
  );
  const averageAllocation =
    allocationCount > 0 ? (totalAllocations / allocationCount).toFixed(0) : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Overview of your engineering team and project allocations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Resources"
          value={activeEngineers}
          description={`${resources.length} total resources`}
          color="blue"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          }
        />

        <StatCard
          title="Active Pods"
          value={activeTeams}
          description={`${pods.length} total pods`}
          color="green"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        />

        <StatCard
          title="Active Projects"
          value={activeProjects}
          description={`${projects.length} total projects`}
          color="purple"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          }
        />

        <StatCard
          title="Avg Allocation"
          value={`${averageAllocation}%`}
          description="Per resource per project"
          color="orange"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Resources by Pod
          </h2>
          <div className="space-y-4">
            {pods.map((pod) => {
              const teamMembers = resources.filter((r) => 
                r.pods.some(p => p.id === pod.id)
              );
              return (
                <div key={pod.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {pod.name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {teamMembers.length} members
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {teamMembers.slice(0, 5).map((member) => (
                      <span
                        key={member.id}
                        className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded"
                      >
                        {member.name}
                      </span>
                    ))}
                    {teamMembers.length > 5 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{teamMembers.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {pods.length === 0 && (
              <p className="text-sm text-gray-500">No pods yet</p>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link
              href="/pods"
              className="text-sm text-orange-600 hover:text-orange-700"
            >
              View all pods →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Projects
          </h2>
          <div className="space-y-4">
            {projects.slice(0, 5).map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-b-0"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{project.name}</p>
                  <p className="text-sm text-gray-600">
                    {project.owner} • {project.allocations.length} allocations
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    project.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : project.status === 'on-hold'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {project.status}
                </span>
              </div>
            ))}
            {projects.length === 0 && (
              <p className="text-sm text-gray-500">No projects yet</p>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link
              href="/projects"
              className="text-sm text-orange-600 hover:text-orange-700"
            >
              View all projects →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

