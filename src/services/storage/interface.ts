/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Client, TimeLog, SimulationInput } from '../../types';

export interface AppSettings {
  weeklyCapacity: number;
  currency: string;
  simInput: SimulationInput;
  onboardingCompleted: boolean;
}

export interface AppData {
  user_id: string;
  clients: Client[];
  logs: TimeLog[];
  settings: AppSettings;
  history: any[];
}

export interface IStorageAdapter {
  getData(): AppData;
  saveData(data: AppData): void;
  
  getClients(): Client[];
  saveClients(clients: Client[]): void;
  
  getLogs(): TimeLog[];
  saveLogs(logs: TimeLog[]): void;
  
  getSettings(): AppSettings;
  saveSettings(settings: AppSettings): void;
}
