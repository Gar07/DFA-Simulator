'use client';

import { useMemo } from 'react';
import { ShieldAlert, ShieldCheck, Zap } from 'lucide-react';
import { useAutomataStore } from '@/store/automataStore';
import { analyzeReDoS, ReDoSAnalysisResult } from '@/lib/automata/redos-analyzer';

export default function ReDoSDashboard() {
  const { automaton, testString } = useAutomataStore();

  const analysis = useMemo<ReDoSAnalysisResult | null>(() => {
    if (automaton && testString) {
      return analyzeReDoS(automaton, testString);
    }
    return null;
  }, [automaton, testString]);

  if (!analysis) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg p-4 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-purple-500 dark:text-purple-400" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Analitik ReDoS</h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Masukkan string uji untuk menganalisis kompleksitas eksekusi.</p>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-4 transition-colors shadow-sm dark:shadow-none ${
      analysis.isVulnerable 
        ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50' 
        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800'
    }`}>
      <div className="flex items-center gap-2 mb-4">
        {analysis.isVulnerable ? (
          <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
        ) : (
          <ShieldCheck className="w-5 h-5 text-green-500" />
        )}
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Analitik ReDoS</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-50 dark:bg-slate-950 rounded p-3 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
          <span className="text-xs text-slate-500 dark:text-slate-400 mb-1">Rasio Kompleksitas</span>
          <span className={`text-2xl font-bold font-mono ${
            analysis.complexityRatio > 5 ? 'text-red-500' : 
            analysis.complexityRatio > 1.5 ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {analysis.complexityRatio.toFixed(2)}x
          </span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950 rounded p-3 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
          <span className="text-xs text-slate-500 dark:text-slate-400 mb-1">Arsitektur</span>
          <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
            {automaton.isNFA ? 'NFA' : 'DFA'}
          </span>
        </div>
      </div>

      <div className={`p-3 rounded text-sm ${
        analysis.isVulnerable ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-800/50' : 'bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'
      }`}>
        {analysis.message}
      </div>
    </div>
  );
}
