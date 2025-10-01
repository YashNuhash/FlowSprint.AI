"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useProject } from "@/hooks/useProject";
import { Trash2, Edit, Calendar } from "lucide-react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { getAllProjects, deleteProject } = useProject();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingProject, setDeletingProject] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      loadProjects();
    }
  }, [session]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      console.log('🎯 Dashboard: Starting to load projects...');
      const userProjects = await getAllProjects();
      console.log('🎯 Dashboard: Received projects:', userProjects?.length, 'projects');
      console.log('🎯 Dashboard: Projects data:', userProjects);
      setProjects(userProjects || []);
    } catch (error) {
      console.error('🎯 Dashboard: Error loading projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    // Confirmation dialog
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${projectName}"?\n\nThis action cannot be undone and will permanently remove all project data including mindmaps, PRDs, and generated code.`
    );
    
    if (!confirmDelete) return;

    try {
      setDeletingProject(projectId);
      console.log('🗑️ Deleting project:', projectId, projectName);
      
      const success = await deleteProject(projectId);
      
      if (success) {
        console.log('✅ Project deleted successfully');
        // Remove from local state immediately for better UX
        setProjects(prev => prev.filter(p => (p.id || p._id) !== projectId));
        
        // Show success feedback
        alert(`"${projectName}" has been deleted successfully.`);
      } else {
        console.error('❌ Failed to delete project');
        alert('Failed to delete project. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error deleting project:', error);
      alert('An error occurred while deleting the project. Please try again.');
    } finally {
      setDeletingProject(null);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome back, {session.user?.name?.split(' ')[0]}!</h1>
                <p className="text-gray-600 mt-1">Manage your FlowSprint projects</p>
              </div>
              <Button
                onClick={() => router.push("/Create")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                + Create New Project
              </Button>
            </div>
          </div>

          {/* Projects Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Projects</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading projects...</span>
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div
                    key={project.id || project._id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border relative group"
                  >
                    {/* Action Buttons */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/Editor/${project.id || project._id}`);
                        }}
                        title="Edit Project"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 bg-white border-gray-200 hover:bg-red-50 hover:border-red-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id || project._id, project.name || 'Untitled Project');
                        }}
                        disabled={deletingProject === (project.id || project._id)}
                        title="Delete Project"
                      >
                        {deletingProject === (project.id || project._id) ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-600" />
                        )}
                      </Button>
                    </div>

                    {/* Project Content - Clickable */}
                    <div 
                      className="cursor-pointer"
                      onClick={() => router.push(`/Editor/${project.id || project._id}`)}
                    >
                      <div className="flex items-start justify-between mb-3 pr-20"> {/* Add padding to avoid button overlap */}
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {project.name || 'Untitled Project'}
                        </h3>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded shrink-0 ml-2">
                          {project.techStack?.[0] || 'Web'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {project.description || 'No description available'}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unknown date'}
                          </span>
                        </div>
                        <span className="text-blue-600 font-medium">
                          {project.techStack?.length > 0 ? `${project.techStack.slice(0,2).join(', ')}${project.techStack.length > 2 ? '...' : ''}` : 'No tech stack'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0A2 2 0 0 1 16 9V6a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v3a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first project</p>
                <Button
                  onClick={() => router.push("/Create")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create Your First Project
                </Button>
              </div>
            )}
          </div>

          {/* Profile Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {session.user?.image && (
                  <img
                    src={session.user.image}
                    alt="Profile"
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900">{session.user?.name}</p>
                  <p className="text-sm text-gray-500">{session.user?.email}</p>
                </div>
              </div>
              <Button
                onClick={() => signOut({ callbackUrl: "/" })}
                variant="outline"
                size="sm"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}