'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import ProjectModal from '@/components/ProjectModal';
import Pagination from '@/components/Pagination';
import { Project, MONTHS } from '@/types';

export default function ProjectsPage() {
  const {
    projects,
    resources,
    pods,
    addProject,
    updateProject,
    deleteProject,
  } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleAddProject = () => {
    setEditingProject(undefined);
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleSaveProject = (project: any) => {
    if (editingProject) {
      updateProject(editingProject.id, project);
    } else {
      addProject(project);
    }
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      'on-hold': 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Pagination logic
  const totalPages = Math.ceil(projects.length / pageSize);
  
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return projects.slice(startIndex, endIndex);
  }, [projects, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">
            Manage your projects and resource allocations
          </p>
        </div>
        <button
          onClick={handleAddProject}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Project
        </button>
      </div>

      <div className="space-y-6">
        {paginatedProjects.map((project) => {
          const projectPods = pods.filter((p) => project.pods?.includes(p.id));
          
          // Group allocations by resource
          const allocationsByResource = project.allocations.reduce((acc, alloc) => {
            if (!acc[alloc.resourceId]) {
              acc[alloc.resourceId] = [];
            }
            acc[alloc.resourceId].push(alloc);
            return acc;
          }, {} as Record<string, typeof project.allocations>);

          return (
            <div key={project.id} className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {project.name}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {project.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>Owner: {project.owner}</span>
                      {project.startDate && (
                        <span>
                          {new Date(project.startDate).toLocaleDateString()} -{' '}
                          {project.endDate
                            ? new Date(project.endDate).toLocaleDateString()
                            : 'Ongoing'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditProject(project)}
                      className="px-3 py-1 text-sm text-orange-600 hover:text-blue-900 hover:bg-orange-50 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
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
                      Pods ({projectPods.length})
                    </h4>
                    <div className="space-y-2">
                      {projectPods.map((pod) => (
                        <div
                          key={pod.id}
                          className="flex items-center bg-gray-50 p-2 rounded"
                        >
                          <span className="text-sm text-gray-900">
                            {pod.name}
                          </span>
                        </div>
                      ))}
                      {projectPods.length === 0 && (
                        <p className="text-sm text-gray-500">No pods assigned</p>
                      )}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
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
                      Resource Allocations ({Object.keys(allocationsByResource).length}{' '}
                      resources, {project.allocations.length} total allocations)
                    </h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {Object.entries(allocationsByResource).map(
                        ([resourceId, allocations]) => {
                          const resource = resources.find((r) => r.id === resourceId);
                          if (!resource) return null;

                          // Sort allocations by year and month
                          const sortedAllocations = [...allocations].sort(
                            (a, b) => {
                              if (a.year !== b.year) return a.year - b.year;
                              return a.month - b.month;
                            }
                          );

                          return (
                            <div key={resourceId} className="bg-gray-50 p-3 rounded">
                              <div className="font-medium text-gray-900 mb-2">
                                {resource.name}
                                <span className="text-xs text-gray-500 ml-2">
                                  ({resource.role})
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {sortedAllocations.map((alloc, idx) => (
                                  <div
                                    key={idx}
                                    className="px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                                  >
                                    <span className="font-semibold text-orange-600">
                                      {alloc.percentage}%
                                    </span>
                                    <span className="text-gray-600 ml-1">
                                      {MONTHS[alloc.month - 1].substring(0, 3)}{' '}
                                      {alloc.year}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                      )}
                      {project.allocations.length === 0 && (
                        <p className="text-sm text-gray-500">
                          No resource allocations yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Created: {new Date(project.createdAt).toLocaleDateString()} •
                    Updated: {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {projects.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={projects.length}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}

      {projects.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new project.
          </p>
          <div className="mt-6">
            <button
              onClick={handleAddProject}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            >
              Add Project
            </button>
          </div>
        </div>
      )}

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProject}
        project={editingProject}
        availableResources={resources.filter((r) => r.status === 'active')}
        availablePods={pods}
      />
    </div>
  );
}
