'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import ResourceModal from '@/components/ResourceModal';
import Pagination from '@/components/Pagination';
import MultiSelect from '@/components/MultiSelect';
import { Resource } from '@/types';
import { Search, X } from 'lucide-react';

export default function ResourcesPage() {
  const { resources, pods, skills, addResource, updateResource, deleteResource } =
    useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPods, setSelectedPods] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const handleAddResource = () => {
    setEditingResource(undefined);
    setIsModalOpen(true);
  };

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setIsModalOpen(true);
  };

  const handleSaveResource = async (resource: any) => {
    if (editingResource) {
      await updateResource(editingResource.id, resource);
    } else {
      await addResource(resource);
    }
  };

  const handleDeleteResource = (id: string) => {
    if (confirm('Are you sure you want to delete this resource?')) {
      deleteResource(id);
    }
  };

  const getSeniorityColor = (seniority: string) => {
    const colors: Record<string, string> = {
      Junior: 'bg-gray-100 text-gray-800',
      'Mid-Level': 'bg-blue-100 text-blue-800',
      Senior: 'bg-purple-100 text-purple-800',
      Staff: 'bg-orange-100 text-orange-800',
      Principal: 'bg-red-100 text-red-800',
    };
    return colors[seniority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      'on-leave': 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get unique roles from resources
  const uniqueRoles = useMemo(() => {
    const roles = new Set(resources.map(r => r.role).filter(Boolean));
    return Array.from(roles).sort();
  }, [resources]);

  // Filter and search logic
  const filteredResources = useMemo(() => {
    let filtered = resources;

    // Search by name
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(resource => 
        resource.name.toLowerCase().includes(query) ||
        resource.email?.toLowerCase().includes(query)
      );
    }

    // Filter by pods (OR logic - show if in any selected pod)
    if (selectedPods.length > 0) {
      filtered = filtered.filter(resource => 
        resource.pods.some(pod => selectedPods.includes(pod.id))
      );
    }

    // Filter by roles (OR logic - show if has any selected role)
    if (selectedRoles.length > 0) {
      filtered = filtered.filter(resource => 
        selectedRoles.includes(resource.role)
      );
    }

    // Filter by skills (OR logic - show if has any selected skill)
    if (selectedSkills.length > 0) {
      filtered = filtered.filter(resource => 
        resource.skills?.some(skill => selectedSkills.includes(skill.id))
      );
    }

    return filtered;
  }, [resources, searchQuery, selectedPods, selectedRoles, selectedSkills]);

  // Pagination logic
  const totalPages = Math.ceil(filteredResources.length / pageSize);
  
  const paginatedResources = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredResources.slice(startIndex, endIndex);
  }, [filteredResources, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedPods([]);
    setSelectedRoles([]);
    setSelectedSkills([]);
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || selectedPods.length > 0 || selectedRoles.length > 0 || selectedSkills.length > 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resources</h1>
          <p className="text-gray-600 mt-2">
            Manage your engineering team members
          </p>
        </div>
        <button
          onClick={handleAddResource}
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
          Add Resource
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Pod Filter */}
          <MultiSelect
            label="Pods"
            options={pods.map(pod => ({ value: pod.id, label: pod.name }))}
            selectedValues={selectedPods}
            onChange={(values) => {
              setSelectedPods(values);
              setCurrentPage(1);
            }}
            placeholder="Select pods..."
            badgeColor="orange"
          />

          {/* Role Filter */}
          <MultiSelect
            label="Roles"
            options={uniqueRoles.map(role => ({ value: role, label: role }))}
            selectedValues={selectedRoles}
            onChange={(values) => {
              setSelectedRoles(values);
              setCurrentPage(1);
            }}
            placeholder="Select roles..."
            badgeColor="blue"
          />

          {/* Skill Filter */}
          <MultiSelect
            label="Skills"
            options={skills.map(skill => ({ value: skill.id, label: skill.name }))}
            selectedValues={selectedSkills}
            onChange={(values) => {
              setSelectedSkills(values);
              setCurrentPage(1);
            }}
            placeholder="Select skills..."
            badgeColor="purple"
          />
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
            <span className="text-sm text-gray-600">
              Showing {filteredResources.length} of {resources.length} resources
            </span>
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seniority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pod
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Skills
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedResources.map((resource) => {
              return (
                <tr key={resource.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <button
                        onClick={() => handleEditResource(resource)}
                        className="text-sm font-medium text-gray-900 hover:text-orange-600 cursor-pointer transition-colors text-left"
                      >
                        {resource.name}
                      </button>
                      {resource.email && (
                        <div className="text-sm text-gray-500">
                          {resource.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{resource.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeniorityColor(
                        resource.seniority
                      )}`}
                    >
                      {resource.seniority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {resource.pods.length > 0 ? (
                        resource.pods.map((pod) => (
                          <span
                            key={pod.id}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {pod.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No pods</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {resource.skills?.slice(0, 3).map((skill) => (
                        <span
                          key={skill.id}
                          className="px-2 py-0.5 bg-orange-50 text-orange-700 text-xs rounded"
                        >
                          {skill.name}
                        </span>
                      ))}
                      {resource.skills && resource.skills.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          +{resource.skills.length - 3} more
                        </span>
                      )}
                      {!resource.skills || resource.skills.length === 0 ? (
                        <span className="text-xs text-gray-400">No skills</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        resource.status
                      )}`}
                    >
                      {resource.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditResource(resource)}
                      className="text-orange-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteResource(resource.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {filteredResources.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredResources.length}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}

        {filteredResources.length === 0 && resources.length > 0 && (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No resources found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters.
            </p>
            <div className="mt-6">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {resources.length === 0 && (
          <div className="text-center py-12">
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No resources
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first resource.
            </p>
            <div className="mt-6">
              <button
                onClick={handleAddResource}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
              >
                Add Resource
              </button>
            </div>
          </div>
        )}
      </div>

      <ResourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveResource}
        resource={editingResource}
        availableSkills={skills}
        availablePods={pods}
      />
    </div>
  );
}
