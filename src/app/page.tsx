'use client';

import AutomataCanvas from '@/components/canvas/AutomataCanvas';
import TupleEditor from '@/components/forms/TupleEditor';
import PromptInput from '@/components/ai/PromptInput';
import TracePlayer from '@/components/simulation/TracePlayer';
import ReDoSDashboard from '@/components/analytics/ReDoSDashboard';
import BulkTester from '@/components/testing/BulkTester';
import { exportCanvasToPDF } from '@/lib/export/exportUtils';
import { Download } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 p-6 flex flex-col">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Simulator Automata Berbasis AI
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Evaluasi interaktif DFA/NFA & analisis kerentanan ReDoS
          </p>
        </div>
        <button 
          onClick={() => exportCanvasToPDF('automata-report-container', 'laporan-automata.pdf')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition-colors border border-slate-700"
        >
          <Download className="w-4 h-4" /> Unduh Laporan
        </button>
      </header>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Tools & Editor */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <PromptInput />
          <TupleEditor />
        </div>

        {/* Right Column: Canvas & Simulation */}
        <div className="lg:col-span-3 flex flex-col gap-6" id="automata-report-container">
          <div className="flex-grow rounded-lg overflow-hidden border border-slate-800 shadow-2xl min-h-[400px]">
            <AutomataCanvas />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TracePlayer />
            <ReDoSDashboard />
          </div>
          
          <BulkTester />
        </div>
      </div>
    </main>
  );
}
