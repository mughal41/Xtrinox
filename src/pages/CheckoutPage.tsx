import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { MarketplaceTool } from '../firebase/schema';
import { useAuthStore } from '../state/useAuthStore';
import { AlertCircle, Building2, CheckCircle2, CreditCard, MessageCircle, ShieldCheck, Smartphone } from 'lucide-react';
import { getLocalizedPrice, getUserTimezone, parseUsdPrice } from '../utils/pricing';

const WHATSAPP_NUMBER = '+923368042000';
const EASYPAISA_NUMBER = '03368042000';
const EASYPAISA_ACCOUNT_TITLE = 'USAMA ZAFAR';
const BANK_NAME = 'UBL';
const BANK_ACCOUNT_TITLE = 'USAMA ZAFAR';
const BANK_IBAN = 'UBLPK836192BNJH319823';

type PaymentMethodId = 'easypaisa' | 'bank_transfer';

const PAYMENT_METHODS: Array<{
  id: PaymentMethodId;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'easypaisa',
    label: 'JazzCash / Easypaisa',
    description: 'Send payment to the mobile wallet account.',
    icon: Smartphone,
  },
  {
    id: 'bank_transfer',
    label: 'Bank Transfer',
    description: 'Transfer payment directly to the bank account.',
    icon: Building2,
  },
];

export const CheckoutPage: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceTool | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodId | null>(null);
  const [validationError, setValidationError] = useState('');
  const timezone = useMemo(getUserTimezone, []);

  const usdPrice = useMemo(
    () => parseUsdPrice(selectedProduct?.monthlyPrice || ''),
    [selectedProduct?.monthlyPrice]
  );

  const localizedPrice = useMemo(
    () => getLocalizedPrice(usdPrice, timezone),
    [timezone, usdPrice]
  );

  const selectedMethod = PAYMENT_METHODS.find((method) => method.id === selectedPaymentMethod);
  const duration = '30 Days';

  useEffect(() => {
    const fetchTool = async () => {
      if (!id) {
        setLoadError('Product not found.');
        setLoading(false);
        return;
      }

      try {
        const docSnap = await getDoc(doc(db, 'marketplace_tools', id));
        if (docSnap.exists()) {
          setSelectedProduct({ id: docSnap.id, ...docSnap.data() } as MarketplaceTool);
        } else {
          setLoadError('Product not found.');
        }
      } catch (err) {
        setLoadError('Unable to load checkout details. Please refresh and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTool();
  }, [id]);

  const buildVerificationMessage = (methodLabel = selectedMethod?.label || 'Manual payment') => {
    return `Hi, I paid for ${selectedProduct?.name || 'Xtrinox'} subscription. Email: ${user?.email || 'Not provided'}. Amount: ${localizedPrice.display}. Payment method: ${methodLabel}. Duration: ${duration}. I will share screenshot here.`;
  };

  const openWhatsApp = (message: string) => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSelectPaymentMethod = (method: PaymentMethodId) => {
    setSelectedPaymentMethod(method);
    setValidationError('');
  };

  const handleSendScreenshot = () => {
    if (!selectedProduct) return;
    openWhatsApp(buildVerificationMessage());
  };

  const handlePayment = () => {
    if (!selectedPaymentMethod) {
      setValidationError('Select a payment method before confirming your subscription.');
      return;
    }

    setIsPaymentProcessing(true);

    try {
      openWhatsApp(buildVerificationMessage());
    } catch (err) {
      setValidationError('Unable to open WhatsApp. Please try again or contact support manually.');
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  if (loading) return <div className="p-20 text-center italic text-slate-400">Initializing secure gateway...</div>;
  if (loadError || !selectedProduct) return <div className="p-20 text-center font-bold text-rose-500 uppercase tracking-widest">{loadError || 'Product Invalid'}</div>;

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-12">
      <button
        type="button"
        onClick={() => openWhatsApp(buildVerificationMessage())}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-emerald-500 text-white shadow-2xl shadow-emerald-900/20 flex items-center justify-center hover:bg-emerald-600 active:scale-95 transition-all"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
      </button>

      <div className="text-center space-y-2">
        <h1 className="text-4xl font-display font-bold text-slate-900">Complete Purchase</h1>
        <p className="text-slate-500">Review your subscription and secure your access.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
        <div className="md:col-span-3 space-y-8">
           <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Method
              </h3>
              
              <div className="space-y-4">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedPaymentMethod === method.id;

                  return (
                    <label
                      key={method.id}
                      className={`p-4 rounded-xl border-2 flex items-center justify-between gap-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-primary-fixed border-primary shadow-sm'
                          : 'bg-slate-50 border-transparent hover:border-primary/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment-method"
                        value={method.id}
                        checked={isSelected}
                        onChange={() => handleSelectPaymentMethod(method.id)}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-primary text-white' : 'bg-white text-primary'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block">{method.label}</span>
                          <span className="text-sm text-slate-500">{method.description}</span>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-primary bg-primary' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                    </label>
                  );
                })}
              </div>

              {validationError && (
                <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-sm text-rose-700 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}

              {selectedPaymentMethod && (
                <div className="rounded-2xl border border-primary/20 bg-slate-50 p-5 space-y-5">
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900">{selectedMethod?.label} Details</h4>

                    {selectedPaymentMethod === 'easypaisa' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-xl bg-white border border-slate-200 p-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Title</p>
                          <p className="font-bold text-slate-900 mt-1">{EASYPAISA_ACCOUNT_TITLE}</p>
                        </div>
                        <div className="rounded-xl bg-white border border-slate-200 p-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Number</p>
                          <p className="font-bold text-slate-900 mt-1">{EASYPAISA_NUMBER}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-xl bg-white border border-slate-200 p-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bank Name</p>
                          <p className="font-bold text-slate-900 mt-1">{BANK_NAME}</p>
                        </div>
                        <div className="rounded-xl bg-white border border-slate-200 p-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Title</p>
                          <p className="font-bold text-slate-900 mt-1">{BANK_ACCOUNT_TITLE}</p>
                        </div>
                        <div className="rounded-xl bg-white border border-slate-200 p-4 sm:col-span-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Number / IBAN</p>
                          <p className="font-bold text-slate-900 mt-1 break-words">{BANK_IBAN}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl bg-primary-fixed p-4 text-sm font-semibold text-on-primary-fixed">
                    After payment, send screenshot on WhatsApp for verification.
                  </div>

                  <button
                    type="button"
                    onClick={handleSendScreenshot}
                    className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold shadow-sm hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Send Payment Screenshot on WhatsApp
                  </button>
                </div>
              )}

              <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Manual Verification</div>
                <div className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> WhatsApp Confirmation</div>
              </div>
           </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl space-y-6 relative overflow-hidden">
             <div className="relative z-10 space-y-6">
               <h3 className="font-bold text-lg opacity-60 uppercase tracking-widest text-[10px]">Order Summary</h3>
               
               <div className="flex justify-between items-center">
                 <span className="font-medium">{selectedProduct.name}</span>
                 <div className="text-right">
                   <span className="font-bold block">{localizedPrice.display}</span>
                   <span className="text-xs opacity-60">Base price: {localizedPrice.baseUsdDisplay}</span>
                 </div>
               </div>
               
               <div className="flex justify-between items-center opacity-60 text-sm">
                 <span>Duration</span>
                 <span>{duration}</span>
               </div>

               <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                 <span className="text-sm">Total Due Today</span>
                 <div className="text-right">
                   <span className="text-3xl font-display font-bold block">{localizedPrice.display}</span>
                   <span className="text-xs opacity-60">Base price: {localizedPrice.baseUsdDisplay}</span>
                 </div>
               </div>

               <button 
                 onClick={handlePayment}
                 disabled={isPaymentProcessing}
                 className="w-full bg-white text-slate-950 py-4 rounded-2xl font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
               >
                 {isPaymentProcessing ? (
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
