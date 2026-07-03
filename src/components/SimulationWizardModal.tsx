/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Zap, 
  Sparkles, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Smile
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PricingMode, Client, CapacityStatus } from '../types';

interface SimulationWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: CapacityStatus;
  totalCapacity: number;
  clients: Client[];
  symbol: string;
  formatCurrency: (val: number) => string;
  onAcceptToPortfolio: (clientData: Partial<Client>) => void;
}

export const SimulationWizardModal: React.FC<SimulationWizardModalProps> = ({
  isOpen,
  onClose,
  stats,
  totalCapacity,
  clients,
  symbol,
  formatCurrency,
  onAcceptToPortfolio
}) => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Simulator fields
  const [name, setName] = useState('');
  const [mode, setMode] = useState<PricingMode>('hourly');
  const [hourlyRate, setHourlyRate] = useState<number>(100);
  const [expectedHoursPerWeek, setExpectedHoursPerWeek] = useState<number>(10);
  const [dayRate, setDayRate] = useState<number>(800);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(2);
  const [hoursPerDay, setHoursPerDay] = useState<number>(8);
  const [pricePerTask, setPricePerTask] = useState<number>(500);
  const [estimatedHoursPerTask, setEstimatedHoursPerTask] = useState<number>(5);
  const [tasksPerWeek, setTasksPerWeek] = useState<number>(1);

  useEffect(() => {
    setName('');
    setMode('hourly');
    setHourlyRate(100);
    setExpectedHoursPerWeek(10);
    setDayRate(800);
    setDaysPerWeek(2);
    setHoursPerDay(8);
    setPricePerTask(500);
    setEstimatedHoursPerTask(5);
    setTasksPerWeek(1);
    setStep(1);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1 && !name.trim()) return;
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const calculatePlannedWeeklyHours = () => {
    if (mode === 'hourly') return expectedHoursPerWeek;
    if (mode === 'daily') return daysPerWeek * hoursPerDay;
    if (mode === 'task') return estimatedHoursPerTask * tasksPerWeek;
    return 0;
  };

  const calculateWeeklyIncome = () => {
    if (mode === 'hourly') return hourlyRate * expectedHoursPerWeek;
    if (mode === 'daily') return dayRate * daysPerWeek;
    if (mode === 'task') return pricePerTask * tasksPerWeek;
    return 0;
  };

  // Run Forecast calculations
  const runForecast = () => {
    const newHours = calculatePlannedWeeklyHours();
    const newIncome = calculateWeeklyIncome();

    // Use current adjusted hours from parent stats
    const afterAdjusted = stats.adjustedHours + Number(newHours || 0);
    const capacityLimit = totalCapacity;
    const remainingAfter = capacityLimit - afterAdjusted;
    const newUtil = Math.round((afterAdjusted / (capacityLimit || 1)) * 100);

    let status: 'yes' | 'warning' | 'no' = 'yes';
    let label = 'Green Light 😌';
    let theme = 'bg-emerald-50 text-emerald-950 border-emerald-100';
    let helper = 'Completely safe. Take this opportunity to pad your income or reinvest in client retention!';

    if (afterAdjusted > capacityLimit) {
      status = 'no';
      label = 'Overload Risk 🤯';
      theme = 'bg-red-50 text-red-950 border-red-100';
      helper = `This will push your schedule to ${newUtil}% capacity. We recommend increasing your rate parameters by 25% to gatekeep your sanity boundaries.`;
    } else if (afterAdjusted >= capacityLimit * 0.9) {
      status = 'warning';
      label = 'Near Stamina Limit 😳';
      theme = 'bg-amber-50 text-amber-950 border-amber-100';
      helper = 'You will be working near your deep capacity limit. Lock down strict administrative hours or extend project timelines.';
    }

    return {
      status,
      label,
      theme,
      helper,
      newUtil,
      remainingAfter,
      newIncome,
      newHours
    };
  };

  const forecast = runForecast();

  const handleAddToPortfolio = () => {
    let params: any = {};
    if (mode === 'hourly') {
      params = { hourlyRate, expectedHoursPerWeek };
    } else if (mode === 'daily') {
      params = { dayRate, daysPerWeek, hoursPerDay };
    } else if (mode === 'task') {
      params = { pricePerTask, estimatedHoursPerTask: estimatedHoursPerTask, tasksPerWeek };
    }

    const payload: Partial<Client> = {
      name,
      mode,
      params,
      plannedWeeklyHours: forecast.newHours,
      weeklyIncome: forecast.newIncome,
      growthPotential: 3,
      paymentReliability: 3,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onAcceptToPortfolio(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-primary/25 backdrop-blur-md"
        id="sim-wizard-backdrop"
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative bg-white w-full max-w-md rounded-[32px] p-8 md:p-10 shadow-2xl border border-primary/5 flex flex-col max-h-[90vh] overflow-hidden"
        id="sim-wizard-card"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-black tracking-widest text-primary uppercase">Scenario Decision Coach</span>
            <h4 className="text-xl font-extrabold text-[#06696a] tracking-tight">
              Can I Take Another Client?
            </h4>
          </div>
          <button 
            onClick={onClose}
            className="text-outline/40 hover:text-primary transition-colors p-2 hover:bg-slate-50 rounded-xl"
            id="close-sim-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Level Step tracker */}
        <div className="mb-6">
          <div className="flex justify-between text-[10px] font-black text-outline/50 uppercase tracking-widest mb-1.5">
            <span>Query Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#06696a] transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content steps */}
        <div className="flex-1 overflow-y-auto py-2 pr-1 min-h-[220px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* STEP 1: Name */}
              {step === 1 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-primary tracking-tight">
                    What is the prospect or project name?
                  </h3>
                  <input 
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Acme Web Audit, Redesign..."
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#06696a] focus:bg-white text-base font-medium text-primary"
                    autoFocus
                    id="sim-project-name"
                  />
                  <p className="text-[11px] text-outline/80 leading-normal">
                    This lets Caply evaluate potential schedule clash against active rosters.
                  </p>
                </div>
              )}

              {/* STEP 2: Pricing model */}
              {step === 2 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-primary tracking-tight">
                    How is this contract priced?
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'hourly', title: 'Hourly Rates', desc: 'Charged dynamically per hour' },
                      { id: 'daily', title: 'Day Base / Retainer', desc: 'Locked weekly block days' },
                      { id: 'task', title: 'Per Product milestone', desc: 'Payments linked directly to results' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setMode(opt.id as PricingMode)}
                        className={`text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                          mode === opt.id 
                            ? 'border-[#06696a] bg-[#06696a]/5 font-extrabold text-primary' 
                            : 'border-slate-100 bg-white hover:border-slate-200 text-outline'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-primary">{opt.title}</p>
                          <p className="text-[10px] text-outline mt-0.5">{opt.desc}</p>
                        </div>
                        {mode === opt.id && (
                          <div className="w-4.5 h-4.5 bg-[#06696a] rounded-full flex items-center justify-center text-white">
                            <CheckCircle2 size={11} className="stroke-[3px]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: Hours Expected */}
              {step === 3 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-primary tracking-tight">
                    Expected weekly workload duration
                  </h3>

                  {mode === 'hourly' && (
                    <div className="space-y-3">
                      <label className="block text-xs font-black text-outline/50 uppercase tracking-widest pl-1">
                        Weekly hours
                      </label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="range" min="1" max="40" step="1"
                          value={expectedHoursPerWeek}
                          onChange={e => setExpectedHoursPerWeek(Number(e.target.value))}
                          className="flex-grow accent-[#06696a]"
                        />
                        <span className="font-extrabold text-sm w-8 text-right text-primary">
                          {expectedHoursPerWeek}h
                        </span>
                      </div>
                    </div>
                  )}

                  {mode === 'daily' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-black text-outline/50 uppercase tracking-widest mb-1 pl-1">
                          Days per week
                        </label>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map(d => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setDaysPerWeek(d)}
                              className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all ${
                                daysPerWeek === d 
                                  ? 'bg-[#06696a] text-white' 
                                  : 'bg-slate-100 hover:bg-slate-200 text-outline'
                              }`}
                            >
                              {d}d
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-outline/50 uppercase tracking-widest mb-1 pl-1">
                          Hours per day
                        </label>
                        <div className="flex items-center gap-4">
                          <input 
                            type="range" min="1" max="12" step="1"
                            value={hoursPerDay}
                            onChange={e => setHoursPerDay(Number(e.target.value))}
                            className="flex-grow accent-[#06696a]"
                          />
                          <span className="font-extrabold text-sm w-8 text-right text-primary">
                            {hoursPerDay}h
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {mode === 'task' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-black text-outline/50 uppercase tracking-widest mb-1 pl-1">
                          Milestones per week
                        </label>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map(t => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setTasksPerWeek(t)}
                              className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all ${
                                tasksPerWeek === t 
                                  ? 'bg-[#06696a] text-white' 
                                  : 'bg-slate-100 hover:bg-slate-200 text-outline'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-outline/50 uppercase tracking-widest mb-1 pl-1">
                          Working hours per milestone
                        </label>
                        <div className="flex items-center gap-4">
                          <input 
                            type="range" min="1" max="30" step="1"
                            value={estimatedHoursPerTask}
                            onChange={e => setEstimatedHoursPerTask(Number(e.target.value))}
                            className="flex-grow accent-[#06696a]"
                          />
                          <span className="font-extrabold text-sm w-8 text-right text-primary">
                            {estimatedHoursPerTask}h
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: Rates */}
              {step === 4 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-primary tracking-tight">
                    Proposed rates and billable billing
                  </h3>

                  <div className="space-y-3">
                    {mode === 'hourly' && (
                      <div>
                        <label className="block text-xs font-black text-outline/50 uppercase tracking-widest mb-1 pl-1">
                          Hourly rate ({symbol})
                        </label>
                        <input 
                          type="number"
                          value={hourlyRate}
                          onChange={e => setHourlyRate(Math.max(0, Number(e.target.value)))}
                          className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#06696a] text-base font-bold text-primary"
                        />
                      </div>
                    )}

                    {mode === 'daily' && (
                      <div>
                        <label className="block text-xs font-black text-outline/50 uppercase tracking-widest mb-1 pl-1">
                          Day rate ({symbol})
                        </label>
                        <input 
                          type="number"
                          value={dayRate}
                          onChange={e => setDayRate(Math.max(0, Number(e.target.value)))}
                          className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#06696a] text-base font-bold text-primary"
                        />
                      </div>
                    )}

                    {mode === 'task' && (
                      <div>
                        <label className="block text-xs font-black text-outline/50 uppercase tracking-widest mb-1 pl-1">
                          Deliverable pay value ({symbol})
                        </label>
                        <input 
                          type="number"
                          value={pricePerTask}
                          onChange={e => setPricePerTask(Math.max(0, Number(e.target.value)))}
                          className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#06696a] text-base font-bold text-primary"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 5: Analysis Report */}
              {step === 5 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-primary tracking-tight">
                    Scenario Analytics Dashboard
                  </h3>

                  <div className={`p-4 rounded-2xl border ${forecast.theme} text-left space-y-1`}>
                    <span className="font-black text-[9px] uppercase tracking-widest opacity-60">Result Status</span>
                    <h4 className="text-sm font-black flex items-center gap-1">
                      {forecast.status === 'no' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
                      {forecast.label}
                    </h4>
                    <p className="text-xs leading-relaxed opacity-95">
                      {forecast.helper}
                    </p>
                  </div>

                  {/* Impact KPIs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-center">
                      <span className="text-[8px] font-black text-outline uppercase tracking-wider mb-0.5">Capacity shift</span>
                      <strong className="text-sm text-primary">
                        {stats.utilization || Math.round((stats.adjustedHours / totalCapacity) * 100)}% ➔ {forecast.newUtil}%
                      </strong>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-center">
                      <span className="text-[8px] font-black text-outline uppercase tracking-wider mb-0.5">Weekly Billable growth</span>
                      <strong className="text-sm text-emerald-600">
                        +{symbol}{formatCurrency(forecast.newIncome)}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-6 gap-4 shrink-0">
          <button
            type="button"
            onClick={handleBack}
            className={`py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center gap-1 ${
              step > 1 
                ? 'text-primary hover:bg-slate-50' 
                : 'text-outline/10 pointer-events-none'
            }`}
          >
            <ArrowLeft size={14} />
            Back
          </button>

          {step === totalSteps ? (
            <button
              type="button"
              onClick={handleAddToPortfolio}
              className="flex-grow py-3.5 bg-primary hover:bg-[#332e66] text-white rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1"
              id="sim-save-to-portfolio-btn"
            >
              Add Project to Portfolio
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="flex-grow py-3.5 bg-[#06696a] hover:bg-[#044c4d] text-white rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5"
              id="sim-continue-btn"
            >
              Analyze Scenario
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
