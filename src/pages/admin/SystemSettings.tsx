import React, { useState, useEffect } from 'react';
import { 
  Settings2, 
  Zap, 
  ShieldCheck, 
  Globe, 
  Database,
  Lock,
  RefreshCcw,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const SystemSettings: React.FC = () => {
  const [config, setConfig] = useState<any>({
    maintenanceMode: false,
    registrationEnabled: true,
    marketplaceVisible: true,
    bridgeVersionRequired: '1.0.0'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      const snap = await getDoc(doc(db, 'system_configs', 'global'));
      if (snap.exists()) setConfig(snap.data());
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const handleToggle = async (key: string) => {
    const newVal = !config[key];
    const updated = { ...config, [key]: newVal };
    setConfig(updated);
    await updateDoc(doc(db, 'system_configs', 'global'), updated);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">System Controls</h1>
        <p className="text-slate-500 text-sm">Global feature flags, security parameters, and maintenance toggles.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Global Flags */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <ToggleRight className="w-5 h-5 text-primary" />
            Feature Flags
          </h3>
          
          <div className="space-y-4">
            <ToggleRow 
              label="Maintenance Mode" 
              desc="Redirect all users to maintenance page" 
              active={config.maintenanceMode}
              onToggle={() => handleToggle('maintenanceMode')}
            />
            <ToggleRow 
              label="User Registration" 
              desc="Allow new users to sign up" 
              active={config.registrationEnabled}
              onToggle={() => handleToggle('registrationEnabled')}
            />
            <ToggleRow 
              label="Marketplace Visibility" 
              desc="Show/hide the tools marketplace" 
              active={config.marketplaceVisible}
              onToggle={() => handleToggle('marketplaceVisible')}
            />
          </div>
        </div>

        {/* Security & Infrastructure */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Security Parameters
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Required Bridge Version</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm outline-none font-mono"
                  value={config.bridgeVersionRequired}
                  onChange={(e) => setConfig({...config, bridgeVersionRequired: e.target.value})}
                />
                <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold">Apply</button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
             <button className="w-full bg-rose-50 text-rose-600 py-3 rounded-xl font-bold text-sm hover:bg-rose-100 transition-colors flex items-center justify-center gap-2">
               <RefreshCcw className="w-4 h-4" />
               Purge Global Cache
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ToggleRow = ({ label, desc, active, onToggle }: any) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
    <div>
      <p className="text-sm font-bold text-slate-900">{label}</p>
      <p className="text-[10px] text-slate-500">{desc}</p>
    </div>
    <button onClick={onToggle} className="transition-all">
      {active 
        ? <ToggleRight className="w-8 h-8 text-primary fill-primary/10" /> 
        : <ToggleLeft className="w-8 h-8 text-slate-300" />
      }
    </button>
  </div>
);
