import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { checkReducedMotion } from '../config';
import { SPRING, DURATION, EASING } from '../motionVariants';

export default function KillSwitchControl({ isFrozen, onOpenModal }) {
  const shouldReduceMotion = checkReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [triggerPulse, setTriggerPulse] = useState(false);

  const handleArmClick = () => {
    if (!isFrozen) {
      setTriggerPulse(true);
      setTimeout(() => setTriggerPulse(false), 700);
      onOpenModal('freeze');
    }
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.deliberate, ease: EASING.entrance, delay: 0.25 }}
      className={`glass-panel rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 relative overflow-hidden ${isFrozen ? 'border-red-500/60 bg-red-950/20 shadow-[0_0_30px_rgba(239,68,68,0.15)]' : ''
        }`}
    >

      <div className="w-full flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xs uppercase tracking-wider text-[#8A8A8E]">Circuit Breaker Control</h2>
        <span className="text-[10px] font-mono text-[#EF4444] font-bold px-2 py-0.5 rounded bg-red-950/60 border border-red-500/40">
          HARDWARE GUARD
        </span>
      </div>

      {/* 3D Physical Housing */}
      <div
        className={`stop-housing mb-5 relative ${isFrozen ? 'is-frozen' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Tier 1 Shockwave Expansion Ring on Breaker Trip */}
        <AnimatePresence>
          {triggerPulse && !shouldReduceMotion && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0.9 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.hero, ease: EASING.entrance }}
              className="absolute inset-0 rounded-full border-2 border-[#EF4444] pointer-events-none z-30"
            />
          )}
        </AnimatePresence>

        <div
          className="stop-cover cursor-pointer"
          onClick={handleArmClick}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">

            {/* Lock Icon with Heavy Spring Tighten & Idle Breathing */}
            <motion.span
              animate={
                shouldReduceMotion ? {} : (
                  isFrozen
                    ? { scale: [1, 1.12, 1], opacity: [1, 0.7, 1] }
                    : isHovered
                      ? { scale: 1.1 }
                      : { scale: [1, 1.04, 1] }
                )
              }
              transition={
                isHovered
                  ? SPRING.heavySpring
                  : { repeat: Infinity, duration: isFrozen ? 1.2 : 3.2, ease: "easeInOut" }
              }
              className={`text-3xl mb-1 drop-shadow-md cover-lock-icon transition-colors duration-200 ${isHovered || isFrozen ? 'text-[#EF4444]' : 'text-[#F5F5F5]'
                }`}
            >
              🔒
            </motion.span>

            <span className="font-mono text-xs uppercase tracking-widest text-[#F5F5F5] font-bold">
              Safety Guard
            </span>

            <motion.span
              animate={shouldReduceMotion ? {} : { opacity: isHovered ? 1 : [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
              className={`text-[10px] font-semibold mt-1 font-mono transition-colors duration-200 ${isHovered || isFrozen ? 'text-[#EF4444]' : 'text-[#8A8A8E]'
                }`}
            >
              {isFrozen ? '● ARMED / FROZEN' : isHovered ? 'Click to Trip Breaker' : 'Hover / Click to Arm'}
            </motion.span>
          </div>
        </div>

        <motion.button
          whileHover={shouldReduceMotion || isFrozen ? {} : { scale: 1.03 }}
          whileTap={shouldReduceMotion || isFrozen ? {} : { scale: 0.97 }}
          transition={SPRING.heavySpring}
          onClick={handleArmClick}
          disabled={isFrozen}
          className="stop-button"
        >
          <span className="font-display font-extrabold text-white text-xl tracking-wider">STOP</span>
          <span className="font-mono text-[9px] text-red-200 uppercase mt-0.5 tracking-tight font-bold">EMERGENCY</span>
        </motion.button>
      </div>

      <p className="text-xs text-[#8A8A8E] font-mono mb-5 leading-relaxed">
        {isFrozen
          ? 'All transactions halted. Mid-flight and future payments rejected at Checkpoints 1–5.'
          : 'Instantly halts all autonomous payment pipelines mid-flight at the contract layer.'
        }
      </p>

      {/* Unfreeze Action Button */}
      <motion.button
        whileHover={shouldReduceMotion || !isFrozen ? {} : { scale: 1.02 }}
        whileTap={shouldReduceMotion || !isFrozen ? {} : { scale: 0.97 }}
        transition={SPRING.cardSpring}
        onClick={() => onOpenModal('unfreeze')}
        disabled={!isFrozen}
        className={`w-full py-3 rounded-xl font-mono text-xs font-bold transition-all border ${isFrozen
            ? 'bg-[#22C55E] hover:bg-emerald-400 text-black border-emerald-400 shadow-lg shadow-emerald-500/30'
            : 'bg-[#1C1C1C] text-[#8A8A8E] border-[#2A2A2A] opacity-50 cursor-not-allowed'
          }`}
      >
        🔓 UNFREEZE SYSTEM PIPELINE
      </motion.button>
    </motion.div>
  );
}
