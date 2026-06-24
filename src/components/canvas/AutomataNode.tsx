import { Handle, Position } from '@xyflow/react';
import clsx from 'clsx';

interface AutomataNodeProps {
  data: {
    label: string;
    isAccept: boolean;
    isInitial: boolean;
    isActive?: boolean;
  };
}

export default function AutomataNode({ data }: AutomataNodeProps) {
  return (
    <div className={clsx(
      "relative flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-slate-900 shadow-lg transition-all duration-300",
      data.isAccept ? "border-4 border-double" : "border-2",
      data.isActive ? "border-cyan-500 dark:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] dark:shadow-[0_0_15px_rgba(34,211,238,0.6)]" : "border-slate-300 dark:border-slate-500"
    )}>
      {/* Target handle everywhere to allow snapping */}
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="target" position={Position.Right} className="opacity-0" />
      <Handle type="target" position={Position.Bottom} className="opacity-0" />
      <Handle type="target" position={Position.Left} className="opacity-0" />
      
      {data.isInitial && (
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 flex items-center text-slate-400 dark:text-slate-500">
          <div className="w-4 h-[2px] bg-current"></div>
          <div className="w-0 h-0 border-y-4 border-y-transparent border-l-[6px] border-l-current"></div>
        </div>
      )}
      
      <span className={clsx(
        "font-mono font-bold",
        data.isActive ? "text-cyan-600 dark:text-cyan-400" : "text-slate-700 dark:text-slate-200"
      )}>
        {data.label}
      </span>
      
      {/* Source handle everywhere to allow snapping */}
      <Handle type="source" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      <Handle type="source" position={Position.Left} className="opacity-0" />
    </div>
  );
}
