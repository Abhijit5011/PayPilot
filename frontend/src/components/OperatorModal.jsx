import React from 'react';

export default function OperatorModal({ actorModal, setActorModal, onSubmit }) {
  if (!actorModal.open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel max-w-md w-full rounded-2xl p-6 space-y-5 border-[#2A2A2A] bg-[#141414] animate-scale-in">
        
        <div className="space-y-1 text-center">
          <div className="text-3xl mb-2">{actorModal.action === 'freeze' ? '🚨' : '🔓'}</div>
          <h3 className="font-display font-bold text-lg text-[#F5F5F5]">
            {actorModal.action === 'freeze' ? 'Arm Emergency Kill Switch' : 'Unfreeze Autonomous Pipeline'}
          </h3>
          <p className="text-xs text-[#8A8A8E] font-mono">
            ADR-004 Requirement: Operator identification is mandatory for immutable security audit logging.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono text-[#8A8A8E] uppercase tracking-wider">Operator Name / Admin ID</label>
          <input
            type="text"
            autoFocus
            placeholder="e.g. Priya Shah (Admin)"
            value={actorModal.actorName}
            onChange={(e) => setActorModal({ ...actorModal, actorName: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
            className="w-full px-4 py-3 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A] text-sm font-mono text-[#F5F5F5] placeholder-[#8A8A8E] focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => setActorModal({ open: false, action: 'freeze', actorName: '' })}
            className="flex-1 py-2.5 rounded-xl border border-[#2A2A2A] font-mono text-xs text-[#8A8A8E] hover:text-white transition-all active:scale-[0.97]"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-bold transition-all text-white active:scale-[0.97] ${
              actorModal.action === 'freeze' ? 'bg-[#EF4444] hover:bg-red-600 shadow-md' : 'bg-[#22C55E] hover:bg-emerald-600 text-black shadow-md'
            }`}
          >
            Confirm Action
          </button>
        </div>

      </div>
    </div>
  );
}
