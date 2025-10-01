'use client';

import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

interface EndNodeData {
  title: string;
  description: string;
  onUpdate: (updates: any) => void;
}

export default function EndNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as EndNodeData;
  return (
    <div 
      className={`
        relative bg-red-50 rounded-lg shadow-md border-2 transition-all duration-200
        ${selected ? 'border-red-500 shadow-lg' : 'border-red-300'}
        hover:shadow-lg min-w-[200px] max-w-[250px]
      `}
    >
      {/* End Icon */}
      <div className="absolute -top-3 -left-3 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
        </svg>
      </div>
      
      {/* Node Header */}
      <div className="drag-handle p-3 border-b border-red-200 cursor-move">
        <h3 className="text-sm font-semibold text-red-900 flex items-center">
          <span className="mr-2">🎯</span>
          {nodeData.title}
        </h3>
        <span className="text-xs text-red-700 bg-red-200 px-2 py-1 rounded-full mt-1 inline-block">
          END
        </span>
      </div>
      
      {/* Node Content */}
      <div className="p-3">
        <p className="text-sm text-red-700 line-clamp-3">{nodeData.description}</p>
      </div>

      {/* Connection Handle - Only target */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-red-500 border-2 border-white"
      />
    </div>
  );
}