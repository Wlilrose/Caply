/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Coffee, Heart, ExternalLink, ShieldCheck, Zap, Rocket, BookOpen } from 'lucide-react';

const RECOMMENDATIONS = [
  {
    title: "Project Management",
    name: "Trello",
    description: "Visual boards to organize your freelance projects.",
    link: "https://trello.com",
    tag: "Efficiency"
  },
  {
    title: "Financial Tracking",
    name: "Wave Accounting",
    description: "Invoicing and accounting software for small businesses.",
    link: "https://waveapps.com",
    tag: "Finance"
  },
  {
    title: "Time Management",
    name: "Toggl Track",
    description: "A simple time tracker for those who need deep logs.",
    link: "https://toggl.com",
    tag: "Productivity"
  },
  {
    title: "Freelance Contracts",
    name: "Bonsai",
    description: "Business management for creative freelancers.",
    link: "https://hellobonsai.com",
    tag: "Legal"
  }
];

export const Grow = () => {
  return (
    <div className="space-y-12 pb-12">
      <header>
        <h2 className="text-3xl font-black text-primary tracking-tight">Growth & Resources</h2>
        <p className="text-outline">Free tools and ways to support Caply's mission.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-primary rounded-[32px] p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Coffee size={120} />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
              <Coffee size={24} />
            </div>
            <h3 className="text-2xl font-black mb-2 tracking-tight">Support Caply</h3>
            <p className="text-white/70 text-sm mb-8 leading-relaxed">
              Caply is fully free and built for the community. If it helps you manage your sanity and income, consider supporting the developer!
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="https://www.buymeacoffee.com" 
                target="_blank" 
                rel="noreferrer"
                className="bg-white text-primary px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:scale-105 transition-all"
              >
                Buy me a Coffee
              </a>
              <a 
                href="https://paypal.me" 
                target="_blank" 
                rel="noreferrer"
                className="bg-white/10 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-white/20 transition-all border border-white/10"
              >
                PayPal Support
              </a>
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-surface rounded-[32px] p-8 border border-primary/5 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Rocket size={120} className="text-primary" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck size={24} className="text-primary" />
            </div>
            <h3 className="text-2xl font-black text-primary mb-2 tracking-tight">Future-Proof</h3>
            <p className="text-outline text-sm mb-6 leading-relaxed">
              We're building advanced capabilities like **Cloud Sync**, **Multi-device access**, and **Smart Weekly Insights** to help you scale.
            </p>
            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/5">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Roadmap</p>
              <ul className="text-xs space-y-1.5 text-outline font-medium">
                <li className="flex items-center gap-2 opacity-50">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Client Profitability Score
                </li>
                <li className="flex items-center gap-2 opacity-50">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Invoice + Earnings Summary
                </li>
                <li className="flex items-center gap-2 opacity-50">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Export to PDF Reports and more...
                </li>
              </ul>
            </div>
          </div>
        </motion.div> 
      </section>

      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Zap className="text-amber-600" size={20} />
          </div>
          <h3 className="text-2xl font-black text-primary tracking-tight">Recommended Tools</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {RECOMMENDATIONS.map((tool, idx) => (
            <motion.a
              key={idx}
              href={tool.link}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-surface p-6 rounded-3xl border border-primary/5 hover:border-primary/20 hover:shadow-xl transition-all group flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[9px] font-black text-primary/40 uppercase tracking-widest bg-primary/5 px-2 py-1 rounded-md">
                  {tool.tag}
                </span>
                <ExternalLink size={14} className="text-outline/30 group-hover:text-primary transition-colors" />
              </div>
              <h4 className="font-black text-primary mb-1">{tool.name}</h4>
              <p className="text-xs text-outline leading-relaxed flex-grow">{tool.description}</p>
              <div className="mt-4 pt-4 border-t border-primary/5 text-[10px] font-black text-primary uppercase tracking-widest text-right">
                View Tool
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      <div className="bg-surface-container-low rounded-[32px] p-8 border border-primary/5 flex flex-col items-center text-center">
        <Heart className="text-red-500 mb-4 fill-red-500" size={32} />
        <h3 className="text-xl font-black text-primary mb-2">Share the Love</h3>
        <p className="text-sm text-outline max-w-sm mb-6">
          If Caply changed how you look at your workload, share it with your fellow freelancers!
        </p>
        <button 
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Caply - Freelancer Workload System',
                text: 'I started using Caply to manage my freelance workload and income. It is life-changing!',
                url: window.location.href
              });
            } else {
              navigator.clipboard.writeText(`Check out Caply: ${window.location.href}`);
              alert('Link copied to clipboard!');
            }
          }}
          className="bg-primary text-white px-8 py-3 rounded-2xl font-bold transition-all hover:scale-105"
        >
          Share Caply
        </button>
      </div>
    </div>
  );
};
