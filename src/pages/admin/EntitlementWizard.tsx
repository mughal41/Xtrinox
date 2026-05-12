import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Cookie,
  Package,
  Send,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { adminEntitlementService, adminProductCookieService, adminToolsService } from '../../services/admin.service';
import { useAuthStore } from '../../state/useAuthStore';

const parseUserIds = (value: string) => {
  return Array.from(new Set(
    value
      .split(/[\n,]+/)
      .map(uid => uid.trim())
      .filter(Boolean)
  ));
};

export const EntitlementWizard: React.FC = () => {
  const { user: admin } = useAuthStore();
  const [tools, setTools] = useState<any[]>([]);
  const [allCookieSets, setAllCookieSets] = useState<any[]>([]);
  const [assignmentCounts, setAssignmentCounts] = useState<Record<string, number>>({});
  const [selectedToolId, setSelectedToolId] = useState('');
  const [selectedCookieId, setSelectedCookieId] = useState('');
  const [userIdsInput, setUserIdsInput] = useState('');
  const [durationDays, setDurationDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const cookieSetsForSelectedTool = useMemo(() => {
    return allCookieSets.filter(cookieSet => cookieSet.marketplaceToolId === selectedToolId && cookieSet.active !== false);
  }, [allCookieSets, selectedToolId]);

  const parsedUserIds = useMemo(() => parseUserIds(userIdsInput), [userIdsInput]);
  const selectedTool = tools.find(tool => tool.id === selectedToolId);
  const selectedCookieSet = allCookieSets.find(cookieSet => cookieSet.id === selectedCookieId);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const toolsData = await adminToolsService.getAllTools();
      setTools(toolsData);

      const firstToolId = selectedToolId || toolsData[0]?.id || '';
      setSelectedToolId(firstToolId);

      try {
        const cookiesData = await adminProductCookieService.getAllProductCookies();
        setAllCookieSets(cookiesData);

        const firstCookie = cookiesData.find((cookie: any) => cookie.marketplaceToolId === firstToolId && cookie.active !== false);
        setSelectedCookieId(firstCookie?.id || '');

        const counts = await adminProductCookieService.getCookieAssignmentCounts(cookiesData.map((cookie: any) => cookie.id));
        setAssignmentCounts(counts);
      } catch (cookieErr: any) {
        setAllCookieSets([]);
        setAssignmentCounts({});
        setSelectedCookieId('');
        setError(cookieErr.message || 'Tools loaded, but product cookies could not be loaded. Deploy Firestore rules for product_cookies.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load marketplace tools.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const valid = cookieSetsForSelectedTool.some(cookieSet => cookieSet.id === selectedCookieId);
    if (!valid) {
      setSelectedCookieId(cookieSetsForSelectedTool[0]?.id || '');
    }
  }, [cookieSetsForSelectedTool, selectedCookieId]);

  const handleGrant = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!admin) return;
    setMessage('');
    setError('');

    if (!selectedToolId) {
      setError('Select a marketplace tool.');
      return;
    }

    if (!selectedCookieSet) {
      setError('Select a product cookie set for this tool.');
      return;
    }

    if (parsedUserIds.length === 0) {
      setError('Enter at least one user UID.');
      return;
    }

    setProcessing(true);
    try {
      await adminEntitlementService.grantAccessToUsers(
        parsedUserIds,
        selectedToolId,
        durationDays,
        admin.uid,
        selectedCookieSet
      );
      setMessage(`Assigned ${selectedTool?.name || selectedToolId} with "${selectedCookieSet.title}" to ${parsedUserIds.length} user${parsedUserIds.length === 1 ? '' : 's'}.`);
      setUserIdsInput('');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Unable to grant access.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Admin Console</p>
        <h1 className="text-3xl font-bold text-slate-900">Assign Tool Access</h1>
        <p className="text-slate-500 text-sm mt-2 max-w-2xl">
          Select a marketplace tool, choose the cookie set to inject, add one or more user UIDs, and define the access duration.
        </p>
      </header>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {message && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form onSubmit={handleGrant} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <Package className="h-3.5 w-3.5" />
                Marketplace Tool
              </label>
              <select
                required
                disabled={loading}
                value={selectedToolId}
                onChange={(event) => setSelectedToolId(event.target.value)}
                className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary/30 focus:bg-white"
              >
                {tools.map(tool => (
                  <option key={tool.id} value={tool.id}>{tool.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <Cookie className="h-3.5 w-3.5" />
                Tool Cookies
              </label>
              <select
                required
                disabled={loading || cookieSetsForSelectedTool.length === 0}
                value={selectedCookieId}
                onChange={(event) => setSelectedCookieId(event.target.value)}
                className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary/30 focus:bg-white"
              >
                {cookieSetsForSelectedTool.length === 0 ? (
                  <option value="">No active cookie sets</option>
                ) : cookieSetsForSelectedTool.map(cookieSet => (
                  <option key={cookieSet.id} value={cookieSet.id}>{cookieSet.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <Users className="h-3.5 w-3.5" />
              User UID or UID List
            </label>
            <textarea
              required
              value={userIdsInput}
              onChange={(event) => setUserIdsInput(event.target.value)}
              placeholder="Paste one UID, or multiple UIDs separated by commas/new lines"
              className="h-32 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 font-mono text-xs outline-none focus:border-primary/30 focus:bg-white"
            />
            <p className="mt-2 text-xs text-slate-400">{parsedUserIds.length} unique user{parsedUserIds.length === 1 ? '' : 's'} detected.</p>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              Access Duration
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                required
                value={durationDays}
                onChange={(event) => setDurationDays(Number(event.target.value))}
                className="w-32 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary/30 focus:bg-white"
              />
              <span className="text-sm font-semibold text-slate-500">days</span>
            </div>
          </div>

          <button
            disabled={processing || loading || !selectedCookieId}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {processing ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Assign Tool Access
          </button>
        </form>

        <aside className="self-start rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="font-bold text-slate-900">Assignment Summary</h2>
          <div className="mt-5 space-y-4 text-sm">
            <SummaryRow label="Tool" value={selectedTool?.name || 'Not selected'} />
            <SummaryRow label="Cookie Set" value={selectedCookieSet?.title || 'Not selected'} />
            <SummaryRow label="Current Users on Cookie" value={selectedCookieId ? String(assignmentCounts[selectedCookieId] || 0) : '0'} />
            <SummaryRow label="New Users" value={String(parsedUserIds.length)} />
            <SummaryRow label="Duration" value={`${durationDays || 0} days`} />
          </div>
        </aside>
      </div>
    </div>
  );
};

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-slate-50 p-3">
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
    <p className="mt-1 break-words font-semibold text-slate-800">{value}</p>
  </div>
);
