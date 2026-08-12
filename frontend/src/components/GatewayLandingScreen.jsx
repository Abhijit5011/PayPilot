import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Server, Check, ArrowRight } from 'lucide-react';

export default function GatewayLandingScreen({ onSelectView }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0A0A0A] text-[#F5F5F5] font-sans grid-pattern">
      
      {/* Container with tightened vertical rhythm */}
      <div className="max-w-4xl w-full space-y-8 flex flex-col items-center">
        
        {/* Header Block */}
        <motion.div 
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-center space-y-3 max-w-xl"
        >
          {/* Neutral outline chip badge */}
          <span className="px-3 py-1 rounded-md bg-[#141414] border border-[#2A2A2A] text-[#A1A1AA] font-mono text-[11px] font-bold tracking-wider uppercase inline-block shadow-sm">
            Unified Deployment Gateway
          </span>

          <h1 className="font-sans font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            The Kill Switch Console
          </h1>
          
          <p className="text-xs text-[#8A8A8E] font-sans leading-relaxed">
            Select an application portal to launch either the **Frontend Client** (AI Agent Transaction Playground) or the **Frontend Server** (Vendor Invoice & Security Server Portal).
          </p>
        </motion.div>

        {/* Dual Portal Gateway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          
          {/* Portal 1: Frontend Client */}
          <motion.div
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelectView('client')}
            className="rounded-xl p-6 bg-[#141414] border border-[#2A2A2A] hover:border-zinc-700 shadow-md cursor-pointer flex flex-col justify-between space-y-6 transition-all group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#1C1C1C] border border-[#2A2A2A] text-white flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#1C1C1C] text-[#8A8A8E] border border-[#2A2A2A]">
                  FRONTEND-CLIENT
                </span>
              </div>

              <div>
                <h2 className="font-sans font-bold text-lg text-white group-hover:text-zinc-200 transition-colors">
                  AI Agent Client Portal
                </h2>
                <p className="text-xs text-[#8A8A8E] mt-1 font-sans leading-relaxed">
                  User & agent client playground for natural language payment prompts, n8n execution canvas visualizer, spend caps, and kill switch controls.
                </p>
              </div>

              <ul className="space-y-2 font-mono text-xs text-[#A1A1AA]">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Natural language payment prompt sandbox</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Live n8n workflow execution visualizer</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Emergency kill switch with operator logs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Daily spending cap enforcement & velocity</span>
                </li>
              </ul>
            </div>

            {/* Primary CTA Button: Filled White background, Black text */}
            <button className="w-full py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-sans font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer">
              <span>Launch Client Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

          {/* Portal 2: Frontend Server */}
          <motion.div
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelectView('server')}
            className="rounded-xl p-6 bg-[#141414] border border-[#2A2A2A] hover:border-zinc-700 shadow-md cursor-pointer flex flex-col justify-between space-y-6 transition-all group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#1C1C1C] border border-[#2A2A2A] text-white flex items-center justify-center">
                  <Server className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#1C1C1C] text-[#8A8A8E] border border-[#2A2A2A]">
                  FRONTEND-SERVER
                </span>
              </div>

              <div>
                <h2 className="font-sans font-bold text-lg text-white group-hover:text-zinc-200 transition-colors">
                  Vendor Invoice Server Portal
                </h2>
                <p className="text-xs text-[#8A8A8E] mt-1 font-sans leading-relaxed">
                  Enterprise vendor invoice server portal for processing corporate vendor invoices, PDF generation, and Supabase audit ledger syncing.
                </p>
              </div>

              <ul className="space-y-2 font-mono text-xs text-[#A1A1AA]">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Corporate vendor invoice status processing</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Invoice PDF document generation & download</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Real-time Supabase Postgres server audit log</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Server authorization & counterparty rules</span>
                </li>
              </ul>
            </div>

            {/* Secondary CTA Button: Neutral Surface White-Bordered */}
            <button className="w-full py-2.5 rounded-lg bg-[#1C1C1C] hover:bg-[#2A2A2A] text-white border border-[#2A2A2A] font-sans font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer">
              <span>Access Server Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

        </div>

        {/* Technical Footer */}
        <footer className="text-center text-xs font-mono text-[#8A8A8E] pt-2">
          Stripe Test Mode · Supabase Postgres · n8n Cloud · Single-URL Deployment
        </footer>

      </div>
    </div>
  );
}
