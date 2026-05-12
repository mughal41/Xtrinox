import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Cookie,
  Package,
  RefreshCw,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuthStore } from '../../state/useAuthStore';

type DashboardStats = {
  users: number;
  tools: number;
  entitlements: number;
};

const initialStats: DashboardStats = {
  users: 0,
  tools: 0,
  entitlements: 0,
};

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const { refreshAdminStatus } = useAuthStore();

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError('');

    try {
      const [usersSnap, toolsSnap, entitlementsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'marketplace_tools')),
        getDocs(collection(db, 'entitlements')),
      ]);

      setStats({
        users: usersSnap.size,
        tools: toolsSnap.size,
        entitlements: entitlementsSnap.size,
      });
    } catch (err) {
      setError('Unable to load dashboard counts. Check Firestore permissions or retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleSyncPermissions = async () => {
    setSyncing(true);
    try {
      await refreshAdminStatus();
      await fetchDashboardStats();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Admin Console</p>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-2 max-w-2xl">
            Manage marketplace products, users, and access entitlements from one focused admin workspace.
          </p>
        </div>
        <button
          onClick={handleSyncPermissions}
          disabled={syncing || loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Refreshing...' : 'Refresh'}
        </button>
      </header>

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard icon={Users} label="Users" value={stats.users} loading={loading} />
        <MetricCard icon={Package} label="Marketplace Tools" value={stats.tools} loading={loading} />
        <MetricCard icon={ShieldCheck} label="Entitlements" value={stats.entitlements} loading={loading} />
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        <AdminActionCard
          icon={Package}
          title="Manage Tools"
          description="Create, edit, activate, or hide marketplace products."
          to="/admin/tools"
        />
        <AdminActionCard
          icon={Cookie}
          title="Product Cookies"
          description="Create reusable cookie sets for each marketplace tool."
          to="/admin/product-cookies"
        />
        <AdminActionCard
          icon={Users}
          title="Review Users"
          description="Find users and inspect account status before granting access."
          to="/admin/users"
        />
        <AdminActionCard
          icon={ShieldCheck}
          title="Grant Entitlements"
          description="Provision or review active access for paid users."
          to="/admin/entitlements"
        />
      </section>
    </div>
  );
};

const MetricCard = ({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  loading: boolean;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <Icon className="h-5 w-5" />
    </div>
    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
    {loading ? (
      <div className="mt-3 h-9 w-20 animate-pulse rounded-lg bg-slate-100" />
    ) : (
      <p className="mt-2 text-4xl font-extrabold text-slate-900">{value}</p>
    )}
  </div>
);

const AdminActionCard = ({
  icon: Icon,
  title,
  description,
  to,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  to: string;
}) => (
  <Link
    to={to}
    className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
  >
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
        <Icon className="h-5 w-5" />
      </div>
      <ArrowRight className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
    </div>
    <h2 className="text-lg font-bold text-slate-900">{title}</h2>
    <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
  </Link>
);
