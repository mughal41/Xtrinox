import React, { useEffect, useMemo, useState } from 'react';
import { Edit3, Package, Plus, Save, Trash2, X } from 'lucide-react';
import { adminProductCookieService, adminToolsService, normalizeCookiesForSession } from '../../services/admin.service';
import { useAuthStore } from '../../state/useAuthStore';

const emptyForm = {
  id: '',
  marketplaceToolId: '',
  title: '',
  cookiesJson: '[\n  {\n    "name": "session",\n    "value": "",\n    "domain": ".example.com",\n    "path": "/"\n  }\n]',
  active: true,
};

export const ProductCookiesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [tools, setTools] = useState<any[]>([]);
  const [cookieSets, setCookieSets] = useState<any[]>([]);
  const [assignmentCounts, setAssignmentCounts] = useState<Record<string, number>>({});
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const toolNameById = useMemo(() => {
    return tools.reduce((acc, tool) => ({ ...acc, [tool.id]: tool.name }), {} as Record<string, string>);
  }, [tools]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const toolsData = await adminToolsService.getAllTools();
      setTools(toolsData);
      if (!form.marketplaceToolId && toolsData[0]?.id) {
        setForm(prev => ({ ...prev, marketplaceToolId: toolsData[0].id }));
      }

      try {
        const cookiesData = await adminProductCookieService.getAllProductCookies();
        setCookieSets(cookiesData);
        const counts = await adminProductCookieService.getCookieAssignmentCounts(cookiesData.map((cookie: any) => cookie.id));
        setAssignmentCounts(counts);
      } catch (cookieErr: any) {
        setCookieSets([]);
        setAssignmentCounts({});
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

  const resetForm = () => {
    setEditingId('');
    setForm({
      ...emptyForm,
      marketplaceToolId: tools[0]?.id || '',
    });
  };

  const handleEdit = (cookieSet: any) => {
    setEditingId(cookieSet.id);
    setForm({
      id: cookieSet.id,
      marketplaceToolId: cookieSet.marketplaceToolId,
      title: cookieSet.title,
      cookiesJson: JSON.stringify(cookieSet.cookies || [], null, 2),
      active: cookieSet.active !== false,
    });
  };

  const handleDelete = async (cookieId: string) => {
    if (!user || !window.confirm('Delete this product cookie set? Existing entitlements will keep their encrypted payload.')) return;
    await adminProductCookieService.deleteProductCookie(cookieId, user.uid);
    await loadData();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    setSaving(true);
    setError('');
    setNotice('');
    try {
      const cookies = JSON.parse(form.cookiesJson);
      const normalizedCookies = normalizeCookiesForSession(cookies);
      if (normalizedCookies.length === 0) throw new Error('No usable cookies remain after cleanup.');
      const removedCount = cookies.length - normalizedCookies.length;

      const payload = {
        marketplaceToolId: form.marketplaceToolId,
        title: form.title.trim(),
        cookies: normalizedCookies,
        active: form.active,
      };

      if (editingId) {
        await adminProductCookieService.updateProductCookie(editingId, payload, user.uid);
      } else {
        await adminProductCookieService.createProductCookie(payload, user.uid);
      }

      resetForm();
      await loadData();
      setNotice(`Saved ${normalizedCookies.length} session cookie${normalizedCookies.length === 1 ? '' : 's'}. Removed ${removedCount} non-session cookie${removedCount === 1 ? '' : 's'}.`);
    } catch (err: any) {
      setError(err.message || 'Unable to save product cookie set.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Admin Console</p>
        <h1 className="text-3xl font-bold text-slate-900">Product Cookies</h1>
        <p className="text-slate-500 text-sm mt-2 max-w-2xl">
          Store reusable cookie payloads per marketplace tool, then assign one cookie set when granting access.
        </p>
      </header>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-bold text-slate-900">Saved Cookie Sets</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-sm text-slate-400">Loading product cookies...</div>
            ) : cookieSets.length === 0 ? (
              <div className="p-8 text-sm text-slate-400">No product cookies have been created yet.</div>
            ) : (
              cookieSets.map((cookieSet) => (
                <div key={cookieSet.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900">{cookieSet.title}</h3>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${cookieSet.active !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                          {cookieSet.active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {toolNameById[cookieSet.marketplaceToolId] || cookieSet.marketplaceToolId}
                      </p>
                      <p className="mt-2 text-xs font-semibold text-slate-400">
                        {(cookieSet.cookies || []).length} cookie item{(cookieSet.cookies || []).length === 1 ? '' : 's'} · {assignmentCounts[cookieSet.id] || 0} assigned user{(assignmentCounts[cookieSet.id] || 0) === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(cookieSet)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-primary">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(cookieSet.id)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-rose-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <form onSubmit={handleSubmit} className="self-start rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-bold text-slate-900">{editingId ? 'Edit Cookie Set' : 'Add Cookie Set'}</h2>
            {editingId ? (
              <button type="button" onClick={resetForm} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            ) : (
              <Plus className="h-5 w-5 text-primary" />
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-400">Tool</label>
            <select
              required
              value={form.marketplaceToolId}
              onChange={(e) => setForm({ ...form, marketplaceToolId: e.target.value })}
              className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary/30 focus:bg-white"
            >
              {tools.map((tool) => (
                <option key={tool.id} value={tool.id}>{tool.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-400">Name / Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="ChatGPT Cookie Set 1"
              className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary/30 focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-400">Cookie JSON Array</label>
            <textarea
              required
              value={form.cookiesJson}
              onChange={(e) => setForm({ ...form, cookiesJson: e.target.value })}
              className="h-56 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 font-mono text-xs outline-none focus:border-primary/30 focus:bg-white"
            />
          </div>

          <label className="flex items-center gap-3 text-sm font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="h-4 w-4"
            />
            Active and selectable during assignment
          </label>

          <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50">
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Cookie Set'}
          </button>
        </form>
      </div>
    </div>
  );
};
