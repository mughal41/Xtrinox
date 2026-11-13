import React, { useState, useMemo, useEffect } from 'react';
import { RouteName, DeviceSession, DeviceStatus } from '../types';
import { DEMO_DEVICES } from '../data/products';
import { useAuthStore } from '../state/useAuthStore';
import { useRuntimeStore } from '../state/useRuntimeStore';
import { firestoreService } from '../services/firestore.service';
import {
  Laptop,
  Smartphone,
  Search,
  Check,
  Ban,
  Clock,
  ShieldAlert,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { BrandSpinner } from '../components/BrandSpinner';

interface DevicesPageProps {
  onNavigate: (route: RouteName, param?: string) => void;
}

export const DevicesPage: React.FC<DevicesPageProps> = () => {
  const { user } = useAuthStore();
  const { currentDeviceId } = useRuntimeStore();
  const [devices, setDevices] = useState<DeviceSession[]>(DEMO_DEVICES);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // Manage Modal State
  const [activeModalDevice, setActiveModalDevice] = useState<DeviceSession | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const loadDevices = async () => {
    if (!user) {
      setDevices(DEMO_DEVICES);
      return;
    }
    try {
      setLoading(true);
      const fsDevices = await firestoreService.getDevices(user.uid);
      if (fsDevices.length === 0) {
        setDevices(DEMO_DEVICES);
      } else {
        const mapped: DeviceSession[] = fsDevices.map(d => {
          const isCurrent = d.deviceId === currentDeviceId;
          let status: DeviceStatus = 'trusted';
          if (d.blocked) status = 'blocked';
          else if (d.unblockRequested) status = 'pending';

          const loc = [d.city, d.country].filter(Boolean).join(', ') || 'Unknown location';
          let lastActiveStr = 'Just now';
          if (d.lastActiveAt?.toDate) {
            lastActiveStr = d.lastActiveAt.toDate().toLocaleDateString();
          }

          return {
            id: d.deviceId,
            browser: d.browserName || d.deviceType || 'Web Browser',
            os: d.os || 'Desktop OS',
            location: loc,
            ip: d.ip || 'Hidden',
            lastActive: lastActiveStr,
            status,
            current: isCurrent,
            kind: (d.deviceType === 'mobile' || /android|iphone|ipad/i.test(d.os || '')) ? 'phone' : 'desktop'
          };
        });
        setDevices(mapped);
      }
    } catch (e) {
      console.warn('Failed to load user devices from Firestore:', e);
      setDevices(DEMO_DEVICES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, [user, currentDeviceId]);

  // Filter & Search
  const filteredDevices = useMemo(() => {
    let list = [...devices];

    if (filter !== 'all') {
      list = list.filter((d) => d.status === filter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (d) =>
          d.browser.toLowerCase().includes(q) ||
          d.os.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q) ||
          d.ip.includes(q)
      );
    }

    // Always keep current device sorted first
    return list.sort((a, b) => Number(b.current) - Number(a.current));
  }, [devices, filter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredDevices.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedDevices = filteredDevices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleBlockToggle = async () => {
    if (!activeModalDevice || activeModalDevice.current) return;

    const deviceId = activeModalDevice.id;
    const isCurrentlyBlocked = activeModalDevice.status === 'blocked';

    try {
      setActionLoading(true);
      if (user) {
        if (isCurrentlyBlocked) {
          await firestoreService.requestUnblock(user.uid, deviceId);
        } else {
          await firestoreService.blockDevice(user.uid, deviceId, 'user');
        }
        await loadDevices();
      } else {
        setDevices((prev) =>
          prev.map((d) => {
            if (d.id === deviceId) {
              return {
                ...d,
                status: isCurrentlyBlocked ? ('pending' as DeviceStatus) : ('blocked' as DeviceStatus)
              };
            }
            return d;
          })
        );
      }

      showToast(
        isCurrentlyBlocked
          ? 'Restoration request submitted for review.'
          : `Device ${activeModalDevice.browser} revoked.`
      );
    } catch (err: any) {
      showToast(err.message || 'Action failed.');
    } finally {
      setActionLoading(false);
      setActiveModalDevice(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] py-12 px-6 transition-colors">
      <div className="max-w-[1120px] mx-auto">
        {/* Page Heading */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[var(--text)] tracking-tight">
              Trusted devices
            </h1>
            <p className="text-xs sm:text-sm text-[var(--sub)] mt-1">
              Review devices with access to your workspace. Block anything you don't recognize.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => loadDevices()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--surface)] hover:bg-[var(--surface-raised)] text-xs font-semibold text-[var(--text)] transition-all cursor-pointer disabled:opacity-60 shadow-2xs active:scale-95"
              title="Sync latest device sessions from Firebase"
            >
              {loading ? (
                <BrandSpinner size="xs" variant="mark-spin" badge={false} />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 text-[var(--muted)]" />
              )}
              <span>{loading ? 'Syncing…' : 'Sync'}</span>
            </button>
            <span className="text-xs text-[var(--muted)] font-medium">
              {devices.length} total sessions
            </span>
          </div>
        </div>

        {/* Tools Bar: Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Filter by status">
            {[
              { id: 'all', label: 'All devices' },
              { id: 'trusted', label: 'Trusted' },
              { id: 'blocked', label: 'Blocked' },
              { id: 'pending', label: 'Pending review' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setFilter(tab.id);
                  setPage(1);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                  filter === tab.id
                    ? 'bg-[var(--brand)] text-[var(--brand-text)] shadow-xs'
                    : 'text-[var(--sub)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-3 pointer-events-none" />
            <input
              type="search"
              placeholder="Search devices"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full h-10 pl-9 pr-8 rounded-xl border border-[var(--border)] bg-[var(--input)] text-xs text-[var(--text)] placeholder-[var(--muted)] outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)] transition-all [&::-webkit-search-cancel-button]:appearance-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-[var(--muted)] hover:text-[var(--text)] p-0.5 transition-transform active:scale-90"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Calm Device Table Frame */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-sm">
          {/* Table Header (Desktop) */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-[var(--border)] text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider bg-[var(--surface-raised)]">
            <div className="col-span-5">Device</div>
            <div className="col-span-3">Last activity</div>
            <div className="col-span-2">Access state</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          {/* Table Rows or Loading State */}
          {loading ? (
            <div className="py-20 flex items-center justify-center bg-transparent">
              <BrandSpinner size="lg" />
            </div>
          ) : paginatedDevices.length > 0 ? (
            <div className="divide-y divide-[var(--border)]">
              {paginatedDevices.map((device) => {
                const isCurrent = device.current;

                return (
                  <div
                    key={device.id}
                    className={`p-4 sm:px-6 sm:py-4 transition-colors duration-150 border-l-[3px] ${
                      isCurrent
                        ? 'border-[#B6FF2E]'
                        : 'border-transparent hover:border-[#B6FF2E]/50'
                    } bg-[var(--surface)] hover:bg-[#B6FF2E]/12 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center group`}
                  >
                    {/* Device Summary */}
                    <div className="md:col-span-5 flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--text)] group-hover:text-[#0B0B0C] flex items-center justify-center shrink-0 transition-colors">
                        {device.kind === 'phone' ? (
                          <Smartphone className="w-5 h-5" />
                        ) : (
                          <Laptop className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-[var(--text)] truncate">
                            {device.browser} on {device.os}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-[#0B0B0C] border border-[#B6FF2E]/70 bg-[#B6FF2E]/25 px-2 py-0.5 rounded-md inline-flex items-center gap-1 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0B0B0C]" />
                              This device
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[var(--sub)] mt-0.5 truncate">
                          {device.location} · <span className="num font-mono">{device.ip}</span>
                        </div>
                      </div>
                    </div>

                    {/* Last Activity */}
                    <div className="md:col-span-3 text-xs text-[var(--sub)] num">
                      <span className="md:hidden text-[11px] text-[var(--muted)] block font-semibold mb-0.5">Last activity:</span>
                      <span className={isCurrent ? 'text-[var(--text)] font-semibold' : ''}>
                        {device.lastActive}
                      </span>
                    </div>

                    {/* Access Status */}
                    <div className="md:col-span-2">
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text)]">
                        {device.status === 'trusted' ? (
                          <Check className="w-4 h-4 text-[var(--success)]" />
                        ) : device.status === 'blocked' ? (
                          <Ban className="w-4 h-4 text-[var(--danger)]" />
                        ) : (
                          <Clock className="w-4 h-4 text-[var(--warn)]" />
                        )}
                        <span className="capitalize">{device.status === 'pending' ? 'Pending review' : device.status}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="md:col-span-2 flex justify-start md:justify-end">
                      {isCurrent ? (
                        <span className="text-xs text-[var(--muted)] font-medium">This device</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveModalDevice(device)}
                          className="h-9 px-3.5 rounded-lg border border-[var(--border-strong)] hover:border-[#0B0B0C] bg-[var(--surface)] hover:bg-[var(--surface-raised)] text-xs font-semibold text-[var(--text)] transition-colors shadow-2xs"
                        >
                          {device.status === 'pending' ? 'Details' : 'Manage'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-10 text-center text-[var(--sub)]">
              <strong className="block text-sm text-[var(--text)] mb-1">No matching devices</strong>
              <p className="text-xs mb-4">Try another search term or filter.</p>
              <button
                onClick={() => {
                  setFilter('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-lg bg-[var(--brand)] text-[var(--brand-text)] text-xs font-semibold hover:bg-[var(--brand-hover)] transition-colors"
              >
                Show all devices
              </button>
            </div>
          )}

          {/* Table Footer / Pager */}
          <div className="px-6 py-3.5 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted)] bg-[var(--surface-raised)]">
            <span className="num">
              Showing {filteredDevices.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–
              {Math.min(currentPage * pageSize, filteredDevices.length)} of {filteredDevices.length} sessions
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                  className="px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-raised)] text-xs font-semibold text-[var(--text)] disabled:opacity-40 transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5 inline mr-1" /> Prev
                </button>
                <span className="num px-2 font-medium text-[var(--text)]">{currentPage} / {totalPages}</span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(currentPage + 1)}
                  className="px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-raised)] text-xs font-semibold text-[var(--text)] disabled:opacity-40 transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="w-3.5 h-3.5 inline ml-1" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Security Line */}
        <div className="mt-6 flex items-start gap-2.5 text-xs text-[var(--sub)] leading-relaxed">
          <ShieldAlert className="w-4 h-4 text-[var(--brand)] shrink-0 mt-0.5" />
          <span>
            Blocking a device takes effect immediately. Restoring a blocked device requires administrator security approval.
          </span>
        </div>
      </div>

      {/* Accessible Confirmation Dialog */}
      {activeModalDevice && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] p-6 sm:p-7 shadow-2xl relative text-[var(--text)] animate-in zoom-in-95">
            <button
              onClick={() => setActiveModalDevice(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)]"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="font-heading font-extrabold text-xl text-[var(--text)]">
              {activeModalDevice.status === 'blocked'
                ? 'Request device restoration'
                : activeModalDevice.status === 'pending'
                ? 'Review in progress'
                : 'Block this device?'}
            </h2>

            <p className="text-xs text-[var(--sub)] leading-relaxed mt-2 mb-4">
              {activeModalDevice.status === 'blocked'
                ? 'Access remains blocked while an administrator reviews the verification request.'
                : activeModalDevice.status === 'pending'
                ? 'This device is currently awaiting administrator review.'
                : 'Block this device to revoke its access to your Xtrinox workspace and active tools.'}
            </p>

            <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] text-xs font-semibold text-[var(--text)] mb-4">
              {activeModalDevice.browser} on {activeModalDevice.os} · {activeModalDevice.location}
            </div>

            <p className="text-[11px] text-[var(--muted)] leading-relaxed mb-6">
              {activeModalDevice.status === 'blocked'
                ? 'Submitting the request will not immediately restore access.'
                : activeModalDevice.status === 'pending'
                ? 'No action required from you at this time.'
                : 'Blocking takes effect immediately across all workspace tools.'}
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setActiveModalDevice(null)}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-raised)] transition-colors"
              >
                {activeModalDevice.status === 'pending' ? 'Close' : 'Cancel'}
              </button>

              {activeModalDevice.status !== 'pending' && (
                <button
                  type="button"
                  onClick={handleBlockToggle}
                  disabled={actionLoading}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-70 ${
                    activeModalDevice.status === 'blocked'
                      ? 'bg-[var(--brand)] hover:bg-[var(--brand-hover)]'
                      : 'bg-[var(--danger)] hover:opacity-90'
                  }`}
                >
                  {actionLoading ? (
                    <>
                      <BrandSpinner size="xs" variant="mark-spin" tone="acid" badge={false} />
                      <span>Saving…</span>
                    </>
                  ) : (
                    <span>{activeModalDevice.status === 'blocked' ? 'Request restoration' : 'Block device'}</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] text-xs shadow-2xl animate-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
