import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Search, 
  Clock, 
  User, 
  Terminal,
  ChevronRight
} from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const q = query(collection(db, 'admin_audit_logs'), limit(50));
        const snap = await getDocs(q);
        setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err: any) {
        console.error('Audit Log Fetch Failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Audit Trail</h1>
        <p className="text-slate-500 text-sm">Historical record of all administrative actions and system modifications.</p>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Action History</span>
          <Terminal className="w-4 h-4 text-slate-300" />
        </div>
        
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center text-slate-400 italic">Accessing secure logs...</div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 italic">No administrative actions recorded yet.</div>
          ) : logs.map((log) => (
            <div key={log.id} className="p-6 hover:bg-slate-50/50 transition-colors flex items-start justify-between gap-6">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-900">{log.action}</span>
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                    <span className="text-xs font-mono text-slate-500">{log.targetId}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {log.adminUid.substring(0, 8)}...
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {log.timestamp?.toDate().toLocaleString()}
                    </div>
                  </div>
                  {log.details && (
                    <pre className="mt-3 p-3 bg-slate-900 text-emerald-400 text-[10px] rounded-lg overflow-x-auto max-w-2xl">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
