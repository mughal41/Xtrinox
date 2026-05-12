import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ExternalLink,
  CheckCircle2,
  XCircle,
  Package,
  MoreVertical
} from 'lucide-react';
import { adminToolsService } from '../../services/admin.service';
import { useAuthStore } from '../../state/useAuthStore';
import { useRuntimeStore } from '../../state/useRuntimeStore';

export const ToolManager: React.FC = () => {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<any>(null);
  
  const { user } = useAuthStore();
  const { setAdminDataLoading } = useRuntimeStore();

  useEffect(() => {
    loadTools();
    return () => setAdminDataLoading(false);
  }, []);

  const loadTools = async () => {
    setAdminDataLoading(true);
    setLoading(true);
    const data = await adminToolsService.getAllTools();
    setTools(data);
    setLoading(false);
    setAdminDataLoading(false);
  };

  const handleSave = async (toolData: any) => {
    try {
      if (editingTool) {
        await adminToolsService.updateTool(editingTool.id, toolData, user!.uid);
      } else {
        await adminToolsService.createTool(toolData.id, toolData, user!.uid);
      }
      setIsModalOpen(false);
      loadTools();
    } catch (err: any) {
      alert(`Failed to save tool: ${err.message}`);
    }
  };

  const filteredTools = tools.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Marketplace Inventory</h1>
            <p className="text-slate-500 text-sm">Manage tool metadata, visibility, and launch endpoints.</p>
          </div>
          <button 
            onClick={() => { setEditingTool(null); setIsModalOpen(true); }}
            className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Tool
          </button>
        </header>

        {/* Toolbar */}
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tools by name or ID..."
              className="bg-transparent border-none outline-none text-sm w-full text-slate-900 placeholder:text-slate-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Tools Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Tool Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Pricing</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                    Fetching tool ecosystem...
                  </td>
                </tr>
              ) : filteredTools.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                    No tools found matching your search.
                  </td>
                </tr>
              ) : filteredTools.map((tool) => (
                <tr key={tool.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6 text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{tool.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">ID: {tool.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg">
                      {tool.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{tool.monthlyPrice}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {tool.active ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          ACTIVE
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-400 bg-slate-100 px-2 py-1 rounded-full text-[10px] font-bold">
                          <XCircle className="w-3 h-3" />
                          INACTIVE
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => { setEditingTool(tool); setIsModalOpen(true); }}
                      className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <ToolModal 
          tool={editingTool} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave} 
        />
      )}
    </>
  );
};

const ToolModal = ({ tool, onClose, onSave }: any) => {
  const [formData, setFormData] = useState(tool || {
    id: '',
    name: '',
    category: 'Productivity',
    monthlyPrice: '$29.00',
    active: true,
    launchUrl: '',
    imageUrl: '',
    description: '',
    seoContent: ''
  });

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
          maxWidth: '36rem', // xl
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          overflowY: 'auto',
          maxHeight: '90vh',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-slate-900 mb-6">{tool ? 'Edit Tool' : 'Add New Tool'}</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Tool ID (Slug)</label>
              <input 
                type="text" 
                disabled={!!tool}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none disabled:opacity-50"
                value={formData.id}
                onChange={(e) => setFormData({...formData, id: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Tool Name</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Monthly Price</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none"
                value={formData.monthlyPrice}
                onChange={(e) => setFormData({...formData, monthlyPrice: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Image URL</label>
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none"
              placeholder="https://example.com/image.png"
              value={formData.imageUrl}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Launch URL</label>
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none"
              value={formData.launchUrl}
              onChange={(e) => setFormData({...formData, launchUrl: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">SEO Content (Markdown/HTML)</label>
            <textarea 
              className="w-full h-32 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none resize-none font-mono"
              placeholder="Detailed description for search engines..."
              value={formData.seoContent}
              onChange={(e) => setFormData({...formData, seoContent: e.target.value})}
            />
          </div>

          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="text-sm font-bold text-slate-900">Active Status</p>
              <p className="text-[10px] text-slate-500">Tool will be visible in marketplace</p>
            </div>
            <button 
              onClick={() => setFormData({...formData, active: !formData.active})}
              className={`w-12 h-6 rounded-full transition-all relative ${formData.active ? 'bg-primary' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.active ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button onClick={onClose} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold text-sm">Cancel</button>
          <button onClick={() => onSave(formData)} className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20">
            {tool ? 'Update Tool' : 'Create Tool'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
