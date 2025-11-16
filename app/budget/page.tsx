'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, TrendingUp, Calendar, ExternalLink } from 'lucide-react';
import { useData } from '@/context/DataContext';
import ProjectModal from '@/components/ProjectModal';

interface BudgetData {
  projectId: string;
  projectName: string;
  projectStatus: string;
  owner: string;
  budgetManDays: number;
  allocatedManDays: number;
  consumedManDays: number;
  remainingManDays: number;
  percentageUsed: number;
  status: 'on-track' | 'at-risk' | 'over-budget';
  startDate?: string;
  endDate?: string;
  allocationCount: number;
}

export default function BudgetPage() {
  const { resources, pods, projects, refreshData } = useData();
  const [budgets, setBudgets] = useState<BudgetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'on-track' | 'at-risk' | 'over-budget'>('all');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/budget');
      if (response.ok) {
        const data = await response.json();
        setBudgets(data);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBudgets = budgets.filter((b) => filter === 'all' || b.status === filter);

  const handleEditProject = (projectId: string) => {
    setEditingProjectId(projectId);
    setShowProjectModal(true);
  };

  const handleSaveProject = async (projectData: any) => {
    try {
      const url = editingProjectId
        ? `/api/projects/${editingProjectId}`
        : '/api/projects';
      const method = editingProjectId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        await refreshData();
        await fetchBudgets(); // Refresh budget data
        setShowProjectModal(false);
        setEditingProjectId(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save project');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project');
    }
  };

  const editingProject = editingProjectId 
    ? projects.find(p => p.id === editingProjectId)
    : undefined;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'at-risk':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'over-budget':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'at-risk':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'over-budget':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage > 100) return 'bg-red-600';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Calculate summary stats
  const stats = {
    total: budgets.length,
    onTrack: budgets.filter((b) => b.status === 'on-track').length,
    atRisk: budgets.filter((b) => b.status === 'at-risk').length,
    overBudget: budgets.filter((b) => b.status === 'over-budget').length,
    totalBudget: budgets.reduce((sum, b) => sum + b.budgetManDays, 0),
    totalConsumed: budgets.reduce((sum, b) => sum + b.consumedManDays, 0),
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Project Budget Tracking</h1>
        <p className="text-gray-600 mt-2">
          Monitor project budgets in Man Days and identify projects at risk of overconsumption
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg shadow p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">On Track</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.onTrack}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg shadow p-4 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 font-medium">At Risk</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.atRisk}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-red-50 rounded-lg shadow p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">Over Budget</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{stats.overBudget}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg shadow p-4 border border-blue-200">
          <div>
            <p className="text-sm text-orange-700 font-medium">Total Budget</p>
            <p className="text-xl font-bold text-blue-900 mt-1">
              {Math.round(stats.totalBudget)} MD
            </p>
            <p className="text-xs text-orange-600 mt-1">
              {Math.round(stats.totalConsumed)} MD consumed
            </p>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            filter === 'all'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Projects
        </button>
        <button
          onClick={() => setFilter('on-track')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            filter === 'on-track'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          On Track
        </button>
        <button
          onClick={() => setFilter('at-risk')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            filter === 'at-risk'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          At Risk
        </button>
        <button
          onClick={() => setFilter('over-budget')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            filter === 'over-budget'
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Over Budget
        </button>
      </div>

      {/* Budget Table */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <p className="text-gray-600 mt-4">Loading budget data...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget (MD)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allocated (MD)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Consumed (MD)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remaining (MD)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allocations
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBudgets.map((budget) => (
                  <tr key={budget.projectId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(budget.status)}
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded border ${getStatusColor(
                            budget.status
                          )}`}
                        >
                          {budget.status.replace('-', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <button
                            onClick={() => handleEditProject(budget.projectId)}
                            className="text-sm font-medium text-gray-900 hover:text-orange-600 transition-colors text-left"
                          >
                            {budget.projectName}
                          </button>
                          <div className="text-xs text-gray-500">
                            {budget.projectStatus}
                          </div>
                        </div>
                        <button
                          onClick={() => handleEditProject(budget.projectId)}
                          className="p-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded transition-colors"
                          title="Edit project details"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {budget.owner}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                      {budget.budgetManDays}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-blue-600">
                      {budget.allocatedManDays}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {budget.consumedManDays}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                        budget.remainingManDays < 0
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {budget.remainingManDays}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${getProgressBarColor(
                              budget.percentageUsed
                            )}`}
                            style={{
                              width: `${Math.min(budget.percentageUsed, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 min-w-[50px] text-right">
                          {budget.percentageUsed}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                      {budget.allocationCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredBudgets.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No projects found for this filter
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Budget Status Legend
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">On Track</p>
              <p className="text-gray-600">Budget usage &lt; 80%</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">At Risk</p>
              <p className="text-gray-600">Budget usage 80-100%</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Over Budget</p>
              <p className="text-gray-600">Budget usage &gt; 100%</p>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            <strong>Note:</strong> Man Days (MD) are calculated based on working
            days (excluding weekends). Allocation percentage × working days in
            month = Man Days consumed.
          </p>
        </div>
      </div>

      {/* Project Modal */}
      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => {
          setShowProjectModal(false);
          setEditingProjectId(null);
        }}
        onSave={handleSaveProject}
        project={editingProject}
        availableResources={resources}
        availablePods={pods}
      />
    </div>
  );
}

