import React, { useState } from 'react';
import { AdminRoute } from '../../types/admin';
import { AdminSidebar } from './AdminSidebar';
import { AdminMobileDrawer } from './AdminMobileDrawer';
import { ToastProvider } from './ToastProvider';
import { adminStore } from '../../services/adminStore';
import {
  Menu,
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface AdminLayoutProps {
  currentRoute: AdminRoute;
  onNavigate: (route: AdminRoute) => void;
  onBackToPlatform: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentRoute,
  onNavigate,
  onBackToPlatform,
  children
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const routeTitles: Record<AdminRoute, { group: string; title: string }> = {
    'admin/dashboard': { group: 'Overview', title: 'Dashboard' },
    'admin/tools': { group: 'Marketplace Management', title: 'Tools Inventory' },
    'admin/product-cookies': { group: 'Marketplace Management', title: 'Product Cookies' },
    'admin/entitlements': { group: 'Marketplace Management', title: 'Entitlements' },
    'admin/users': { group: 'User Management', title: 'User Directory' },
    'admin/runtime': { group: 'Operations', title: 'Runtime Monitor' },
    'admin/logs': { group: 'Operations', title: 'Audit Logs' },
    'admin/system': { group: 'Configuration', title: 'System Settings' },
    'admin/feature-flags': { group: 'Configuration', title: 'Feature Flags' }
  };

  const breadcrumb = routeTitles[currentRoute] || { group: 'Admin Console', title: 'Portal' };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await adminStore.refreshDashboard();
    adminStore.addToast({
      type: 'info',
      title: 'Admin State Refreshed',
      message: 'Verified Firebase custom claims and reloaded collection counts.'
    });
    setIsRefreshing(false);
  };

  const handleSignOut = () => {
    adminStore.signOutAdmin();
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg)] text-[var(--text)] font-sans selection:bg-[var(--brand)] selection:text-[var(--brand-text)]">
      {/* Toast Notification Container */}
      <ToastProvider />

      {/* Desktop Sticky Sidebar (>= 1024px) */}
      <div className="hidden lg:block shrink-0 sticky top-0 h-screen z-30">
        <AdminSidebar
          currentRoute={currentRoute}
          onNavigate={onNavigate}
          onBackToPlatform={onBackToPlatform}
          onSignOut={handleSignOut}
        />
      </div>

      {/* Mobile / Tablet Drawer (< 1024px) */}
      <AdminMobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        onBackToPlatform={onBackToPlatform}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Shared Top Header */}
        <header className="sticky top-0 z-20 h-16 bg-white/95 border-b border-[#E4E3DD] px-4 md:px-8 flex items-center justify-between backdrop-blur-xs">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-[#E4E3DD] text-[#0B0B0C] hover:bg-[#FAF9F5] cursor-pointer"
              aria-label="Open admin navigation"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
              <span className="text-[#71717A] font-medium hidden sm:inline">
                {breadcrumb.group}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-[#A1A1AA] hidden sm:inline" />
              <span className="font-semibold text-[#0B0B0C]">
                {breadcrumb.title}
              </span>
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            {/* Refresh Action */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E4E3DD] bg-[#FAF9F5] text-[#0B0B0C] hover:bg-[#EBEAE5] text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Firebase Claims & Collection Counts"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#71717A] ${isRefreshing ? 'animate-spin text-[#0B0B0C]' : ''}`} />
              <span className="hidden sm:inline">Sync Claims</span>
            </button>

            {/* Public Platform Link */}
            <button
              type="button"
              onClick={onBackToPlatform}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E4E3DD] text-[#52525B] hover:text-[#0B0B0C] hover:bg-[#FAF9F5] text-xs font-medium transition-colors cursor-pointer"
            >
              <span>Public Store</span>
              <ExternalLink className="w-3 h-3" />
            </button>

            <div className="h-5 w-px bg-[#E4E3DD] mx-1 hidden sm:block" />

            {/* Admin Avatar & Identity */}
            <div className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-full bg-[#0B0B0C] text-[#B6FF2E] font-bold text-xs flex items-center justify-center ring-2 ring-[#0B0B0C]/10 shadow-2xs">
                A
              </div>
              <div className="hidden xl:block text-left">
                <span className="text-xs font-bold text-[#0B0B0C] block leading-tight">
                  {adminStore.user.name}
                </span>
                <span className="text-[10px] text-[#71717A] block font-mono">
                  {adminStore.user.email}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Inner Content Container (max-w-[1152px]) */}
        <main className="flex-1 w-full max-w-[1152px] mx-auto p-4 sm:p-6 md:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
