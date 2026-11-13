import React, { useState, useEffect, useMemo } from 'react';
import { AdminTool } from '../../types/admin';
import { adminStore } from '../../services/adminStore';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { SearchToolbar } from '../../components/admin/SearchToolbar';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { AdminDialog } from '../../components/admin/AdminDialog';
import { FormField } from '../../components/admin/FormField';
import { SelectField } from '../../components/admin/SelectField';
import { Toggle } from '../../components/admin/Toggle';
import { EmptyState } from '../../components/admin/EmptyState';
import {
  Plus,
  Package,
  Edit,
  Trash2,
  Code,
  Eye,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { ProductAvatar } from '../../components/ProductIcon';
import { BrandSpinner } from '../../components/BrandSpinner';

export const AdminToolsPage: React.FC = () => {
  const [tools, setTools] = useState<AdminTool[]>(adminStore.tools);
  const [loading, setLoading] = useState(!adminStore.isInitialized);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<AdminTool | null>(null);

  // Form State
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'assistant' | 'writing' | 'research' | 'productivity'>('assistant');
  const [formPrice, setFormPrice] = useState('5000');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formLaunchUrl, setFormLaunchUrl] = useState('');
  const [formSeoContent, setFormSeoContent] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [seoPreviewTab, setSeoPreviewTab] = useState<'edit' | 'preview'>('edit');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    return adminStore.subscribe(() => {
      setTools([...adminStore.tools]);
      setLoading(false);
    });
  }, []);

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.id.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && tool.isActive) ||
        (statusFilter === 'inactive' && !tool.isActive);

      const matchesCategory =
        categoryFilter === 'all' || tool.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [tools, searchQuery, statusFilter, categoryFilter]);

  const handleOpenCreate = () => {
    setEditingTool(null);
    setFormId('');
    setFormName('');
    setFormCategory('assistant');
    setFormPrice('5000');
    setFormImageUrl('#0B0B0C');
    setFormLaunchUrl('');
    setFormSeoContent('');
    setFormIsActive(true);
    setFormError(null);
    setSeoPreviewTab('edit');
    setDialogOpen(true);
  };

  const handleOpenEdit = (tool: AdminTool) => {
    setEditingTool(tool);
    setFormId(tool.id);
    setFormName(tool.name);
    setFormCategory(tool.category);
    setFormPrice(String(tool.monthlyPrice));
    setFormImageUrl(tool.imageUrl || '');
    setFormLaunchUrl(tool.launchUrl || '');
    setFormSeoContent(tool.seoContent || '');
    setFormIsActive(tool.isActive);
    setFormError(null);
    setSeoPreviewTab('edit');
    setDialogOpen(true);
  };

  const handleSaveTool = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanId = formId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    if (!cleanId) {
      setFormError('Tool ID is required and must contain alphanumeric characters or dashes.');
      return;
    }
    if (!formName.trim()) {
      setFormError('Tool name is required.');
      return;
    }

    const priceNum = parseFloat(formPrice) || 0;
    const priceFormatted = `Rs ${priceNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    try {
      if (editingTool) {
        // Update existing tool
        adminStore.updateTool(editingTool.id, {
          name: formName.trim(),
          category: formCategory,
          categoryLabel: formCategory === 'assistant' ? 'AI assistants' : formCategory.charAt(0).toUpperCase() + formCategory.slice(1),
          monthlyPrice: priceNum,
          monthlyPriceFormatted: priceFormatted,
          imageUrl: formImageUrl.trim(),
          launchUrl: formLaunchUrl.trim(),
          seoContent: formSeoContent,
          isActive: formIsActive
        });
      } else {
        // Create new tool
        adminStore.addTool({
          id: cleanId,
          name: formName.trim(),
          category: formCategory,
          categoryLabel: formCategory === 'assistant' ? 'AI assistants' : formCategory.charAt(0).toUpperCase() + formCategory.slice(1),
          monthlyPrice: priceNum,
          monthlyPriceFormatted: priceFormatted,
          basePriceUsd: `$${(priceNum / 278).toFixed(2)}`,
          imageUrl: formImageUrl.trim(),
          launchUrl: formLaunchUrl.trim(),
          seoContent: formSeoContent,
          isActive: formIsActive,
          requiresBridge: true,
          featured: false
        });
      }
      setDialogOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save tool to marketplace inventory.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <AdminPageHeader
        eyebrow="Marketplace Management"
        title="Marketplace Inventory"
        description="Manage tool metadata, visibility, and launch endpoints."
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
              title="Sync inventory with Firebase"
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
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B0B0C] hover:bg-[#232326] text-[#F3F2EE] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#B6FF2E]" />
              <span>Add New Tool</span>
            </button>
          </div>
        }
      />

      {/* Search & Filters Toolbar */}
      <SearchToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search tools by name or ID..."
        totalCount={tools.length}
        filteredCount={filteredTools.length}
        filters={
          <>
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-10 px-3 rounded-xl border border-[#E4E3DD] bg-[#FAF9F5] text-[#0B0B0C] text-xs focus:outline-none focus:ring-2 focus:ring-[#0B0B0C]/10 cursor-pointer"
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-[#E4E3DD] bg-[#FAF9F5] text-[#0B0B0C] text-xs focus:outline-none focus:ring-2 focus:ring-[#0B0B0C]/10 cursor-pointer"
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              <option value="assistant">AI assistants</option>
              <option value="writing">Writing</option>
              <option value="research">Research</option>
              <option value="productivity">Productivity</option>
            </select>
          </>
        }
      />

      {/* Main Tools List (Desktop Table + Mobile Cards) */}
      {loading ? (
        <div className="py-20 flex items-center justify-center bg-transparent">
          <BrandSpinner size="lg" />
        </div>
      ) : filteredTools.length === 0 ? (
        <EmptyState
          icon={<Package className="w-6 h-6" />}
          title="No marketplace tools found"
          description={
            searchQuery
              ? `No tools match "${searchQuery}". Clear your search or filters.`
              : 'No tools exist in the inventory. Click "Add New Tool" to create one.'
          }
          action={
            searchQuery
              ? { label: 'Clear Filters', onClick: () => { setSearchQuery(''); setStatusFilter('all'); setCategoryFilter('all'); } }
              : { label: 'Add New Tool', onClick: handleOpenCreate }
          }
        />
      ) : (
        <>
          {/* Desktop Table (>= 768px) */}
          <div className="hidden md:block rounded-2xl border border-[#E4E3DD] bg-white overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E4E3DD] bg-[#FAF9F5] text-[#71717A] font-semibold">
                  <th className="py-3 px-4">Tool Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Monthly Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E3DD]">
                {filteredTools.map((tool) => (
                  <tr
                    key={tool.id}
                    className="hover:bg-[#FAF9F5] transition-colors"
                  >
                    {/* Tool Details */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <ProductAvatar
                          productId={tool.id || tool.name}
                          size="md"
                          className="text-[#0B0B0C]"
                          containerClassName="w-9 h-9 rounded-xl bg-white border border-[#E4E3DD] shadow-2xs"
                        />
                        <div>
                          <span className="font-bold text-[#0B0B0C] block">
                            {tool.name}
                          </span>
                          <span className="font-mono text-[11px] text-[#71717A] block">
                            {tool.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status="category" label={tool.categoryLabel || tool.category} size="sm" />
                    </td>

                    {/* Pricing */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#0B0B0C] block">
                        {tool.monthlyPriceFormatted || `Rs ${tool.monthlyPrice}`}
                      </span>
                      <span className="text-[10px] text-[#71717A] font-mono">
                        {tool.basePriceUsd || '30 days'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge
                        status={tool.isActive ? 'active' : 'inactive'}
                        size="sm"
                      />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(tool)}
                          className="p-1.5 rounded-lg text-[#71717A] hover:text-[#0B0B0C] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
                          title="Edit tool metadata"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          disabled
                          className="p-1.5 rounded-lg text-[#D4D4D8] cursor-not-allowed"
                          title="Delete callback not available in backend API"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Product Cards (< 768px) */}
          <div className="md:hidden space-y-3">
            {filteredTools.map((tool) => (
              <div
                key={tool.id}
                className="p-4 rounded-2xl border border-[#E4E3DD] bg-white shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <ProductAvatar
                      productId={tool.id || tool.name}
                      size="md"
                      className="text-[#0B0B0C]"
                      containerClassName="w-10 h-10 rounded-xl bg-white border border-[#E4E3DD] shadow-xs"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-[#0B0B0C]">
                        {tool.name}
                      </h3>
                      <span className="font-mono text-[11px] text-[#71717A]">
                        {tool.id}
                      </span>
                    </div>
                  </div>

                  <StatusBadge
                    status={tool.isActive ? 'active' : 'inactive'}
                    size="sm"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E4E3DD]">
                  <StatusBadge status="category" label={tool.categoryLabel || tool.category} size="sm" />
                  <span className="font-semibold text-[#0B0B0C]">
                    {tool.monthlyPriceFormatted || `Rs ${tool.monthlyPrice}`}
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-[#71717A] font-mono">
                    Bridge Handoff
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(tool)}
                      className="px-3 py-1.5 rounded-lg bg-[#FAF9F5] border border-[#E4E3DD] hover:bg-[#EBEAE5] text-[#0B0B0C] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      disabled
                      className="p-1.5 rounded-lg text-[#D4D4D8] cursor-not-allowed"
                      title="Delete not available in backend API"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add / Edit Tool Dialog */}
      <AdminDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingTool ? `Edit Tool: ${editingTool.name}` : 'Add New Tool'}
        description={
          editingTool
            ? 'Update product metadata and visibility in the public marketplace.'
            : 'Configure a new marketplace tool. Document ID is permanent once created.'
        }
        maxWidth="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDialogOpen(false)}
              className="px-3.5 py-2 rounded-xl border border-[#E4E3DD] bg-[#FAF9F5] hover:bg-[#EBEAE5] text-[#0B0B0C] text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveTool}
              className="px-4 py-2 rounded-xl bg-[#0B0B0C] hover:bg-[#232326] text-[#F3F2EE] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {editingTool ? 'Update Tool' : 'Create Tool'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveTool} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {formError}
            </div>
          )}

          {/* Tool ID */}
          <FormField
            label="Tool ID / Document Slug"
            value={formId}
            onChange={(e) => setFormId(e.target.value)}
            disabled={Boolean(editingTool)}
            placeholder="e.g. chatgpt, claude-ai, turnitin"
            helperText={
              editingTool
                ? 'Immutable Firestore document key. Cannot be modified after creation.'
                : 'Permanent document slug (lowercase alphanumeric and hyphens).'
            }
            required
            className={editingTool ? 'bg-[#F3F2EE] cursor-not-allowed text-[#71717A] font-mono' : 'font-mono'}
          />

          {/* Tool Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Tool Name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. ChatGPT Premium"
              required
            />
            <SelectField
              label="Category"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value as any)}
              options={[
                { value: 'assistant', label: 'AI assistants' },
                { value: 'writing', label: 'Writing' },
                { value: 'research', label: 'Research' },
                { value: 'productivity', label: 'Productivity' }
              ]}
            />
          </div>

          {/* Pricing & Brand Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Monthly Price (PKR)"
              type="number"
              value={formPrice}
              onChange={(e) => setFormPrice(e.target.value)}
              placeholder="5000"
              helperText="Auto-calculated into display strings."
              required
            />
            <FormField
              label="Brand Accent Color / Image URL"
              value={formImageUrl}
              onChange={(e) => setFormImageUrl(e.target.value)}
              placeholder="#0B0B0C or URL"
              helperText="Hex accent code or direct URL."
            />
          </div>

          {/* Launch URL */}
          <FormField
            label="Launch Endpoint URL"
            value={formLaunchUrl}
            onChange={(e) => setFormLaunchUrl(e.target.value)}
            placeholder="https://chatgpt.com"
            helperText="Direct URL injected via Xtrinox Bridge extension."
          />

          {/* SEO Content (Markdown & Preview Tab) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#0B0B0C]">
                SEO & Product Overview Content
              </label>
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#FAF9F5] border border-[#E4E3DD] text-[10px] font-semibold">
                <button
                  type="button"
                  onClick={() => setSeoPreviewTab('edit')}
                  className={`px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer ${
                    seoPreviewTab === 'edit'
                      ? 'bg-[#0B0B0C] text-[#F3F2EE] shadow-2xs font-bold'
                      : 'text-[#71717A] hover:text-[#0B0B0C]'
                  }`}
                >
                  <Code className="w-3 h-3" />
                  <span>Markdown</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSeoPreviewTab('preview')}
                  className={`px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer ${
                    seoPreviewTab === 'preview'
                      ? 'bg-[#0B0B0C] text-[#F3F2EE] shadow-2xs font-bold'
                      : 'text-[#71717A] hover:text-[#0B0B0C]'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            {seoPreviewTab === 'edit' ? (
              <textarea
                rows={4}
                value={formSeoContent}
                onChange={(e) => setFormSeoContent(e.target.value)}
                placeholder="# Product Title&#10;&#10;Key features and capabilities..."
                className="w-full rounded-xl border border-[#E4E3DD] bg-[#0B0B0C] text-[#B6FF2E] font-mono text-[11px] p-3 focus:outline-none focus:ring-2 focus:ring-[#0B0B0C]/10"
              />
            ) : (
              <div className="min-h-24 p-3 rounded-xl border border-[#E4E3DD] bg-[#FAF9F5] text-[#0B0B0C] text-xs leading-relaxed space-y-1 whitespace-pre-wrap">
                {formSeoContent ? (
                  formSeoContent
                ) : (
                  <span className="text-[#71717A] italic">No SEO markdown provided yet.</span>
                )}
              </div>
            )}
          </div>

          {/* Active Status Toggle */}
          <div className="pt-2 border-t border-[#E4E3DD]">
            <Toggle
              label="Active Status"
              description="Tool will be visible in public marketplace."
              checked={formIsActive}
              onChange={setFormIsActive}
            />
          </div>
        </form>
      </AdminDialog>
    </div>
  );
};
