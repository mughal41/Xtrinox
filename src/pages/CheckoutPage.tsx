import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { MarketplaceTool } from '../firebase/schema';
import { useAuthStore } from '../state/useAuthStore';
import { adminEntitlementService } from '../services/admin.service';
import { CreditCard, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tool, setTool] = useState<MarketplaceTool | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

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

  const handlePayment = async () => {
    if (!user || !tool) return;
    setProcessing(true);
    
    try {
      // Simulate Payment Delay
      await new Promise(r => setTimeout(r, 2000));
      
      // Auto-grant for demo/MVP purposes
      await adminEntitlementService.grantAccess(user.uid, tool.id, 30, 'system');
      
      setCompleted(true);
    } catch (err) {
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-20 text-center italic text-slate-400">Initializing secure gateway...</div>;
  if (!tool) return <div className="p-20 text-center font-bold text-rose-500 uppercase tracking-widest">Product Invalid</div>;

  if (completed) {
    return (
      <div className="max-w-md mx-auto text-center space-y-8 py-20 animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
           <CheckCircle2 className="w-16 h-16" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Subscription Active!</h1>
          <p className="text-slate-500">Access to {tool.name} has been provisioned to your workspace.</p>
        </div>
        <button 
          onClick={() => navigate('/workspace')}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all"
        >
          Go to Workspace
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-12">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-display font-bold text-slate-900">Complete Purchase</h1>
        <p className="text-slate-500">Review your subscription and secure your access.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3 space-y-8">
           <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Method
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border-2 border-primary/20 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-6 bg-slate-900 rounded-sm" />
                    <span className="font-medium text-slate-900">Stored Balance / Demo Mode</span>
                  </div>
                  <div className="w-4 h-4 rounded-full border-4 border-primary" />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-1"><Lock className="w-3 h-3" /> 256-bit SSL</div>
                <div className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> PCI-DSS Compliant</div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl space-y-6 relative overflow-hidden">
             <div className="relative z-10 space-y-6">
               <h3 className="font-bold text-lg opacity-60 uppercase tracking-widest text-[10px]">Order Summary</h3>
               
               <div className="flex justify-between items-center">
                 <span className="font-medium">{tool.name}</span>
                 <span className="font-bold">{tool.monthlyPrice}</span>
               </div>
               
               <div className="flex justify-between items-center opacity-60 text-sm">
                 <span>Duration</span>
                 <span>30 Days</span>
               </div>

               <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                 <span className="text-sm">Total Due Today</span>
                 <span className="text-3xl font-display font-bold">{tool.monthlyPrice}</span>
               </div>

               <button 
                 onClick={handlePayment}
                 disabled={processing}
                 className="w-full bg-white text-slate-950 py-4 rounded-2xl font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
               >
                 {processing ? (
                   <div className="w-5 h-5 animate-spin border-2 border-slate-950/20 border-t-slate-950 rounded-full" />
                 ) : (
                   'Confirm Subscription'
                 )}
               </button>
             </div>
             <div className="absolute -right-12 -bottom-12 opacity-10">
               <span className="material-symbols-outlined text-[160px]">shopping_cart</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
