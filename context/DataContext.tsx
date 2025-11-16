'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Resource, Pod, Project, Skill } from '@/types';

interface DataContextType {
  resources: Resource[];
  pods: Pod[];
  projects: Project[];
  skills: Skill[];
  loading: boolean;
  addResource: (resource: any) => Promise<void>;
  updateResource: (id: string, resource: any) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  addPod: (pod: any) => Promise<void>;
  updatePod: (id: string, pod: any) => Promise<void>;
  deletePod: (id: string) => Promise<void>;
  addProject: (project: any) => Promise<void>;
  updateProject: (id: string, project: any) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addSkill: (skill: Skill) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [pods, setPods] = useState<Pod[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [resourcesRes, podsRes, projectsRes, skillsRes] = await Promise.all([
        fetch('/api/resources'),
        fetch('/api/pods'),
        fetch('/api/projects'),
        fetch('/api/skills'),
      ]);

      if (resourcesRes.ok) {
        const resourcesData = await resourcesRes.json();
        setResources(resourcesData.map((r: any) => ({
          ...r,
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt),
        })));
      }

      if (podsRes.ok) {
        const podsData = await podsRes.json();
        setPods(podsData.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        })));
      }

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
          startDate: p.startDate ? new Date(p.startDate) : undefined,
          endDate: p.endDate ? new Date(p.endDate) : undefined,
        })));
      }

      if (skillsRes.ok) {
        const skillsData = await skillsRes.json();
        setSkills(skillsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addResource = async (resource: any) => {
    try {
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resource),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add resource');
      }

      await refreshData();
    } catch (error) {
      console.error('Error adding resource:', error);
      throw error;
    }
  };

  const updateResource = async (id: string, updatedResource: any) => {
    try {
      const response = await fetch(`/api/resources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedResource),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update resource');
      }

      await refreshData();
    } catch (error) {
      console.error('Error updating resource:', error);
      throw error;
    }
  };

  const deleteResource = async (id: string) => {
    try {
      const response = await fetch(`/api/resources/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setResources(resources.filter((resource) => resource.id !== id));
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw error;
    }
  };

  const addPod = async (pod: any) => {
    try {
      const response = await fetch('/api/pods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pod),
      });

      if (response.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error('Error adding pod:', error);
      throw error;
    }
  };

  const updatePod = async (id: string, updatedPod: any) => {
    try {
      const response = await fetch(`/api/pods/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPod),
      });

      if (response.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error('Error updating pod:', error);
      throw error;
    }
  };

  const deletePod = async (id: string) => {
    try {
      const response = await fetch(`/api/pods/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPods(pods.filter((pod) => pod.id !== id));
      }
    } catch (error) {
      console.error('Error deleting pod:', error);
      throw error;
    }
  };

  const addProject = async (project: any) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });

      if (response.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  };

  const updateProject = async (id: string, updatedProject: any) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProject),
      });

      if (response.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProjects(projects.filter((project) => project.id !== id));
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };

  const addSkill = async (skill: Skill) => {
    try {
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skill),
      });

      if (response.ok) {
        const newSkill = await response.json();
        setSkills([...skills, newSkill]);
      }
    } catch (error) {
      console.error('Error adding skill:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await fetchData();
  };

  return (
    <DataContext.Provider
      value={{
        resources,
        pods,
        projects,
        skills,
        loading,
        addResource,
        updateResource,
        deleteResource,
        addPod,
        updatePod,
        deletePod,
        addProject,
        updateProject,
        deleteProject,
        addSkill,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
