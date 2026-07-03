/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IStorageAdapter, AppData, AppSettings } from './interface';
import { Client, TimeLog } from '../../types';

/**
 * Placeholder for future cloud storage implementation (Firebase, Supabase, etc.)
 */
class CloudStorageAdapter implements IStorageAdapter {
  getData(): AppData {
    throw new Error('Cloud storage not implemented');
  }
  saveData(_data: AppData): void {
    throw new Error('Cloud storage not implemented');
  }
  getClients(): Client[] {
    throw new Error('Cloud storage not implemented');
  }
  saveClients(_clients: Client[]): void {
    throw new Error('Cloud storage not implemented');
  }
  getLogs(): TimeLog[] {
    throw new Error('Cloud storage not implemented');
  }
  saveLogs(_logs: TimeLog[]): void {
    throw new Error('Cloud storage not implemented');
  }
  getSettings(): AppSettings {
    throw new Error('Cloud storage not implemented');
  }
  saveSettings(_settings: AppSettings): void {
    throw new Error('Cloud storage not implemented');
  }
}

export const cloudStorageAdapter = new CloudStorageAdapter();
