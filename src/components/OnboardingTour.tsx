/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
  onComplete: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const steps: TourStep[] = useMemo(() => [
    {
      target: '#tour-reality-check',
      title: 'Reality Check',
      content: 'This is your dashboard. It calculates your real utilization by comparing your planned hours against your historical performance.',
      position: 'right'
    },
    {
      target: '#tour-add-client',
      title: 'Growth Planning',
      content: 'Click here to add new clients. You can simulate different pricing models to see how they impact your weekly workload and income.',
      position: 'bottom'
    },
    {
      target: '#tour-add-log',
      title: 'Track Performance',
      content: 'Log your actual hours here. Caply uses this data to refine your "Reality Check" and predict overage risk.',
      position: 'top'
    },
    {
      target: '#tour-decision-nav',
      title: 'Decision Engine',
      content: 'Use this tool to simulate potential changes to your roster before you say "Yes" to a new project.',
      position: 'bottom'
    }
  ], []);

  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const updateCoords = () => {
      const element = document.querySelector(steps[currentStep].target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setCoords({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
        
        // Only scroll if not fully visible
        const padding = 100;
        if (rect.top < padding || rect.bottom > window.innerHeight - padding) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };

    updateCoords();
    window.addEventListener('scroll', updateCoords, true);
    window.addEventListener('resize', updateCoords);
    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [currentStep, steps]);

  const tooltipStyle = useMemo(() => {
    const isMobile = windowSize.width < 768;
    const padding = 20;
    const tooltipWidth = isMobile ? Math.min(windowSize.width - 40, 320) : 320;
    
    if (isMobile) {
      return {
        bottom: padding,
        left: '50%',
        transform: 'translateX(-50%)',
        width: tooltipWidth,
      };
    }

    let top = coords.top;
    let left = coords.left + (coords.width / 2) - (tooltipWidth / 2);

    const step = steps[currentStep];
    
    if (step.position === 'bottom') {
      top = coords.top + coords.height + padding;
    } else if (step.position === 'top') {
      top = coords.top - 240; // Approx height
    } else if (step.position === 'right') {
      left = coords.left + coords.width + padding;
      top = coords.top + (coords.height / 2) - 100;
    } else if (step.position === 'left') {
      left = coords.left - tooltipWidth - padding;
      top = coords.top + (coords.height / 2) - 100;
    }

    // Edge detection & containment
    top = Math.max(padding, Math.min(top, windowSize.height - 250 - padding));
    left = Math.max(padding, Math.min(left, windowSize.width - tooltipWidth - padding));

    return {
      top,
      left,
      width: tooltipWidth,
    };
  }, [coords, currentStep, steps, windowSize]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Dimmed Background with Hole */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            <motion.rect 
              initial={false}
              animate={{
                x: coords.left - 8,
                y: coords.top - 8,
                width: coords.width + 16,
                height: coords.height + 16,
              }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              rx="12" 
              fill="black" 
            />
          </mask>
        </defs>
        <rect 
          width="100%" 
          height="100%" 
          fill="rgba(0,0,0,0.7)" 
          mask="url(#spotlight-mask)" 
          onClick={onComplete}
        />
      </svg>

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="fixed pointer-events-auto bg-white rounded-3xl shadow-2xl p-6 border border-primary/10"
          style={tooltipStyle}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">
              Step {currentStep + 1} of {steps.length}
            </span>
            <button onClick={onComplete} className="text-outline hover:text-primary">
              <X size={16} />
            </button>
          </div>
          
          <h4 className="text-lg font-black text-primary mb-2 tracking-tight">
            {steps[currentStep].title}
          </h4>
          <p className="text-sm text-outline leading-relaxed mb-6">
            {steps[currentStep].content}
          </p>

          <div className="flex justify-between items-center">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`p-2 rounded-xl transition-colors ${currentStep === 0 ? 'text-primary/10' : 'text-primary hover:bg-primary/5'}`}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? (
                <>Finish <Check size={16} /></>
              ) : (
                <>Next <ChevronRight size={16} /></>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
