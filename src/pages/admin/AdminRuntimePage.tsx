import React, { useState } from 'react';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import {
  Activity,
  Cpu,
  Wifi,
  Radio,
  Server,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Info
} from 'lucide-react';

export const AdminRuntimePage: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <AdminPageHeader
        eyebrow="Operations"
        title="Runtime Monitor"
        description="Real-time supervision of active sessions and bridge heartbeats."
        actions={
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E4E3DD] bg-white text-[#0B0B0C] text-xs font-semibold shadow-xs hover:bg-[#FAF9F5] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#71717A] ${isRefreshing ? 'animate-spin text-[#0B0B0C]' : ''}`} />
            <span>Refresh Nodes</span>
          </button>
        }
      />

      {/* Mandatory Telemetry Transparency Notice */}
      <div className="p-3.5 rounded-xl border border-[#E4E3DD] bg-white text-[#0B0B0C] flex items-start gap-3 text-xs leading-relaxed shadow-xs">
        <Info className="w-4 h-4 text-[#0B0B0C] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block text-[#0B0B0C]">Supervision & Health Telemetry</span>
          <span className="text-[11px] text-[#52525B]">
            Runtime metrics display architecture topology and simulated session health. Live streaming websocket telemetry requires an active bridge relay cluster.
          </span>
        </div>
      </div>

      {/* Cluster Status Metrics */}
      <section aria-labelledby="cluster-metrics" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="cluster-metrics" className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
            Cluster Telemetry (US-EAST-1)
          </h2>
          <span className="text-[11px] font-mono text-emerald-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Healthy Status
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1 */}
          <div className="p-4 rounded-2xl border border-[#E4E3DD] bg-white shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#71717A]">Active Streams</span>
              <Activity className="w-4 h-4 text-[#0B0B0C]" />
            </div>
            <div className="text-2xl font-bold font-heading text-[#0B0B0C]">
              128
            </div>
            <span className="text-[10px] text-[#71717A] font-mono mt-1 block">
              Simulated concurrent tunnels
            </span>
          </div>

          {/* Metric 2 */}
          <div className="p-4 rounded-2xl border border-[#E4E3DD] bg-white shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#71717A]">Bridge Latency</span>
              <Wifi className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-heading text-[#0B0B0C]">
              42ms
            </div>
            <span className="text-[10px] text-[#71717A] font-mono mt-1 block">
              Roundtrip ping to relay
            </span>
          </div>

          {/* Metric 3 */}
          <div className="p-4 rounded-2xl border border-[#E4E3DD] bg-white shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#71717A]">Error Rate</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold font-heading text-[#0B0B0C]">
              0.02%
            </div>
            <span className="text-[10px] text-[#71717A] font-mono mt-1 block">
              Past 24 hours window
            </span>
          </div>

          {/* Metric 4 */}
          <div className="p-4 rounded-2xl border border-[#E4E3DD] bg-white shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#71717A]">Relay Compute</span>
              <Cpu className="w-4 h-4 text-[#0B0B0C]" />
            </div>
            <div className="text-2xl font-bold font-heading text-[#0B0B0C]">
              18%
            </div>
            <span className="text-[10px] text-[#71717A] font-mono mt-1 block">
              Edge worker utilization
            </span>
          </div>
        </div>
      </section>

      {/* Cluster Nodes Topology */}
      <section aria-labelledby="nodes-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="nodes-heading" className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
            Edge Bridge Ingress Nodes
          </h2>
          <span className="text-[11px] text-[#71717A] font-mono">
            3 regions provisioned
          </span>
        </div>

        <div className="rounded-2xl border border-[#E4E3DD] bg-white overflow-hidden shadow-xs divide-y divide-[#E4E3DD]">
          {[
            { id: 'node_iad_01', region: 'US-East (Virginia)', tunnels: 54, load: '22%', status: 'Online' },
            { id: 'node_fra_01', region: 'EU-Central (Frankfurt)', tunnels: 48, load: '19%', status: 'Online' },
            { id: 'node_sin_01', region: 'AP-Southeast (Singapore)', tunnels: 26, load: '11%', status: 'Online' }
          ].map((node) => (
            <div key={node.id} className="p-4 flex items-center justify-between text-xs hover:bg-[#FAF9F5] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FAF9F5] border border-[#E4E3DD] text-[#0B0B0C] flex items-center justify-center shrink-0">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-[#0B0B0C] block font-mono">
                    {node.id}
                  </span>
                  <span className="text-[11px] text-[#71717A]">
                    {node.region}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 font-mono">
                <span className="text-neutral-500 hidden sm:inline">
                  {node.tunnels} tunnels ({node.load} load)
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-sans font-semibold text-[10px] border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{node.status}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Network Configuration Information */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
          Heartbeat Protocol Parameters
        </h2>
        <div className="p-4 rounded-2xl border border-[#E4E3DD] bg-white space-y-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-xs text-[#0B0B0C]">
            <Radio className="w-4 h-4 text-[#71717A]" />
            <div className="flex-1">
              <span className="font-semibold block">Browser Extension Ping Interval</span>
              <span className="text-[11px] text-[#71717A]">
                Clients send heartbeats every 60 seconds with active device token.
              </span>
            </div>
            <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#FAF9F5] border border-[#E4E3DD] text-[#0B0B0C]">
              60,000 ms
            </span>
          </div>

          <div className="pt-2 border-t border-[#E4E3DD] flex items-center gap-2.5 text-xs text-[#0B0B0C]">
            <Radio className="w-4 h-4 text-[#71717A]" />
            <div className="flex-1">
              <span className="font-semibold block">Idle Tunnel Timeout</span>
              <span className="text-[11px] text-[#71717A]">
                Unacknowledged sessions auto-disconnect after 15 minutes of inactivity.
              </span>
            </div>
            <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#FAF9F5] border border-[#E4E3DD] text-[#0B0B0C]">
              900 s
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
