import React, { useState, useEffect } from 'react';
import { ProductCookieSet } from '../../types/admin';
import { adminStore } from '../../services/adminStore';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { SensitiveDataNotice } from '../../components/admin/SensitiveDataNotice';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { FormField } from '../../components/admin/FormField';
import { SelectField } from '../../components/admin/SelectField';
import { JsonEditor } from '../../components/admin/JsonEditor';
import { EmptyState } from '../../components/admin/EmptyState';
import {
  KeyRound,
  Package,
  Users,
  Edit,
  Trash2,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { ProductAvatar } from '../../components/ProductIcon';
import { BrandSpinner } from '../../components/BrandSpinner';

const SAMPLE_PAYLOAD = JSON.stringify(
  [
    {
      name: 'session_token',
      value: 'enc_token_placeholder_example',
      domain: '.example.com',
      path: '/',
      secure: true,
      httpOnly: true
    }
  ],
  null,
  2
);

export const AdminProductCookiesPage: React.FC = () => {
  const [cookieSets, setCookieSets] = useState<ProductCookieSet[]>(adminStore.cookieSets);
  const [tools, setTools] = useState(adminStore.tools);
  const [loading, setLoading] = useState(!adminStore.isInitialized);

  // Form State (Right Column)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedToolId, setSelectedToolId] = useState<string>(tools[0]?.id || 'chatgpt');
  const [title, setTitle] = useState('');
  const [jsonContent, setJsonContent] = useState(SAMPLE_PAYLOAD);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValidation, setFormValidation] = useState<{
    error?: string;
    savedCount?: number;
    removedCount?: number;
  } | null>(null);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<ProductCookieSet | null>(null);

  useEffect(() => {
    return adminStore.subscribe(() => {
      setCookieSets([...adminStore.cookieSets]);
      setTools([...adminStore.tools]);
      setLoading(false);
    });
  }, []);

  const handleStartCreate = () => {
    setEditingId(null);
    setSelectedToolId(tools[0]?.id || 'chatgpt');
    setTitle('');
    setJsonContent(SAMPLE_PAYLOAD);
    setIsActive(true);
    setFormValidation(null);
  };

  const handleStartEdit = (set: ProductCookieSet) => {
    setEditingId(set.id);
    setSelectedToolId(set.toolId);
    setTitle(set.title);
    setJsonContent(JSON.stringify(set.cookies, null, 2));
    setIsActive(set.isActive);
    setFormValidation(null);
  };

  const handleSaveCookieSet = (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidation(null);

    if (!title.trim()) {
      setFormValidation({ error: 'Cookie set title is required.' });
      return;
    }

    setIsSubmitting(true);

    // Run existing normalization & validation
    const result = adminStore.normalizeCookies(jsonContent);

    if (result.error || result.validCookies.length === 0) {
      setFormValidation({
        error: result.error || 'No usable session cookies found in payload.',
        removedCount: result.removedCount
      });
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingId) {
        adminStore.updateCookieSet(editingId, {
          toolId: selectedToolId,
          title: title.trim(),
          cookies: result.validCookies,
          isActive
        });
      } else {
        adminStore.addCookieSet({
          toolId: selectedToolId,
          title: title.trim(),
          cookies: result.validCookies,
          isActive
        });
      }

      setFormValidation({
        savedCount: result.validCookies.length,
        removedCount: result.removedCount
      });

      if (!editingId) {
        setTitle('');
        setJsonContent(SAMPLE_PAYLOAD);
      }
    } catch (err: any) {
      setFormValidation({ error: err.message || 'Failed to save cookie set.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    try {
      adminStore.deleteCookieSet(deleteTarget.id);
      if (editingId === deleteTarget.id) {
        handleStartCreate();
      }
    } catch {
      // Handled by toast in store
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <AdminPageHeader
        eyebrow="Marketplace Management"
        title="Product Cookies"
        description="Configure encrypted session cookie sets for each marketplace tool."
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
              title="Sync session cookies with Firebase"
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
              onClick={handleStartCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B0B0C] hover:bg-[#232326] text-[#F3F2EE] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#B6FF2E]" />
              <span>New Cookie Set</span>
            </button>
          </div>
        }
      />

      {/* Sensitive Data Notice */}
      <SensitiveDataNotice
        variant="banner"
        message="Cookie payloads are normalized, stripped of dangerous attributes, and stored as protected session sets. Never paste raw unverified authentication credentials without verifying domain scoping."
      />

      {/* Two-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Saved Cookie Sets List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
              Saved Cookie Sets ({cookieSets.length})
            </h2>
            <span className="text-[11px] text-[#71717A] font-mono">
              AES-256 payload ready
            </span>
          </div>

          {loading ? (
            <div className="py-20 flex items-center justify-center bg-transparent">
              <BrandSpinner size="lg" />
            </div>
          ) : cookieSets.length === 0 ? (
            <EmptyState
              icon={<KeyRound className="w-6 h-6" />}
              title="No product cookie sets configured"
              description="Configure reusable session cookies using the form to enable entitlement assignment."
              action={{ label: 'Create First Cookie Set', onClick: handleStartCreate }}
            />
          ) : (
            <div className="space-y-3">
              {cookieSets.map((set) => {
                const isSelected = editingId === set.id;
                return (
                  <div
                    key={set.id}
                    className={`p-4 rounded-2xl border transition-all duration-200 bg-white shadow-xs ${
                      isSelected
                        ? 'border-[#0B0B0C] ring-2 ring-[#0B0B0C]/10'
                        : 'border-[#E4E3DD] hover:border-[#0B0B0C]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <ProductAvatar
                          productId={set.toolId || set.toolName}
                          size="md"
                          className="text-[#0B0B0C]"
                          containerClassName="w-9 h-9 rounded-xl bg-white border border-[#E4E3DD] shadow-2xs mt-0.5"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-xs text-[#0B0B0C]">
                              {set.title}
                            </h3>
                            <StatusBadge
                              status={set.isActive ? 'active' : 'inactive'}
                              size="sm"
                            />
                          </div>
                          <span className="text-[11px] font-medium text-[#71717A] block mt-0.5">
                            Target Tool: <strong className="text-[#0B0B0C]">{set.toolName}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(set)}
                          className="p-1.5 rounded-lg text-[#71717A] hover:text-[#0B0B0C] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
                          title="Edit cookie set"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(set)}
                          className="p-1.5 rounded-lg text-[#71717A] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete cookie set"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Strip */}
                    <div className="mt-3 pt-3 border-t border-[#E4E3DD] flex items-center justify-between text-[11px] text-[#71717A] font-mono">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[#0B0B0C]">
                          <KeyRound className="w-3 h-3 text-[#71717A]" />
                          <span>{set.cookieCount} session cookies</span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-[#0B0B0C]">
                          <Users className="w-3 h-3 text-[#71717A]" />
                          <span>{set.assignedUsersCount} users assigned</span>
                        </span>
                      </div>
                      <span className="text-[10px] text-[#71717A]">
                        {new Date(set.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Cookie Editor Form */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="p-5 md:p-6 rounded-2xl border border-[#E4E3DD] bg-white shadow-xs space-y-4">
            <div className="border-b border-[#E4E3DD] pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#0B0B0C]">
                  {editingId ? 'Edit Cookie Set' : 'Create Cookie Set'}
                </h3>
                <p className="text-[11px] text-[#71717A] mt-0.5">
                  Paste JSON array exported from browser session.
                </p>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={handleStartCreate}
                  className="text-[11px] text-[#0B0B0C] hover:underline font-semibold cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSaveCookieSet} className="space-y-4">
              {/* Validation / Result Banners */}
              {formValidation?.error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formValidation.error}</span>
                </div>
              )}

              {formValidation?.savedCount !== undefined && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Cookie Set Normalized Successfully</span>
                    <span className="text-[11px] text-emerald-700">
                      Saved {formValidation.savedCount} usable session cookie{formValidation.savedCount === 1 ? '' : 's'}.
                      {formValidation.removedCount ? ` Pruned ${formValidation.removedCount} non-session item(s).` : ''}
                    </span>
                  </div>
                </div>
              )}

              {/* Tool Target Selector */}
              <SelectField
                label="Target Marketplace Tool"
                value={selectedToolId}
                onChange={(e) => setSelectedToolId(e.target.value)}
                options={tools.map((t) => ({
                  value: t.id,
                  label: `${t.name} (${t.id})`
                }))}
                helperText="Tool that will receive these session cookies during injection."
                required
              />

              {/* Set Title */}
              <FormField
                label="Set Title / Descriptor"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Primary US Session Cluster"
                helperText="Human-readable label for entitlement assignment."
                required
              />

              {/* Json Array Payload Editor */}
              <JsonEditor
                label="Raw Cookie JSON Array"
                value={jsonContent}
                onChange={setJsonContent}
                placeholder="[ { 'name': '...', 'value': '...' } ]"
                height="h-52"
                helperText="Automatically normalizes names, domains, expiry timestamps, and security flags."
              />

              {/* Active Toggle Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="cookie_active_toggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-[#E4E3DD] text-[#0B0B0C] focus:ring-[#0B0B0C]/10 cursor-pointer"
                />
                <label
                  htmlFor="cookie_active_toggle"
                  className="text-xs font-semibold text-[#0B0B0C] cursor-pointer"
                >
                  Enable for Entitlement Assignment
                </label>
              </div>

              {/* Submit Action */}
              <div className="pt-2 border-t border-[#E4E3DD]">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-[#0B0B0C] hover:bg-[#232326] text-[#F3F2EE] text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4 text-[#B6FF2E]" />
                  <span>{editingId ? 'Update Cookie Set' : 'Encrypt & Save Cookie Set'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Cookie Set"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? Active users assigned to this set may lose bridge handoff capability until reassigned.`}
        confirmLabel="Delete Set"
        variant="danger"
      />
    </div>
  );
};
