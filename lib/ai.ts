export interface GeneratedFile {
  name: string;
  path: string;
  content: string;
  language: string;
  type: 'component' | 'page' | 'utility' | 'config' | 'test' | 'style';
  description?: string;
  prd?: string; // Product Requirements Document content
}

export interface CodeGeneration {
  files: GeneratedFile[];
  projectStructure?: {
    folders: string[];
    dependencies: string[];
  };
  instructions?: string[];
  nextSteps?: string[];
}

export interface AIServiceResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export interface ProjectContext {
  name: string;
  description: string;
  features: string[] | Record<string, string[]>;
  techStack: string[];
}

export interface CodeOptions {
  framework: 'react' | 'nextjs' | 'vue' | 'angular' | 'vanilla';
  language: 'javascript' | 'typescript';
  styling: 'css' | 'scss' | 'tailwind' | 'styled-components';
  includeTests: boolean;
  includeComments: boolean;
}

export interface NodeCodeRequest {
  nodeId: string;
  nodeTitle: string;
  nodeDescription: string;
  nodeType: 'start' | 'task' | 'milestone' | 'component' | 'end';
  projectContext: ProjectContext;
  codeOptions: CodeOptions;
}