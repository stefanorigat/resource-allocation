'use client';

import { useState, useEffect } from 'react';
import { Project, Resource, Pod, MONTHS, PROJECT_STATUS_OPTIONS } from '@/types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: any) => void;
  project?: Project;
  availableResources: Resource[];
  availablePods: Pod[];
}

export default function ProjectModal({
  isOpen,
  onClose,
  onSave,
  project,
  availableResources,
  availablePods,
}: ProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    owner: '',
    status: 'planned',
    startDate: '',
    endDate: '',
    budgetManDays: 0,
    consumedManDays: 0,
    pods: [] as string[],
    allocations: [] as Array<{
      resourceId: string;
      percentage: number;
      month: number;
      year: number;
      notes: string;
    }>,
  });
  
  const [validationError, setValidationError] = useState<string | null>(null);

  const [allocationForm, setAllocationForm] = useState({
    resourceId: '',
    percentage: 50,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    notes: '',
  });

  // Engineer search state
  const [engineerSearchQuery, setEngineerSearchQuery] = useState('');
  const [searchedEngineers, setSearchedEngineers] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showEngineerDropdown, setShowEngineerDropdown] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        owner: project.owner,
        status: project.status,
        startDate: project.startDate ? project.startDate.toISOString().split('T')[0] : '',
        endDate: project.endDate ? project.endDate.toISOString().split('T')[0] : '',
        budgetManDays: project.budgetManDays || 0,
        consumedManDays: project.consumedManDays || 0,
        pods: project.pods || [],
        allocations: (project.allocations || []).map(a => ({
          resourceId: a.resourceId,
          percentage: a.percentage,
          month: a.month,
          year: a.year,
          notes: a.notes || '',
        })),
      });
    } else {
      setFormData({
        name: '',
        description: '',
        owner: '',
        status: 'planned',
        startDate: '',
        endDate: '',
        budgetManDays: 0,
        consumedManDays: 0,
        pods: [],
        allocations: [],
      });
    }
    setValidationError(null);
    setEngineerSearchQuery('');
    setSearchedEngineers([]);
    setShowEngineerDropdown(false);
  }, [project, isOpen]);

  // Search engineers with debouncing
  useEffect(() => {
    const searchEngineers = async () => {
      if (!showEngineerDropdown || engineerSearchQuery.length === 0) {
        setSearchedEngineers([]);
        return;
      }

      setSearchLoading(true);
      try {
        const response = await fetch(
          `/api/resources/search?q=${encodeURIComponent(engineerSearchQuery)}&limit=10&status=active`
        );
        if (response.ok) {
          const data = await response.json();
          setSearchedEngineers(data);
        }
      } catch (error) {
        console.error('Error searching engineers:', error);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchEngineers, 300);
    return () => clearTimeout(debounceTimer);
  }, [engineerSearchQuery, showEngineerDropdown]);

  const handlePodToggle = (podId: string) => {
    setFormData((prev) => ({
      ...prev,
      pods: prev.pods.includes(podId)
        ? prev.pods.filter((id) => id !== podId)
        : [...prev.pods, podId],
    }));
  };

  const handleAddAllocation = () => {
    if (!allocationForm.resourceId) {
      alert('Please select a resource');
      return;
    }

    if (allocationForm.percentage < 0 || allocationForm.percentage > 100) {
      alert('Percentage must be between 0 and 100');
      return;
    }

    const newAllocation = {
      resourceId: allocationForm.resourceId,
      percentage: allocationForm.percentage,
      month: allocationForm.month,
      year: allocationForm.year,
      notes: allocationForm.notes,
    };

    setFormData((prev) => ({
      ...prev,
      allocations: [...prev.allocations, newAllocation],
    }));

    // Reset form
    setAllocationForm({
      resourceId: '',
      percentage: 50,
      month: allocationForm.month,
      year: allocationForm.year,
      notes: '',
    });
    
    // Reset search
    setEngineerSearchQuery('');
    setSearchedEngineers([]);
    setShowEngineerDropdown(false);
  };

  const handleRemoveAllocation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      allocations: prev.allocations.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation: Planned projects cannot have a start date in the past
    if (formData.status === 'planned' && formData.startDate) {
      const startDate = new Date(formData.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        setValidationError('Planned projects cannot have a start date in the past');
        return;
      }
    }
    
    setValidationError(null);
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">
          {project ? 'Edit Project' : 'Add New Project'}
        </h2>
        
        {validationError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700 font-medium">{validationError}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
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
                  Owner *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={formData.owner}
                  onChange={(e) =>
                    setFormData({ ...formData, owner: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={2}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
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
                  {PROJECT_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget (Man Days)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={formData.budgetManDays}
                  onChange={(e) =>
                    setFormData({ ...formData, budgetManDays: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consumed (Man Days)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={formData.consumedManDays}
                  onChange={(e) =>
                    setFormData({ ...formData, consumedManDays: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Teams
              </label>
              <div className="border border-gray-300 rounded-md p-3 max-h-32 overflow-y-auto">
                <div className="space-y-2">
                  {availablePods.map((pod) => (
                    <label
                      key={pod.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.pods.includes(pod.id)}
                        onChange={() => handlePodToggle(pod.id)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">{pod.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resource Allocations (by Month)
              </label>
              <div className="border border-gray-300 rounded-md p-4 space-y-3">
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-4 relative">
                    <input
                      type="text"
                      placeholder="Search resource..."
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={engineerSearchQuery}
                      onChange={(e) => setEngineerSearchQuery(e.target.value)}
                      onFocus={() => setShowEngineerDropdown(true)}
                      onBlur={() => {
                        // Delay to allow click on dropdown items
                        setTimeout(() => setShowEngineerDropdown(false), 200);
                      }}
                    />
                    {/* Search Results Dropdown */}
                    {showEngineerDropdown && engineerSearchQuery && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {searchLoading ? (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            Searching...
                          </div>
                        ) : searchedEngineers.length > 0 ? (
                          searchedEngineers.map((engineer) => (
                            <button
                              key={engineer.id}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setAllocationForm({
                                  ...allocationForm,
                                  resourceId: engineer.id,
                                });
                                setEngineerSearchQuery(engineer.name);
                                setShowEngineerDropdown(false);
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">
                                {engineer.name}
                              </div>
                              <div className="text-xs text-gray-600">
                                {engineer.role} • {engineer.seniority}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            No engineers found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="%"
                      min="0"
                      max="100"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={allocationForm.percentage}
                      onChange={(e) =>
                        setAllocationForm({
                          ...allocationForm,
                          percentage: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <select
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={allocationForm.month}
                      onChange={(e) =>
                        setAllocationForm({
                          ...allocationForm,
                          month: parseInt(e.target.value),
                        })
                      }
                    >
                      {MONTHS.map((month, idx) => (
                        <option key={idx + 1} value={idx + 1}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Year"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={allocationForm.year}
                      onChange={(e) =>
                        setAllocationForm({
                          ...allocationForm,
                          year: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <button
                      type="button"
                      onClick={handleAddAllocation}
                      className="w-full px-2 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {formData.allocations.length > 0 && (
                  <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                    {formData.allocations.map((allocation, index) => {
                      const resource = availableResources.find(
                        (r) => r.id === allocation.resourceId
                      );
                      return (
                        <div
                          key={index}
                          className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm"
                        >
                          <span className="font-medium">{resource?.name || 'Unknown'}</span>
                          <span className="text-gray-600">
                            {allocation.percentage}% • {MONTHS[allocation.month - 1]}{' '}
                            {allocation.year}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAllocation(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {formData.allocations.length === 0 && (
                  <p className="text-sm text-gray-500 italic">
                    No allocations yet. Add engineers and their monthly allocation percentages.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            >
              Save Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
