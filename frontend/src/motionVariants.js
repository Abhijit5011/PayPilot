/**
 * Motion System Specification — "The Kill Switch"
 * Centralized motion tokens, easings, spring physics, and variants.
 * Strict GPU-acceleration (transform / opacity only).
 */

// ── Duration Tokens ──────────────────────────────────────────────────────────
export const DURATION = {
  micro: 0.12,       // 120ms — micro-interactions, button taps
  base: 0.20,        // 200ms — hover effects, tab switches, badge state changes
  deliberate: 0.35,  // 350ms — card reveals, drawer expansions
  hero: 0.60         // 600ms+ — Tier 1 shockwaves, kill switch breaker trip, page entrance
};

// ── Easing Curves ────────────────────────────────────────────────────────────
export const EASING = {
  standard: [0.4, 0, 0.2, 1],    // Standard ease-in-out
  entrance: [0.16, 1, 0.3, 1],   // Premium decelerate (fast start, smooth landing)
  exit: [0.4, 0, 1, 1]           // Accelerate out
};

// ── Spring Physics Presets ───────────────────────────────────────────────────
export const SPRING = {
  // Tier 2: Snappy, UI reveals, cards, chips
  cardSpring: {
    type: 'spring',
    stiffness: 260,
    damping: 20
  },
  // Tier 1: Heavy, mechanical, weighted feel (Circuit breaker, shockwave)
  heavySpring: {
    type: 'spring',
    stiffness: 120,
    damping: 26
  }
};

// ── Stagger Increments ───────────────────────────────────────────────────────
export const STAGGER = {
  sibling: 0.07, // 70ms between siblings
  maxTotal: 0.70 // 700ms total sequence cap
};

// ── Reduced Motion Helper ───────────────────────────────────────────────────
export const isReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// ── Shared Motion Variants (GPU-Accelerated: transform & opacity only) ─────

// Container Entrance Stagger
export const containerStaggerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: STAGGER.sibling,
      delayChildren: 0.05
    }
  }
};

// Standard Item Reveal
export const itemRevealVariants = {
  hidden: (reduced = isReducedMotion()) => (
    reduced ? { opacity: 0 } : { opacity: 0, y: 16 }
  ),
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.deliberate,
      ease: EASING.entrance
    }
  }
};

// Micro Interaction (Button / Chip Hover & Tap)
export const microInteractionVariants = {
  rest: { scale: 1, opacity: 1 },
  hover: (reduced = isReducedMotion()) => (
    reduced ? { opacity: 0.9 } : { scale: 1.02 }
  ),
  tap: (reduced = isReducedMotion()) => (
    reduced ? { opacity: 0.8 } : { scale: 0.97 }
  )
};

// Tier 1 Heavy Spring Transition
export const tier1HeavyVariants = {
  hidden: (reduced = isReducedMotion()) => (
    reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94 }
  ),
  visible: {
    opacity: 1,
    scale: 1,
    transition: SPRING.heavySpring
  }
};
