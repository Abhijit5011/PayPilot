import React from 'react';
import { motion } from 'framer-motion';
import { checkReducedMotion } from '../config';

export default function AllowlistCard({ allowlist }) {
  const shouldReduceMotion = checkReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className="glass-panel rounded-2xl p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-sm uppercase tracking-wide text-[#F5F5F5]">Allowlisted Counterparties</h2>
          <p className="text-xs text-[#8A8A8E]">Only pre-approved addresses can be paid by the agent</p>
        </div>
        <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-[#1C1C1C] border border-[#2A2A2A] text-[#A1A1AA] tabular-nums shadow-sm">
          {allowlist.length} Verified
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {allowlist.map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
            className="px-4 py-2.5 rounded-xl bg-[#141414] border border-[#2A2A2A] flex items-center gap-3 font-mono text-xs hover:border-zinc-700 transition-all shadow-sm cursor-default"
          >
            <div className="w-2 h-2 rounded-full bg-[#22C55E]"></div>
            <div>
              <span className="text-[#F5F5F5] font-bold">{item.name}</span>
              <span className="text-[#8A8A8E] ml-2 text-[11px] font-medium font-mono">• {item.address}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
