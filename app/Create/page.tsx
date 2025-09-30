"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"

interface CreateProjectFormData {
  name: string;
  description: string;
  features: [string, string, string, string, string];
}

function CreateProjectForm() {
  const router = useRouter();
  const { data: session } = useSession();

  const [formData, setFormData] = useState<CreateProjectFormData>({
    name: '',
    description: '',
    features: ['', '', '', '', '']
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Project name is required';
    }

    if (formData.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    const filledFeatures = formData.features.filter(f => f.trim());
    if (filledFeatures.length === 0) {
      errors.features = 'At least one feature is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      // Prepare project data for backend creation
      const featuresArray = formData.features.filter(f => f.trim());
      
      if (featuresArray.length === 0) {
        throw new Error('Please provide at least one feature');
      }
      
      const featuresMap: Record<string, string[]> = {
        "Core Features": featuresArray
      };

      // Extract tech stack from description
      const description = formData.description.toLowerCase();
      let techStack = ['React', 'Node.js', 'MongoDB']; // Default
      
      if (description.includes('next')) techStack = ['Next.js', 'React', 'Node.js'];
      if (description.includes('vue')) techStack = ['Vue.js', 'Node.js', 'MongoDB'];
      if (description.includes('python')) techStack = ['Python', 'Django', 'PostgreSQL'];

      const projectData = {
        name: formData.name.trim(),
        product: formData.name.trim(),
        description: formData.description.trim(),
        features: featuresMap,
        techStack: techStack,
        tags: []
      };

      console.log('Creating project with data:', projectData);
      
      // Simulate project creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const projectId = 'mock-project-' + Date.now();
      router.push(`/editor/${projectId}`);

    } catch (err) {
      console.error('Project creation failed:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ 
      ...prev, 
      features: newFeatures as [string, string, string, string, string] 
    }));
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Project</h1>
          <p className="text-gray-600">
            Describe your project and we'll generate an AI-powered development roadmap for you.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            {session?.user?.image && (
              <img 
                src={session.user.image} 
                alt={session.user.name || "User"} 
                className="w-6 h-6 rounded-full"
              />
            )}
            <span className="text-sm text-gray-500">Welcome back, {session?.user?.name}</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Project Details</h2>
            <p className="text-gray-600">
              Fill in the details below to generate your project roadmap
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Project Name *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  validationErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Task Management App"
                disabled={isGenerating}
              />
              {validationErrors.name && (
                <p className="text-red-500 text-sm">{validationErrors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Project Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors ${
                  validationErrors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe what your project does, its main purpose, and target users..."
                disabled={isGenerating}
                maxLength={500}
              />
              <div className="flex justify-between">
                <div>
                  {validationErrors.description && (
                    <p className="text-red-500 text-sm">{validationErrors.description}</p>
                  )}
                </div>
                <p className="text-gray-500 text-sm">
                  {formData.description.length}/500 characters
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Key Features (up to 5) *
              </label>
              <div className="space-y-3">
                {formData.features.map((feature, index) => (
                  <input
                    key={index}
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder={`Feature ${index + 1}${index === 0 ? ' (required)' : ' (optional)'}`}
                    disabled={isGenerating}
                  />
                ))}
              </div>
              {validationErrors.features && (
                <p className="text-red-500 text-sm">{validationErrors.features}</p>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="text-red-400">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Failed to create project
                    </h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isGenerating && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Creating your project...
                    </h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Our AI is analyzing your project and creating a detailed implementation plan with mindmap and PRD.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isGenerating}
              size="lg"
              className={`w-full text-white font-medium transition-colors ${
                isGenerating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gray-800 hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
              }`}
            >
              {isGenerating ? 'Creating Project...' : 'Create Project with AI'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CreatePage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    // Show sign-in prompt for unauthenticated users
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">Create Your Project</h1>
          <p className="text-lg text-muted-foreground">
            Start building with AI-powered tools and unleash your creativity.
          </p>
          
          <div className="mt-8 p-8 rounded-2xl border border-border bg-card space-y-6">
            <div className="space-y-4">
              <svg className="w-16 h-16 mx-auto text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-xl font-semibold text-foreground">Sign in to get started</h3>
              <p className="text-muted-foreground">
                Your creation workspace will appear here. Sign in to access AI-powered project creation tools.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => signIn("google", { callbackUrl: "/Create" })}
                className="w-full max-w-sm mx-auto flex items-center justify-center gap-3"
                size="lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </Button>
              
              <div className="text-center">
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show project creation form for authenticated users
  return <CreateProjectForm />
}
