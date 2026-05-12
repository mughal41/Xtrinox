import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../state/useAuthStore';
import { useRuntimeStore } from '../state/useRuntimeStore';
import { firestoreService } from '../services/firestore.service';
import { Device } from '../firebase/schema';
import { PagePreloader } from '../components/PagePreloader';

export const DevicesPage: React.FC = () => {
  const { user } = useAuthStore();
  const { currentDeviceId } = useRuntimeStore();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      firestoreService.getDevices(user.uid).then(data => {
        // Sort: Current device first, then recent first
        const sorted = data.sort((a, b) => {
          if (a.deviceId === currentDeviceId) return -1;
          if (b.deviceId === currentDeviceId) return 1;
          return b.lastActiveAt?.toMillis() - a.lastActiveAt?.toMillis();
        });
        setDevices(sorted);
        setLoading(false);
      });
    }
  }, [user, currentDeviceId]);

  const handleBlockDevice = async (deviceId: string) => {
    if (!user) return;
    if (window.confirm("Are you sure you want to block this device? It will immediately lose access and can only be restored by an administrator.")) {
      await firestoreService.blockDevice(user.uid, deviceId, 'user');
      // Optimistic update
      setDevices(prev => prev.map(d => d.deviceId === deviceId ? { ...d, blocked: true, blockedBy: 'user' } : d));
    }
  };

  const handleRequestUnblock = async (deviceId: string) => {
    if (!user) return;
    await firestoreService.requestUnblock(user.uid, deviceId);
    setDevices(prev => prev.map(d => d.deviceId === deviceId ? { ...d, unblockRequested: true } : d));
    alert("Restoration request sent to administrator.");
  };

  if (loading) return <PagePreloader message="Checking device integrity..." />;

  return (
    <div className="space-y-xl">
      <div>
        <h1 className="font-h1 text-h1 text-on-surface">Trusted Devices</h1>
        <p className="text-body-md text-on-surface-variant">Manage devices that can access your premium sessions.</p>
      </div>

      <div className="bg-surface rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
        <div className="p-lg border-b border-outline-variant bg-surface-container-low">
          <h3 className="font-h3 text-h3 text-on-surface">Active Sessions</h3>
          <p className="text-label-md text-on-surface-variant">You are currently logged in on these devices.</p>
        </div>
        
        <div className="divide-y divide-outline-variant">
          {devices.map(device => {
            const isCurrent = device.deviceId === currentDeviceId;
            
            return (
              <div key={device.deviceId} className="p-lg flex justify-between items-center hover:bg-surface-container-low transition-colors">
                <div className="flex gap-4 items-center">
                  <div className="h-10 w-10 bg-surface-container-high rounded-full flex items-center justify-center text-outline">
                     <span className="material-symbols-outlined">{device.os.toLowerCase().includes('android') || device.os.toLowerCase().includes('ios') ? 'smartphone' : 'laptop_mac'}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">
                      {device.browser} on {device.os}
                      {isCurrent && <span className="ml-2 text-primary font-medium text-label-sm">(Current)</span>}
                    </h4>
                    <p className="text-label-md text-on-surface-variant">
                      {device.ip} • {device.location} • Last active {device.lastActiveAt?.toDate ? device.lastActiveAt.toDate().toLocaleDateString() : 'Just now'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                   {device.blocked ? (
                     <div className="text-right">
                       <span className="bg-error/10 text-error px-3 py-1 rounded-full text-label-sm font-bold border border-error/20 block mb-1">
                         Blocked
                       </span>
                       {device.unblockRequested ? (
                         <span className="text-[10px] text-amber-600 font-bold uppercase tracking-tight">Pending Review</span>
                       ) : (
                         <button 
                           onClick={() => handleRequestUnblock(device.deviceId)}
                           className="text-[10px] text-primary font-bold uppercase tracking-tight hover:underline"
                         >
                           Request Restoration
                         </button>
                       )}
                     </div>
                   ) : (
                     <span className="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-label-sm font-bold border border-emerald-500/20">
                       Trusted
                     </span>
                   )}
                   
                   {!isCurrent && !device.blocked && (
                     <button 
                       onClick={() => handleBlockDevice(device.deviceId)}
                       className="text-error font-bold text-label-md hover:underline"
                     >
                       Block Device
                     </button>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-2xl">
         <div className="flex gap-4 items-start">
            <span className="material-symbols-outlined text-amber-600">security</span>
            <div>
              <h4 className="font-bold text-amber-900">Security Recommendation</h4>
              <p className="text-body-md text-amber-800/80 mt-1">
                We recommend enabling multi-device sync only on your primary workstation. If you notice any suspicious activity, block the device immediately. Blocked devices can only be unblocked by an administrator.
              </p>
            </div>
         </div>
      </div>
    </div>
  );
};
