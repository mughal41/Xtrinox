import React, { useState } from 'react';
import { Product, RouteName } from '../types';
import { PRODUCTS, PAYMENT_DESTINATIONS } from '../data/products';
import { useMarketplaceStore } from '../state/useMarketplaceStore';
import { useAuthStore } from '../state/useAuthStore';
import {
  Smartphone,
  Building2,
  Copy,
  Check,
  ArrowRight,
  ShieldAlert,
  MessageSquare
} from 'lucide-react';
import { ProductIcon, ProductAvatar } from '../components/ProductIcon';

interface CheckoutPageProps {
  productId?: string;
  onNavigate: (route: RouteName, param?: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  productId = 'quillbot',
  onNavigate
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'wallet' | 'bank' | null>('wallet');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { user } = useAuthStore();
  const { getToolById } = useMarketplaceStore();

  const marketplaceTool = getToolById(productId);

  // Target product
  const baseProduct: Product =
    PRODUCTS.find((p) => p.slug === productId || p.id === productId) ||
    PRODUCTS.find((p) => p.slug === 'quillbot') ||
    PRODUCTS[0];

  const product: Product = {
    ...baseProduct,
    pricePkr: marketplaceTool?.pricing?.monthly || baseProduct.pricePkr,
    priceFormatted: marketplaceTool?.pricing?.monthly 
      ? `Rs ${marketplaceTool.pricing.monthly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : baseProduct.priceFormatted
  };

  const destinations = PAYMENT_DESTINATIONS;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      showToast(`Copied ${key}`);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      showToast('Copied to clipboard');
    }
  };

  const handleContinueWhatsApp = () => {
    const methodLabel = selectedMethod === 'wallet' ? 'JazzCash / Easypaisa' : 'Bank transfer';
    const userIdentifier = user?.email || user?.uid || 'Not signed in';
    const message = `Hello Xtrinox Support,

I am submitting payment proof for manual verification.
Account: ${userIdentifier}
Product: ${product.name}
Duration: ${product.duration}
Amount: ${product.priceFormatted}
Base reference: ${product.basePriceUsd} USD
Method: ${methodLabel}

I will attach my payment receipt to this WhatsApp conversation. Please review and confirm next steps.`;

    const encoded = encodeURIComponent(message);
    const cleanNumber = destinations.whatsappNumber.replace(/\D/g, '');
    const waUrl = `https://wa.me/${cleanNumber}?text=${encoded}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
    showToast('WhatsApp opened — attach your transfer receipt.');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] py-10 px-6 transition-colors">
      <div className="max-w-[912px] mx-auto">
        {/* Topline & Title */}
        <div className="flex items-center gap-2.5 text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--brand)] mb-2">
          <span className="w-4 h-0.5 bg-[var(--brand)]" />
          <span>CHECKOUT</span>
        </div>

        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-[var(--text)] tracking-tight leading-tight mb-2">
          Complete your {product.name} subscription.
        </h1>
        <p className="text-xs sm:text-sm text-[var(--sub)] max-w-[680px] leading-relaxed mb-8">
          Choose how to pay, transfer the amount, then send your receipt on WhatsApp. Your access begins after manual review.
        </p>

        {/* Unified Theme-Adaptive Checkout Sheet */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl overflow-hidden">
          {/* Purchase Row Header */}
          <div className="p-6 sm:p-8 bg-[var(--surface-raised)] border-b border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <ProductAvatar
                productId={product.slug || product.id}
                size="xl"
                className="text-[#0B0B0C]"
                containerClassName="w-14 h-14 rounded-2xl bg-white border border-[var(--border)] shadow-md p-2.5"
              />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                  Your subscription
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-[var(--text)]">
                  {product.name}
                </h2>
                <span className="text-xs text-[var(--sub)]">
                  Professional license · {product.duration} access
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]">
              <span className="text-[11px] font-medium text-[var(--muted)] block">Total to transfer</span>
              <div className="num font-heading font-extrabold text-2xl sm:text-3xl text-[var(--text)] tracking-tight">
                {product.priceFormatted}
              </div>
              <span className="num text-[11px] text-[var(--muted)] block">
                Base reference: {product.basePriceUsd} USD
              </span>
            </div>
          </div>

          {/* Sheet Body: Steps */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Step 1: Choose payment method */}
            <section aria-labelledby="choose-method-heading">
              <h3 id="choose-method-heading" className="font-heading font-bold text-base sm:text-lg text-[var(--text)] mb-1">
                Choose how you'd like to pay
              </h3>
              <p className="text-xs text-[var(--sub)] mb-4">
                Select one method to see verified recipient transfer details.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup">
                {/* Wallet Option */}
                <label
                  onClick={() => setSelectedMethod('wallet')}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    selectedMethod === 'wallet'
                      ? 'border-[var(--brand)] bg-[var(--surface-raised)] ring-1 ring-[var(--brand)]'
                      : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-raised)]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-[var(--accent-badge-bg)] text-[var(--brand)] flex items-center justify-center shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-[var(--text)] block">
                        JazzCash / Easypaisa
                      </span>
                      <span className="text-[11px] text-[var(--sub)]">Mobile wallet transfer</span>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedMethod === 'wallet' ? 'border-[var(--brand)] bg-[var(--brand)]' : 'border-[var(--border-strong)]'
                    }`}
                  >
                    {selectedMethod === 'wallet' && <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-text)]" />}
                  </div>
                </label>

                {/* Bank Option */}
                <label
                  onClick={() => setSelectedMethod('bank')}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    selectedMethod === 'bank'
                      ? 'border-[var(--brand)] bg-[var(--surface-raised)] ring-1 ring-[var(--brand)]'
                      : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-raised)]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-[var(--accent-badge-bg)] text-[var(--brand)] flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-[var(--text)] block">
                        Bank transfer
                      </span>
                      <span className="text-[11px] text-[var(--sub)]">Transfer from your bank</span>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedMethod === 'bank' ? 'border-[var(--brand)] bg-[var(--brand)]' : 'border-[var(--border-strong)]'
                    }`}
                  >
                    {selectedMethod === 'bank' && <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-text)]" />}
                  </div>
                </label>
              </div>

              {/* Destination Details Box */}
              {selectedMethod && (
                <div className="mt-5 p-5 rounded-xl border border-[var(--border)] bg-[var(--surface-deep)] space-y-3 animate-in fade-in-50">
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                    <h4 className="font-heading font-bold text-xs text-[var(--text)] uppercase tracking-wider">
                      Transfer details ({selectedMethod === 'wallet' ? 'Mobile Wallet' : 'Bank Account'})
                    </h4>
                    <span className="text-[11px] text-[var(--muted)]">Send exact amount: {product.priceFormatted}</span>
                  </div>

                  {selectedMethod === 'wallet' ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-1.5 border-b border-[var(--border)]">
                        <div>
                          <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">Service Provider</span>
                          <span className="text-xs font-semibold text-[var(--text)]">{destinations.wallet.provider}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-1.5 border-b border-[var(--border)]">
                        <div>
                          <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">Account Holder</span>
                          <span className="text-xs font-semibold text-[var(--text)]">{destinations.wallet.recipientName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(destinations.wallet.recipientName, 'Name')}
                          className="px-2.5 py-1 rounded bg-[var(--surface)] hover:bg-[var(--surface-raised)] border border-[var(--border)] text-[11px] text-[var(--text)] font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                        >
                          {copiedKey === 'Name' ? <Check className="w-3 h-3 text-[var(--success)]" /> : <Copy className="w-3 h-3" />}
                          <span className={copiedKey === 'Name' ? 'text-[var(--success)] font-bold' : ''}>
                            {copiedKey === 'Name' ? 'Copied' : 'Copy'}
                          </span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between py-1.5">
                        <div>
                          <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">Account Number</span>
                          <span className="num text-sm font-bold text-[var(--text)]">{destinations.wallet.accountNumber}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(destinations.wallet.accountNumber, 'Account Number')}
                          className="px-2.5 py-1 rounded bg-[var(--surface)] hover:bg-[var(--surface-raised)] border border-[var(--border)] text-[11px] text-[var(--text)] font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                        >
                          {copiedKey === 'Account Number' ? <Check className="w-3 h-3 text-[var(--success)]" /> : <Copy className="w-3 h-3" />}
                          <span className={copiedKey === 'Account Number' ? 'text-[var(--success)] font-bold' : ''}>
                            {copiedKey === 'Account Number' ? 'Copied' : 'Copy'}
                          </span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-1.5 border-b border-[var(--border)]">
                        <div>
                          <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">Bank Name</span>
                          <span className="text-xs font-semibold text-[var(--text)]">{destinations.bank.bankName}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-1.5 border-b border-[var(--border)]">
                        <div>
                          <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">Account Holder</span>
                          <span className="text-xs font-semibold text-[var(--text)]">{destinations.bank.recipientName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(destinations.bank.recipientName, 'Holder Name')}
                          className="px-2.5 py-1 rounded bg-[var(--surface)] hover:bg-[var(--surface-raised)] border border-[var(--border)] text-[11px] text-[var(--text)] font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                        >
                          {copiedKey === 'Holder Name' ? <Check className="w-3 h-3 text-[var(--success)]" /> : <Copy className="w-3 h-3" />}
                          <span className={copiedKey === 'Holder Name' ? 'text-[var(--success)] font-bold' : ''}>
                            {copiedKey === 'Holder Name' ? 'Copied' : 'Copy'}
                          </span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between py-1.5 border-b border-[var(--border)]">
                        <div>
                          <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">IBAN</span>
                          <span className="num text-xs font-bold text-[var(--text)]">{destinations.bank.iban}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(destinations.bank.iban, 'IBAN')}
                          className="px-2.5 py-1 rounded bg-[var(--surface)] hover:bg-[var(--surface-raised)] border border-[var(--border)] text-[11px] text-[var(--text)] font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                        >
                          {copiedKey === 'IBAN' ? <Check className="w-3 h-3 text-[var(--success)]" /> : <Copy className="w-3 h-3" />}
                          <span className={copiedKey === 'IBAN' ? 'text-[var(--success)] font-bold' : ''}>
                            {copiedKey === 'IBAN' ? 'Copied' : 'Copy'}
                          </span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between py-1.5">
                        <div>
                          <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">Account Number</span>
                          <span className="num text-xs font-bold text-[var(--text)]">{destinations.bank.accountNumber}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(destinations.bank.accountNumber, 'Account')}
                          className="px-2.5 py-1 rounded bg-[var(--surface)] hover:bg-[var(--surface-raised)] border border-[var(--border)] text-[11px] text-[var(--text)] font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                        >
                          {copiedKey === 'Account' ? <Check className="w-3 h-3 text-[var(--success)]" /> : <Copy className="w-3 h-3" />}
                          <span className={copiedKey === 'Account' ? 'text-[var(--success)] font-bold' : ''}>
                            {copiedKey === 'Account' ? 'Copied' : 'Copy'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Step 2: After payment, send receipt */}
            <section className="pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h3 className="font-heading font-bold text-base sm:text-lg text-[var(--text)] mb-1">
                  After you've paid, send your receipt.
                </h3>
                <p className="text-xs text-[var(--sub)] max-w-[480px] leading-relaxed">
                  WhatsApp will open with your plan details prefilled. Attach your transfer screenshot to the conversation for fast review.
                </p>
              </div>

              <button
                type="button"
                onClick={handleContinueWhatsApp}
                className="w-full sm:w-auto h-12 px-6 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-[var(--brand-text)] font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] shrink-0"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Continue to WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </section>

            {/* Fineprint Manual Verification Warning */}
            <div className="pt-5 border-t border-dashed border-[var(--border)] flex items-start gap-3 text-xs text-[var(--sub)] leading-relaxed">
              <ShieldAlert className="w-4 h-4 text-[var(--brand)] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[var(--text)]">Manual verification:</strong> Sending a receipt does not activate your subscription immediately. Access begins only after your payment is reviewed and approved by the Xtrinox support team.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] text-xs shadow-2xl animate-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
