'use client';

import { useState } from 'react';
import { useAutomataStore } from '@/store/automataStore';
import { simulateAutomaton } from '@/lib/automata/engine';
import { Table, CheckCircle2, XCircle } from 'lucide-react';

export default function BulkTester() {
  const { automaton } = useAutomataStore();
  const [bulkInput, setBulkInput] = useState('');
  const [results, setResults] = useState<{ str: string; accepted: boolean; time: number }[]>([]);

  const handleTest = () => {
    const strings = bulkInput.split('\n').map(s => s.trim()).filter(s => s);
    
    const newResults = strings.map(str => {
      const t0 = performance.now();
      const res = simulateAutomaton(automaton, str);
      const t1 = performance.now();
      return {
        str,
        accepted: res.accepted,
        time: t1 - t0
      };
    });
    
    setResults(newResults);
  };

  const acceptedCount = results.filter(r => r.accepted).length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Table className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-bold text-slate-200">Pengujian Massal (Bulk Test)</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-slate-400 mb-2">Masukkan satu string per baris untuk diuji terhadap automata saat ini.</p>
          <textarea
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            placeholder="0101\n110\n000"
            className="w-full h-48 bg-slate-950 border border-slate-700 rounded p-3 text-sm font-mono text-slate-300 focus:outline-none focus:border-cyan-500 resize-none mb-3"
          />
          <button 
            onClick={handleTest}
            disabled={!bulkInput.trim()}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition-colors disabled:opacity-50"
          >
            Jalankan Pengujian
          </button>
        </div>

        {results.length > 0 && (
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-slate-300">
                Hasil: {acceptedCount}/{results.length} Diterima
              </span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded flex-grow overflow-auto max-h-[250px]">
              <table className="w-full text-sm text-left text-slate-400">
                <thead className="text-xs text-slate-300 uppercase bg-slate-900 sticky top-0">
                  <tr>
                    <th className="px-4 py-2">String</th>
                    <th className="px-4 py-2 text-center">Status</th>
                    <th className="px-4 py-2 text-right">Waktu (ms)</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className="border-b border-slate-800 last:border-0 hover:bg-slate-900/50">
                      <td className="px-4 py-2 font-mono">{r.str || '<kosong>'}</td>
                      <td className="px-4 py-2 flex justify-center">
                        {r.accepted ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-xs">
                        {r.time.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
