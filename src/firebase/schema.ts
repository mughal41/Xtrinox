import { Timestamp } from 'firebase/firestore';

/**
 * NEW Marketplace & Workspace Collections Schema
 * All additions are non-destructive and additive.
 */

// marketplace_tools: Central catalog of all products
export interface MarketplaceTool {
  id: string; // Document ID
  slug: string;
  name: string;
  description: string;
  category: string;
  logoUrl: string;
  imageUrl: string;
  bannerUrl: string;
  monthlyPrice: string;
  active: boolean;
  requiresBridge: boolean;
  featured: boolean;
  launchUrl: string;
  seoContent?: string; // HTML or Text for SEO ranking
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// subscriptions: User purchases
export interface Subscription {
  userId: string;
  toolId: string;
  status: 'active' | 'expired' | 'canceled' | 'suspended';
  startedAt: Timestamp;
  expiresAt: Timestamp;
  autoRenew: boolean;
  paymentProvider: 'stripe' | 'manual' | 'legacy';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// workspace_apps: UI control for user dashboard
export interface WorkspaceApp {
  userId: string;
  toolId: string;
  pinned: boolean;
  lastOpenedAt: Timestamp | null;
  launchCount: number;
  workspaceVisible: boolean;
  createdAt: Timestamp;
}

// entitlements: Logic bridge between subs and runtime permissions
export interface Entitlement {
  userId: string;
  toolId: string;
  payloadEnabled: boolean;
  launchAllowed: boolean;
  runtimeEnabled: boolean;
  expiresAt: Timestamp;
  legacyCompatible: boolean;
  createdAt: Timestamp;
}

// tool_configs: Static runtime configs for each tool
export interface ToolConfig {
  toolId: string;
  requiresBridge: boolean;
  payloadType: 'session' | 'key' | 'none';
  launchUrl: string;
  runtimeVersion: string;
  extensionRequired: boolean;
  compatibilityMode: boolean;
}

// devices: Trusted device management
export interface Device {
  userId: string;
  deviceId: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  trusted: boolean;
  blocked: boolean;
  blockedBy: 'user' | 'admin' | null;
  blockedAt: Timestamp | null;
  lastActiveAt: Timestamp;
  createdAt: Timestamp;
}

// launch_logs: Analytics and audit trail
export interface LaunchLog {
  userId: string;
  toolId: string;
  launchedAt: Timestamp;
  launchStatus: 'success' | 'failed';
  runtimeVersion: string;
  deviceId: string;
}

// runtime_states: Active state of bridge/connector per user
export interface RuntimeStateRecord {
  userId: string;
  bridgeConnected: boolean;
  connectorVersion: string;
  conflictDetected: boolean;
  syncStatus: 'idle' | 'syncing' | 'success' | 'failed';
  lastHeartbeat: Timestamp;
  updatedAt: Timestamp;
}

// notifications: User messaging
export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
}

// billing_profiles: Future Stripe integration
export interface BillingProfile {
  userId: string;
  customerId: string;
  billingEmail: string;
  defaultPaymentMethod: string | null;
  createdAt: Timestamp;
}

// feature_flags: Rollout control
export interface FeatureFlags {
  marketplaceEnabled: boolean;
  workspaceEnabled: boolean;
  newRuntimeEnabled: boolean;
}
