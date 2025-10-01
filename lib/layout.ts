import { MindMapNode } from './project-utils';

export interface LayoutNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Calculate automatic layout for mind map nodes
 */
export function calculateAutoLayout(nodes: MindMapNode[]): MindMapNode[] {
  if (!nodes || nodes.length === 0) return [];

  // Simple horizontal layout with vertical staggering
  const nodeWidth = 250;
  const nodeHeight = 100;
  const horizontalSpacing = 350;
  const verticalSpacing = 150;

  // Sort nodes by type priority (start first, end last)
  const sortedNodes = [...nodes].sort((a, b) => {
    const typeOrder = { start: 0, task: 1, component: 1, milestone: 2, end: 3 };
    return typeOrder[a.type] - typeOrder[b.type];
  });

  return sortedNodes.map((node, index) => {
    // Calculate position based on index and type
    const baseX = 100 + (index * horizontalSpacing);
    const baseY = 200 + ((index % 3) * verticalSpacing);

    return {
      ...node,
      position: {
        x: baseX,
        y: baseY
      }
    };
  });
}

/**
 * Calculate hierarchical layout based on dependencies
 */
export function calculateHierarchicalLayout(nodes: MindMapNode[]): MindMapNode[] {
  if (!nodes || nodes.length === 0) return [];

  const positioned = new Set<string>();
  const result: MindMapNode[] = [];

  // Build dependency map
  const dependencyMap = new Map<string, string[]>();
  const reverseDependencyMap = new Map<string, string[]>();
  
  nodes.forEach(node => {
    dependencyMap.set(node.id, node.dependencies || []);
    node.dependencies?.forEach(depId => {
      if (!reverseDependencyMap.has(depId)) {
        reverseDependencyMap.set(depId, []);
      }
      reverseDependencyMap.get(depId)!.push(node.id);
    });
  });

  // Find root nodes (no dependencies)
  const rootNodes = nodes.filter(node => !node.dependencies || node.dependencies.length === 0);
  
  let currentLevel = 0;
  let currentLevelNodes = rootNodes;

  while (currentLevelNodes.length > 0) {
    const nextLevelNodes: MindMapNode[] = [];

    currentLevelNodes.forEach((node, index) => {
      if (!positioned.has(node.id)) {
        // Position the node
        const positionedNode = {
          ...node,
          position: {
            x: 100 + (currentLevel * 350),
            y: 150 + (index * 120)
          }
        };
        
        result.push(positionedNode);
        positioned.add(node.id);

        // Find nodes that depend on this one
        const dependents = reverseDependencyMap.get(node.id) || [];
        dependents.forEach(depId => {
          const depNode = nodes.find(n => n.id === depId);
          if (depNode && !positioned.has(depId)) {
            // Check if all dependencies are satisfied
            const allDepsSatisfied = (depNode.dependencies || []).every(dep => positioned.has(dep));
            if (allDepsSatisfied && !nextLevelNodes.find(n => n.id === depId)) {
              nextLevelNodes.push(depNode);
            }
          }
        });
      }
    });

    currentLevel++;
    currentLevelNodes = nextLevelNodes;
  }

  // Add any remaining nodes that weren't processed (circular dependencies or orphans)
  nodes.forEach(node => {
    if (!positioned.has(node.id)) {
      result.push({
        ...node,
        position: {
          x: 100 + (currentLevel * 350),
          y: 150 + (result.length * 120)
        }
      });
    }
  });

  return result;
}

/**
 * Optimize node positions to minimize edge crossings
 */
export function optimizeLayout(nodes: MindMapNode[]): MindMapNode[] {
  // For now, just return the hierarchical layout
  // This could be enhanced with more sophisticated algorithms
  return calculateHierarchicalLayout(nodes);
}