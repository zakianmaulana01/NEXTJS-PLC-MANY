"use client";

import { useState } from 'react';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { DeviceNode, DeviceNodeType } from '@/components/flow-nodes/DeviceNode';
import { useFlowStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import { useTheme } from 'next-themes';

const nodeTypes = {
  deviceNode: DeviceNode,
};

export default function CanvasEditor() {
  const { resolvedTheme } = useTheme();
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, updateNode, deleteNode } = useFlowStore();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ tag: '', label: '', value: '', type: 'compressor' as DeviceNodeType });

  const handleAddNode = (type: DeviceNodeType) => {
    const id = `node-${Date.now()}`;
    addNode({
      id,
      type: 'deviceNode',
      position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
      data: { type, tag: `NEW-${type.substring(0,3).toUpperCase()}`, label: `New ${type}` },
    });
  };

  const handleNodeClick = (_, node) => {
    setSelectedNode(node.id);
    setEditData({
      tag: node.data.tag,
      label: node.data.label,
      value: node.data.value || '',
      type: node.data.type,
    });
  };

  const handlePaneClick = () => {
    setSelectedNode(null);
    setEditMode(false);
  };

  const saveEdit = () => {
    if (selectedNode) {
      updateNode(selectedNode, editData);
      setEditMode(false);
    }
  };

  const removeNode = () => {
    if (selectedNode) {
      deleteNode(selectedNode);
      setSelectedNode(null);
      setEditMode(false);
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col relative">
      <div className="h-14 border-b flex items-center px-4 gap-2 bg-background z-10 shrink-0">
        <span className="text-sm font-semibold mr-4">Add Device:</span>
        <Button variant="outline" size="sm" onClick={() => handleAddNode('compressor')}><Plus className="w-3 h-3 mr-1" /> Compressor</Button>
        <Button variant="outline" size="sm" onClick={() => handleAddNode('dryer')}><Plus className="w-3 h-3 mr-1" /> Dryer</Button>
        <Button variant="outline" size="sm" onClick={() => handleAddNode('tank')}><Plus className="w-3 h-3 mr-1" /> Tank</Button>
        <Button variant="outline" size="sm" onClick={() => handleAddNode('valve')}><Plus className="w-3 h-3 mr-1" /> Valve</Button>
        <Button variant="outline" size="sm" onClick={() => handleAddNode('flowmeter')}><Plus className="w-3 h-3 mr-1" /> Flow Meter</Button>
        <Button variant="outline" size="sm" onClick={() => handleAddNode('boiler')}><Plus className="w-3 h-3 mr-1" /> Boiler</Button>
        <Button variant="outline" size="sm" onClick={() => handleAddNode('headerboiler')}><Plus className="w-3 h-3 mr-1" /> Header Boiler</Button>
      </div>

      <div className="flex-1 relative w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          fitView
          colorMode={resolvedTheme === 'dark' ? 'dark' : 'light'}
        >
          <Background gap={20} size={1} />
          <Controls />
          <MiniMap zoomable pannable nodeClassName={(n) => `fill-primary opacity-50`} />
        </ReactFlow>

        {selectedNode && (
          <div className="absolute top-4 right-4 w-72 bg-background border rounded-lg shadow-lg p-4 z-20 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-semibold text-sm">Node Properties</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedNode(null)}><X className="w-4 h-4" /></Button>
            </div>
            
            {editMode ? (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Type</label>
                  <select 
                    className="w-full text-sm border rounded p-1.5 mt-1 bg-background"
                    value={editData.type}
                    onChange={(e) => setEditData({...editData, type: e.target.value as DeviceNodeType})}
                  >
                    <option value="compressor">Compressor</option>
                    <option value="dryer">Dryer</option>
                    <option value="tank">Tank</option>
                    <option value="valve">Valve</option>
                    <option value="flowmeter">Flow Meter</option>
                    <option value="boiler">Boiler</option>
                    <option value="headerboiler">Header Boiler</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Tag</label>
                  <input 
                    type="text" 
                    className="w-full text-sm border rounded p-1.5 mt-1 bg-background" 
                    value={editData.tag} 
                    onChange={e => setEditData({...editData, tag: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Label</label>
                  <input 
                    type="text" 
                    className="w-full text-sm border rounded p-1.5 mt-1 bg-background" 
                    value={editData.label} 
                    onChange={e => setEditData({...editData, label: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Value (optional)</label>
                  <input 
                    type="text" 
                    className="w-full text-sm border rounded p-1.5 mt-1 bg-background" 
                    value={editData.value} 
                    onChange={e => setEditData({...editData, value: e.target.value})} 
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" className="flex-1" onClick={saveEdit}>Save</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="text-sm"><span className="text-muted-foreground text-xs block">Tag:</span> <span className="font-mono font-bold">{editData.tag}</span></div>
                <div className="text-sm"><span className="text-muted-foreground text-xs block">Label:</span> {editData.label}</div>
                <div className="text-sm"><span className="text-muted-foreground text-xs block">Value:</span> {editData.value || '-'}</div>
                
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditMode(true)}>
                    <Edit2 className="w-3 h-3 mr-2" /> Edit
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1" onClick={removeNode}>
                    <Trash2 className="w-3 h-3 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
