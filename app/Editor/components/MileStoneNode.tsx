'use client';

import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

interface MilestoneNodeData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed';
  estimatedHours?: number;
}

const priorityColors = {
  low: 'bg-blue-50 border-blue-300 text-blue-900',
  medium: 'bg-yellow-50 border-yellow-300 text-yellow-900',
  high: 'bg-orange-50 border-orange-300 text-orange-900',
  critical: 'bg-red-50 border-red-300 text-red-900'
};

const statusColors = {
  pending: 'bg-gray-200 text-gray-700',
  in_progress: 'bg-blue-200 text-blue-800',
  completed: 'bg-green-200 text-green-800'
};

export default function MilestoneNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as MilestoneNodeData;
  const priorityStyle = priorityColors[nodeData.priority] || priorityColors.medium;
  const statusStyle = statusColors[nodeData.status] || statusColors.pending;

  return (
    <div 
      className={`
        relative rounded-lg shadow-md border-2 transition-all duration-200
        ${selected ? 'border-purple-500 shadow-lg' : 'border-purple-300'}
        hover:shadow-lg min-w-[200px] max-w-[250px] ${priorityStyle}
      `}
    >
      {/* Milestone Icon */}
      <div className="absolute -top-3 -left-3 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
        </svg>
      </div>
      
      {/* Node Header */}
      <div className="drag-handle p-3 border-b border-purple-200 cursor-move">
        <h3 className="text-sm font-semibold flex items-center">
          <span className="mr-2">🎯</span>
          {nodeData.title}
        </h3>
        <div className="flex gap-1 mt-1">
          <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
            MILESTONE
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${statusStyle}`}>
            {nodeData.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>
      
      {/* Node Content */}
      <div className="p-3">
        <p className="text-sm line-clamp-3 mb-2">{nodeData.description}</p>
        {nodeData.estimatedHours && (
          <div className="text-xs text-gray-600 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            {nodeData.estimatedHours}h estimated
          </div>
        )}
      </div>

      {/* Connection Handles */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-purple-500 border-2 border-white"
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 bg-purple-500 border-2 border-white"
      />
    </div>
  );
}
