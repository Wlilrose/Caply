/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Clock,
  DollarSign,
  Info,
  Edit2,
  Download,
  Upload,
  Sliders,
  Sparkles,
  HelpCircle,
  Activity,
  LogOut,
  RefreshCw,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Client, PricingMode, CapacityStatus, SimulationInput, SimulationResult, TimeLog } from './types.ts';
import { calculateClientMetrics, getCapacityStatus } from './utils/calculations';
import { storage } from './services/storage';
import { AUTH_CONFIG } from './config/features';

import { OnboardingWizard } from './components/OnboardingWizard';
import { ClientWizardModal } from './components/ClientWizardModal';
import { LogWorkWizardModal } from './components/LogWorkWizardModal';
import { EXCHANGE_RATES, CURRENCY_SYMBOLS } from './constants';
import { detectDefaultCurrency } from './utils/currency';

const MetricInfo = ({ title, content }: { title: string, content: string }) => {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block ml-1 group">
      <motion.div 
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        whileHover={{ scale: 1.15 }}
        className="cursor-help text-outline/30 hover:text-primary transition-colors bg-primary/5 rounded-full p-0.5"
      >
        <Info size={11} />
      </motion.div>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute z-[110] bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-3 bg-primary text-white rounded-xl shadow-xl text-[10px] leading-relaxed pointer-events-none"
          >
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-1.5 h-1.5 bg-primary" />
            <p className="font-bold mb-1 uppercase tracking-wider text-white/50 text-[9px]">{title}</p>
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [onboardingCompleted, setOnboardingCompleted] = useState(() => storage.getSettings().onboardingCompleted);
  const [totalCapacity, setTotalCapacity] = useState(() => storage.getSettings().weeklyCapacity || 40);

  const [adminHours, setAdminHours] = useState(() => {
    const s = storage.getSettings() as any;
    return s.adminHours !== undefined ? s.adminHours : 5;
  });

  const [stressLevel, setStressLevel] = useState(() => {
    const s = storage.getSettings() as any;
    return s.stressLevel || 'medium';
  });

  const [focusedHoursPerDay, setFocusedHoursPerDay] = useState(() => {
    const s = storage.getSettings() as any;
    return s.focusedHoursPerDay || 6;
  });

  // Modals & form toggles
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<TimeLog | null>(null);
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [logToDelete, setLogToDelete] = useState<string | null>(null);
  const [isRestartConfirmOpen, setIsRestartConfirmOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<any | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // Core Data
  const [logs, setLogs] = useState<TimeLog[]>(() => storage.getLogs());
  const [baseClients, setBaseClients] = useState<Partial<Client>[]>(() => storage.getClients());

  const [currency, setCurrency] = useState(() => {
    const saved = storage.getSettings().currency;
    if (saved && saved !== 'USD') return saved;
    const detected = detectDefaultCurrency();
    return saved || detected;
  });
  const prevCurrencyRef = useRef(currency);

  // Interactive Live Simulation playground states (Inline)
  const [simHours, setSimHours] = useState<number>(10);
  const [simPay, setSimPay] = useState<number>(1000);
  const [simName, setSimName] = useState<string>('Next Big Project');

  useEffect(() => {
    const settings = storage.getSettings();
    storage.saveSettings({ 
      ...settings, 
      weeklyCapacity: totalCapacity,
      onboardingCompleted,
      currency,
      adminHours,
      stressLevel,
      focusedHoursPerDay
    } as any);
  }, [totalCapacity, onboardingCompleted, currency, adminHours, stressLevel, focusedHoursPerDay]);

  useEffect(() => {
    const from = prevCurrencyRef.current;
    const to = currency;

    if (from !== to) {
      const factor = (EXCHANGE_RATES[to] || 1) / (EXCHANGE_RATES[from] || 1);
      
      // Update Clients
      setBaseClients(prev => prev.map(client => {
        const updatedParams = { ...client.params } as any;
        if (updatedParams.hourlyRate) updatedParams.hourlyRate = Math.round(updatedParams.hourlyRate * factor * 100) / 100;
        if (updatedParams.dayRate) updatedParams.dayRate = Math.round(updatedParams.dayRate * factor * 100) / 100;
        if (updatedParams.pricePerTask) updatedParams.pricePerTask = Math.round(updatedParams.pricePerTask * factor * 100) / 100;
        
        return {
          ...client,
          params: updatedParams,
          weeklyIncome: client.weeklyIncome ? Math.round(client.weeklyIncome * factor * 100) / 100 : 0
        };
      }));

      prevCurrencyRef.current = to;
    } else {
      const settings = storage.getSettings();
      storage.saveSettings({ ...settings, currency });
    }
  }, [currency]);

  useEffect(() => {
    storage.saveLogs(logs as any);
  }, [logs]);

  useEffect(() => {
    storage.saveClients(baseClients as any);
  }, [baseClients]);

  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    }).format(val);
  };

  // Derived calculations
  const clients = useMemo(() => {
    return baseClients.map(bc => calculateClientMetrics(bc, logs, currency));
  }, [baseClients, logs, currency]);

  const stats = useMemo(() => getCapacityStatus(clients, totalCapacity), [clients, totalCapacity]);

  const overallWorkload = useMemo(() => {
    return stats.plannedHours + adminHours;
  }, [stats.plannedHours, adminHours]);

  const utilizationPercentage = useMemo(() => {
    return Math.round((overallWorkload / (totalCapacity || 1)) * 100);
  }, [overallWorkload, totalCapacity]);

  // Capacity visual message advice
  const capacityMessage = useMemo(() => {
    if (utilizationPercentage > 105) {
      return {
        label: 'Overloaded 🤯',
        desc: 'Workload exceeds limits. Consider pricing revisions or timeline adjustments.',
        color: 'text-red-600 bg-red-50 border-red-100',
        barColor: 'bg-red-500'
      };
    } else if (utilizationPercentage >= 90) {
      return {
        label: 'Near Capacity 😳',
        desc: 'At stamina limits. Be cautious about accepting new commitments.',
        color: 'text-amber-600 bg-amber-50 border-amber-100',
        barColor: 'bg-amber-500'
      };
    } else if (utilizationPercentage >= 60) {
      return {
        label: 'Balanced 😌',
        desc: 'Beautiful rhythm! Workload supports deep work and administrative ease.',
        color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        barColor: 'bg-emerald-500'
      };
    } else {
      return {
        label: 'Underloaded 🌾',
        desc: 'Safe stamina runway available to expand your roster or focus on strategy.',
        color: 'text-blue-600 bg-blue-50 border-blue-100',
        barColor: 'bg-blue-500'
      };
    }
  }, [utilizationPercentage]);

  // Real-time Inline simulation engine result
  const inlineSimResult = useMemo((): SimulationResult => {
    const afterSimulation = overallWorkload + Number(simHours || 0);
    const remainingAfter = totalCapacity - afterSimulation;

    if (afterSimulation > totalCapacity) {
      return {
        canAccept: false,
        status: 'no',
        message: `No: This will overload your schedule by ${formatNumber(afterSimulation - totalCapacity)}h`,
        remainingHoursAfter: remainingAfter,
        incomeImpact: simPay
      };
    } else if (afterSimulation >= totalCapacity * 0.9) {
      return {
        canAccept: true,
        status: 'warning',
        message: 'Warning: This will push you near your baseline limits',
        remainingHoursAfter: remainingAfter,
        incomeImpact: simPay
      };
    } else {
      return {
        canAccept: true,
        status: 'yes',
        message: 'Yes: You have comfortable focus reserves to take this client',
        remainingHoursAfter: remainingAfter,
        incomeImpact: simPay
      };
    }
  }, [overallWorkload, totalCapacity, simHours, simPay]);

  // Actions
  const handleRemoveClient = (id: string) => {
    setBaseClients(prev => prev.filter(c => c.id !== id));
    setLogs(prev => prev.filter(l => l.clientId !== id));
    setClientToDelete(null);
    setStatusMessage({ text: 'Client and associated work logs removed.', type: 'success' });
  };

  const handleConfirmRemoveLog = () => {
    if (!logToDelete) return;
    setLogs(prev => prev.filter(l => l.id !== logToDelete));
    setLogToDelete(null);
    setStatusMessage({ text: 'Time log entry removed', type: 'success' });
  };

  const handleResetAllData = () => {
    storage.saveData({
      user_id: 'local-user',
      clients: [],
      logs: [],
      settings: {
        weeklyCapacity: 40,
        currency: 'USD',
        simInput: {
          name: '',
          mode: 'hourly',
          params: { hourlyRate: 100, expectedHoursPerWeek: 10 },
          growthPotential: 3,
          paymentReliability: 3
        },
        onboardingCompleted: false
      },
      history: []
    });
    window.location.reload();
  };

  const handleAddSimulatedToRoster = () => {
    const now = new Date().toISOString();
    const newClientObj: Partial<Client> = {
      id: Math.random().toString(36).substr(2, 9),
      name: simName || 'Simulated Project',
      mode: 'hourly',
      params: { hourlyRate: Math.round(simPay / (simHours || 1)), expectedHoursPerWeek: simHours },
      plannedWeeklyHours: simHours,
      actualWeeklyHours: 0,
      averageActualHours: 0,
      adjustedWeeklyHours: simHours,
      weeklyIncome: simPay,
      growthPotential: 3,
      paymentReliability: 3,
      created_at: now,
      updated_at: now
    };
    setBaseClients(prev => [...prev, newClientObj]);
    setStatusMessage({ text: 'Project successfully accepted into active roster!', type: 'success' });
    // Reset inputs
    setSimName('Next Big Project');
  };

  const exportBackup = () => {
    const data = {
      version: '2.0-simplified',
      timestamp: new Date().toISOString(),
      baseClients,
      logs,
      totalCapacity,
      currency,
      adminHours,
      stressLevel,
      focusedHoursPerDay
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `caply_simplified_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStatusMessage({ text: 'Backup created and downloaded successfully!', type: 'success' });
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!data.baseClients || !data.logs) {
          throw new Error('Missing core arrays');
        }
        setPendingImportData(data);
      } catch (err) {
        setStatusMessage({ text: 'Failed to import backup. Ensure file format is valid.', type: 'error' });
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!pendingImportData) return;
    const data = pendingImportData;
    setBaseClients(data.baseClients);
    setLogs(data.logs);
    if (data.totalCapacity) setTotalCapacity(data.totalCapacity);
    if (data.currency) setCurrency(data.currency);
    if (data.adminHours !== undefined) setAdminHours(data.adminHours);
    if (data.stressLevel) setStressLevel(data.stressLevel);
    if (data.focusedHoursPerDay) setFocusedHoursPerDay(data.focusedHoursPerDay);
    setStatusMessage({ text: 'Data imported successfully! Active workspace updated.', type: 'success' });
    setPendingImportData(null);
  };

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  if (!onboardingCompleted) {
    return (
      <OnboardingWizard 
        currency={currency}
        currencySymbol={symbol}
        onComplete={(data) => {
          setTotalCapacity(data.weeklyCapacity);
          setAdminHours(data.adminHours);
          setStressLevel(data.stressLevel);
          setFocusedHoursPerDay(data.focusedHoursPerDay);
          if (data.clients && data.clients.length > 0) {
            setBaseClients(data.clients as Client[]);
          } else {
            setBaseClients([]);
          }
          setOnboardingCompleted(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface font-sans antialiased flex flex-col" id="app-root">
      
      {/* Top Main Navigation Header */}
      <header className="border-b border-primary/5 bg-surface/80 backdrop-blur-md sticky top-0 z-40 px-4 py-4 md:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <TrendingUp className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-primary tracking-tight leading-none">Caply</h1>
              <p className="text-[10px] text-[#06696a] font-bold uppercase tracking-widest mt-1">Stamina Control Center</p>
            </div>
          </div>

          {/* Quick Calibration Panel (Collapses settings right into the header!) */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-slate-100/50 p-2 rounded-2xl border border-slate-200/50">
            {/* Currency Select */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-outline tracking-wider">Currency</span>
              <select 
                value={currency} 
                onChange={e => setCurrency(e.target.value)}
                className="bg-white border border-slate-200 text-xs font-bold rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                id="currency-header-select"
              >
                {Object.keys(CURRENCY_SYMBOLS).map(c => (
                  <option key={c} value={c}>{c} ({CURRENCY_SYMBOLS[c]})</option>
                ))}
              </select>
            </div>

            {/* Weekly Hours Limit Slider */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase text-outline tracking-wider">Weekly Cap Goal</span>
              <div className="flex items-center gap-2">
                <input 
                  type="range" 
                  min="20" 
                  max="80" 
                  step="1"
                  value={totalCapacity}
                  onChange={e => setTotalCapacity(Number(e.target.value))}
                  className="w-20 md:w-28 accent-primary h-1 bg-slate-200 rounded-lg cursor-pointer"
                  id="capacity-header-range"
                />
                <span className="text-xs font-black text-primary w-8">{totalCapacity}h</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-6xl mx-auto w-full p-4 md:p-8 space-y-8 pb-24">
        
        {/* Welcome Coach & Stats Summary Block */}
        <section className="bg-gradient-to-br from-primary via-[#3b357a] to-[#252150] text-white p-6 md:p-8 rounded-[32px] shadow-xl relative overflow-hidden group">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
          
          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-bold tracking-widest uppercase">
                  <Activity size={11} className="animate-pulse text-emerald-400" />
                  Active Stamina Advice
                </div>
                <h2 className="text-xl md:text-2xl font-black tracking-tight mt-1">
                  "{capacityMessage.label}"
                </h2>
                <p className="text-sm text-white/80 max-w-2xl font-medium">
                  {capacityMessage.desc} Based on your target goal of <strong className="text-white">{totalCapacity}h/week</strong> (including your {adminHours}h weekly administrative overhead buffer).
                </p>
              </div>

              {/* Dynamic quick stat circles */}
              <div className="grid grid-cols-2 gap-3 w-full sm:flex sm:w-auto sm:gap-4">
                <div className="bg-white/10 border border-white/10 rounded-2xl p-4 text-center w-full sm:min-w-[100px] shadow-inner">
                  <span className="block text-[9px] font-black uppercase tracking-wider text-white/40">Planned Hours</span>
                  <span className="text-xl font-extrabold">{overallWorkload}h</span>
                </div>
                <div className="bg-white/10 border border-white/10 rounded-2xl p-4 text-center w-full sm:min-w-[120px] shadow-inner">
                  <span className="block text-[9px] font-black uppercase tracking-wider text-white/40">Weekly Income</span>
                  <span className="text-xl font-extrabold text-emerald-300">{symbol}{formatCurrency(stats.totalWeeklyIncome)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Unified Two-Column Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Column 1: Client Roster & Capacity Meter (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Capacity Health Card */}
            <div className="bg-white rounded-3xl p-6 border border-primary/5 shadow-sm space-y-6" id="capacity-meter-card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-1">
                    Workload Allocation Progress
                    <MetricInfo 
                      title="Workload Utilization" 
                      content="Includes your contracted client planned hours plus your overhead administrative reserve hours." 
                    />
                  </h3>
                  <p className="text-[10px] text-outline mt-0.5">How your current agreements fill your available weekly stamina.</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${capacityMessage.color}`}>
                  {utilizationPercentage}% Utilized
                </span>
              </div>

              {/* Custom Stamina Gauge Bar */}
              <div className="space-y-2">
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                  {/* Admin overhead representation */}
                  <div 
                    className="bg-[#06696a] h-full" 
                    style={{ width: `${Math.min((adminHours / totalCapacity) * 100, 100)}%` }}
                    title={`Admin Overhead Buffer: ${adminHours}h`}
                  />
                  {/* Client planned hours representation */}
                  <div 
                    className={`${capacityMessage.barColor} h-full border-l border-white/20`} 
                    style={{ width: `${Math.min((stats.plannedHours / totalCapacity) * 100, 100 - (adminHours / totalCapacity) * 100)}%` }}
                    title={`Client Commitments: ${stats.plannedHours}h`}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-outline">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#06696a]" /> Admin Overhead ({adminHours}h)</span>
                  <span className="flex items-center gap-1"><span className={`w-2 h-2 rounded ${capacityMessage.barColor}`} /> Client Contracts ({stats.plannedHours}h)</span>
                  <span className="font-extrabold text-primary">Limit: {totalCapacity}h</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
                <Clock className="text-[#06696a] mt-0.5" size={16} />
                <p className="text-xs text-outline leading-snug font-medium">
                  {overallWorkload > totalCapacity ? (
                    <span className="text-red-500 font-bold">Stamina Alert: Your active roster has breached your burnout ceiling by {formatNumber(overallWorkload - totalCapacity)}h/week!</span>
                  ) : (
                    <span>You still have <strong>{formatNumber(totalCapacity - overallWorkload)} hours</strong> of unallocated focus blocks remaining in your schedule.</span>
                  )}
                </p>
              </div>
            </div>

            {/* Active Client Roster Card */}
            <div className="bg-white rounded-3xl p-6 border border-primary/5 shadow-sm space-y-6" id="client-roster-card">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-primary uppercase tracking-widest">Active Client Roster</h3>
                  <p className="text-[10px] text-outline mt-0.5">Your contracted agreements and true value ratings.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingClient(null);
                    setIsClientModalOpen(true);
                  }}
                  className="bg-primary hover:bg-[#3b357a] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  id="add-client-btn"
                >
                  <Plus size={14} />
                  Add Client
                </button>
              </div>

              {clients.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-10 text-center space-y-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto text-primary/30">
                    <Sliders size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-primary text-sm">No Active Client Contracts</p>
                    <p className="text-xs text-outline max-w-xs mx-auto">Set up your current roster to start analyzing stamina levels and tracking income.</p>
                  </div>
                  <button 
                    onClick={() => setIsClientModalOpen(true)}
                    className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                  >
                    Set Up First Client
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {clients.map(client => {
                    const hasOverage = client.actualWeeklyHours > client.plannedWeeklyHours;
                    const diff = client.actualWeeklyHours - client.plannedWeeklyHours;

                    return (
                      <div 
                        key={client.id} 
                        className="p-4 rounded-2xl border border-slate-100 hover:border-primary/20 bg-slate-50/40 hover:bg-white transition-all group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        id={`client-item-${client.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary text-sm font-black flex items-center justify-center uppercase group-hover:bg-primary group-hover:text-white transition-colors flex-shrink-0">
                            {client.name[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-extrabold text-sm text-primary leading-tight">{client.name}</h4>
                              <span className="text-[8px] uppercase tracking-widest font-black text-outline/50 bg-slate-100 px-1.5 py-0.5 rounded">
                                {client.mode}
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5 mt-1 text-[10px] text-outline">
                              <span>Plan: <strong>{client.plannedWeeklyHours}h/wk</strong></span>
                              <span>•</span>
                              <span>Logged: <strong className={hasOverage ? "text-red-500 font-bold" : "text-primary font-bold"}>{client.actualWeeklyHours}h</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Mid Section: Financial & Rating details */}
                        <div className="flex items-center justify-between sm:justify-start gap-6 w-full sm:w-auto text-xs border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                          <div className="text-left sm:text-right">
                            <span className="block text-[8px] uppercase tracking-widest text-outline">Income Est</span>
                            <span className="font-extrabold text-primary">{symbol}{formatCurrency(client.weeklyIncome)}</span>
                          </div>

                          <div className="text-right border-l border-slate-200 pl-6 sm:pl-4">
                            <span className="flex items-center text-[8px] uppercase tracking-widest text-outline justify-end">
                              Value Score
                              <MetricInfo 
                                title="Value Score (0-100)" 
                                content="A weighted score assessing this client based on rate margins, payment reliability, and future contract growth potential." 
                              />
                            </span>
                            <span className="font-black text-secondary block mt-0.5">{client.valueScore}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4 w-full sm:w-auto">
                          <button
                            onClick={() => {
                              setEditingClient(client);
                              setIsClientModalOpen(true);
                            }}
                            className="p-2 text-outline/60 hover:text-primary hover:bg-slate-100 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center border border-slate-200/50 sm:border-0"
                            title="Edit Client Settings"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setClientToDelete(client.id)}
                            className="p-2 text-outline/60 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center border border-slate-200/50 sm:border-0"
                            title="Remove Client"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Column 2: Log Work & Simulation Optimizer (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Live Inline Simulation Sandbox */}
            <div className="bg-white rounded-3xl p-6 border border-primary/5 shadow-sm space-y-5" id="simulation-sandbox-card">
              <div>
                <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-1">
                  Prospective Client Simulator
                  <MetricInfo 
                    title="Workload Simulation" 
                    content="Instantly test new opportunities before signing. Matches proposed hours against your active limits." 
                  />
                </h3>
                <p className="text-[10px] text-outline mt-0.5">Quickly stress-test new proposals before saying yes.</p>
              </div>

              <div className="space-y-4 pt-1">
                {/* Project Name */}
                <div>
                  <label className="block text-[9px] font-black text-outline/60 uppercase tracking-wider mb-1.5">Proposed Client Name</label>
                  <input 
                    type="text" 
                    value={simName}
                    onChange={e => setSimName(e.target.value)}
                    placeholder="e.g. Acme Inc, Stripe Contract..."
                    className="w-full bg-slate-50 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                  />
                </div>

                {/* Simulated Hours */}
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <label className="block text-[9px] font-black text-outline/60 uppercase tracking-wider">Simulated Weekly Hours</label>
                    <span className="text-xs font-black text-primary">{simHours}h/wk</span>
                  </div>
                  <input 
                    type="range" 
                    min="2" 
                    max="30" 
                    step="1"
                    value={simHours} 
                    onChange={e => setSimHours(Number(e.target.value))}
                    className="w-full accent-primary h-1 bg-slate-100 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Simulated Revenue */}
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <label className="block text-[9px] font-black text-outline/60 uppercase tracking-wider">Simulated Weekly Rate</label>
                    <span className="text-xs font-black text-secondary">{symbol}{formatCurrency(simPay)}/wk</span>
                  </div>
                  <input 
                    type="range" 
                    min="100" 
                    max="4000" 
                    step="50"
                    value={simPay} 
                    onChange={e => setSimPay(Number(e.target.value))}
                    className="w-full accent-primary h-1 bg-slate-100 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Dynamic Simulation Feedback output */}
              <div className="border-t border-slate-100 pt-4 space-y-3.5">
                <div className="flex gap-2.5 items-start">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    inlineSimResult.status === 'no' ? 'bg-red-50 text-red-500 border border-red-100' :
                    inlineSimResult.status === 'warning' ? 'bg-amber-50 text-amber-500 border border-amber-100' :
                    'bg-emerald-50 text-emerald-500 border border-emerald-100'
                  }`}>
                    {inlineSimResult.status === 'no' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="font-extrabold text-xs text-primary">Simulation Recommendation</h5>
                    <p className="text-[11px] text-outline font-medium leading-normal">{inlineSimResult.message}</p>
                  </div>
                </div>

                {/* Projected outcomes panel */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                  <div>
                    <span className="block text-[8px] font-black text-outline/50 uppercase tracking-wider">Post-Simulation Cap</span>
                    <span className={`text-sm font-black ${inlineSimResult.remainingHoursAfter < 0 ? 'text-red-500' : 'text-primary'}`}>
                      {utilizationPercentage + Math.round((simHours / totalCapacity) * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-black text-outline/50 uppercase tracking-wider">Projected Income</span>
                    <span className="text-sm font-black text-emerald-600">
                      {symbol}{formatCurrency(stats.totalWeeklyIncome + simPay)}
                    </span>
                  </div>
                </div>

                {inlineSimResult.status !== 'no' && (
                  <button
                    onClick={handleAddSimulatedToRoster}
                    className="w-full py-2.5 bg-[#06696a] hover:bg-[#045051] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                    id="accept-simulated-project-btn"
                  >
                    <Sparkles size={13} className="animate-pulse" />
                    Accept Simulated Client
                  </button>
                )}
              </div>
            </div>

            {/* Recent Logged Sessions Feed */}
            <div className="bg-white rounded-3xl p-6 border border-primary/5 shadow-sm space-y-4" id="logged-sessions-card">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-primary uppercase tracking-widest">Logged Sessions Timeline</h3>
                  <p className="text-[10px] text-outline mt-0.5">Verify real capacity vs assumptions.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingLog(null);
                    setIsLogModalOpen(true);
                  }}
                  className="bg-secondary hover:bg-[#045051] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                  id="log-session-btn"
                >
                  <Plus size={13} />
                  Log Session
                </button>
              </div>

              {logs.length === 0 ? (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center text-xs text-outline font-medium">
                  No hours registered for this week. Tap "Log Session" to track actual worked time.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                  {[...logs]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5)
                    .map(log => {
                      const client = clients.find(c => c.id === log.clientId);
                      return (
                        <div 
                          key={log.id} 
                          className="p-3 bg-slate-50/60 border border-slate-100 rounded-xl flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 bg-secondary/10 text-secondary text-[11px] font-black flex items-center justify-center rounded-lg uppercase">
                              {client?.name[0] || '?' }
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-extrabold text-primary truncate leading-tight">
                                {client?.name || 'Deleted Client'}
                              </h5>
                              <p className="text-[9px] text-outline/70 mt-0.5">
                                {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                {log.note && ` • "${log.note}"`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 flex-shrink-0">
                            <span className="font-extrabold text-primary bg-secondary/10 text-secondary px-2 py-0.5 rounded-md text-[11px]">
                              {log.hours}h
                            </span>
                            <button
                              onClick={() => setLogToDelete(log.id)}
                              className="text-outline/40 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                              title="Delete log entry"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* System Control Settings (Collapsible Accordion for Advanced Stuff) */}
            <div className="bg-white rounded-3xl p-6 border border-primary/5 shadow-sm space-y-4" id="system-controls-panel">
              <button
                onClick={() => setShowAdvancedPanel(!showAdvancedPanel)}
                className="w-full flex justify-between items-center text-left focus:outline-none"
                id="advanced-settings-toggle"
              >
                <div>
                  <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
                    <Sliders size={13} />
                    Advanced Systems Calibration
                  </h3>
                  <p className="text-[10px] text-outline mt-0.5">Control data backups and baseline targets.</p>
                </div>
                <span className="text-xs font-black text-primary/40 bg-slate-50 px-2 py-1 rounded-lg">
                  {showAdvancedPanel ? 'Close' : 'Configure'}
                </span>
              </button>

              <AnimatePresence>
                {showAdvancedPanel && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pt-2 space-y-4 border-t border-slate-100"
                  >
                    {/* Admin Overhead Hours */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-baseline">
                        <label className="block text-[10px] font-black uppercase text-outline">Unpaid Administration Hours</label>
                        <span className="text-xs font-bold text-primary">{adminHours}h/wk</span>
                      </div>
                      <input 
                        type="range" min="0" max="25"
                        value={adminHours}
                        onChange={e => setAdminHours(Number(e.target.value))}
                        className="w-full accent-primary h-1 bg-slate-100 rounded-lg cursor-pointer"
                      />
                      <p className="text-[9px] text-outline/70">Covers overhead like bookkeeping, pipeline proposals, and marketing tasks.</p>
                    </div>

                    {/* Import / Export & Reset controls */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={exportBackup}
                        className="p-2 border border-slate-200 hover:bg-slate-50 text-outline hover:text-primary rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Download size={11} /> Export Backup
                      </button>

                      <div className="relative">
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportBackup}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <button
                          className="w-full p-2 border border-slate-200 hover:bg-slate-50 text-outline hover:text-primary rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Upload size={11} /> Import Backup
                        </button>
                      </div>

                      <button
                        onClick={() => setIsRestartConfirmOpen(true)}
                        className="p-2 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <RefreshCw size={11} /> Restart Coach Setup
                      </button>

                      <button
                        onClick={() => setIsResetConfirmOpen(true)}
                        className="p-2 bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Trash2 size={11} /> Reset All Data
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>

      </main>

      {/* Interactive Guidance Modal dialogs */}
      <ClientWizardModal
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          setEditingClient(null);
        }}
        onSave={(clientData) => {
          if (editingClient) {
            setBaseClients(prev => prev.map(bc => 
              bc.id === editingClient.id ? { 
                ...bc,
                ...clientData,
                updated_at: new Date().toISOString()
              } as Client : bc
            ));
            setStatusMessage({ text: 'Client performance profiles updated!', type: 'success' });
          } else {
            const now = new Date().toISOString();
            setBaseClients(prev => [...prev, {
              ...clientData,
              id: Math.random().toString(36).substr(2, 9),
              created_at: now,
              updated_at: now
            } as Client]);
            setStatusMessage({ text: 'New client successfully welcomed to active roster!', type: 'success' });
          }
          setIsClientModalOpen(false);
          setEditingClient(null);
        }}
        initialClient={editingClient}
        symbol={symbol}
      />

      <LogWorkWizardModal
        isOpen={isLogModalOpen}
        onClose={() => {
          setIsLogModalOpen(false);
          setEditingLog(null);
        }}
        onSave={(logData) => {
          const now = new Date().toISOString();
          setLogs(prev => [...prev, {
            ...logData,
            id: Math.random().toString(36).substr(2, 9),
            created_at: now,
            updated_at: now
          } as TimeLog]);
          setStatusMessage({ text: 'Work logged! Stamina balances recalculated.', type: 'success' });
          setIsLogModalOpen(false);
          setEditingLog(null);
        }}
        clients={clients}
        initialLog={editingLog}
      />

      {/* Delete Confirmation Dialog Modal */}
      <AnimatePresence>
        {clientToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setClientToDelete(null)}
              className="absolute inset-0 bg-primary/10 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="relative bg-white w-full max-w-sm rounded-[24px] p-6 shadow-2xl border border-primary/5 text-center"
            >
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-black text-primary mb-1">Remove Client?</h3>
              <p className="text-outline text-xs mb-6">This will delete the client contract and all associated logged times. This cannot be undone.</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => handleRemoveClient(clientToDelete)}
                  className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-red-600 transition-colors"
                >
                  Yes, Delete
                </button>
                <button 
                  onClick={() => setClientToDelete(null)}
                  className="flex-1 py-2.5 text-xs font-bold text-outline hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Log Session Delete Confirmation Dialog Modal */}
      <AnimatePresence>
        {logToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLogToDelete(null)}
              className="absolute inset-0 bg-primary/10 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="relative bg-white w-full max-w-sm rounded-[24px] p-6 shadow-2xl border border-primary/5 text-center"
            >
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-black text-primary mb-1">Delete Log Entry?</h3>
              <p className="text-outline text-xs mb-6">Are you sure you want to delete this time log entry? This will update your calculated stamina levels immediately.</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={handleConfirmRemoveLog}
                  className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-red-600 transition-colors"
                >
                  Yes, Delete
                </button>
                <button 
                  onClick={() => setLogToDelete(null)}
                  className="flex-1 py-2.5 text-xs font-bold text-outline hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Restart Coach Onboarding Confirmation Dialog Modal */}
      <AnimatePresence>
        {isRestartConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRestartConfirmOpen(false)}
              className="absolute inset-0 bg-primary/10 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="relative bg-white w-full max-w-sm rounded-[24px] p-6 shadow-2xl border border-primary/5 text-center"
            >
              <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                <RefreshCw size={24} className="animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <h3 className="text-lg font-black text-primary mb-1">Restart Coach Setup?</h3>
              <p className="text-outline text-xs mb-6">This will restart the interactive coaching onboarding steps. Your active clients and logged times will remain securely saved.</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setOnboardingCompleted(false);
                    setIsRestartConfirmOpen(false);
                  }}
                  className="flex-1 bg-primary text-white py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-[#3b357a] transition-colors"
                >
                  Yes, Restart
                </button>
                <button 
                  onClick={() => setIsRestartConfirmOpen(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-outline hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset All Data Confirmation Dialog Modal */}
      <AnimatePresence>
        {isResetConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsResetConfirmOpen(false)}
              className="absolute inset-0 bg-primary/10 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="relative bg-white w-full max-w-sm rounded-[24px] p-6 shadow-2xl border border-primary/5 text-center"
            >
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-black text-primary mb-1">Permanently Wipe All Data?</h3>
              <p className="text-outline text-xs mb-6 text-red-500 font-medium">WARNING: This will permanently wipe all active client contracts, settings, and logged hours. This action cannot be undone.</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={handleResetAllData}
                  className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-red-600 transition-colors"
                >
                  Yes, Wipe Everything
                </button>
                <button 
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-outline hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Backup Import Confirmation Dialog Modal */}
      <AnimatePresence>
        {pendingImportData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPendingImportData(null)}
              className="absolute inset-0 bg-primary/10 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="relative bg-white w-full max-w-sm rounded-[24px] p-6 shadow-2xl border border-primary/5 text-center"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-500">
                <Upload size={24} />
              </div>
              <h3 className="text-lg font-black text-primary mb-1">Overwrite Roster with Backup?</h3>
              <p className="text-outline text-xs mb-6">Importing this backup will completely overwrite your current active Caply roster and time logs. Proceed?</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={handleConfirmImport}
                  className="flex-1 bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-emerald-600 transition-colors"
                >
                  Yes, Import Backup
                </button>
                <button 
                  onClick={() => setPendingImportData(null)}
                  className="flex-1 py-2.5 text-xs font-bold text-outline hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Live Toast status messages */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border text-xs font-bold ${
              statusMessage.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-red-500 text-white border-red-400'
            }`}
          >
            {statusMessage.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            <span>{statusMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
