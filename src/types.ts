/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PricingMode = 'hourly' | 'daily' | 'task';

export interface HourlyParams {
  hourlyRate: number;
  expectedHoursPerWeek: number;
}

export interface DailyParams {
  dayRate: number;
  daysPerWeek: number;
  hoursPerDay: number;
}

export interface TaskParams {
  pricePerTask: number;
  estimatedHoursPerTask: number;
  tasksPerWeek: number;
}

export interface TimeLog {
  id: string;
  clientId: string;
  date: string; // ISO string
  hours: number;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Client {
  id: string;
  name: string;
  mode: PricingMode;
  params: HourlyParams | DailyParams | TaskParams;
  plannedWeeklyHours: number;
  actualWeeklyHours: number;
  averageActualHours: number;
  adjustedWeeklyHours: number;
  weeklyIncome: number;
  actualWeeklyIncome?: number;
  effectiveHourlyRate: number;
  valueScore: number;
  growthPotential: number; // 1-5
  paymentReliability: number; // 1-5
  created_at?: string;
  updated_at?: string;
}

export interface CapacityStatus {
  totalCapacity: number;
  plannedHours: number;
  actualHours: number;
  adjustedHours: number;
  remainingCapacity: number;
  adjustedRemainingCapacity: number;
  status: 'underloaded' | 'balanced' | 'overloaded';
  totalWeeklyIncome: number;
  actualWeeklyIncome?: number;
  avgHourlyRate: number;
}

export interface SimulationInput {
  name: string;
  mode: PricingMode;
  params: HourlyParams | DailyParams | TaskParams;
  growthPotential: number;
  paymentReliability: number;
}

export interface SimulationResult {
  canAccept: boolean;
  status: 'yes' | 'warning' | 'no';
  message: string;
  remainingHoursAfter: number;
  incomeImpact: number;
  isSmart?: boolean;
}
