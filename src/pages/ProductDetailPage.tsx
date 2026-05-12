import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { MarketplaceTool } from '../firebase/schema';
import { useSubscriptionStore } from '../state/useSubscriptionStore';
import { PagePreloader } from '../components/PagePreloader';
import { Shield, Zap, Globe, Cpu, ArrowLeft, ShoppingCart, Rocket } from 'lucide-react';

import ReactMarkdown from 'react-markdown';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tool, setTool] = useState<MarketplaceTool | null>(null);
  const [loading, setLoading] = useState(true);
  const isSubscribed = useSubscriptionStore((state) => state.isSubscribed(id || ''));

  useEffect(() => {
    const fetchTool = async () => {
      if (!id) return;
      const docSnap = await getDoc(doc(db, 'marketplace_tools', id));
      if (docSnap.exists()) {
        setTool({ id: docSnap.id, ...docSnap.data() } as MarketplaceTool);
      }
      setLoading(false);
    };
    fetchTool();
  }, [id]);

  if (loading) return <PagePreloader message="Fetching product specifications..." />;
  if (!tool) return <div className="p-20 text-center font-bold text-rose-500 uppercase tracking-widest">Specification Not Found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-700">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div className="space-y-8">
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-200 group">
             {(tool.imageUrl || tool.bannerUrl) ? (
               <img src={tool.imageUrl || tool.bannerUrl} alt={tool.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
             ) : (
               <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                 <span className="material-symbols-outlined text-[120px] text-slate-200">robot_2</span>
               </div>
             )}
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FeatureItem icon={<Shield className="w-5 h-5" />} title="Enterprise Security" desc="Verified bridge compatibility" />
            <FeatureItem icon={<Zap className="w-5 h-5" />} title="Instant Access" desc="Auto-provisioned license" />
            <FeatureItem icon={<Globe className="w-5 h-5" />} title="Global Relay" desc="Low-latency connectivity" />
            <FeatureItem icon={<Cpu className="w-5 h-5" />} title="Neural Core" desc="Latest AI model architecture" />
          </div>
        </div>

        <div className="space-y-8 sticky top-24">
          <div className="space-y-4">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              {tool.category}
            </span>
            <h1 className="text-5xl font-display font-bold text-slate-900 leading-tight">{tool.name}</h1>
            <p className="text-slate-500 text-lg leading-relaxed">{tool.description}</p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Professional License</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">{tool.monthlyPrice}</span>
                  <span className="text-slate-400 font-medium">/mo</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Status</span>
                <span className="text-sm font-bold text-slate-900">Available Now</span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <button 
                onClick={() => navigate(isSubscribed ? '/workspace' : `/checkout/${tool.id}`)}
                className={`w-full ${
                  isSubscribed 
                    ? "bg-emerald-600 shadow-emerald-900/20" 
                    : "bg-primary shadow-primary/20"
                } text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3`}
              >
                {isSubscribed ? (
                  <>
                    <Rocket className="w-5 h-5" />
                    Launch Tool
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Subscribe Now
                  </>
                )}
              </button>
              <p className="text-center text-[10px] text-slate-400">
                {isSubscribed 
                  ? "Your subscription is active. Access the tool in your workspace." 
                  : "Cancel anytime. 24/7 technical priority support included."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Content Section */}
      {tool.seoContent && (
        <section className="pt-12 border-t border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">About {tool.name}</h2>
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
            <ReactMarkdown>{tool.seoContent}</ReactMarkdown>
          </div>
        </section>
      )}
    </div>
  );
};

const FeatureItem = ({ icon, title, desc }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
      {icon}
    </div>
    <h4 className="font-bold text-slate-900 text-sm mb-1">{title}</h4>
    <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
  </div>
);
