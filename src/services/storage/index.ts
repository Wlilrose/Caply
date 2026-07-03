/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { localStorageAdapter } from './localStorageAdapter';
// import { cloudStorageAdapter } from './cloudStorageAdapter';

/**
 * Centrally managed storage instance.
 * Swap to cloudStorageAdapter when ready for backend integration.
 */
export const storage = localStorageAdapter;
