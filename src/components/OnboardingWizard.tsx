import React, { useState } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  Zap, 
  Activity, 
  Sparkles, 
  Users, 
  Coins 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Client, PricingMode } from '../types';

interface OnboardingWizardProps {
  onComplete: (data: {
    weeklyCapacity: number;
    adminHours: number;
    clients: Partial<Client>[];
    stressLevel: string;
    focusedHoursPerDay: number;
    simInput?: any;
  }) => void;
  currencySymbol: string;
  currency: string;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ 
  onComplete, 
  currencySymbol: symbol,
  currency 
}) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 6;

  // Step 2 variables: Capacity and Admin
  const [weeklyCapacity, setWeeklyCapacity] = useState<number>(40);
  const [adminHours, setAdminHours] = useState<number>(5);

  // Step 3 variables: Client portfolio
  const [clients, setClients] = useState<Partial<Client>[]>([]);
  const [clientFormActive, setClientFormActive] = useState<boolean>(false);
  const [tempClient, setTempClient] = useState({
    name: '',
    mode: 'hourly' as PricingMode,
    hourlyRate: 80,
    expectedHoursPerWeek: 10,
    dayRate: 600,
    daysPerWeek: 2,
    hoursPerDay: 8,
    pricePerTask: 400,
    estimatedHoursPerTask: 5,
    tasksPerWeek: 1,
    growthPotential: 3,
    paymentReliability: 3
  });

  // Step 4 variables: Stress & focus stamina
  const [stressLevel, setStressLevel] = useState<string>('medium');
  const [focusedHoursPerDay, setFocusedHoursPerDay] = useState<number>(6);

  // Step 5 variables: Prospective client simulation
  const [simulateLead, setSimulateLead] = useState<boolean>(false);
  const [simLead, setSimLead] = useState({
    name: '',
    mode: 'hourly' as PricingMode,
    hourlyRate: 100,
    expectedHoursPerWeek: 8,
    dayRate: 800,
    daysPerWeek: 1,
    hoursPerDay: 8,
    pricePerTask: 500,
    estimatedHoursPerTask: 4,
    tasksPerWeek: 1
  });

  const getPlannedHoursForClient = (c: any) => {
    if (c.mode === 'hourly') return Number(c.expectedHoursPerWeek || 0);
    if (c.mode === 'daily') return Number(c.daysPerWeek || 0) * Number(c.hoursPerDay || 0);
    if (c.mode === 'task') return Number(c.estimatedHoursPerTask || 0) * Number(c.tasksPerWeek || 0);
    return 0;
  };

  const getPlannedIncomeForClient = (c: any) => {
    if (c.mode === 'hourly') return Number(c.hourlyRate || 0) * getPlannedHoursForClient(c);
    if (c.mode === 'daily') return Number(c.dayRate || 0) * Number(c.daysPerWeek || 0);
    if (c.mode === 'task') return Number(c.pricePerTask || 0) * Number(c.tasksPerWeek || 0);
    return 0;
  };

  const addTempClient = () => {
    if (!tempClient.name.trim()) return;
    
    let params: any = {};
    let plannedWeeklyHours = 0;
    let weeklyIncome = 0;

    if (tempClient.mode === 'hourly') {
      params = { hourlyRate: tempClient.hourlyRate, expectedHoursPerWeek: tempClient.expectedHoursPerWeek };
      plannedWeeklyHours = tempClient.expectedHoursPerWeek;
      weeklyIncome = tempClient.hourlyRate * tempClient.expectedHoursPerWeek;
    } else if (tempClient.mode === 'daily') {
      params = { dayRate: tempClient.dayRate, daysPerWeek: tempClient.daysPerWeek, hoursPerDay: tempClient.hoursPerDay };
      plannedWeeklyHours = tempClient.daysPerWeek * tempClient.hoursPerDay;
      weeklyIncome = tempClient.dayRate * tempClient.daysPerWeek;
    } else if (tempClient.mode === 'task') {
      params = { pricePerTask: tempClient.pricePerTask, estimatedHoursPerTask: tempClient.estimatedHoursPerTask, tasksPerWeek: tempClient.tasksPerWeek };
      plannedWeeklyHours = tempClient.estimatedHoursPerTask * tempClient.tasksPerWeek;
      weeklyIncome = tempClient.pricePerTask * tempClient.tasksPerWeek;
    }

    const newClientObj: Partial<Client> = {
      id: Math.random().toString(36).substr(2, 9),
      name: tempClient.name,
      mode: tempClient.mode,
      params,
      plannedWeeklyHours,
      actualWeeklyHours: 0,
      averageActualHours: 0,
      adjustedWeeklyHours: plannedWeeklyHours,
      weeklyIncome,
      growthPotential: tempClient.growthPotential,
      paymentReliability: tempClient.paymentReliability,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setClients([...clients, newClientObj]);
    setTempClient({
      ...tempClient,
      name: '',
      hourlyRate: 80,
      expectedHoursPerWeek: 10,
      dayRate: 600,
      daysPerWeek: 2,
      hoursPerDay: 8,
      pricePerTask: 400,
      estimatedHoursPerTask: 5,
      tasksPerWeek: 1
    });
    setClientFormActive(false);
  };

  const removeClientInstance = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
  };

  const handleFinish = () => {
    let finalSimInput = null;
    if (simulateLead && simLead.name.trim()) {
      let params = {};
      if (simLead.mode === 'hourly') {
        params = { hourlyRate: simLead.hourlyRate, expectedHoursPerWeek: simLead.expectedHoursPerWeek };
      } else if (simLead.mode === 'daily') {
        params = { dayRate: simLead.dayRate, daysPerWeek: simLead.daysPerWeek, hoursPerDay: simLead.hoursPerDay };
      } else if (simLead.mode === 'task') {
        params = { pricePerTask: simLead.pricePerTask, estimatedHoursPerTask: simLead.estimatedHoursPerTask, tasksPerWeek: simLead.tasksPerWeek };
      }
      finalSimInput = {
        name: simLead.name,
        mode: simLead.mode,
        params,
        growthPotential: 3,
        paymentReliability: 3
      };
    }

    onComplete({
      weeklyCapacity,
      adminHours,
      clients,
      stressLevel,
      focusedHoursPerDay,
      simInput: finalSimInput
    });
  };

  const totalAddedClientHours = clients.reduce((sum, c) => sum + (c.plannedWeeklyHours || 0), 0);
  const totalAddedClientEarnings = clients.reduce((sum, c) => sum + (c.weeklyIncome || 0), 0);
  const totalSimulatedLeadHours = simulateLead ? getPlannedHoursForClient(simLead) : 0;
  const totalSimulatedLeadEarnings = simulateLead ? getPlannedIncomeForClient(simLead) : 0;

  // Next-step validation
  const showNextButton = () => {
    if (step === 3 && clientFormActive) return false;
    return step < totalSteps;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 md:p-8 font-sans transition-all">
      {/* Top Header */}
      <header className="max-w-xl mx-auto w-full pt-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="text-white fill-white" size={16} />
          </div>
          <span className="font-black text-xl text-primary tracking-tighter">Caply</span>
        </div>
        <div className="text-xs font-bold text-outline uppercase tracking-wider bg-surface px-3 py-1 rounded-full border border-primary/5">
          Step {step} of {totalSteps}
        </div>
      </header>

      {/* Main Form Area */}
      <main className="max-w-xl mx-auto w-full my-auto py-8">
        {/* Progress horizontal indicator */}
        <div className="h-1 bg-surface-container rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8 text-center"
            >
              <div className="space-y-4">
                <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-2 animate-bounce">
                  <Activity size={40} className="text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight leading-tight">
                  Let’s see if your workload is sustainable.
                </h1>
                <p className="text-base text-outline max-w-sm mx-auto leading-relaxed">
                  Caply acts as a smart freelance business coach. We help you avoid burnout, understand workload distribution, and evaluate if custom client projects are actually profitable.
                </p>
              </div>

              <div className="p-6 bg-white rounded-3xl border border-primary/5 shadow-sm max-w-sm mx-auto space-y-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center font-bold">1</div>
                  <p className="text-xs text-primary font-bold">Define your realistic capacity stamina.</p>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center font-bold">2</div>
                  <p className="text-xs text-primary font-bold">Input client agreements step-by-step.</p>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center font-bold">3</div>
                  <p className="text-xs text-primary font-bold">Receive a personalized blueprint dashboard.</p>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full max-w-xs bg-primary text-white py-4 px-8 rounded-2xl font-bold hover:scale-105 hover:shadow-xl hover:shadow-primary/10 transition-all flex items-center justify-center gap-2 mx-auto shadow-md"
              >
                Start My Capacity Check
                <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-secondary bg-secondary/5 px-2.5 py-1 rounded-full border border-secondary/10">Availability Stamina</span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-primary tracking-tight">Weekly Capacity Setup</h1>
                <p className="text-xs text-outline">How much of your weekly schedule is dedicated to billable efforts versus freelance admin duties?</p>
              </div>

              <div className="space-y-8 bg-white p-6 md:p-8 rounded-3xl border border-primary/5 shadow-sm">
                {/* Desired Hours */}
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <label className="text-sm font-bold text-primary">Target total hours per week</label>
                    <span className="text-xl font-black text-primary">{weeklyCapacity} hrs</span>
                  </div>
                  <input 
                    type="range"
                    min="10"
                    max="80"
                    step="1"
                    value={weeklyCapacity}
                    onChange={(e) => setWeeklyCapacity(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-outline font-medium">
                    <span>10 hrs (Part-Time)</span>
                    <span>40 hrs (Full-Time)</span>
                    <span>80 hrs (Hustle Max)</span>
                  </div>
                </div>

                {/* Admin Hours */}
                <div className="space-y-3 pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-baseline">
                    <label className="text-sm font-bold text-primary">Unpaid work weekly overhead</label>
                    <span className="text-xl font-black text-secondary">{adminHours} hrs</span>
                  </div>
                  <p className="text-[11px] text-outline italic leading-normal">Hours you spend on proposals, invoices, administrative emails, meetings, and unpaid client overhead.</p>
                  <input 
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={adminHours}
                    onChange={(e) => setAdminHours(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-secondary"
                  />
                  <div className="flex justify-between text-[10px] text-outline font-medium">
                    <span>0 hours</span>
                    <span>15 hours (Standard)</span>
                    <span>30 hours (Extreme overhead)</span>
                  </div>
                </div>

                {/* Billable Runway Visual Indicator */}
                <div className="bg-primary/[0.03] p-4 rounded-2xl border border-primary/5 flex items-center justify-between mt-2">
                  <div>
                    <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">Your Billable Runway</span>
                    <span className="text-xs text-primary leading-snug">The actual hours left of your schedule that can be billed to clients:</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-primary">{Math.max(0, weeklyCapacity - adminHours)}h</span>
                    <span className="text-[10px] text-outline block">available / week</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 py-4 text-sm font-bold text-outline hover:text-primary transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg hover:opacity-90 hover:scale-[1.01] transition-all flex items-center justify-center gap-1"
                >
                  Configure Clients
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#06696a] bg-[#06696a]/5 px-2.5 py-1 rounded-full border border-[#06696a]/10">Portfolio Builder</span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-primary tracking-tight">Active Engagements</h1>
                <p className="text-xs text-outline">Let's register your active client agreements one by one to check details without spreadsheet stress.</p>
              </div>

              {/* Added clients portfolio visual stack */}
              {clients.length > 0 && (
                <div className="space-y-2 max-h-[180px] overflow-y-auto no-scrollbar py-1">
                  {clients.map((c: any) => (
                    <div key={c.id} className="bg-white p-3.5 rounded-2xl border border-primary/5 shadow-sm flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary/5 text-primary font-black text-xs flex items-center justify-center">
                          {c.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-primary">{c.name}</p>
                          <p className="text-[10px] text-outline uppercase tracking-wider">{c.mode} &bull; {c.plannedWeeklyHours} hrs</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-xs text-[#06696a]">{symbol}{c.weeklyIncome}/wk</span>
                        <button
                          onClick={() => removeClientInstance(c.id!)}
                          className="text-outline/40 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Miniature Sum Alert */}
                  <div className="p-3 bg-slate-100 rounded-xl flex justify-between items-center text-[11px] font-bold text-outline">
                    <span>Roster sum: {clients.length} engagements</span>
                    <span>Total {totalAddedClientHours}h &bull; {symbol}{totalAddedClientEarnings}/wk</span>
                  </div>
                </div>
              )}

              {clientFormActive ? (
                <div className="bg-white p-6 rounded-3xl border-2 border-primary/15 shadow-md space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-primary animate-pulse" /> Add Active Client
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">Company / client name</label>
                      <input 
                        type="text" 
                        value={tempClient.name}
                        onChange={(e) => setTempClient({ ...tempClient, name: e.target.value })}
                        placeholder="e.g. Acme Corp"
                        className="w-full bg-slate-50 border border-primary/5 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">Agreement Billing Mode</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['hourly', 'daily', 'task'] as PricingMode[]).map(mode => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setTempClient({ ...tempClient, mode })}
                            className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all border ${
                              tempClient.mode === mode 
                                ? 'bg-primary text-white border-primary shadow-sm' 
                                : 'bg-slate-50 text-outline border-slate-100 hover:bg-slate-100'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    {tempClient.mode === 'hourly' && (
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-bold text-outline mb-1">Raw rate ({symbol}/hr)</label>
                          <input 
                            type="number"
                            value={tempClient.hourlyRate}
                            onChange={(e) => setTempClient({ ...tempClient, hourlyRate: Number(e.target.value) })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-outline mb-1">Expected hrs / wk</label>
                          <input 
                            type="number"
                            value={tempClient.expectedHoursPerWeek}
                            onChange={(e) => setTempClient({ ...tempClient, expectedHoursPerWeek: Number(e.target.value) })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                    )}

                    {tempClient.mode === 'daily' && (
                      <div className="grid grid-cols-3 gap-2 pt-1 font-sans">
                        <div>
                          <label className="block text-[10px] font-bold text-outline mb-1">Day Rate ({symbol})</label>
                          <input 
                            type="number"
                            value={tempClient.dayRate}
                            onChange={(e) => setTempClient({ ...tempClient, dayRate: Number(e.target.value) })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-1.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-outline mb-1">Days / wk</label>
                          <input 
                            type="number"
                            value={tempClient.daysPerWeek}
                            onChange={(e) => setTempClient({ ...tempClient, daysPerWeek: Number(e.target.value) })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-1.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-outline mb-1">Hrs / day</label>
                          <input 
                            type="number"
                            value={tempClient.hoursPerDay}
                            onChange={(e) => setTempClient({ ...tempClient, hoursPerDay: Number(e.target.value) })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-1.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                    )}

                    {tempClient.mode === 'task' && (
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <div>
                          <label className="block text-[10px] font-bold text-outline mb-1">{symbol} / Task</label>
                          <input 
                            type="number"
                            value={tempClient.pricePerTask}
                            onChange={(e) => setTempClient({ ...tempClient, pricePerTask: Number(e.target.value) })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-1.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-outline mb-1">Hrs / Task</label>
                          <input 
                            type="number"
                            value={tempClient.estimatedHoursPerTask}
                            onChange={(e) => setTempClient({ ...tempClient, estimatedHoursPerTask: Number(e.target.value) })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-1.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-outline mb-1">Tasks / wk</label>
                          <input 
                            type="number"
                            value={tempClient.tasksPerWeek}
                            onChange={(e) => setTempClient({ ...tempClient, tasksPerWeek: Number(e.target.value) })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-1.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button 
                      type="button"
                      onClick={() => setClientFormActive(false)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold text-outline hover:bg-slate-50 border border-slate-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button"
                      onClick={addTempClient}
                      disabled={!tempClient.name.trim()}
                      className="flex-1 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-1"
                    >
                      <Plus size={14} />
                      Save Engagement
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setClientFormActive(true)}
                  className="w-full bg-white p-8 rounded-3xl border-2 border-dashed border-primary/20 hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-3 group text-center"
                >
                  <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Plus size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-primary">Register active client</h3>
                    <p className="text-[11px] text-outline mt-0.5">Let's map workload against weekly stamina limit.</p>
                  </div>
                </button>
              )}

              {clients.length === 0 && !clientFormActive && (
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 flex gap-3 text-xs leading-normal text-amber-800">
                  <AlertCircle size={18} className="flex-shrink-0 text-amber-600" />
                  <p>You don't need to add clients if you're completely starting fresh. You can proceed directly and add dummy or simulated engagements on the next step!</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="w-1/3 py-4 text-sm font-bold text-outline hover:text-primary transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg hover:opacity-90 hover:scale-[1.01] transition-all flex items-center justify-center gap-1"
                >
                  Stamina & Energy Check
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">Coach Insight</span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-primary tracking-tight">Energy & Burnout Intake</h1>
                <p className="text-xs text-outline">Freelancing is a test of energy leverage. Tell us about your stamina & how relaxed your schedule currently averages.</p>
              </div>

              <div className="space-y-6 bg-white p-6 md:p-8 rounded-3xl border border-primary/5 shadow-sm">
                {/* Stress Level Select */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-primary block">How stressed do you currently feel?</label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { id: 'low', emoji: '😌', title: 'Calm & relaxed', desc: 'Workload is light or perfect. Full breathing room.' },
                      { id: 'medium', emoji: '😅', title: 'Pushed but okay', desc: 'Busy weeks, but managing tasks effectively.' },
                      { id: 'high', emoji: '🤯', title: 'Feeling the squeeze', desc: 'Close to panic. Admin overload, no break time.' },
                      { id: 'critical', emoji: '🚨', title: 'Extreme burnout alert', desc: 'Exhausted. Client exhaustion is critical.' }
                    ].map(st => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setStressLevel(st.id)}
                        className={`p-4 rounded-2xl text-left border transition-all flex gap-3.5 ${
                          stressLevel === st.id 
                            ? 'border-primary bg-primary/[0.02] ring-1 ring-primary' 
                            : 'border-slate-100 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-2xl mt-0.5">{st.emoji}</span>
                        <div>
                          <p className="font-bold text-xs text-primary leading-tight">{st.title}</p>
                          <p className="text-[10px] text-outline mt-1 leading-normal">{st.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Focus hours limit daily */}
                <div className="space-y-3 pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-baseline">
                    <label className="text-sm font-bold text-primary">Focused deep work stamina daily</label>
                    <span className="text-base font-black text-primary">{focusedHoursPerDay} hours / day</span>
                  </div>
                  <p className="text-[11px] text-outline leading-snug">Average productive creative code/writing/design hours you can support before attention span declines.</p>
                  
                  <input 
                    type="range"
                    min="2"
                    max="12"
                    step="1"
                    value={focusedHoursPerDay}
                    onChange={(e) => setFocusedHoursPerDay(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-outline font-medium">
                    <span>2 hours limit</span>
                    <span>6 hours standard</span>
                    <span>12 hours extreme</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(3)}
                  className="w-1/3 py-4 text-sm font-bold text-outline hover:text-primary transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg hover:opacity-90 hover:scale-[1.01] transition-all flex items-center justify-center gap-1"
                >
                  Run Lead Simulation
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#06696a] bg-[#06696a]/5 px-2.5 py-1 rounded-full border border-[#06696a]/10">Decision Engine</span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-primary tracking-tight">Smart Lead Simulation</h1>
                <p className="text-xs text-outline">What happens if you take on that incoming project lead floating around your thoughts?</p>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-3xl border border-primary/5 shadow-sm space-y-6">
                <div className="flex items-center justify-between p-1 bg-slate-100 rounded-2xl border border-slate-200">
                  <button 
                    type="button"
                    onClick={() => setSimulateLead(false)}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                      !simulateLead ? 'bg-white text-primary shadow-sm' : 'text-outline hover:text-primary'
                    }`}
                  >
                    Skip Simulator
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setSimulateLead(true);
                      if (!simLead.name) {
                        setSimLead(prev => ({ ...prev, name: 'Project Apex' }));
                      }
                    }}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
                      simulateLead ? 'bg-primary text-white shadow-sm' : 'text-outline hover:text-primary'
                    }`}
                  >
                    <Zap size={13} className={simulateLead ? 'fill-white' : ''} /> Simulate Project Impact
                  </button>
                </div>

                {simulateLead && (
                  <div className="space-y-4 pt-2 border-t border-slate-100 animate-in fade-in duration-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-primary mb-1">Lead Name</label>
                        <input 
                          type="text" 
                          value={simLead.name}
                          onChange={(e) => setSimLead({ ...simLead, name: e.target.value })}
                          placeholder="e.g. Dream Venture"
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-primary mb-1">Billing model</label>
                        <select
                          value={simLead.mode}
                          onChange={(e) => setSimLead({ ...simLead, mode: e.target.value as PricingMode })}
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                          <option value="task">Value-Task</option>
                        </select>
                      </div>
                    </div>

                    {simLead.mode === 'hourly' && (
                      <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-3 rounded-2xl">
                        <div>
                          <label className="block text-[10px] font-bold text-outline mb-1">Estimated Rate ({symbol}/h)</label>
                          <input 
                            type="number"
                            value={simLead.hourlyRate}
                            onChange={(e) => setSimLead({ ...simLead, hourlyRate: Number(e.target.value) })}
                            className="w-full bg-white border border-slate-100 rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-outline mb-1">Workload (hours/wk)</label>
                          <input 
                            type="number"
                            value={simLead.expectedHoursPerWeek}
                            onChange={(e) => setSimLead({ ...simLead, expectedHoursPerWeek: Number(e.target.value) })}
                            className="w-full bg-white border border-slate-100 rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {simLead.mode === 'daily' && (
                      <div className="grid grid-cols-3 gap-2 bg-slate-50/50 p-3 rounded-2xl">
                        <div>
                          <label className="block text-[10px] font-bold text-outline mb-1">Day rate ({symbol})</label>
                          <input 
                            type="number"
                            value={simLead.dayRate}
                            onChange={(e) => setSimLead({ ...simLead, dayRate: Number(e.target.value) })}
                            className="w-full bg-white border border-slate-100 rounded-xl px-2 py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-outline mb-1">Days / wk</label>
                          <input 
                            type="number"
                            value={simLead.daysPerWeek}
                            onChange={(e) => setSimLead({ ...simLead, daysPerWeek: Number(e.target.value) })}
                            className="w-full bg-white border border-slate-100 rounded-xl px-2 py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-outline mb-1">Hrs / day</label>
                          <input 
                            type="number"
                            value={simLead.hoursPerDay}
                            onChange={(e) => setSimLead({ ...simLead, hoursPerDay: Number(e.target.value) })}
                            className="w-full bg-white border border-slate-100 rounded-xl px-2 py-2 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {simLead.mode === 'task' && (
                      <div className="grid grid-cols-3 gap-2 bg-slate-50/50 p-3 rounded-2xl">
                        <div>
                          <label className="block text-[10px] font-bold text-outline mb-1">Price / Task ({symbol})</label>
                          <input 
                            type="number"
                            value={simLead.pricePerTask}
                            onChange={(e) => setSimLead({ ...simLead, pricePerTask: Number(e.target.value) })}
                            className="w-full bg-white border border-slate-100 rounded-xl px-1.5 py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-outline mb-1">Hrs / Task</label>
                          <input 
                            type="number"
                            value={simLead.estimatedHoursPerTask}
                            onChange={(e) => setSimLead({ ...simLead, estimatedHoursPerTask: Number(e.target.value) })}
                            className="w-full bg-white border border-slate-100 rounded-xl px-1.5 py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-outline mb-1">Tasks / wk</label>
                          <input 
                            type="number"
                            value={simLead.tasksPerWeek}
                            onChange={(e) => setSimLead({ ...simLead, tasksPerWeek: Number(e.target.value) })}
                            className="w-full bg-white border border-slate-100 rounded-xl px-1.5 py-2 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* Coach Live Advice inside step */}
                    {getPlannedHoursForClient(simLead) > 0 && (
                      <div className="bg-slate-50 p-4 rounded-2xl border border-dotted border-primary/10 flex gap-3 text-xs leading-normal">
                        <Coins className="text-secondary flex-shrink-0 animate-bounce mt-0.5" size={16} />
                        <div>
                          <p className="font-bold text-primary">Simulated Roster Shift Impact</p>
                          <p className="text-outline text-[11px] mt-0.5">
                            Total workload rises from <strong>{totalAddedClientHours}h</strong> to <strong>{totalAddedClientHours + totalSimulatedLeadHours} hrs / week</strong>.
                          </p>
                          <p className="text-outline text-[11px]">
                            Total revenue paces up to <strong>{symbol}{totalAddedClientEarnings + totalSimulatedLeadEarnings} / week</strong>.
                          </p>
                          
                          {totalAddedClientHours + totalSimulatedLeadHours > weeklyCapacity ? (
                            <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              <AlertCircle size={10} /> Overbooking alert (+{(totalAddedClientHours + totalSimulatedLeadHours - weeklyCapacity).toFixed(1)} hrs overlimit)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              <CheckCircle2 size={10} /> Completely Sustainable!
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!simulateLead && (
                  <div className="py-6 text-center space-y-2">
                    <Zap size={24} className="text-outline/30 mx-auto" />
                    <p className="text-xs font-bold text-primary">Simulating leads prevents roster chaos.</p>
                    <p className="text-[10px] text-outline max-w-xs mx-auto">Skip if you just want to see your dashboard baseline. You can simulate leads inside the decision drawer anytime later!</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(4)}
                  className="w-1/3 py-4 text-sm font-bold text-outline hover:text-primary transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  onClick={() => setStep(6)}
                  className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg hover:opacity-90 hover:scale-[1.01] transition-all flex items-center justify-center gap-1"
                >
                  Build My Blueprint
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 text-center"
            >
              <div className="space-y-3">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
                  <CheckCircle2 className="text-emerald-500" size={32} />
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-primary tracking-tight">Your Coach Blueprint is Ready!</h1>
                <p className="text-xs text-outline max-w-sm mx-auto">We've mapped your availability, processed unpaid admin overhead, and calculated your active client risk baseline.</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-primary/5 shadow-sm space-y-4 max-w-sm mx-auto text-left text-xs divide-y divide-slate-100">
                <div className="flex justify-between items-center py-2">
                  <span className="text-outline">Realistic Capacity Limit:</span>
                  <span className="font-extrabold text-primary">{weeklyCapacity} hrs/wk</span>
                </div>
                <div className="flex justify-between items-center py-2 pt-1">
                  <span className="text-outline">Unpaid Admin Deficit:</span>
                  <span className="font-extrabold text-secondary">-{adminHours} hrs/wk</span>
                </div>
                <div className="flex justify-between items-center py-2 pt-1">
                  <span className="text-outline">Active Client Engagements:</span>
                  <span className="font-extrabold text-[#06696a]">{clients.length} added</span>
                </div>
                <div className="flex justify-between items-center py-2 pt-1">
                  <span className="text-outline">Current Stress Stamina:</span>
                  <span className="font-extrabold text-amber-600 capitalize">{stressLevel} stress</span>
                </div>
                <div className="flex justify-between items-center py-2 pt-1">
                  <span className="text-outline">Tracked Core Workload:</span>
                  <span className="font-extrabold text-primary">{totalAddedClientHours} hrs/wk</span>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="w-full max-w-xs bg-primary text-white py-4 px-6 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all text-sm tracking-wide mx-auto block"
              >
                See My Personalized Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer step indicators */}
      <footer className="text-center text-[10px] text-outline font-medium pt-4 border-t border-slate-100 max-w-xl mx-auto w-full">
        Caply &copy; All data saved locally on your browser.
      </footer>
    </div>
  );
};
