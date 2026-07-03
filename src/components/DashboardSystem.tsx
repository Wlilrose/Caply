import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Users, 
  Zap, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  ArrowRight, 
  Download, 
  Activity, 
  ShieldCheck, 
  Sliders, 
  Heart,
  TrendingDown,
  LineChart,
  PieChart as PieIcon,
  HelpCircle,
  Trash2,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend
} from 'recharts';
import { Client, CapacityStatus, TimeLog } from '../types.ts';

interface DashboardSystemProps {
  clients: Client[];
  stats: CapacityStatus;
  logs: TimeLog[];
  totalCapacity: number;
  adminHours: number;
  stressLevel: string;
  focusedHoursPerDay: number;
  currency: string;
  symbol: string;
  formatCurrency: (val: number) => string;
  formatNumber: (val: number) => string;
  isPremiumInitial: boolean;
  onUpgradeStateChange?: (val: boolean) => void;
  onRestartSetup: () => void;

  onOpenAddClient?: () => void;
  onOpenLogWork?: () => void;
  onOpenSimulation?: () => void;
  onOpenCapacity?: () => void;
  onEditClient?: (client: Client) => void;
  onRemoveClient?: (id: string) => void;
  onEditLog?: (log: TimeLog) => void;
  onRemoveLog?: (id: string) => void;
}

export const DashboardSystem: React.FC<DashboardSystemProps> = ({
  clients,
  stats,
  logs,
  totalCapacity,
  adminHours,
  stressLevel,
  focusedHoursPerDay,
  currency,
  symbol,
  formatCurrency,
  formatNumber,
  isPremiumInitial,
  onUpgradeStateChange,
  onRestartSetup,
  onOpenAddClient,
  onOpenLogWork,
  onOpenSimulation,
  onOpenCapacity,
  onEditClient,
  onRemoveClient,
  onEditLog,
  onRemoveLog
}) => {
  const [isPremium, setIsPremium] = useState<boolean>(isPremiumInitial);

  // Active Premium view tab (to toggle between different premium sub-dashboards)
  const [premiumTab, setPremiumTab] = useState<'analytics' | 'profitability' | 'burnout' | 'simulations'>('analytics');

  // Interactive free simulation state
  const [freeSimHours, setFreeSimHours] = useState<number>(10);
  const [freeSimPay, setFreeSimPay] = useState<number>(1000);

  // Interactive premium rate change simulation state
  const [targetClientIdToChange, setTargetClientIdToChange] = useState<string>('');
  const [rateChangePercent, setRateChangePercent] = useState<number>(15);

  const togglePremium = (val: boolean) => {
    setIsPremium(val);
    if (onUpgradeStateChange) {
      onUpgradeStateChange(val);
    }
  };

  // -------------------------------------------------------------
  // CALCULATIONS & FORMULAS (REAL SAAS DATA ENGINES)
  // -------------------------------------------------------------

  const overallCoreWorkload = useMemo(() => {
    const plannedWeeklyHours = clients.reduce((sum, c) => sum + (c.plannedWeeklyHours || 0), 0);
    return plannedWeeklyHours + adminHours;
  }, [clients, adminHours]);

  const utilizationPercentage = useMemo(() => {
    return Math.round((overallCoreWorkload / (totalCapacity || 1)) * 100);
  }, [overallCoreWorkload, totalCapacity]);

  // Capacity Category Guidance Labels
  const capacityMessage = useMemo(() => {
    if (utilizationPercentage > 105) {
      return {
        label: 'Overloaded',
        desc: '“You are close to burnout territory. Schedule immediate audits.”',
        color: 'text-red-500 bg-red-500/10 border-red-500/30',
        barColor: 'bg-red-500',
        advice: 'You have exceeded your stamina limit. Consider raising active client rates by 15-20% to offload lower-tier tasks, or request timeline extensions.'
      };
    } else if (utilizationPercentage >= 90) {
      return {
        label: 'Near Capacity',
        desc: '“At your limits. Consider setting a strict no-overtime boundaries buffer.”',
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
        barColor: 'bg-amber-500',
        advice: 'You have limited focus reserve. Avoid committing to new weekly check-ins without pausing current operational deliverables.'
      };
    } else if (utilizationPercentage >= 60) {
      return {
        label: 'Balanced',
        desc: '“Your workload is beautifully balanced. High strategic output is sustainable.”',
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
        barColor: 'bg-emerald-500',
        advice: 'Amazing baseline control! Your roster yields fantastic income margins with appropriate administrative buffer hours.'
      };
    } else {
      return {
        label: 'Underloaded',
        desc: '“You still have room for one small client or medium project!”',
        color: 'text-[#06696a] bg-[#06696a]/10 border-[#06696a]/30',
        barColor: 'bg-[#06696a]',
        advice: 'You are operating below your stamina target. Run simulated rate projections to target high-ticket clients or focus on inbound generation.'
      };
    }
  }, [utilizationPercentage]);

  // Free Simulation Results
  const freeSimOutput = useMemo(() => {
    const newHours = overallCoreWorkload + Number(freeSimHours || 0);
    const newUtil = Math.round((newHours / (totalCapacity || 1)) * 100);
    const newRemaining = totalCapacity - newHours;
    
    let risk: 'Low' | 'Medium' | 'High' | 'Overloaded' = 'Low';
    let color = 'text-emerald-500';
    if (newUtil > 100) {
      risk = 'Overloaded';
      color = 'text-red-500';
    } else if (newUtil >= 90) {
      risk = 'High';
      color = 'text-amber-500';
    } else if (newUtil >= 60) {
      risk = 'Medium';
      color = 'text-[#06696a]';
    }

    return {
      newHours,
      newUtil,
      risk,
      color,
      newRemaining,
      projectedIncome: stats.totalWeeklyIncome + Number(freeSimPay || 0)
    };
  }, [overallCoreWorkload, totalCapacity, freeSimHours, freeSimPay, stats.totalWeeklyIncome]);

  // Client Profitability Analysis Metrics (Premium Engine)
  const profitabilityAnalysis = useMemo(() => {
    if (clients.length === 0) return null;

    const analyzed = clients.map(client => {
      // Profitability Score based on effective hourly rate vs benchmark rate ($120/hr)
      const prRate = client.effectiveHourlyRate;
      const ratePoints = Math.min((prRate / 120) * 50, 50); // max 50 points
      const growthPoints = (client.growthPotential / 5) * 25; // max 25 points
      const reliabilityPoints = (client.paymentReliability / 5) * 25; // max 25 points
      const profitabilityScore = Math.round(ratePoints + growthPoints + reliabilityPoints);

      // Energy Impact Score: Dropping score for every hour logged over planned hours
      const overageHours = Math.max(0, client.actualWeeklyHours - client.plannedWeeklyHours);
      const energyImpactScore = Math.max(0, 100 - Math.round(overageHours * 10)); // Lose 10 points per overbooked hour

      return {
        ...client,
        profitabilityScore,
        energyImpactScore,
        paymentReliabilityScore: client.paymentReliability * 20 // 1-5 to percentage
      };
    });

    // Find Most Profitable Client (highest hourly rate)
    const sortedByRate = [...analyzed].sort((a, b) => b.effectiveHourlyRate - a.effectiveHourlyRate);
    const mostProfitable = sortedByRate[0];

    // Find Lowest ROI Client (lowest effective hourly rate)
    const sortedByROI = [...analyzed].sort((a, b) => a.effectiveHourlyRate - b.effectiveHourlyRate);
    const lowestROI = sortedByROI[0];

    // Find Hidden Time Drains (client with largest positive actual vs planned discrepancy)
    const sortedByDrain = [...analyzed].sort((a, b) => {
      const drainA = a.actualWeeklyHours - a.plannedWeeklyHours;
      const drainB = b.actualWeeklyHours - b.plannedWeeklyHours;
      return drainB - drainA;
    });
    const hiddenTimeDrain = sortedByDrain[0].actualWeeklyHours > sortedByDrain[0].plannedWeeklyHours ? sortedByDrain[0] : null;

    return {
      clients: analyzed,
      mostProfitable,
      lowestROI,
      hiddenTimeDrain
    };
  }, [clients]);

  // Burnout Forecast Engine (Premium Engine)
  const burnoutForecast = useMemo(() => {
    const historicalTotalHours = logs.length > 0 ? logs.reduce((sum, l) => sum + l.hours, 0) : 0;
    
    // Create simple trends
    let weeksOfOverloadBeforeBurnout = 3;
    let longTermSustainabilityScore = 85; // 0 to 100

    if (utilizationPercentage > 100) {
      longTermSustainabilityScore = Math.max(15, 100 - (utilizationPercentage - 100) * 2.5 - (stressLevel === 'critical' ? 30 : 15));
      weeksOfOverloadBeforeBurnout = stressLevel === 'critical' ? 1 : 2;
    } else if (utilizationPercentage >= 90) {
      longTermSustainabilityScore = Math.max(45, 95 - (stressLevel === 'high' ? 25 : 10));
      weeksOfOverloadBeforeBurnout = 4;
    } else {
      longTermSustainabilityScore = Math.min(100, 100 - (stressLevel === 'low' ? 0 : 10));
      weeksOfOverloadBeforeBurnout = 12; // stable
    }

    return {
      sustainabilityScore: longTermSustainabilityScore,
      weeksBeforeCollapse: weeksOfOverloadBeforeBurnout,
      riskLevel: utilizationPercentage > 100 ? 'Severe' : utilizationPercentage >= 90 ? 'Elevated' : 'Stable',
      statusMessage: utilizationPercentage > 100 
        ? `“At this current pace, you might hit physical or mental fatigue within ${weeksOfOverloadBeforeBurnout} ${weeksOfOverloadBeforeBurnout === 1 ? 'week' : 'weeks'}. ACTION CRITICAL.”`
        : utilizationPercentage >= 90 
        ? `“Your high utilization levels indicate possible early burnout warning signs. Pace yourself.”`
        : '“Stable configuration. Keep protecting your recovery blocks.”'
    };
  }, [utilizationPercentage, stressLevel, logs]);

  // AI Strategic Coach Recommendations (Premium Engine)
  const aiRecommendations = useMemo(() => {
    const recs: Array<{ id: string; category: string; text: string; action: string }> = [];

    if (clients.length === 0) {
      recs.push({
        id: 'no_clients',
        category: 'Roster Expansion',
        text: 'You have no registered client commitments. Add your baseline agreements to synthesize strategic advice.',
        action: 'Go to Clients tab'
      });
      return recs;
    }

    // 1. Check underpricing high-effort task clients
    clients.forEach(c => {
      if (c.effectiveHourlyRate < 50 && c.plannedWeeklyHours > 12) {
        recs.push({
          id: `price_${c.id}`,
          category: 'Pricing Strategy',
          text: `You are underpricing your workload on client "${c.name}". Working ${c.plannedWeeklyHours}h/wk at effective ${symbol}${c.effectiveHourlyRate.toFixed(0)}/h is a major time tax.`,
          action: `Initiate a 15% rate raise simulation`
        });
      }
    });

    // 2. Check actual overage time leakages
    if (profitabilityAnalysis?.hiddenTimeDrain) {
      const drain = profitabilityAnalysis.hiddenTimeDrain;
      const hoursDiff = drain.actualWeeklyHours - drain.plannedWeeklyHours;
      recs.push({
        id: 'leakage',
        category: 'Scope Control',
        text: `Client "${drain.name}" is leaking unpaid scope! You logged +${hoursDiff.toFixed(1)}/hrs above plan this week without custom premium logs.`,
        action: 'Lock baseline revisions'
      });
    }

    // 3. Overall capacity recommendation
    if (utilizationPercentage < 60) {
      recs.push({
        id: 'room',
        category: 'Capacity Growth',
        text: `You are highly underloaded. You possess stable energy runway to safely accept one medium-sized project (${totalCapacity - overallCoreWorkload}h/wk max).`,
        action: 'Simulate high-ticket client'
      });
    } else if (utilizationPercentage > 100) {
      recs.push({
        id: 'overload',
        category: 'Burnout Squeeze',
        text: 'Your calendar is overbooked. We recommend offloading or pausing work with your lowest-scoring client immediately.',
        action: 'Audit portfolio value scores'
      });
    }

    // Default general advice if roster is in perfect balance
    if (recs.length === 0) {
      recs.push({
        id: 'perfect',
        category: 'Systems Mastery',
        text: 'Your current operational layout is ideal. Maximize value by documenting deliverables and setting boundaries.',
        action: 'Keep doing great work'
      });
    }

    return recs;
  }, [clients, profitabilityAnalysis, utilizationPercentage, symbol, totalCapacity, overallCoreWorkload]);

  // Premium Simulations Calculations
  const defaultSelectedClient = clients.length > 0 ? clients[0].id : '';
  const currentSimTargetClient = targetClientIdToChange || defaultSelectedClient;
  const simTargetClientData = clients.find(c => c.id === currentSimTargetClient);

  const premiumSimulationResult = useMemo(() => {
    if (!simTargetClientData) return null;

    const oldIncome = simTargetClientData.weeklyIncome;
    const oldRate = simTargetClientData.effectiveHourlyRate;
    
    // Projected Rate
    const newRate = oldRate * (1 + rateChangePercent / 100);
    const newWeeklyIncome = simTargetClientData.plannedWeeklyHours * newRate;
    const difference = newWeeklyIncome - oldIncome;

    return {
      clientName: simTargetClientData.name,
      oldRate,
      newRate,
      oldIncome,
      newWeeklyIncome,
      difference,
      allProjectedPortfolioIncome: stats.totalWeeklyIncome + difference
    };
  }, [simTargetClientData, rateChangePercent, stats.totalWeeklyIncome]);

  // -------------------------------------------------------------
  // DUMMY DATA FOR CHARTS IF EMPTY HISTORICAL TRENDS
  // -------------------------------------------------------------
  const historicalTrendMockData = [
    { name: 'Wk 1', income: stats.totalWeeklyIncome * 0.8, workload: utilizationPercentage * 0.9 },
    { name: 'Wk 2', income: stats.totalWeeklyIncome * 0.95, workload: utilizationPercentage * 0.85 },
    { name: 'Wk 3', income: stats.totalWeeklyIncome * 0.9, workload: utilizationPercentage * 0.95 },
    { name: 'Wk 4', income: stats.totalWeeklyIncome, workload: utilizationPercentage }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      
      {/* Redesigned Premium Header with active/sandbox plans. Friendly, supportive SaaS tone */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-primary tracking-tight flex items-center gap-2">
            Caply Redesigned System
            <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
              V2 Engine
            </span>
          </h2>
          <p className="text-outline text-xs">
            An intelligent, emotionally healthy business operating system for freelancers.
          </p>
        </div>

        {/* Free vs Premium Plan Mode Switcher (Perfect for experiencing both states easily!) */}
        <div className="bg-surface-container border border-primary/10 p-1 rounded-2xl flex items-center shadow-inner self-start md:self-auto">
          <button
            onClick={() => togglePremium(false)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              !isPremium 
                ? 'bg-white text-primary shadow-md' 
                : 'text-outline/70 hover:text-primary'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Free Plan View
          </button>
          <button
            onClick={() => togglePremium(true)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isPremium 
                ? 'bg-[#06696a] text-white shadow-md' 
                : 'text-outline/70 hover:text-primary'
            }`}
          >
            <Sparkles size={13} className="text-amber-400 fill-amber-400 animate-pulse" />
            Premium Business Pro
          </button>
        </div>
      </header>

      {/* Primary Coach Banner */}
      <div className={`p-6 rounded-3xl border shadow-xs transition-all duration-300 flex flex-col md:flex-row gap-5 items-start bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent border-primary/10`}>
        <div className="w-12 h-12 rounded-2xl bg-[#06696a]/10 text-[#06696a] flex items-center justify-center flex-shrink-0">
          <Zap className="fill-current" size={24} />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="font-extrabold text-sm uppercase tracking-wide text-primary">
              Systems Workload Strategy Check
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black tracking-widest ${capacityMessage.color}`}>
              {capacityMessage.label}
            </span>
          </div>
          <p className="text-xs text-outline/90 leading-relaxed font-medium">
            {capacityMessage.desc} {capacityMessage.advice}
          </p>
        </div>
      </div>

      {/* Quick Interactive Actions Panel */}
      <div className="bg-white rounded-3xl p-6 border border-primary/5 shadow-sm space-y-4" id="dashboard-quick-actions">
        <div>
          <h3 className="text-xs font-black text-primary uppercase tracking-wide">Quick Assistant Actions</h3>
          <p className="text-[10px] text-outline">Conversational workflow accelerators</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button 
            type="button"
            onClick={onOpenAddClient}
            className="flex flex-col items-center justify-center p-4 bg-primary/[0.03] border border-primary/10 rounded-2xl hover:bg-primary hover:text-white transition-all group cursor-pointer text-center"
            id="qa-add-client-btn"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-white/10 group-hover:text-white transition-all mb-2.5">
              <Users size={18} />
            </div>
            <span className="font-extrabold text-xs text-primary group-hover:text-white leading-none">Add Client</span>
            <span className="text-[8px] text-outline/80 group-hover:text-white/70 block mt-1">Guided wizard</span>
          </button>

          <button 
            type="button"
            onClick={onOpenLogWork}
            className="flex flex-col items-center justify-center p-4 bg-secondary/[0.03] border border-secondary/10 rounded-2xl hover:bg-secondary hover:text-white transition-all group cursor-pointer text-center"
            id="qa-log-work-btn"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center group-hover:bg-white/10 group-hover:text-white transition-all mb-2.5">
              <Clock size={18} />
            </div>
            <span className="font-extrabold text-xs text-primary group-hover:text-white leading-none">Log Work</span>
            <span className="text-[8px] text-outline/80 group-hover:text-white/70 block mt-1">Assign hours</span>
          </button>

          <button 
            type="button"
            onClick={onOpenSimulation}
            className="flex flex-col items-center justify-center p-4 bg-[#06696a]/[0.03] border border-[#06696a]/15 rounded-2xl hover:bg-[#06696a] hover:text-white transition-all group cursor-pointer text-center"
            id="qa-run-sim-btn"
          >
            <div className="w-10 h-10 rounded-xl bg-[#06696a]/10 text-[#06696a] flex items-center justify-center group-hover:bg-white/10 group-hover:text-white transition-all mb-2.5">
              <Sparkles size={18} />
            </div>
            <span className="font-extrabold text-xs text-primary group-hover:text-white leading-none">Simulation Match</span>
            <span className="text-[8px] text-outline/80 group-hover:text-white/70 block mt-1">Boundary scan</span>
          </button>

          <button 
            type="button"
            onClick={onOpenCapacity}
            className="flex flex-col items-center justify-center p-4 bg-purple-500/[0.03] border border-purple-500/10 rounded-2xl hover:bg-purple-600 hover:text-white transition-all group cursor-pointer text-center"
            id="qa-calibrate-btn"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:bg-white/10 group-hover:text-white transition-all mb-2.5">
              <Sliders size={18} />
            </div>
            <span className="font-extrabold text-xs text-[#581c87] group-hover:text-white leading-none">Tune Stamina</span>
            <span className="text-[8px] text-outline/80 group-hover:text-white/70 block mt-1">Calibrate caps</span>
          </button>
        </div>
      </div>

      {/* VIEW CONDITIONAL RENDERING */}
      {!isPremium ? (
        // =========================================================================
        // FREE DASHBOARD EXPERIENCE (SIMPLE, IMMEDIATE USEFULNESS, CALM INTEGRATION)
        // =========================================================================
        <div className="space-y-8 animate-in fade-in duration-300">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. CAPACITY STATUS HERO CARD */}
            <div className="bg-white rounded-3xl p-6 border border-primary/5 shadow-sm flex flex-col justify-between space-y-6">
              <div>
                <span className="text-[10px] font-black text-outline uppercase tracking-wider">Capacity Status</span>
                <h3 className="text-2xl font-black text-primary flex items-baseline gap-1.5 mt-1">
                  {utilizationPercentage}% <span className="text-xs text-outline font-medium">utilized</span>
                </h3>
              </div>

              {/* Progress Gauge */}
              <div className="space-y-2">
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${capacityMessage.barColor} transition-all`}
                    style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-outline">
                  <span>Current: {formatNumber(overallCoreWorkload)}h</span>
                  <span>Target Limit: {totalCapacity}h</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                <p className="text-xs text-outline leading-snug">
                  {overallCoreWorkload > totalCapacity ? (
                    <span className="text-red-500 font-bold">You are over capacity by {formatNumber(overallCoreWorkload - totalCapacity)} hrs. Consider pausing proposals.</span>
                  ) : (
                    <span>You have <strong>{formatNumber(totalCapacity - overallCoreWorkload)} hrs</strong> remaining capacity.</span>
                  )}
                </p>
              </div>
            </div>

            {/* 2. WEEKLY INCOME SNAPSHOT */}
            <div className="bg-white rounded-3xl p-6 border border-primary/5 shadow-sm space-y-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-outline uppercase tracking-wider">Weekly Income Comparison</span>
                <div className="flex justify-between items-start mt-2">
                  <div>
                    <p className="text-sm text-outline font-medium">Current Plan Runway</p>
                    <p className="text-2xl font-black text-primary mt-0.5">
                      {symbol}{formatCurrency(stats.totalWeeklyIncome)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-outline font-medium">Est. Realized Actual</p>
                    <p className="text-2xl font-black text-[#06696a] mt-0.5">
                      {symbol}{formatCurrency(stats.actualWeeklyIncome || 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Minimal Graph (Sparkline Trend Simulation) */}
              <div className="h-[70px] w-full bg-slate-50 border border-slate-100/60 rounded-2xl flex items-end justify-between px-6 py-2 overflow-hidden">
                <div className="w-1.5 bg-primary/20 hover:bg-primary rounded-t h-[40%] transition-all" title="Planned" />
                <div className="w-1.5 bg-[#06696a]/20 hover:bg-[#06696a] rounded-t h-[60%] transition-all" title="Logging 1" />
                <div className="w-1.5 bg-primary/30 hover:bg-primary rounded-t h-[50%] transition-all" title="Logging 2" />
                <div className="w-1.5 bg-primary/25 hover:bg-primary rounded-t h-[75%] transition-all" title="Logging 3" />
                <div className="w-1.5 bg-[#06696a] rounded-t h-[90%] transition-all" title="Current Week Estimated" />
              </div>

              <div className="flex justify-between items-center text-[10px] text-outline pt-1">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Planned Base</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#06696a]" /> Actual Est. Revenue</span>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* 3. WORKLOAD BREAKDOWN (SIMPLE SCANNABLE ROSTER TABLE) */}
            <div className="bg-white rounded-3xl p-6 border border-primary/5 shadow-sm space-y-4 md:col-span-2">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-black text-primary uppercase tracking-wider">Client Workload Baseline</h4>
                  <p className="text-[10px] text-outline mt-0.5">Active client contracts and performance tracking.</p>
                </div>
                <span className="text-[9px] font-black bg-slate-100 text-outline px-2 py-0.5 rounded-full">
                  {clients.length} Total
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[9px] uppercase font-black tracking-wider text-outline/50">
                      <th className="py-2">Client</th>
                      <th className="py-2 text-center">Plan Hours</th>
                      <th className="py-2 text-right">Weekly Rate Impact</th>
                      <th className="py-2 text-right pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {clients.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/40">
                        <td className="py-3 font-bold text-primary flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-primary/5 text-primary font-black text-[10px] flex items-center justify-center">
                            {c.name[0]?.toUpperCase()}
                          </div>
                          {c.name}
                        </td>
                        <td className="py-3 text-center text-outline font-semibold">{c.plannedWeeklyHours}h</td>
                        <td className="py-3 text-right font-bold text-primary">
                          {symbol}{formatCurrency(c.weeklyIncome)}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-1 px-1">
                            <button
                              type="button"
                              onClick={() => onEditClient && onEditClient(c)}
                              className="p-1 px-2.5 bg-primary/5 hover:bg-primary hover:text-white rounded-lg text-[9px] tracking-tight font-black uppercase transition-all cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => onRemoveClient && onRemoveClient(c.id)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                              title="Delete Client"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {clients.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-outline text-xs">
                          No active clients. Complete setup or add in your Roster.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. BURNOUT RISK INDICATOR (SIMPLE METER) */}
            <div className="bg-white rounded-3xl p-6 border border-primary/5 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <h4 className="text-xs font-black text-primary uppercase tracking-wider">Burnout Risk Score</h4>
                <p className="text-[10px] text-outline">Energy capacity safety metrics.</p>
              </div>

              {/* Meter */}
              <div className="space-y-3 py-2 text-center">
                <div className="flex justify-center gap-2 items-end">
                  <div className={`w-8 h-10 rounded-md transition-all ${utilizationPercentage < 60 ? 'bg-emerald-500' : 'bg-slate-100'}`} title="Low Risk" />
                  <div className={`w-8 h-12 rounded-md transition-all ${utilizationPercentage >= 60 && utilizationPercentage < 90 ? 'bg-amber-400' : utilizationPercentage >= 90 ? 'bg-amber-400' : 'bg-slate-100'}`} title="Medium Risk" />
                  <div className={`w-8 h-14 rounded-md transition-all ${utilizationPercentage >= 90 ? 'bg-red-500 animate-pulse' : 'bg-slate-100'}`} title="High Risk" />
                </div>
                <div>
                  <span className={`text-base font-black px-3 py-1 rounded-full ${
                    utilizationPercentage >= 90 ? 'text-red-600 bg-red-50' : 
                    utilizationPercentage >= 60 ? 'text-amber-600 bg-amber-50' : 
                    'text-emerald-600 bg-emerald-50'
                  }`}>
                    {utilizationPercentage >= 90 ? 'High risk 🤯' : utilizationPercentage >= 60 ? 'Medium risk 😳' : 'Low risk 😌'}
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-outline text-center leading-normal italic pt-1 border-t border-slate-100">
                {utilizationPercentage >= 90 
                  ? '“At this pacing, overload risk peaks in 2-3 weeks. Consider decluttering tasks.”' 
                  : '“You are pacing in healthy margins. Keep strict work hour limits.”'}
              </div>
            </div>

          </div>

          {/* 5. LIGHTWEIGHT QUICK SIMULATION CARD */}
          <div className="bg-white rounded-3xl p-6 border border-primary/5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                <Sliders size={16} />
              </div>
              <div>
                <h4 className="text-xs font-black text-primary uppercase tracking-wider">What if I add another Client?</h4>
                <p className="text-[10px] text-outline">Simulate immediate workload and revenue consequences.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-[9px] font-black text-outline uppercase tracking-wide mb-1.5">Estimated Weekly Hours</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="range" 
                    min="1" 
                    max="30" 
                    value={freeSimHours} 
                    onChange={e => setFreeSimHours(Number(e.target.value))}
                    className="flex-grow accent-primary"
                  />
                  <span className="font-extrabold text-sm text-primary w-10 text-right">{freeSimHours}h</span>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-outline uppercase tracking-wide mb-1.5">Weekly Pay Impact ({symbol})</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="range" 
                    min="100" 
                    max="5000" 
                    step="50"
                    value={freeSimPay} 
                    onChange={e => setFreeSimPay(Number(e.target.value))}
                    className="flex-grow accent-primary"
                  />
                  <span className="font-extrabold text-sm text-primary w-16 text-right">{symbol}{freeSimPay}</span>
                </div>
              </div>

              {/* Dynamic simulation results visual dashboard */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-around gap-2 text-center">
                <div>
                  <span className="block text-[8px] font-black text-outline uppercase tracking-widest">New Capacity</span>
                  <span className={`text-sm font-black ${freeSimOutput.newUtil > 100 ? 'text-red-500' : 'text-primary'}`}>
                    {freeSimOutput.newUtil}%
                  </span>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div>
                  <span className="block text-[8px] font-black text-outline uppercase tracking-widest">Risk Factor</span>
                  <span className={`text-sm font-black ${freeSimOutput.color}`}>
                    {freeSimOutput.risk}
                  </span>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div>
                  <span className="block text-[8px] font-black text-outline uppercase tracking-widest">New Weekly</span>
                  <span className="text-sm font-black text-secondary">
                    {symbol}{formatCurrency(freeSimOutput.projectedIncome)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* NATURAL TEASER TO LUNCH PREMIUM UPSELL DETAILS INLINE */}
          <section className="bg-gradient-to-br from-[#332e66]/5 via-[#06696a]/5 to-transparent rounded-3xl p-6 border border-primary/10 flex flex-col md:flex-row justify-between items-center gap-6 mt-8 shadow-xs">
            <div className="space-y-1.5 flex-1">
              <span className="text-[10px] font-black text-[#06696a] uppercase tracking-widest flex items-center gap-1">
                <Sparkles size={11} className="fill-current animate-pulse" />
                Experience Caply Premium Sandbox mode
              </span>
              <h3 className="text-lg font-black text-primary tracking-tight">
                Unlock advanced intelligence, metrics, and risk models
              </h3>
              <p className="text-xs text-outline/85 max-w-2xl leading-normal">
                Discover which client drains your daily energy reserves, map historical monthly burnouts, run rate changes forecasting models, and generate printable business reports automatically.
              </p>
            </div>
            
            <button
              onClick={() => togglePremium(true)}
              className="bg-primary hover:bg-[#332e66] text-white px-6 py-3.5 rounded-2xl text-xs font-bold shadow-md transition-all shrink-0 hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
            >
              Simulate Upgrade Pro
              <ArrowRight size={14} />
            </button>
          </section>

          {/* TEASERS: MUTED BLURRED SYSTEM ELEMENTS NATURAL MOTIVATION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
            {/* Blurry Teaser 1: Profitability Analyzer */}
            <div className="bg-white rounded-3xl p-6 border border-primary/5 shadow-sm relative overflow-hidden group">
              {/* Blurred Layer */}
              <div className="absolute inset-0 bg-white/20 backdrop-blur-[6px] z-10 transition-all flex flex-col items-center justify-center p-6 text-center">
                <div className="w-10 h-10 bg-white shadow rounded-xl flex items-center justify-center text-primary mb-3">
                  <Lock size={16} />
                </div>
                <h5 className="font-extrabold text-sm text-primary">“Unlock Client Profitability Insights”</h5>
                <p className="text-[9px] text-outline mt-1 max-w-[210px]">
                  Calculate your true ROI per hour worked and find hidden client time drains immediately.
                </p>
                <button 
                  onClick={() => togglePremium(true)}
                  className="mt-3.5 bg-[#06696a] text-white px-3 py-1.5 rounded-xl text-[9px] font-bold hover:scale-105 transition-all cursor-pointer"
                >
                  Activate Sandbox View
                </button>
              </div>

              {/* Blurred Dummy Base rendering to tease layout */}
              <div className="space-y-4 filter blur-[2px]">
                <h4 className="text-xs font-black text-primary uppercase">Client ROI Score Breakdown</h4>
                <div className="space-y-2">
                  <div className="h-10 bg-slate-50 rounded" />
                  <div className="h-10 bg-slate-50 rounded" />
                </div>
              </div>
            </div>

            {/* Blurry Teaser 2: Sustainability Burnout Forecaster */}
            <div className="bg-white rounded-3xl p-6 border border-primary/5 shadow-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-[6px] z-10 transition-all flex flex-col items-center justify-center p-6 text-center">
                <div className="w-10 h-10 bg-white shadow rounded-xl flex items-center justify-center text-primary mb-3">
                  <Lock size={16} />
                </div>
                <h5 className="font-extrabold text-sm text-primary">“See your Burnout Forecast”</h5>
                <p className="text-[9px] text-outline mt-1 max-w-[210px]">
                  Predict overload risks 3 weeks in advance by matching logs trend against actual energy levels.
                </p>
                <button 
                  onClick={() => togglePremium(true)}
                  className="mt-3.5 bg-primary text-white px-3 py-1.5 rounded-xl text-[9px] font-bold hover:scale-105 transition-all cursor-pointer"
                >
                  Reveal Burnout Sandbox
                </button>
              </div>

              <div className="space-y-4 filter blur-[2px]">
                <h4 className="text-xs font-black text-primary uppercase">Long Term Sustainability Range</h4>
                <div className="h-20 bg-slate-100 rounded-2xl flex items-end justify-center pb-2">
                  <div className="w-10 h-10 bg-slate-300 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Clipped Worklogs Section */}
          <div className="bg-white rounded-[24px] p-6 border border-primary/5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-black text-outline tracking-wider block">Logged Sessions Timeline</span>
                <h3 className="text-sm font-black text-primary">Recent Worked Hours History</h3>
              </div>
              <button 
                type="button"
                onClick={onOpenLogWork}
                className="bg-secondary/5 hover:bg-secondary text-primary hover:text-white px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer font-sans"
              >
                <Plus size={11} /> Log Session
              </button>
            </div>

            <div className="space-y-3.5" id="free-recent-logs-list">
              {logs.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-2xl">
                  <p className="text-xs text-outline font-bold">No hours logged yet. Tap "Log Work" to clip your first session!</p>
                </div>
              ) : (
                [...logs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map(lg => {
                  const cl = clients.find(c => c.id === lg.clientId);
                  return (
                    <div key={lg.id} className="p-4 rounded-2xl bg-slate-50/60 hover:bg-slate-50 border border-slate-100 flex items-center justify-between gap-4 transition-all" id={`log-item-${lg.id}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary text-xs font-black flex items-center justify-center">
                          {cl?.name[0]?.toUpperCase() || 'C'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-primary leading-none">{cl?.name || 'Unknown Client'}</span>
                            <span className="text-[9px] bg-slate-100 text-outline px-1.5 py-0.5 rounded-full font-bold">
                              {new Date(lg.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                            </span>
                          </div>
                          {lg.note && <p className="text-[10px] text-outline mt-1.5 font-medium leading-tight">"{lg.note}"</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-black text-sm text-secondary shrink-0">{lg.hours} hrs</span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => onEditLog && onEditLog(lg)}
                            className="p-1 px-2.5 bg-slate-100 text-primary hover:bg-primary hover:text-white rounded-lg text-[9px] font-black uppercase tracking-tight transition-all cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveLog && onRemoveLog(lg.id)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                            title="Delete log"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      ) : (
        // =========================================================================
        // PREMIUM DASHBOARD EXPERIENCE (REST CONTROL, VALUE-READY BUSINESS INTEL)
        // =========================================================================
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Pro Sub nav controllers */}
          <div className="flex bg-surface-container border border-primary/5 p-1 rounded-2xl max-w-sm sm:max-w-md">
            {[
              { id: 'analytics', label: 'Advanced Stats', icon: LineChart },
              { id: 'profitability', label: 'Roster Profitability', icon: Users },
              { id: 'burnout', label: 'Burnout Predictor', icon: Activity },
              { id: 'simulations', label: 'Scenario Planner', icon: Sliders },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setPremiumTab(tab.id as any)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 px-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  premiumTab === tab.id 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-outline/70 hover:text-primary'
                }`}
              >
                <tab.icon size={12} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* ACTIVE TAB MAIN RENDER CONTAINER */}
          <div className="transition-all duration-300">
            {premiumTab === 'analytics' && (
              <div className="space-y-6">
                
                {/* ADVANCED ANALYTICS SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* HERO INSIGHTS SUMMARY CARD */}
                  <div className="bg-white rounded-3xl p-6 border border-primary/5 shadow-sm space-y-4">
                    <span className="text-[10px] font-black text-[#06696a] uppercase tracking-wider block">Operational Yield</span>
                    <h3 className="text-2xl font-black text-primary leading-none">
                      {symbol}{formatCurrency(stats.totalWeeklyIncome * 52)} <span className="text-xs text-outline font-medium">projected/yr</span>
                    </h3>
                    <p className="text-xs text-outline leading-relaxed">
                      Based on actual logged trends, your average baseline performance registers an efficiency rating of <strong>{symbol}{formatCurrency(stats.avgHourlyRate)}/hr</strong>.
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] font-bold text-outline">
                      <span>Stamina Overhead:</span>
                      <span className="text-primary">{focusedHoursPerDay * 5}h limit</span>
                    </div>
                  </div>

                  {/* PREMIUM CHART 1: MONTHLY WORKLOAD PATTERN */}
                  <div className="bg-white rounded-3xl p-6 border border-primary/5 shadow-sm md:col-span-2 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-black text-primary uppercase tracking-wider">Capacity Trends Over Time</h4>
                        <p className="text-[10px] text-outline">Simulated weekly utilization vs workload limit.</p>
                      </div>
                      <span className="text-[9px] bg-emerald-50 text-[#06696a] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                        Active Paced
                      </span>
                    </div>

                    <div className="h-[180px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={historicalTrendMockData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorWorkload" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06696a" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#06696a" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} />
                          <YAxis tick={{ fontSize: 9 }} axisLine={false} />
                          <Tooltip formatter={(value: number) => [`${value}%`, 'Utilization Factor']} />
                          <Area type="monotone" dataKey="workload" stroke="#06696a" strokeWidth={2} fillOpacity={1} fill="url(#colorWorkload)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

                {/* HISTORICAL TRENDS PANEL */}
                <div className="bg-white rounded-3xl p-6 border border-primary/5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-black text-primary uppercase tracking-wider">Historical System Tracking</h4>
                      <p className="text-[10px] text-outline">Weekly earnings & historical pattern logging.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="h-[140px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={historicalTrendMockData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} />
                          <YAxis tick={{ fontSize: 9 }} axisLine={false} />
                          <Tooltip formatter={(value: number) => [`${symbol}${formatCurrency(value)}`, 'Paced Income']} />
                          <Bar dataKey="income" fill="#332e66" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-3 font-medium text-xs text-outline">
                      <div className="flex justify-between items-center py-2 border-b border-slate-50">
                        <span>Utilization Peak:</span>
                        <span className="font-bold text-primary">{utilizationPercentage}%</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-50">
                        <span>Admin Friction Rate:</span>
                        <span className="font-bold text-amber-500">{(adminHours / totalCapacity * 100).toFixed(0)}% of schedule</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span>Pencil Runway Goal:</span>
                        <span className="font-bold text-emerald-600">Secure 90%</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {premiumTab === 'profitability' && (
              <div className="space-y-6">
                
                {/* CLIENT PROFITABILITY ANALYSIS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* PROFITABILITY BADGES BENTO BOX */}
                  {profitabilityAnalysis && (
                    <>
                      {/* Most Profitable */}
                      <div className="bg-[#06696a]/5 border border-[#06696a]/10 rounded-3xl p-6 space-y-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#06696a]/10 rounded-full -mr-6 -mt-6" />
                        <span className="text-[9px] font-black text-[#06696a] uppercase tracking-wider block">Star Client</span>
                        <h4 className="text-lg font-black text-primary truncate">
                          {profitabilityAnalysis.mostProfitable?.name}
                        </h4>
                        <div className="pt-2 text-xs font-bold text-outline">
                          <span>ROI Match Rating Rate:</span>
                          <p className="text-sm font-black text-[#06696a] mt-0.5">
                            {symbol}{profitabilityAnalysis.mostProfitable?.effectiveHourlyRate.toFixed(0)}/hr
                          </p>
                        </div>
                      </div>

                      {/* Lowest ROI */}
                      <div className="bg-orange-500/5 border border-orange-500/10 rounded-3xl p-6 space-y-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-full -mr-6 -mt-6" />
                        <span className="text-[9px] font-black text-orange-600 uppercase tracking-wider block">Lowest Yield Client</span>
                        <h4 className="text-lg font-black text-primary truncate">
                          {profitabilityAnalysis.lowestROI?.name || 'N/A'}
                        </h4>
                        <div className="pt-2 text-xs font-bold text-outline">
                          <span>Effective Rate:</span>
                          <p className="text-sm font-black text-orange-600 mt-0.5">
                            {symbol}{profitabilityAnalysis.lowestROI?.effectiveHourlyRate.toFixed(0)}/hr
                          </p>
                        </div>
                      </div>

                      {/* Hidden Energy Drain */}
                      <div className="bg-red-500/5 border border-red-500/10 rounded-3xl p-6 space-y-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-full -mr-6 -mt-6" />
                        <span className="text-[9px] font-black text-red-600 uppercase tracking-wider block">Hidden Energy Drain</span>
                        <h4 className="text-lg font-black text-primary truncate">
                          {profitabilityAnalysis.hiddenTimeDrain?.name || 'None detected'}
                        </h4>
                        <div className="pt-2 text-xs font-bold text-outline">
                          <span>Schedule Expansion:</span>
                          <p className="text-sm font-black text-red-600 mt-0.5">
                            {profitabilityAnalysis.hiddenTimeDrain 
                              ? `+${(profitabilityAnalysis.hiddenTimeDrain.actualWeeklyHours - profitabilityAnalysis.hiddenTimeDrain.plannedWeeklyHours).toFixed(1)}h over limit`
                              : 'No unpaid time leak logged'}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                </div>

                {/* PREMIUM TABLE WITH COMPLEX SCORES */}
                <div className="bg-white rounded-3xl p-6 border border-primary/5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-black text-primary uppercase tracking-wider">Advanced Client Profitability Matrix</h4>
                      <p className="text-[10px] text-outline">Metrics calculated using actual time logs against pricing model constants.</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-medium">
                      <thead>
                        <tr className="border-b border-slate-100 text-[9px] uppercase font-black text-outline/50 tracking-wider">
                          <th className="py-2.5">Client</th>
                          <th className="py-2.5 text-center">Profitability Score</th>
                          <th className="py-2.5 text-center">Energy Cushion Rating</th>
                          <th className="py-2.5 text-center">Payment Reliability</th>
                          <th className="py-2.5 text-right">Effective Rate</th>
                          <th className="py-2.5 text-right pr-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {profitabilityAnalysis?.clients.map(c => (
                          <tr key={c.id} className="hover:bg-slate-50/20 text-slate-700">
                            <td className="py-3 font-bold text-primary flex items-center gap-2">
                              <span className="w-6 h-6 rounded bg-primary/5 text-primary text-[10px] font-black flex items-center justify-center">
                                {c.name[0]?.toUpperCase()}
                              </span>
                              {c.name}
                            </td>
                            <td className="py-3 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] ${
                                c.profitabilityScore >= 75 ? 'bg-emerald-50 text-emerald-600' :
                                c.profitabilityScore >= 50 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                              }`}>
                                {c.profitabilityScore}/100
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] ${
                                c.energyImpactScore >= 80 ? 'bg-emerald-50 text-emerald-600' :
                                c.energyImpactScore >= 50 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                              }`}>
                                {c.energyImpactScore}% Focus
                              </span>
                            </td>
                            <td className="py-3 text-center text-outline">
                              {'★'.repeat(c.growthPotential)}{'☆'.repeat(5 - c.growthPotential)}
                            </td>
                            <td className="py-3 text-right font-black text-primary">
                              {symbol}{c.effectiveHourlyRate.toFixed(0)}/h
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex justify-end gap-1 px-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const fullClient = clients.find(bc => bc.id === c.id);
                                    if (fullClient && onEditClient) onEditClient(fullClient);
                                  }}
                                  className="p-1 px-2.5 bg-primary/5 hover:bg-primary hover:text-white rounded-lg text-[9px] tracking-tight font-black uppercase transition-all cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onRemoveClient && onRemoveClient(c.id)}
                                  className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                                  title="Delete Client"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {premiumTab === 'burnout' && (
              <div className="space-y-6">
                
                {/* BURNOUT FORECASTING SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* SAFETY METRIC PILL */}
                  <div className="bg-white rounded-3xl p-6 border border-primary/5 shadow-sm flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[10px] font-black text-outline uppercase tracking-wider">Schedule Sustainability</span>
                      <h4 className="text-3xl font-black mt-2 text-primary">
                        {burnoutForecast.sustainabilityScore}%
                      </h4>
                    </div>

                    <div className="space-y-1.5">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            burnoutForecast.sustainabilityScore >= 80 ? 'bg-emerald-500' :
                            burnoutForecast.sustainabilityScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          } transition-all`}
                          style={{ width: `${burnoutForecast.sustainabilityScore}%` }}
                        />
                      </div>
                      <span className="text-[8px] font-black text-outline uppercase tracking-widest block text-right">
                        Baseline Safety threshold
                      </span>
                    </div>
                  </div>

                  {/* TIMELINE PREDICTION BAR */}
                  <div className="bg-white rounded-3xl p-6 border border-primary/5 shadow-sm md:col-span-2 flex flex-col justify-between space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block">Velocity Risk Engine</span>
                        <h4 className="text-lg font-black text-primary mt-1">
                          Calculated timeline before critical overload warning
                        </h4>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500/10 text-red-600`}>
                        {burnoutForecast.riskLevel} Risk
                      </span>
                    </div>

                    <p className="text-xs text-outline/90 leading-relaxed font-semibold italic">
                      {burnoutForecast.statusMessage}
                    </p>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-outline">
                      <div className="p-2 border border-slate-100 rounded-xl">
                        <span className="block text-[8px] font-black uppercase tracking-wider mb-0.5">Focus Span</span>
                        <span className="text-primary font-black">{focusedHoursPerDay}h/day</span>
                      </div>
                      <div className="p-2 border border-slate-100 rounded-xl">
                        <span className="block text-[8px] font-black uppercase tracking-wider mb-0.5">Pace Stability</span>
                        <span className="text-[#06696a] font-black">Moderate</span>
                      </div>
                      <div className="p-2 border border-slate-100 rounded-xl">
                        <span className="block text-[8px] font-black uppercase tracking-wider mb-0.5">Forecast Margin</span>
                        <span className="text-secondary font-black">3 Weeks</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* AI STRATEGIC COACH INSIGHTS LIST */}
                <div className="bg-white rounded-3xl p-6 border border-primary/5 shadow-sm space-y-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-500 flex items-center justify-center">
                      <Sparkles size={16} className="fill-current" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-primary uppercase tracking-wider">AI Intelligent Workload Counsel</h4>
                      <p className="text-[10px] text-outline">Strategic recommendations generated automatically based on baseline agreements.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiRecommendations.map(rec => (
                      <div key={rec.id} className="p-4 rounded-2xl border border-primary/5 bg-slate-50/50 flex flex-col justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-[#06696a] uppercase tracking-wider block">
                            {rec.category}
                          </span>
                          <p className="text-slate-700 leading-relaxed font-semibold">
                            {rec.text}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            if (rec.id.startsWith('price_')) {
                              setPremiumTab('simulations');
                              const cId = rec.id.replace('price_', '');
                              setTargetClientIdToChange(cId);
                            } else {
                              alert(`Tactical check: ${rec.action}. Use portfolio editing parameters to modify boundaries.`);
                            }
                          }}
                          className="bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 rounded-xl py-1.5 px-3 text-[10px] font-bold self-start transition-all cursor-pointer"
                        >
                          {rec.action}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {premiumTab === 'simulations' && (
              <div className="space-y-6">
                
                {/* ADVANCED MULTIPLE SIMULATIONS */}
                <div className="bg-white rounded-3xl p-6 border border-primary/5 shadow-sm space-y-6">
                  <div>
                    <h4 className="text-xs font-black text-primary uppercase tracking-wider">Advanced Rate Increase Simulator</h4>
                    <p className="text-[10px] text-outline">Calculate precise monthly and annual yield outcomes prior to initiating negotiations.</p>
                  </div>

                  {clients.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black text-outline uppercase tracking-wider mb-2">
                            Select Portfolio Client to Adjust
                          </label>
                          <select 
                            value={targetClientIdToChange || defaultSelectedClient}
                            onChange={e => setTargetClientIdToChange(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs text-primary font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            {clients.map(c => (
                              <option key={c.id} value={c.id}>
                                {c.name} (Effective: {symbol}{c.effectiveHourlyRate.toFixed(0)}/hr)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-outline uppercase tracking-wider mb-2.5">
                            Simulated Rate Raise Percentage
                          </label>
                          <div className="flex items-center gap-4">
                            <input 
                              type="range" 
                              min="5" 
                              max="50" 
                              step="5"
                              value={rateChangePercent} 
                              onChange={e => setRateChangePercent(Number(e.target.value))}
                              className="flex-grow accent-[#06696a]"
                            />
                            <span className="font-extrabold text-sm text-[#06696a] w-12 text-right">
                              +{rateChangePercent}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {premiumSimulationResult && (
                        <div className="p-5 rounded-2xl bg-[#06696a]/5 border border-[#06696a]/10 space-y-4 text-xs font-medium text-slate-700">
                          <h5 className="font-black text-primary text-xs uppercase tracking-wider">Simulation Results</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Old Target Rate:</span>
                              <span className="font-bold">{symbol}{premiumSimulationResult.oldRate.toFixed(0)}/hr</span>
                            </div>
                            <div className="flex justify-between text-[#06696a] font-bold">
                              <span>Projected New Rate:</span>
                              <span>{symbol}{premiumSimulationResult.newRate.toFixed(0)}/hr</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Weekly Revenue Delta:</span>
                              <span className="text-emerald-600 font-extrabold">+{symbol}{premiumSimulationResult.difference.toFixed(0)}</span>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-xs text-primary">
                            <span>Projected Portfolio Weekly Running:</span>
                            <span>{symbol}{formatCurrency(premiumSimulationResult.allProjectedPortfolioIncome)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-outline text-xs">
                      Please register a client first to activate rate simulations.
                    </div>
                  )}
                </div>

                {/* SCENARIO PLANNING INSIGHT CARD */}
                <div className="bg-gradient-to-br from-[#332e66]/5 to-[#06696a]/5 border border-primary/5 p-6 rounded-3xl flex justify-between items-center flex-col sm:flex-row gap-4">
                  <div className="text-left">
                    <h5 className="font-black text-xs text-primary uppercase">Scenario forecasting metrics</h5>
                    <p className="text-[10px] text-outline mt-1">Simulate multi-month agreements, inflation hedges, and recovery targets.</p>
                  </div>
                  <button 
                    onClick={() => alert('Custom Scenario saved to memory dashboard.')}
                    className="bg-[#06696a] text-white px-4 py-2 rounded-xl text-xs font-bold hover:scale-105 transition-all cursor-pointer"
                  >
                    Save Current Plan Scenario
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* EXPORT & ACTIONABLE REPORTS CARD */}
          <div className="bg-white p-6 rounded-3xl border border-primary/5 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                <Download size={20} />
              </div>
              <div className="text-left">
                <h4 className="font-extrabold text-xs text-primary uppercase tracking-wide">Generate Freelance Snapshot Report</h4>
                <p className="text-[10px] text-outline">Download business intelligence reports on workload trends & client profitability indexes.</p>
              </div>
            </div>
            <button
              onClick={() => {
                const reportContent = {
                  timestamp: new Date().toISOString(),
                  portfolio: clients,
                  capacity: stats,
                  weeksSustainability: burnoutForecast.weeksBeforeCollapse,
                  wellnessScore: burnoutForecast.sustainabilityScore,
                  recommendations: aiRecommendations
                };
                
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportContent, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", `caply-business-intel-report.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
              }}
              className="px-5 py-3 rounded-2xl text-xs font-bold bg-[#06696a] text-white hover:scale-105 transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              Export Pro Snapshot
              <Download size={13} />
            </button>
          </div>

          {/* Recent Clipped Worklogs Section */}
          <div className="bg-white rounded-[24px] p-6 border border-primary/5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-black text-outline tracking-wider block">Logged Sessions Timeline</span>
                <h3 className="text-sm font-black text-primary">Recent Worked Hours History</h3>
              </div>
              <button 
                type="button"
                onClick={onOpenLogWork}
                className="bg-secondary/5 hover:bg-secondary text-primary hover:text-white px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer font-sans"
              >
                <Plus size={11} /> Log Session
              </button>
            </div>

            <div className="space-y-3.5" id="pro-recent-logs-list">
              {logs.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-2xl">
                  <p className="text-xs text-outline font-bold">No hours logged yet. Tap "Log Work" to clip your first session!</p>
                </div>
              ) : (
                [...logs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map(lg => {
                  const cl = clients.find(c => c.id === lg.clientId);
                  return (
                    <div key={lg.id} className="p-4 rounded-2xl bg-slate-50/60 hover:bg-slate-50 border border-slate-100 flex items-center justify-between gap-4 transition-all" id={`pro-log-item-${lg.id}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary text-xs font-black flex items-center justify-center">
                          {cl?.name[0]?.toUpperCase() || 'C'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-primary leading-none">{cl?.name || 'Unknown Client'}</span>
                            <span className="text-[9px] bg-slate-100 text-outline px-1.5 py-0.5 rounded-full font-bold">
                              {new Date(lg.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                            </span>
                          </div>
                          {lg.note && <p className="text-[10px] text-outline mt-1.5 font-medium leading-tight">"{lg.note}"</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-black text-sm text-secondary shrink-0">{lg.hours} hrs</span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => onEditLog && onEditLog(lg)}
                            className="p-1 px-2.5 bg-slate-100 text-primary hover:bg-primary hover:text-white rounded-lg text-[9px] font-black uppercase tracking-tight transition-all cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveLog && onRemoveLog(lg.id)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                            title="Delete log"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}

      {/* SYSTEM CONTROLLER FOOTER */}
      <footer className="pt-6 border-t border-primary/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold text-outline">
        <span>Caply Intelligent OS V2</span>
        <div className="flex gap-4">
          <button onClick={onRestartSetup} className="hover:text-primary transition-colors cursor-pointer">
            Re-run Guided Onboarding
          </button>
          <span>•</span>
          <span>Security Guarded</span>
        </div>
      </footer>

    </div>
  );
};
