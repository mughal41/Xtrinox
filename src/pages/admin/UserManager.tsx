import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  collection, 
  getDocs, 
  getDoc,
  doc,
  setDoc,
  serverTimestamp,
  query, 
  where, 
  limit 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Key,
  MoreVertical,
  Mail,
  Calendar,
  Zap,
  Plus,
  X
} from 'lucide-react';
import { adminUserService, adminEntitlementService, adminProductCookieService } from '../../services/admin.service';
import { useAuthStore } from '../../state/useAuthStore';
import { useRuntimeStore } from '../../state/useRuntimeStore';

export const UserManager: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { user: currentAdmin } = useAuthStore();
  const { setAdminDataLoading } = useRuntimeStore();

  useEffect(() => {
    loadUsers();
    return () => setAdminDataLoading(false);
  }, []);

  const loadUsers = async () => {
    setAdminDataLoading(true);
    setLoading(true);
    const data = await adminUserService.getAllUsers();
    setUsers(data);
    setLoading(false);
    setAdminDataLoading(false);
  };

  const handleToggleStatus = async (uid: string, currentDisabled: boolean) => {
    if (!confirm(`Are you sure you want to ${currentDisabled ? 'REACTIVATE' : 'DEACTIVATE'} this user?`)) return;
    try {
      await adminUserService.setUserStatus(uid, !currentDisabled);
      await loadUsers();
    } catch (err: any) {
      alert(`Operation failed: ${err.message}`);
    }
  };

  const handleCreateUser = async (email: string, pass: string) => {
    try {
      await adminUserService.createUser(email, pass);
      setIsModalOpen(false);
      loadUsers();
    } catch (err: any) {
      alert(`Failed to create user: ${err.message}`);
    }
  };

  const handleResetPassword = async (uid: string) => {
    const newPass = prompt('Enter new password for this user:');
    if (!newPass) return;
    try {
      await adminUserService.resetPassword(uid, newPass);
      alert('Password reset successfully.');
    } catch (err: any) {
      alert(`Reset failed: ${err.message}`);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.email || '').toLowerCase().includes(search.toLowerCase()) || 
    u.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Directory</h1>
          <p className="text-slate-500 text-sm">Manage authentication states, security status, and account provisioning.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add New User
        </button>
      </header>

      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by email or UID..."
            className="bg-transparent border-none outline-none text-sm w-full text-slate-900 placeholder:text-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 italic">Syncing user directory...</div>
        ) : filteredUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-3xl border border-slate-200 p-0 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col">
            {/* Top Status Banner */}
            {user.hasPendingUnblockRequest ? (
              <div className="bg-amber-500/10 border-b border-amber-200 px-4 py-2 flex items-center justify-between animate-in fade-in duration-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Restoration Requested</span>
                </div>
                <span className="material-symbols-outlined text-amber-600 text-[16px]">security</span>
              </div>
            ) : user.disabled ? (
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Suspended</span>
                <ShieldAlert className="w-3.5 h-3.5 text-slate-300" />
              </div>
            ) : (
              <div className="h-2 w-full bg-emerald-500/10 border-b border-emerald-500/5" />
            )}

            <div className="p-6 flex flex-col flex-grow">
              <div className="flex justify-between items-start mb-6">
                <div className="relative">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-primary font-bold text-xl border border-slate-100 shadow-sm">
                    {(user.email?.[0] || user.id[0] || '?').toUpperCase()}
                  </div>
                  {user.hasPendingUnblockRequest && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-4 border-white shadow-sm" />
                  )}
                </div>
                
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                  <button 
                    onClick={() => handleToggleStatus(user.id, user.disabled)}
                    className={`p-2 rounded-xl transition-all ${user.disabled ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-600'}`}
                    title={user.disabled ? 'Reactivate' : 'Deactivate'}
                  >
                    {user.disabled ? <ShieldCheck className="w-4.5 h-4.5" /> : <ShieldAlert className="w-4.5 h-4.5" />}
                  </button>
                  <button 
                    onClick={() => handleResetPassword(user.id)}
                    className="p-2 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                    title="Reset Password"
                  >
                    <Key className="w-4.5 h-4.5" />
                  </button>
                  <button 
                    onClick={() => { setSelectedUser(user); setIsDetailsOpen(true); }}
                    className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    title="View System Details"
                  >
                    <MoreVertical className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1 mb-6">
                <h3 className="font-bold text-slate-900 truncate text-base">
                  {user.email || 'UID-Authenticated User'}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono select-all tracking-tight opacity-60">ID: {user.id}</p>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${user.disabled ? 'bg-slate-300' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {user.disabled ? 'Suspended' : 'Operational'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-[10px] font-medium">
                    {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : 'Legacy'}
                  </span>
                  <div className="w-1 h-1 bg-slate-200 rounded-full" />
                  <Zap className="w-3 h-3 text-amber-500" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

      {isModalOpen && (
        <UserModal 
          onClose={() => setIsModalOpen(false)} 
          onCreate={handleCreateUser} 
          loadUsers={loadUsers}
        />
      )}

      {isDetailsOpen && (
        <DetailsModal 
          user={selectedUser} 
          onClose={() => setIsDetailsOpen(false)} 
        />
      )}
    </>
  );
};

const UserModal = ({ onClose, onCreate, loadUsers }: any) => {
  const [email, setEmail] = useState('');
  const [uid, setUid] = useState('');
  const [password, setPassword] = useState('');
  const [isSparkMode, setIsSparkMode] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSparkMode) {
        // Direct Firestore provisioning (No Cloud Functions needed)
        await setDoc(doc(db, 'users', uid || email), {
          email,
          id: uid || email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          disabled: false
        });
        alert('User linked successfully in Firestore.');
        onClose();
        loadUsers(); 
      } else {
        await onCreate(email, password);
      }
    } catch (err: any) {
      alert(`Provisioning failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div 
      className="xt-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'grid',
        placeItems: 'center',
        padding: '16px',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(12px)',
        width: '100vw',
        height: '100vh',
        top: 0,
        left: 0
      }}
      onClick={onClose}
    >
      <div 
        className="xt-modal-window animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: 'white',
          width: '100%',
          maxWidth: '448px', // max-w-md
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Provision Account</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button 
            onClick={() => setIsSparkMode(true)}
            className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${isSparkMode ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
          >
            LINK EXISTING UID (SPARK)
          </button>
          <button 
            onClick={() => setIsSparkMode(false)}
            className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${!isSparkMode ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
          >
            CREATE NEW (BLAZE)
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white transition-all"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {isSparkMode ? (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Firebase UID (from Console)</label>
              <input 
                type="text" 
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white transition-all font-mono"
                placeholder="Paste UID here..."
                value={uid}
                onChange={(e) => setUid(e.target.value)}
              />
            </div>
          ) : (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Initial Password</label>
              <input 
                type="password" 
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}
          
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold text-sm">Cancel</button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {loading && <div className="w-4 h-4 animate-spin border-2 border-white/20 border-t-white rounded-full" />}
              {isSparkMode ? 'Link User' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

const DetailsModal = ({ user, onClose }: any) => {
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [data, setData] = useState<any>({ subs: [], history: [], availableTools: [], devices: [] });
  const [loading, setLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ toolId: '', cookieId: '', days: 30 });

  const { user: currentAdmin } = useAuthStore();

  const cookieSetsForTool = data.productCookies?.filter((cookie: any) => (
    cookie.marketplaceToolId === newAssignment.toolId && cookie.active !== false
  )) || [];

  const selectedCookieSet = data.productCookies?.find((cookie: any) => cookie.id === newAssignment.cookieId);

  const loadDetails = async () => {
    setLoading(true);
    try {
      // 1. Fetch Entitlements
      const entitlementsSnap = await getDocs(query(collection(db, 'entitlements'), where('userId', '==', user.id)));
      
      // 2. Fetch Legacy Subscriptions
      const subDoc = await getDoc(doc(db, 'subscriptions', user.id));
      
      // 3. Fetch Available Tools for dropdown
      const toolsSnap = await getDocs(collection(db, 'marketplace_tools'));
      const productCookies = await adminProductCookieService.getAllProductCookies();
      
      const subs = entitlementsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (subDoc.exists()) {
        const subData = subDoc.data();
        if (subData.chatgpt) subs.push({ id: 'legacy_gpt', toolId: 'chatgpt-premium', status: 'LEGACY', expiresAt: null });
      }
      if (user.encryptedPayload && !subs.find(s => s.toolId === 'chatgpt-premium')) {
        subs.push({ id: 'payload_gpt', toolId: 'chatgpt-premium', status: 'AUTO-DETECT', expiresAt: null });
      }

      const historySnap = await getDocs(query(collection(db, 'launch_logs'), where('userId', '==', user.id), limit(10)));
      
      const devicesSnap = await getDocs(query(collection(db, 'devices'), where('userId', '==', user.id)));
      
      setData({
        subs,
        history: historySnap.docs.map(d => ({ id: d.id, ...d.data() })),
        availableTools: toolsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        productCookies,
        devices: devicesSnap.docs.map(d => d.data())
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [user]);

  useEffect(() => {
    if (!newAssignment.toolId) return;
    const firstCookie = (data.productCookies || []).find((cookie: any) => (
      cookie.marketplaceToolId === newAssignment.toolId && cookie.active !== false
    ));
    setNewAssignment(prev => ({
      ...prev,
      cookieId: firstCookie?.id || '',
    }));
  }, [newAssignment.toolId, data.productCookies]);

  const handleGrant = async () => {
    if (!newAssignment.toolId) return alert('Select a tool first');
    if (!selectedCookieSet) return alert('Select a cookie set for this tool first');
    setLoading(true);
    try {
      await adminEntitlementService.grantAccess(
        user.id,
        newAssignment.toolId,
        newAssignment.days,
        currentAdmin?.uid || 'admin',
        selectedCookieSet
      );
      alert('Access granted successfully.');
      setIsAssigning(false);
      await loadDetails();
    } catch (e: any) {
      alert('Failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (toolId: string) => {
    if (!confirm(`Revoke access to ${toolId} for this user?`)) return;
    setLoading(true);
    try {
      await adminEntitlementService.revokeAccess(user.id, toolId, currentAdmin?.uid || 'admin');
      await loadDetails();
    } catch (e: any) {
      alert('Failed to revoke: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to unblock this device?')) return;
    try {
      const { firestoreService } = await import('../../services/firestore.service');
      await firestoreService.unblockDevice(user.id, deviceId);
      setData(prev => ({
        ...prev,
        devices: prev.devices.map((d: any) => d.deviceId === deviceId ? { ...d, blocked: false, blockedBy: null } : d)
      }));
    } catch (e: any) {
      alert('Failed to unblock: ' + e.message);
    }
  };

  return createPortal(
    <div 
      className="xt-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'grid',
        placeItems: 'center',
        padding: '16px',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(12px)',
        width: '100vw',
        height: '100vh',
        top: 0,
        left: 0
      }}
      onClick={onClose}
    >
      <div 
        className="xt-modal-window animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: 'white',
          width: '100%',
          maxWidth: '42rem', // 2xl
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          overflow: 'hidden',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold">
              {(user.email?.[0] || user.id[0]).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user.email || 'UID Login'}</h2>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">{user.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex border-b border-slate-100 mb-6 overflow-x-auto">
          <TabButton active={activeTab === 'subscriptions'} onClick={() => setActiveTab('subscriptions')} label="Subscriptions" />
          <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} label="Launch History" />
          <TabButton active={activeTab === 'devices'} onClick={() => setActiveTab('devices')} label="Devices" />
          <TabButton active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} label="Billing" />
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {loading ? (
            <div className="py-12 text-center text-slate-400 italic">Loading user data...</div>
          ) : activeTab === 'subscriptions' ? (
            <div className="space-y-4">
              {data.subs.length === 0 ? (
                <p className="text-center py-8 text-slate-400 text-sm">No active subscriptions found.</p>
              ) : data.subs.map((sub: any) => (
                <div key={sub.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center gap-4">
                  <div>
                    <p className="font-bold text-slate-900">{sub.toolId}</p>
                    <p className="text-[10px] text-slate-500">
                      Expires: {sub.expiresAt?.toDate ? sub.expiresAt.toDate().toLocaleDateString() : 'No Expiry'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                      sub.status === 'LEGACY' ? 'bg-amber-50 text-amber-600' : 
                      sub.status === 'AUTO-DETECT' ? 'bg-indigo-50 text-indigo-600' :
                      'bg-emerald-50 text-emerald-600'
                    }`}>
                      {sub.status || 'ACTIVE'}
                    </span>
                    {!sub.status && (
                      <button
                        onClick={() => handleRevoke(sub.toolId)}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-600 hover:bg-rose-100"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isAssigning ? (
                <div className="mt-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-3 animate-in zoom-in-95 duration-200">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">New Entitlement</p>
                  <div className="grid grid-cols-2 gap-3">
                    <select 
                      className="bg-white border border-indigo-100 rounded-lg px-3 py-2 text-xs outline-none"
                      value={newAssignment.toolId}
                      onChange={(e) => setNewAssignment({...newAssignment, toolId: e.target.value})}
                    >
                      <option value="">Select Tool...</option>
                      {data.availableTools.map((t: any) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <select 
                      className="bg-white border border-indigo-100 rounded-lg px-3 py-2 text-xs outline-none"
                      value={newAssignment.cookieId}
                      disabled={!newAssignment.toolId || cookieSetsForTool.length === 0}
                      onChange={(e) => setNewAssignment({...newAssignment, cookieId: e.target.value})}
                    >
                      {cookieSetsForTool.length === 0 ? (
                        <option value="">No cookie set</option>
                      ) : cookieSetsForTool.map((cookie: any) => (
                        <option key={cookie.id} value={cookie.id}>{cookie.title}</option>
                      ))}
                    </select>
                    <input 
                      type="number" 
                      placeholder="Days"
                      className="bg-white border border-indigo-100 rounded-lg px-3 py-2 text-xs outline-none"
                      value={newAssignment.days}
                      onChange={(e) => setNewAssignment({...newAssignment, days: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsAssigning(false)}
                      className="flex-1 bg-white text-slate-400 py-2 rounded-lg text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleGrant}
                      disabled={!newAssignment.toolId || !newAssignment.cookieId}
                      className="flex-1 bg-primary text-white py-2 rounded-lg text-xs font-bold disabled:opacity-50"
                    >
                      Confirm Grant
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAssigning(true)}
                  className="w-full mt-4 border-2 border-dashed border-slate-200 p-4 rounded-2xl text-slate-400 text-sm font-bold hover:bg-slate-50 transition-all"
                >
                  + Assign New Tool
                </button>
              )}
            </div>
          ) : activeTab === 'history' ? (
            <div className="space-y-3">
               {data.history.map((log: any) => (
                 <div key={log.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl">
                   <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-emerald-500" />
                     <p className="text-sm font-bold text-slate-900">{log.toolId}</p>
                   </div>
                   <p className="text-[10px] text-slate-400">{log.launchedAt?.toDate().toLocaleString()}</p>
                 </div>
               ))}
            </div>
          ) : activeTab === 'devices' ? (
            <div className="space-y-3">
              {data.devices.length === 0 ? (
                <p className="text-center py-8 text-slate-400 text-sm">No devices registered.</p>
              ) : data.devices.map((device: any) => (
                <div key={device.deviceId} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">{device.browser} on {device.os}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">{device.deviceId}</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {device.ip} • {device.location} • Active {device.lastActiveAt?.toDate().toLocaleDateString() || 'Recently'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                      device.unblockRequested ? 'bg-amber-100 text-amber-700 animate-pulse' :
                      device.blocked ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {device.unblockRequested ? 'RESTORE REQUESTED' : 
                       device.blocked ? `BLOCKED BY ${device.blockedBy?.toUpperCase()}` : 'TRUSTED'}
                    </span>
                    {device.blocked && (
                      <button 
                        onClick={() => handleUnblockDevice(device.deviceId)}
                        className={`text-[10px] font-bold py-1.5 px-3 rounded-lg transition-all ${
                          device.unblockRequested 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                            : 'text-indigo-600 hover:bg-indigo-50'
                        }`}
                      >
                        {device.unblockRequested ? 'Approve & Whitelist' : 'Unblock Device'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 italic text-sm">Billing history coming soon...</div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

const TabButton = ({ active, onClick, label }: any) => (
  <button 
    onClick={onClick}
    className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${
      active ? 'text-primary border-primary' : 'text-slate-400 border-transparent hover:text-slate-600'
    }`}
  >
    {label}
  </button>
);
