'use client';

import { useState } from 'react';
import { useData } from '@/context/DataContext';
import PodModal from '@/components/PodModal';
import { Pod } from '@/types';
import { LayoutGrid, List } from 'lucide-react';

type ViewMode = 'card' | 'list';

export default function PodsPage() {
  const { pods, resources, addPod, updatePod, deletePod } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPod, setEditingPod] = useState<Pod | undefined>();
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  const handleAddPod = () => {
    setEditingPod(undefined);
    setIsModalOpen(true);
  };

  const handleEditPod = (pod: Pod) => {
    setEditingPod(pod);
    setIsModalOpen(true);
  };

  const handleSavePod = (pod: any) => {
    if (editingPod) {
      updatePod(editingPod.id, pod);
    } else {
      addPod(pod);
    }
  };

  const handleDeletePod = (id: string) => {
    if (confirm('Are you sure you want to delete this pod? Pod members will be unassigned but not deleted.')) {
      deletePod(id);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pods</h1>
          <p className="text-gray-600 mt-2">
            Manage your development pods and their members
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-md p-1">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'card'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Card view"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="List view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          
          <button
            onClick={handleAddPod}
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
            Add Pod
          </button>
        </div>
      </div>

      {/* Card View */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pods.map((pod) => {
            const teamMembers = resources.filter((r) => r.podId === pod.id);
            return (
              <div key={pod.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {pod.name}
                  </h3>
                  {pod.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {pod.description}
                    </p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    pod.status
                  )}`}
                >
                  {pod.status}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Team Members
                  </h4>
                  <span className="text-sm text-gray-600">
                    {teamMembers.length} members
                  </span>
                </div>
                <div className="space-y-2">
                  {teamMembers.length > 0 ? (
                    teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {member.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {member.role} • {member.seniority}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {member.skills?.slice(0, 2).map((skill) => (
                            <span
                              key={skill.id}
                              className="px-1.5 py-0.5 bg-blue-100 text-orange-700 text-xs rounded"
                            >
                              {skill.name}
                            </span>
                          ))}
                          {member.skills && member.skills.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{member.skills.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No members assigned yet
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEditPod(pod)}
                  className="px-3 py-1 text-sm text-orange-600 hover:text-blue-900 hover:bg-orange-50 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeletePod(pod.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                >
                  Delete
                </button>
              </div>

              <div className="mt-2 text-xs text-gray-500">
                Updated: {new Date(pod.updatedAt).toLocaleDateString()}
              </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pod Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Members
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pods.map((pod) => {
                const teamMembers = resources.filter((r) => r.podId === pod.id);
                return (
                  <tr key={pod.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {pod.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {pod.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
                      </div>
                      {teamMembers.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {teamMembers.slice(0, 2).map(m => m.name).join(', ')}
                          {teamMembers.length > 2 && ` +${teamMembers.length - 2} more`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          pod.status
                        )}`}
                      >
                        {pod.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(pod.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditPod(pod)}
                        className="text-orange-600 hover:text-orange-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePod(pod.id)}
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
        </div>
      )}

      {pods.length === 0 && (
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No teams</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first team.
          </p>
          <div className="mt-6">
            <button
              onClick={handleAddPod}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            >
              Add Pod
            </button>
          </div>
        </div>
      )}

      <PodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePod}
        pod={editingPod}
      />
    </div>
  );
}
