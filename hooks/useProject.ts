'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

// API Client for FlowSprint Backend
class APIClient {
  private baseURL = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api`;
  
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log('🌐 Making request to:', url);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async createProject(projectData: any): Promise<any> {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }
  
  async getAllProjects(): Promise<any> {
    return this.request('/projects');
  }
  
  async getProject(projectId: string): Promise<any> {
    return this.request(`/projects/${projectId}`);
  }
  
  async updateProject(projectId: string, updateData: any): Promise<any> {
    return this.request(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }
  
  async deleteProject(projectId: string): Promise<any> {
    return this.request(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  }
  
  async generateMindmap(projectId: string, complexity: string = 'medium'): Promise<any> {
    return this.request(`/projects/${projectId}/mindmap`, {
      method: 'POST',
      body: JSON.stringify({ complexity }),
    });
  }
}

const apiClient = new APIClient();

interface ProjectData {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  features: Record<string, string[]> | string[];
  techStack?: string[];
  tags?: string[];
  mindmap?: any;
  prd?: any;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateProjectData {
  name: string;
  product: string;
  description: string;
  features: Record<string, string[]>;
  techStack: string[];
  tags: string[];
}

interface ProjectResult {
  project: ProjectData;
  success: boolean;
  message?: string;
}

export function useProject() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProject = async (projectData: CreateProjectData): Promise<ProjectResult | null> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Creating project:', projectData);

      // Try to connect to real backend first
      try {
        const result = await apiClient.createProject({
          name: projectData.name,
          description: projectData.description,
          features: projectData.features || {},
          techStack: projectData.techStack || [],
          type: 'web-app',
          industry: 'tech',
          complexity: 'medium',
          tags: projectData.tags || [],
          collaborators: []
        });
        
        console.log('✅ Project created in backend:', result);
        return {
          project: result.data || result,
          success: true,
          message: 'Project created successfully'
        };
      } catch (backendError) {
        console.warn('⚠️ Backend creation failed, creating mock project:', backendError);
        
        // Fallback to mock project creation
        const mockProject: ProjectData = {
          id: `mock-project-${Date.now()}`,
          _id: `mock-project-${Date.now()}`,
          name: projectData.name,
          description: projectData.description,
          features: projectData.features,
          techStack: projectData.techStack,
          tags: projectData.tags,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        return {
          project: mockProject,
          success: true,
          message: 'Mock project created (backend offline)'
        };
      }
    } catch (err) {
      console.error('❌ Project creation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getProject = async (projectId: string): Promise<ProjectResult | null> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Getting project with ID:', projectId);

      // Check if it's a mock project ID (for development)
      if (projectId.startsWith('mock-project-')) {
        console.log('🎭 Using mock project data for development');
        
        // First check localStorage for the created project data
        const storedProject = localStorage.getItem(`project-${projectId}`);
        if (storedProject) {
          const projectData = JSON.parse(storedProject);
          console.log('📦 Loaded project from localStorage:', projectData);
          
          // Add mindmap data if not present
          if (!projectData.mindmap) {
            projectData.mindmap = {
              nodes: [
                {
                  id: 'start-1',
                  type: 'startNode',
                  position: { x: 100, y: 200 },
                  data: {
                    title: 'Project Start',
                    description: `Initialize ${projectData.name} project setup`
                  }
                },
                {
                  id: 'task-1',
                  type: 'taskNode',
                  position: { x: 350, y: 150 },
                  data: {
                    title: projectData.features['Core Features']?.[0] || 'Main Feature',
                    description: `Implement ${projectData.features['Core Features']?.[0] || 'core functionality'}`,
                    status: 'pending',
                    priority: 'high',
                    estimatedHours: 8
                  }
                },
                {
                  id: 'milestone-1',
                  type: 'milestoneNode',
                  position: { x: 600, y: 200 },
                  data: {
                    title: 'MVP Ready',
                    description: 'Basic functionality completed and tested',
                    priority: 'high',
                    status: 'pending',
                    estimatedHours: 40
                  }
                },
                {
                  id: 'end-1',
                  type: 'endNode',
                  position: { x: 850, y: 200 },
                  data: {
                    title: 'Project Complete',
                    description: `${projectData.name} deployed and ready for users`
                  }
                }
              ],
              edges: [
                { id: 'e1-2', source: 'start-1', target: 'task-1' },
                { id: 'e2-3', source: 'task-1', target: 'milestone-1' },
                { id: 'e3-4', source: 'milestone-1', target: 'end-1' }
              ]
            };
          }
          
          return {
            project: projectData,
            success: true,
            message: 'Project loaded from localStorage'
          };
        }
        
        // Fallback mock data if nothing in localStorage
        const mockProject: ProjectData = {
          id: projectId,
          _id: projectId,
          name: 'Sample Project',
          description: 'A sample project for demonstration',
          features: {
            'Core Features': [
              'Feature 1',
              'Feature 2',
              'Feature 3'
            ]
          },
          techStack: ['React', 'Node.js', 'MongoDB'],
          tags: ['demo', 'sample'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        return {
          project: mockProject,
          success: true,
          message: 'Mock project data loaded successfully'
        };
      }

      // Try to connect to real backend
      try {
        const result = await apiClient.getProject(projectId);
        console.log('✅ Project fetch response:', result);
        return {
          project: result.data || result,
          success: true,
          message: 'Project loaded from backend'
        };
      } catch (backendError) {
        console.warn('⚠️ Backend connection failed, using mock data:', backendError);
        
        // Fallback to mock data if backend is not available
        const mockProject: ProjectData = {
          id: projectId,
          _id: projectId,
          name: 'Offline Project',
          description: 'This is a fallback project (backend not available)',
          features: {
            'Core Features': [
              'Offline Feature 1',
              'Offline Feature 2'
            ]
          },
          techStack: ['React', 'Node.js'],
          tags: ['offline', 'fallback'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        return {
          project: mockProject,
          success: true,
          message: 'Fallback project data (backend offline)'
        };
      }
    } catch (err) {
      console.error('❌ Project fetch failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch project');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getAllProjects = async (): Promise<any[]> => {
    setLoading(true);
    setError(null);

    try {
      console.log('📋 Fetching all projects from backend...');
      
      // PRIORITY: Always try backend first
      try {
        const result = await apiClient.getAllProjects();
        console.log('🔍 Raw backend response:', result);
        
        // Handle FlowSprint backend response format: { success: true, data: { projects: [...] } }
        if (result.success && result.data && result.data.projects) {
          console.log('✅ Projects loaded from backend database:', result.data.projects.length, 'projects');
          console.log('📊 Project details:', result.data.projects.map((p: any) => ({ id: p._id, name: p.name })));
          return result.data.projects;
        }
        
        // Handle direct array response
        if (Array.isArray(result)) {
          console.log('✅ Projects loaded (direct array):', result.length, 'projects');
          return result;
        }
        
        // Handle simple data property
        if (result.data && Array.isArray(result.data)) {
          console.log('✅ Projects loaded (data array):', result.data.length, 'projects');
          return result.data;
        }
        
        console.warn('⚠️ Unexpected backend response format:', result);
        return [];
        
      } catch (backendError) {
        console.error('❌ Backend request failed:', backendError);
        console.warn('⚠️ Falling back to localStorage...');
        
        // Fallback to localStorage only if backend fails
        const allProjects = [];
        for (let i = 0; i < localStorage.length; i++) {  
          const key = localStorage.key(i);
          if (key && key.startsWith('project-')) {
            try {
              const projectData = JSON.parse(localStorage.getItem(key) || '{}');
              allProjects.push(projectData);
            } catch (e) {
              console.warn('Error parsing stored project:', key);
            }
          }
        }
        console.log('📦 Fallback: Loaded projects from localStorage:', allProjects.length, 'projects');
        return allProjects;
      }
    } catch (error) {
      console.error('❌ Critical error loading projects:', error);
      setError(error instanceof Error ? error.message : 'Failed to load projects');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (projectId: string, updateData: Partial<ProjectData>): Promise<ProjectResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      
      console.log('🔄 Updating project with ID:', projectId);
      console.log('📝 Update data:', updateData);

      const response = await fetch(`${backendUrl}/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.email}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Project update response:', result);

      return result;
    } catch (err) {
      console.error('❌ Project update failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to update project');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      
      console.log('🗑️ Deleting project with ID:', projectId);

      const response = await fetch(`${backendUrl}/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.user?.email}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Project deleted successfully');
      return true;
    } catch (err) {
      console.error('❌ Project deletion failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const generateMindmap = async (projectId: string, complexity: string = 'medium') => {
    setLoading(true);
    setError(null);

    try {
      console.log('🧠 Generating AI mindmap for project:', projectId);
      const result = await apiClient.generateMindmap(projectId, complexity);
      console.log('✅ Mindmap generated successfully:', result);
      return result;
    } catch (err) {
      console.error('❌ Mindmap generation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate mindmap');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createProject,
    getProject,
    getAllProjects,
    updateProject,
    deleteProject,
    generateMindmap,
    loading,
    error
  };
}