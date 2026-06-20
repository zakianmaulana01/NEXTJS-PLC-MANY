import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface FlowNode { id: string; data?: { equipmentType?: string; status?: string } }
interface FlowEdge { source: string; target: string }

export function calculateFlowPropagation(nodes: FlowNode[], edges: FlowEdge[]): Set<string> {
  const flowingNodes = new Set<string>();
  const adjacencyList = new Map<string, string[]>();

  edges.forEach((edge) => {
    if (!adjacencyList.has(edge.source)) {
      adjacencyList.set(edge.source, []);
    }
    adjacencyList.get(edge.source)!.push(edge.target);
  });

  const queue: string[] = [];
  nodes.forEach((node) => {
    // Sources of flow: Running compressors
    if (node.data?.equipmentType === 'compressor' && node.data?.status === 'RUN') {
      flowingNodes.add(node.id);
      queue.push(node.id);
    }
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = adjacencyList.get(current) || [];
    
    for (const neighborId of neighbors) {
      if (!flowingNodes.has(neighborId)) {
        const neighborNode = nodes.find((n) => n.id === neighborId);
        if (neighborNode) {
          // Valves block flow if they are STOP (closed)
          if (neighborNode.data?.equipmentType === 'valve' && neighborNode.data?.status === 'STOP') {
            continue;
          }
          flowingNodes.add(neighborId);
          queue.push(neighborId);
        }
      }
    }
  }

  return flowingNodes;
}
