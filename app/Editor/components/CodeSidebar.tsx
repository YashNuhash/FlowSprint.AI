'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { GeneratedFile } from '@/lib/ai';

interface CodeSidebarProps {
  generatedFiles: GeneratedFile[];
  isGenerating: boolean;
  error: string | null;
  selectedNodeId: string | null;
  selectedNodeTitle?: string;
  onGenerateCode: (nodeId: string) => Promise<void>;
}

const LANGUAGE_ICONS: Record<string, string> = {
  typescript: '🔷',
  javascript: '🟨',
  python: '🐍',
  java: '☕',
  html: '🌐',
  css: '🎨',
  json: '📋',
  markdown: '📝',
  yml: '⚙️',
  yaml: '⚙️',
  xml: '📄',
  sql: '🗃️',
  bash: '⚡',
  shell: '⚡',
  dockerfile: '🐳',
  go: '🐹',
};

const FILE_TYPE_COLORS: Record<string, string> = {
  component: 'bg-blue-100 text-blue-800',
  hook: 'bg-green-100 text-green-800',
  utility: 'bg-purple-100 text-purple-800',
  api: 'bg-orange-100 text-orange-800',
  config: 'bg-gray-100 text-gray-800',
  style: 'bg-pink-100 text-pink-800',
  test: 'bg-yellow-100 text-yellow-800',
  documentation: 'bg-indigo-100 text-indigo-800',
};

export default function CodeSidebar({
  generatedFiles,
  isGenerating,
  error,
  selectedNodeId,
  selectedNodeTitle,
  onGenerateCode,
}: CodeSidebarProps) {
  const [width, setWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = window.innerWidth - e.clientX;
      const minWidth = 300;
      const maxWidth = Math.min(800, window.innerWidth * 0.7);
      
      setWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .file-scroll::-webkit-scrollbar,
      .code-scroll::-webkit-scrollbar {
        width: 8px;
      }
      .file-scroll::-webkit-scrollbar-track,
      .code-scroll::-webkit-scrollbar-track {
        background: #f3f4f6;
      }
      .file-scroll::-webkit-scrollbar-thumb,
      .code-scroll::-webkit-scrollbar-thumb {
        background: #9ca3af;
        border-radius: 4px;
      }
      .file-scroll::-webkit-scrollbar-thumb:hover,
      .code-scroll::-webkit-scrollbar-thumb:hover {
        background: #6b7280;
      }
      .code-scroll::-webkit-scrollbar-track {
        background: #1f2937;
      }
      .code-scroll::-webkit-scrollbar-thumb {
        background: #4b5563;
      }
      .code-scroll::-webkit-scrollbar-thumb:hover {
        background: #6b7280;
      }
      /* Force responsive content */
      .responsive-content {
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
      .responsive-content * {
        box-sizing: border-box !important;
      }
      /* Ensure code scrolling works */
      .code-scroll {
        overflow: auto !important;
        padding-bottom: 0 !important;
        scroll-padding-bottom: 2rem !important;
      }
      .code-scroll pre {
        margin: 0 !important;
        padding-bottom: 2rem !important;
      }
      .code-scroll > div {
        min-height: 100% !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [width]);
  
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [copyingAll, setCopyingAll] = useState(false);

  const handleGenerateClick = useCallback(async () => {
    if (selectedNodeId) {
      await onGenerateCode(selectedNodeId);
    }
  }, [selectedNodeId, onGenerateCode]);

  const handleCopyCode = useCallback(async (content: string, fileName: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(fileName);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }, []);

  const handleCopyFullFile = useCallback(async (file: GeneratedFile) => {
    try {
      let fullContent = '';
      
      if (file.prd) {
        fullContent += `# Product Requirements Document (PRD)\n`;
        fullContent += `File: ${file.name}\n\n`;
        fullContent += file.prd;
        fullContent += `\n\n${'='.repeat(60)}\n`;
        fullContent += `# IMPLEMENTATION CODE\n`;
        fullContent += `${'='.repeat(60)}\n\n`;
      }
      
      fullContent += `**File:** ${file.path}\n`;
      fullContent += `**Type:** ${file.type}\n`;
      fullContent += `**Language:** ${file.language}\n\n`;
      
      if (file.description) {
        fullContent += `**Description:** ${file.description}\n\n`;
      }
      
      fullContent += `\`\`\`${file.language}\n`;
      fullContent += file.content;
      fullContent += `\n\`\`\``;
      
      await navigator.clipboard.writeText(fullContent);
      setCopySuccess(file.name + '_full');
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy full file:', err);
    }
  }, []);

  const handleDownloadFile = useCallback((file: GeneratedFile) => {
    let fullContent = '';
    
    if (file.prd) {
      fullContent += `# Product Requirements Document (PRD)\n`;
      fullContent += `File: ${file.name}\n\n`;
      fullContent += file.prd;
      fullContent += `\n\n${'='.repeat(60)}\n`;
      fullContent += `# IMPLEMENTATION CODE\n`;
      fullContent += `${'='.repeat(60)}\n\n`;
    }
    
    fullContent += `**File:** ${file.path}\n`;
    fullContent += `**Type:** ${file.type}\n`;
    fullContent += `**Language:** ${file.language}\n\n`;
    
    if (file.description) {
      fullContent += `**Description:** ${file.description}\n\n`;
    }
    
    fullContent += `\`\`\`${file.language}\n`;
    fullContent += file.content;
    fullContent += `\n\`\`\``;
    
    const blob = new Blob([fullContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.prd ? `${file.name.split('.')[0]}_with_PRD.md` : file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleDownloadAll = useCallback(() => {
    generatedFiles.forEach((file, index) => {
      setTimeout(() => handleDownloadFile(file), index * 100);
    });
  }, [generatedFiles, handleDownloadFile]);

  const handleCopyAllFiles = useCallback(async () => {
    if (copyingAll) return; // Prevent multiple simultaneous operations
    
    setCopyingAll(true);
    try {
      let allContent = `# Complete Code Generation Package\n`;
      allContent += `Generated ${generatedFiles.length} files\n\n`;
      
      generatedFiles.forEach((file, index) => {
        allContent += `${'='.repeat(80)}\n`;
        allContent += `# FILE ${index + 1}: ${file.name}\n`;
        allContent += `${'='.repeat(80)}\n\n`;
        
        if (file.prd) {
          allContent += `## Product Requirements Document\n\n`;
          allContent += file.prd;
          allContent += `\n\n`;
        }
        
        allContent += `## Implementation Details\n`;
        allContent += `- **Path:** ${file.path}\n`;
        allContent += `- **Type:** ${file.type}\n`;
        allContent += `- **Language:** ${file.language}\n`;
        if (file.description) {
          allContent += `- **Description:** ${file.description}\n`;
        }
        allContent += `\n`;
        
        allContent += `## Source Code\n\n`;
        allContent += `\`\`\`${file.language}\n`;
        allContent += file.content;
        allContent += `\n\`\`\`\n\n`;
      });
      
      await navigator.clipboard.writeText(allContent);
      setCopySuccess('all_files');
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy all files:', err);
    } finally {
      setCopyingAll(false);
    }
  }, [generatedFiles, copyingAll]);

  // No node selected state
  if (!selectedNodeId) {
    return (
      <div 
        className="bg-white border-l border-gray-200 flex flex-col h-full w-full overflow-hidden relative"
        style={{ width: `${width}px` }}
      >
        <style jsx>{`
          .code-scroll {
            scroll-behavior: smooth;
          }
          .code-scroll::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .code-scroll::-webkit-scrollbar-track {
            background: #374151;
            border-radius: 4px;
          }
          .code-scroll::-webkit-scrollbar-thumb {
            background: #6B7280;
            border-radius: 4px;
          }
          .code-scroll::-webkit-scrollbar-thumb:hover {
            background: #9CA3AF;
          }
          
          /* Global scrollbar styling for main content */
          div::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          div::-webkit-scrollbar-track {
            background: #F3F4F6;
            border-radius: 3px;
          }
          div::-webkit-scrollbar-thumb {
            background: #D1D5DB;
            border-radius: 3px;
          }
          div::-webkit-scrollbar-thumb:hover {
            background: #9CA3AF;
          }
        `}</style>
        <div 
          className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors z-10"
          onMouseDown={handleMouseDown}
        />
        <div className="p-6 flex flex-col items-center justify-center text-center h-full">
          <div className="text-gray-400 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Code Generation</h3>
          <p className="text-gray-600 text-sm">
            Select a Node from the MIND MAP to generate PRD & CODE Files
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white border-l border-gray-200 flex flex-col h-full w-full overflow-hidden relative"
      style={{ width: `${width}px`  }}
    >
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors z-10"
        onMouseDown={handleMouseDown}
      />
      
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900">Code Generation</h3>
          <button
            onClick={handleGenerateClick}
            disabled={isGenerating}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              isGenerating
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          <span className="font-medium">Selected Node:</span>
          <div className="mt-1 p-2 bg-gray-50 rounded text-gray-800 text-xs">
            {selectedNodeTitle}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isGenerating && (
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <div>
              <p className="text-sm font-medium text-blue-800">Generating Code...</p>
              <p className="text-xs text-blue-600">AI is creating files for this node</p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 border-b border-gray-200 bg-red-50">
          <div className="flex items-start space-x-2">
            <div className="text-red-400 mt-0.5">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-red-800">Generation Failed</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* File List */}
      {generatedFiles.length > 0 && (
        <div className="flex-1 overflow-hidden flex flex-col" style={{ width: '100%' }}>
          {!selectedFile ? (
            // File Tree View
            <div className="flex-1 overflow-hidden flex flex-col w-full">
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">
                    Generated Files ({generatedFiles.length})
                  </h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCopyAllFiles}
                      className="px-3 py-1.5 text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all shadow-sm font-medium"
                      title="Copy all files with their PRD documentation"
                      disabled={copyingAll}
                    >
                      {copyingAll ? (
                        <span className="flex items-center space-x-1">
                          <span className="animate-spin">⌛</span>
                          <span>Copying...</span>
                        </span>
                      ) : copySuccess === 'all_files' ? (
                        <span className="flex items-center space-x-1">
                          <span>✅</span>
                          <span>Copied All</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1">
                          <span>📋</span>
                          <span>Copy All (PRD+Code)</span>
                        </span>
                      )}
                    </button>
                    <button
                      onClick={handleDownloadAll}
                      className="px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 rounded-lg transition-all shadow-sm font-medium"
                      title="Download all files with PRD documentation"
                    >
                      <span className="flex items-center space-x-1">
                        <span>💾</span>
                        <span>Download All</span>
                      </span>
                    </button>
                  </div>
                </div>
                
                {/* Instructions */}
                <div className="px-4 pb-3">
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 rounded-r-lg">
                    <p className="text-sm text-blue-800">
                      <strong>💡 PRD + Code Integration:</strong> Each file includes its Product Requirements Document (PRD) above the code. 
                      Use <strong>"Copy Full File"</strong> or <strong>"Download"</strong> to get both PRD documentation and code together.
                    </p>
                  </div>
                </div>
              </div>
              <div 
                className="flex-1 overflow-y-auto p-4 pt-0 file-scroll"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#9CA3AF #F3F4F6'
                }}
              >
                <div className="space-y-2">
                  {generatedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedFile(file)}
                    >
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <span className="text-lg">
                          {LANGUAGE_ICONS[file.language] || '📄'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {file.path}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          FILE_TYPE_COLORS[file.type] || 'bg-gray-100 text-gray-800'
                        }`}>
                          {file.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // File Content View
            <div className="flex-1 flex flex-col w-full overflow-hidden">
              {/* File Header */}
              <div className="p-4 border-b border-gray-200 w-full flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    ← Back to Files
                  </button>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCopyFullFile(selectedFile)}
                      className="px-3 py-1.5 text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all shadow-sm font-medium"
                      title="Copy complete file with PRD documentation and code"
                    >
                      {copySuccess === selectedFile.name + '_full' ? (
                        <span className="flex items-center space-x-1">
                          <span>✅</span>
                          <span>Copied PRD+Code</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1">
                          <span>📋</span>
                          <span>Copy PRD+Code</span>
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => handleDownloadFile(selectedFile)}
                      className="px-3 py-1.5 text-sm bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 rounded-lg transition-all shadow-sm font-medium"
                      title="Download complete file with PRD documentation and code"
                    >
                      <span className="flex items-center space-x-1">
                        <span>💾</span>
                        <span>Download PRD+Code</span>
                      </span>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {LANGUAGE_ICONS[selectedFile.language] || '📄'}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedFile.path}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    FILE_TYPE_COLORS[selectedFile.type] || 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedFile.type}
                  </span>
                </div>
                
                {selectedFile.description && (
                  <p className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                    {selectedFile.description}
                  </p>
                )}
              </div>

              {/* File Content */}
              <div 
                className="flex-1 overflow-y-auto" 
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#9CA3AF #F3F4F6'
                }}
              >
                <div className="w-full p-4 space-y-6 responsive-content pb-8">
                  {/* PRD Section */}
                  {selectedFile.prd && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg overflow-hidden w-full responsive-content shadow-sm">
                      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 border-b border-blue-200">
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-700 font-semibold text-sm">📋 Product Requirements Document</span>
                          <span className="text-xs text-blue-600 bg-blue-200 px-2 py-1 rounded-full">PRD</span>
                        </div>
                        <button
                          onClick={() => handleCopyCode(selectedFile.prd || '', `${selectedFile.name}_PRD.md`)}
                          className="px-3 py-1.5 text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 hover:from-blue-200 hover:to-blue-300 rounded-lg transition-all shadow-sm font-medium border border-blue-300"
                          title="Copy PRD documentation only"
                        >
                          {copySuccess === `${selectedFile.name}_PRD.md` ? (
                            <span className="flex items-center space-x-1">
                              <span>✅</span>
                              <span>Copied PRD</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1">
                              <span>📋</span>
                              <span>Copy PRD</span>
                            </span>
                          )}
                        </button>
                      </div>
                      <div className="p-4 overflow-y-auto bg-white/50" style={{ maxHeight: '40vh', minHeight: '200px' }}>
                        <div className="prose prose-sm prose-blue text-blue-900 max-w-none w-full">
                          {selectedFile.prd.split('\n').map((line: string, index: number) => {
                            // Handle headers
                            if (line.startsWith('# ')) {
                              return <h1 key={index} className="text-xl font-bold mb-3 text-blue-800 border-b border-blue-200 pb-1">{line.substring(2)}</h1>;
                            }
                            if (line.startsWith('## ')) {
                              return <h2 key={index} className="text-lg font-semibold mb-2 mt-4 text-blue-700">{line.substring(3)}</h2>;
                            }
                            if (line.startsWith('### ')) {
                              return <h3 key={index} className="text-base font-medium mb-1 mt-3 text-blue-600">{line.substring(4)}</h3>;
                            }
                            
                            // Handle bold text with ** syntax
                            if (line.includes('**')) {
                              const parts = line.split('**');
                              return (
                                <p key={index} className="mb-2 text-sm leading-relaxed">
                                  {parts.map((part: string, i: number) => 
                                    i % 2 === 1 ? <strong key={i} className="font-semibold text-blue-800">{part}</strong> : part
                                  )}
                                </p>
                              );
                            }
                            
                            // Handle list items
                            if (line.startsWith('- ')) {
                              return <li key={index} className="text-sm mb-1 ml-4 list-disc text-blue-800">{line.substring(2)}</li>;
                            }
                            
                            // Handle code blocks
                            if (line.startsWith('```')) {
                              const lang = line.substring(3);
                              return <div key={index} className="text-xs text-blue-600 font-mono bg-blue-200 px-2 py-1 rounded mt-2 mb-1">{lang ? `Code Block (${lang})` : 'Code Block'}</div>;
                            }
                            
                            // Handle inline code with ` syntax
                            if (line.includes('`')) {
                              const parts = line.split('`');
                              return (
                                <p key={index} className="mb-2 text-sm leading-relaxed">
                                  {parts.map((part: string, i: number) => 
                                    i % 2 === 1 ? <code key={i} className="bg-blue-100 px-1 py-0.5 rounded text-xs font-mono text-blue-800 border">{part}</code> : part
                                  )}
                                </p>
                              );
                            }
                            
                            // Handle empty lines
                            if (line.trim() === '') {
                              return <div key={index} className="mb-2" />;
                            }
                            
                            // Regular paragraphs
                            return <p key={index} className="text-sm mb-2 leading-relaxed text-blue-800">{line}</p>;
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show message if no PRD is available */}
                  {!selectedFile.prd && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 w-full responsive-content">
                      <div className="flex items-center space-x-2">
                        <span className="text-yellow-600">⚠️</span>
                        <span className="text-sm text-yellow-700">No PRD available for this file. The backend may not have generated documentation.</span>
                      </div>
                    </div>
                  )}

                  {/* Code Section */}
                  <div className="bg-gray-900 rounded-lg overflow-hidden w-full responsive-content">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-300 font-mono font-semibold">
                          {selectedFile.language}
                        </span>
                        <span className="text-xs text-gray-500">|</span>
                        <span className="text-xs text-gray-400">
                          {selectedFile.content.split('\n').length} lines
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">Scroll to see full code</span>
                    </div>
                    <div 
                      className="overflow-auto code-scroll"
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#6B7280 #374151',
                        height: selectedFile.prd ? 'calc(100vh - 420px)' : 'calc(100vh - 250px)',
                        minHeight: '400px',
                        maxHeight: 'none'
                      }}
                    >
                      <div className="flex w-full" style={{ minHeight: '100%' }}>
                        {/* Line numbers */}
                        <div className="text-gray-400 text-sm font-mono pt-4 pb-16 px-3 pr-2 select-none border-r border-gray-700 flex-shrink-0 sticky left-0 bg-gray-900">
                          {selectedFile.content.split('\n').map((_: string, index: number) => (
                            <div key={index} className="leading-6 text-right min-w-[2.5rem] h-6">
                              {index + 1}
                            </div>
                          ))}
                        </div>
                        {/* Code content */}
                        <div className="flex-1 pt-4 pb-16 px-4 pl-3">
                          <pre className="text-sm text-gray-100 font-mono leading-6 w-full whitespace-pre-wrap" style={{ wordBreak: 'break-word' }}>
                            <code className={`language-${selectedFile.language} block w-full`}>
                              {selectedFile.content}
                            </code>
                          </pre>
                          {/* Bottom spacer for better scrolling */}
                          <div className="h-8 w-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {generatedFiles.length === 0 && !isGenerating && !error && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="text-gray-400 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">No Files Generated</h4>
          <p className="text-xs text-gray-600 mb-4">
            Click "Generate" to create code files for this node
          </p>
        </div>
      )}
    </div>
  );
}