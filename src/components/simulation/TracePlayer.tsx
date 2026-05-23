'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Square, StepForward, Activity } from 'lucide-react';
import { useAutomataStore } from '@/store/automataStore';
import { simulateAutomaton } from '@/lib/automata/engine';

export default function TracePlayer() {
  const { automaton, testString, setTestString, setActiveStates, setSimulationTrace } = useAutomataStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [trace, setLocalTrace] = useState<any[]>([]);
  const [finalStatus, setFinalStatus] = useState<'Accept' | 'Reject' | 'Error' | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSimulate = () => {
    const result = simulateAutomaton(automaton, testString);
    if (result.error) {
      setFinalStatus('Error');
      return;
    }
    setLocalTrace(result.trace);
    setSimulationTrace(result.trace);
    setCurrentStep(-1);
    setActiveStates([automaton.initialState]);
    setFinalStatus(null);
  };

  useEffect(() => {
    handleSimulate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [automaton, testString]);

  const stepForward = () => {
    if (currentStep >= trace.length - 1) {
      setIsPlaying(false);
      return;
    }
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    setActiveStates(trace[nextStep].nextStates);
    
    if (nextStep === trace.length - 1) {
      setFinalStatus(trace[nextStep].isAccepted ? 'Accept' : 'Reject');
    }
  };

  const stop = () => {
    setIsPlaying(false);
    setCurrentStep(-1);
    setActiveStates([automaton.initialState]);
    setFinalStatus(null);
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setTimeout(stepForward, 800);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep, trace]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-bold text-slate-200">Jejak Simulasi (Trace)</h2>
      </div>

      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="Masukkan string uji (misal: 1001)"
          className="flex-grow bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
        />
      </div>

      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={trace.length === 0}
          className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <Play className="w-4 h-4" /> {isPlaying ? 'Jeda' : 'Putar'}
        </button>
        <button 
          onClick={stepForward}
          disabled={isPlaying || currentStep >= trace.length - 1 || trace.length === 0}
          className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <StepForward className="w-4 h-4" /> Langkah
        </button>
        <button 
          onClick={stop}
          disabled={currentStep === -1}
          className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <Square className="w-4 h-4" /> Berhenti
        </button>
      </div>

      {/* String Tape Visualization */}
      <div className="flex justify-center gap-1 mb-4">
        {testString.split('').map((char, idx) => (
          <div 
            key={idx} 
            className={`w-8 h-10 flex items-center justify-center font-mono font-bold rounded border ${
              idx === currentStep ? 'bg-cyan-900 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.3)]' :
              idx < currentStep ? 'bg-slate-800 border-slate-600 text-slate-500' :
              'bg-slate-950 border-slate-700 text-slate-300'
            }`}
          >
            {char}
          </div>
        ))}
      </div>

      {finalStatus && (
        <div className={`mt-4 p-3 rounded font-bold text-center ${
          finalStatus === 'Accept' ? 'bg-green-950/50 border border-green-900 text-green-400' :
          finalStatus === 'Reject' ? 'bg-red-950/50 border border-red-900 text-red-400' :
          'bg-yellow-950/50 border border-yellow-900 text-yellow-400'
        }`}>
          {finalStatus === 'Error' ? 'Automaton Error' : 
           finalStatus === 'Accept' ? 'String Diterima (Accepted)!' : 'String Ditolak (Rejected)!'}
        </div>
      )}
    </div>
  );
}
