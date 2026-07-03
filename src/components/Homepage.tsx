/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Compass, 
  Clock, 
  Sparkles, 
  HelpCircle, 
  BarChart3, 
  Rocket, 
  Sliders, 
  FileText,
  TrendingUp,
  BrainCircuit,
  Heart,
  MousePointerClick
} from 'lucide-react';
import { motion } from 'motion/react';
import { CapacityStatus } from '../types';

interface HomepageProps {
  onNavigate: (view: 'dashboard' | 'settings') => void;
  onOpenLogHours: () => void;
  onOpenSimulation: () => void;
  onOpenCapacity: () => void;
  onOpenAddClient: () => void;
  stats: CapacityStatus;
  userEmail: string;
}

export const Homepage: React.FC<HomepageProps> = ({
  onNavigate,
  onOpenLogHours,
  onOpenSimulation,
  onOpenCapacity,
  onOpenAddClient,
  stats,
  userEmail
}) => {
  // Conversational coach suggestion based on current utilization stats
  const getCoachGreeting = () => {
    const hours = stats.adjustedHours;
    if (hours === 0) {
      return "Your canvas is clean. Let's design a high-value, low-burnout roster together!";
    }
    if (stats.status === 'overloaded') {
      return "Stamina alert: Your active workload is exceeding ideal capacities. Let's review simulations to re-price or trim agreements.";
    }
    if (stats.status === 'balanced') {
      return "Brilliant rhythm! Your commitments perfectly balance focus states with administrative ease. Keep doing what you do.";
    }
    return "You have plenty of quiet focus focus blocks left. Ready to simulation-test another strategic opportunity?";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12" id="homepage-container">
      {/* Intro Welcome Card */}
      <motion.header 
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-left space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold shadow-sm">
          <BrainCircuit size={13} className="animate-pulse" />
          <span>Active Practice AI Connected</span>
        </div>
        
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tight leading-tight">
            Clear mind. <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-primary via-[#06696a] to-primary bg-clip-text text-transparent">
              Burnout-free calendar.
            </span>
          </h2>
          <p className="text-outline text-base max-w-xl mt-3 font-medium">
            Good day, <strong className="text-primary font-bold">{userEmail === 'guest@caply.ai' ? 'Guest Freelancer' : userEmail}</strong>! 
            I'm Caply, your tactical business assistant. I'm here to ensure you maximize billable margins while protecting your daily stamina limits.
          </p>
        </div>
      </motion.header>

      {/* Primary Coach Callout Panel */}
      <motion.div 
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="p-8 rounded-[32px] bg-gradient-to-br from-primary to-[#332e66] text-white shadow-xl shadow-primary/15 relative overflow-hidden group"
      >
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-all duration-700" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-md">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#06696a] bg-white px-3 py-1 rounded-full shadow-sm">
              AI Coach Status
            </span>
            <p className="text-lg font-bold leading-snug">
              "{getCoachGreeting()}"
            </p>
            <div className="flex items-center gap-4 text-xs text-white/80 font-medium">
              <span>Planned commitment: <strong className="text-white">{stats.plannedHours}h/wk</strong></span>
              <span>•</span>
              <span>Utilization: <strong className="text-white">{stats.status || 'balanced'}</strong></span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('dashboard')}
            className="px-6 py-4 bg-white text-primary font-bold text-xs rounded-2xl hover:scale-103 active:scale-98 transition-all shadow-xl hover:shadow-2xl hover:shadow-white/10 shrink-0 inline-flex items-center gap-2"
          >
            Enter Dashboard Hub
            <Compass size={16} />
          </button>
        </div>
      </motion.div>

      {/* Guided Quick Actions Grid */}
      <div className="space-y-5">
        <h3 className="text-lg font-extrabold text-primary tracking-tight pl-1">
          Tactical Tools & Guided Pilots
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={onOpenSimulation}
            className="flex items-start text-left p-6 bg-white rounded-3xl border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all group"
            id="hp-run-sim-card"
          >
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
              <Sparkles size={20} />
            </div>
            <div className="ml-4 space-y-1">
              <h4 className="font-extrabold text-sm text-primary group-hover:text-emerald-700 transition-colors">
                Can I Take Another Client?
              </h4>
              <p className="text-xs text-outline/80 leading-snug">
                Simulate potential fees, contracts, milestone deliveries and stress load limits prior to signing contracts.
              </p>
            </div>
          </button>

          <button
            onClick={onOpenLogHours}
            className="flex items-start text-left p-6 bg-white rounded-3xl border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all group"
            id="hp-log-work-card"
          >
            <div className="p-3.5 bg-orange-50 text-orange-600 rounded-2xl group-hover:scale-110 transition-transform">
              <Clock size={20} />
            </div>
            <div className="ml-4 space-y-1">
              <h4 className="font-extrabold text-sm text-primary group-hover:text-orange-700 transition-colors">
                Log Recent Billables
              </h4>
              <p className="text-xs text-outline/80 leading-snug">
                Instruct Caply on what you logged on each client contract to monitor real burnout rates.
              </p>
            </div>
          </button>

          <button
            onClick={onOpenAddClient}
            className="flex items-start text-left p-6 bg-white rounded-3xl border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all group"
            id="hp-add-client-card"
          >
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
              <FileText size={20} />
            </div>
            <div className="ml-4 space-y-1">
              <h4 className="font-extrabold text-sm text-primary group-hover:text-blue-700 transition-colors">
                Introduce a Client Contract
              </h4>
              <p className="text-xs text-outline/80 leading-snug">
                Add an active flat-rate, day rate or hourly engagement to your live active roster portfolio.
              </p>
            </div>
          </button>

          <button
            onClick={onOpenCapacity}
            className="flex items-start text-left p-6 bg-white rounded-3xl border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all group"
          >
            <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform">
              <Sliders size={20} />
            </div>
            <div className="ml-4 space-y-1">
              <h4 className="font-extrabold text-sm text-primary group-hover:text-purple-700 transition-colors">
                Recalibrate Stamina Caps
              </h4>
              <p className="text-xs text-outline/80 leading-snug">
                Adjust unpaid overhead hours, daily deep work focuses, and baseline weekly workload boundaries.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Helpful Quick Links Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        <div className="flex gap-3 items-center">
          <Heart size={16} className="text-rose-500 fill-rose-500 shrink-0" />
          <span className="text-xs text-outline font-medium leading-tight">
            Built to promote wellness, focus, and healthy pricing transparency for independent professionals.
          </span>
        </div>
        
        <div className="flex gap-4 md:justify-end text-xs font-black text-[#06696a] tracking-tight uppercase">
          <button onClick={() => onNavigate('dashboard')} className="hover:underline flex items-center gap-1">
            Dashboard Hub
          </button>
          <span>•</span>
          <button onClick={() => onNavigate('settings')} className="hover:underline flex items-center gap-1">
            Preferences Settings
          </button>
        </div>
      </div>
    </div>
  );
};
