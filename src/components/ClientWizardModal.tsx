/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  DollarSign, 
  Zap, 
  Heart, 
  Smile, 
  ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Client, PricingMode } from '../types';

interface ClientWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Partial<Client>) => void;
  initialClient?: Client | null;
  symbol: string;
}

export const ClientWizardModal: React.FC<ClientWizardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialClient,
  symbol
}) => {
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Wizard state fields
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
  const [growthPotential, setGrowthPotential] = useState<number>(3);
  const [paymentReliability, setPaymentReliability] = useState<number>(3);

  // Initialize form fields when initialClient changes
  useEffect(() => {
    if (initialClient) {
      setName(initialClient.name || '');
      setMode(initialClient.mode || 'hourly');
      setGrowthPotential(initialClient.growthPotential || 3);
      setPaymentReliability(initialClient.paymentReliability || 3);

      const params = initialClient.params as any;
      if (initialClient.mode === 'hourly') {
        setHourlyRate(params.hourlyRate || 100);
        setExpectedHoursPerWeek(params.expectedHoursPerWeek || 10);
      } else if (initialClient.mode === 'daily') {
        setDayRate(params.dayRate || 800);
        setDaysPerWeek(params.daysPerWeek || 2);
        setHoursPerDay(params.hoursPerDay || 8);
      } else if (initialClient.mode === 'task') {
        setPricePerTask(params.pricePerTask || 500);
        setEstimatedHoursPerTask(params.estimatedHoursPerTask || 5);
        setTasksPerWeek(params.tasksPerWeek || 1);
      }
    } else {
      // Reset to defaults
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
      setGrowthPotential(3);
      setPaymentReliability(3);
    }
    setStep(1);
  }, [initialClient, isOpen]);

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

  const handleSubmit = () => {
    let params: any = {};
    if (mode === 'hourly') {
      params = { hourlyRate, expectedHoursPerWeek };
    } else if (mode === 'daily') {
      params = { dayRate, daysPerWeek, hoursPerDay };
    } else if (mode === 'task') {
      params = { pricePerTask, estimatedHoursPerTask: estimatedHoursPerTask, tasksPerWeek };
    }

    const weeklyHours = calculatePlannedWeeklyHours();
    const weeklyIncome = calculateWeeklyIncome();

    const payload: Partial<Client> = {
      name,
      mode,
      params,
      plannedWeeklyHours: weeklyHours,
      weeklyIncome,
      growthPotential,
      paymentReliability,
      updated_at: new Date().toISOString()
    };

    if (initialClient?.id) {
      payload.id = initialClient.id;
    }

    onSave(payload);
    onClose();
  };

  // AI strategy advisory message
  const getAiAdvisorNote = () => {
    const hours = calculatePlannedWeeklyHours();
    const pay = calculateWeeklyIncome();
    const rate = hours > 0 ? pay / hours : 0;

    let advice = 'This looks like a highly balanced agreement! Let\'s lock it in.';
    if (rate < 50) {
      advice = 'Your effective rate feels on the lower side. Consider demanding a higher premium or shorter hours.';
    } else if (hours > 20) {
      advice = 'This client consumes over half of your weekly creative stamina. Protect your calendar block buffers!';
    } else if (paymentReliability >= 4 && growthPotential >= 4) {
      advice = 'This is a dream ticket! Exceptional reliability and growth indicators. Prioritize this partnership.';
    }
    return advice;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-primary/25 backdrop-blur-md"
        id="client-wizard-backdrop"
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative bg-white w-full max-w-lg rounded-[28px] p-5 sm:p-8 md:p-10 shadow-2xl border border-primary/5 flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden"
        id="client-wizard-card"
      >
        {/* Header Header */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-black tracking-widest text-[#06696a] uppercase">
              {initialClient ? 'Edit Guided Flow' : 'Add Client Wizard'}
            </span>
            <h4 className="text-xl font-extrabold text-primary tracking-tight">
              {initialClient ? `Refactoring ${initialClient.name}` : 'Introduce Your Client'}
            </h4>
          </div>
          <button 
            onClick={onClose}
            className="text-outline/40 hover:text-primary transition-colors p-2 hover:bg-slate-50 rounded-xl"
            id="close-wizard-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Real-time Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-[10px] font-black text-outline/50 uppercase tracking-widest mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content steps (Framer Motion transitions) */}
        <div className="flex-1 overflow-y-auto py-2 pr-1 min-h-[250px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* STEP 1: Name */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-2">
                    <Sparkles size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-primary tracking-tight">
                    What is your client's name or brand?
                  </h3>
                  <input 
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Acme Corp, Stripe..."
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-base font-medium"
                    autoFocus
                    id="wizard-client-name"
                  />
                  <p className="text-xs text-outline/70">
                    Entering a realistic name helps Caply organize workload ratios organically.
                  </p>
                </div>
              )}

              {/* STEP 2: Mode */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-2">
                    <DollarSign size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-primary tracking-tight">
                    How do you bill this client?
                  </h3>
                  <div className="grid grid-cols-1 gap-2.5">
                    {[
                      { id: 'hourly', title: 'Hourly Rate', desc: 'Charged for actual, clocked time' },
                      { id: 'daily', title: 'Day Rate / Retainer', desc: 'Fixed days allocated per week' },
                      { id: 'task', title: 'Per Milestone / Task', desc: 'Fixed pricing per deliverable task' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setMode(opt.id as PricingMode)}
                        className={`text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                          mode === opt.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-slate-100 hover:border-slate-200 bg-white'
                        }`}
                        id={`mode-select-${opt.id}`}
                      >
                        <div>
                          <p className="font-extrabold text-sm text-primary">{opt.title}</p>
                          <p className="text-xs text-outline/80 mt-0.5">{opt.desc}</p>
                        </div>
                        {mode === opt.id && (
                          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white">
                            <CheckCircle2 size={12} className="stroke-[3px]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: Weekly Allocation */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-2">
                    <Clock size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-primary tracking-tight">
                    Let's map your weekly time allocation
                  </h3>

                  {mode === 'hourly' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-black text-outline/50 uppercase tracking-widest mb-1">
                          Expected hours per week
                        </label>
                        <div className="flex items-center gap-4">
                          <input 
                            type="range" min="1" max="50" step="1"
                            value={expectedHoursPerWeek}
                            onChange={e => setExpectedHoursPerWeek(Number(e.target.value))}
                            className="flex-grow accent-primary"
                          />
                          <span className="font-extrabold text-lg text-primary w-12 text-right">
                            {expectedHoursPerWeek}h
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {mode === 'daily' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-black text-outline/50 uppercase tracking-widest mb-1.5">
                          Days allocated per week
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5, 6, 7].map(d => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setDaysPerWeek(d)}
                              className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${
                                daysPerWeek === d 
                                  ? 'bg-primary text-white' 
                                  : 'bg-slate-100 hover:bg-slate-200 text-outline'
                              }`}
                            >
                              {d}d
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-outline/50 uppercase tracking-widest mb-1">
                          Working hours per day
                        </label>
                        <div className="flex items-center gap-4">
                          <input 
                            type="range" min="1" max="12" step="0.5"
                            value={hoursPerDay}
                            onChange={e => setHoursPerDay(Number(e.target.value))}
                            className="flex-grow accent-primary"
                          />
                          <span className="font-extrabold text-lg text-primary w-12 text-right">
                            {hoursPerDay}h
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {mode === 'task' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-black text-outline/50 uppercase tracking-widest mb-1">
                          Tasks expected per week
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(t => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setTasksPerWeek(t)}
                              className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${
                                tasksPerWeek === t 
                                  ? 'bg-primary text-white' 
                                  : 'bg-slate-100 hover:bg-slate-200 text-outline'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-outline/50 uppercase tracking-widest mb-1">
                          Estimated hours per task
                        </label>
                        <div className="flex items-center gap-4">
                          <input 
                            type="range" min="1" max="30" step="1"
                            value={estimatedHoursPerTask}
                            onChange={e => setEstimatedHoursPerTask(Number(e.target.value))}
                            className="flex-grow accent-primary"
                          />
                          <span className="font-extrabold text-lg text-primary w-12 text-right">
                            {estimatedHoursPerTask}h
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-primary/5 text-primary text-xs flex gap-2 font-medium">
                    <Clock size={16} className="shrink-0 mt-0.5 text-[#06696a]" />
                    <span>
                      This equates to a safe target commitment of <strong>{calculatePlannedWeeklyHours()} hours per week</strong>.
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 4: Rates */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-2">
                    <DollarSign size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-primary tracking-tight">
                    What is your financial reward rate?
                  </h3>

                  <div className="space-y-4">
                    {mode === 'hourly' && (
                      <div>
                        <label className="block text-xs font-black text-outline/50 uppercase tracking-widest mb-2">
                          Hourly Rate ({symbol})
                        </label>
                        <input 
                          type="number"
                          value={hourlyRate}
                          onChange={e => setHourlyRate(Math.max(0, Number(e.target.value)))}
                          className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary text-lg font-bold"
                          id="wizard-hourly-rate"
                        />
                      </div>
                    )}

                    {mode === 'daily' && (
                      <div>
                        <label className="block text-xs font-black text-outline/50 uppercase tracking-widest mb-2">
                          Day Rate ({symbol})
                        </label>
                        <input 
                          type="number"
                          value={dayRate}
                          onChange={e => setDayRate(Math.max(0, Number(e.target.value)))}
                          className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary text-lg font-bold"
                          id="wizard-day-rate"
                        />
                      </div>
                    )}

                    {mode === 'task' && (
                      <div>
                        <label className="block text-xs font-black text-outline/50 uppercase tracking-widest mb-2">
                          Price Per Milestone / Task ({symbol})
                        </label>
                        <input 
                          type="number"
                          value={pricePerTask}
                          onChange={e => setPricePerTask(Math.max(0, Number(e.target.value)))}
                          className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary text-lg font-bold"
                          id="wizard-task-rate"
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-950 text-xs flex justify-between font-medium">
                    <span>Expected weekly billing:</span>
                    <strong className="text-emerald-700 text-sm">
                      {symbol}{calculateWeeklyIncome()} / wk
                    </strong>
                  </div>
                </div>
              )}

              {/* STEP 5: Relationship health indicators */}
              {step === 5 && (
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-2">
                    <Heart size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-primary tracking-tight">
                    Qualitative Project Health Scores
                  </h3>

                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between items-baseline mb-1">
                        <label className="block text-xs font-black text-outline/50 uppercase tracking-widest">
                          Growth Potential
                        </label>
                        <span className="text-xs font-bold text-primary">Score: {growthPotential}/5</span>
                      </div>
                      <p className="text-[10px] text-outline/70 mb-1.5">
                        Does this partnership support learning or lead to expanded contracts?
                      </p>
                      <input 
                        type="range" min="1" max="5" step="1"
                        value={growthPotential}
                        onChange={e => setGrowthPotential(Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-baseline mb-1">
                        <label className="block text-xs font-black text-outline/50 uppercase tracking-widest">
                          Payment Reliability & Calm
                        </label>
                        <span className="text-xs font-bold text-primary">Score: {paymentReliability}/5</span>
                      </div>
                      <p className="text-[10px] text-outline/70 mb-1.5">
                        Do they pay on time and respect scope boundaries without drama?
                      </p>
                      <input 
                        type="range" min="1" max="5" step="1"
                        value={paymentReliability}
                        onChange={e => setPaymentReliability(Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: Confirmation */}
              {step === 6 && (
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-2">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-primary tracking-tight">
                    Ready to Save Client?
                  </h3>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3.5 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="font-bold text-outline">Client:</span>
                      <strong className="text-primary text-sm">{name}</strong>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="font-bold text-outline">Billing Model:</span>
                      <strong className="text-primary capitalize">{mode}</strong>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="font-bold text-outline">Weekly Time commitment:</span>
                      <strong className="text-[#06696a] text-sm">{calculatePlannedWeeklyHours()} hrs</strong>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-bold text-outline">Weekly Revenue Estimate:</span>
                      <strong className="text-emerald-600 text-sm">{symbol}{calculateWeeklyIncome()}</strong>
                    </div>
                  </div>

                  {/* Conversational AI guidance advisor */}
                  <div className="bg-[#332e66]/5 rounded-2xl p-4 border border-[#332e66]/10 flex items-start gap-2.5">
                    <Zap size={16} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-black text-[9px] uppercase tracking-widest text-primary">
                        Caply Assistant Advisory
                      </h4>
                      <p className="text-xs text-outline leading-snug mt-0.5">
                        {getAiAdvisorNote()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer controls */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-6 gap-4 shrink-0">
          <button
            type="button"
            onClick={handleBack}
            className={`py-3.5 px-5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              step > 1 
                ? 'text-primary hover:bg-slate-50' 
                : 'text-outline/10 pointer-events-none'
            }`}
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <button
            type="button"
            onClick={step === totalSteps ? handleSubmit : handleNext}
            className="flex-grow py-3.5 bg-primary hover:bg-[#332e66] text-white rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5"
            id="wizard-submit-btn"
          >
            {step === totalSteps ? 'Save Client' : 'Continue'}
            {step < totalSteps && <ArrowRight size={16} />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
