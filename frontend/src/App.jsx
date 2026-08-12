import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import EmergencyBanner from './components/EmergencyBanner';
import MetricsCards from './components/MetricsCards';
import SpendProgressBar from './components/SpendProgressBar';
import N8nPipelineVisualizer from './components/N8nPipelineVisualizer';
import AllowlistCard from './components/AllowlistCard';
import TransactionLedger from './components/TransactionLedger';
import KillSwitchControl from './components/KillSwitchControl';
import SystemArchitectureCard from './components/SystemArchitectureCard';
import OperatorModal from './components/OperatorModal';
import GatewayLandingScreen from './components/GatewayLandingScreen';
import VendorInvoicePortal from './VendorInvoicePortal';
import { CONFIG } from './config';

export default function App() {
  // Portal View State ('gateway' | 'client' | 'server')
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('unified_active_view') || 'gateway';
  });

  const handleSelectView = (view) => {
    setCurrentView(view);
    localStorage.setItem('unified_active_view', view);
  };

  // System State
  const [state, setState] = useState({
    is_frozen: false,
    daily_limit: 1000,
    spent_today: 150,
    allowlist: [
      { id: '1', name: 'Acme Corp', address: 'acme@example.com' },
      { id: '2', name: 'Globex Inc', address: 'globex@example.com' }
    ],
    transactions: [
      { id: 'tx-1', created_at: new Date().toISOString(), recipient: 'Acme Corp', amount: 150, status: 'APPROVED', reason: 'Payment Intent pi_3P_test_123' }
    ]
  });

  // UI States
  const [isSending, setIsSending] = useState(false);
  const [agentResponse, setAgentResponse] = useState(null);
  const [actorModal, setActorModal] = useState({ open: false, action: 'freeze', actorName: '' });
  const [notification, setNotification] = useState(null);

  const showToast = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Supabase Data Fetching
  const fetchSupabaseData = async () => {
    if (!CONFIG.SUPABASE_URL || CONFIG.SUPABASE_URL.includes('REPLACE')) return;
    try {
      const headers = {
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
      };
      const [policyRes, allowRes, txRes] = await Promise.all([
        fetch(`${CONFIG.SUPABASE_URL}/rest/v1/policies?select=*&limit=1`, { headers }),
        fetch(`${CONFIG.SUPABASE_URL}/rest/v1/allowlist?select=*`, { headers }),
        fetch(`${CONFIG.SUPABASE_URL}/rest/v1/transaction_logs?select=*&order=created_at.desc&limit=30`, { headers })
      ]);

      if (policyRes.ok && allowRes.ok && txRes.ok) {
        const policyData = await policyRes.json();
        const allowData = await allowRes.json();
        const txData = await txRes.json();

        if (policyData && policyData.length > 0) {
          const pol = policyData[0];
          setState(prev => ({
            ...prev,
            is_frozen: pol.is_frozen,
            daily_limit: Number(pol.daily_limit || 1000),
            spent_today: Number(pol.spent_today || 0),
            allowlist: allowData || prev.allowlist,
            transactions: txData || prev.transactions
          }));
        }
      }
    } catch (e) {
      console.warn('Supabase auto-sync offline/unreachable:', e);
    }
  };

  useEffect(() => {
    fetchSupabaseData();
    const interval = setInterval(fetchSupabaseData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Execute Kill Switch
  const handleKillSwitchSubmit = async () => {
    if (!actorModal.actorName.trim()) {
      showToast('Please enter an operator name for the audit log', 'error');
      return;
    }

    const action = actorModal.action;
    const actor = actorModal.actorName.trim();
    setActorModal({ open: false, action: 'freeze', actorName: '' });

    const newFrozen = action === 'freeze';
    const timestamp = new Date().toISOString();

    setState(prev => ({
      ...prev,
      is_frozen: newFrozen,
      transactions: [
        {
          id: 'sys-' + Date.now(),
          created_at: timestamp,
          recipient: 'SYSTEM',
          amount: 0,
          status: newFrozen ? 'FROZEN' : 'UNFROZEN',
          reason: `actor: ${actor} — ${newFrozen ? 'Manual emergency stop activated' : 'Manual system unfreeze'}`
        },
        ...prev.transactions
      ]
    }));

    showToast(
      newFrozen ? `🚨 Emergency Stop Activated by ${actor}` : `🔓 System Unfrozen by ${actor}`,
      newFrozen ? 'error' : 'success'
    );

    if (!CONFIG.KILL_SWITCH_WEBHOOK_URL || CONFIG.KILL_SWITCH_WEBHOOK_URL.includes('REPLACE_ME')) return;

    try {
      await fetch(CONFIG.KILL_SWITCH_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          actor,
          reason: newFrozen ? 'Manual emergency stop from React dashboard' : 'Manual restore from React dashboard'
        })
      });
      fetchSupabaseData();
    } catch (err) {
      console.error('Kill switch webhook error:', err);
    }
  };

  // Send Prompt to AI Agent Workflow
  const handleSendAgentRequest = async (promptText) => {
    if (!promptText || !promptText.trim()) return;

    setIsSending(true);
    setAgentResponse(null);

    if (state.is_frozen) {
      setTimeout(() => {
        setIsSending(false);
        setAgentResponse({
          decision: 'REJECTED',
          reason: 'Wallet is frozen. The AI agent will not even attempt to interpret payment requests while the Emergency Kill Switch is active.'
        });
      }, 500);
      return;
    }

    if (!CONFIG.AI_AGENT_WEBHOOK_URL || CONFIG.AI_AGENT_WEBHOOK_URL.includes('REPLACE_ME')) {
      setTimeout(() => {
        setIsSending(false);
        setAgentResponse({
          decision: 'DEMO MODE',
          reason: 'Please configure CONFIG.AI_AGENT_WEBHOOK_URL to link to n8n Workflow B.'
        });
      }, 800);
      return;
    }

    try {
      const res = await fetch(CONFIG.AI_AGENT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText })
      });
      const data = await res.json();
      setAgentResponse(data);
      fetchSupabaseData();
    } catch (err) {
      setAgentResponse({
        decision: 'FAILED',
        reason: 'Webhook execution failed. Please verify n8n Workflow B activation.'
      });
    } finally {
      setIsSending(false);
    }
  };

  const remainingBudget = Math.max(0, state.daily_limit - state.spent_today);
  const budgetPercentage = Math.min(100, Math.round((state.spent_today / state.daily_limit) * 100));

  // Initial Gateway Choice Screen
  if (currentView === 'gateway') {
    return <GatewayLandingScreen onSelectView={handleSelectView} />;
  }

  // Render Server View (Vendor Invoice Portal)
  if (currentView === 'server') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-900 text-white font-sans">
        {/* Minimal Top Bar: Gateway Home Only */}
        <div className="bg-[#0A0A0A] text-white border-b border-[#2A2A2A] px-4 sm:px-6 py-2 flex items-center justify-between text-xs font-mono">
          <button 
            onClick={() => handleSelectView('gateway')}
            className="text-[#A1A1AA] hover:text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>⬅ Gateway Home</span>
          </button>
        </div>

        {/* Vendor Invoice Portal View */}
        <VendorInvoicePortal />
      </div>
    );
  }

  // Render Client View (AI Agent Client Portal)
  return (
    <div className="min-h-screen flex flex-col grid-pattern bg-[#0A0A0A] text-[#F5F5F5]">
      {/* Minimal Top Bar: Gateway Home Only */}
      <div className="bg-[#0A0A0A] text-white border-b border-[#2A2A2A] px-4 sm:px-6 py-2 flex items-center justify-between text-xs font-mono z-50">
        <button 
          onClick={() => handleSelectView('gateway')}
          className="text-[#A1A1AA] hover:text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>⬅ Gateway Home</span>
        </button>
      </div>

      <Header isFrozen={state.is_frozen} />

      {state.is_frozen && <EmergencyBanner />}

      {notification && (
        <div className="fixed top-24 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-xl border text-sm font-mono shadow-2xl flex items-center gap-3 ${
            notification.type === 'error' ? 'bg-red-950/90 border-red-500 text-red-100' : 'bg-emerald-950/90 border-emerald-500 text-emerald-100'
          }`}>
            <span>{notification.type === 'error' ? '⚠️' : '✅'}</span>
            <span>{notification.msg}</span>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 flex-1 w-full">
        
        {/* Top Hero Row: Metrics & Velocity Bar */}
        <div className="space-y-6">
          <MetricsCards 
            dailyLimit={state.daily_limit} 
            spentToday={state.spent_today} 
            remainingBudget={remainingBudget} 
            budgetPercentage={budgetPercentage} 
          />

          <SpendProgressBar 
            spentToday={state.spent_today} 
            dailyLimit={state.daily_limit} 
            budgetPercentage={budgetPercentage} 
          />
        </div>

        {/* Main Dashboard Section (8 : 4 Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (8 cols): Transaction Ledger -> n8n Workflow Execution Visualizer BELOW */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Transaction Ledger */}
            <TransactionLedger transactions={state.transactions} />

            {/* 2. n8n Workflow Execution Visualizer POSITIONED BELOW TRANSACTIONS LOG */}
            <N8nPipelineVisualizer 
              isSending={isSending} 
              isFrozen={state.is_frozen} 
              lastDecision={agentResponse} 
              onTriggerRequest={handleSendAgentRequest}
              onTriggerKillSwitch={(action) => setActorModal({ open: true, action, actorName: '' })}
            />
          </div>

          {/* Right Column (4 cols): Circuit Breaker Control, Allowlist & Compliance */}
          <div className="lg:col-span-4 space-y-6">
            <KillSwitchControl 
              isFrozen={state.is_frozen} 
              onOpenModal={(action) => setActorModal({ open: true, action, actorName: '' })} 
            />

            <AllowlistCard allowlist={state.allowlist} />

            <SystemArchitectureCard />
          </div>

        </div>

      </main>

      <footer className="border-t border-[#2A2A2A] py-4 text-center text-xs font-mono text-[#8A8A8E] bg-[#0A0A0A]">
        Single-URL Deployment Portal · Stripe Test Mode · Supabase Postgres · n8n Cloud
      </footer>

      <OperatorModal 
        actorModal={actorModal} 
        setActorModal={setActorModal} 
        onSubmit={handleKillSwitchSubmit} 
      />
    </div>
  );
}
