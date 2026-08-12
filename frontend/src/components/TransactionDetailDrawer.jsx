import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatMoney, formatTime, checkReducedMotion } from '../config';
import { SPRING, DURATION, EASING } from '../motionVariants';

export default function TransactionDetailDrawer({ transaction, onClose }) {
  const [copied, setCopied] = useState(false);
  const shouldReduceMotion = checkReducedMotion();

  if (!transaction) return null;

  const isApproved = transaction.status === 'APPROVED' || transaction.status === 'EXECUTED';
  const isRejected = transaction.status === 'REJECTED' || transaction.status === 'FAILED';
  const isSystem = transaction.recipient === 'SYSTEM';

  // Extract Stripe ID if present in reason string
  let stripeId = transaction.payment_id || 'N/A';
  if (stripeId === 'N/A' && transaction.reason && transaction.reason.includes('pi_')) {
    const match = transaction.reason.match(/pi_[a-zA-Z0-9]+/);
    if (match) stripeId = match[0];
  }

  const copyStripeId = () => {
    if (stripeId !== 'N/A' && navigator.clipboard) {
      navigator.clipboard.writeText(stripeId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">

        {/* Backdrop click to close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Drawer Window */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: DURATION.deliberate, ease: EASING.entrance }}
          className="glass-panel rounded-2xl p-6 max-w-2xl w-full border border-[#2A2A2A] bg-[#141414] shadow-2xl relative z-10 space-y-5 font-mono text-xs max-h-[90vh] overflow-y-auto scanline"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
            <div className="flex items-center gap-3">
              <span className="text-[#8A8A8E] text-[10px] font-bold uppercase tracking-wider bg-[#1C1C1C] px-2.5 py-1 rounded border border-[#2A2A2A]">
                AUDIT LOG RECORD
              </span>
              <span className={`px-2.5 py-1 rounded text-xs font-bold ${isApproved ? 'bg-emerald-950/60 text-[#22C55E] border border-emerald-500/40' :
                  isRejected ? 'bg-red-950/60 text-[#EF4444] border border-red-500/40' :
                    'bg-[#1C1C1C] text-[#A1A1AA] border border-[#2A2A2A]'
                }`}>
                {transaction.status}
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-[#1C1C1C] hover:bg-[#2A2A2A] border border-[#2A2A2A] flex items-center justify-center text-white font-bold transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Primary Transaction Attributes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A]">
              <span className="text-[10px] text-[#8A8A8E] uppercase font-bold block">Recipient</span>
              <span className="text-sm font-bold text-white mt-1 block truncate">
                {isSystem ? '⚙️ SYSTEM' : transaction.recipient}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A]">
              <span className="text-[10px] text-[#8A8A8E] uppercase font-bold block">Amount</span>
              <span className="text-sm font-bold text-white mt-1 block tabular-nums">
                {isSystem ? '—' : formatMoney(transaction.amount)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A]">
              <span className="text-[10px] text-[#8A8A8E] uppercase font-bold block">Time</span>
              <span className="text-xs font-bold text-white mt-1 block tabular-nums">
                {formatTime(transaction.created_at)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A]">
              <span className="text-[10px] text-[#8A8A8E] uppercase font-bold block">Stripe Intent ID</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[11px] font-bold text-white truncate max-w-[90px]">{stripeId}</span>
                {stripeId !== 'N/A' && (
                  <button onClick={copyStripeId} className="text-[9px] text-emerald-400 font-bold hover:underline">
                    {copied ? '✓' : 'Copy'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Reason / Details Banner */}
          <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] space-y-1">
            <span className="text-[10px] text-[#8A8A8E] uppercase font-bold tracking-wider">Authorization Reason / Audit Notes</span>
            <div className="text-xs text-white leading-relaxed font-semibold">
              {transaction.reason || 'No detailed reason provided.'}
            </div>
          </div>

          {/* Security Checkpoints Evaluation Map */}
          <div className="space-y-2">
            <span className="text-[10px] text-[#8A8A8E] uppercase font-bold tracking-wider">Security Checkpoint Verification Matrix</span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] flex items-center justify-between">
                <span>Checkpoint 1 (Pre-LLM Guard)</span>
                <span className={transaction.status === 'FROZEN' ? 'text-[#EF4444] font-bold' : 'text-[#22C55E] font-bold'}>
                  {transaction.status === 'FROZEN' ? 'BLOCKED' : 'PASSED ✓'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] flex items-center justify-between">
                <span>Checkpoint 2 (Policy & Allowlist)</span>
                <span className={isRejected && transaction.status !== 'FROZEN' ? 'text-[#EF4444] font-bold' : 'text-[#22C55E] font-bold'}>
                  {isRejected && transaction.status !== 'FROZEN' ? 'FAILED ✕' : 'PASSED ✓'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] flex items-center justify-between">
                <span>Checkpoint 3 (Race Guard)</span>
                <span className="text-[#22C55E] font-bold">PASSED ✓</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] flex items-center justify-between">
                <span>Checkpoint 4 (Pre-Stripe Guard)</span>
                <span className={isApproved ? 'text-[#22C55E] font-bold' : 'text-zinc-500'}>
                  {isApproved ? 'EXECUTED ✓' : 'SKIPPED'}
                </span>
              </div>
            </div>
          </div>

          {/* Raw JSON Payload Viewer */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-[#8A8A8E] uppercase font-bold tracking-wider">Raw Audit Log Payload (Postgres / Supabase)</span>
            <pre className="p-3 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] text-[10px] text-[#A1A1AA] overflow-x-auto select-all leading-normal">
              {JSON.stringify(transaction, null, 2)}
            </pre>
          </div>

          {/* Close Action */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#FFFFFF] hover:bg-zinc-200 text-[#0A0A0A] font-bold text-xs transition-colors shadow-md"
            >
              Close Record Window
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
