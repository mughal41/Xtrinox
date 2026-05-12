import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../state/useAuthStore';
import { signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

const Toggle: React.FC<{ enabled: boolean; onChange: () => void }> = ({ enabled, onChange }) => (
  <button
    onClick={onChange}
    className={`w-12 h-6 rounded-full relative cursor-pointer flex items-center transition-colors duration-200 ${
      enabled ? 'bg-primary' : 'bg-outline-variant'
    }`}
  >
    <div className={`w-5 h-5 bg-white rounded-full absolute transition-all duration-200 shadow-sm ${
      enabled ? 'right-0.5' : 'left-0.5'
    }`} />
  </button>
);

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Profile
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Notifications
  const [productUpdates, setProductUpdates] = useState(true);
  const [billingAlerts, setBillingAlerts] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || user.email?.split('@')[0] || '');
    }
  }, [user]);

  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (!currentPassword) {
      setPasswordError('Current password is required for re-authentication.');
      return;
    }

    setChangingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(user!.email!, currentPassword);
      await reauthenticateWithCredential(user!, credential);
      await updatePassword(user!, newPassword);
      setPasswordSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogoutAll = async () => {
    await signOut(auth);
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="space-y-xl max-w-4xl">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-h1 text-on-surface">Account Settings</h1>
          <p className="text-body-md text-on-surface-variant mt-sm">Manage your account, security, and notification preferences.</p>
        </div>
      </div>

      {/* Section: Profile */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-xl">
        <div className="md:col-span-1">
          <h3 className="font-h2 text-on-surface">Profile</h3>
          <p className="text-body-md text-on-surface-variant mt-sm">Update your personal identity and public-facing profile information.</p>
        </div>
        <div className="md:col-span-2 bg-white p-xl rounded-xl border border-surface-container-highest shadow-sm">
          <div className="space-y-lg">
            {/* Avatar */}
            <div className="flex items-center gap-xl">
              <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-2xl font-bold">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <button className="px-md py-sm border border-outline-variant rounded-lg text-label-md text-on-surface hover:bg-surface-container-low transition-colors">
                  Change Avatar
                </button>
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant font-bold">Display Name</label>
                <input
                  className="w-full p-md bg-surface-container-low border border-transparent focus:border-primary focus:bg-surface rounded-lg text-body-md transition-all outline-none"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant font-bold">Email Address</label>
                <input
                  className="w-full p-md bg-surface-container-low border border-transparent rounded-lg text-body-md text-on-surface-variant cursor-not-allowed"
                  type="email"
                  value={user.email || ''}
                  disabled
                />
              </div>
            </div>

            <div className="flex flex-col gap-xs">
              <label className="text-label-md text-on-surface-variant font-bold">Bio</label>
              <textarea
                className="w-full p-md bg-surface-container-low border border-transparent focus:border-primary focus:bg-surface rounded-lg text-body-md transition-all outline-none resize-none"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief description for your profile. Maximum 200 characters."
              />
              <p className="text-[11px] text-on-surface-variant">{bio.length}/200 characters</p>
            </div>
          </div>
        </div>
      </section>

      <hr className="border-outline-variant" />

      {/* Section: Security */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-xl">
        <div className="md:col-span-1">
          <h3 className="font-h2 text-on-surface">Security</h3>
          <p className="text-body-md text-on-surface-variant mt-sm">Update your password and manage session security.</p>
        </div>
        <div className="md:col-span-2 bg-white p-xl rounded-xl border border-surface-container-highest shadow-sm">
          <div className="space-y-md">
            <div className="flex flex-col gap-xs">
              <label className="text-label-md text-on-surface-variant font-bold">Current Password</label>
              <input
                className="w-full p-md bg-surface-container-low border border-transparent focus:border-primary focus:bg-surface rounded-lg text-body-md transition-all outline-none"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant font-bold">New Password</label>
                <input
                  className="w-full p-md bg-surface-container-low border border-transparent focus:border-primary focus:bg-surface rounded-lg text-body-md transition-all outline-none"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant font-bold">Confirm New Password</label>
                <input
                  className="w-full p-md bg-surface-container-low border border-transparent focus:border-primary focus:bg-surface rounded-lg text-body-md transition-all outline-none"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {passwordError && (
              <div className="p-3 rounded-lg bg-error-container text-on-error-container text-label-md flex gap-2 items-center">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-label-md flex gap-2 items-center border border-emerald-200">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                {passwordSuccess}
              </div>
            )}

            <button
              onClick={handlePasswordChange}
              disabled={changingPassword}
              className="bg-primary text-on-primary px-lg py-sm rounded-lg text-label-md font-bold shadow-sm active:scale-95 transition-all disabled:opacity-50"
            >
              {changingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>

          {/* Logout All */}
          <div className="mt-xl pt-lg border-t border-surface-container-highest">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-h3 text-on-surface">Sign Out Everywhere</p>
                <p className="text-body-md text-on-surface-variant">This will log you out of all active sessions and devices.</p>
              </div>
              <button
                onClick={handleLogoutAll}
                className="px-lg py-sm border border-error text-error rounded-lg text-label-md font-bold hover:bg-error-container transition-colors"
              >
                Logout All
              </button>
            </div>
          </div>
        </div>
      </section>

      <hr className="border-outline-variant" />

      {/* Section: Notifications */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-xl">
        <div className="md:col-span-1">
          <h3 className="font-h2 text-on-surface">Notifications</h3>
          <p className="text-body-md text-on-surface-variant mt-sm">Control how and when you receive communications from the platform.</p>
        </div>
        <div className="md:col-span-2 bg-white p-xl rounded-xl border border-surface-container-highest shadow-sm space-y-0">
          <div className="flex items-center justify-between py-md">
            <div>
              <p className="font-h3 text-on-surface">Product Updates</p>
              <p className="text-body-md text-on-surface-variant">Get notified about new features and ecosystem releases.</p>
            </div>
            <Toggle enabled={productUpdates} onChange={() => setProductUpdates(!productUpdates)} />
          </div>
          <div className="flex items-center justify-between py-md border-t border-surface-container-highest">
            <div>
              <p className="font-h3 text-on-surface">Billing Alerts</p>
              <p className="text-body-md text-on-surface-variant">Monthly invoices and payment confirmation summaries.</p>
            </div>
            <Toggle enabled={billingAlerts} onChange={() => setBillingAlerts(!billingAlerts)} />
          </div>
          <div className="flex items-center justify-between py-md border-t border-surface-container-highest">
            <div>
              <p className="font-h3 text-on-surface">Marketing Communications</p>
              <p className="text-body-md text-on-surface-variant">Occasional newsletters and partner marketplace offers.</p>
            </div>
            <Toggle enabled={marketing} onChange={() => setMarketing(!marketing)} />
          </div>
        </div>
      </section>

      <hr className="border-outline-variant" />

      {/* Section: Billing (Preview) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-xl">
        <div className="md:col-span-1">
          <h3 className="font-h2 text-on-surface">Billing Preferences</h3>
          <p className="text-body-md text-on-surface-variant mt-sm">Manage your payment methods, subscription tiers, and tax information.</p>
        </div>
        <div className="md:col-span-2 space-y-md">
          {/* Plan Card */}
          <div className="bg-primary text-on-primary p-xl rounded-xl shadow-sm flex justify-between items-center">
            <div>
              <p className="text-label-md opacity-80 mb-xs">Current Plan</p>
              <p className="font-h1">Premium</p>
              <p className="text-body-md mt-sm">Managed by organization administrator</p>
            </div>
            <button className="px-md py-sm bg-white text-primary rounded-lg text-label-md font-bold">
              Upgrade Plan
            </button>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-xl rounded-xl border border-surface-container-highest shadow-sm">
            <div className="flex items-center justify-between mb-lg">
              <p className="font-h3 text-on-surface">Payment Method</p>
              <button className="text-primary text-label-md font-bold">Add New</button>
            </div>
            <div className="flex items-center gap-md p-md border border-outline-variant rounded-lg">
              <div className="w-12 h-8 bg-surface-container-high rounded flex items-center justify-center font-bold text-[10px] text-on-surface-variant uppercase">
                Visa
              </div>
              <div className="flex-grow">
                <p className="text-label-md text-on-surface font-bold">Visa ending in ••4242</p>
                <p className="text-[11px] text-on-surface-variant">Expires 12/2026</p>
              </div>
              <span className="material-symbols-outlined text-primary">check_circle</span>
            </div>
          </div>
        </div>
      </section>

      {/* Save / Cancel */}
      <div className="pt-xl flex justify-end gap-md pb-xl">
        <button className="px-xl py-md border border-outline-variant rounded-lg text-label-md text-on-surface hover:bg-surface-container-low transition-colors">
          Cancel Changes
        </button>
        <button className="px-xl py-md bg-primary text-on-primary rounded-lg text-label-md font-bold shadow-sm active:scale-95 transition-transform">
          Update Settings
        </button>
      </div>
    </div>
  );
};
