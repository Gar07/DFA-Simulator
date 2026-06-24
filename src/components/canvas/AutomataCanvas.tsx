'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  Connection,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  Node,
  Edge,
} from '@xyflow/react';
import { PlusCircle, Trash2, CheckCircle, PlayCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import '@xyflow/react/dist/style.css';

import { useAutomataStore } from '@/store/automataStore';
import AutomataNode from './AutomataNode';

const nodeTypes = {
  automataNode: AutomataNode,
};

export default function AutomataCanvasWrapper() {
  return (
    <ReactFlowProvider>
      <AutomataCanvas />
    </ReactFlowProvider>
  );
}

function AutomataCanvas() {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    syncGraphFromTuple,
    addNode,
    deleteElements,
    addEdgeWithSymbol,
    toggleAcceptState,
    setInitialState
  } = useAutomataStore();
  const reactFlow = useReactFlow();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Initial sync from default tuple
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    syncGraphFromTuple();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onConnect = useCallback(
    (params: Connection) => {
      const symbol = window.prompt("Masukkan simbol transisi (misal: 0, 1, a, b):", "0");
      if (symbol !== null && params.source && params.target) {
        addEdgeWithSymbol(params.source, params.target, symbol);
      }
    },
    [addEdgeWithSymbol],
  );
  
  const onNodesDelete = useCallback((deleted: Node[]) => {
    deleteElements(deleted, []);
  }, [deleteElements]);
  
  const onEdgesDelete = useCallback((deleted: Edge[]) => {
    deleteElements([], deleted);
  }, [deleteElements]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const handleAddNode = () => {
    // Add to center of current view
    const center = reactFlow.screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    addNode(center);
  };

  const handleSelectedNodeDelete = () => {
    const nodeToDelete = nodes.find(n => n.id === selectedNodeId);
    if (nodeToDelete) {
      deleteElements([nodeToDelete], []);
      setSelectedNodeId(null);
    }
  };

  if (!mounted) {
    return <div className="w-full h-full min-h-[500px] bg-slate-50 dark:bg-slate-950 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-800"></div>;
  }

  return (
    <div className="w-full h-full min-h-[500px] bg-slate-50 dark:bg-slate-950 rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        colorMode={resolvedTheme === 'dark' ? 'dark' : 'light'}
      >
        <Panel position="top-left" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded shadow-lg flex gap-2">
          <button onClick={handleAddNode} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 transition-colors" title="Tambah State">
            <PlusCircle className="w-5 h-5" />
          </button>
          
          {selectedNodeId && (
            <>
              <div className="w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <button 
                onClick={() => toggleAcceptState(selectedNodeId)} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 transition-colors" 
                title="Jadikan/Hapus Accept State"
              >
                <CheckCircle className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setInitialState(selectedNodeId)} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 transition-colors" 
                title="Jadikan Initial State"
              >
                <PlayCircle className="w-5 h-5" />
              </button>
              <button 
                onClick={handleSelectedNodeDelete} 
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/50 rounded text-red-500 dark:text-red-400 transition-colors" 
                title="Hapus State"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
        </Panel>
        
        <Background gap={16} size={1} color={resolvedTheme === 'dark' ? '#334155' : '#cbd5e1'} />
        <Controls className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 fill-slate-600 dark:fill-slate-300" />
      </ReactFlow>
    </div>
  );
}
