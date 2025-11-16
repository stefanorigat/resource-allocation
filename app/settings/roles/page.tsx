'use client';

import { useState, useEffect } from 'react';
import { Role } from '@/types';
import { Plus, Trash2, Check, X } from 'lucide-react';

interface EditingState {
  roleId: string | null;
  name: string;
  description: string;
}

export default function RolesSettingsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditingState>({ roleId: null, name: '', description: '' });
  const [addingNew, setAddingNew] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/roles');
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (role: Role) => {
    setEditing({ roleId: role.id, name: role.name, description: role.description || '' });
  };

  const handleCancelEdit = () => {
    setEditing({ roleId: null, name: '', description: '' });
  };

  const handleSaveEdit = async (roleId: string) => {
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editing.name, description: editing.description }),
      });

      if (response.ok) {
        await fetchRoles();
        setEditing({ roleId: null, name: '', description: '' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
    }
  };

  const handleDelete = async (role: Role) => {
    if (!confirm(`Are you sure you want to delete "${role.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/roles/${role.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchRoles();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete role');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      alert('Failed to delete role');
    }
  };

  const handleAddNew = () => {
    setAddingNew(true);
    setNewRole({ name: '', description: '' });
  };

  const handleCancelAdd = () => {
    setAddingNew(false);
    setNewRole({ name: '', description: '' });
  };

  const handleSaveNew = async () => {
    if (!newRole.name) {
      alert('Please enter a role name');
      return;
    }

    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRole),
      });

      if (response.ok) {
        await fetchRoles();
        setAddingNew(false);
        setNewRole({ name: '', description: '' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create role');
      }
    } catch (error) {
      console.error('Error creating role:', error);
      alert('Failed to create role');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles Management</h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage engineer roles and positions
          </p>
        </div>
        <button
          onClick={handleAddNew}
          disabled={addingNew}
          className="px-3 py-1.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 flex items-center gap-2 text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Role
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <p className="text-gray-600 mt-4">Loading roles...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Add New Role Row */}
          {addingNew && (
            <div className="bg-orange-50 rounded-lg border-2 border-orange-300 p-3">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Role name (e.g., Senior Developer)"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 mb-2"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveNew();
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        handleCancelAdd();
                      }
                    }}
                    autoFocus
                  />
                  <textarea
                    placeholder="Description (optional)"
                    rows={2}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        handleCancelAdd();
                      }
                    }}
                  />
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

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="divide-y divide-gray-200">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={`px-3 py-2 transition-colors group ${
                    editing.roleId === role.id
                      ? 'bg-orange-50 border-l-4 border-l-blue-400'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {editing.roleId === role.id ? (
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 mb-2 font-medium"
                          value={editing.name}
                          onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveEdit(role.id);
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              handleCancelEdit();
                            }
                          }}
                          placeholder="Role name"
                          autoFocus
                        />
                        <textarea
                          rows={2}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                          value={editing.description}
                          onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              e.preventDefault();
                              handleCancelEdit();
                            }
                          }}
                          placeholder="Description (optional)"
                        />
                      </div>
                      <div className="flex gap-1 edit-container flex-shrink-0">
                        <button
                          onClick={() => handleSaveEdit(role.id)}
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
                    <div className="flex items-start justify-between gap-3">
                      <button
                        onClick={() => handleEdit(role)}
                        className="flex-1 text-left"
                      >
                        <h3 className="text-sm font-semibold text-gray-900 hover:text-orange-600">
                          {role.name}
                        </h3>
                        {role.description && (
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                            {role.description}
                          </p>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(role)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {roles.length === 0 && !addingNew && (
                <div className="p-8 text-center border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">No roles yet</h3>
                  <p className="text-gray-500 mt-2 text-sm">Get started by adding your first role</p>
                  <button
                    onClick={handleAddNew}
                    className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm"
                  >
                    Add Role
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

