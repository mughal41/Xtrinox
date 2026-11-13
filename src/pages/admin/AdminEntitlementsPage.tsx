import React, { useState, useEffect, useMemo } from 'react';
import { AdminUser } from '../../types/admin';
import { adminStore } from '../../services/adminStore';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { SelectField } from '../../components/admin/SelectField';
import { FormField } from '../../components/admin/FormField';
import { SensitiveDataNotice } from '../../components/admin/SensitiveDataNotice';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { ProductAvatar } from '../../components/ProductIcon';

interface AdminEntitlementsPageProps {
  onNavigateToCookies?: () => void;
}

export const AdminEntitlementsPage: React.FC<AdminEntitlementsPageProps> = ({
  onNavigateToCookies
}) => {
  const [tools, setTools] = useState(adminStore.tools);
  const [cookieSets, setCookieSets] = useState(adminStore.cookieSets);

  // Form State
  const [selectedToolId, setSelectedToolId] = useState(tools[0]?.id || 'chatgpt');
  const [selectedCookieSetId, setSelectedCookieSetId] = useState('');
  const [rawUidsInput, setRawUidsInput] = useState('');
  const [durationDays, setDurationDays] = useState(30);

  const [isProcessing, setIsProcessing] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    toolName: string;
    cookieSetName: string;
    count: number;
  } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    return adminStore.subscribe(() => {
      setTools([...adminStore.tools]);
      setCookieSets([...adminStore.cookieSets]);
    });
  }, []);

  // Filter active cookie sets for selected tool
  const availableCookieSets = useMemo(() => {
    return cookieSets.filter((c) => c.toolId === selectedToolId && c.isActive);
  }, [cookieSets, selectedToolId]);

  useEffect(() => {
    if (availableCookieSets.length > 0) {
      if (!availableCookieSets.some((c) => c.id === selectedCookieSetId)) {
        setSelectedCookieSetId(availableCookieSets[0].id);
      }
    } else {
      setSelectedCookieSetId('');
    }
  }, [availableCookieSets, selectedCookieSetId]);

  // Parse and deduplicate UIDs from comma or newline separated text
  const parsedUids = useMemo(() => {
    if (!rawUidsInput.trim()) return [];
    const tokens = rawUidsInput
      .split(/[\n,]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    return Array.from(new Set(tokens));
  }, [rawUidsInput]);

  const selectedTool = tools.find((t) => t.id === selectedToolId);
  const selectedCookieSet = cookieSets.find((c) => c.id === selectedCookieSetId);

  // Calculated expiration date
  const calculatedExpiration = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + (durationDays || 0));
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, [durationDays]);

  const handleAssignAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessInfo(null);

    if (!selectedToolId) {
      setFormError('Please select a marketplace tool.');
      return;
    }
    if (!selectedCookieSetId) {
      setFormError('An active cookie set must be selected to provision access.');
      return;
    }
    if (parsedUids.length === 0) {
      setFormError('Please enter at least one user UID or email address.');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate cryptographic token issuance & bulk assignment
      await new Promise((r) => setTimeout(r, 650));

      let assignedCount = 0;
      parsedUids.forEach((uidOrEmail) => {
        // Find existing user or create linked record
        let user: AdminUser | undefined = adminStore.users.find(
          (u) => u.uid === uidOrEmail || u.email.toLowerCase() === uidOrEmail.toLowerCase()
        );

        if (!user) {
          // Auto-link record for provided UID
          const isEmail = uidOrEmail.includes('@');
          const newUser: AdminUser = {
            uid: isEmail ? `usr_${Math.random().toString(36).substring(2, 9)}` : uidOrEmail,
            email: isEmail ? uidOrEmail : `${uidOrEmail}@xtrinox.user`,
            status: 'operational',
            role: 'user',
            createdAt: new Date().toISOString(),
            subscriptions: [],
            devices: [],
            launchHistory: []
          };
          adminStore.addUser(newUser);
          user = newUser;
        }

        adminStore.grantUserEntitlement(user.uid, {
          toolId: selectedToolId,
          cookieSetId: selectedCookieSetId,
          durationDays
        });
        assignedCount += 1;
      });

      setSuccessInfo({
        toolName: selectedTool?.name || selectedToolId,
        cookieSetName: selectedCookieSet?.title || selectedCookieSetId,
        count: assignedCount
      });

      setRawUidsInput('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to assign tool access.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChipClick = (days: number) => {
    setDurationDays(days);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <AdminPageHeader
        eyebrow="Marketplace Management"
        title="Entitlements"
        description="Provision and distribute marketplace tool access directly to users."
      />

      {/* Sensitive Data Notice */}
      <SensitiveDataNotice
        variant="subtle"
        message="Assigning entitlements distributes encrypted AES-256 session parameters. Access can be revoked anytime in User Management."
      />

      {/* Two Column Layout (Form + Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 p-5 md:p-6 rounded-2xl border border-[#E4E3DD] bg-white shadow-xs space-y-5">
          <div className="border-b border-[#E4E3DD] pb-3">
            <h2 className="font-bold text-sm text-[#0B0B0C]">
              Grant Tool Access
            </h2>
            <p className="text-[11px] text-[#71717A] mt-0.5">
              Select tool, session cookie set, recipient UIDs, and access duration.
            </p>
          </div>

          <form onSubmit={handleAssignAccess} className="space-y-4">
            {/* Error Banner */}
            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Success Banner */}
            {successInfo && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <span className="font-semibold block text-emerald-900">
                    Tool Access Granted Successfully
                  </span>
                  <p className="text-[11px] text-emerald-700 mt-0.5 leading-snug">
                    Provisioned <strong>{successInfo.toolName}</strong> to {successInfo.count} user{successInfo.count === 1 ? '' : 's'} using cookie set <em>{successInfo.cookieSetName}</em>.
                  </p>
                </div>
              </div>
            )}

            {/* Tool Selector */}
            <SelectField
              label="Select Marketplace Tool"
              value={selectedToolId}
              onChange={(e) => setSelectedToolId(e.target.value)}
              options={tools.map((t) => ({
                value: t.id,
                label: `${t.name} (${t.categoryLabel || t.category})`
              }))}
              helperText="Tool that will be made accessible in the user workspace."
              required
            />

            {/* Cookie Set Selector */}
            <div className="space-y-1.5">
              <SelectField
                label="Assigned Session Cookie Set"
                value={selectedCookieSetId}
                onChange={(e) => setSelectedCookieSetId(e.target.value)}
                disabled={availableCookieSets.length === 0}
                options={
                  availableCookieSets.length > 0
                    ? availableCookieSets.map((c) => ({
                        value: c.id,
                        label: `${c.title} — (${c.cookieCount} session cookies, ${c.assignedUsersCount} active users)`
                      }))
                    : [{ value: '', label: 'No active cookie sets available for this tool', disabled: true }]
                }
                helperText="Active cookie sets associated with this tool."
                required
              />

              {availableCookieSets.length === 0 && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>No active cookie sets found for this tool.</span>
                  {onNavigateToCookies && (
                    <button
                      type="button"
                      onClick={onNavigateToCookies}
                      className="ml-auto underline font-bold cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Create Cookie Set</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Multiline UID Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#0B0B0C]">
                  User UIDs or Emails
                </label>
                {parsedUids.length > 0 && (
                  <span className="text-[11px] font-semibold text-[#0B0B0C] bg-[#F3F2EE] border border-[#E4E3DD] px-2 py-0.5 rounded font-mono">
                    {parsedUids.length} unique user{parsedUids.length === 1 ? '' : 's'} detected
                  </span>
                )}
              </div>
              <textarea
                rows={5}
                value={rawUidsInput}
                onChange={(e) => setRawUidsInput(e.target.value)}
                placeholder="Paste one UID, or comma / newline separated UIDs:&#10;usr_xtr_hamza_981&#10;sarah.chen@ai-institute.org&#10;usr_alex_morris_551"
                className="w-full rounded-xl border border-[#E4E3DD] bg-[#0B0B0C] text-[#B6FF2E] font-mono text-[11px] p-3 focus:outline-none focus:ring-2 focus:ring-[#0B0B0C]/10 resize-y leading-relaxed"
              />
              <p className="text-[11px] text-[#71717A]">
                Accepts comma-separated or newline-separated entries. Duplicate entries are automatically pruned.
              </p>
            </div>

            {/* Duration in Days & Shortcut Chips */}
            <div className="space-y-2">
              <FormField
                label="Access Duration (Days)"
                type="number"
                min={1}
                value={durationDays}
                onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                helperText="Active subscription valid window from time of assignment."
                required
              />

              {/* Shortcut Chips */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-[11px] text-[#71717A] font-medium mr-1">
                  Duration presets:
                </span>
                {[7, 30, 90, 365].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleChipClick(d)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      durationDays === d
                        ? 'bg-[#0B0B0C] text-[#F3F2EE] shadow-2xs font-bold'
                        : 'bg-[#FAF9F5] border border-[#E4E3DD] text-[#52525B] hover:text-[#0B0B0C]'
                    }`}
                  >
                    {d} days
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3 border-t border-[#E4E3DD]">
              <button
                type="submit"
                disabled={isProcessing || availableCookieSets.length === 0}
                className="w-full py-2.5 rounded-xl bg-[#0B0B0C] hover:bg-[#232326] text-[#F3F2EE] text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#B6FF2E]" />
                    <span>Encrypting & Assigning Entitlements...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#B6FF2E]" />
                    <span>Assign Tool Access</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Assignment Summary Sidebar */}
        <div className="lg:col-span-5 sticky top-20 space-y-4">
          <div className="p-5 rounded-2xl border border-[#E4E3DD] bg-white shadow-xs space-y-4">
            <div className="border-b border-[#E4E3DD] pb-3">
              <h3 className="font-bold text-xs text-[#0B0B0C]">
                Assignment Summary
              </h3>
              <p className="text-[11px] text-[#71717A]">
                Review payload distribution before assignment.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {/* Selected Tool */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#71717A]">Target Tool:</span>
                <span className="font-bold text-[#0B0B0C] text-right inline-flex items-center gap-1.5">
                  {selectedTool && (
                    <ProductAvatar
                      productId={selectedTool.id || selectedTool.name}
                      size="xs"
                      containerClassName="w-5 h-5 rounded p-0.5 bg-white border border-[#E4E3DD]"
                    />
                  )}
                  <span>{selectedTool?.name || 'None selected'}</span>
                </span>
              </div>

              {/* Selected Cookie Set */}
              <div className="flex items-start justify-between gap-2">
                <span className="text-[#71717A]">Cookie Set:</span>
                <span className="font-semibold text-[#0B0B0C] text-right truncate max-w-[180px]">
                  {selectedCookieSet?.title || 'None available'}
                </span>
              </div>

              {/* Users on this Cookie Set */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#71717A]">Current Assigned Users:</span>
                <span className="font-mono text-[#0B0B0C]">
                  {selectedCookieSet?.assignedUsersCount || 0} users
                </span>
              </div>

              {/* New Users to Assign */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#71717A]">New User Recipients:</span>
                <span className="font-mono font-bold text-[#0B0B0C]">
                  +{parsedUids.length}
                </span>
              </div>

              {/* Duration */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#71717A]">Duration:</span>
                <span className="font-semibold text-[#0B0B0C]">
                  {durationDays} days
                </span>
              </div>

              {/* Calculated Expiration Date */}
              <div className="pt-2 border-t border-[#E4E3DD] flex items-center justify-between gap-2">
                <span className="text-[#71717A]">Calculated Expiry:</span>
                <span className="font-mono text-[11px] font-bold text-[#0B0B0C]">
                  {calculatedExpiration}
                </span>
              </div>
            </div>

            {/* Security Guarantee */}
            <div className="mt-4 p-3 rounded-xl bg-[#FAF9F5] border border-[#E4E3DD] text-[11px] text-[#71717A] space-y-1">
              <span className="font-semibold text-[#0B0B0C] block">
                Session Isolation
              </span>
              <p className="leading-snug">
                Each user receives access via isolated browser extension bridge without displaying direct cookie credentials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
