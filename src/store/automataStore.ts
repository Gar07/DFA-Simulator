import { create } from 'zustand';
import { Automaton, Transition } from '@/lib/automata/types';
import { Node, Edge, NodeChange, EdgeChange } from '@xyflow/react';
import { getLayoutedElements } from '@/lib/layout/dagreLayout';

interface AutomataState {
  automaton: Automaton;
  nodes: Node[];
  edges: Edge[];
  
  // Canvas Editing Actions
  syncTupleFromGraph: () => void;
  addNode: (position: { x: number; y: number }) => void;
  deleteElements: (nodesToDelete: Node[], edgesToDelete: Edge[]) => void;
  addEdgeWithSymbol: (source: string, target: string, symbol: string) => void;
  toggleAcceptState: (nodeId: string) => void;
  setInitialState: (nodeId: string) => void;
  
  // React Flow handlers directly mapped
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  
  // Simulation State
  testString: string;
  setTestString: (str: string) => void;
  activeStates: string[];
  setActiveStates: (states: string[]) => void;
  simulationTrace: import('@/lib/automata/types').StepTrace[];
  setSimulationTrace: (trace: import('@/lib/automata/types').StepTrace[]) => void;
}

const defaultAutomaton: Automaton = {
  isNFA: false,
  states: ['q0', 'q1'],
  alphabet: ['0', '1'],
  transitions: [
    { from: 'q0', input: '0', to: ['q1'] },
    { from: 'q0', input: '1', to: ['q0'] },
    { from: 'q1', input: '0', to: ['q1'] },
    { from: 'q1', input: '1', to: ['q0'] }
  ],
  initialState: 'q0',
  acceptStates: ['q1']
};

export const useAutomataStore = create<AutomataState>((set, get) => ({
  automaton: defaultAutomaton,
  nodes: [],
  edges: [],
  
  testString: '',
  setTestString: (str) => set({ testString: str }),
  activeStates: [],
  setActiveStates: (states) => {
    set({ activeStates: states });
    // Update node highlighting
    set((state) => ({
      nodes: state.nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          isActive: states.includes(node.id)
        }
      }))
    }));
  },
  simulationTrace: [],
  setSimulationTrace: (trace) => set({ simulationTrace: trace }),

  setAutomaton: (automaton) => {
    set({ automaton });
    get().syncGraphFromTuple();
  },
  
  updateTuple: (partial) => {
    set((state) => ({ automaton: { ...state.automaton, ...partial } }));
    get().syncGraphFromTuple();
  },

  syncGraphFromTuple: () => {
    const { automaton } = get();
    
    const initialNodes: Node[] = automaton.states.map((state) => ({
      id: state,
      position: { x: 0, y: 0 },
      data: { 
        label: state, 
        isAccept: automaton.acceptStates.includes(state),
        isInitial: automaton.initialState === state
      },
      type: 'automataNode'
    }));

    const initialEdges: Edge[] = automaton.transitions.flatMap((t, i) => 
      t.to.map((dest, j) => ({
        id: `e-${t.from}-${dest}-${t.input}-${i}-${j}`,
        source: t.from,
        target: dest,
        label: t.input,
        type: 'default',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 }
      }))
    );

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges,
      'LR'
    );

    set({ nodes: layoutedNodes, edges: layoutedEdges });
  },

  syncTupleFromGraph: () => {
    const { nodes, edges } = get();
    
    const states = nodes.map(n => n.id);
    const initialState = nodes.find(n => n.data?.isInitial)?.id || (states.length > 0 ? states[0] : '');
    const acceptStates = nodes.filter(n => n.data?.isAccept).map(n => n.id);
    
    // Extract unique alphabet symbols from edges
    const alphabetSet = new Set<string>();
    edges.forEach(e => {
      if (e.label && typeof e.label === 'string') {
        alphabetSet.add(e.label);
      }
    });
    const alphabet = Array.from(alphabetSet);

    // Rebuild transitions
    const transitions: Transition[] = [];
    // Group by source and input
    const transitionMap = new Map<string, string[]>();

    edges.forEach(e => {
      const source = e.source;
      const target = e.target;
      const input = (e.label as string) || '';
      
      const key = `${source}-${input}`;
      if (!transitionMap.has(key)) {
        transitionMap.set(key, []);
      }
      transitionMap.get(key)!.push(target);
    });

    transitionMap.forEach((targets, key) => {
      const [source, input] = key.split('-');
      transitions.push({
        from: source,
        input: input,
        to: targets
      });
    });

    const isNFA = transitions.some(t => t.to.length > 1) || edges.some(e => e.label === '');

    set({
      automaton: {
        isNFA,
        states,
        alphabet,
        transitions,
        initialState,
        acceptStates
      }
    });
  },

  addNode: (position) => {
    const { nodes } = get();
    // Find next available qN name
    let idx = 0;
    while(nodes.some(n => n.id === `q${idx}`)) idx++;
    const newId = `q${idx}`;
    
    const newNode: Node = {
      id: newId,
      position,
      data: { label: newId, isAccept: false, isInitial: nodes.length === 0 },
      type: 'automataNode'
    };
    
    set({ nodes: [...nodes, newNode] });
    get().syncTupleFromGraph();
  },

  deleteElements: (nodesToDelete, edgesToDelete) => {
    const { nodes, edges } = get();
    const nodeIds = nodesToDelete.map(n => n.id);
    const edgeIds = edgesToDelete.map(e => e.id);
    
    set({
      nodes: nodes.filter(n => !nodeIds.includes(n.id)),
      edges: edges.filter(e => !edgeIds.includes(e.id) && !nodeIds.includes(e.source) && !nodeIds.includes(e.target))
    });
    
    get().syncTupleFromGraph();
  },

  addEdgeWithSymbol: (source, target, symbol) => {
    const { edges } = get();
    const newEdge: Edge = {
      id: `e-${source}-${target}-${symbol}-${Date.now()}`,
      source,
      target,
      label: symbol,
      type: 'default',
      animated: true,
      style: { stroke: '#94a3b8', strokeWidth: 2 }
    };
    
    set({ edges: [...edges, newEdge] });
    get().syncTupleFromGraph();
  },

  toggleAcceptState: (nodeId) => {
    const { nodes } = get();
    set({
      nodes: nodes.map(n => 
        n.id === nodeId 
          ? { ...n, data: { ...n.data, isAccept: !n.data.isAccept } } 
          : n
      )
    });
    get().syncTupleFromGraph();
  },

  setInitialState: (nodeId) => {
    const { nodes } = get();
    set({
      nodes: nodes.map(n => ({
        ...n,
        data: { ...n.data, isInitial: n.id === nodeId }
      }))
    });
    get().syncTupleFromGraph();
  },

  // Apply React Flow changes directly to Zustand store to keep them in sync
  onNodesChange: (changes) => {
    import('@xyflow/react').then(({ applyNodeChanges }) => {
      set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) }));
      // We don't sync to tuple on every micro-drag to save performance, 
      // but structural changes are handled by add/delete functions.
    });
  },
  
  onEdgesChange: (changes) => {
    import('@xyflow/react').then(({ applyEdgeChanges }) => {
      set((state) => ({ edges: applyEdgeChanges(changes, state.edges) }));
    });
  }
}));
