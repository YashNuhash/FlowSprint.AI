'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useProject } from '@/hooks/useProject';
import MindMapCanvas from '../components/MindMapCanvas';
import CodeSidebar from '../components/CodeSidebar';
import { GeneratedFile } from '@/lib/ai';
import { ProjectData, MindMapNode, convertProjectData, convertNodesToMindmap, generateSampleNodes } from '@/lib/project-utils';



export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { getProject, updateProject, generateMindmap, loading: projectLoading, error: projectError } = useProject();
  
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Code generation states
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [codeGenerationError, setCodeGenerationError] = useState<string | null>(null);
  
  // Sidebar resize states
  const [sidebarWidth, setSidebarWidth] = useState(320); // 320px = w-80
  const [isResizing, setIsResizing] = useState(false);

  const projectId = params.projectId as string;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
      return;
    }

    if (status === 'loading') return;

    const loadProjectData = async () => {
      try {
        setLoading(true);
        console.log('Loading project with ID:', projectId);
        
        const result = await getProject(projectId);
        console.log('Project load result:', result);
        
        if (result && result.project) {
          console.log('Raw project data from backend:', result.project);
          
          const projectData = convertProjectData(result.project);
          console.log('Converted project data for frontend:', projectData);
          
          setProjectData(projectData);
        } else {
          console.error('No project data received:', result);
          setError('Project not found or access denied.');
        }
      } catch (err) {
        console.error('Failed to load project:', err);
        
        // More specific error handling
        if (err instanceof Error) {
          if (err.message.includes('404')) {
            setError('Project not found. It may have been deleted or you may not have access to it.');
          } else if (err.message.includes('401') || err.message.includes('403')) {
            setError('Access denied. Please sign in and try again.');
          } else if (err.message.includes('ECONNREFUSED')) {
            setError('Backend server is not running. Please contact support.');
          } else {
            setError(`Failed to load project: ${err.message}`);
          }
        } else {
          setError('An unexpected error occurred while loading the project.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProjectData();
  }, [projectId, status, router]); // Removed getProject from dependencies to prevent infinite loop

  const handleSaveProject = async () => {
    if (!projectData) return;

    setIsSaving(true);
    try {
      // Convert nodes back to mindmap format for saving
      const mindmapData = convertNodesToMindmap(projectData.nodes);

      // Prepare update data
      const updateData = {
        name: projectData.name,
        description: projectData.description,
        mindmap: mindmapData,
        // Keep existing PRD if available
        ...(projectData.prd && { prd: projectData.prd })
      };

      await updateProject(projectId, updateData);
      setLastSaved(new Date());
      
      // Show success feedback (you could add a toast notification here)
      console.log('Project saved successfully!');
    } catch (err) {
      console.error('Failed to save project:', err);
      // You could show an error notification here
    } finally {
      setIsSaving(false);
    }
  };

  // Mindmaps are now auto-generated during project creation - no manual generation needed

  const handleNodeSelect = (nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    setCodeGenerationError(null);
    // Keep the generated files when switching nodes
  };

  const handleGenerateCode = async (nodeId: string) => {
    if (!projectData) return;

    const selectedNode = projectData.nodes.find(node => node.id === nodeId);
    if (!selectedNode) return;

    setIsGeneratingCode(true);
    setCodeGenerationError(null);

    try {
      const response = await fetch('/api/projects/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodeId: selectedNode.id,
          nodeTitle: selectedNode.title,
          nodeDescription: selectedNode.description,
          nodeType: selectedNode.type,
          projectContext: {
            name: projectData.name,
            description: projectData.description,
            features: projectData.features,
            techStack: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'] // You can make this configurable
          },
          codeOptions: {
            framework: 'nextjs',
            language: 'typescript',
            styling: 'tailwind',
            includeTests: false,
            includeComments: true
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate code');
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Invalid response from server');
      }

      setGeneratedFiles(result.data.files);

    } catch (err) {
      console.error('Failed to generate code:', err);
      setCodeGenerationError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Resize handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleDoubleClick = () => {
    setSidebarWidth(320); // Reset to default width
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;

    const windowWidth = window.innerWidth;
    const newWidth = windowWidth - e.clientX;
    
    // Set min and max width constraints
    const minWidth = 280; // Minimum sidebar width
    const maxWidth = Math.min(800, windowWidth * 0.6); // Maximum 60% of window width or 800px
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  // Add and remove event listeners for resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your project...</p>
        </div>
      </div>
    );
  }

  if (error || !projectData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-400 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/create')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/Dashboard')}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{projectData.name}</h1>
                <p className="text-sm text-gray-500">Mind Map Editor</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {projectData.nodes.length} nodes generated
              </span>
              {lastSaved && (
                <span className="text-xs text-gray-400">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              {/* AI Mindmap is now auto-generated during project creation */}
              <button 
                onClick={handleSaveProject}
                disabled={isSaving}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${
                  isSaving 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save Project'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar - Project Info */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Project Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Project Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{projectData.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-gray-600 text-sm">{projectData.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Features</label>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {Array.isArray(projectData.features) ? projectData.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    )) : (
                      <li className="text-gray-500 italic">No features defined</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Node Statistics */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Progress Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Nodes</span>
                  <span className="font-medium">{projectData.nodes.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-medium">{projectData.nodes.filter(n => n.status === 'pending').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">In Progress</span>
                  <span className="font-medium">{projectData.nodes.filter(n => n.status === 'in_progress').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium">{projectData.nodes.filter(n => n.status === 'completed').length}</span>
                </div>
              </div>
            </div>

            {/* Node List */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Generated Nodes</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {projectData.nodes.map((node, index) => (
                  <div key={node.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{node.title}</h4>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{node.description}</p>
                        <div className="flex items-center mt-2 space-x-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            node.type === 'start' ? 'bg-green-100 text-green-800' :
                            node.type === 'end' ? 'bg-red-100 text-red-800' :
                            node.type === 'milestone' ? 'bg-purple-100 text-purple-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {node.type}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            node.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            node.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            node.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {node.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div 
          className="flex-1 relative"
          style={{ marginRight: sidebarWidth }}
        >
          {projectData ? (
            <MindMapCanvas 
              nodes={projectData.nodes}
              selectedNodeId={selectedNodeId}
              onNodeSelect={handleNodeSelect}
              onNodeUpdate={(nodeId, updates) => {
                // Update the node in local state
                const updatedNodes = projectData.nodes.map(node => 
                  node.id === nodeId ? { ...node, ...updates } : node
                );
                const updatedProject = { ...projectData, nodes: updatedNodes };
                setProjectData(updatedProject);
                
                // Auto-save after a short delay (you could debounce this)
                setTimeout(() => {
                  handleSaveProject();
                }, 1000);
              }}
              onNodeDelete={(nodeId) => {
                // Remove the node from local state
                const updatedNodes = projectData.nodes.filter(node => node.id !== nodeId);
                const updatedProject = { ...projectData, nodes: updatedNodes };
                setProjectData(updatedProject);
                
                // Auto-save after deletion
                setTimeout(() => {
                  handleSaveProject();
                }, 500);
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Loading Mind Map...</h3>
              </div>
            </div>
          )}
        </div>

        {/* Resize Handle */}
        <div 
          className={`absolute top-0 bottom-0 w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors z-10 ${
            isResizing ? 'bg-blue-500' : ''
          }`}
          style={{ right: sidebarWidth }}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          title="Drag to resize, double-click to reset"
        >
          <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-8 bg-gray-400 hover:bg-blue-500 rounded-l flex items-center justify-center transition-colors">
            <div className="w-0.5 h-4 bg-white rounded"></div>
          </div>
          
          {/* Width indicator tooltip when resizing */}
          {isResizing && (
            <div className="absolute top-1/2 -translate-y-1/2 -left-16 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg">
              {sidebarWidth}px
            </div>
          )}
        </div>

        {/* Right Sidebar - Code Generation */}
        <div 
          className="fixed top-16 right-0 bottom-0 bg-white border-l border-gray-200 flex flex-col"
          style={{ width: sidebarWidth }}
        >
          <CodeSidebar
            selectedNodeId={selectedNodeId}
            selectedNodeTitle={selectedNodeId ? projectData?.nodes.find(n => n.id === selectedNodeId)?.title || '' : ''}
            generatedFiles={generatedFiles}
            onGenerateCode={handleGenerateCode}
            isGenerating={isGeneratingCode}
            error={codeGenerationError}
          />
        </div>
      </div>
    </div>
  );
}