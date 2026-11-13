import React, { useState, useEffect, useMemo } from 'react';
import { AuditLogRecord } from '../../types/admin';
import { adminStore } from '../../services/adminStore';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { SearchToolbar } from '../../components/admin/SearchToolbar';
import { EmptyState } from '../../components/admin/EmptyState';
import {
  ScrollText,
  KeyRound,
  Shield,
  Sliders,
  Trash2,
  Plus,
  Edit,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { BrandSpinner } from '../../components/BrandSpinner';

export const AdminLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogRecord[]>(
    adminStore.logs || adminStore.auditLogs || []
  );
  const [loading, setLoading] = useState(!adminStore.isInitialized);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    return adminStore.subscribe(() => {
      setLogs([...(adminStore.logs || adminStore.auditLogs || [])]);
      setLoading(false);
    });
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExpandAll = () => {
    if (expandedIds.size === filteredLogs.length) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(filteredLogs.map((l) => l.id)));
    }
  };

  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          log.action.toLowerCase().includes(q) ||
          log.adminEmail.toLowerCase().includes(q) ||
          log.targetId.toLowerCase().includes(q);

        const matchesType =
          actionTypeFilter === 'all' || log.actionType === actionTypeFilter;

        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [logs, searchQuery, actionTypeFilter, sortOrder]);

  const getActionIcon = (type: AuditLogRecord['actionType']) => {
    switch (type) {
      case 'create':
        return <Plus className="w-3.5 h-3.5 text-emerald-600" />;
      case 'delete':
        return <Trash2 className="w-3.5 h-3.5 text-rose-600" />;
      case 'security':
        return <Shield className="w-3.5 h-3.5 text-amber-600" />;
      case 'access':
        return <KeyRound className="w-3.5 h-3.5 text-[#0B0B0C]" />;
      case 'system':
        return <Sliders className="w-3.5 h-3.5 text-[#0B0B0C]" />;
      default:
        return <Edit className="w-3.5 h-3.5 text-[#71717A]" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <AdminPageHeader
        eyebrow="Operations"
        title="Audit Trail"
        description="Historical record of all administrative actions and system modifications."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                await adminStore.fetchAll();
                setLoading(false);
              }}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E4E3DD] hover:border-[#0B0B0C] bg-white text-xs font-semibold text-[#0B0B0C] transition-colors cursor-pointer disabled:opacity-60 shadow-2xs"
              title="Sync audit trail with Firebase"
            >
              {loading ? (
                <BrandSpinner size="xs" variant="mark-spin" badge={false} />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 text-[#71717A]" />
              )}
              <span>{loading ? 'Syncing…' : 'Sync'}</span>
            </button>
            <button
              type="button"
              onClick={handleExpandAll}
              className="px-3 py-1.5 rounded-xl border border-[#E4E3DD] bg-white text-xs font-semibold text-[#0B0B0C] hover:bg-[#FAF9F5] cursor-pointer shadow-xs"
            >
              {expandedIds.size === filteredLogs.length && filteredLogs.length > 0
                ? 'Collapse All'
                : 'Expand All'}
            </button>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="h-9 px-3 rounded-xl border border-[#E4E3DD] bg-white text-xs font-semibold text-[#0B0B0C] focus:outline-none cursor-pointer"
              aria-label="Sort order"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        }
      />

      {/* Search and Action Type Filter */}
      <SearchToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search action name or target ID..."
        totalCount={logs.length}
        filteredCount={filteredLogs.length}
        filters={
          <select
            value={actionTypeFilter}
            onChange={(e) => setActionTypeFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[#E4E3DD] bg-[#FAF9F5] text-[#0B0B0C] text-xs focus:outline-none focus:ring-2 focus:ring-[#0B0B0C]/10 cursor-pointer"
            aria-label="Filter by action category"
          >
            <option value="all">All action types</option>
            <option value="access">Access & Entitlements</option>
            <option value="security">Security & Devices</option>
            <option value="create">Creations</option>
            <option value="update">Updates</option>
            <option value="delete">Deletions</option>
            <option value="system">System Settings</option>
          </select>
        }
      />

      {/* Audit Log Stream */}
      {loading ? (
        <div className="py-20 flex items-center justify-center bg-transparent">
          <BrandSpinner size="lg" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          icon={<ScrollText className="w-6 h-6" />}
          title="No audit records found"
          description={
            searchQuery
              ? `No actions match "${searchQuery}". Reset filters to see all audit events.`
              : 'Audit history is currently empty.'
          }
          action={
            searchQuery
              ? { label: 'Clear Filters', onClick: () => { setSearchQuery(''); setActionTypeFilter('all'); } }
              : undefined
          }
        />
      ) : (
        <div className="rounded-2xl border border-[#E4E3DD] bg-white overflow-hidden shadow-xs divide-y divide-[#E4E3DD]">
          {filteredLogs.map((log) => {
            const isExpanded = expandedIds.has(log.id);
            const hasDetails = log.details && Object.keys(log.details).length > 0;

            return (
              <div key={log.id} className="text-xs transition-colors hover:bg-[#FAF9F5]">
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Left: Icon, Action, Target */}
                  <div className="flex items-start md:items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[#FAF9F5] border border-[#E4E3DD] flex items-center justify-center shrink-0 mt-0.5 md:mt-0">
                      {getActionIcon(log.actionType)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#0B0B0C] font-mono">
                          {log.action}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF9F5] border border-[#E4E3DD] text-[#71717A]">
                          {log.targetType || (log as any).targetCollection || 'system'}:{log.targetId}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#71717A] mt-0.5">
                        Admin: <strong className="font-mono text-[#0B0B0C]">{log.adminEmail}</strong> ({log.adminUid.substring(0, 12)}...)
                      </div>
                    </div>
                  </div>

                  {/* Right: Timestamp and Toggle */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E4E3DD]">
                    <span className="text-[11px] font-mono text-[#71717A]">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>

                    {hasDetails && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(log.id)}
                        className="p-1 rounded-md text-[#71717A] hover:text-[#0B0B0C] hover:bg-[#EBEAE5] cursor-pointer"
                        aria-label={isExpanded ? 'Collapse log payload' : 'Expand log payload'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Collapsible Details JSON Payload */}
                {isExpanded && hasDetails && (
                  <div className="px-4 pb-4 pt-1 border-t border-[#E4E3DD] bg-[#FAF9F5] animate-in fade-in duration-150">
                    <div className="p-3 rounded-xl bg-[#0B0B0C] border border-[#232326] text-neutral-100 space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] block">
                        Payload Snapshot:
                      </span>
                      <pre className="font-mono text-[11px] leading-relaxed overflow-x-auto text-[#B6FF2E] max-h-48 scrollbar-thin">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
