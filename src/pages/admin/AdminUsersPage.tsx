import React, { useState, useEffect, useMemo } from 'react';
import { AdminUser, UserAccountStatus, DeviceTrustState } from '../../types/admin';
import { adminStore } from '../../services/adminStore';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { SearchToolbar } from '../../components/admin/SearchToolbar';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { AdminDialog } from '../../components/admin/AdminDialog';
import { AdminDrawer } from '../../components/admin/AdminDrawer';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { FormField } from '../../components/admin/FormField';
import { SelectField } from '../../components/admin/SelectField';
import { Tabs } from '../../components/admin/Tabs';
import { EmptyState } from '../../components/admin/EmptyState';
import {
  Users,
  Plus,
  KeyRound,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  Clock,
  Laptop,
  CheckCircle2,
  Trash2,
  Eye,
  EyeOff,
  ChevronRight,
  CreditCard,
  History,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { ProductAvatar } from '../../components/ProductIcon';
import { BrandSpinner } from '../../components/BrandSpinner';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>(adminStore.users);
  const [tools, setTools] = useState(adminStore.tools);
  const [cookieSets, setCookieSets] = useState(adminStore.cookieSets);
  const [loading, setLoading] = useState(!adminStore.isInitialized);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'operational' | 'suspended' | 'restoration_requested'>('all');

  // Add User Modal State
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [provisionMode, setProvisionMode] = useState<'link' | 'create'>('link');
  const [formEmail, setFormEmail] = useState('');
  const [formUid, setFormUid] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [addUserError, setAddUserError] = useState<string | null>(null);

  // Status Change Confirmation State
  const [statusTargetUser, setStatusTargetUser] = useState<AdminUser | null>(null);

  // Reset Password Modal State
  const [resetPassUser, setResetPassUser] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // System Details Drawer State
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [detailsTab, setDetailsTab] = useState<'subscriptions' | 'launch_history' | 'devices' | 'billing'>('subscriptions');

  // Assign New Tool Form inside Drawer
  const [assignToolOpen, setAssignToolOpen] = useState(false);
  const [assignToolId, setAssignToolId] = useState(tools[0]?.id || 'chatgpt');
  const [assignCookieSetId, setAssignCookieSetId] = useState('');
  const [assignDurationDays, setAssignDurationDays] = useState(30);

  useEffect(() => {
    return adminStore.subscribe(() => {
      setUsers([...adminStore.users]);
      setTools([...adminStore.tools]);
      setCookieSets([...adminStore.cookieSets]);
      setLoading(false);
      // Keep selectedUser in sync
      if (selectedUser) {
        const refreshed = adminStore.users.find((u) => u.uid === selectedUser.uid);
        if (refreshed) setSelectedUser({ ...refreshed });
      }
    });
  }, [selectedUser]);

  // Available cookie sets for assign modal (filtered by active & tool)
  const availableCookieSets = useMemo(() => {
    return cookieSets.filter((c) => c.toolId === assignToolId && c.isActive);
  }, [cookieSets, assignToolId]);

  useEffect(() => {
    if (availableCookieSets.length > 0) {
      setAssignCookieSetId(availableCookieSets[0].id);
    } else {
      setAssignCookieSetId('');
    }
  }, [availableCookieSets]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.email.toLowerCase().includes(q) ||
        u.uid.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' || u.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, statusFilter]);

  const handleOpenAddUser = () => {
    setProvisionMode('link');
    setFormEmail('');
    setFormUid('');
    setFormPassword('');
    setAddUserError(null);
    setAddUserOpen(true);
  };

  const handleSaveAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError(null);

    const email = formEmail.trim();
    if (!email || !email.includes('@')) {
      setAddUserError('Valid email address is required.');
      return;
    }

    try {
      if (provisionMode === 'link') {
        const uid = formUid.trim() || `usr_${Math.random().toString(36).substring(2, 9)}`;
        adminStore.addUser({
          uid,
          email,
          status: 'operational',
          role: 'user',
          createdAt: new Date().toISOString(),
          subscriptions: [],
          devices: [],
          launchHistory: []
        });
      } else {
        if (!formPassword || formPassword.length < 6) {
          setAddUserError('Initial password must be at least 6 characters.');
          return;
        }
        adminStore.addUser({
          uid: `usr_${Math.random().toString(36).substring(2, 9)}`,
          email,
          status: 'operational',
          role: 'user',
          createdAt: new Date().toISOString(),
          subscriptions: [],
          devices: [],
          launchHistory: []
        });
      }
      setAddUserOpen(false);
    } catch (err: any) {
      setAddUserError(err.message || 'Failed to provision user.');
    }
  };

  const handleToggleStatus = (user: AdminUser) => {
    setStatusTargetUser(user);
  };

  const handleConfirmToggleStatus = () => {
    if (!statusTargetUser) return;
    const nextStatus: UserAccountStatus =
      statusTargetUser.status === 'suspended' ? 'operational' : 'suspended';
    adminStore.setUserStatus(statusTargetUser.uid, nextStatus);
    setStatusTargetUser(null);
  };

  const handleSaveResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    if (resetPassUser) {
      adminStore.resetUserPassword(resetPassUser.uid, newPassword);
      setResetPassUser(null);
    }
  };

  const handleAssignToolToUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !assignCookieSetId) return;

    adminStore.grantUserEntitlement(selectedUser.uid, {
      toolId: assignToolId,
      cookieSetId: assignCookieSetId,
      durationDays: assignDurationDays
    });

    setAssignToolOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <AdminPageHeader
        eyebrow="User Management"
        title="User Directory"
        description="Manage authentication states, security status, and account provisioning."
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                await adminStore.fetchAll();
                setLoading(false);
              }}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E4E3DD] hover:border-[#0B0B0C] bg-white text-xs font-semibold text-[#0B0B0C] transition-colors cursor-pointer disabled:opacity-60 shadow-2xs"
              title="Sync directory with Firebase"
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
              onClick={handleOpenAddUser}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B0B0C] hover:bg-[#232326] text-[#F3F2EE] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#B6FF2E]" />
              <span>Add New User</span>
            </button>
          </div>
        }
      />

      {/* Search & Filters */}
      <SearchToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search by email or UID..."
        totalCount={users.length}
        filteredCount={filteredUsers.length}
        filters={
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#0B0B0C] text-[#F3F2EE]'
                  : 'bg-[#FAF9F5] border border-[#E4E3DD] text-[#52525B] hover:text-[#0B0B0C]'
              }`}
            >
              All Users
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('operational')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'operational'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#FAF9F5] border border-[#E4E3DD] text-[#52525B] hover:text-[#0B0B0C]'
              }`}
            >
              Operational
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('restoration_requested')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'restoration_requested'
                  ? 'bg-amber-600 text-white'
                  : 'bg-[#FAF9F5] border border-[#E4E3DD] text-amber-700 hover:text-amber-800'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Restoration Requested</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('suspended')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'suspended'
                  ? 'bg-[#52525B] text-white'
                  : 'bg-[#FAF9F5] border border-[#E4E3DD] text-[#52525B] hover:text-[#0B0B0C]'
              }`}
            >
              Suspended
            </button>
          </div>
        }
      />

      {/* Responsive User Cards Grid */}
      {loading ? (
        <div className="py-20 flex items-center justify-center bg-transparent">
          <BrandSpinner size="lg" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="No users found"
          description={
            searchQuery
              ? `No user records match "${searchQuery}". Clear your search or filters.`
              : 'No user accounts exist in the directory. Click "Add New User" to provision one.'
          }
          action={
            searchQuery
              ? { label: 'Clear Search', onClick: () => { setSearchQuery(''); setStatusFilter('all'); } }
              : { label: 'Add New User', onClick: handleOpenAddUser }
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredUsers.map((u) => {
            const isRestoration = u.status === 'restoration_requested';
            const isSuspended = u.status === 'suspended';

            return (
              <div
                key={u.uid}
                className={`rounded-2xl border transition-all duration-200 bg-white shadow-xs flex flex-col justify-between overflow-hidden ${
                  isRestoration
                    ? 'border-amber-300 ring-2 ring-amber-500/10'
                    : isSuspended
                    ? 'border-[#E4E3DD] opacity-90'
                    : 'border-[#E4E3DD] hover:border-[#0B0B0C]'
                }`}
              >
                {/* Status Top Banner */}
                {isRestoration ? (
                  <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-900 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      <span>Restoration Requested</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700">
                      High Priority
                    </span>
                  </div>
                ) : isSuspended ? (
                  <div className="bg-[#FAF9F5] border-b border-[#E4E3DD] px-4 py-2 flex items-center justify-between text-xs text-[#52525B] font-medium">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-rose-500" />
                      <span>Account Suspended</span>
                    </div>
                    <span className="text-[10px] uppercase font-mono text-[#71717A]">
                      Locked
                    </span>
                  </div>
                ) : null}

                {/* Card Main Body */}
                <div className="p-5 space-y-4">
                  {/* User Identity */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F3F2EE] text-[#0B0B0C] border border-[#E4E3DD] font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                      {u.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-xs text-[#0B0B0C] truncate">
                        {u.email}
                      </h3>
                      <span className="font-mono text-[10px] text-[#71717A] block truncate">
                        {u.uid}
                      </span>
                    </div>
                    {!isRestoration && !isSuspended && (
                      <StatusBadge status={u.status} size="sm" />
                    )}
                  </div>

                  {/* Badges / Metrics Strip */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#E4E3DD]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] block">
                        Subscriptions
                      </span>
                      <span className="font-bold text-[#0B0B0C] font-mono text-sm">
                        {u.subscriptions.length} active
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#E4E3DD]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] block">
                        Devices
                      </span>
                      <span className="font-bold text-[#0B0B0C] font-mono text-sm">
                        {u.devices.length} registered
                      </span>
                    </div>
                  </div>

                  {/* Device Trust Strip */}
                  {u.devices.length > 0 && (
                    <div className="text-[11px] text-[#71717A] flex items-center gap-2">
                      <Laptop className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                      <span className="truncate">
                        Last seen: {u.devices[0].os} · {u.devices[0].location}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="p-3 bg-[#FAF9F5] border-t border-[#E4E3DD] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUser(u);
                      setDetailsTab('subscriptions');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E4E3DD] bg-white text-[#0B0B0C] hover:bg-[#FAF9F5] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    <span>System Details</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#71717A]" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Suspend / Reactivate */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(u)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        u.status === 'suspended'
                          ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          : 'border-rose-200 text-rose-600 hover:bg-rose-50'
                      }`}
                      title={u.status === 'suspended' ? 'Reactivate Account' : 'Suspend Account'}
                    >
                      {u.status === 'suspended' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    </button>

                    {/* Reset Password */}
                    <button
                      type="button"
                      onClick={() => {
                        setResetPassUser(u);
                        setNewPassword('');
                        setConfirmPassword('');
                        setResetError(null);
                      }}
                      className="p-1.5 rounded-lg border border-[#E4E3DD] text-[#52525B] hover:text-[#0B0B0C] hover:bg-white transition-colors cursor-pointer"
                      title="Reset Account Password"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New User Dialog ("Provision Account") */}
      <AdminDialog
        isOpen={addUserOpen}
        onClose={() => setAddUserOpen(false)}
        title="Provision Account"
        description="Provision new authentication or link existing Firebase Auth UID."
        maxWidth="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setAddUserOpen(false)}
              className="px-3.5 py-2 rounded-xl border border-[#E4E3DD] bg-[#FAF9F5] hover:bg-[#EBEAE5] text-[#0B0B0C] text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAddUser}
              className="px-4 py-2 rounded-xl bg-[#0B0B0C] hover:bg-[#232326] text-[#F3F2EE] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {provisionMode === 'link' ? 'Link User' : 'Create Account'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveAddUser} className="space-y-4">
          {addUserError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {addUserError}
            </div>
          )}

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#FAF9F5] border border-[#E4E3DD]">
            <button
              type="button"
              onClick={() => setProvisionMode('link')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                provisionMode === 'link'
                  ? 'bg-[#0B0B0C] text-[#F3F2EE] shadow-xs font-bold'
                  : 'text-[#52525B] hover:text-[#0B0B0C]'
              }`}
            >
              <span>Link Existing User</span>
              <span className="text-[10px] font-mono text-[#A1A1AA] font-normal">Spark UID</span>
            </button>

            <button
              type="button"
              onClick={() => setProvisionMode('create')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                provisionMode === 'create'
                  ? 'bg-[#0B0B0C] text-[#F3F2EE] shadow-xs font-bold'
                  : 'text-[#52525B] hover:text-[#0B0B0C]'
              }`}
            >
              <span>Create New User</span>
              <span className="text-[10px] font-mono text-[#A1A1AA] font-normal">Blaze Auth</span>
            </button>
          </div>

          <p className="text-[11px] text-[#71717A]">
            {provisionMode === 'link'
              ? 'Creates the Firestore record for a user that already exists in the Firebase Auth console.'
              : 'Provisions a brand new Firebase Authentication user with initial credentials.'}
          </p>

          <FormField
            label="User Email Address"
            type="email"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            placeholder="e.g. user@example.com"
            required
          />

          {provisionMode === 'link' ? (
            <FormField
              label="Firebase Auth UID"
              value={formUid}
              onChange={(e) => setFormUid(e.target.value)}
              placeholder="e.g. 8kX9mN2p4Qr7sTu..."
              helperText="Firebase Authentication UID string copied from the console."
              required
            />
          ) : (
            <FormField
              label="Initial Password"
              type="password"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              placeholder="••••••••••••"
              helperText="Temporary user password. User will be prompted to reset upon initial sign-in."
              required
            />
          )}
        </form>
      </AdminDialog>

      {/* Account Status Toggle Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(statusTargetUser)}
        onClose={() => setStatusTargetUser(null)}
        onConfirm={handleConfirmToggleStatus}
        title={statusTargetUser?.status === 'suspended' ? 'Reactivate Account' : 'Suspend Account'}
        description={
          statusTargetUser?.status === 'suspended'
            ? `Are you sure you want to reactivate ${statusTargetUser?.email}? The user will regain access to their active marketplace subscriptions immediately.`
            : `Are you sure you want to suspend ${statusTargetUser?.email}? The user will be blocked from launching tools and all active sessions will be terminated.`
        }
        confirmLabel={statusTargetUser?.status === 'suspended' ? 'Reactivate' : 'Suspend Account'}
        variant={statusTargetUser?.status === 'suspended' ? 'info' : 'danger'}
      />

      {/* Reset Password Modal */}
      <AdminDialog
        isOpen={Boolean(resetPassUser)}
        onClose={() => setResetPassUser(null)}
        title={`Reset Password: ${resetPassUser?.email}`}
        description="Update the user's authentication credentials in Firebase Auth."
        maxWidth="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setResetPassUser(null)}
              className="px-3.5 py-2 rounded-xl border border-[#E4E3DD] bg-[#FAF9F5] hover:bg-[#EBEAE5] text-[#0B0B0C] text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveResetPassword}
              className="px-4 py-2 rounded-xl bg-[#0B0B0C] hover:bg-[#232326] text-[#F3F2EE] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Update Password
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveResetPassword} className="space-y-3">
          {resetError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {resetError}
            </div>
          )}

          <div className="relative">
            <FormField
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 rounded text-[#71717A] hover:text-[#0B0B0C] absolute right-3 top-8 cursor-pointer"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <FormField
            label="Confirm New Password"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••••••"
            required
          />

          <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E4E3DD] text-[11px] text-[#71717A] space-y-1">
            <span className="font-semibold block text-[#0B0B0C]">
              Requirements:
            </span>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>At least 6 characters</li>
              <li>Encrypted directly through Firebase Identity Platform</li>
            </ul>
          </div>
        </form>
      </AdminDialog>

      {/* User System Details Right-Side Drawer */}
      <AdminDrawer
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        title="User System Details"
        subtitle={selectedUser ? `${selectedUser.email} (${selectedUser.uid})` : ''}
        width="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* Identity Strip */}
            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E4E3DD] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#0B0B0C] text-[#F3F2EE] font-bold text-lg flex items-center justify-center shadow-xs border border-[#0B0B0C]">
                  {selectedUser.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0B0B0C]">
                    {selectedUser.email}
                  </h3>
                  <div className="font-mono text-[11px] text-[#71717A]">
                    {selectedUser.uid}
                  </div>
                </div>
              </div>
              <StatusBadge status={selectedUser.status} size="sm" />
            </div>

            {/* Tabs */}
            <Tabs
              tabs={[
                { id: 'subscriptions', label: 'Subscriptions', badge: selectedUser.subscriptions.length },
                { id: 'launch_history', label: 'Launch History', badge: selectedUser.launchHistory.length },
                { id: 'devices', label: 'Devices', badge: selectedUser.devices.length },
                { id: 'billing', label: 'Billing' }
              ]}
              activeTab={detailsTab}
              onChange={(id) => setDetailsTab(id as any)}
            />

            {/* TAB 1: Subscriptions */}
            {detailsTab === 'subscriptions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
                    Active Entitlements
                  </h4>
                  <button
                    type="button"
                    onClick={() => setAssignToolOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B0B0C] hover:bg-[#232326] text-[#F3F2EE] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#B6FF2E]" />
                    <span>Assign New Tool</span>
                  </button>
                </div>

                {selectedUser.subscriptions.length === 0 ? (
                  <EmptyState
                    icon={<Shield className="w-5 h-5" />}
                    title="No active subscriptions"
                    description="This user has not been granted access to any marketplace tools yet."
                  />
                ) : (
                  <div className="space-y-2.5">
                    {selectedUser.subscriptions.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3.5 rounded-xl border border-[#E4E3DD] bg-white flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <ProductAvatar
                            productId={sub.toolId || sub.toolName}
                            size="sm"
                            className="text-[#0B0B0C]"
                            containerClassName="w-8 h-8 rounded-lg bg-[#FAF9F5] border border-[#E4E3DD] shadow-2xs"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-xs text-[#0B0B0C]">
                                {sub.toolName}
                              </h5>
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {sub.status.toUpperCase()}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#71717A] block mt-0.5">
                              Cookie Set: <strong className="text-[#0B0B0C]">{sub.cookieSetName || 'Direct Injection'}</strong>
                            </span>
                            <span className="text-[10px] text-[#71717A] font-mono">
                              Expires: {new Date(sub.expiresAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => adminStore.revokeUserSubscription(selectedUser.uid, sub.id)}
                          className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Revoke
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Launch History */}
            {detailsTab === 'launch_history' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
                  Recent Tool Launches (Max 10)
                </h4>
                {selectedUser.launchHistory.length === 0 ? (
                  <EmptyState
                    icon={<History className="w-5 h-5" />}
                    title="No launch history available"
                    description="User has not launched any tools via Xtrinox Bridge yet."
                  />
                ) : (
                  <div className="space-y-2">
                    {selectedUser.launchHistory.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-3 rounded-xl border border-[#E4E3DD] bg-white flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <ProductAvatar
                            productId={rec.toolId || rec.toolName}
                            size="sm"
                            className="text-[#0B0B0C]"
                            containerClassName="w-7 h-7 rounded-lg bg-[#FAF9F5] border border-[#E4E3DD] shadow-2xs"
                          />
                          <div>
                            <span className="font-bold text-[#0B0B0C] block">
                              {rec.toolName}
                            </span>
                            <span className="text-[10px] font-mono text-[#71717A]">
                              {new Date(rec.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF9F5] border border-[#E4E3DD] text-[#52525B] uppercase">
                          {rec.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Devices */}
            {detailsTab === 'devices' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
                  Registered Bridge Devices
                </h4>
                {selectedUser.devices.length === 0 ? (
                  <EmptyState
                    icon={<Laptop className="w-5 h-5" />}
                    title="No devices registered"
                    description="User has not connected any devices to Xtrinox Bridge."
                  />
                ) : (
                  <div className="space-y-3">
                    {[...selectedUser.devices]
                      .sort((a, b) => (a.status === 'restore_requested' ? -1 : 1))
                      .map((dev) => (
                        <div
                          key={dev.id}
                          className={`p-4 rounded-xl border transition-all ${
                            dev.status === 'restore_requested'
                              ? 'border-amber-300 bg-amber-50/50'
                              : 'border-[#E4E3DD] bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                              <Laptop className="w-4 h-4 text-[#71717A] mt-0.5 shrink-0" />
                              <div>
                                <span className="font-bold text-xs text-[#0B0B0C] block">
                                  {dev.browser}
                                </span>
                                <span className="text-[11px] text-[#52525B] block">
                                  {dev.os} · {dev.location} ({dev.ip})
                                </span>
                                <span className="text-[10px] text-[#71717A] font-mono block mt-0.5">
                                  ID: {dev.id}
                                </span>
                              </div>
                            </div>
                            <StatusBadge status={dev.status} size="sm" />
                          </div>

                          {/* Device Actions */}
                          <div className="mt-3 pt-2.5 border-t border-[#E4E3DD] flex items-center justify-end gap-2">
                            {dev.status === 'restore_requested' && (
                              <button
                                type="button"
                                onClick={() => adminStore.approveAndWhitelistDevice(selectedUser.uid, dev.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve & Whitelist</span>
                              </button>
                            )}

                            {(dev.status === 'blocked_by_user' || dev.status === 'blocked_by_admin') && (
                              <button
                                type="button"
                                onClick={() => adminStore.unblockDevice(selectedUser.uid, dev.id)}
                                className="px-3 py-1.5 rounded-lg bg-[#0B0B0C] hover:bg-[#232326] text-[#F3F2EE] text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Unlock className="w-3.5 h-3.5" />
                                <span>Unblock Device</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: Billing */}
            {detailsTab === 'billing' && (
              <div className="space-y-3">
                <div className="p-8 rounded-2xl border border-dashed border-[#E4E3DD] text-center space-y-2 bg-[#FAF9F5]">
                  <CreditCard className="w-8 h-8 text-[#71717A] mx-auto" />
                  <h4 className="text-sm font-bold text-[#0B0B0C]">
                    Billing History & Invoices
                  </h4>
                  <p className="text-xs text-[#52525B] max-w-xs mx-auto">
                    Direct automated subscription invoicing is coming soon. JazzCash / bank transfer receipts are currently recorded manually.
                  </p>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#E4E3DD] text-[#52525B] mt-2 font-mono">
                    Coming Soon
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </AdminDrawer>

      {/* Assign Tool Modal inside User Details */}
      <AdminDialog
        isOpen={assignToolOpen}
        onClose={() => setAssignToolOpen(false)}
        title={`Assign Tool Access to ${selectedUser?.email}`}
        description="Select a marketplace tool and active cookie set to grant entitlement."
        maxWidth="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setAssignToolOpen(false)}
              className="px-3.5 py-2 rounded-xl border border-[#E4E3DD] bg-[#FAF9F5] hover:bg-[#EBEAE5] text-[#0B0B0C] text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAssignToolToUser}
              disabled={!assignCookieSetId}
              className="px-4 py-2 rounded-xl bg-[#0B0B0C] hover:bg-[#232326] text-[#F3F2EE] text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Confirm Grant
            </button>
          </>
        }
      >
        <form onSubmit={handleAssignToolToUser} className="space-y-4">
          <SelectField
            label="Marketplace Tool"
            value={assignToolId}
            onChange={(e) => setAssignToolId(e.target.value)}
            options={tools.map((t) => ({ value: t.id, label: t.name }))}
          />

          <SelectField
            label="Product Cookie Set"
            value={assignCookieSetId}
            onChange={(e) => setAssignCookieSetId(e.target.value)}
            options={
              availableCookieSets.length > 0
                ? availableCookieSets.map((c) => ({ value: c.id, label: `${c.title} (${c.cookieCount} cookies)` }))
                : [{ value: '', label: 'No active cookie sets for this tool', disabled: true }]
            }
            helperText={
              availableCookieSets.length === 0
                ? 'Create or activate a cookie set in Product Cookies first.'
                : undefined
            }
          />

          <FormField
            label="Duration in Days"
            type="number"
            min={1}
            value={assignDurationDays}
            onChange={(e) => setAssignDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
            helperText="Default 30 days. Entitlement automatically expires after this duration."
          />
        </form>
      </AdminDialog>
    </div>
  );
};
