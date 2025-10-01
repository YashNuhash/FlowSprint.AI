'use client';

import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

interface StartNodeData {
  title: string;
  description: string;
  onUpdate: (updates: any) => void;
}

export default function StartNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as StartNodeData;
  return (
    <div 
      className={`
        relative bg-green-50 rounded-lg shadow-md border-2 transition-all duration-200
        ${selected ? 'border-green-500 shadow-lg' : 'border-green-300'}
        hover:shadow-lg min-w-[200px] max-w-[250px]
      `}
    >
      {/* Start Icon */}
      <div className="absolute -top-3 -left-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
      </div>
      
      {/* Node Header */}
      <div className="drag-handle p-3 border-b border-green-200 cursor-move">
        <h3 className="text-sm font-semibold text-green-900 flex items-center">
          <span className="mr-2">🚀</span>
          {nodeData.title}
        </h3>
        <span className="text-xs text-green-700 bg-green-200 px-2 py-1 rounded-full mt-1 inline-block">
          START
        </span>
      </div>
      
      {/* Node Content */}
      <div className="p-3">
        <p className="text-sm text-green-700 line-clamp-3">{nodeData.description}</p>
      </div>

      {/* Connection Handle - Only source */}
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
    </div>
  );
}