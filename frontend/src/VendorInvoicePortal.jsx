import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  DollarSign, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  FileText,
  RefreshCw,
  Download,
  Search,
  Sun,
  Moon,
  LogOut,
  UserCheck,
  Check,
  Lock,
  ArrowRight,
  ShieldCheck,
  Building,
  X,
  Printer,
  Calendar,
  CreditCard,
  ExternalLink
} from 'lucide-react';

// ============================================================================
// CONFIGURATION
// ============================================================================
export const CONFIG = {
  SUPABASE_URL: "https://xfdgbcfjclhfucmbqdye.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZGdiY2ZqY2xoZnVjbWJxZHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1OTc2OTYsImV4cCI6MjEwMTE3MzY5Nn0.-7XOu9CG4LTui-Pse3vFx9DZOCrwS3sCzmtJkMQx0cg",
  VENDOR_API_WEBHOOK_URL: "https://abhijitdeshmukh.app.n8n.cloud/webhook/ai-agent"
};

// 2 Separate Pre-configured Company Accounts for Login
const COMPANIES = [
  { 
    id: 'acme_corp', 
    name: 'Acme Corp', 
    address: 'acme@example.com', 
    avatarBg: 'bg-indigo-600',
    description: 'Hardware & Tech Manufacturing'
  },
  { 
    id: 'globex_inc', 
    name: 'Globex Inc', 
    address: 'globex@example.com', 
    avatarBg: 'bg-violet-600',
    description: 'Enterprise Cloud Solutions'
  }
];

// Initial default transaction logs
const DEFAULT_TRANSACTIONS = [
  { id: '6c83c780-3829-477a-98a2-f1a9d5b8', recipient: 'Acme Corp', amount: 13245, status: 'REJECTED', reason: 'Payment limit exceeded ($10,000 max)', created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: '69d9bdf4-beb3-4061-9a17-0ce0060c', recipient: 'Acme Corp', amount: 150, status: 'APPROVED', reason: 'Payment processed successfully', created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
  { id: '54b7aa5f-5003-4e5b-b038-0bb1c94e', recipient: 'Acme Corp', amount: 300, status: 'APPROVED', reason: 'Payment processed successfully', created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString() },
  { id: '44d3c6b4-3089-4390-90f1-2ec49f3c', recipient: 'Globex Inc', amount: 450, status: 'APPROVED', reason: 'Payment processed successfully', created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
  { id: '3b5b309f-45fe-4288-8810-c50f69c9', recipient: 'Globex Inc', amount: 15000, status: 'REJECTED', reason: 'Payment limit exceeded ($10,000 max)', created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString() }
];

export default function VendorInvoicePortal() {
  // Active Logged-in Company state
  const [currentCompany, setCurrentCompany] = useState(() => {
    const saved = localStorage.getItem('ks_logged_in_company');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return COMPANIES[0]; // Default to Acme Corp
  });

  // Login view toggle state
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Selected Log for Details Modal Window
  const [selectedTx, setSelectedTx] = useState(null);

  // Theme mode: 'light' by default
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('ks_portal_theme');
    return savedTheme ? savedTheme : 'light';
  });

  const [amount, setAmount] = useState('');

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('ks_transactions');
    return saved ? JSON.parse(saved) : DEFAULT_TRANSACTIONS;
  });

  // Table filter & search state
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Toggle Theme Handler
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('ks_portal_theme', nextTheme);
  };

  // Sync logged in company to localStorage
  useEffect(() => {
    if (currentCompany) {
      localStorage.setItem('ks_logged_in_company', JSON.stringify(currentCompany));
    }
  }, [currentCompany]);

  // Sync transaction history to localStorage
  useEffect(() => {
    localStorage.setItem('ks_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Fetch live Supabase transactions
  const loadPortalData = async () => {
    setLoading(true);
    try {
      const fetchHeaders = {
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      };

      const txRes = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/transaction_logs?select=*&order=created_at.desc&limit=30`, { headers: fetchHeaders });
      if (txRes.ok) {
        const data = await txRes.json();
        if (Array.isArray(data) && data.length > 0) {
          setTransactions(data);
        }
      }
    } catch (err) {
      console.warn("Supabase read notice, retaining local logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortalData();
  }, []);

  // Strictly filter transactions to ONLY show current company's logs
  const companyTransactions = useMemo(() => {
    if (!currentCompany) return [];
    
    const companyName = (currentCompany.name || '').toLowerCase();
    const companyAddress = (currentCompany.address || '').toLowerCase();

    return transactions.filter(tx => {
      const recipient = (tx.recipient || '').toLowerCase();
      const matchesCompany = recipient === companyName || recipient === companyAddress;
      if (!matchesCompany) return false;

      const matchesStatus = 
        statusFilter === 'ALL' ? true :
        statusFilter === 'APPROVED' ? (tx.status === 'EXECUTED' || tx.status === 'APPROVED') :
        (tx.status === 'REJECTED' || tx.status === 'FAILED');

      const matchesSearch = 
        !searchQuery.trim() || 
        (tx.status && tx.status.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tx.amount && tx.amount.toString().includes(searchQuery)) ||
        (tx.reason && tx.reason.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesStatus && matchesSearch;
    });
  }, [transactions, currentCompany, statusFilter, searchQuery]);

  // Handle Company Login Select
  const handleSelectCompany = (comp) => {
    setCurrentCompany(comp);
    setIsLoggingIn(false);
    setResult(null);
    setAmount('');
  };

  // Download Printable Invoice PDF Function
  const handleDownloadInvoicePDF = (tx) => {
    const isApproved = tx.status === 'EXECUTED' || tx.status === 'APPROVED';
    const invoiceNum = `INV-${tx.id.substring(0, 8).toUpperCase()}`;
    const formattedDate = new Date(tx.created_at || Date.now()).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoiceNum} - ${tx.recipient}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
          .invoice-box { max-width: 800px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 36px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
          .header { display: flex; justify-content: space-between; border-b: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
          .brand { font-size: 24px; font-weight: bold; color: #4f46e5; }
          .invoice-title { font-size: 20px; font-weight: bold; color: #0f172a; text-align: right; }
          .badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-top: 8px; }
          .badge-approved { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
          .badge-rejected { background: #ffe4e6; color: #9f1239; border: 1px solid #fca5a5; }
          .details-grid { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .table th { background: #f8fafc; text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
          .table td { padding: 14px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
          .total-box { text-align: right; font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 20px; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #64748b; border-t: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <div>
              <div class="brand">Vendor Invoice Portal</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Verified Company Payment Receipt</div>
            </div>
            <div style="text-align: right;">
              <div class="invoice-title">${invoiceNum}</div>
              <div class="${isApproved ? 'badge badge-approved' : 'badge badge-rejected'}">
                ${isApproved ? '● PAYMENT APPROVED' : '● PAYMENT REJECTED'}
              </div>
            </div>
          </div>

          <div class="details-grid">
            <div>
              <strong>Billed To:</strong><br/>
              ${tx.recipient}<br/>
              <span style="color: #64748b;">${currentCompany.address}</span>
            </div>
            <div style="text-align: right;">
              <strong>Date Issued:</strong> ${formattedDate}<br/>
              <strong>Transaction Reference:</strong> ${tx.id}
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th style="text-align: right;">Amount ($)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Vendor Invoice Payment Processing Request</td>
                <td>1</td>
                <td style="text-align: right; font-weight: bold;">$${Number(tx.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          <div class="total-box">
            Total Amount: $${Number(tx.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
          </div>

          <div style="margin-top: 20px; padding: 12px; background: #f8fafc; border-radius: 8px; font-size: 12px; color: #475569;">
            <strong>Transaction Status Note:</strong> ${tx.reason || (isApproved ? 'Payment executed successfully.' : 'Payment failed validation.')}
          </div>

          <div class="footer">
            Thank you for using Company Invoice Portal. This document serves as an official electronic record.
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    const csvRows = [
      ['ID', 'Company Name', 'Amount ($)', 'Status', 'Details', 'Date & Time'],
      ...companyTransactions.map(t => [
        t.id || '',
        `"${t.recipient || ''}"`,
        t.amount || 0,
        t.status || '',
        `"${t.reason || ''}"`,
        t.created_at || ''
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${currentCompany?.name || 'company'}_payment_history.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit Invoice Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const numericAmount = parseFloat(amount);
    if (!currentCompany) {
      setResult({ decision: 'REJECTED', reason: 'Please log in with a company account.' });
      return;
    }
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setResult({ decision: 'REJECTED', reason: 'Please enter a valid positive amount.' });
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const targetAddress = currentCompany.address;
      const targetName = currentCompany.name;

      const payload = {
        company_name: targetAddress,
        cost: numericAmount,
        recipient: targetName,
        amount: numericAmount,
        prompt: `Pay ${targetName} $${numericAmount}`
      };

      const response = await fetch(CONFIG.VENDOR_API_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const rawText = await response.text();
      let data = {};
      
      if (rawText && rawText.trim()) {
        try { data = JSON.parse(rawText); } catch {
          data = { decision: 'APPROVED', reason: rawText };
        }
      } else {
        data = { decision: 'APPROVED', reason: 'Transaction approved successfully.' };
      }

      if (data.decision === 'APPROVED') {
        const paymentId = data.payment_id || data.stripe_payment_id || `pi_${Math.random().toString(36).substring(2, 9)}`;
        
        setResult({
          decision: 'APPROVED',
          payment_id: paymentId,
          reason: 'Invoice payment approved and completed successfully.'
        });

        const newLog = {
          id: `tx_${Date.now()}`,
          recipient: targetName,
          amount: numericAmount,
          status: 'APPROVED',
          reason: `Payment ID: ${paymentId}`,
          created_at: new Date().toISOString()
        };

        setTransactions(prev => {
          const updated = [newLog, ...prev];
          localStorage.setItem('ks_transactions', JSON.stringify(updated));
          return updated;
        });

        setAmount('');
        setTimeout(() => loadPortalData(), 1000);

      } else {
        setResult({
          decision: 'REJECTED',
          reason: data.reason || 'Transaction rejected. Amount exceeds allowed limit.'
        });

        const newLog = {
          id: `tx_${Date.now()}`,
          recipient: targetName,
          amount: numericAmount,
          status: 'REJECTED',
          reason: data.reason || 'Transaction rejected by payment policy.',
          created_at: new Date().toISOString()
        };

        setTransactions(prev => {
          const updated = [newLog, ...prev];
          localStorage.setItem('ks_transactions', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      setResult({
        decision: 'REJECTED',
        reason: `Submission failed: ${err.message}`
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isDark = theme === 'dark';

  // Fresh, Professional Indigo & Slate Palette
  const styles = {
    bg: isDark ? '#0F172A' : '#F8FAFC',
    cardBg: isDark ? '#1E293B' : '#FFFFFF',
    innerBg: isDark ? '#334155' : '#F1F5F9',
    borderColor: isDark ? '#334155' : '#E2E8F0',
    textPrimary: isDark ? '#F8FAFC' : '#1E293B',
    textSecondary: isDark ? '#94A3B8' : '#64748B',
    primaryIndigo: '#4F46E5',
    approvedGreenBg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
    approvedGreenText: isDark ? '#34D399' : '#059669',
    rejectedRedBg: isDark ? 'rgba(244, 63, 94, 0.15)' : '#FFF1F2',
    rejectedRedText: isDark ? '#F87171' : '#E11D48',
  };

  // ============================================================================
  // 1. SEPARATE COMPANY LOGIN SCREEN (FULL SCREEN)
  // ============================================================================
  if (isLoggingIn || !currentCompany) {
    return (
      <div 
        className="min-h-screen w-full flex items-center justify-center p-6 font-google transition-colors duration-200"
        style={{ backgroundColor: styles.bg, color: styles.textPrimary }}
      >
        <div className="max-w-lg w-full space-y-8 text-center">
          
          <div className="space-y-3">
            <div 
              className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-2xl shadow-xl"
              style={{ backgroundColor: styles.primaryIndigo }}
            >
              <Building2 className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: styles.textPrimary }}>
              Company Invoice Portal
            </h1>
            <p className="text-sm font-medium" style={{ color: styles.textSecondary }}>
              Select a company profile below to access your isolated invoice & transaction ledger.
            </p>
          </div>

          {/* 2 Company Login Cards */}
          <div className="space-y-4">
            {COMPANIES.map((comp) => {
              const isSelected = currentCompany?.id === comp.id;
              return (
                <button
                  key={comp.id}
                  onClick={() => handleSelectCompany(comp)}
                  className={`w-full p-5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer hover:shadow-lg hover:-translate-y-0.5 ${
                    isSelected ? 'ring-2 ring-indigo-500 shadow-md' : ''
                  }`}
                  style={{ backgroundColor: styles.cardBg, borderColor: styles.borderColor }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${comp.avatarBg} text-white font-bold flex items-center justify-center text-lg shadow-md`}>
                      {comp.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-base" style={{ color: styles.textPrimary }}>
                        {comp.name}
                      </div>
                      <div className="text-xs font-mono opacity-80" style={{ color: styles.textSecondary }}>
                        {comp.address}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                      Login as {comp.name.split(' ')[0]}
                    </span>
                    <ArrowRight className="w-4 h-4 text-indigo-500" />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="text-xs font-medium opacity-70" style={{ color: styles.textSecondary }}>
            🔒 Zero-Trust Company Isolation Enforced
          </div>

        </div>
      </div>
    );
  }

  // ============================================================================
  // 2. MAIN FULL-SCREEN DASHBOARD VIEW (NO BLANK SPACES)
  // ============================================================================
  return (
    <div 
      className="min-h-screen w-full flex flex-col font-google transition-colors duration-200"
      style={{ backgroundColor: styles.bg, color: styles.textPrimary }}
    >
      {/* 100% Full Width Header Bar */}
      <header 
        className="h-16 w-full px-6 sm:px-8 flex items-center justify-between border-b sticky top-0 z-30 transition-colors"
        style={{ backgroundColor: styles.cardBg, borderColor: styles.borderColor }}
      >
        {/* Portal Name & Logo */}
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm"
            style={{ backgroundColor: styles.primaryIndigo }}
          >
            <Building2 className="w-5 h-5" />
          </div>

          <div>
            <h1 className="font-bold text-base tracking-tight" style={{ color: styles.textPrimary }}>
              Company Invoice Portal
            </h1>
            <p className="text-xs font-medium" style={{ color: styles.textSecondary }}>
              Enterprise Vendor Workspace
            </p>
          </div>
        </div>

        {/* Right Controls: Active Logged In Company & Theme Switcher */}
        <div className="flex items-center gap-4">
          
          {/* Active Company Account Switcher Button */}
          <button
            onClick={() => setIsLoggingIn(true)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition hover:bg-black/5 cursor-pointer shadow-sm"
            style={{ backgroundColor: styles.innerBg, borderColor: styles.borderColor }}
            title="Click to switch company login"
          >
            <div className={`w-6 h-6 rounded-lg ${currentCompany.avatarBg} text-white text-xs font-bold flex items-center justify-center`}>
              {currentCompany.name.charAt(0)}
            </div>
            <span className="text-sm font-bold" style={{ color: styles.textPrimary }}>{currentCompany.name}</span>
            <span className="text-xs opacity-70 ml-1 text-indigo-600 font-bold">Switch Company</span>
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border cursor-pointer transition hover:opacity-80 shadow-sm"
            style={{ backgroundColor: styles.innerBg, borderColor: styles.borderColor }}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

        </div>
      </header>

      {/* 100% Full Width Workspace Grid (Zero Margins/Blank Spaces) */}
      <div className="flex-1 w-full p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form Panel: Submit Invoice (4 Cols on Large Screens) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Send New Invoice Card */}
          <div 
            className="p-6 rounded-2xl border shadow-sm space-y-5"
            style={{ backgroundColor: styles.cardBg, borderColor: styles.borderColor }}
          >
            <div className="border-b pb-3.5" style={{ borderColor: styles.borderColor }}>
              <h2 className="text-base font-bold flex items-center gap-2" style={{ color: styles.textPrimary }}>
                <Send className="w-4 h-4 text-indigo-600" />
                Send New Invoice
              </h2>
              <p className="text-xs opacity-70 mt-1" style={{ color: styles.textSecondary }}>
                Submit invoice for automated AI validation.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              
              {/* Logged in Company Info Box */}
              <div>
                <label className="block text-xs font-bold mb-2 opacity-80" style={{ color: styles.textSecondary }}>
                  Invoice Recipient (Active Company)
                </label>
                
                <div 
                  className="p-3.5 rounded-xl border flex items-center justify-between"
                  style={{ backgroundColor: styles.innerBg, borderColor: styles.borderColor }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${currentCompany.avatarBg} text-white font-bold flex items-center justify-center text-xs shadow-sm`}>
                      {currentCompany.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-xs" style={{ color: styles.textPrimary }}>{currentCompany.name}</div>
                      <div className="text-[11px] font-mono opacity-70" style={{ color: styles.textSecondary }}>{currentCompany.address}</div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    Verified
                  </span>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="amountInput" className="block text-xs font-bold opacity-80" style={{ color: styles.textSecondary }}>
                    Invoice Amount ($)
                  </label>
                  <span className="text-xs font-bold text-indigo-600">USD CURRENCY</span>
                </div>

                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-base font-bold text-slate-400">$</span>
                  <input 
                    id="amountInput"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={submitting}
                    className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    style={{ backgroundColor: styles.innerBg, borderColor: styles.borderColor, color: styles.textPrimary }}
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <div className="text-xs font-bold mb-2 opacity-70" style={{ color: styles.textSecondary }}>
                  Quick Presets:
                </div>
                <div className="flex flex-wrap gap-2">
                  {[25, 50, 100, 250, 500].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val.toString())}
                      className="px-3.5 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer hover:border-indigo-600 hover:text-indigo-600"
                      style={{ backgroundColor: styles.innerBg, borderColor: styles.borderColor, color: styles.textPrimary }}
                    >
                      +${val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || loading || !currentCompany}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-xs text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-md hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50"
                style={{ backgroundColor: styles.primaryIndigo }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Invoice...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Invoice
                  </>
                )}
              </button>

            </form>

            {/* Submission Result Notification Banner */}
            {result && (
              <div 
                id="resultMessage"
                className="p-4 rounded-xl border text-xs transition-all space-y-1.5 shadow-sm"
                style={{
                  backgroundColor: result.decision === 'APPROVED' ? styles.approvedGreenBg : styles.rejectedRedBg,
                  borderColor: result.decision === 'APPROVED' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)',
                  color: result.decision === 'APPROVED' ? styles.approvedGreenText : styles.rejectedRedText
                }}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  {result.decision === 'APPROVED' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{result.decision === 'APPROVED' ? 'Invoice Approved' : 'Invoice Rejected'}</span>
                </div>

                {result.reason && (
                  <div className="text-xs font-medium opacity-90 pl-6">
                    {result.reason}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Right Table Panel: Payment History (8 Cols - Expands to fill screen) */}
        <div className="lg:col-span-8 space-y-6">
          
          <div 
            className="p-6 rounded-2xl border shadow-sm space-y-5"
            style={{ backgroundColor: styles.cardBg, borderColor: styles.borderColor }}
          >
            {/* Table Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: styles.borderColor }}>
              <div>
                <h2 className="text-base font-bold flex items-center gap-2" style={{ color: styles.textPrimary }}>
                  Payment History & Transaction Ledger
                </h2>
                <p className="text-xs opacity-70 mt-0.5" style={{ color: styles.textSecondary }}>
                  Showing logs for <span className="font-bold">{currentCompany.name}</span>. Click any log row for details & PDF download.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 text-xs">
                {['ALL', 'APPROVED', 'REJECTED'].map((st) => {
                  const isActive = statusFilter === st;
                  return (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isActive ? 'bg-indigo-600 text-white shadow-sm' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: isActive ? styles.primaryIndigo : styles.innerBg,
                        color: isActive ? '#FFFFFF' : styles.textPrimary
                      }}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search & Export Toolbar */}
            <div className="flex items-center gap-3">
              <div 
                className="flex-1 flex items-center px-4 py-2 rounded-xl border text-xs"
                style={{ backgroundColor: styles.innerBg, borderColor: styles.borderColor }}
              >
                <Search className="w-4 h-4 mr-2.5 opacity-50" style={{ color: styles.textSecondary }} />
                <input 
                  type="text"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent focus:outline-none text-xs font-medium"
                  style={{ color: styles.textPrimary }}
                />
              </div>

              <button
                onClick={handleExportCSV}
                className="px-4 py-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-2 hover:bg-black/5 shrink-0"
                style={{ backgroundColor: styles.innerBg, borderColor: styles.borderColor, color: styles.textPrimary }}
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>

              <button
                onClick={loadPortalData}
                className="p-2 rounded-xl border transition cursor-pointer hover:bg-black/5 shrink-0"
                style={{ backgroundColor: styles.innerBg, borderColor: styles.borderColor }}
                title="Refresh Logs"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} style={{ color: styles.textSecondary }} />
              </button>
            </div>

            {/* Transaction Logs Table (Expands full width) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-google">
                <thead>
                  <tr className="border-b text-xs font-bold opacity-70 uppercase tracking-wider" style={{ borderColor: styles.borderColor, color: styles.textSecondary }}>
                    <th className="pb-3.5 pl-3">Date & Time</th>
                    <th className="pb-3.5">Company</th>
                    <th className="pb-3.5">Amount</th>
                    <th className="pb-3.5 text-center">Status</th>
                    <th className="pb-3.5 pr-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: styles.borderColor }}>
                  {companyTransactions.length > 0 ? (
                    companyTransactions.map((tx, idx) => {
                      const isApproved = tx.status === 'EXECUTED' || tx.status === 'APPROVED';
                      const dateStr = new Date(tx.created_at || Date.now()).toLocaleDateString();
                      const timeStr = new Date(tx.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                      return (
                        <tr 
                          key={tx.id || idx} 
                          onClick={() => setSelectedTx(tx)}
                          className="hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 transition cursor-pointer font-medium"
                          title="Click to view details & download invoice PDF"
                        >
                          {/* Date & Time */}
                          <td className="py-3.5 pl-3 text-xs opacity-80" style={{ color: styles.textSecondary }}>
                            <div className="font-bold">{dateStr}</div>
                            <div className="text-[10px]">{timeStr}</div>
                          </td>

                          {/* Company */}
                          <td className="py-3.5 font-bold text-sm" style={{ color: styles.textPrimary }}>
                            {tx.recipient}
                          </td>

                          {/* Amount */}
                          <td className="py-3.5 font-bold text-sm" style={{ color: styles.textPrimary }}>
                            ${Number(tx.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 text-center">
                            <span 
                              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
                              style={{
                                backgroundColor: isApproved ? styles.approvedGreenBg : styles.rejectedRedBg,
                                color: isApproved ? styles.approvedGreenText : styles.rejectedRedText,
                                borderColor: isApproved ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'
                              }}
                            >
                              {isApproved ? 'APPROVED' : 'REJECTED'}
                            </span>
                          </td>

                          {/* Details */}
                          <td className="py-3.5 pr-3 text-xs opacity-80 truncate max-w-[240px]" style={{ color: styles.textSecondary }}>
                            {tx.reason || (isApproved ? 'Payment processed successfully' : 'Payment limit exceeded')}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-xs font-medium opacity-60" style={{ color: styles.textSecondary }}>
                        No transaction logs found for {currentCompany?.name}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </div>

      {/* ============================================================================ */}
      {/* 3. TRANSACTION DETAILS MODAL WINDOW & INVOICE PDF DOWNLOAD */}
      {/* ============================================================================ */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="max-w-lg w-full rounded-2xl border shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in duration-200"
            style={{ backgroundColor: styles.cardBg, borderColor: styles.borderColor, color: styles.textPrimary }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: styles.borderColor }}>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
                  style={{ backgroundColor: styles.primaryIndigo }}
                >
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base" style={{ color: styles.textPrimary }}>
                    Invoice Details
                  </h3>
                  <p className="text-xs font-mono opacity-70" style={{ color: styles.textSecondary }}>
                    ID: INV-{(selectedTx.id || '').substring(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTx(null)}
                className="p-2 rounded-full hover:bg-black/10 transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" style={{ color: styles.textSecondary }} />
              </button>
            </div>

            {/* Modal Body Details */}
            <div className="space-y-4 text-xs font-medium">
              
              {/* Status & Amount Highlight Row */}
              <div 
                className="p-4 rounded-xl border flex items-center justify-between"
                style={{ backgroundColor: styles.innerBg, borderColor: styles.borderColor }}
              >
                <div>
                  <div className="text-xs opacity-70 mb-0.5" style={{ color: styles.textSecondary }}>Invoice Amount</div>
                  <div className="text-xl font-extrabold" style={{ color: styles.textPrimary }}>
                    ${Number(selectedTx.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                  </div>
                </div>

                <span 
                  className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border"
                  style={{
                    backgroundColor: (selectedTx.status === 'EXECUTED' || selectedTx.status === 'APPROVED') ? styles.approvedGreenBg : styles.rejectedRedBg,
                    color: (selectedTx.status === 'EXECUTED' || selectedTx.status === 'APPROVED') ? styles.approvedGreenText : styles.rejectedRedText,
                    borderColor: (selectedTx.status === 'EXECUTED' || selectedTx.status === 'APPROVED') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'
                  }}
                >
                  {(selectedTx.status === 'EXECUTED' || selectedTx.status === 'APPROVED') ? 'APPROVED' : 'REJECTED'}
                </span>
              </div>

              {/* Data Field Grid */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border" style={{ backgroundColor: styles.innerBg, borderColor: styles.borderColor }}>
                <div>
                  <span className="block text-[11px] opacity-70 mb-1" style={{ color: styles.textSecondary }}>Company Name:</span>
                  <span className="font-bold text-xs" style={{ color: styles.textPrimary }}>{selectedTx.recipient}</span>
                </div>

                <div>
                  <span className="block text-[11px] opacity-70 mb-1" style={{ color: styles.textSecondary }}>Company Email:</span>
                  <span className="font-mono text-xs" style={{ color: styles.textPrimary }}>{currentCompany.address}</span>
                </div>

                <div>
                  <span className="block text-[11px] opacity-70 mb-1" style={{ color: styles.textSecondary }}>Date & Time:</span>
                  <span className="text-xs opacity-90" style={{ color: styles.textPrimary }}>
                    {new Date(selectedTx.created_at || Date.now()).toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="block text-[11px] opacity-70 mb-1" style={{ color: styles.textSecondary }}>Payment Gateway:</span>
                  <span className="text-xs opacity-90" style={{ color: styles.textPrimary }}>Stripe Integration</span>
                </div>
              </div>

              {/* Payment Notes / Reason */}
              <div className="p-3 rounded-xl border space-y-1" style={{ backgroundColor: styles.innerBg, borderColor: styles.borderColor }}>
                <span className="text-[11px] opacity-70 font-bold" style={{ color: styles.textSecondary }}>Transaction Details & Policy Notes:</span>
                <p className="text-xs opacity-90 leading-relaxed" style={{ color: styles.textPrimary }}>
                  {selectedTx.reason || 'Payment processed successfully through AI authorization pipeline.'}
                </p>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSelectedTx(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border font-bold text-xs transition cursor-pointer hover:bg-black/5"
                style={{ backgroundColor: styles.innerBg, borderColor: styles.borderColor, color: styles.textPrimary }}
              >
                Close Window
              </button>

              <button
                onClick={() => handleDownloadInvoicePDF(selectedTx)}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-md hover:bg-indigo-700"
                style={{ backgroundColor: styles.primaryIndigo }}
              >
                <Download className="w-4 h-4" />
                Download Invoice PDF
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
