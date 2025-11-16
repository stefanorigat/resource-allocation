'use client';

import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Skill } from '@/types';
import { Plus, Trash2, Check, X } from 'lucide-react';

interface EditingState {
  skillId: string | null;
  name: string;
  category: string;
}

export default function SkillsSettingsPage() {
  const { skills, loading, refreshData } = useData();
  const [editing, setEditing] = useState<EditingState>({ skillId: null, name: '', category: '' });
  const [addingNew, setAddingNew] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', category: '' });
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showEditCategoryDropdown, setShowEditCategoryDropdown] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [editCategoryFilter, setEditCategoryFilter] = useState('');

  const handleEdit = (skill: Skill) => {
    setEditing({ skillId: skill.id, name: skill.name, category: skill.category });
  };

  const handleCancelEdit = () => {
    setEditing({ skillId: null, name: '', category: '' });
  };

  const handleSaveEdit = async (skillId: string) => {
    try {
      const response = await fetch(`/api/skills/${skillId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editing.name, category: editing.category }),
      });

      if (response.ok) {
        await refreshData();
        setEditing({ skillId: null, name: '', category: '' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update skill');
      }
    } catch (error) {
      console.error('Error updating skill:', error);
      alert('Failed to update skill');
    }
  };

  const handleDelete = async (skill: Skill) => {
    if (!confirm(`Are you sure you want to delete "${skill.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/skills/${skill.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await refreshData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete skill');
      }
    } catch (error) {
      console.error('Error deleting skill:', error);
      alert('Failed to delete skill');
    }
  };

  const handleAddNew = () => {
    setAddingNew(true);
    setNewSkill({ name: '', category: '' });
  };

  const handleCancelAdd = () => {
    setAddingNew(false);
    setNewSkill({ name: '', category: '' });
  };

  const handleSaveNew = async () => {
    if (!newSkill.name || !newSkill.category) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSkill),
      });

      if (response.ok) {
        await refreshData();
        setAddingNew(false);
        setNewSkill({ name: '', category: '' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create skill');
      }
    } catch (error) {
      console.error('Error creating skill:', error);
      alert('Failed to create skill');
    }
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  // Get unique categories for the dropdown
  const uniqueCategories = Array.from(new Set(skills.map(s => s.category))).sort();
  
  // Filter categories based on input (for add mode)
  const filteredCategories = uniqueCategories.filter(cat => 
    cat.toLowerCase().includes(categoryFilter.toLowerCase())
  );

  // Filter categories for edit mode
  const filteredEditCategories = uniqueCategories.filter(cat => 
    cat.toLowerCase().includes(editCategoryFilter.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Skills Management</h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage programming languages, frameworks, and tools
          </p>
        </div>
        <button
          onClick={handleAddNew}
          disabled={addingNew}
          className="px-3 py-1.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 flex items-center gap-2 text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Skill
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <p className="text-gray-600 mt-4">Loading skills...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Add New Skill Row */}
          {addingNew && (
            <div className="bg-orange-50 rounded-lg border-2 border-orange-300 p-3">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Skill name"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveNew();
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        handleCancelAdd();
                      }
                    }}
                    onBlur={(e) => {
                      const relatedTarget = e.relatedTarget as HTMLElement;
                      if (!relatedTarget || !relatedTarget.closest('.add-container')) {
                        // Don't auto-save on blur for new items, just wait for explicit save
                      }
                    }}
                    autoFocus
                  />
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Category (e.g., Framework, Tool)"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={newSkill.category}
                    onChange={(e) => {
                      setNewSkill({ ...newSkill, category: e.target.value });
                      setCategoryFilter(e.target.value);
                      setShowCategoryDropdown(e.target.value.length > 0);
                    }}
                    onFocus={() => {
                      setCategoryFilter(newSkill.category);
                      if (newSkill.category.length > 0) {
                        setShowCategoryDropdown(true);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowCategoryDropdown(false), 200);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setShowCategoryDropdown(false);
                        handleSaveNew();
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        setShowCategoryDropdown(false);
                        handleCancelAdd();
                      } else if (e.key === 'ArrowDown' && showCategoryDropdown && filteredCategories.length > 0) {
                        e.preventDefault();
                        const firstItem = document.querySelector('.category-dropdown-item') as HTMLElement;
                        if (firstItem) firstItem.focus();
                      }
                    }}
                  />
                  {/* Category Dropdown */}
                  {showCategoryDropdown && filteredCategories.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredCategories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          className="category-dropdown-item w-full px-3 py-2 text-left text-sm hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0 focus:bg-orange-100 focus:outline-none"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setNewSkill({ ...newSkill, category });
                            setCategoryFilter(category);
                            setShowCategoryDropdown(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              setNewSkill({ ...newSkill, category });
                              setCategoryFilter(category);
                              setShowCategoryDropdown(false);
                            }
                          }}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 add-container flex-shrink-0">
                  <button
                    onClick={handleSaveNew}
                    className="p-1.5 text-green-600 hover:bg-green-100 rounded"
                    title="Save (Enter)"
                    tabIndex={-1}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelAdd}
                    className="p-1.5 text-gray-600 hover:bg-gray-200 rounded"
                    title="Cancel (Esc)"
                    tabIndex={-1}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                <h2 className="text-sm font-semibold text-gray-700">{category}</h2>
              </div>
              <div className="p-3">
                <div className="space-y-2">
                  {categorySkills.map((skill) => (
                    <div
                      key={skill.id}
                      className={`flex items-center gap-2 px-2 py-2 border rounded transition-colors group ${
                        editing.skillId === skill.id
                          ? 'border-orange-400 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                      }`}
                    >
                      {editing.skillId === skill.id ? (
                        <div className="flex items-center gap-2 flex-1 edit-area">
                          <div className="flex-1">
                            <input
                              type="text"
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                              value={editing.name}
                              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveEdit(skill.id);
                                } else if (e.key === 'Escape') {
                                  e.preventDefault();
                                  handleCancelEdit();
                                }
                              }}
                              onBlur={(e) => {
                                const relatedTarget = e.relatedTarget as HTMLElement;
                                // Only save if we're not moving to another field within the edit area
                                if (!relatedTarget || (!relatedTarget.closest('.edit-area') && !relatedTarget.closest('.edit-buttons'))) {
                                  handleSaveEdit(skill.id);
                                }
                              }}
                              placeholder="Skill name"
                              autoFocus
                            />
                          </div>
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                              value={editing.category}
                              onChange={(e) => {
                                setEditing({ ...editing, category: e.target.value });
                                setEditCategoryFilter(e.target.value);
                                setShowEditCategoryDropdown(e.target.value.length > 0);
                              }}
                              onFocus={() => {
                                setEditCategoryFilter(editing.category);
                                if (editing.category.length > 0) {
                                  setShowEditCategoryDropdown(true);
                                }
                              }}
                              onBlur={(e) => {
                                const relatedTarget = e.relatedTarget as HTMLElement;
                                // Close dropdown
                                setTimeout(() => setShowEditCategoryDropdown(false), 200);
                                // Only save if we're not moving to another field within the edit area
                                if (!relatedTarget || (!relatedTarget.closest('.edit-area') && !relatedTarget.closest('.edit-buttons'))) {
                                  handleSaveEdit(skill.id);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  setShowEditCategoryDropdown(false);
                                  handleSaveEdit(skill.id);
                                } else if (e.key === 'Escape') {
                                  e.preventDefault();
                                  setShowEditCategoryDropdown(false);
                                  handleCancelEdit();
                                } else if (e.key === 'ArrowDown' && showEditCategoryDropdown && filteredEditCategories.length > 0) {
                                  e.preventDefault();
                                  const firstItem = document.querySelector('.edit-category-dropdown-item') as HTMLElement;
                                  if (firstItem) firstItem.focus();
                                }
                              }}
                              placeholder="Category"
                            />
                            {/* Category Dropdown for Edit Mode */}
                            {showEditCategoryDropdown && filteredEditCategories.length > 0 && (
                              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                {filteredEditCategories.map((category) => (
                                  <button
                                    key={category}
                                    type="button"
                                    className="edit-category-dropdown-item w-full px-3 py-2 text-left text-sm hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0 focus:bg-orange-100 focus:outline-none"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      setEditing({ ...editing, category });
                                      setEditCategoryFilter(category);
                                      setShowEditCategoryDropdown(false);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        setEditing({ ...editing, category });
                                        setEditCategoryFilter(category);
                                        setShowEditCategoryDropdown(false);
                                      }
                                    }}
                                  >
                                    {category}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1 edit-buttons flex-shrink-0">
                            <button
                              onClick={() => handleSaveEdit(skill.id)}
                              className="p-1.5 text-green-600 hover:bg-green-100 rounded"
                              title="Save (Enter)"
                              tabIndex={-1}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1.5 text-gray-600 hover:bg-gray-200 rounded"
                              title="Cancel (Esc)"
                              tabIndex={-1}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(skill)}
                            className="flex-1 text-left text-sm font-medium text-gray-900 hover:text-orange-600 truncate"
                          >
                            {skill.name}
                          </button>
                          <span className="text-xs text-gray-500 flex-shrink-0 min-w-[100px]">
                            {skill.category}
                          </span>
                          <button
                            onClick={() => handleDelete(skill)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {skills.length === 0 && !addingNew && (
            <div className="bg-white rounded-lg shadow p-8 text-center border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">No skills yet</h3>
              <p className="text-gray-500 mt-2 text-sm">Get started by adding your first skill</p>
              <button
                onClick={handleAddNew}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm"
              >
                Add Skill
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

