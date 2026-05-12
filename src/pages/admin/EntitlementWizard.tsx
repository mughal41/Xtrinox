import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Send, 
  Users, 
  Package, 
  Clock, 
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Zap
} from 'lucide-react';
import { adminToolsService, adminEntitlementService } from '../../services/admin.service';
import { useAuthStore } from '../../state/useAuthStore';
import { useRuntimeStore } from '../../state/useRuntimeStore';

export const EntitlementWizard: React.FC = () => {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: admin } = useAuthStore();
  const { setAdminDataLoading } = useRuntimeStore();

  // Form States
  const [targetUid, setTargetUid] = useState('');
  const [selectedTool, setSelectedTool] = useState('');
  const [duration, setDuration] = useState(30);
  const [processing, setProcessing] = useState(false);

  // Bulk States
  const [bulkUids, setBulkUids] = useState('');
  const [cookiesJson, setCookiesJson] = useState('');

  useEffect(() => { 
    loadTools(); 
    return () => setAdminDataLoading(false);
  }, []);
  
  const loadTools = async () => {
    setAdminDataLoading(true);
    const data = await adminToolsService.getAllTools();
    setTools(data);
    if (data.length > 0) setSelectedTool(data[0].id);
    setLoading(false);
    setAdminDataLoading(false);
  };

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUid || !selectedTool) return;
    setProcessing(true);
    try {
      await adminEntitlementService.grantAccess(targetUid, selectedTool, duration, admin!.uid);
      alert('Access granted successfully.');
      setTargetUid('');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
    setProcessing(false);
  };

  const handleBulkInject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkUids || !cookiesJson) return;
    setProcessing(true);
    try {
      const uids = bulkUids.split('\n').map(u => u.trim()).filter(Boolean);
      const cookies = JSON.parse(cookiesJson);
      await adminEntitlementService.bulkInjectSession(uids, cookies, admin!.uid);
      alert(`Session injected into ${uids.length} accounts.`);
      setBulkUids('');
      setCookiesJson('');
    } catch (err: any) {
      alert(`Injection failed: ${err.message}`);
    }
    setProcessing(false);
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Provisioning Wizard</h1>
        <p className="text-slate-500 text-sm">Deploy entitlements and session payloads across the user base.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Manual Grant Form */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <h2 className="font-bold text-slate-900">Individual Grant</h2>
          </div>
          
          <form onSubmit={handleGrant} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">User UID</label>
              <input 
                type="text" 
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-primary/20 transition-all outline-none"
                placeholder="Paste UID here..."
                value={targetUid}
                onChange={(e) => setTargetUid(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Select Tool</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-primary/20 transition-all outline-none appearance-none"
                value={selectedTool}
                onChange={(e) => setSelectedTool(e.target.value)}
              >
                {tools.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Access Duration (Days)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="number" 
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm transition-all outline-none"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                />
                <span className="text-xs font-semibold text-slate-500">Days</span>
              </div>
            </div>

            <button 
              disabled={processing}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              {processing ? <div className="w-4 h-4 animate-spin border-2 border-white/20 border-t-white rounded-full" /> : <Send className="w-4 h-4" />}
              Grant Access
            </button>
          </form>
        </section>

        {/* Bulk Session Injection */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <UploadCloud className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-bold text-slate-900">Session Engine</h2>
          </div>

          <form onSubmit={handleBulkInject} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Target UIDs (New line separated)</label>
              <textarea 
                className="w-full h-24 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-mono transition-all outline-none"
                placeholder="UID 1&#10;UID 2&#10;..."
                value={bulkUids}
                onChange={(e) => setBulkUids(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Raw cookies.json</label>
              <textarea 
                className="w-full h-24 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-mono transition-all outline-none"
                placeholder='[{"name":"session", "value":"..."}]'
                value={cookiesJson}
                onChange={(e) => setCookiesJson(e.target.value)}
              />
            </div>

            <button 
              disabled={processing}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {processing ? <div className="w-4 h-4 animate-spin border-2 border-white/20 border-t-white rounded-full" /> : <Zap className="w-4 h-4" />}
              Deploy Sessions
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};
