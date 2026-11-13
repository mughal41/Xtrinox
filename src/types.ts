export type RouteName =
  | 'marketplace'
  | 'product-details'
  | 'login'
  | 'checkout'
  | 'workspace'
  | 'devices'
  | 'settings'
  | 'admin/dashboard'
  | 'admin/tools'
  | 'admin/product-cookies'
  | 'admin/users'
  | 'admin/entitlements'
  | 'admin/runtime'
  | 'admin/logs'
  | 'admin/system'
  | 'admin/feature-flags';

export type ThemeId = 'chalk-ink-acid';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  badge: string;
  isDark: boolean;
  primaryColor: string;
  surfaceColor: string;
  accentColor: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: 'assistant' | 'writing' | 'research' | 'productivity';
  categoryLabel: string;
  pricePkr: number;
  priceFormatted: string;
  basePriceUsd: string;
  duration: string;
  shortDescription: string;
  fullDescription: string;
  isSubscribed?: boolean;
  brandColor: string;
  accentBg: string;
  searchKeywords: string;
  features: string[];
  capabilities: { title: string; desc: string }[];
  useCases: { title: string; desc: string }[];
  faqs: { question: string; answer: string }[];
}

export type DeviceStatus = 'trusted' | 'blocked' | 'pending';
export type DeviceKind = 'desktop' | 'phone';

export interface DeviceSession {
  id: string;
  browser: string;
  os: string;
  location: string;
  ip: string;
  lastActive: string;
  status: DeviceStatus;
  current: boolean;
  kind: DeviceKind;
}

export type BridgeState =
  | 'disconnected'
  | 'ready'
  | 'syncing'
  | 'conflict'
  | 'blocked'
  | 'success'
  | 'failed';

export interface UserProfile {
  name: string;
  email: string;
  bio: string;
  isAdmin: boolean;
}
