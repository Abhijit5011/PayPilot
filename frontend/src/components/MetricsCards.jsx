import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatMoney, checkReducedMotion } from '../config';
import { SPRING, DURATION, EASING } from '../motionVariants';

// Animated Count Up Number Component
function AnimatedNumber({ value, duration = 600 }) {
  const [current, setCurrent] = useState(0);
  const shouldReduceMotion = checkReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setCurrent(value);
      return;
    }

    let start = 0;
    const end = Number(value || 0);
    const startTime = performance.now();

    const updateNumber = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const val = start + (end - start) * easeProgress;
      setCurrent(val);

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      }
    };

    requestAnimationFrame(updateNumber);
  }, [value, duration, shouldReduceMotion]);

  return <span className="tabular-nums font-mono">{formatMoney(current)}</span>;
}

export default function MetricsCards({ dailyLimit, spentToday, remainingBudget, budgetPercentage }) {
  const shouldReduceMotion = checkReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.07
      }
    }
  };

  const cardVariants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: DURATION.deliberate, ease: EASING.entrance } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 sm:grid-cols-4 gap-4"
    >
      <motion.div variants={cardVariants} whileHover={shouldReduceMotion ? {} : { scale: 1.02 }} transition={SPRING.cardSpring} className="glass-panel glass-panel-interactive rounded-2xl p-4">
        <span className="text-[10px] uppercase font-mono text-[#8A8A8E] font-semibold tracking-wider">Simulated Wallet</span>
        <div className="font-mono text-2xl font-bold text-[#F5F5F5] mt-1">
          <AnimatedNumber value={dailyLimit} />
        </div>
        <div className="text-[11px] text-[#8A8A8E] mt-1 flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-zinc-500"></span> Stripe Test Mode
        </div>
      </motion.div>

      <motion.div variants={cardVariants} whileHover={shouldReduceMotion ? {} : { scale: 1.02 }} transition={SPRING.cardSpring} className="glass-panel glass-panel-interactive rounded-2xl p-4">
        <span className="text-[10px] uppercase font-mono text-[#8A8A8E] font-semibold tracking-wider">Daily Cap</span>
        <div className="font-mono text-2xl font-bold text-[#F5F5F5] mt-1">
          <AnimatedNumber value={dailyLimit} />
        </div>
        <div className="text-[11px] text-[#8A8A8E] mt-1 font-medium">Contract Enforced</div>
      </motion.div>

      <motion.div variants={cardVariants} whileHover={shouldReduceMotion ? {} : { scale: 1.02 }} transition={SPRING.cardSpring} className="glass-panel glass-panel-interactive rounded-2xl p-4">
        <span className="text-[10px] uppercase font-mono text-[#8A8A8E] font-semibold tracking-wider">Spent Today</span>
        <div className={`font-mono text-2xl font-bold mt-1 transition-colors duration-300 ${budgetPercentage > 85 ? 'text-[#EF4444]' : 'text-[#F5F5F5]'}`}>
          <AnimatedNumber value={spentToday} />
        </div>
        <div className="text-[11px] text-[#8A8A8E] mt-1 font-medium tabular-nums">{budgetPercentage}% of limit</div>
      </motion.div>

      <motion.div variants={cardVariants} whileHover={shouldReduceMotion ? {} : { scale: 1.02 }} transition={SPRING.cardSpring} className="glass-panel glass-panel-interactive rounded-2xl p-4">
        <span className="text-[10px] uppercase font-mono text-[#8A8A8E] font-semibold tracking-wider">Remaining</span>
        <div className="font-mono text-2xl font-bold text-[#F5F5F5] mt-1">
          <AnimatedNumber value={remainingBudget} />
        </div>
        <div className="text-[11px] text-[#8A8A8E] mt-1 font-medium">Available to Agent</div>
      </motion.div>
    </motion.div>
  );
}
