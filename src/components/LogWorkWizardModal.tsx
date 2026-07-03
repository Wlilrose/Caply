/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  History, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Sparkles,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Client, TimeLog } from '../types';

interface LogWorkWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (logData: Partial<TimeLog>) => void;
  clients: Client[];
  initialLog?: TimeLog | null;
}

export const LogWorkWizardModal: React.FC<LogWorkWizardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clients,
  initialLog
}) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // State state fields
  const [clientId, setClientId] = useState('');
  const [hours, setHours] = useState<number>(1);
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (initialLog) {
      setClientId(initialLog.clientId || '');
      setHours(initialLog.hours || 1);
      setDate(initialLog.date || new Date().toISOString().split('T')[0]);
      setNote(initialLog.note || '');
    } else {
      setClientId(clients.length > 0 ? clients[0].id : '');
      setHours(1);
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
    }
    setStep(1);
  }, [initialLog, isOpen, clients]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1 && !clientId) return;
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
    const payload: Partial<TimeLog> = {
      clientId,
      hours,
      date,
      note,
      updated_at: new Date().toISOString()
    };

    if (initialLog?.id) {
      payload.id = initialLog.id;
    }

    onSave(payload);
    onClose();
  };

  const selectedClient = clients.find(c => c.id === clientId);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-primary/25 backdrop-blur-md"
        id="log-wizard-backdrop"
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative bg-white w-full max-w-md rounded-[28px] p-5 sm:p-8 md:p-10 shadow-2xl border border-primary/5 flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden"
        id="log-wizard-card"
      >
        {/* Header Header */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-black tracking-widest text-[#06696a] uppercase">Timekeeper AI Step</span>
            <h4 className="text-xl font-extrabold text-primary tracking-tight">
              {initialLog ? 'Modify Time Entry' : 'Log Recent Work'}
            </h4>
          </div>
          <button 
            onClick={onClose}
            className="text-outline/40 hover:text-primary transition-colors p-2 hover:bg-slate-50 rounded-xl"
            id="close-log-wizard-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Dynamic Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between text-[10px] font-black text-outline/50 uppercase tracking-widest mb-1.5">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-secondary transition-all duration-300"
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
              {/* STEP 1: Select Client */}
              {step === 1 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-primary tracking-tight">
                    Which client did you work with?
                  </h3>
                  
                  {clients.length === 0 ? (
                    <div className="text-center p-6 bg-slate-50 border border-dashed rounded-2xl flex flex-col items-center">
                      <p className="text-xs text-outline font-bold mb-3">You don't have any clients yet!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 max-h-[230px] overflow-y-auto pr-1">
                      {clients.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setClientId(c.id)}
                          className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                            clientId === c.id 
                              ? 'border-secondary bg-secondary/5 font-extrabold text-primary' 
                              : 'border-slate-100 bg-white hover:border-slate-200 text-outline'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary font-black text-xs flex items-center justify-center">
                              {c.name[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-primary">{c.name}</p>
                              <p className="text-[9px] text-outline uppercase tracking-wider">{c.mode} base</p>
                            </div>
                          </div>
                          {clientId === c.id && (
                            <div className="w-4.5 h-4.5 bg-secondary rounded-full flex items-center justify-center text-white">
                              <CheckCircle2 size={11} className="stroke-[3px]" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: Log Hours */}
              {step === 2 && (
                <div className="space-y-4 text-center">
                  <h3 className="text-lg font-bold text-primary tracking-normal text-left">
                    How much time did you invest?
                  </h3>
                  
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-center gap-6 max-w-xs mx-auto">
                    <button
                      type="button"
                      onClick={() => setHours(prev => Math.max(0.5, prev - 0.5))}
                      className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center font-bold text-primary hover:bg-slate-100 transition-colors shadow-sm"
                    >
                      <Minus size={18} />
                    </button>
                    
                    <div className="w-24 text-center">
                      <span className="font-extrabold text-3xl text-primary block leading-none">
                        {hours}
                      </span>
                      <span className="text-[10px] uppercase font-black tracking-widest text-[#06696a]">
                        Hours
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setHours(prev => prev + 0.5)}
                      className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center font-bold text-primary hover:bg-slate-100 transition-colors shadow-sm"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <div className="flex justify-center gap-1.5 flex-wrap pt-2">
                    {[1, 2, 4, 8].map(h => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHours(h)}
                        className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all ${
                          hours === h 
                            ? 'bg-secondary border-secondary text-white' 
                            : 'bg-white border-slate-200 hover:border-slate-300 text-outline'
                        }`}
                      >
                        {h}h
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: Notes & Calendar Date */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-primary tracking-tight">
                    Add optional metadata context
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-black text-outline/50 uppercase tracking-widest mb-1.5">
                        <Calendar size={13} className="text-secondary" />
                        Log Date
                      </label>
                      <input 
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-white text-xs font-bold text-outline"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-black text-outline/50 uppercase tracking-widest mb-1.5">
                        <MessageSquare size={13} className="text-secondary" />
                        What did you work on?
                      </label>
                      <textarea
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        placeholder="e.g. Design review, bug fixing, customer calls..."
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-white text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Confirm summary */}
              {step === 4 && (
                <div className="space-y-4 text-center">
                  <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <History size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-primary tracking-tight">
                    Confirm Work Log Entry
                  </h3>

                  <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 text-left space-y-2 text-xs">
                    <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
                      <span className="font-bold text-outline">Client:</span>
                      <strong className="text-primary">{selectedClient?.name || 'Unknown client'}</strong>
                    </div>

                    <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
                      <span className="font-bold text-outline">Paced Time Invested:</span>
                      <strong className="text-secondary text-sm">{hours} hrs</strong>
                    </div>

                    <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
                      <span className="font-bold text-outline">Logged Date:</span>
                      <strong className="text-primary">{new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                    </div>

                    {note.trim() && (
                      <div className="pt-1 text-left">
                        <span className="block font-bold text-outline mb-0.5">Notes:</span>
                        <p className="text-[11px] text-primary/80 italic leading-snug">{note}</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-[#06696a]/5 rounded-2xl p-3 border border-[#06696a]/15 text-left flex items-start gap-2.5">
                    <Sparkles size={14} className="text-[#06696a] shrink-0 mt-0.5 animate-pulse" />
                    <p className="text-[11px] text-outline leading-snug">
                      Caply says: "This time log updates your actual hours. We'll automatically adjust your baseline burnout forecasts!"
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
            className="flex-grow py-3.5 bg-secondary hover:bg-orange-600 text-white rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5"
            id="log-submit-btn"
          >
            {step === totalSteps ? 'Save Hours' : 'Continue'}
            {step < totalSteps && <ArrowRight size={14} />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
