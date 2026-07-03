/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IStorageAdapter, AppData, AppSettings } from './interface';
import { SimulationInput, Client, TimeLog } from '../../types';
import { detectDefaultCurrency } from '../../utils/currency';

const STORAGE_KEY = 'caply_storage_v1';

const DEFAULT_SIM_INPUT: SimulationInput = {
  name: '',
  mode: 'hourly',
  params: { hourlyRate: 100, expectedHoursPerWeek: 10 },
  growthPotential: 3,
  paymentReliability: 3
};

const DEFAULT_SETTINGS: AppSettings = {
  weeklyCapacity: 40,
  currency: detectDefaultCurrency(),
  simInput: DEFAULT_SIM_INPUT,
  onboardingCompleted: false
};

const DEFAULT_DATA: AppData = {
  user_id: 'local-user',
  clients: [
    {
      id: '1',
      name: 'Acme Corp',
      mode: 'hourly',
      params: { hourlyRate: 150, expectedHoursPerWeek: 15 },
      growthPotential: 4,
      paymentReliability: 5,
      plannedWeeklyHours: 15,
      actualWeeklyHours: 0,
      averageActualHours: 0,
      adjustedWeeklyHours: 15,
      weeklyIncome: 2250,
      effectiveHourlyRate: 150,
      valueScore: 80,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Stark Industries',
      mode: 'daily',
      params: { dayRate: 800, daysPerWeek: 2, hoursPerDay: 8 },
      growthPotential: 5,
      paymentReliability: 4,
      plannedWeeklyHours: 16,
      actualWeeklyHours: 0,
      averageActualHours: 0,
      adjustedWeeklyHours: 16,
      weeklyIncome: 1600,
      effectiveHourlyRate: 100,
      valueScore: 75,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  logs: [],
  settings: DEFAULT_SETTINGS,
  history: []
};

class LocalStorageAdapter implements IStorageAdapter {
  private cache: AppData | null = null;

  private migrateIfNecessary(): AppData {
    // Try to find old data
    const oldClients = localStorage.getItem('baseClients');
    const oldLogs = localStorage.getItem('logs');
    const oldCapacity = localStorage.getItem('totalCapacity');
    const oldCurrency = localStorage.getItem('currency');
    const oldPremium = localStorage.getItem('isPremium');
    const oldSim = localStorage.getItem('simInput');

    if (oldClients || oldLogs || oldCapacity || oldCurrency || oldPremium || oldSim) {
      const migrated: AppData = { ...DEFAULT_DATA };
      
      try {
        if (oldClients) migrated.clients = JSON.parse(oldClients).map((c: any) => ({
          ...c,
          created_at: c.created_at || new Date().toISOString(),
          updated_at: c.updated_at || new Date().toISOString()
        }));
        if (oldLogs) migrated.logs = JSON.parse(oldLogs).map((l: any) => ({
          ...l,
          created_at: l.created_at || new Date().toISOString(),
          updated_at: l.updated_at || new Date().toISOString()
        }));
        if (oldCapacity) migrated.settings.weeklyCapacity = JSON.parse(oldCapacity);
        if (oldCurrency) migrated.settings.currency = oldCurrency;
        if (oldSim) migrated.settings.simInput = JSON.parse(oldSim);
        
        // Remove old items to prevent repeated migration
        localStorage.removeItem('baseClients');
        localStorage.removeItem('logs');
        localStorage.removeItem('totalCapacity');
        localStorage.removeItem('currency');
        localStorage.removeItem('isPremium');
        localStorage.removeItem('simInput');
        
        this.saveData(migrated);
        return migrated;
      } catch (e) {
        console.error('Migration failed:', e);
      }
    }
    
    return DEFAULT_DATA;
  }

  getData(): AppData {
    if (this.cache) return this.cache;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      this.cache = this.migrateIfNecessary();
      return this.cache;
    }

    try {
      this.cache = JSON.parse(stored);
      return this.cache!;
    } catch (e) {
      console.error('Failed to parse storage:', e);
      return DEFAULT_DATA;
    }
  }

  saveData(data: AppData): void {
    this.cache = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  getClients(): Client[] {
    return this.getData().clients;
  }

  saveClients(clients: Client[]): void {
    const data = this.getData();
    this.saveData({ ...data, clients });
  }

  getLogs(): TimeLog[] {
    return this.getData().logs;
  }

  saveLogs(logs: TimeLog[]): void {
    const data = this.getData();
    this.saveData({ ...data, logs });
  }

  getSettings(): AppSettings {
    return this.getData().settings;
  }

  saveSettings(settings: AppSettings): void {
    const data = this.getData();
    this.saveData({ ...data, settings });
  }
}

export const localStorageAdapter = new LocalStorageAdapter();
