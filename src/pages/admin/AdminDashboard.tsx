import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Package, 
  CreditCard, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  ShieldAlert,
  RefreshCw
} from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuthStore } from '../../state/useAuthStore';
import { useRuntimeStore } from '../../state/useRuntimeStore';
import { PagePreloader } from '../../components/PagePreloader';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    users: 0,
    tools: 0,
    activeSubs: 0,
    health: 'Optimal'
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { setAdminDataLoading } = useRuntimeStore();

  // Set loading state synchronously to avoid flicker between auth and data fetching
  useEffect(() => {
    setAdminDataLoading(true);
    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const toolsSnap = await getDocs(collection(db, 'marketplace_tools'));
        const activeSubsSnap = await getDocs(collection(db, 'entitlements'));
        
        setStats({
          users: usersSnap.size,
          tools: toolsSnap.size,
          activeSubs: activeSubsSnap.size,
          health: 'Optimal'
        });

        const logsSnap = await getDocs(query(collection(db, 'launch_logs'), limit(5)));
        setRecentActivity(logsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err: any) {
        console.error('Dashboard Fetch Failed:', err);
        setStats(prev => ({ ...prev, health: 'Degraded (Permissions)' }));
      } finally {
        setLoading(false);
        setAdminDataLoading(false);
      }
    };

    fetchStats();
    
    // Cleanup to ensure preloader doesn't get stuck if user navigates away
    return () => setAdminDataLoading(false);
  }, [setAdminDataLoading]);

  const { refreshAdminStatus } = useAuthStore();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    await refreshAdminStatus();
    setSyncing(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Overview</h1>
          <p className="text-slate-500 text-sm">Real-time status and operational health metrics.</p>
        </div>
        <button 
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-slate-400 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Permissions'}
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          label="Total Users" 
          value={stats.users.toString()} 
          trend="+12%" 
          trendUp={true} 
        />
        <StatCard 
          icon={Package} 
          label="Marketplace Tools" 
          value={stats.tools.toString()} 
        />
        <StatCard 
          icon={CreditCard} 
          label="Active Entitlements" 
          value={stats.activeSubs.toString()} 
          trend="+5%" 
          trendUp={true} 
        />
        <StatCard 
          icon={Zap} 
          label="System Health" 
          value={stats.health} 
          color="text-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-slate-900">Live Activity Feed</h2>
            <button className="text-primary text-xs font-semibold hover:underline">View All Logs</button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <Activity className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{log.userId.substring(0, 12)}...</p>
                    <p className="text-xs text-slate-500">Launched <span className="font-semibold text-slate-700">{log.toolId}</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                    log.launchStatus === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {log.launchStatus}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {log.launchedAt?.toDate().toLocaleTimeString() || 'Just now'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative">
          <h2 className="font-bold mb-4 relative z-10">Emergency Status</h2>
          <div className="space-y-4 relative z-10">
            <AlertItem icon={ShieldAlert} label="Security Engine" status="Active" />
            <AlertItem icon={Zap} label="Encryption Node" status="Healthy" />
            <AlertItem icon={Activity} label="Bridge Sync" status="Operational" />
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 relative z-10">
            <button className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors">
              Global Kill Switch
            </button>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <ShieldAlert className="w-64 h-64 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, trend, trendUp, color = "text-slate-900" }: any) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
        <Icon className="w-5 h-5 text-slate-500" />
      </div>
      {trend && (
        <span className={`flex items-center text-xs font-bold ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trendUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
          {trend}
        </span>
      )}
    </div>
    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
  </div>
);

const AlertItem = ({ icon: Icon, label, status }: any) => (
  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-white/60" />
      <span className="text-sm font-medium">{label}</span>
    </div>
    <span className="text-[10px] font-bold text-emerald-400 uppercase">{status}</span>
  </div>
);
