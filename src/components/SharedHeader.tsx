import React, { useState, useRef, useEffect } from 'react';
import { BrandLogo } from './BrandLogo';
import { RouteName, BridgeState, UserProfile, ThemeId } from '../types';
import { useAuthStore } from '../state/useAuthStore';
import {
  ArrowLeft,
  Menu,
  X,
  Puzzle,
  ChevronDown,
  User,
  Layers,
  Laptop,
  Shield,
  LogOut,
  Sparkles
} from 'lucide-react';

interface SharedHeaderProps {
  currentRoute: RouteName;
  onNavigate: (route: RouteName, param?: string) => void;
  bridgeState?: BridgeState;
  user?: UserProfile;
  currentTheme?: ThemeId;
  onSelectTheme?: (theme: ThemeId) => void;
}

export const SharedHeader: React.FC<SharedHeaderProps> = ({
  currentRoute,
  onNavigate,
  bridgeState = 'disconnected',
  user = { name: 'Account user', email: 'account@example.com', bio: '', isAdmin: false }
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Real authenticated user state from Firebase
  const { user: authUser, isAdmin, signOut } = useAuthStore();

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [userMenuOpen]);

  // Dedicated minimal header for Login
  if (currentRoute === 'login') {
    return (
      <header className="h-[72px] bg-[var(--header)] border-b border-[var(--header-border)] sticky top-0 z-40 transition-colors">
        <div className="max-w-[1200px] h-full mx-auto px-6 flex items-center justify-between">
          <button
            onClick={() => onNavigate('marketplace')}
            className="flex items-center text-left hover:opacity-90 transition-opacity cursor-pointer"
            aria-label="Xtrinox Marketplace"
          >
            <BrandLogo size="md" />
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('marketplace')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text)] hover:text-[var(--brand)] px-3 py-2 rounded-lg hover:bg-[var(--surface-raised)] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Marketplace</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  // Dedicated context header for Checkout
  if (currentRoute === 'checkout') {
    return (
      <header className="h-[72px] bg-[var(--header)] border-b border-[var(--header-border)] sticky top-0 z-40 transition-colors">
        <div className="max-w-[1140px] h-full mx-auto px-6 flex items-center justify-between gap-4">
          <button
            onClick={() => onNavigate('marketplace')}
            className="flex items-center text-left hover:opacity-90 transition-opacity cursor-pointer"
            aria-label="Xtrinox Marketplace"
          >
            <BrandLogo size="md" />
          </button>
          <span className="hidden sm:inline-block text-xs text-[var(--muted)] font-medium tracking-wide">
            Manual payment · Review required
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('marketplace')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text)] hover:text-[var(--brand)] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Marketplace</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  // Standard Header for Marketplace, Product Details, Workspace, Devices, Settings
  const isConnected = bridgeState === 'ready' || bridgeState === 'syncing' || bridgeState === 'success';
  const isConflict = bridgeState === 'conflict' || bridgeState === 'blocked';

  const displayName = authUser
    ? (authUser.displayName || user.name || authUser.email?.split('@')[0] || 'Member')
    : '';
  const initial = displayName ? displayName.charAt(0).toUpperCase() : 'U';

  return (
    <header className="h-[72px] bg-[var(--header)] border-b border-[var(--header-border)] sticky top-0 z-40 transition-colors shadow-xs">
      <div className="max-w-[1280px] h-full mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Brand Logo & Nav */}
        <div className="flex items-center gap-4 lg:gap-8 min-w-0">
          <button
            onClick={() => onNavigate('marketplace')}
            className="flex items-center text-left hover:opacity-90 transition-opacity cursor-pointer shrink-0"
            aria-label="Xtrinox Home"
          >
            <BrandLogo size="md" />
          </button>

          {/* Desktop Nav Links (Visible on >= lg: 1024px) */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary navigation">
            <button
              onClick={() => onNavigate('marketplace')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                currentRoute === 'marketplace' || currentRoute === 'product-details'
                  ? 'bg-[var(--brand)] text-[var(--brand-text)] shadow-sm'
                  : 'text-[var(--text)] hover:bg-[var(--surface-raised)]'
              }`}
            >
              Marketplace
            </button>
            <button
              onClick={() => onNavigate('workspace')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                currentRoute === 'workspace'
                  ? 'bg-[var(--brand)] text-[var(--brand-text)] shadow-sm'
                  : 'text-[var(--text)] hover:bg-[var(--surface-raised)]'
              }`}
            >
              Workspace
            </button>
            <button
              onClick={() => onNavigate('devices')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                currentRoute === 'devices'
                  ? 'bg-[var(--brand)] text-[var(--brand-text)] shadow-sm'
                  : 'text-[var(--text)] hover:bg-[var(--surface-raised)]'
              }`}
            >
              Devices
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                currentRoute === 'settings'
                  ? 'bg-[var(--brand)] text-[var(--brand-text)] shadow-sm'
                  : 'text-[var(--text)] hover:bg-[var(--surface-raised)]'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Bridge connection pill with responsive sizing */}
          <button
            type="button"
            onClick={() => {
              if (!isConnected) {
                onNavigate('workspace');
              }
            }}
            className={`hidden md:inline-flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1.5 rounded-full border text-xs font-medium transition-all shadow-2xs cursor-pointer group shrink-0 ${
              isConnected
                ? 'border-emerald-600/30 bg-emerald-500/10 text-emerald-800 hover:bg-emerald-500/20'
                : isConflict
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-800 hover:bg-amber-500/20'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--sub)] hover:border-[var(--border-strong)] hover:text-[var(--text)]'
            }`}
            title={
              isConnected
                ? 'Xtrinox Bridge Extension is connected & ready'
                : isConflict
                ? 'Bridge session conflict detected. Click to inspect devices'
                : 'Xtrinox Bridge extension not detected. Click to open workspace'
            }
          >
            <span className="relative flex h-2 w-2 shrink-0">
              {isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isConnected
                    ? 'bg-emerald-600'
                    : isConflict
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              />
            </span>
            <span className="font-semibold text-xs tracking-tight hidden xl:inline">
              {isConnected ? 'Bridge Ready' : isConflict ? 'Bridge Warning' : 'Extension Offline'}
            </span>
            <span className="font-semibold text-xs tracking-tight xl:hidden">
              {isConnected ? 'Ready' : isConflict ? 'Warning' : 'Offline'}
            </span>
            {!isConnected && (
              <span className="text-[10px] text-[var(--muted)] font-normal border-l border-[var(--border)] pl-1.5 hidden xl:inline group-hover:text-[var(--text)] transition-colors">
                Setup
              </span>
            )}
          </button>

          {/* Admin Console Shortcut - ONLY visible for authenticated users with verified admin claim */}
          {authUser && isAdmin && (
            <button
              type="button"
              onClick={() => onNavigate('admin/dashboard')}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-[#0B0B0C] bg-[#0B0B0C] hover:bg-[#232326] text-[#F3F2EE] text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
              title="Open Xtrinox Administrative Portal"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#B6FF2E] animate-pulse shrink-0" />
              <span>Admin</span>
            </button>
          )}

          {/* User Profile Area: Shows "Sign in" for guests, or interactive Dropdown for logged-in users */}
          {authUser ? (
            <div className="relative shrink-0" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center justify-between gap-2 px-2.5 sm:px-3 py-1.5 rounded-full border border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--surface)] hover:bg-[var(--surface-raised)] transition-all cursor-pointer shadow-2xs group max-w-[150px] sm:max-w-[190px] md:max-w-[210px]"
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                aria-label="User account menu"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {/* Avatar circle on left */}
                  <div
                    className="w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shadow-xs shrink-0 bg-[#0B0B0C] text-[#F3F2EE] border border-[#0B0B0C]"
                  >
                    {initial}
                  </div>

                  {/* Vertically stacked user name and role */}
                  <div className="hidden sm:flex flex-col text-left leading-tight min-w-0">
                    <span className="text-xs font-bold text-[var(--text)] truncate block max-w-[85px] sm:max-w-[105px]">
                      {displayName}
                    </span>
                    <span className="text-[10px] text-[var(--muted)] font-medium truncate block">
                      {isAdmin ? 'Admin' : 'Member'}
                    </span>
                  </div>
                </div>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-[var(--muted)] transition-transform duration-200 hidden sm:block shrink-0 ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-1.5 w-60 rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-1.5 shadow-xl z-50 flex flex-col gap-0.5 animate-in fade-in-50 zoom-in-95 origin-top-right"
                  role="menu"
                >
                  {/* Account Header */}
                  <div className="px-1.5 py-2 border-b border-[var(--border)] mb-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#0B0B0C] text-[#F3F2EE] text-xs font-bold flex items-center justify-center shrink-0 border border-[#0B0B0C]">
                        {initial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-[var(--text)] block truncate">
                          {displayName}
                        </span>
                        <span className="text-[10px] text-[var(--muted)] block truncate">
                          {authUser.email}
                        </span>
                      </div>
                    </div>
                    {isAdmin && (
                      <span className="inline-block mt-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        Admin Privileges Active
                      </span>
                    )}
                  </div>

                  {/* Navigation Links */}
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('workspace');
                      setUserMenuOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-raised)] transition-colors text-left cursor-pointer"
                    role="menuitem"
                  >
                    <Layers className="w-4 h-4 text-[var(--brand)]" />
                    <span>My Workspace</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('devices');
                      setUserMenuOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-raised)] transition-colors text-left cursor-pointer"
                    role="menuitem"
                  >
                    <Laptop className="w-4 h-4 text-[var(--brand)]" />
                    <span>Trusted Devices</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('settings');
                      setUserMenuOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-raised)] transition-colors text-left cursor-pointer"
                    role="menuitem"
                  >
                    <User className="w-4 h-4 text-[var(--brand)]" />
                    <span>Account Settings</span>
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        onNavigate('admin/dashboard');
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-raised)] transition-colors text-left cursor-pointer"
                      role="menuitem"
                    >
                      <Shield className="w-4 h-4 text-[#B6FF2E]" />
                      <span>Admin Console</span>
                    </button>
                  )}

                  <div className="border-t border-[var(--border)] my-1" />

                  {/* Sign out */}
                  <button
                    type="button"
                    onClick={async () => {
                      setUserMenuOpen(false);
                      await signOut();
                      onNavigate('login');
                    }}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                    role="menuitem"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="h-9 px-4 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-[var(--brand-text)] text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5 shrink-0"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign in</span>
            </button>
          )}

          {/* Mobile menu toggle (Visible on < lg: 1024px) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-raised)] text-[var(--text)] transition-colors cursor-pointer shrink-0"
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Visible on < lg: 1024px) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[var(--surface)] border-b border-[var(--border)] px-4 sm:px-6 py-4 shadow-xl animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-2">
            {authUser && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] mb-1">
                <div className="w-9 h-9 rounded-full bg-[#0B0B0C] text-[#F3F2EE] text-xs font-bold flex items-center justify-center shrink-0">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-[var(--text)] block truncate">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-[var(--muted)] block truncate font-mono">
                    {authUser.email}
                  </span>
                </div>
                {isAdmin && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                    Admin
                  </span>
                )}
              </div>
            )}

            {/* Extension Bridge Status inside Mobile Drawer */}
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2 shrink-0">
                  {isConnected && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isConnected
                        ? 'bg-emerald-600'
                        : isConflict
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                </span>
                <span className="font-semibold text-[var(--text)]">
                  {isConnected ? 'Bridge Ready' : isConflict ? 'Bridge Warning' : 'Extension Offline'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onNavigate('workspace');
                  setMobileMenuOpen(false);
                }}
                className="text-[11px] font-bold text-[var(--brand)] underline cursor-pointer"
              >
                Workspace
              </button>
            </div>

            <button
              onClick={() => {
                onNavigate('marketplace');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2.5 rounded-lg text-sm font-semibold cursor-pointer ${
                currentRoute === 'marketplace' || currentRoute === 'product-details'
                  ? 'bg-[var(--brand)] text-[var(--brand-text)]'
                  : 'text-[var(--text)] hover:bg-[var(--surface-raised)]'
              }`}
            >
              Marketplace
            </button>
            <button
              onClick={() => {
                onNavigate('workspace');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2.5 rounded-lg text-sm font-semibold cursor-pointer ${
                currentRoute === 'workspace'
                  ? 'bg-[var(--brand)] text-[var(--brand-text)]'
                  : 'text-[var(--text)] hover:bg-[var(--surface-raised)]'
              }`}
            >
              Workspace
            </button>
            <button
              onClick={() => {
                onNavigate('devices');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2.5 rounded-lg text-sm font-semibold cursor-pointer ${
                currentRoute === 'devices'
                  ? 'bg-[var(--brand)] text-[var(--brand-text)]'
                  : 'text-[var(--text)] hover:bg-[var(--surface-raised)]'
              }`}
            >
              Devices
            </button>
            <button
              onClick={() => {
                onNavigate('settings');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2.5 rounded-lg text-sm font-semibold cursor-pointer ${
                currentRoute === 'settings'
                  ? 'bg-[var(--brand)] text-[var(--brand-text)]'
                  : 'text-[var(--text)] hover:bg-[var(--surface-raised)]'
              }`}
            >
              Settings
            </button>

            {authUser && isAdmin && (
              <button
                onClick={() => {
                  onNavigate('admin/dashboard');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-semibold bg-[#0B0B0C] text-[#F3F2EE] flex items-center justify-between cursor-pointer"
              >
                <span>Admin Console</span>
                <span className="w-2 h-2 rounded-full bg-[#B6FF2E]" />
              </button>
            )}

            <div className="border-t border-[var(--border)] my-1" />

            {authUser ? (
              <button
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await signOut();
                  onNavigate('login');
                }}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onNavigate('login');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-bold bg-[var(--brand)] text-[var(--brand-text)] flex items-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
