import React, { useEffect, useState } from 'react';
import { AdminRoute } from '../../types/admin';
import { adminStore } from '../../services/adminStore';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminMetricCard } from '../../components/admin/AdminMetricCard';
import { AdminActionCard } from '../../components/admin/AdminActionCard';
import { ErrorBanner } from '../../components/admin/ErrorBanner';
import {
  Users,
  Package,
  ShieldCheck,
  RefreshCw,
  KeyRound,
  Shield,
  Clock
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (route: AdminRoute) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const [counts, setCounts] = useState(adminStore.getCounts());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return adminStore.subscribe(() => {
      setCounts(adminStore.getCounts());
    });
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      await adminStore.refreshDashboard();
      setCounts(adminStore.getCounts());
    } catch {
      setError('Failed to refresh Firestore counts. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <AdminPageHeader
        eyebrow="Admin Console"
        title="Dashboard"
        description="Manage marketplace products, users, and access entitlements from one focused admin workspace."
        actions={
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E4E3DD] bg-white text-[#0B0B0C] hover:bg-[#FAF9F5] text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#71717A] ${loading ? 'animate-spin text-[#0B0B0C]' : ''}`} />
            <span>Refresh Counts</span>
          </button>
        }
      />

      {/* Error State Banner */}
      {error && (
        <ErrorBanner
          title="Firestore Synchronization Warning"
          message={error}
          onRetry={handleRefresh}
        />
      )}

      {/* Three Real Firestore Metric Cards */}
      <section aria-labelledby="metrics-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="metrics-heading" className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
            Platform Overview (Real Collections)
          </h2>
          <span className="text-[11px] text-[#71717A] flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            live synced
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AdminMetricCard
            icon={<Users className="w-5 h-5" />}
            label="Users"
            value={counts.users}
            collectionName="users"
            loading={loading}
            onClick={() => onNavigate('admin/users')}
          />
          <AdminMetricCard
            icon={<Package className="w-5 h-5" />}
            label="Marketplace Tools"
            value={counts.marketplaceTools}
            collectionName="marketplace_tools"
            loading={loading}
            onClick={() => onNavigate('admin/tools')}
          />
          <AdminMetricCard
            icon={<ShieldCheck className="w-5 h-5" />}
            label="Entitlements"
            value={counts.entitlements}
            collectionName="entitlements"
            loading={loading}
            onClick={() => onNavigate('admin/entitlements')}
          />
        </div>
      </section>

      {/* Common Tasks / Quick Action Cards */}
      <section aria-labelledby="tasks-heading" className="space-y-3 pt-2">
        <h2 id="tasks-heading" className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
          Common Tasks
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminActionCard
            icon={<Package className="w-5 h-5" />}
            title="Manage Tools"
            description="Create, edit, activate, or configure public marketplace products."
            destination="/admin/tools"
            onNavigate={() => onNavigate('admin/tools')}
          />
          <AdminActionCard
            icon={<KeyRound className="w-5 h-5" />}
            title="Product Cookies"
            description="Create reusable cookie sets for each marketplace tool."
            destination="/admin/product-cookies"
            onNavigate={() => onNavigate('admin/product-cookies')}
          />
          <AdminActionCard
            icon={<Users className="w-5 h-5" />}
            title="Review Users"
            description="Find users and inspect account status before granting access."
            destination="/admin/users"
            onNavigate={() => onNavigate('admin/users')}
          />
          <AdminActionCard
            icon={<ShieldCheck className="w-5 h-5" />}
            title="Grant Entitlements"
            description="Provision or review active tool access for paid users."
            destination="/admin/entitlements"
            onNavigate={() => onNavigate('admin/entitlements')}
          />
        </div>
      </section>

      {/* Security Health & Session Information Strip */}
      <section className="p-4 rounded-2xl border border-[#E4E3DD] bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#0B0B0C] text-[#B6FF2E] flex items-center justify-center shrink-0 shadow-2xs">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-[#0B0B0C] block">
              Administrative Session Active
            </span>
            <span className="text-[11px] text-[#71717A]">
              Authenticated via custom token with full workspace administration privileges.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-[#71717A] font-mono">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#71717A]" />
            claim: admin:true
          </span>
          <span className="text-[#D4D4D8]">·</span>
          <span>token: verified</span>
        </div>
      </section>
    </div>
  );
};
