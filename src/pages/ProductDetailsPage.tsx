import React, { useState, useMemo } from 'react';
import { Product, RouteName } from '../types';
import { PRODUCTS, PAYMENT_DESTINATIONS } from '../data/products';
import { useMarketplaceStore } from '../state/useMarketplaceStore';
import { useSubscriptionStore } from '../state/useSubscriptionStore';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronDown,
  ExternalLink,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { ProductAvatar } from '../components/ProductIcon';

interface ProductDetailsPageProps {
  productId?: string;
  onNavigate: (route: RouteName, param?: string) => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  productId = 'chatgpt',
  onNavigate
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const { getToolById } = useMarketplaceStore();
  const { isSubscribed: checkSubscribed } = useSubscriptionStore();

  // Find product by slug or id, fallback to first product
  const baseProduct: Product =
    PRODUCTS.find((p) => p.slug === productId || p.id === productId) ||
    PRODUCTS.find((p) => p.slug === 'chatgpt') ||
    PRODUCTS[0];

  const marketplaceTool =
    getToolById(productId) ||
    getToolById(baseProduct.slug) ||
    getToolById(baseProduct.id);

  const product: Product = {
    ...baseProduct,
    pricePkr: marketplaceTool?.pricing?.monthly || baseProduct.pricePkr,
    priceFormatted: marketplaceTool?.pricing?.monthly
      ? `Rs ${marketplaceTool.pricing.monthly.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`
      : baseProduct.priceFormatted
  };

  const isSubscribed =
    checkSubscribed(productId) ||
    checkSubscribed(product.slug) ||
    checkSubscribed(product.id);

  const whatsappInquiryUrl = useMemo(() => {
    const cleanNumber = PAYMENT_DESTINATIONS.whatsappNumber.replace(/\D/g, '');
    const message = `Hello Xtrinox Support, I have a question about ${product.name} (${product.priceFormatted} / 30 days). Can you assist me?`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  }, [product.name, product.priceFormatted]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] pb-20 transition-colors">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between text-xs">
          <button
            onClick={() => onNavigate('marketplace')}
            className="inline-flex items-center gap-2 text-[var(--sub)] hover:text-[var(--text)] transition-colors font-semibold group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Marketplace</span>
          </button>
          <span className="text-[var(--muted)] capitalize">
            Marketplace / {product.categoryLabel} / {product.name}
          </span>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-8">
        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (8 cols): Clean, focused product information */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Clean Hero Card */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-xs">
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0B0B0C] px-2.5 py-0.5 rounded-full bg-[#B6FF2E] border border-[#0B0B0C]/10">
                  {product.categoryLabel}
                </span>
                <span className="text-xs text-[var(--sub)] flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[var(--muted)]" />
                  <span>30-day billing cycle</span>
                </span>
              </div>

              <div className="flex items-start gap-5">
                <ProductAvatar
                  productId={product.slug || product.id}
                  size="2xl"
                  brandColored={false}
                  containerClassName="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-[var(--border)] shadow-xs p-3 text-[#0B0B0C]"
                />
                <div>
                  <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[var(--text)] tracking-tight">
                    {product.name}
                  </h1>
                  <p className="text-sm text-[var(--sub)] mt-1.5 leading-relaxed max-w-2xl">
                    {product.shortDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* Core Features Included */}
            <section
              aria-labelledby="features-heading"
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xs"
            >
              <h2
                id="features-heading"
                className="font-heading font-bold text-base text-[var(--text)] mb-4 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#0B0B0C]" />
                <span>Core features included</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {product.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-[var(--sub)] leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-[#0B7E3F] shrink-0 mt-0.5" />
                    <span className="font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Capabilities & Workflows */}
            <section aria-labelledby="capabilities-heading" className="space-y-3.5">
              <h2
                id="capabilities-heading"
                className="font-heading font-bold text-base text-[var(--text)]"
              >
                Capabilities & Workflows
              </h2>
              <div
                className={`grid grid-cols-1 ${
                  product.capabilities.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'
                } gap-4`}
              >
                {product.capabilities.map((cap, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-7 h-7 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text)] flex items-center justify-center font-mono font-bold text-xs mb-3">
                        0{idx + 1}
                      </div>
                      <h3 className="font-heading font-bold text-xs sm:text-sm text-[var(--text)] mb-1.5">
                        {cap.title}
                      </h3>
                      <p className="text-xs text-[var(--sub)] leading-relaxed">
                        {cap.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* About this subscription */}
            <section
              aria-labelledby="overview-heading"
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)]/70 p-6 space-y-3"
            >
              <h2 id="overview-heading" className="font-heading font-bold text-base text-[var(--text)]">
                About this subscription
              </h2>
              <p className="text-xs sm:text-sm text-[var(--sub)] leading-relaxed">
                {product.fullDescription}
              </p>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                When you activate {product.name} through Xtrinox, you receive authenticated workspace access managed via the official Xtrinox Bridge browser extension. There are no recurring auto-renewing credit card charges; access is renewed manually each billing period.
              </p>
            </section>

            {/* Product Questions & FAQs */}
            <section aria-labelledby="product-faqs-heading" className="space-y-3">
              <h2
                id="product-faqs-heading"
                className="font-heading font-bold text-base text-[var(--text)]"
              >
                Frequently asked questions
              </h2>
              <div className="space-y-2">
                {product.faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-2xs"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                      className="w-full px-5 py-3.5 flex items-center justify-between text-left text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-raised)] transition-colors cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-[var(--muted)] transition-transform duration-200 ${
                          activeFaq === idx ? 'rotate-180 text-[var(--text)]' : ''
                        }`}
                      />
                    </button>
                    {activeFaq === idx && (
                      <div className="px-5 pb-4 text-xs text-[var(--sub)] border-t border-[var(--border)] pt-2.5 leading-relaxed bg-[var(--surface-raised)]/40 xt-accordion-content">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column (4 cols): Clean, Unified Sticky License Card */}
          <div className="lg:col-span-4 sticky top-20 space-y-4">
            <div className="rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] p-6 shadow-md space-y-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] block mb-1">
                  Subscription Plan
                </span>
                <h3 className="font-heading font-extrabold text-xl text-[var(--text)]">
                  Professional License
                </h3>
                <p className="text-xs text-[var(--sub)] mt-0.5">
                  Full feature tier · 30-day managed access
                </p>
              </div>

              {/* Price Block */}
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]">
                <span className="text-[11px] text-[var(--muted)] font-medium block">
                  Total payment
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="num font-heading font-extrabold text-2xl text-[var(--text)]">
                    {product.priceFormatted}
                  </span>
                  <span className="text-xs text-[var(--muted)]">/ 30 days</span>
                </div>
                <span className="num text-[11px] text-[var(--muted)] block mt-1">
                  Base reference: {product.basePriceUsd} USD
                </span>
              </div>

              {/* Plan Inclusions Checklist */}
              <div className="space-y-2.5 text-xs text-[var(--sub)] py-1">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0B7E3F] shrink-0" />
                  <span>30-day continuous managed access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0B7E3F] shrink-0" />
                  <span>1-click Xtrinox Bridge extension handoff</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0B7E3F] shrink-0" />
                  <span>Multi-device session authorization</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0B7E3F] shrink-0" />
                  <span>Manual renewal · No auto-debit surprises</span>
                </div>
              </div>

              {/* Action Button */}
              {isSubscribed ? (
                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-[#0B7E3F]/10 border border-[#0B7E3F]/20 text-[#0B7E3F] text-xs font-semibold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0B7E3F] shrink-0" />
                    <span>Active in your workspace</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('workspace')}
                    className="w-full h-11 rounded-xl bg-[#0B0B0C] hover:bg-[#1F2024] text-[#F3F2EE] text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Launch in Workspace</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate('checkout', product.slug)}
                  className="w-full h-11 rounded-xl bg-[#0B0B0C] hover:bg-[#1F2024] text-[#F3F2EE] text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer group"
                >
                  <span>Subscribe now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}

              {/* Direct WhatsApp Help */}
              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-9 rounded-lg border border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--surface-raised)] text-[var(--sub)] hover:text-[var(--text)] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#0B7E3F]" />
                <span>Questions? Ask on WhatsApp</span>
              </a>

              {/* Verification Terms */}
              <div className="pt-4 border-t border-[var(--border)] flex items-start gap-2.5 text-[11px] text-[var(--sub)] leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-[#0B7E3F] shrink-0 mt-0.5" />
                <span>
                  <strong>Manual verification:</strong> Transfer is submitted via JazzCash or Bank transfer and proof is confirmed via WhatsApp before access is granted.
                </span>
              </div>
            </div>

            {/* Accepted Payment Methods & Fast Activation Card */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-heading font-bold text-[var(--text)]">Accepted Payment Methods</span>
                <span className="text-[10px] font-semibold text-[#0B7E3F] bg-[#0B7E3F]/10 border border-[#0B7E3F]/20 px-2 py-0.5 rounded-full">
                  Direct PK Transfer
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1.5 text-[11px] font-medium text-[var(--sub)]">
                <span className="px-2.5 py-1 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)]">JazzCash</span>
                <span className="px-2.5 py-1 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)]">Easypaisa</span>
                <span className="px-2.5 py-1 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)]">Bank Transfer / Raast</span>
                <span className="px-2.5 py-1 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)]">Nayapay / Sadapay</span>
              </div>

              <p className="text-[11px] text-[var(--muted)] leading-relaxed pt-2 border-t border-[var(--border)]">
                Transfer payment, send receipt on WhatsApp, and your session is activated in your workspace within minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
