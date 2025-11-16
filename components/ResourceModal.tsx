'use client';

import { useState, useEffect } from 'react';
import { Resource, Skill, Role, SENIORITIES, STATUS_OPTIONS } from '@/types';

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resource: any) => void;
  resource?: Resource;
  availableSkills: Skill[];
  availablePods: Array<{ id: string; name: string }>;
}

export default function ResourceModal({
  isOpen,
  onClose,
  onSave,
  resource,
  availableSkills,
  availablePods,
}: ResourceModalProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    seniority: 'Mid-Level',
    status: 'active',
    podId: '',
    skills: [] as string[],
  });

  // Fetch roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      setLoadingRoles(true);
      try {
        const response = await fetch('/api/roles');
        if (response.ok) {
          const data = await response.json();
          setRoles(data);
          // Set default role if needed
          if (!resource && data.length > 0 && !formData.role) {
            setFormData(prev => ({ ...prev, role: data[0].name }));
          }
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
      } finally {
        setLoadingRoles(false);
      }
    };

    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen]);

  useEffect(() => {
    setError(''); // Clear error when modal opens/closes or resource changes
    if (resource) {
      setFormData({
        name: resource.name,
        email: resource.email || '',
        role: resource.role,
        seniority: resource.seniority,
        status: resource.status,
        podId: resource.podId || '',
        skills: resource.skills?.map((s) => s.id) || [],
      });
    } else if (roles.length > 0) {
      setFormData({
        name: '',
        email: '',
        role: roles[0].name,
        seniority: 'Mid-Level',
        status: 'active',
        podId: '',
        skills: [],
      });
    }
  }, [resource, isOpen, roles]);

  const handleSkillToggle = (skillId: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter((id) => id !== skillId)
        : [...prev.skills, skillId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      // Error will be set by the parent component
      setError(err.message || 'An error occurred');
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">
          {resource ? 'Edit Resource' : 'Add New Resource'}
        </h2>
        
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  disabled={loadingRoles}
                >
                  {loadingRoles ? (
                    <option value="">Loading roles...</option>
                  ) : roles.length === 0 ? (
                    <option value="">No roles available</option>
                  ) : (
                    roles.map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.name}
                      </option>
                    ))
                  )}
                </select>
                {roles.length === 0 && !loadingRoles && (
                  <p className="text-xs text-amber-600 mt-1">
                    Add roles in Settings → Roles
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seniority *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={formData.seniority}
                  onChange={(e) =>
                    setFormData({ ...formData, seniority: e.target.value })
                  }
                >
                  {SENIORITIES.map((seniority) => (
                    <option key={seniority} value={seniority}>
                      {seniority}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pod
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={formData.podId}
                  onChange={(e) =>
                    setFormData({ ...formData, podId: e.target.value })
                  }
                >
                  <option value="">No team assigned</option>
                  {availablePods.map((pod) => (
                    <option key={pod.id} value={pod.id}>
                      {pod.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills & Technologies
              </label>
              <div className="border border-gray-300 rounded-md p-4 max-h-60 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {availableSkills.map((skill) => (
                    <label
                      key={skill.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.skills.includes(skill.id)}
                        onChange={() => handleSkillToggle(skill.id)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">
                        {skill.name}
                        <span className="text-xs text-gray-500 ml-1">
                          ({skill.category})
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                {availableSkills.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No skills available. Add skills first.
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Selected: {formData.skills.length} skills
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            >
              Save Resource
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
