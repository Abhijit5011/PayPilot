import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatMoney, formatTime, checkReducedMotion } from '../config';
import { SPRING, DURATION, EASING } from '../motionVariants';
import TransactionDetailDrawer from './TransactionDetailDrawer';

export default function TransactionLedger({ transactions }) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedTxForDrawer, setSelectedTxForDrawer] = useState(null);
  const shouldReduceMotion = checkReducedMotion();
  const knownTxIdsRef = useRef(new Set(transactions.map(t => t.id || t.created_at)));

  useEffect(() => {
    transactions.forEach(t => knownTxIdsRef.current.add(t.id || t.created_at));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch =
        (t.recipient || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
        (t.reason || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
        (t.status || '').toLowerCase().includes(searchFilter.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === 'APPROVED') return t.status === 'APPROVED' || t.status === 'EXECUTED';
      if (activeTab === 'REJECTED') return t.status === 'REJECTED' || t.status === 'FAILED';
      if (activeTab === 'SYSTEM') return t.recipient === 'SYSTEM';
      return true;
    });
  }, [transactions, activeTab, searchFilter]);

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.deliberate, ease: EASING.entrance, delay: 0.28 }}
      className="glass-panel rounded-2xl p-5 scanline overflow-hidden space-y-4 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-sm uppercase tracking-wide text-[#F5F5F5]">Authorization & Transaction Ledger</h2>
          <p className="text-xs text-[#8A8A8E]">Immutable audit trail — click any log row to inspect record window</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-xl border border-[#2A2A2A] text-xs font-mono">
          {['ALL', 'APPROVED', 'REJECTED', 'SYSTEM'].map(tab => (
            <motion.button
              key={tab}
              whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
              transition={SPRING.cardSpring}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeTab === tab
                  ? 'bg-[#FFFFFF] text-[#0A0A0A] shadow-sm'
                  : 'text-[#8A8A8E] hover:text-white hover:bg-[#1C1C1C]'
                }`}
            >
              {tab}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Search Filter */}
      <input
        type="text"
        placeholder="Filter by recipient, reason, or status..."
        value={searchFilter}
        onChange={(e) => setSearchFilter(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-[#2A2A2A] text-xs font-mono text-[#F5F5F5] placeholder-[#8A8A8E] focus:outline-none focus:border-zinc-500 shadow-inner"
      />

      {/* Table Content */}
      <motion.div
        key={activeTab}
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.base, ease: EASING.entrance }}
        className="overflow-x-auto max-h-[380px] overflow-y-auto rounded-xl border border-[#2A2A2A]"
      >
        <table className="w-full text-left text-xs font-mono">
          <thead className="sticky top-0 bg-[#1C1C1C] text-[#8A8A8E] uppercase tracking-wider border-b border-[#2A2A2A] font-bold z-10">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Recipient</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Decision</th>
              <th className="py-3 px-4">Reason / Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2A2A] bg-[#141414]">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-[#8A8A8E]">No ledger records match the selected filter.</td>
              </tr>
            ) : (
              <AnimatePresence initial={false}>
                {filteredTransactions.map((tx, i) => {
                  const isApproved = tx.status === 'APPROVED' || tx.status === 'EXECUTED';
                  const isRejected = tx.status === 'REJECTED' || tx.status === 'FAILED';
                  const isSystem = tx.recipient === 'SYSTEM';
                  const isNew = !knownTxIdsRef.current.has(tx.id || tx.created_at);

                  return (
                    <motion.tr
                      key={tx.id || tx.created_at || i}
                      initial={shouldReduceMotion ? { opacity: 0 } : (isNew ? { opacity: 0, y: -12, backgroundColor: "rgba(34, 197, 94, 0.15)" } : { opacity: 1 })}
                      animate={{ opacity: 1, y: 0, backgroundColor: "rgba(20, 20, 20, 1)" }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: DURATION.deliberate, ease: EASING.entrance }}
                      onClick={() => setSelectedTxForDrawer(tx)}
                      className="hover:bg-[#1C1C1C] transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 text-[#8A8A8E] font-medium tabular-nums">{formatTime(tx.created_at)}</td>
                      <td className="py-3.5 px-4 font-bold text-[#F5F5F5]">
                        {isSystem ? <span className="text-[#A1A1AA] font-bold">⚙️ SYSTEM</span> : tx.recipient}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#F5F5F5] tabular-nums">{isSystem ? '—' : formatMoney(tx.amount)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded text-[11px] font-bold ${isApproved ? 'bg-emerald-950/60 text-[#22C55E] border border-emerald-500/40 shadow-sm' :
                            isRejected ? 'bg-red-950/60 text-[#EF4444] border border-red-500/40 shadow-sm' :
                              'bg-[#1C1C1C] text-[#A1A1AA] border border-[#2A2A2A] shadow-sm'
                          }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#8A8A8E] truncate max-w-xs font-mono tabular-nums">{tx.reason || '—'}</td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Transaction Detail Inspector Drawer Modal */}
      {selectedTxForDrawer && (
        <TransactionDetailDrawer
          transaction={selectedTxForDrawer}
          onClose={() => setSelectedTxForDrawer(null)}
        />
      )}
    </motion.div>
  );
}
