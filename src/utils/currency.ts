/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EXCHANGE_RATES } from '../constants';

export const detectDefaultCurrency = (): string => {
  try {
    // Try to get currency from locale
    const locale = window.navigator.language;
    const numberFormat = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' });
    const detected = numberFormat.resolvedOptions().currency;
    if (detected && EXCHANGE_RATES[detected]) {
      return detected;
    }
  } catch (e) {
    // Fallback to USD
  }
  return 'USD';
};
