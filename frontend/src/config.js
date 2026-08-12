export const CONFIG = {
  KILL_SWITCH_WEBHOOK_URL: "https://abhijitdeshmukh.app.n8n.cloud/webhook/kill-switch",
  AI_AGENT_WEBHOOK_URL: "https://abhijitdeshmukh.app.n8n.cloud/webhook/ai-agent",
  SUPABASE_URL: "https://xfdgbcfjclhfucmbqdye.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZGdiY2ZqY2xoZnVjbWJxZHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1OTc2OTYsImV4cCI6MjEwMTE3MzY5Nn0.-7XOu9CG4LTui-Pse3vFx9DZOCrwS3sCzmtJkMQx0cg"
};

export const formatMoney = (val) => '$' + Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatTime = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch { return iso || '—'; }
};

export const checkReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
