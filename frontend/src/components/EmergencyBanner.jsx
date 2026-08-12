import React from 'react';

export default function EmergencyBanner() {
  return (
    <div className="bg-red-950/60 border-b border-red-500/40 px-6 py-3 transition-all animate-pulse">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-red-200">
        <div className="flex items-center gap-2">
          <span className="text-base">🚨</span>
          <span className="font-semibold text-sm">EMERGENCY STOP ACTIVATED — All Autonomous Payment Pipelines Halted</span>
        </div>
        <div>Middleware Checkpoints 1–5 actively rejecting all incoming AI transaction attempts.</div>
      </div>
    </div>
  );
}
