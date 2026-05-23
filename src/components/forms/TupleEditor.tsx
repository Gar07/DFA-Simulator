'use client';

import { useState } from 'react';
import { useAutomataStore } from '@/store/automataStore';
import { Automaton } from '@/lib/automata/types';

export default function TupleEditor() {
  const { automaton, updateTuple } = useAutomataStore();
  const [prevAutomaton, setPrevAutomaton] = useState(automaton);
  const [localJson, setLocalJson] = useState(() => JSON.stringify(automaton, null, 2));
  const [error, setError] = useState<string | null>(null);

  if (automaton !== prevAutomaton) {
    setPrevAutomaton(automaton);
    setLocalJson(JSON.stringify(automaton, null, 2));
  }

  const handleSave = () => {
    try {
      const parsed = JSON.parse(localJson) as Automaton;
      // Basic runtime validation before saving to store
      if (!parsed.states || !parsed.alphabet || !parsed.transitions) {
        throw new Error('Invalid Automaton structure. Missing required fields.');
      }
      updateTuple(parsed);
      setError(null);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Invalid JSON format');
      }
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-200">Definisi 5-Tuple</h2>
        <button 
          onClick={handleSave}
          className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-sm font-medium transition-colors"
        >
          Terapkan
        </button>
      </div>
      
      <p className="text-xs text-slate-400 mb-2">
        Edit representasi JSON DFA/NFA secara langsung untuk melihat pembaruan di kanvas.
      </p>

      {error && (
        <div className="mb-3 p-2 bg-red-950/50 border border-red-900 text-red-400 text-xs rounded">
          {error}
        </div>
      )}

      <textarea
        value={localJson}
        onChange={(e) => setLocalJson(e.target.value)}
        className="flex-grow bg-slate-950 border border-slate-700 rounded p-3 text-sm font-mono text-slate-300 focus:outline-none focus:border-cyan-500 resize-none"
        spellCheck={false}
      />
    </div>
  );
}
