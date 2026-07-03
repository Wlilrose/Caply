/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const FEATURES = {
  // Core Freelancer Tools (Always Free)
  capacity_tracking: true,
  client_management: true,
  work_logs: true,
  decision_engine: true,
  basic_analytics: true,
  
  // Growth & Collaboration (Always Free)
  shareable_summaries: true,
  data_portability: true, // Import/Export

  // Future SaaS Modules (Architecture Ready)
  cloud_sync: false,
  multi_device: false,
  ai_workload_insights: false,
  team_collaboration: false,
  custom_branding: false,
};

export type FeatureKey = keyof typeof FEATURES;

export const isFeatureEnabled = (key: FeatureKey): boolean => {
  return FEATURES[key] || false;
};

export const AUTH_CONFIG = {
  isAuthEnabled: false, // Future toggle
  user: {
    id: "local_user",
    type: "guest" as const,
  }
};
