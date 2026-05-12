import React from 'react';
import { Zap, Activity, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

export const RuntimeMonitor: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Runtime Monitor</h1>
          <p className="text-slate-500 text-sm">Real-time supervision of active sessions and bridge heartbeats.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all">
          <RefreshCw className="w-4 h-4 text-slate-400" />
          Refresh Nodes
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Global Cluster Status</h3>
                <p className="text-xs text-slate-400 font-mono uppercase tracking-tighter">Region: US-EAST-1 (PROD)</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatusBadge label="Active Streams" value="128" />
              <StatusBadge label="Bridge Latency" value="42ms" color="text-emerald-500" />
              <StatusBadge label="Error Rate" value="0.02%" color="text-emerald-500" />
              <StatusBadge label="CPU Load" value="24%" color="text-amber-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Active Relay Nodes</h3>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full uppercase">Operational</span>
            </div>
            <div className="p-6 text-center text-slate-400 italic text-sm">
              Connecting to bridge telemetry...
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 text-white">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Security Alerts
            </h3>
            <div className="space-y-3">
              <AlertItem message="IP conflict detected in UID: oGUe..." level="warning" />
              <AlertItem message="Bulk session deployment successful" level="success" />
              <AlertItem message="Bridge v2.4.1 deprecation notice" level="info" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ label, value, color = "text-slate-900" }: any) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    <p className={`text-xl font-extrabold ${color}`}>{value}</p>
  </div>
);

const AlertItem = ({ message, level }: any) => {
  const colors = {
    warning: 'text-amber-400 bg-amber-400/10',
    success: 'text-emerald-400 bg-emerald-400/10',
    info: 'text-blue-400 bg-blue-400/10'
  };
  return (
    <div className={`p-3 rounded-xl text-[10px] font-medium border border-white/5 ${colors[level as keyof typeof colors]}`}>
      {message}
    </div>
  );
};
