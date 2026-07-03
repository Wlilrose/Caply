/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Client, TimeLog } from '../types.ts';

/**
 * Gets the ISO week number and year
 */
function getWeekLabel(d: Date): string {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayNum = date.getDay() || 7;
  date.setDate(date.getDate() + 4 - dayNum);
  const year = date.getFullYear();
  const yearStart = new Date(year, 0, 1);
  const week = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `W${week} ${year}`;
}

export type ChartFilter = 'current_week' | 'previous_week' | 'last_30_days';

/**
 * Prepares data for the Weekly Income Trend chart based on filter
 */
export function prepareIncomeTrendData(clients: Client[], logs: TimeLog[], filter: ChartFilter = 'last_30_days') {
  const data: { label: string; income: number; timestamp: number }[] = [];
  const clientMap = new Map<string, Client>();
  clients.forEach(c => clientMap.set(c.id!, c));

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (filter === 'current_week' || filter === 'previous_week') {
    // DAILY resolution
    const startDate = new Date(now);
    const day = now.getDay() || 7;
    startDate.setDate(now.getDate() - day + 1); // This Monday

    if (filter === 'previous_week') {
      startDate.setDate(startDate.getDate() - 7);
    }

    // Fill 7 days
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      data.push({ label, income: 0, timestamp: d.getTime() });
    }

    logs.forEach(log => {
      const logDate = new Date(log.date);
      logDate.setHours(0,0,0,0);
      const logTs = logDate.getTime();
      
      const dayData = data.find(d => d.timestamp === logTs);
      if (dayData) {
        const client = clientMap.get(log.clientId);
        if (client) {
          dayData.income += Number(log.hours) * (client.effectiveHourlyRate || 0);
        }
      }
    });

  } else {
    // WEEKLY resolution for last 30 days (6 weeks total range)
    const weeks: Record<string, { label: string; income: number; timestamp: number }> = {};
    
    // Initialize 6 weeks
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - (i * 7));
      const label = getWeekLabel(d);
      
      const monday = new Date(d);
      const day = monday.getDay() || 7;
      monday.setDate(monday.getDate() - day + 1);
      
      weeks[label] = { label, income: 0, timestamp: monday.getTime() };
    }

    logs.forEach(log => {
      const d = new Date(log.date);
      const label = getWeekLabel(d);
      if (weeks[label]) {
        const client = clientMap.get(log.clientId);
        if (client) {
          weeks[label].income += Number(log.hours) * (client.effectiveHourlyRate || 0);
        }
      }
    });
    return Object.values(weeks).sort((a, b) => a.timestamp - b.timestamp);
  }

  return data;
}

/**
 * Prepares data for the Client Hour Distribution chart
 */
export function prepareHourDistributionData(clients: Client[], logs: TimeLog[]) {
  const clientHours: Record<string, { name: string; value: number }> = {};
  
  // Filter logs for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  logs.filter(l => new Date(l.date) >= thirtyDaysAgo).forEach(log => {
    const client = clients.find(c => c.id === log.clientId);
    if (!client) return;

    if (!clientHours[client.id!]) {
      clientHours[client.id!] = { name: client.name, value: 0 };
    }
    clientHours[client.id!].value += Number(log.hours);
  });

  return Object.values(clientHours).filter(d => d.value > 0);
}
