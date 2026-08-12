import React from 'react';
import { motion } from 'framer-motion';
import { formatMoney, checkReducedMotion } from '../config';

export default function SpendProgressBar({ spentToday, dailyLimit, budgetPercentage }) {
  const shouldReduceMotion = checkReducedMotion();
  const barColor = budgetPercentage > 90 ? 'bg-[#EF4444]' : 'bg-[#22C55E]';

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 }}
      className="glass-panel rounded-2xl p-5 space-y-2"
    >
      <div className="flex justify-between items-center text-xs font-mono text-[#8A8A8E] font-medium">
        <span>Daily Spending Velocity</span>
        <span className="text-[#F5F5F5] font-bold tabular-nums">{formatMoney(spentToday)} / {formatMoney(dailyLimit)}</span>
      </div>
      <div className="w-full h-3 rounded-full bg-[#1C1C1C] border border-[#2A2A2A] overflow-hidden p-0.5 shadow-inner">
        <motion.div
          initial={shouldReduceMotion ? { width: `${budgetPercentage}%` } : { width: '0%' }}
          animate={{ width: `${budgetPercentage}%` }}
          transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.25 }}
          className={`h-full rounded-full shadow-sm ${barColor}`}
        ></motion.div>
      </div>
    </motion.div>
  );
}
