import React, { useState, useEffect } from 'react';
import { RouteName, UserProfile } from '../types';
import { useAuthStore } from '../state/useAuthStore';
import { useSubscriptionStore } from '../state/useSubscriptionStore';
import { firestoreService } from '../services/firestore.service';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import {
  Shield,
  Bell,
  CreditCard,
  ChevronDown,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  X,
  Loader2,
  Edit2
} from 'lucide-react';

interface SettingsPageProps {
  onNavigate: (route: RouteName, param?: string) => void;
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  onSignOut: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onNavigate,
  user,
  onSignOut
}) => {
  const { user: authUser } = useAuthStore();
  const { fetchSubscriptions } = useSubscriptionStore();

  // Drawer state & Profile edit
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editBio, setEditBio] = useState(user.bio);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);

  useEffect(() => {
    setEditName(user.name);
    setEditBio(user.bio);
  }, [user]);

  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [currentError, setCurrentError] = useState('');
  const [newError, setNewError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [formStatus, setFormStatus] = useState<{ text: string; type: 'success' | 'error' | '' }>({
    text: '',
    type: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Sign out modal
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;
    setProfileSaving(true);
    setProfileStatus(null);
    try {
      await firestoreService.updateUserProfile(authUser.uid, {
        displayName: editName.trim(),
        bio: editBio.trim()
      });
      await fetchSubscriptions(authUser.uid);
      setProfileStatus('Profile updated successfully.');
      setIsEditingProfile(false);
    } catch (err: any) {
      setProfileStatus(err.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentError('');
    setNewError('');
    setConfirmError('');
    setFormStatus({ text: '', type: '' });

    let invalid = false;

    if (!currentPassword) {
      setCurrentError('Enter your current password.');
      invalid = true;
    }

    if (newPassword.length < 8) {
      setNewError('Use at least 8 characters.');
      invalid = true;
    } else if (newPassword === currentPassword && currentPassword) {
      setNewError('Choose a password different from the current one.');
      invalid = true;
    }

    if (newPassword !== confirmPassword) {
      setConfirmError('Passwords do not match.');
      invalid = true;
    }

    if (invalid) {
      setFormStatus({ text: 'Review the highlighted fields.', type: 'error' });
      return;
    }

    if (!authUser || !authUser.email) {
      setFormStatus({ text: 'No authenticated user session found.', type: 'error' });
      return;
    }

    setIsUpdating(true);
    setFormStatus({ text: 'Verifying your current password…', type: '' });

    try {
      const cred = EmailAuthProvider.credential(authUser.email, currentPassword);
      await reauthenticateWithCredential(authUser, cred);
      await updatePassword(authUser, newPassword);

      setIsUpdating(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFormStatus({ text: 'Your password was successfully updated.', type: 'success' });
    } catch (err: any) {
      setIsUpdating(false);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setCurrentError('Current password is incorrect.');
        setFormStatus({ text: 'Current password verification failed.', type: 'error' });
      } else if (err.code === 'auth/requires-recent-login') {
        setFormStatus({ text: 'Please sign in again before changing password.', type: 'error' });
      } else {
        setFormStatus({ text: err.message || 'Failed to update password.', type: 'error' });
      }
    }
  };

  const initial = user.name ? user.name.charAt(0).toUpperCase() : 'A';

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] py-12 px-6 transition-colors">
      <div className="max-w-[1060px] mx-auto">
        {/* Page Head */}
        <div className="mb-7">
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[var(--text)] tracking-tight">
            Account settings
          </h1>
          <p className="text-sm text-[var(--sub)] mt-1.5">
            Review your account and manage how you sign in.
          </p>
        </div>

        {/* 1. Full-Width Profile Identity Strip */}
        <section
          aria-labelledby="account-label"
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden mb-6 shadow-sm"
        >
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[var(--brand)] border border-[var(--border)] text-[var(--brand-text)] font-heading font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-sm">
                {initial}
              </div>
              <div className="min-w-0">
                <span
                  id="account-label"
                  className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--brand)] block mb-1"
                >
                  YOUR ACCOUNT
                </span>
                <h2 className="font-heading font-bold text-lg text-[var(--text)] truncate">{user.name}</h2>
                <p className="text-xs text-[var(--sub)] truncate mt-0.5">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <button
                type="button"
                onClick={() => {
                  setProfileDrawerOpen(true);
                  setIsEditingProfile(!isEditingProfile);
                }}
                className="h-9 px-3 rounded-lg border border-[var(--border)] hover:border-[var(--brand)] hover:bg-[var(--surface-raised)] text-xs font-semibold text-[var(--text)] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-[var(--brand)]" />
                <span>{isEditingProfile ? 'Cancel' : 'Edit profile'}</span>
              </button>
              <button
                type="button"
                onClick={() => setProfileDrawerOpen(!profileDrawerOpen)}
                className="h-9 px-3.5 rounded-lg border border-[var(--border)] hover:border-[var(--brand)] hover:bg-[var(--surface-raised)] text-xs font-semibold text-[var(--text)] flex items-center gap-1.5 transition-colors"
                aria-expanded={profileDrawerOpen}
              >
                <span>{profileDrawerOpen ? 'Hide details' : 'View details'}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${profileDrawerOpen ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* Expandable Profile Drawer */}
          {profileDrawerOpen && (
            <div className="border-t border-[var(--border)] px-6 py-5 bg-[var(--surface-raised)] animate-in fade-in-50">
              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text)] mb-1.5">
                        Display name
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Your display name"
                        className="w-full h-10 px-3 rounded-xl border border-[var(--border)] bg-[var(--input)] text-xs text-[var(--text)] outline-none focus:border-[var(--brand)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text)] mb-1.5">
                        Bio / Headline
                      </label>
                      <input
                        type="text"
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        placeholder="Engineer, Researcher, Designer..."
                        className="w-full h-10 px-3 rounded-xl border border-[var(--border)] bg-[var(--input)] text-xs text-[var(--text)] outline-none focus:border-[var(--brand)]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="h-9 px-4 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-[var(--brand-text)] text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-70"
                    >
                      {profileSaving ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save profile</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="h-9 px-3.5 rounded-xl border border-[var(--border)] text-xs font-semibold hover:bg-[var(--surface)] text-[var(--text)] cursor-pointer"
                    >
                      Cancel
                    </button>
                    {profileStatus && (
                      <span className="text-xs text-[var(--success)] font-semibold">
                        {profileStatus}
                      </span>
                    )}
                  </div>
                </form>
              ) : (
                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <dt className="text-[11px] text-[var(--muted)] font-medium mb-1">Display name</dt>
                    <dd className="text-xs text-[var(--text)] font-semibold">{user.name}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-[var(--muted)] font-medium mb-1">Email address</dt>
                    <dd className="text-xs text-[var(--text)] font-semibold">{user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-[var(--muted)] font-medium mb-1">Bio</dt>
                    <dd className="text-xs text-[var(--sub)] italic">{user.bio || 'Not added'}</dd>
                  </div>
                </dl>
              )}
            </div>
          )}
        </section>

        {/* 2. Password Security Panel */}
        <section
          aria-labelledby="security-title"
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden mb-8 shadow-sm"
        >
          {/* Section Head */}
          <div className="p-6 sm:p-7 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--surface-raised)] text-[var(--brand)] flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="security-title"
                className="font-heading font-extrabold text-xl text-[var(--text)] tracking-tight"
              >
                Change password
              </h2>
              <p className="text-xs text-[var(--sub)] mt-0.5">
                Update the password you use to sign in to Xtrinox.
              </p>
            </div>
          </div>

          {/* Password Form */}
          <form onSubmit={handlePasswordSubmit} noValidate>
            <div className="px-6 sm:px-7 pb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Current Password */}
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-xs font-semibold text-[var(--text)] mb-2"
                >
                  Current password
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    type={showCurrent ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      if (currentError) setCurrentError('');
                    }}
                    className={`w-full h-11 px-3.5 pr-12 rounded-xl border bg-[var(--input)] text-xs text-[var(--text)] placeholder-[var(--muted)] outline-none transition-all ${
                      currentError
                        ? 'border-[var(--danger)] ring-1 ring-[var(--danger)]'
                        : 'border-[var(--border)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-2 top-2 px-2 py-1 rounded text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)]"
                  >
                    {showCurrent ? 'Hide' : 'Show'}
                  </button>
                </div>
                {currentError && (
                  <p className="text-[11px] text-[var(--danger)] mt-1.5">{currentError}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-xs font-semibold text-[var(--text)] mb-2"
                >
                  New password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNew ? 'text' : 'password'}
                    placeholder="Create new password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (newError) setNewError('');
                    }}
                    className={`w-full h-11 px-3.5 pr-12 rounded-xl border bg-[var(--input)] text-xs text-[var(--text)] placeholder-[var(--muted)] outline-none transition-all ${
                      newError
                        ? 'border-[var(--danger)] ring-1 ring-[var(--danger)]'
                        : 'border-[var(--border)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-2 top-2 px-2 py-1 rounded text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)]"
                  >
                    {showNew ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p className="text-[11px] text-[var(--muted)] mt-1">At least 8 characters</p>
                {newError && <p className="text-[11px] text-[var(--danger)] mt-1">{newError}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-semibold text-[var(--text)] mb-2"
                >
                  Confirm new password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (confirmError) setConfirmError('');
                    }}
                    className={`w-full h-11 px-3.5 pr-12 rounded-xl border bg-[var(--input)] text-xs text-[var(--text)] placeholder-[var(--muted)] outline-none transition-all ${
                      confirmError
                        ? 'border-[var(--danger)] ring-1 ring-[var(--danger)]'
                        : 'border-[var(--border)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-2 top-2 px-2 py-1 rounded text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)]"
                  >
                    {showConfirm ? 'Hide' : 'Show'}
                  </button>
                </div>
                {confirmError && (
                  <p className="text-[11px] text-[var(--danger)] mt-1.5">{confirmError}</p>
                )}
              </div>
            </div>

            {/* Form Action & Status */}
            <div className="px-6 sm:px-7 pb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                type="submit"
                disabled={isUpdating}
                className="h-11 px-5 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-[var(--brand-text)] text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] disabled:opacity-75 cursor-pointer"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating…</span>
                  </>
                ) : (
                  <span>Update password</span>
                )}
              </button>

              {formStatus.text && (
                <div
                  className={`text-xs ${
                    formStatus.type === 'success'
                      ? 'text-[var(--success)] font-semibold'
                      : formStatus.type === 'error'
                      ? 'text-[var(--danger)] font-semibold'
                      : 'text-[var(--sub)]'
                  }`}
                  role="status"
                >
                  {formStatus.text}
                </div>
              )}
            </div>
          </form>

          {/* Section Footer: Sign Out of Current Browser */}
          <div className="p-5 sm:px-7 border-t border-[var(--border)] bg-[var(--surface-raised)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-heading font-bold text-xs sm:text-sm text-[var(--text)]">
                Sign out of this browser
              </h3>
              <p className="text-xs text-[var(--sub)] mt-0.5">
                Other signed-in devices will remain connected.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSignOutModalOpen(true)}
              className="h-9 px-4 rounded-lg border border-[var(--border)] hover:border-[var(--brand)] hover:bg-[var(--surface)] text-xs font-semibold text-[var(--text)] transition-colors"
            >
              Sign out
            </button>
          </div>
        </section>

        {/* 3. Secondary Preferences (Honest read-only view) */}
        <section aria-label="Additional preferences" className="space-y-3">
          <h2 className="font-heading font-bold text-base text-[var(--text)]">Other preferences</h2>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)] overflow-hidden shadow-xs">
            {/* Notifications Disclosure */}
            <details className="group">
              <summary className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-[var(--surface-raised)] transition-colors list-none">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[var(--surface-raised)] text-[var(--brand)] flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-xs sm:text-sm font-semibold text-[var(--text)]">
                      Notifications
                    </strong>
                    <small className="block text-[11px] text-[var(--sub)] mt-0.5">
                      Updates, billing alerts and marketing emails
                    </small>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-semibold text-[var(--muted)] border border-[var(--border)] bg-[var(--surface-raised)] px-2 py-0.5 rounded-md">
                    Not editable yet
                  </span>
                  <ChevronDown className="w-4 h-4 text-[var(--muted)] group-open:rotate-180 transition-transform" />
                </div>
              </summary>

              <div className="px-5 pb-5 pt-2 text-xs text-[var(--sub)] leading-relaxed border-t border-[var(--border)] bg-[var(--surface-raised)]">
                <p className="mb-2">
                  Notification preference controls are planned but are not connected yet. This preview does not change what emails you receive.
                </p>
                <ul className="space-y-1 list-disc list-inside text-[var(--muted)]">
                  <li>Product updates — not configurable</li>
                  <li>Billing alerts — not configurable</li>
                  <li>Marketing communications — not configurable</li>
                </ul>
              </div>
            </details>

            {/* Plan and Billing Disclosure */}
            <details className="group">
              <summary className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-[var(--surface-raised)] transition-colors list-none">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[var(--surface-raised)] text-[var(--brand)] flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-xs sm:text-sm font-semibold text-[var(--text)]">
                      Plan and billing
                    </strong>
                    <small className="block text-[11px] text-[var(--sub)] mt-0.5">
                      Subscriptions and manual payment information
                    </small>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-semibold text-[var(--muted)] border border-[var(--border)] bg-[var(--surface-raised)] px-2 py-0.5 rounded-md">
                    View only
                  </span>
                  <ChevronDown className="w-4 h-4 text-[var(--muted)] group-open:rotate-180 transition-transform" />
                </div>
              </summary>

              <div className="px-5 pb-5 pt-2 text-xs text-[var(--sub)] leading-relaxed border-t border-[var(--border)] bg-[var(--surface-raised)]">
                <p>
                  Xtrinox currently uses manual payment and verification for supported subscriptions. Review available plans in the Marketplace; stored card management and automatic upgrades are not implemented here.
                </p>
              </div>
            </details>
          </div>
        </section>
      </div>

      {/* Sign Out Modal */}
      {signOutModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] p-6 shadow-2xl relative text-[var(--text)] animate-in zoom-in-95">
            <h2 className="font-heading font-extrabold text-xl text-[var(--text)]">
              Sign out of this browser?
            </h2>
            <p className="text-xs text-[var(--sub)] mt-2 mb-6 leading-relaxed">
              You will be signed out on this device. Your active sessions on other devices will remain connected.
            </p>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSignOutModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-raised)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setSignOutModalOpen(false);
                  onSignOut();
                  onNavigate('login');
                }}
                className="px-4 py-2 rounded-xl bg-[var(--danger)] hover:opacity-90 text-xs font-bold text-white shadow-md transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
