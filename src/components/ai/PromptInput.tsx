'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAutomataStore } from '@/store/automataStore';

export default function PromptInput() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAutomaton } = useAutomataStore();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/generate-automata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Generation failed');
      }
      
      setAutomaton(data);
      setPrompt('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-bold text-slate-200">Generator AI</h2>
      </div>
      
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Deskripsikan bahasa (misal: 'DFA yang menerima string biner yang diakhiri dengan 01')"
        className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 min-h-[100px] resize-none mb-3"
      />
      
      {error && (
        <div className="mb-3 p-2 bg-red-950/50 border border-red-900 text-red-400 text-xs rounded">
          {error}
        </div>
      )}
      
      <button
        onClick={handleGenerate}
        disabled={isLoading || !prompt.trim()}
        className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 text-white rounded font-medium transition-all flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Membuat Automata...
          </>
        ) : (
          'Buat Automata'
        )}
      </button>
    </div>
  );
}
