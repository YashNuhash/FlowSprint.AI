'use client';

import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

interface TaskNodeData {
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedHours?: number;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
}

export default function TaskNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as TaskNodeData;
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(nodeData.title);
  const [editedDescription, setEditedDescription] = useState(nodeData.description);
  const [showMenu, setShowMenu] = useState(false);

  const handleSave = () => {
    nodeData.onUpdate({
      title: editedTitle,
      description: editedDescription,
    });
    setIsEditing(false);
  };

  const handleStatusChange = (newStatus: TaskNodeData['status']) => {
    nodeData.onUpdate({ status: newStatus });
    setShowMenu(false);
  };

  const handlePriorityChange = (newPriority: TaskNodeData['priority']) => {
    nodeData.onUpdate({ priority: newPriority });
    setShowMenu(false);
  };

  const getStatusColor = () => {
    switch (nodeData.status) {
      case 'completed': return 'bg-green-100 border-green-300 text-green-800';
      case 'in_progress': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getPriorityColor = () => {
    switch (nodeData.priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div 
      className={`
        relative bg-white rounded-lg shadow-md border-2 transition-all duration-200
        ${selected ? 'border-blue-500 shadow-lg' : 'border-gray-200'}
        ${nodeData.status === 'completed' ? 'opacity-80' : ''}
        hover:shadow-lg min-w-[250px] max-w-[300px]
      `}
    >
      {/* Priority Indicator */}
      <div className={`absolute -top-2 -left-2 w-4 h-4 rounded-full ${getPriorityColor()}`} />
      
      {/* Node Header */}
      <div className="drag-handle p-3 border-b border-gray-100 cursor-move select-none">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full text-sm font-semibold bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                autoFocus
              />
            ) : (
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{nodeData.title}</h3>
            )}
          </div>
          
          {/* Action Menu */}
          <div className="relative ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded hover:bg-gray-100 text-gray-500"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Edit Node
                  </button>
                  
                  {/* Status submenu */}
                  <div className="px-3 py-2 text-sm text-gray-700 border-t border-gray-100">
                    <div className="font-medium mb-1">Status:</div>
                    <div className="space-y-1">
                      {(['pending', 'in_progress', 'completed'] as const).map((status) => (
                        <button
                          key={status}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(status);
                          }}
                          className={`block w-full text-left px-2 py-1 rounded text-xs ${
                            nodeData.status === status ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-50'
                          }`}
                        >
                          {status.replace('_', ' ').toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Priority submenu */}
                  <div className="px-3 py-2 text-sm text-gray-700 border-t border-gray-100">
                    <div className="font-medium mb-1">Priority:</div>
                    <div className="space-y-1">
                      {(['low', 'medium', 'high', 'critical'] as const).map((priority) => (
                        <button
                          key={priority}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePriorityChange(priority);
                          }}
                          className={`block w-full text-left px-2 py-1 rounded text-xs ${
                            nodeData.priority === priority ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-50'
                          }`}
                        >
                          {priority.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nodeData.onDelete();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
                  >
                    Delete Node
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="flex items-center justify-between mt-2">
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}>
            {nodeData.status.replace('_', ' ')}
          </span>
          {nodeData.estimatedHours && (
            <span className="text-xs text-gray-500">{nodeData.estimatedHours}h</span>
          )}
        </div>
      </div>
      
      {/* Node Content */}
      <div className="p-3">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="w-full text-sm text-gray-600 border border-gray-300 rounded p-2 focus:border-blue-500 focus:outline-none"
              rows={3}
              placeholder="Node description..."
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {setIsEditing(false); setEditedTitle(nodeData.title); setEditedDescription(nodeData.description);}}
                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600 line-clamp-3">{nodeData.description}</p>
        )}
      </div>

      {/* Connection Handles */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
    </div>
  );
}
