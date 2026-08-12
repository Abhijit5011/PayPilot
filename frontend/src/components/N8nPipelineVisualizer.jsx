import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { checkReducedMotion } from '../config';
import { SPRING, DURATION, EASING } from '../motionVariants';

export default function N8nPipelineVisualizer({
  isSending,
  isFrozen,
  lastDecision,
  onTriggerRequest,
  onTriggerKillSwitch
}) {
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [activeSubNodeId, setActiveSubNodeId] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('Pay Acme Corp $150');
  const shouldReduceMotion = checkReducedMotion();

  // Granular Sub-Node Execution Animation Pacing
  useEffect(() => {
    if (!isSending) {
      if (lastDecision) {
        if (lastDecision.decision === 'APPROVED') setActiveSubNodeId('D5');
        else if (lastDecision.reason?.includes('frozen')) setActiveSubNodeId('B2');
        else if (lastDecision.reason?.includes('allowlist') || lastDecision.reason?.includes('limit')) setActiveSubNodeId('C3');
        else setActiveSubNodeId(null);
      } else {
        setActiveSubNodeId(null);
      }
      return;
    }

    /* Presentational pacing during real async wait, not synthetic data */
    const sequence = ['B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4', 'C5', 'D1', 'D2', 'D3', 'D4', 'D5'];
    let step = 0;

    const timer = setInterval(() => {
      if (step < sequence.length) {
        setActiveSubNodeId(sequence[step]);
        step++;
      } else {
        clearInterval(timer);
      }
    }, 120);

    return () => clearInterval(timer);
  }, [isSending, lastDecision]);

  // Sub-Nodes Data Structure
  const workflowNodes = [
    {
      id: 'wf-b',
      title: 'Workflow B — AI Agent Gate',
      type: 'LLM Extraction & Delegate',
      credential: 'Gemini API Key ONLY (0 DB Write, 0 Stripe)',
      checkpoint: 'Checkpoint 1 (Pre-LLM Freeze Guard)',
      description: 'Parses natural language prompt into {recipient, amount}. Rejects at Checkpoint 1 if wallet is frozen before invoking Gemini.',
      triggerType: 'Public Webhook (POST /webhook/ai-agent)',
      subNodes: [
        { id: 'B1', name: 'Webhook Ingestion', type: 'webhook', desc: 'POST /webhook/ai-agent' },
        { id: 'B2', name: 'Checkpoint 1 Read Policy', type: 'supabase', desc: 'Fail-fast if frozen' },
        { id: 'B3', name: 'Gemini 2.5 Flash', type: 'llm', desc: 'Extract {recipient, amount}' },
        { id: 'B4', name: 'Delegate to Workflow C', type: 'execute', desc: 'Invoke Middleware' }
      ]
    },
    {
      id: 'wf-c',
      title: 'Workflow C — Authorization Middleware',
      type: 'Sole Authorization Authority',
      credential: 'Supabase Service Role Key ONLY (Cannot call Stripe)',
      checkpoint: 'Checkpoint 2 & Checkpoint 3 (Pre-Executor Race Guard)',
      description: 'Re-reads policies.is_frozen from Postgres. Validates recipient against allowlist and spent_today + amount <= daily_limit.',
      triggerType: 'Internal Execute Workflow Trigger Only',
      subNodes: [
        { id: 'C1', name: 'Execute Trigger', type: 'trigger', desc: 'Sub-workflow entry' },
        { id: 'C2', name: 'Checkpoint 2 Read Policy', type: 'supabase', desc: 'Verify is_frozen' },
        { id: 'C3', name: 'DB Allowlist & Cap Check', type: 'supabase', desc: 'Validate counterparty' },
        { id: 'C4', name: 'Checkpoint 3 Race Guard', type: 'supabase', desc: 'Re-verify before D' },
        { id: 'C5', name: 'Delegate to Workflow D', type: 'execute', desc: 'Invoke Executor' }
      ]
    },
    {
      id: 'wf-d',
      title: 'Workflow D — Payment Executor',
      type: 'Stripe Rail Execution',
      credential: 'Stripe Test Secret Key + Supabase Service Role Key',
      checkpoint: 'Checkpoint 4 (Final Pre-Stripe Execution Guard)',
      description: 'Re-checks is_frozen one final time before invoking Stripe /v1/payment_intents. Idempotency guarded by request_id.',
      triggerType: 'Internal Execute Workflow Trigger Only',
      subNodes: [
        { id: 'D1', name: 'Execute Trigger', type: 'trigger', desc: 'Sub-workflow entry' },
        { id: 'D2', name: 'Idempotency Guard', type: 'code', desc: 'Check request_id' },
        { id: 'D3', name: 'Checkpoint 4 Read Policy', type: 'supabase', desc: 'Pre-Stripe check' },
        { id: 'D4', name: 'Stripe PaymentIntent', type: 'stripe', desc: '/v1/payment_intents' },
        { id: 'D5', name: 'Log Audit Transaction', type: 'supabase', desc: 'Write transaction_logs' }
      ]
    },
    {
      id: 'wf-a',
      title: 'Workflow A — Kill Switch API',
      type: 'Circuit Breaker Controller',
      credential: 'Supabase Service Role Key ONLY',
      checkpoint: 'Mutates policies.is_frozen & Logs SYSTEM Audit Event',
      description: 'Invoked by Emergency Stop / Unfreeze buttons. Instantly updates policies.is_frozen and records auditable actor row.',
      triggerType: 'Public Webhook (POST /webhook/kill-switch)',
      subNodes: [
        { id: 'A1', name: 'Kill Switch Webhook', type: 'webhook', desc: 'POST /webhook/kill-switch' },
        { id: 'A2', name: 'Validate Request', type: 'code', desc: 'Validate actor & action' },
        { id: 'A3', name: 'Mutate policies.is_frozen', type: 'supabase', desc: 'Set is_frozen in DB' },
        { id: 'A4', name: 'Log SYSTEM Audit Event', type: 'supabase', desc: 'Record actor in logs' }
      ]
    }
  ];

  const selectedNode = workflowNodes.find(n => n.id === selectedNodeId);

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.deliberate, ease: EASING.entrance, delay: 0.18 }}
      className="glass-panel rounded-2xl p-6 space-y-6 scanline overflow-hidden relative shadow-lg border border-[#2A2A2A]"
    >
      {/* Visualizer Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#2A2A2A] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-base uppercase tracking-wide text-[#F5F5F5]">n8n Live Workflow Visualizer</h2>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[#22C55E] font-bold animate-pulse">
              ● LIVE NODE TOPOLOGY
            </span>
          </div>
          <p className="text-xs text-[#8A8A8E] mt-1">Real-time execution tracing across Workflows A, B, C, and D (Positioned below Ledger)</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-[#8A8A8E] bg-[#141414] px-3 py-1.5 rounded-xl border border-[#2A2A2A]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#8A8A8E]"></span>
            <span>IDLE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span className="text-white font-bold">PROCESSING</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
            <span className="text-[#22C55E] font-bold">PASS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
            <span className="text-[#EF4444] font-bold">REJECTED</span>
          </div>
        </div>
      </div>



      {/* Main Workflow Topology Canvas with Animated SVG Stream Cables */}
      <div className="space-y-4 relative py-2">

        {/* SVG Flow Stream Canvas Overlay */}
        <svg className="hidden md:block absolute top-[90px] left-0 right-0 w-full h-12 pointer-events-none z-0 overflow-visible opacity-50">
          <line x1="28%" y1="50%" x2="42%" y2="50%" stroke="#8A8A8E" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="62%" y1="50%" x2="76%" y2="50%" stroke="#8A8A8E" strokeWidth="2" strokeDasharray="4 4" />

          {/* Animated Glowing Packet Dots */}
          {(isSending || activeSubNodeId) && !shouldReduceMotion && (
            <>
              <circle r="4" fill="#FFFFFF">
                <animate attributeName="cx" values="28%; 42%" dur="0.6s" repeatCount="indefinite" />
                <animate attributeName="cy" values="50%; 50%" dur="0.6s" repeatCount="indefinite" />
              </circle>
              <circle r="4" fill="#FFFFFF">
                <animate attributeName="cx" values="62%; 76%" dur="0.6s" begin="0.3s" repeatCount="indefinite" />
                <animate attributeName="cy" values="50%; 50%" dur="0.6s" begin="0.3s" repeatCount="indefinite" />
              </circle>
            </>
          )}
        </svg>

        {/* Top Pipelines Row (Workflows B, C, D) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 relative z-10">
          {workflowNodes.slice(0, 3).map((wf) => {
            const isSelected = selectedNodeId === wf.id;

            return (
              <div
                key={wf.id}
                className="glass-panel p-4 rounded-xl border border-[#2A2A2A] bg-[#141414] space-y-3 relative shadow-md"
              >
                {/* Workflow Header */}
                <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#8A8A8E] uppercase">{wf.id.toUpperCase()}</span>
                    <h3 className="font-mono text-xs font-bold text-[#F5F5F5]">{wf.title}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedNodeId(isSelected ? null : wf.id)}
                    className="text-[10px] font-mono text-white underline font-bold"
                  >
                    {isSelected ? 'Close' : 'Inspect'}
                  </button>
                </div>

                {/* Internal n8n Sub-Nodes List */}
                <div className="space-y-2">
                  {wf.subNodes.map((sn) => {
                    const isSubActive = activeSubNodeId === sn.id;
                    const isSubPass = lastDecision?.decision === 'APPROVED' && !isSending && activeSubNodeId === 'D5';
                    const isSubRejected = lastDecision?.decision === 'REJECTED' && !isSending && (
                      (sn.id === 'B2' && lastDecision.reason?.includes('frozen')) ||
                      (sn.id === 'C3' && (lastDecision.reason?.includes('allowlist') || lastDecision.reason?.includes('limit')))
                    );

                    return (
                      <motion.div
                        key={sn.id}
                        animate={isSubActive && !shouldReduceMotion ? { scale: [1, 1.02, 1] } : {}}
                        className={`p-2.5 rounded-lg border text-xs font-mono transition-all flex items-center justify-between ${isSubActive
                            ? 'bg-[#1C1C1C] border-white text-white shadow-[0_0_12px_rgba(255,255,255,0.3)]'
                            : isSubPass
                              ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                              : isSubRejected
                                ? 'bg-red-950/50 border-red-500 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                                : 'bg-[#0A0A0A] border-[#2A2A2A] text-[#8A8A8E]'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1C1C1C] text-white">
                            {sn.id}
                          </span>
                          <div>
                            <span className="font-semibold text-[11px] block text-white">{sn.name}</span>
                            <span className="text-[9px] text-[#8A8A8E]">{sn.desc}</span>
                          </div>
                        </div>

                        {isSubActive ? (
                          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                        ) : isSubPass ? (
                          <span className="text-[#22C55E] font-bold">✓</span>
                        ) : isSubRejected ? (
                          <span className="text-[#EF4444] font-bold">✕</span>
                        ) : (
                          <span className="text-zinc-600">○</span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Workflow A (System Controller Node) Bar */}
        {(() => {
          const sysWf = workflowNodes[3];
          const isSysSelected = selectedNodeId === sysWf.id;

          return (
            <div className={`p-4 rounded-xl border border-[#2A2A2A] bg-[#141414] space-y-3 relative z-10 ${isFrozen ? 'border-red-500/60 bg-red-950/20' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2A2A2A] pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-500/30">
                    SYSTEM CONTROL
                  </span>
                  <h3 className="font-mono text-xs font-bold text-[#F5F5F5]">{sysWf.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedNodeId(isSysSelected ? null : sysWf.id)}
                  className="text-[10px] font-mono text-white underline font-bold"
                >
                  {isSysSelected ? 'Close' : 'Inspect Node'}
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-xs">
                {sysWf.subNodes.map((sn) => (
                  <div key={sn.id} className="p-2 rounded bg-[#0A0A0A] border border-[#2A2A2A] flex items-center justify-between text-[11px]">
                    <div>
                      <span className="text-white font-bold block">{sn.name}</span>
                      <span className="text-[9px] text-[#8A8A8E]">{sn.desc}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-bold">{sn.id}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

      </div>

      {/* Shared Layout Inline Node Inspector Drawer */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: DURATION.deliberate, ease: EASING.entrance }}
            className="p-4 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A] space-y-3 font-mono text-xs overflow-hidden shadow-inner relative z-20"
          >
            <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-2">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">🔍 Node Inspector:</span>
                <span className="text-white font-bold">{selectedNode.title}</span>
              </div>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="text-[#8A8A8E] hover:text-white text-xs font-bold"
              >
                ✕ Close Inspector
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
              <div className="space-y-1">
                <span className="text-[#8A8A8E] uppercase tracking-wider text-[10px] font-bold">Trigger Mechanism & Webhook URL</span>
                <div className="text-[#F5F5F5] p-2 rounded bg-[#141414] border border-[#2A2A2A] font-semibold break-all select-all">{selectedNode.triggerType}</div>
              </div>

              <div className="space-y-1">
                <span className="text-[#8A8A8E] uppercase tracking-wider text-[10px] font-bold">Credential Scope (Zero-Trust)</span>
                <div className="text-[#F5F5F5] p-2 rounded bg-[#141414] border border-[#2A2A2A] font-semibold">{selectedNode.credential}</div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[#8A8A8E] uppercase tracking-wider text-[10px] font-bold">Enforced Security Checkpoint</span>
              <div className="text-[#F5F5F5] p-2 rounded bg-[#141414] border border-[#2A2A2A] font-semibold">{selectedNode.checkpoint}</div>
            </div>

            <div className="space-y-1">
              <span className="text-[#8A8A8E] uppercase tracking-wider text-[10px] font-bold">n8n Internal Nodes Included</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedNode.nodesInWorkflow.map((n, idx) => (
                  <span key={idx} className="px-2 py-1 rounded bg-[#141414] border border-[#2A2A2A] text-[10px] text-[#A1A1AA] font-mono font-medium">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
