import React, { useState, useEffect } from 'react';
import { adminStore } from '../../services/adminStore';
import { SystemSettings } from '../../types/admin';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Toggle } from '../../components/admin/Toggle';
import { FormField } from '../../components/admin/FormField';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import {
  Sliders,
  Shield,
  Database,
  Check,
  Loader2
} from 'lucide-react';

export const AdminSystemPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>(
    adminStore.settings || adminStore.systemSettings
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Confirmation for enabling destructive maintenance mode
  const [maintenanceConfirmOpen, setMaintenanceConfirmOpen] = useState(false);

  // Form field state
  const [bridgeVersionInput, setBridgeVersionInput] = useState(
    settings?.requiredBridgeVersion || '2.4.1'
  );

  useEffect(() => {
    return adminStore.subscribe(() => {
      const s = adminStore.settings || adminStore.systemSettings;
      if (s) {
        setSettings({ ...s });
        setBridgeVersionInput(s.requiredBridgeVersion || '2.4.1');
      }
    });
  }, []);

  const triggerSave = async (updates: Partial<SystemSettings>) => {
    setIsSaving(true);
    setSaveStatus('saving');
    try {
      await adminStore.updateSettings(updates);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch {
      setSaveStatus('idle');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleMaintenance = (checked: boolean) => {
    if (checked) {
      setMaintenanceConfirmOpen(true);
    } else {
      triggerSave({ maintenanceMode: false });
    }
  };

  const handleConfirmMaintenance = () => {
    triggerSave({ maintenanceMode: true });
    setMaintenanceConfirmOpen(false);
  };

  const handleToggleRegistration = (checked: boolean) => {
    triggerSave({ userRegistration: checked });
  };

  const handleToggleMarketplace = (checked: boolean) => {
    triggerSave({ marketplaceVisibility: checked });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <AdminPageHeader
        eyebrow="Configuration"
        title="System Controls"
        description="Global feature flags, security parameters, and maintenance toggles."
      />

      {/* Auto-save notification pill */}
      <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E4E3DD] bg-white text-xs shadow-xs">
        <span className="text-[#52525B] font-medium">
          Global Settings Persistence: <strong className="text-[#0B0B0C]">Changes save automatically to Firestore</strong>
        </span>

        <div className="flex items-center gap-2">
          {saveStatus === 'saving' && (
            <span className="inline-flex items-center gap-1.5 text-[#0B0B0C] font-semibold font-mono text-[11px]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B6FF2E]" />
              <span>Saving...</span>
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold font-mono text-[11px]">
              <Check className="w-3.5 h-3.5" />
              <span>Saved to Firestore</span>
            </span>
          )}
          {saveStatus === 'idle' && (
            <span className="text-[11px] text-[#71717A] font-mono">
              Synced ({new Date(settings.lastUpdated).toLocaleTimeString()})
            </span>
          )}
        </div>
      </div>

      {/* Card 1: Feature Flags */}
      <div className="p-5 md:p-6 rounded-2xl border border-[#E4E3DD] bg-white shadow-xs space-y-4">
        <div className="border-b border-[#E4E3DD] pb-3 flex items-center gap-2.5">
          <Sliders className="w-4 h-4 text-[#0B0B0C]" />
          <div>
            <h3 className="font-bold text-xs text-[#0B0B0C]">
              Platform Feature Flags
            </h3>
            <p className="text-[11px] text-[#71717A]">
              Immediate toggles propagated to client applications.
            </p>
          </div>
        </div>

        <div className="divide-y divide-[#E4E3DD]">
          {/* Maintenance Mode */}
          <Toggle
            label="Maintenance Mode"
            description="Redirect all non-admin users to maintenance page and pause bridge injections."
            checked={settings.maintenanceMode}
            onChange={handleToggleMaintenance}
            isSaving={isSaving}
          />

          {/* User Registration */}
          <Toggle
            label="User Registration"
            description="Allow new users to sign up and provision accounts."
            checked={settings.userRegistration}
            onChange={handleToggleRegistration}
            isSaving={isSaving}
          />

          {/* Marketplace Visibility */}
          <Toggle
            label="Marketplace Visibility"
            description="Show/hide the tools marketplace from public browsing."
            checked={settings.marketplaceVisibility}
            onChange={handleToggleMarketplace}
            isSaving={isSaving}
          />
        </div>
      </div>

      {/* Card 2: Security Parameters */}
      <div className="p-5 md:p-6 rounded-2xl border border-[#E4E3DD] bg-white shadow-xs space-y-5">
        <div className="border-b border-[#E4E3DD] pb-3 flex items-center gap-2.5">
          <Shield className="w-4 h-4 text-[#0B0B0C]" />
          <div>
            <h3 className="font-bold text-xs text-[#0B0B0C]">
              Security Parameters & Cache Controls
            </h3>
            <p className="text-[11px] text-[#71717A]">
              Bridge client version constraints and edge purging.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Required Bridge Version */}
          <div className="max-w-md space-y-2">
            <FormField
              label="Required Bridge Version"
              value={bridgeVersionInput}
              onChange={(e) => setBridgeVersionInput(e.target.value)}
              placeholder="e.g. 2.4.1"
              helperText="Minimum extension version required for session handoff."
              className="font-mono text-xs"
            />
            {/* Disabled with clear label as requested: "Do not imply success until connected to a real callback" */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                disabled
                className="px-3 py-1.5 rounded-lg bg-[#FAF9F5] border border-[#E4E3DD] text-[#71717A] text-xs font-semibold cursor-not-allowed"
                title="Backend action not connected"
              >
                Apply Version Gate
              </button>
              <span className="text-[10px] text-[#71717A] font-mono">
                (Backend action not connected)
              </span>
            </div>
          </div>

          {/* Purge Global Cache: Destructive action, disabled and labeled "Backend action not connected" */}
          <div className="pt-4 border-t border-[#E4E3DD] max-w-md space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#0B0B0C] block">
                  Purge Global CDN / Session Cache
                </span>
                <p className="text-[11px] text-[#71717A]">
                  Force-evict cached public bundles and active proxy tokens worldwide.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                disabled
                className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-300 border border-rose-200 text-xs font-semibold cursor-not-allowed flex items-center gap-1.5"
                title="Backend action not connected"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Purge Global Cache</span>
              </button>
              <span className="text-[10px] text-[#71717A] font-mono">
                (Backend action not connected)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Maintenance Mode */}
      <ConfirmDialog
        isOpen={maintenanceConfirmOpen}
        onClose={() => setMaintenanceConfirmOpen(false)}
        onConfirm={handleConfirmMaintenance}
        title="Enable Maintenance Mode?"
        description="Enabling Maintenance Mode will immediately redirect all public users away from the marketplace and prevent session launches. Only administrators will be able to access the platform."
        confirmLabel="Enable Maintenance Mode"
        variant="warning"
      />
    </div>
  );
};
