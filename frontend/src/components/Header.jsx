import React from 'react';
import { motion } from 'framer-motion';
import { checkReducedMotion } from '../config';

export default function Header({ isFrozen }) {
  const shouldReduceMotion = checkReducedMotion();

  return (
    <motion.header
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-40 border-b border-[#2A2A2A] bg-[#0A0A0A]/90 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">

        <div className="flex items-center gap-3">
          <motion.div
            whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
            className="w-10 h-10 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A] flex items-center justify-center font-mono font-bold text-base text-white shadow-inner cursor-pointer"
          >
            KS
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-xl tracking-tight text-[#F5F5F5]">The Kill Switch</h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#141414] border border-[#2A2A2A] text-[#8A8A8E]">Vite + React</span>
            </div>
            <p className="text-xs font-mono text-[#8A8A8E] mt-0.5">Independent AI Wallet Authorization Middleware</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-full text-xs font-mono font-semibold flex items-center gap-2.5 transition-all duration-300 ${isFrozen
            ? 'bg-red-950/60 border border-red-500/40 text-red-400 shadow-sm'
            : 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 shadow-sm'
            }`}>
            <motion.span
              animate={shouldReduceMotion ? { opacity: [1, 0.6, 1] } : (isFrozen ? { scale: [1, 1.15, 1], opacity: [1, 0.4, 1] } : { scale: [1, 1.25, 1], opacity: [1, 0.4, 1] })}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className={`w-2.5 h-2.5 rounded-full ${isFrozen ? 'bg-[#EF4444]' : 'bg-[#22C55E]'}`}
            ></motion.span>
            <span>{isFrozen ? 'WALLET FROZEN' : 'PIPELINE ACTIVE'}</span>
          </div>
        </div>

      </div>
    </motion.header>
  );
}
