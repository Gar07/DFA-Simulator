'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Play, Square, StepForward, Activity } from 'lucide-react';
import { useAutomataStore } from '@/store/automataStore';
import { simulateAutomaton } from '@/lib/automata/engine';
import { StepTrace } from '@/lib/automata/types';

export default function TracePlayer() {
  const { automaton, testString, setTestString, setActiveStates } = useAutomataStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const trace = useMemo<StepTrace[]>(() => {
    const result = simulateAutomaton(automaton, testString);
    return result.error ? [] : result.trace;
  }, [automaton, testString]);

  const [prevTrace, setPrevTrace] = useState(trace);

  if (trace !== prevTrace) {
    setPrevTrace(trace);
    setCurrentStep(-1);
    setIsPlaying(false);
  }

  useEffect(() => {
    setActiveStates([automaton.initialState]);
  }, [automaton.initialState, trace, setActiveStates]);

  const finalStatus = useMemo<'Accept' | 'Reject' | 'Error' | null>(() => {
    if (trace.length === 0 && testString.length > 0) {
      return 'Error';
    }
    if (currentStep === -1) {
      return null;
    }
    if (currentStep === trace.length - 1) {
      return trace[currentStep].isAccepted ? 'Accept' : 'Reject';
    }
    return null;
  }, [trace, currentStep, testString]);

  const stepForward = useCallback(() => {
    if (currentStep >= trace.length - 1) {
      setIsPlaying(false);
      return;
    }
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    setActiveStates(trace[nextStep].nextStates);
  }, [currentStep, trace, setActiveStates]);

  const stop = () => {
    setIsPlaying(false);
    setCurrentStep(-1);
    setActiveStates([automaton.initialState]);
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setTimeout(stepForward, 800);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep, trace, stepForward]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg p-4 shadow-sm dark:shadow-none">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Jejak Simulasi (Trace)</h2>
      </div>

      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="Masukkan string uji (misal: 1001)"
          className="flex-grow bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded p-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500 font-mono placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
      </div>

      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={trace.length === 0}
          className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <Play className="w-4 h-4" /> {isPlaying ? 'Jeda' : 'Putar'}
        </button>
        <button 
          onClick={stepForward}
          disabled={isPlaying || currentStep >= trace.length - 1 || trace.length === 0}
          className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <StepForward className="w-4 h-4" /> Langkah
        </button>
        <button 
          onClick={stop}
          disabled={currentStep === -1}
          className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
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
              idx === currentStep ? 'bg-cyan-100 border-cyan-400 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)] dark:shadow-[0_0_10px_rgba(34,211,238,0.3)]' :
              idx < currentStep ? 'bg-slate-200 border-slate-300 text-slate-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-500' :
              'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            {char}
          </div>
        ))}
      </div>

      {finalStatus && (
        <div className={`mt-4 p-3 rounded font-bold text-center ${
          finalStatus === 'Accept' ? 'bg-green-50 border border-green-200 text-green-700 dark:bg-green-950/50 dark:border-green-900 dark:text-green-400' :
          finalStatus === 'Reject' ? 'bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/50 dark:border-red-900 dark:text-red-400' :
          'bg-yellow-50 border border-yellow-200 text-yellow-700 dark:bg-yellow-950/50 dark:border-yellow-900 dark:text-yellow-400'
        }`}>
          {finalStatus === 'Error' ? 'Automaton Error' : 
           finalStatus === 'Accept' ? 'String Diterima (Accepted)!' : 'String Ditolak (Rejected)!'}
        </div>
      )}
    </div>
  );
}
