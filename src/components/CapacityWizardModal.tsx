/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Gauge, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  Bot 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CapacityWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    totalCapacity: number;
    adminHours: number;
    stressLevel: string;
    focusedHoursPerDay: number;
  }) => void;
  currentTotalCapacity: number;
  currentAdminHours: number;
  currentStressLevel: string;
  currentFocusedHours: number;
}

export const CapacityWizardModal: React.FC<CapacityWizardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentTotalCapacity,
  currentAdminHours,
  currentStressLevel,
  currentFocusedHours
}) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Capacity states state fields
  const [totalCapacity, setTotalCapacity] = useState<number>(40);
  const [adminHours, setAdminHours] = useState<number>(5);
  const [stressLevel, setStressLevel] = useState<string>('medium');
  const [focusedHoursPerDay, setFocusedHoursPerDay] = useState<number>(6);

  useEffect(() => {
    setTotalCapacity(currentTotalCapacity || 40);
    setAdminHours(currentAdminHours || 5);
    setStressLevel(currentStressLevel || 'medium');
    setFocusedHoursPerDay(currentFocusedHours || 6);
    setStep(1);
  }, [isOpen, currentTotalCapacity, currentAdminHours, currentStressLevel, currentFocusedHours]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    onSave({
      totalCapacity,
      adminHours,
      stressLevel,
      focusedHoursPerDay
    });
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
        id="capacity-wizard-backdrop"
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative bg-white w-full max-w-sm rounded-[32px] p-8 md:p-10 shadow-2xl border border-primary/5 flex flex-col max-h-[90vh] overflow-hidden"
        id="capacity-wizard-card"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-black tracking-widest text-[#06696a] uppercase">Stamina Controller</span>
            <h4 className="text-xl font-extrabold text-primary tracking-tight">
              Calibrate Capacity
            </h4>
          </div>
          <button 
            onClick={onClose}
            className="text-outline/40 hover:text-primary transition-colors p-2 hover:bg-slate-50 rounded-xl"
            id="close-capacity-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Real-time Indicator Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-[10px] font-black text-outline/50 uppercase tracking-widest mb-1.5">
            <span>Progress Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
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
              {/* STEP 1: Total Hours Target */}
              {step === 1 && (
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-1">
                    <Gauge size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-primary tracking-tight">
                    Weekly Stamina Limit (Hours)
                  </h3>
                  <p className="text-[11px] text-outline leading-relaxed">
                    Set the ceiling on your ideal weekly workload limit. 30–40 hours is typical.
                  </p>
                  
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100/60 flex flex-col items-center gap-2">
                    <input 
                      type="range" min="10" max="80" step="1"
                      value={totalCapacity}
                      onChange={e => setTotalCapacity(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <strong className="text-2xl text-primary font-black mt-1">
                      {totalCapacity} hrs / week
                    </strong>
                  </div>
                </div>
              )}

              {/* STEP 2: Administrative operations overhead */}
              {step === 2 && (
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-1">
                    <Clock size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-primary tracking-tight">
                    Admin & Operation Overhead
                  </h3>
                  <p className="text-[11px] text-outline leading-relaxed">
                    Hours spent weekly on invoices, pitching, marketing, and client meetings.
                  </p>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100/60 flex flex-col items-center gap-2">
                    <input 
                      type="range" min="0" max="30" step="1"
                      value={adminHours}
                      onChange={e => setAdminHours(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <strong className="text-2xl text-primary font-black mt-1">
                      {adminHours} hrs / week
                    </strong>
                  </div>
                </div>
              )}

              {/* STEP 3: Focused Daily deep clock limit */}
              {step === 3 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-primary tracking-tight">
                    Creative stamina thresholds
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-black text-outline/50 uppercase tracking-widest pl-1">
                        Max daily focus speed (Deep Work)
                      </label>
                      <p className="text-[10px] text-outline pl-1 mt-0.5 mb-1.5">
                        High energy output without fatigue (4-6 hrs avg).
                      </p>
                      <div className="flex gap-1.5">
                        {[2, 4, 6, 8].map(h => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => setFocusedHoursPerDay(h)}
                            className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition-all ${
                              focusedHoursPerDay === h 
                                ? 'bg-primary text-white' 
                                : 'bg-slate-100 hover:bg-slate-200 text-outline'
                            }`}
                          >
                            {h}h/day
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-outline/50 uppercase tracking-widest pl-1 mb-1">
                        Current Mental Stress Level
                      </label>
                      <div className="flex gap-1.5">
                        {['low', 'medium', 'high'].map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setStressLevel(s)}
                            className={`flex-grow py-1.5 rounded-xl font-bold text-xs transition-all capitalize ${
                              stressLevel === s 
                                ? 'bg-primary text-white' 
                                : 'bg-slate-100 hover:bg-slate-200 text-outline'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Confirm Calibration summary */}
              {step === 4 && (
                <div className="space-y-3 text-center">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-1">
                    <CheckCircle2 size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-primary tracking-tight">
                    Calibrated & Ready
                  </h3>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left space-y-2 text-xs">
                    <div className="flex justify-between items-center pb-1">
                      <span className="font-bold text-outline">Stamina limit:</span>
                      <strong className="text-primary">{totalCapacity} hrs</strong>
                    </div>
                    <div className="flex justify-between items-center pb-1">
                      <span className="font-bold text-outline">Admin overhead:</span>
                      <strong className="text-primary">{adminHours} hrs</strong>
                    </div>
                    <div className="flex justify-between items-center pb-1">
                      <span className="font-bold text-outline">Focus ceiling:</span>
                      <strong className="text-primary">{focusedHoursPerDay} hrs/day</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-outline">Stress score State:</span>
                      <strong className="text-primary capitalize">{stressLevel}</strong>
                    </div>
                  </div>

                  <div className="bg-[#06696a]/5 rounded-xl p-3 border border-[#06696a]/15 text-left flex items-start gap-2">
                    <Bot size={14} className="text-[#06696a] shrink-0 mt-0.5 animate-pulse" />
                    <p className="text-[10px] text-outline leading-snug">
                      Caply says: "Your capacity boundaries have been loaded. Dashboard indicators will adjust immediately."
                    </p>
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
            className={`py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center gap-1 ${
              step > 1 
                ? 'text-primary hover:bg-slate-50' 
                : 'text-outline/10 pointer-events-none'
            }`}
          >
            <ArrowLeft size={14} />
            Back
          </button>

          <button
            type="button"
            onClick={step === totalSteps ? handleSubmit : handleNext}
            className="flex-grow py-3.5 bg-primary hover:bg-[#332e66] text-white rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5"
            id="capacity-submit-btn"
          >
            {step === totalSteps ? 'Apply Settings' : 'Continue'}
            {step < totalSteps && <ArrowRight size={14} />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
