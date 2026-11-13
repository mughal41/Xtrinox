import { RouteName } from '../types';

export type AdminRoute =
  | 'admin/dashboard'
  | 'admin/tools'
  | 'admin/product-cookies'
  | 'admin/users'
  | 'admin/entitlements'
  | 'admin/runtime'
  | 'admin/logs'
  | 'admin/system'
  | 'admin/feature-flags';

export interface AdminTool {
  id: string; // Firestore doc ID (slug)
  name: string;
  category: 'assistant' | 'writing' | 'research' | 'productivity';
  categoryLabel: string;
  monthlyPrice: number;
  monthlyPriceFormatted: string;
  basePriceUsd: string;
  imageUrl: string;
  launchUrl: string;
  seoContent: string;
  isActive: boolean;
  requiresBridge: boolean;
  featured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CookieItem {
  name: string;
  value: string;
  domain: string;
  path: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'Lax' | 'Strict' | 'None';
  expires?: number;
}

export interface ProductCookieSet {
  id: string;
  toolId: string;
  toolName: string;
  title: string;
  cookies: CookieItem[];
  cookieCount: number;
  assignedUsersCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserAccountStatus = 'operational' | 'suspended' | 'restoration_requested';

export interface UserSubscription {
  id: string;
  toolId: string;
  toolName: string;
  cookieSetId?: string;
  cookieSetName?: string;
  expiresAt: string;
  status: 'active' | 'legacy' | 'auto_detect';
  assignedAt: string;
}

export interface UserLaunchRecord {
  id: string;
  toolId: string;
  toolName: string;
  timestamp: string;
  status: 'success' | 'blocked' | 'warning';
}

export type DeviceTrustState =
  | 'trusted'
  | 'blocked_by_user'
  | 'blocked_by_admin'
  | 'restore_requested';

export interface UserDeviceRecord {
  id: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  lastActive: string;
  status: DeviceTrustState;
}

export interface AdminUser {
  uid: string;
  email: string;
  status: UserAccountStatus;
  role?: string;
  createdAt: string;
  lastLogin?: string;
  isLegacy?: boolean;
  subscriptions: UserSubscription[];
  launchHistory: UserLaunchRecord[];
  devices: UserDeviceRecord[];
}

export interface AuditLogRecord {
  id: string;
  action: string;
  actionType: 'create' | 'update' | 'delete' | 'security' | 'access' | 'system';
  targetId: string;
  targetType: string;
  adminUid: string;
  adminEmail: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface SystemSettingsState {
  maintenanceMode: boolean;
  userRegistration: boolean;
  marketplaceVisibility: boolean;
  requiredBridgeVersion: string;
  lastUpdated: string;
}

export type SystemSettings = SystemSettingsState;

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}
