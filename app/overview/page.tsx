'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { MONTHS } from '@/types';
import { ChevronDown, ChevronRight, Plus, Trash2, ExternalLink, X } from 'lucide-react';
import ProjectModal from '@/components/ProjectModal';
import Pagination from '@/components/Pagination';

interface AllocationData {
  id: string;
  resourceId: string;
  resourceName: string;
  resourceRole: string;
  resourceSeniority: string;
  projectId: string;
  projectName: string;
  percentage: number;
  month: number;
  year: number;
  notes: string | null;
}

type ViewMode = 'by-resource' | 'by-project';

interface EditModeState {
  parentId: string;
  values: Record<string, { allocationId: string | null; value: string; resourceId?: string; projectId?: string }>;
  focusedCell: { itemName: string; month: number } | null;
}

interface QuickProjectForm {
  name: string;
  owner: string;
  status: string;
}

export default function MonthlyOverviewPage() {
  const { resources, projects, pods, refreshData } = useData();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [allocations, setAllocations] = useState<AllocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('by-resource');
  const [editMode, setEditMode] = useState<EditModeState | null>(null);
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const inputRefs = useRef<Record<string, HTMLInputElement>>({});
  const editAreaRef = useRef<HTMLDivElement>(null);

  // Add resource state (for "By Project" view)
  const [addingResourceForProject, setAddingResourceForProject] = useState<string | null>(null);
  const [selectedResourceToAdd, setSelectedResourceToAdd] = useState<string>('');
  const [resourceSearchQuery, setResourceSearchQuery] = useState('');
  const [searchedResources, setSearchedResources] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Add project state (for "By Resource" view)
  const [addingProjectForResource, setAddingProjectForResource] = useState<string | null>(null);
  const [selectedProjectToAdd, setSelectedProjectToAdd] = useState<string>('');
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [searchedProjects, setSearchedProjects] = useState<any[]>([]);
  const [projectSearchLoading, setProjectSearchLoading] = useState(false);
  
  // Quick add project modal (without expanding)
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [addProjectModalResourceId, setAddProjectModalResourceId] = useState<string | null>(null);

  // Quick add project state
  const [showQuickAddProject, setShowQuickAddProject] = useState(false);
  const [quickProjectForm, setQuickProjectForm] = useState<QuickProjectForm>({
    name: '',
    owner: '',
    status: 'planned',
  });

  // Full project edit modal
  const [editingProject, setEditingProject] = useState<any>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);

  // Pagination and search for "By Resource" view
  const [resourceViewSearchQuery, setResourceViewSearchQuery] = useState('');
  const [resourceViewCurrentPage, setResourceViewCurrentPage] = useState(1);
  const [resourceViewPageSize, setResourceViewPageSize] = useState(10);

  const years = Array.from({ length: 6 }, (_, i) => 2025 + i);

  // Fetch allocations for selected year AND get all unique resource-project combinations
  const fetchAllocations = async () => {
    setLoading(true);
    try {
      // Fetch allocations for the selected year
      const response = await fetch(`/api/allocations?year=${selectedYear}`);
      if (response.ok) {
        const yearData = await response.json();
        
        // Also fetch all allocations to find unique combinations
        const allResponse = await fetch(`/api/allocations`);
        if (allResponse.ok) {
          const allData = await allResponse.json();
          
          // Find all unique resource-project combinations across all years
          const uniqueCombinations = new Set<string>();
          allData.forEach((alloc: AllocationData) => {
            uniqueCombinations.add(`${alloc.resourceId}-${alloc.projectId}`);
          });
          
          // For each unique combination, ensure we have allocations for all 12 months of selected year
          const expandedData: AllocationData[] = [];
          
          uniqueCombinations.forEach(combo => {
            const [resourceId, projectId] = combo.split('-');
            const sampleAlloc = allData.find((a: AllocationData) => 
              a.resourceId === resourceId && a.projectId === projectId
            );
            
            if (sampleAlloc) {
              // For each month, add existing allocation or create a placeholder with 0%
              for (let month = 1; month <= 12; month++) {
                const existing = yearData.find((a: AllocationData) => 
                  a.resourceId === resourceId && 
                  a.projectId === projectId && 
                  a.month === month
                );
                
                if (existing) {
                  expandedData.push(existing);
                } else {
                  // Create a placeholder with 0% (no id since it doesn't exist in DB yet)
                  expandedData.push({
                    id: '', // Empty id indicates it doesn't exist yet
                    resourceId,
                    resourceName: sampleAlloc.resourceName,
                    resourceRole: sampleAlloc.resourceRole,
                    resourceSeniority: sampleAlloc.resourceSeniority,
                    projectId,
                    projectName: sampleAlloc.projectName,
                    percentage: 0,
                    month,
                    year: selectedYear,
                    notes: null
                  });
                }
              }
            }
          });
          
          setAllocations(expandedData);
        } else {
          setAllocations(yearData);
        }
      }
    } catch (error) {
      console.error('Error fetching allocations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, [selectedYear]);

  // Search resources with debouncing
  useEffect(() => {
    const searchResources = async () => {
      if (!addingResourceForProject) return;
      
      setSearchLoading(true);
      try {
        const response = await fetch(
          `/api/resources/search?q=${encodeURIComponent(resourceSearchQuery)}&limit=10&status=active`
        );
        if (response.ok) {
          const data = await response.json();
          // Filter out resources already on the project
          const projectResourceIds = new Set(
            allocations
              .filter(a => a.projectId === addingResourceForProject)
              .map(a => a.resourceId)
          );
          setSearchedResources(data.filter((r: any) => !projectResourceIds.has(r.id)));
        }
      } catch (error) {
        console.error('Error searching resources:', error);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchResources, 300);
    return () => clearTimeout(debounceTimer);
  }, [resourceSearchQuery, addingResourceForProject, allocations]);

  // Search projects with debouncing (for "By Resource" view and modal)
  useEffect(() => {
    const searchProjects = async () => {
      const activeResourceId = addingProjectForResource || addProjectModalResourceId;
      if (!activeResourceId) return;
      
      setProjectSearchLoading(true);
      try {
        const query = projectSearchQuery.toLowerCase();
        // Filter projects that match the search and aren't already allocated to this resource
        const resourceProjectIds = new Set(
          allocations
            .filter(a => a.resourceId === activeResourceId)
            .map(a => a.projectId)
        );
        const filteredProjects = projects.filter(p => 
          (p.name.toLowerCase().includes(query) || p.owner.toLowerCase().includes(query)) &&
          !resourceProjectIds.has(p.id)
        ).slice(0, 10);
        setSearchedProjects(filteredProjects);
      } catch (error) {
        console.error('Error searching projects:', error);
      } finally {
        setProjectSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchProjects, 300);
    return () => clearTimeout(debounceTimer);
  }, [projectSearchQuery, addingProjectForResource, addProjectModalResourceId, allocations, projects]);

  // Handle clicks outside edit area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editMode && editAreaRef.current && !editAreaRef.current.contains(event.target as Node)) {
        exitEditMode();
      }
    };

    if (editMode) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [editMode]);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
        if (editMode?.parentId === id) {
          exitEditMode();
        }
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const enterEditMode = (parentId: string, items: Array<{ name: string; months: Array<{ month: number; percentage: number; allocationId: string | null }> }>) => {
    const values: Record<string, { allocationId: string | null; value: string; resourceId?: string; projectId?: string }> = {};
    
    items.forEach(item => {
      item.months.forEach(({ month, percentage, allocationId }) => {
        const key = `${item.name}-${month}`;
        
        // Determine if we're in by-project or by-resource view
        let resourceId: string | undefined;
        let projectId: string | undefined;
        
        if (viewMode === 'by-project') {
          // parentId is projectId, item.name is resource name
          projectId = parentId;
          const resource = resources.find(r => r.name === item.name);
          resourceId = resource?.id;
        } else {
          // parentId is resourceId, item.name is project name
          resourceId = parentId;
          const project = projects.find(p => p.name === item.name);
          projectId = project?.id;
        }
        
        // Include ALL cells, even those without allocationIds
        // Treat empty string as null
        values[key] = { 
          allocationId: allocationId && allocationId.trim() !== '' ? allocationId : null, 
          value: percentage.toString(),
          resourceId,
          projectId
        };
      });
    });

    setEditMode({
      parentId,
      values,
      focusedCell: null,
    });
  };

  const exitEditMode = async () => {
    if (!editMode) return;
    
    const savePromises: Promise<void>[] = [];
    
    for (const [key, data] of Object.entries(editMode.values)) {
      if (data.allocationId) {
        // Update existing allocation
        const originalAlloc = allocations.find(a => a.id === data.allocationId);
        if (originalAlloc && originalAlloc.percentage.toString() !== data.value) {
          savePromises.push(saveAllocation(data.allocationId, data.value));
        }
      } else {
        // Create new allocation if value is not 0
        const percentage = parseFloat(data.value);
        const month = parseInt(key.split('-').pop() || '0');
        if (!isNaN(percentage) && percentage > 0 && data.resourceId && data.projectId && month > 0) {
          savePromises.push(createAllocation(data.resourceId, data.projectId, month, percentage));
        }
      }
    }

    if (savePromises.length > 0) {
      await Promise.all(savePromises);
    }

    setEditMode(null);
  };

  const saveAllocation = async (allocationId: string, value: string): Promise<void> => {
    const percentage = parseFloat(value);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      return;
    }

    setSaving(prev => new Set(prev).add(allocationId));
    
    try {
      const response = await fetch(`/api/allocations/${allocationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ percentage }),
      });

      if (response.ok) {
        const updated = await response.json();
        setAllocations((prev) =>
          prev.map((alloc) =>
            alloc.id === allocationId
              ? { ...alloc, percentage: updated.percentage }
              : alloc
          )
        );
      }
    } catch (error) {
      console.error('Error saving allocation:', error);
    } finally {
      setSaving(prev => {
        const newSet = new Set(prev);
        newSet.delete(allocationId);
        return newSet;
      });
    }
  };

  const createAllocation = async (resourceId: string, projectId: string, month: number, percentage: number): Promise<void> => {
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      return;
    }
    
    try {
      const response = await fetch('/api/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId,
          projectId,
          percentage,
          month,
          year: selectedYear,
          notes: '',
        }),
      });

      if (response.ok) {
        const newAllocation = await response.json();
        setAllocations((prev) => [...prev, newAllocation]);
        
        // Update the edit mode with the new allocationId
        if (editMode) {
          const resource = resources.find(r => r.id === resourceId);
          const project = projects.find(p => p.id === projectId);
          const itemName = viewMode === 'by-project' ? resource?.name : project?.name;
          if (itemName) {
            const key = `${itemName}-${month}`;
            setEditMode({
              ...editMode,
              values: {
                ...editMode.values,
                [key]: {
                  ...editMode.values[key],
                  allocationId: newAllocation.id,
                },
              },
            });
          }
        }
      }
    } catch (error) {
      console.error('Error creating allocation:', error);
    }
  };

  const updateEditValue = (itemName: string, month: number, value: string) => {
    if (!editMode) return;
    
    const key = `${itemName}-${month}`;
    if (editMode.values[key]) {
      setEditMode({
        ...editMode,
        values: {
          ...editMode.values,
          [key]: { ...editMode.values[key], value },
        },
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, itemName: string, month: number, allItems: string[]) => {
    if (!editMode) return;

    const currentItemIndex = allItems.indexOf(itemName);
    let newItemName = itemName;
    let newMonth = month;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        newMonth = month > 1 ? month - 1 : 12;
        break;
      case 'ArrowRight':
      case 'Tab':
        e.preventDefault();
        newMonth = month < 12 ? month + 1 : 1;
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (currentItemIndex > 0) {
          newItemName = allItems[currentItemIndex - 1];
        }
        break;
      case 'ArrowDown':
      case 'Enter':
        e.preventDefault();
        if (currentItemIndex < allItems.length - 1) {
          newItemName = allItems[currentItemIndex + 1];
        }
        break;
      case 'Escape':
        e.preventDefault();
        exitEditMode();
        return;
      default:
        return;
    }

    const currentKey = `${itemName}-${month}`;
    const currentData = editMode.values[currentKey];
    if (currentData && currentData.allocationId) {
      const originalAlloc = allocations.find(a => a.id === currentData.allocationId);
      if (originalAlloc && originalAlloc.percentage.toString() !== currentData.value) {
        saveAllocation(currentData.allocationId, currentData.value);
      }
    }

    const newKey = `${newItemName}-${newMonth}`;
    const inputRef = inputRefs.current[newKey];
    if (inputRef) {
      setTimeout(() => {
        inputRef.focus();
        inputRef.select();
      }, 0);
    }

    setEditMode({
      ...editMode,
      focusedCell: { itemName: newItemName, month: newMonth },
    });
  };

  const handleBlur = async (itemName: string, month: number) => {
    if (!editMode) return;
    
    const key = `${itemName}-${month}`;
    const data = editMode.values[key];
    if (data) {
      if (data.allocationId) {
        // Update existing allocation
        const originalAlloc = allocations.find(a => a.id === data.allocationId);
        if (originalAlloc && originalAlloc.percentage.toString() !== data.value) {
          await saveAllocation(data.allocationId, data.value);
        }
      } else {
        // Create new allocation if value is not 0
        const percentage = parseFloat(data.value);
        if (!isNaN(percentage) && percentage > 0 && data.resourceId && data.projectId) {
          await createAllocation(data.resourceId, data.projectId, month, percentage);
        }
      }
    }
  };

  // Add resource to project
  const handleAddResource = async (projectId: string) => {
    if (!selectedResourceToAdd) {
      alert('Please select a resource');
      return;
    }

    try {
      // Create allocations for all 12 months with 0%
      const createPromises = Array.from({ length: 12 }, (_, i) => i + 1).map(month =>
        fetch('/api/allocations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resourceId: selectedResourceToAdd,
            projectId,
            percentage: 0,
            month,
            year: selectedYear,
            notes: '',
          }),
        })
      );

      await Promise.all(createPromises);
      await fetchAllocations();
      setAddingResourceForProject(null);
      setSelectedResourceToAdd('');
      setResourceSearchQuery('');
      setSearchedResources([]);
    } catch (error) {
      console.error('Error adding resource:', error);
      alert('Failed to add resource');
    }
  };

  // Cancel adding resource
  const handleCancelAddResource = () => {
    setAddingResourceForProject(null);
    setSelectedResourceToAdd('');
    setResourceSearchQuery('');
    setSearchedResources([]);
  };

  // Open quick add project modal
  const handleOpenQuickAddProjectModal = (resourceId: string) => {
    setAddProjectModalResourceId(resourceId);
    setShowAddProjectModal(true);
    setSelectedProjectToAdd('');
    setProjectSearchQuery('');
    setSearchedProjects([]);
  };

  // Close quick add project modal
  const handleCloseQuickAddProjectModal = () => {
    setShowAddProjectModal(false);
    setAddProjectModalResourceId(null);
    setSelectedProjectToAdd('');
    setProjectSearchQuery('');
    setSearchedProjects([]);
  };

  // Add project to resource (for "By Resource" view - both inline and modal)
  const handleAddProject = async (resourceId: string) => {
    if (!selectedProjectToAdd) {
      alert('Please select a project');
      return;
    }

    try {
      // Create allocations for all 12 months with 0%
      const createPromises = Array.from({ length: 12 }, (_, i) => i + 1).map(month =>
        fetch('/api/allocations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resourceId,
            projectId: selectedProjectToAdd,
            percentage: 0,
            month,
            year: selectedYear,
            notes: '',
          }),
        })
      );

      await Promise.all(createPromises);
      await fetchAllocations();
      
      // Close both inline and modal forms
      setAddingProjectForResource(null);
      handleCloseQuickAddProjectModal();
      setSelectedProjectToAdd('');
      setProjectSearchQuery('');
      setSearchedProjects([]);
    } catch (error) {
      console.error('Error adding project:', error);
      alert('Failed to add project');
    }
  };

  // Cancel adding project
  const handleCancelAddProject = () => {
    setAddingProjectForResource(null);
    setSelectedProjectToAdd('');
    setProjectSearchQuery('');
    setSearchedProjects([]);
  };

  // Remove project from resource (delete all allocations for that resource-project combination)
  const handleRemoveProject = async (resourceId: string, projectName: string) => {
    if (!confirm(`Remove ${projectName} from this resource for ${selectedYear}? This will delete allocations for this year only.`)) {
      return;
    }

    try {
      // Only delete allocations for the selected year
      const allocsToDelete = allocations.filter(
        a => a.resourceId === resourceId && a.projectName === projectName && a.year === selectedYear && a.id !== ''
      );

      const deletePromises = allocsToDelete.map(alloc =>
        fetch(`/api/allocations/${alloc.id}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);
      await fetchAllocations();
    } catch (error) {
      console.error('Error removing project:', error);
      alert('Failed to remove project');
    }
  };

  // Remove resource from project (delete all allocations for that resource-project combination)
  const handleRemoveResource = async (projectId: string, resourceName: string) => {
    if (!confirm(`Remove ${resourceName} from this project for ${selectedYear}? This will delete allocations for this year only.`)) {
      return;
    }

    try {
      // Only delete allocations for the selected year
      const allocsToDelete = allocations.filter(
        a => a.projectId === projectId && a.resourceName === resourceName && a.year === selectedYear && a.id !== ''
      );

      const deletePromises = allocsToDelete.map(alloc =>
        fetch(`/api/allocations/${alloc.id}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);
      await fetchAllocations();
    } catch (error) {
      console.error('Error removing resource:', error);
      alert('Failed to remove resource');
    }
  };

  // Quick add project
  const handleQuickAddProject = async () => {
    if (!quickProjectForm.name || !quickProjectForm.owner) {
      alert('Please provide project name and owner');
      return;
    }

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...quickProjectForm,
          description: '',
          startDate: null,
          endDate: null,
          budgetManDays: 0,
          pods: [],
          allocations: [],
        }),
      });

      if (response.ok) {
        await refreshData();
        setShowQuickAddProject(false);
        setQuickProjectForm({ name: '', owner: '', status: 'planned' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    }
  };

  // Open full project edit modal
  const handleEditProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setEditingProject(project);
      setShowProjectModal(true);
    }
  };

  // Save project from modal
  const handleSaveProject = async (projectData: any) => {
    try {
      const url = editingProject
        ? `/api/projects/${editingProject.id}`
        : '/api/projects';
      const method = editingProject ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        await refreshData();
        await fetchAllocations();
        setShowProjectModal(false);
        setEditingProject(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save project');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project');
    }
  };

  const getCellColor = (percentage: number) => {
    if (percentage === 0) return 'bg-gray-50 text-gray-400';
    if (percentage < 50) return 'bg-green-100 text-green-800';
    if (percentage < 80) return 'bg-yellow-100 text-yellow-800';
    if (percentage < 100) return 'bg-orange-100 text-orange-800';
    if (percentage === 100) return 'bg-blue-100 text-blue-800';
    return 'bg-red-100 text-red-800';
  };

  const getCellBorder = (percentage: number) => {
    if (percentage > 100) return 'border-2 border-red-500';
    if (percentage === 100) return 'border-2 border-orange-500';
    return 'border border-gray-200';
  };

  // BY RESOURCE VIEW (unchanged from before)
  const renderByResourceView = () => {
    const monthlyData: Record<
      string,
      Record<number, { total: number; projects: string[]; byProject: Record<string, { percentage: number; allocationId: string }> }>
    > = {};

    resources
      .filter((r) => r.status === 'active')
      .forEach((resource) => {
        monthlyData[resource.id] = {};
        for (let month = 1; month <= 12; month++) {
          monthlyData[resource.id][month] = { total: 0, projects: [], byProject: {} };
        }
      });

    allocations.forEach((alloc) => {
      if (monthlyData[alloc.resourceId]) {
        monthlyData[alloc.resourceId][alloc.month].total += alloc.percentage;
        if (!monthlyData[alloc.resourceId][alloc.month].projects.includes(alloc.projectName)) {
          monthlyData[alloc.resourceId][alloc.month].projects.push(alloc.projectName);
        }
        monthlyData[alloc.resourceId][alloc.month].byProject[alloc.projectName] = {
          percentage: alloc.percentage,
          allocationId: alloc.id,
        };
      }
    });

    const activeResources = resources.filter((r) => r.status === 'active');

    const getResourceProjects = (resourceId: string): string[] => {
      const projectSet = new Set<string>();
      allocations
        .filter((alloc) => alloc.resourceId === resourceId)
        .forEach((alloc) => projectSet.add(alloc.projectName));
      return Array.from(projectSet).sort();
    };

    // Filter resources based on search query
    const filteredResources = activeResources.filter((resource) => {
      if (!resourceViewSearchQuery) return true;
      const searchLower = resourceViewSearchQuery.toLowerCase();
      const nameParts = resource.name.toLowerCase().split(' ');
      return nameParts.some(part => part.includes(searchLower)) || 
             resource.name.toLowerCase().includes(searchLower);
    });

    // Apply pagination
    const totalPages = Math.ceil(filteredResources.length / resourceViewPageSize);
    const paginatedResources = filteredResources.slice(
      (resourceViewCurrentPage - 1) * resourceViewPageSize,
      resourceViewCurrentPage * resourceViewPageSize
    );

    return (
      <>
        {/* Search bar */}
        <div className="mb-4 flex gap-4 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name or surname..."
              value={resourceViewSearchQuery}
              onChange={(e) => {
                setResourceViewSearchQuery(e.target.value);
                setResourceViewCurrentPage(1); // Reset to first page on search
              }}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            {resourceViewSearchQuery && (
              <button
                onClick={() => {
                  setResourceViewSearchQuery('');
                  setResourceViewCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-20">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-20 border-r border-gray-300 min-w-[250px]">
                  Engineer
                </th>
                {MONTHS.map((month, idx) => (
                  <th
                    key={idx}
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]"
                  >
                    {month.substring(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedResources.map((resource) => {
                const isExpanded = expandedRows.has(resource.id);
                const resourceProjects = getResourceProjects(resource.id);
                const hasProjects = resourceProjects.length > 0;
                const isInEditMode = editMode?.parentId === resource.id;

                return (
                  <React.Fragment key={resource.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap sticky left-0 bg-white hover:bg-gray-50 z-10 border-r border-gray-300">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleRow(resource.id)}
                            className={`flex-shrink-0 p-1 rounded hover:bg-gray-200 transition-colors ${
                              !hasProjects ? 'invisible' : ''
                            }`}
                            disabled={!hasProjects}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-600" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {resource.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {resource.role} • {resource.seniority}
                            </div>
                          </div>
                          <button
                            onClick={() => handleOpenQuickAddProjectModal(resource.id)}
                            className="p-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded transition-colors"
                            title="Quick add project"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      {Array.from({ length: 12 }, (_, idx) => idx + 1).map(
                        (month) => {
                          const data = monthlyData[resource.id]?.[month];
                          const total = data?.total || 0;
                          const projectsList = data?.projects || [];

                          return (
                            <td
                              key={month}
                              className={`px-4 py-3 text-center text-sm font-semibold ${getCellColor(
                                total
                              )} ${getCellBorder(total)}`}
                              title={
                                projectsList.length > 0
                                  ? `Projects: ${projectsList.join(', ')}`
                                  : 'No allocations'
                              }
                            >
                              {total > 0 ? `${total}%` : '-'}
                            </td>
                          );
                        }
                      )}
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td colSpan={13} className="p-0">
                          <div ref={isInEditMode ? editAreaRef : null} className={`${isInEditMode ? 'ring-2 ring-blue-400' : ''}`}>
                            <table className="min-w-full">
                              <tbody>
                                {resourceProjects.map((projectName) => (
                                  <tr
                                    key={`${resource.id}-${projectName}`}
                                    className="bg-orange-50 hover:bg-blue-100 group"
                                  >
                                    <td className="px-4 py-2 whitespace-nowrap sticky left-0 bg-orange-50 hover:bg-blue-100 z-10 border-r border-gray-300 min-w-[250px]">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 pl-10">
                                          <div className="text-sm text-gray-700">
                                            {projectName}
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => handleRemoveProject(resource.id, projectName)}
                                          className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-all"
                                          title="Remove project from resource"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                    {Array.from({ length: 12 }, (_, idx) => idx + 1).map(
                                      (month) => {
                                        const data = monthlyData[resource.id]?.[month];
                                        const projectData = data?.byProject[projectName];
                                        const percentage = projectData?.percentage || 0;
                                        const allocationId = projectData?.allocationId;
                                        const key = `${projectName}-${month}`;
                                        const editValue = isInEditMode && editMode.values[key] ? editMode.values[key].value : percentage.toString();
                                        const isSaving = allocationId ? saving.has(allocationId) : false;

                                        return (
                                          <td
                                            key={month}
                                            className={`px-2 py-2 text-center text-sm border border-gray-200 ${
                                              isInEditMode && allocationId ? 'bg-yellow-50' : 'bg-white'
                                            }`}
                                            style={{ minWidth: '100px' }}
                                          >
                                            {allocationId ? (
                                              isInEditMode ? (
                                                <input
                                                  ref={(el) => {
                                                    if (el) inputRefs.current[key] = el;
                                                  }}
                                                  type="number"
                                                  min="0"
                                                  max="100"
                                                  step="1"
                                                  value={editValue}
                                                  onChange={(e) =>
                                                    updateEditValue(projectName, month, e.target.value)
                                                  }
                                                  onKeyDown={(e) =>
                                                    handleKeyDown(e, projectName, month, resourceProjects)
                                                  }
                                                  onBlur={() => handleBlur(projectName, month)}
                                                  onClick={(e) => (e.target as HTMLInputElement).select()}
                                                  className={`w-full px-1 py-0.5 border rounded text-center focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                                                    isSaving ? 'bg-gray-100 cursor-wait' : 'border-orange-300'
                                                  }`}
                                                  disabled={isSaving}
                                                />
                                              ) : (
                                                <button
                                                  onClick={() => {
                                                    const items = resourceProjects.map(projName => ({
                                                      name: projName,
                                                      months: Array.from({ length: 12 }, (_, i) => i + 1).map(m => ({
                                                        month: m,
                                                        percentage: monthlyData[resource.id]?.[m]?.byProject[projName]?.percentage || 0,
                                                        allocationId: monthlyData[resource.id]?.[m]?.byProject[projName]?.allocationId || null,
                                                      })),
                                                    }));
                                                    enterEditMode(resource.id, items);
                                                    setTimeout(() => {
                                                      const inputRef = inputRefs.current[key];
                                                      if (inputRef) {
                                                        inputRef.focus();
                                                        inputRef.select();
                                                      }
                                                    }, 0);
                                                  }}
                                                  className={`w-full font-medium hover:bg-blue-100 px-2 py-1 rounded transition-colors ${
                                                    percentage === 0 ? 'text-gray-400 hover:text-orange-700' : 'text-orange-700'
                                                  }`}
                                                >
                                                  {percentage === 0 ? '0%' : `${percentage}%`}
                                                </button>
                                              )
                                            ) : (
                                              <span className="text-gray-300">-</span>
                                            )}
                                          </td>
                                        );
                                      }
                                    )}
                                  </tr>
                                ))}

                                {/* Add Project Row */}
                                {addingProjectForResource === resource.id ? (
                                  <tr className="bg-blue-50">
                                    <td className="px-4 py-3 sticky left-0 bg-blue-50 z-10 border-r border-gray-300" colSpan={13}>
                                      <div className="pl-10">
                                        <div className="flex items-center gap-3">
                                          <div className="flex-1">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                              Search Project
                                            </label>
                                            <input
                                              type="text"
                                              value={projectSearchQuery}
                                              onChange={(e) => {
                                                setProjectSearchQuery(e.target.value);
                                                setSelectedProjectToAdd('');
                                              }}
                                              placeholder="Type project name or owner..."
                                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                              autoFocus
                                            />
                                            {projectSearchLoading && (
                                              <p className="text-xs text-gray-500 mt-1">Searching...</p>
                                            )}
                                            {!projectSearchLoading && searchedProjects.length === 0 && projectSearchQuery && (
                                              <p className="text-xs text-gray-500 mt-1">No projects found</p>
                                            )}
                                            {searchedProjects.length > 0 && (
                                              <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md">
                                                {searchedProjects.map((project) => (
                                                  <button
                                                    key={project.id}
                                                    onClick={() => {
                                                      setSelectedProjectToAdd(project.id);
                                                      setProjectSearchQuery(project.name);
                                                      setSearchedProjects([]);
                                                    }}
                                                    className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                                                      selectedProjectToAdd === project.id ? 'bg-blue-100' : 'bg-white'
                                                    }`}
                                                  >
                                                    <div className="font-medium text-gray-900">{project.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                      {project.owner} • {project.status}
                                                    </div>
                                                  </button>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex gap-2 pt-5">
                                            <button
                                              onClick={() => handleAddProject(resource.id)}
                                              disabled={!selectedProjectToAdd}
                                              className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
                                            >
                                              Add
                                            </button>
                                            <button
                                              onClick={handleCancelAddProject}
                                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors whitespace-nowrap"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                        <p className="mt-2 text-xs text-gray-500">
                                          Type to search by name or owner • Showing up to 10 results
                                        </p>
                                      </div>
                                    </td>
                                  </tr>
                                ) : (
                                  <tr className="bg-gray-50 hover:bg-gray-100">
                                    <td className="px-4 py-2 sticky left-0 bg-gray-50 hover:bg-gray-100 z-10 border-r border-gray-300" colSpan={13}>
                                      <button
                                        onClick={() => setAddingProjectForResource(resource.id)}
                                        className="flex items-center gap-2 pl-10 text-sm text-orange-600 hover:text-orange-700 font-medium"
                                      >
                                        <Plus className="w-4 h-4" />
                                        Add Project
                                      </button>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {paginatedResources.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {resourceViewSearchQuery 
                  ? `No resources found matching "${resourceViewSearchQuery}"`
                  : 'No active resources found'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredResources.length > 0 && (
          <div className="mt-4">
            <Pagination
              currentPage={resourceViewCurrentPage}
              totalPages={totalPages}
              pageSize={resourceViewPageSize}
              totalItems={filteredResources.length}
              onPageChange={setResourceViewCurrentPage}
              onPageSizeChange={(newSize) => {
                setResourceViewPageSize(newSize);
                setResourceViewCurrentPage(1);
              }}
            />
          </div>
        )}

        {/* Quick Add Project Modal */}
        {showAddProjectModal && addProjectModalResourceId && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={handleCloseQuickAddProjectModal}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Add Project
              </h3>
              <div className="text-sm text-gray-600 mb-4">
                Adding project to: <strong>{resources.find(r => r.id === addProjectModalResourceId)?.name}</strong>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Project
                  </label>
                  <input
                    type="text"
                    value={projectSearchQuery}
                    onChange={(e) => {
                      setProjectSearchQuery(e.target.value);
                      setSelectedProjectToAdd('');
                    }}
                    placeholder="Type project name or owner..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    autoFocus
                  />
                  {projectSearchLoading && (
                    <p className="text-xs text-gray-500 mt-1">Searching...</p>
                  )}
                  {!projectSearchLoading && searchedProjects.length === 0 && projectSearchQuery && (
                    <p className="text-xs text-gray-500 mt-1">No projects found</p>
                  )}
                  {searchedProjects.length > 0 && (
                    <div className="mt-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                      {searchedProjects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => {
                            setSelectedProjectToAdd(project.id);
                            setProjectSearchQuery(project.name);
                            setSearchedProjects([]);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-orange-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                            selectedProjectToAdd === project.id ? 'bg-orange-100' : 'bg-white'
                          }`}
                        >
                          <div className="font-medium text-gray-900">{project.name}</div>
                          <div className="text-xs text-gray-500">
                            {project.owner} • {project.status}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleAddProject(addProjectModalResourceId)}
                  disabled={!selectedProjectToAdd}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add Project
                </button>
                <button
                  onClick={handleCloseQuickAddProjectModal}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>

              <p className="mt-4 text-xs text-gray-500">
                This will create 0% allocations for all 12 months. You can edit them inline afterward.
              </p>
            </div>
          </div>
        )}
      </>
    );
  };

  // BY PROJECT VIEW (enhanced with add/remove resource and project editing)
  const renderByProjectView = () => {
    const monthlyData: Record<
      string,
      Record<number, { total: number; resources: string[]; byResource: Record<string, { percentage: number; allocationId: string; resourceRole: string; resourceSeniority: string }> }>
    > = {};

    projects.forEach((project) => {
      monthlyData[project.id] = {};
      for (let month = 1; month <= 12; month++) {
        monthlyData[project.id][month] = { total: 0, resources: [], byResource: {} };
      }
    });

    allocations.forEach((alloc) => {
      if (monthlyData[alloc.projectId]) {
        monthlyData[alloc.projectId][alloc.month].total += alloc.percentage;
        if (!monthlyData[alloc.projectId][alloc.month].resources.includes(alloc.resourceName)) {
          monthlyData[alloc.projectId][alloc.month].resources.push(alloc.resourceName);
        }
        monthlyData[alloc.projectId][alloc.month].byResource[alloc.resourceName] = {
          percentage: alloc.percentage,
          allocationId: alloc.id,
          resourceRole: alloc.resourceRole,
          resourceSeniority: alloc.resourceSeniority,
        };
      }
    });

    const getProjectResources = (projectId: string): Array<{ name: string; role: string; seniority: string }> => {
      const resourceMap = new Map<string, { name: string; role: string; seniority: string }>();
      allocations
        .filter((alloc) => alloc.projectId === projectId)
        .forEach((alloc) => {
          if (!resourceMap.has(alloc.resourceName)) {
            resourceMap.set(alloc.resourceName, {
              name: alloc.resourceName,
              role: alloc.resourceRole,
              seniority: alloc.resourceSeniority,
            });
          }
        });
      return Array.from(resourceMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    };

    return (
      <>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-20">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-20 border-r border-gray-300 min-w-[250px]">
                  Project
                </th>
                {MONTHS.map((month, idx) => (
                  <th
                    key={idx}
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]"
                  >
                    {month.substring(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => {
                const isExpanded = expandedRows.has(project.id);
                const projectResources = getProjectResources(project.id);
                const hasResources = projectResources.length > 0;
                const isInEditMode = editMode?.parentId === project.id;
                const isAddingResource = addingResourceForProject === project.id;

                return (
                  <React.Fragment key={project.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap sticky left-0 bg-white hover:bg-gray-50 z-10 border-r border-gray-300">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleRow(project.id)}
                            className={`flex-shrink-0 p-1 rounded hover:bg-gray-200 transition-colors ${
                              !hasResources ? 'invisible' : ''
                            }`}
                            disabled={!hasResources}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-600" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {project.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {project.owner} • {project.status}
                            </div>
                          </div>
                          <button
                            onClick={() => handleEditProject(project.id)}
                            className="p-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded transition-colors"
                            title="Edit project details"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      {Array.from({ length: 12 }, (_, idx) => idx + 1).map(
                        (month) => {
                          const data = monthlyData[project.id]?.[month];
                          const total = data?.total || 0;
                          const resourcesList = data?.resources || [];

                          return (
                            <td
                              key={month}
                              className={`px-4 py-3 text-center text-sm font-semibold ${getCellColor(
                                total
                              )} ${getCellBorder(total)}`}
                              title={
                                resourcesList.length > 0
                                  ? `Resources: ${resourcesList.join(', ')}`
                                  : 'No allocations'
                              }
                            >
                              {total > 0 ? `${total}%` : '-'}
                            </td>
                          );
                        }
                      )}
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td colSpan={13} className="p-0">
                          <div ref={isInEditMode ? editAreaRef : null} className={`${isInEditMode ? 'ring-2 ring-green-400' : ''}`}>
                            <table className="min-w-full">
                              <tbody>
                                {projectResources.map((resource) => (
                                  <tr
                                    key={`${project.id}-${resource.name}`}
                                    className="bg-green-50 hover:bg-green-100 group"
                                  >
                                    <td className="px-4 py-2 whitespace-nowrap sticky left-0 bg-green-50 hover:bg-green-100 z-10 border-r border-gray-300 min-w-[250px]">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 pl-10">
                                          <div>
                                            <div className="text-sm text-gray-900">
                                              {resource.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              {resource.role} • {resource.seniority}
                                            </div>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => handleRemoveResource(project.id, resource.name)}
                                          className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-all"
                                          title="Remove resource from project"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                    {Array.from({ length: 12 }, (_, idx) => idx + 1).map(
                                      (month) => {
                                        const data = monthlyData[project.id]?.[month];
                                        const resourceData = data?.byResource[resource.name];
                                        const percentage = resourceData?.percentage || 0;
                                        const allocationId = resourceData?.allocationId;
                                        const key = `${resource.name}-${month}`;
                                        const editValue = isInEditMode && editMode.values[key] ? editMode.values[key].value : percentage.toString();
                                        const isSaving = allocationId ? saving.has(allocationId) : false;

                                        return (
                                          <td
                                            key={month}
                                            className={`px-2 py-2 text-center text-sm border border-gray-200 ${
                                              isInEditMode ? 'bg-yellow-50' : 'bg-white'
                                            }`}
                                            style={{ minWidth: '100px' }}
                                          >
                                            {isInEditMode ? (
                                              <input
                                                ref={(el) => {
                                                  if (el) inputRefs.current[key] = el;
                                                }}
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="1"
                                                value={editValue}
                                                onChange={(e) =>
                                                  updateEditValue(resource.name, month, e.target.value)
                                                }
                                                onKeyDown={(e) =>
                                                  handleKeyDown(e, resource.name, month, projectResources.map(r => r.name))
                                                }
                                                onBlur={() => handleBlur(resource.name, month)}
                                                onClick={(e) => (e.target as HTMLInputElement).select()}
                                                className={`w-full px-1 py-0.5 border rounded text-center focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                                  isSaving ? 'bg-gray-100 cursor-wait' : 'border-green-300'
                                                }`}
                                                disabled={isSaving}
                                              />
                                            ) : (
                                              <button
                                                onClick={() => {
                                                  const items = projectResources.map(res => ({
                                                    name: res.name,
                                                    months: Array.from({ length: 12 }, (_, i) => i + 1).map(m => ({
                                                      month: m,
                                                      percentage: monthlyData[project.id]?.[m]?.byResource[res.name]?.percentage || 0,
                                                      allocationId: monthlyData[project.id]?.[m]?.byResource[res.name]?.allocationId || null,
                                                    })),
                                                  }));
                                                  enterEditMode(project.id, items);
                                                  setTimeout(() => {
                                                    const inputRef = inputRefs.current[key];
                                                    if (inputRef) {
                                                      inputRef.focus();
                                                      inputRef.select();
                                                    }
                                                  }, 0);
                                                }}
                                                className={`w-full font-medium hover:bg-green-100 px-2 py-1 rounded transition-colors ${
                                                  percentage === 0 ? 'text-gray-400 hover:text-green-700' : 'text-green-700'
                                                }`}
                                              >
                                                {percentage === 0 ? '0%' : `${percentage}%`}
                                              </button>
                                            )}
                                          </td>
                                        );
                                      }
                                    )}
                                  </tr>
                                ))}

                                {/* Add Resource Row */}
                                {isAddingResource ? (
                                  <tr className="bg-orange-50">
                                    <td className="px-4 py-3 sticky left-0 bg-orange-50 z-10 border-r border-gray-300" colSpan={13}>
                                      <div className="pl-10">
                                        <div className="max-w-2xl">
                                          <div className="flex items-start gap-3">
                                            <div className="flex-1">
                                              <input
                                                type="text"
                                                placeholder="Search engineer by name..."
                                                value={resourceSearchQuery}
                                                onChange={(e) => setResourceSearchQuery(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                autoFocus
                                              />
                                              {/* Search Results Dropdown */}
                                              {resourceSearchQuery && (
                                                <div className="mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-y-auto">
                                                  {searchLoading ? (
                                                    <div className="px-3 py-2 text-sm text-gray-500">
                                                      Searching...
                                                    </div>
                                                  ) : searchedResources.length > 0 ? (
                                                    searchedResources.map((resource) => (
                                                      <button
                                                        key={resource.id}
                                                        onClick={() => {
                                                          setSelectedResourceToAdd(resource.id);
                                                          setResourceSearchQuery(resource.name);
                                                        }}
                                                        className={`w-full px-3 py-2 text-left text-sm hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                                                          selectedResourceToAdd === resource.id ? 'bg-blue-100' : ''
                                                        }`}
                                                      >
                                                        <div className="font-medium text-gray-900">
                                                          {resource.name}
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                          {resource.role} • {resource.seniority}
                                                          {resource.skills.length > 0 && (
                                                            <span className="ml-2 text-gray-400">
                                                              • {resource.skills.slice(0, 3).join(', ')}
                                                            </span>
                                                          )}
                                                        </div>
                                                      </button>
                                                    ))
                                                  ) : (
                                                    <div className="px-3 py-2 text-sm text-gray-500">
                                                      No resources found
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                            <div className="flex gap-2">
                                              <button
                                                onClick={() => handleAddResource(project.id)}
                                                disabled={!selectedResourceToAdd}
                                                className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
                                              >
                                                Add
                                              </button>
                                              <button
                                                onClick={handleCancelAddResource}
                                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors whitespace-nowrap"
                                              >
                                                Cancel
                                              </button>
                                            </div>
                                          </div>
                                          <p className="mt-2 text-xs text-gray-500">
                                            Type to search by name • Showing up to 10 results
                                          </p>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                ) : (
                                  <tr className="bg-gray-50 hover:bg-gray-100">
                                    <td className="px-4 py-2 sticky left-0 bg-gray-50 hover:bg-gray-100 z-10 border-r border-gray-300" colSpan={13}>
                                      <button
                                        onClick={() => setAddingResourceForProject(project.id)}
                                        className="flex items-center gap-2 pl-10 text-sm text-orange-600 hover:text-orange-700 font-medium"
                                      >
                                        <Plus className="w-4 h-4" />
                                        Add Resource
                                      </button>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Quick Add Project Row */}
              {showQuickAddProject ? (
                <tr className="bg-orange-50">
                  <td colSpan={13} className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        placeholder="Project Name*"
                        value={quickProjectForm.name}
                        onChange={(e) => setQuickProjectForm({ ...quickProjectForm, name: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <input
                        type="text"
                        placeholder="Owner*"
                        value={quickProjectForm.owner}
                        onChange={(e) => setQuickProjectForm({ ...quickProjectForm, owner: e.target.value })}
                        className="w-48 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <select
                        value={quickProjectForm.status}
                        onChange={(e) => setQuickProjectForm({ ...quickProjectForm, status: e.target.value })}
                        className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="planned">Planned</option>
                        <option value="active">Active</option>
                        <option value="on-hold">On Hold</option>
                        <option value="completed">Completed</option>
                      </select>
                      <button
                        onClick={handleQuickAddProject}
                        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors whitespace-nowrap"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => {
                          setShowQuickAddProject(false);
                          setQuickProjectForm({ name: '', owner: '', status: 'planned' });
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr className="bg-gray-50 hover:bg-gray-100">
                  <td colSpan={13} className="px-4 py-3">
                    <button
                      onClick={() => setShowQuickAddProject(true)}
                      className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Quick Add Project
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {projects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No projects found</p>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Monthly Allocation Overview
          </h1>
          <p className="text-gray-600 mt-2">
            Click any cell to enter edit mode • Navigate with arrow keys • Auto-saves on exit
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* View Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Views">
          <button
            onClick={() => {
              setViewMode('by-resource');
              setExpandedRows(new Set());
              setEditMode(null);
            }}
            className={`${
              viewMode === 'by-resource'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            By Resource
          </button>
          <button
            onClick={() => {
              setViewMode('by-project');
              setExpandedRows(new Set());
              setEditMode(null);
            }}
            className={`${
              viewMode === 'by-project'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            By Project
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <p className="text-gray-600 mt-4">Loading allocations...</p>
        </div>
      ) : (
        <>
          {viewMode === 'by-resource' ? renderByResourceView() : renderByProjectView()}

          {/* Legend */}
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Allocation Legend & Controls
            </h3>
            <div className="flex flex-wrap gap-4 text-xs mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-6 bg-gray-50 border border-gray-200 rounded"></div>
                <span className="text-gray-600">0% (Not allocated)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-6 bg-green-100 border border-gray-200 rounded"></div>
                <span className="text-gray-600">&lt; 50% (Under-allocated)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-6 bg-yellow-100 border border-gray-200 rounded"></div>
                <span className="text-gray-600">50-79% (Moderate)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-6 bg-orange-100 border border-gray-200 rounded"></div>
                <span className="text-gray-600">80-99% (High utilization)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-6 bg-blue-100 border-2 border-orange-500 rounded"></div>
                <span className="text-gray-600">100% (Fully allocated)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-6 bg-red-100 border-2 border-red-500 rounded"></div>
                <span className="text-gray-600">&gt; 100% (Over-allocated!)</span>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-3 space-y-2 text-xs text-gray-600">
              <p>
                <strong>⌨️ Keyboard Navigation:</strong> Arrow Keys (↑ ↓ ← →) to move between cells • Tab/Enter to move forward • Escape to exit edit mode
              </p>
              <p>
                <strong>💾 Auto-Save:</strong> Changes save automatically when you leave a cell or click outside the edit area
              </p>
              {viewMode === 'by-resource' && (
                <>
                  <p>
                    <strong>➕ Add Project:</strong> In expanded rows, click "+ Add Project" to assign projects to the resource
                  </p>
                  <p>
                    <strong>🗑️ Remove Project:</strong> Hover over a project row and click the trash icon to remove
                  </p>
                </>
              )}
              {viewMode === 'by-project' && (
                <>
                  <p>
                    <strong>➕ Add Resource:</strong> In expanded rows, click "+ Add Resource" to assign resources to the project
                  </p>
                  <p>
                    <strong>🗑️ Remove Resource:</strong> Hover over a resource row and click the trash icon to remove
                  </p>
                  <p>
                    <strong>🔗 Edit Project:</strong> Click the external link icon next to project name for full project details
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">
                {viewMode === 'by-resource' ? 'Total Resources' : 'Total Projects'}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {viewMode === 'by-resource'
                  ? resources.filter((r) => r.status === 'active').length
                  : projects.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Total Allocations</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {allocations.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Year Selected</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {selectedYear}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Edit Mode</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {editMode ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Project Modal */}
      {showProjectModal && (
        <ProjectModal
          isOpen={showProjectModal}
          onClose={() => {
            setShowProjectModal(false);
            setEditingProject(null);
          }}
          onSave={handleSaveProject}
          project={editingProject}
          availableResources={resources}
          availablePods={pods}
        />
      )}
    </div>
  );
}
