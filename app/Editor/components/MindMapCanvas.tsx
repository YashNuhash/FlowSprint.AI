'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  ReactFlowProvider,
} from '@xyflow/react';

import TaskNodeComponent from './TaskNode';
import StartNodeComponent from './StartNode';
import EndNodeComponent from './EndNode';
import MilestoneNodeComponent from './MileStoneNode';
import { calculateAutoLayout } from '@/lib/layout';

// Define our custom node types
const nodeTypes = {
  start: StartNodeComponent,
  task: TaskNodeComponent,
  milestone: MilestoneNodeComponent,
  component: TaskNodeComponent, // Use same component as task
  end: EndNodeComponent,
};

interface MindMapNode {
  id: string;
  title: string;
  description: string;
  type: 'start' | 'task' | 'milestone' | 'component' | 'end';
  position: { x: number; y: number };
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedHours?: number;
  dependencies?: string[];
}

interface MindMapCanvasProps {
  nodes: MindMapNode[];
  onNodeUpdate: (nodeId: string, updates: Partial<MindMapNode>) => void;
  onNodeDelete: (nodeId: string) => void;
  onNodeSelect?: (nodeId: string | null) => void;
  selectedNodeId?: string | null;
}

function MindMapCanvasInner({ nodes: mindMapNodes, onNodeUpdate, onNodeDelete, onNodeSelect, selectedNodeId }: MindMapCanvasProps) {
  // Convert MindMapNode[] to ReactFlow Node[]
  const initialNodes: Node[] = useMemo(() => {
    console.log('Original mindMapNodes:', mindMapNodes);
    
    // FORCE HORIZONTAL POSITIONING - bypass layout function completely
    console.log('BYPASSING layout function - setting positions manually');
    
    return mindMapNodes.map((node, index) => {
      // Compact horizontal positioning: reduced spacing for denser layout
      const forceHorizontalPosition = {
        x: 50 + (index * 280), // Reduced from 400px to 280px horizontal spacing
        y: 150 + (index % 3) * 120 // Reduced from 150px to 120px vertical staggering
      };
      
      console.log(`COMPACT POSITION - Node ${node.id}: ${node.title} -> Position:`, forceHorizontalPosition);
      
      return {
        id: node.id,
        type: node.type,
        position: forceHorizontalPosition, // Use forced horizontal position
        data: {
          title: node.title,
          description: node.description,
          status: node.status,
          priority: node.priority,
          estimatedHours: node.estimatedHours,
          onUpdate: (updates: Partial<MindMapNode>) => onNodeUpdate(node.id, updates),
          onDelete: () => onNodeDelete(node.id),
        },
        dragHandle: '.drag-handle',
      };
    });
  }, [mindMapNodes, onNodeUpdate, onNodeDelete]);

  // Generate edges based on dependencies
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    
    mindMapNodes.forEach((node) => {
      if (node.dependencies && node.dependencies.length > 0) {
        node.dependencies.forEach((depId) => {
          // Check if the dependency node exists
          const depExists = mindMapNodes.some(n => n.id === depId);
          if (depExists) {
            edges.push({
              id: `${depId}-${node.id}`,
              source: depId,
              target: node.id,
              type: 'smoothstep',
              animated: false,
              style: { stroke: '#6B7280', strokeWidth: 2 },
            });
          }
        });
      }
    });

    // If no dependencies exist, create a flow from start to end
    if (edges.length === 0) {
      const sortedNodes = [...mindMapNodes].sort((a, b) => {
        if (a.type === 'start') return -1;
        if (b.type === 'start') return 1;
        if (a.type === 'end') return 1;
        if (b.type === 'end') return -1;
        return 0;
      });

      for (let i = 0; i < sortedNodes.length - 1; i++) {
        edges.push({
          id: `${sortedNodes[i].id}-${sortedNodes[i + 1].id}`,
          source: sortedNodes[i].id,
          target: sortedNodes[i + 1].id,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#6B7280', strokeWidth: 2 },
        });
      }
    }

    return edges;
  }, [mindMapNodes]);

  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);

  // Update nodes when mindMapNodes prop changes (for status updates, etc.)
  useEffect(() => {
    setNodes((currentNodes) => {
      let hasChanges = false;
      const updatedNodes = currentNodes.map((currentNode) => {
        const updatedMindMapNode = mindMapNodes.find(n => n.id === currentNode.id);
        if (!updatedMindMapNode) return currentNode;

        // Check if data actually changed to avoid unnecessary updates
        const currentData = currentNode.data;
        const needsUpdate = 
          currentData.title !== updatedMindMapNode.title ||
          currentData.description !== updatedMindMapNode.description ||
          currentData.status !== updatedMindMapNode.status ||
          currentData.priority !== updatedMindMapNode.priority ||
          currentData.estimatedHours !== updatedMindMapNode.estimatedHours;

        if (!needsUpdate) return currentNode;

        hasChanges = true;
        // Preserve all ReactFlow states (position, selection, etc.) but update data
        return {
          ...currentNode,
          data: {
            ...currentData,
            title: updatedMindMapNode.title,
            description: updatedMindMapNode.description,
            status: updatedMindMapNode.status,
            priority: updatedMindMapNode.priority,
            estimatedHours: updatedMindMapNode.estimatedHours,
            onUpdate: (updates: Partial<MindMapNode>) => onNodeUpdate(updatedMindMapNode.id, updates),
            onDelete: () => onNodeDelete(updatedMindMapNode.id),
          },
        };
      });

      // Only return new array if there were actual changes
      return hasChanges ? updatedNodes : currentNodes;
    });
  }, [mindMapNodes, onNodeUpdate, onNodeDelete]);

  // Handle node changes (position, selection, etc.)
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );

  // Handle edge changes
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [setEdges]
  );

  // Handle new connections
  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#6B7280', strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Handle node selection
  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[] }) => {
      const selectedNodeId = selectedNodes.length > 0 ? selectedNodes[0].id : null;
      onNodeSelect?.(selectedNodeId);
    },
    [onNodeSelect]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        fitView={false}
        attributionPosition="bottom-left"
        className="bg-gray-50"
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        selectNodesOnDrag={false}
        multiSelectionKeyCode="Meta"
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls 
          position="top-left"
          className="bg-white border border-gray-200 rounded-lg shadow-sm"
        />
        <MiniMap 
          nodeColor={(node) => {
            switch (node.type) {
              case 'start': return '#10B981';
              case 'end': return '#EF4444';
              case 'milestone': return '#8B5CF6';
              default: return '#3B82F6';
            }
          }}
          className="bg-white border border-gray-200 rounded-lg"
          position="bottom-right"
        />
      </ReactFlow>
    </div>
  );
}

// Main component with ReactFlowProvider
export default function MindMapCanvas(props: MindMapCanvasProps) {
  return (
    <ReactFlowProvider>
      <MindMapCanvasInner {...props} />
    </ReactFlowProvider>
  );
}