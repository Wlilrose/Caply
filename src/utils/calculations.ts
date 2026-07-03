/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Client, CapacityStatus, TimeLog } from '../types.ts';
import { EXCHANGE_RATES } from '../constants';

/**
 * Gets the current week number (ISO-8601)
 */
function getWeekNumber(d: Date): number {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayNum = date.getDay() || 7;
  date.setDate(date.getDate() + 4 - dayNum);
  const yearStart = new Date(date.getFullYear(), 0, 1);
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Filters logs to only those in the current week
 */
export function filterCurrentWeekLogs(logs: TimeLog[]): TimeLog[] {
  const now = new Date();
  const currentWeek = getWeekNumber(now);
  const currentYear = now.getFullYear();

  return logs.filter(log => {
    if (!log.date) return false;
    const logDate = new Date(log.date);
    return getWeekNumber(logDate) === currentWeek && logDate.getFullYear() === currentYear;
  });
}

/**
 * Groups logs by week and year
 */
function getHistoricalWeeklyAverages(clientId: string, logs: TimeLog[], numWeeks: number = 4): number {
  const weeklyHours: Record<string, number> = {};
  const now = new Date();
  const currentWeek = getWeekNumber(now);
  const currentYear = now.getFullYear();

  // We want to look at the last N completed weeks or include current if it's the only one?
  // Let's look at all logs and group them.
  logs.filter(l => l.clientId === clientId).forEach(log => {
    const d = new Date(log.date);
    const w = getWeekNumber(d);
    const y = d.getFullYear();
    const key = `${y}-W${w}`;
    
    // Exclude current week from historical average if we have other weeks?
    // The prompt says "If no history -> fallback to planned hours".
    // Let's include everything except the current week for "history" to be cleaner, 
    // OR just follow "average of last N weeks".
    if (y < currentYear || (y === currentYear && w < currentWeek)) {
      weeklyHours[key] = (weeklyHours[key] || 0) + Number(log.hours);
    }
  });

  const keys = Object.keys(weeklyHours);
  if (keys.length === 0) return 0;
  
  // Sort by key (roughly chronological) and take last N
  const lastNKeys = keys.sort().slice(-numWeeks);
  const total = lastNKeys.reduce((sum, k) => sum + weeklyHours[k], 0);
  return total / lastNKeys.length;
}

/**
 * Calculates planned and actual metrics for a client.
 */
export function calculateClientMetrics(client: Partial<Client>, logs: TimeLog[] = [], currency: string = 'USD'): Client {
  let plannedWeeklyHours = 0;
  let weeklyIncome = 0;

  if (client.mode === 'hourly') {
    const p = client.params as any;
    plannedWeeklyHours = Number(p?.expectedHoursPerWeek || 0);
    weeklyIncome = Number(p?.hourlyRate || 0) * plannedWeeklyHours;
  } else if (client.mode === 'daily') {
    const p = client.params as any;
    plannedWeeklyHours = Number(p?.daysPerWeek || 0) * Number(p?.hoursPerDay || 0);
    weeklyIncome = Number(p?.dayRate || 0) * Number(p?.daysPerWeek || 0);
  } else if (client.mode === 'task') {
    const p = client.params as any;
    plannedWeeklyHours = Number(p?.estimatedHoursPerTask || 0) * Number(p?.tasksPerWeek || 0);
    weeklyIncome = Number(p?.pricePerTask || 0) * Number(p?.tasksPerWeek || 0);
  }

  // Calculate actual hours for THIS week only
  const currentWeekLogs = filterCurrentWeekLogs(logs);
  const actualWeeklyHours = currentWeekLogs
    .filter(log => log.clientId === client.id)
    .reduce((sum, log) => sum + Number(log.hours || 0), 0);

  // Calculate Average Actual Hours (History)
  const averageActualHours = getHistoricalWeeklyAverages(client.id!, logs);

  // Adjusted Workload: max(planned_hours, average_actual_hours)
  // If no average (0), fallback to planned
  const effectiveAvg = averageActualHours > 0 ? averageActualHours : plannedWeeklyHours;
  const adjustedWeeklyHours = Math.max(plannedWeeklyHours, effectiveAvg);

  const effectiveHourlyRate = plannedWeeklyHours > 0 ? weeklyIncome / plannedWeeklyHours : 0;
  const actualWeeklyIncome = actualWeeklyHours * effectiveHourlyRate;

  // Value Score Calculation (0-100)
  // 1. Rate Score (50%): Benchmarked at $150/h
  const factor = EXCHANGE_RATES[currency] || 1;
  const rateBenchmark = 150 * factor;
  const rateScore = Math.min((effectiveHourlyRate / rateBenchmark) * 50, 50);
  
  // 2. Growth Score (25%): 1-5 scale
  const growthScore = ((client.growthPotential || 3) / 5) * 25;
  
  // 3. Reliability Score (25%): 1-5 scale
  const reliabilityScore = ((client.paymentReliability || 3) / 5) * 25;

  const valueScore = Math.round(rateScore + growthScore + reliabilityScore);

  return {
    ...client,
    plannedWeeklyHours,
    actualWeeklyHours,
    averageActualHours,
    adjustedWeeklyHours,
    weeklyIncome,
    actualWeeklyIncome,
    effectiveHourlyRate,
    valueScore,
    growthPotential: client.growthPotential || 3,
    paymentReliability: client.paymentReliability || 3,
  } as Client;
}

/**
 * Computes global capacity and income stats based on planned metrics.
 */
export function getCapacityStatus(clients: Client[], totalCapacity: number): CapacityStatus {
  const plannedHours = clients.reduce((sum, c) => sum + (c.plannedWeeklyHours || 0), 0);
  const actualHours = clients.reduce((sum, c) => sum + (c.actualWeeklyHours || 0), 0);
  const adjustedHours = clients.reduce((sum, c) => sum + (c.adjustedWeeklyHours || 0), 0);
  
  const remainingCapacity = (totalCapacity || 0) - plannedHours;
  const adjustedRemainingCapacity = (totalCapacity || 0) - adjustedHours;
  
  const totalWeeklyIncome = clients.reduce((sum, c) => sum + (c.weeklyIncome || 0), 0);
  const actualWeeklyIncome = clients.reduce((sum, c) => sum + (c.actualWeeklyIncome || 0), 0);
  const avgHourlyRate = plannedHours > 0 ? totalWeeklyIncome / plannedHours : 0;

  let status: CapacityStatus['status'] = 'underloaded';
  
  // Base status on adjusted hours (reality)
  const effectiveHoursForStatus = adjustedHours;
  const utilizationPercentage = (effectiveHoursForStatus / (totalCapacity || 1)) * 100;
  
  if (effectiveHoursForStatus > totalCapacity) {
    status = 'overloaded';
  } else if (utilizationPercentage >= 60) {
    status = 'balanced';
  } else {
    status = 'underloaded';
  }

  return {
    totalCapacity,
    plannedHours,
    actualHours,
    adjustedHours,
    remainingCapacity,
    adjustedRemainingCapacity,
    status,
    totalWeeklyIncome,
    actualWeeklyIncome,
    avgHourlyRate,
  };
}
