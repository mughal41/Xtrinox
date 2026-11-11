import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { MarketplaceTool } from '../firebase/schema';
import { useSubscriptionStore } from '../state/useSubscriptionStore';
import { PagePreloader } from '../components/PagePreloader';
import {
  ArrowLeft,
  BookOpenCheck,
  Code,
  Download,
  FileText,
  GraduationCap,
  LucideIcon,
  MessageCircle,
  Newspaper,
  PenTool,
  Quote,
  Repeat2,
  Rocket,
  ScanText,
  SearchCheck,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Smartphone,
  SpellCheck,
  Workflow,
} from 'lucide-react';
import { getSeoProductById, mergeSeoProductWithFirestoreTool } from '../data/seoProducts.mjs';
import { getLocalizedPrice, getUserTimezone, parseUsdPrice } from '../utils/pricing';
import { ModernModal } from '../components/ModernModal';

import ReactMarkdown from 'react-markdown';

type ProductFeature = {
  icon: string;
  title: string;
  desc: string;
};

type ProductDetailData = MarketplaceTool & {
  featureHighlights?: ProductFeature[];
};

const FEATURE_ICONS: Record<string, LucideIcon> = {
  'book-open-check': BookOpenCheck,
  code: Code,
  'file-text': FileText,
  'graduation-cap': GraduationCap,
  'message-circle': MessageCircle,
  newspaper: Newspaper,
  'pen-tool': PenTool,
  quote: Quote,
  'repeat-2': Repeat2,
  'scan-text': ScanText,
  'search-check': SearchCheck,
  'shield-check': ShieldCheck,
  sparkles: Sparkles,
  'spell-check': SpellCheck,
  workflow: Workflow,
};

const mergeProductData = (id: string, firestoreData?: Partial<ProductDetailData>) => {
  return mergeSeoProductWithFirestoreTool({ id, ...firestoreData }) as ProductDetailData;
};

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [productData, setProductData] = useState<ProductDetailData | null>(null);
  const [isProductLoading, setIsProductLoading] = useState(true);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  const [isAndroidModalMinimized, setIsAndroidModalMinimized] = useState(false);
  const timezone = useMemo(getUserTimezone, []);
  
  // Check if user has an active subscription to this product
  const hasActiveSubscription = useSubscriptionStore((state) => state.isSubscribed(id || ''));
  const usdPrice = useMemo(() => parseUsdPrice(productData?.monthlyPrice), [productData?.monthlyPrice]);
  const localizedPrice = useMemo(() => getLocalizedPrice(usdPrice, timezone), [timezone, usdPrice]);

  useEffect(() => {
    const fetchTool = async () => {
      if (!id) {
        setIsProductLoading(false);
        return;
      }

      try {
        const docSnap = await getDoc(doc(db, 'marketplace_tools', id));
        if (docSnap.exists()) {
          setProductData(mergeProductData(docSnap.id, docSnap.data() as Partial<ProductDetailData>));
        } else {
          setProductData(mergeProductData(id));
        }
      } catch (err) {
        setProductData(mergeProductData(id));
      } finally {
        setIsProductLoading(false);
      }
    };
    fetchTool();
  }, [id]);

  useEffect(() => {
    if (id === 'chatgpt-premium' && searchParams.get('androidApp') === '1') {
      setIsAndroidModalOpen(true);
      setIsAndroidModalMinimized(false);
    }
  }, [id, searchParams]);

  if (isProductLoading) return <PagePreloader message="Fetching product specifications..." />;
  if (!productData) return <div className="p-20 text-center font-bold text-rose-500 uppercase tracking-widest">Specification Not Found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-700">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-start">
        <div className="space-y-8">
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-200 group">
             {(productData.imageUrl || productData.bannerUrl) ? (
               <img src={productData.imageUrl || productData.bannerUrl} alt={productData.name} className="w-full h-full object-contain p-6 bg-white group-hover:scale-[1.02] transition-transform duration-700" />
             ) : (
               <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                 <span className="material-symbols-outlined text-[120px] text-slate-200">robot_2</span>
               </div>
             )}
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {(productData.featureHighlights || []).map((feature) => (
              <FeatureItem key={feature.title} feature={feature} />
            ))}
          </div>
        </div>

        <div className="self-start">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/5 overflow-hidden">
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    {productData.category}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Available Now
                  </span>
                </div>
                <div className="space-y-3">
                  <h1 className="text-4xl lg:text-5xl font-display font-bold text-slate-900 leading-tight">{productData.name}</h1>
                  <p className="text-slate-500 text-base lg:text-lg leading-relaxed">{productData.description}</p>
                </div>
              </div>

              <div className="border-y border-slate-100 py-5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Professional License</p>
                <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
                  <span className="text-4xl font-bold text-slate-900">{localizedPrice.display}</span>
                  <span className="text-slate-400 font-medium pb-1">/month</span>
                </div>
                {localizedPrice.isConverted && (
                  <p className="text-xs text-slate-400 mt-2">Base price: {localizedPrice.baseUsdDisplay}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-500">
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                  <span className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1">Access</span>
                  Managed Workspace
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                  <span className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1">Verification</span>
                  Manual Review
                </div>
              </div>

              <button
                onClick={() => navigate(hasActiveSubscription ? '/workspace' : `/checkout/${productData.id}`)}
                className={`w-full ${
                  hasActiveSubscription
                    ? "bg-emerald-600 shadow-emerald-900/20"
                    : "bg-primary shadow-primary/20"
                } text-white py-4 rounded-xl font-bold text-base shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3`}
              >
                {hasActiveSubscription ? (
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

              {productData.id === 'chatgpt-premium' && (
                <button
                  onClick={() => {
                    setIsAndroidModalOpen(true);
                    setIsAndroidModalMinimized(false);
                  }}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-primary bg-primary-fixed/50 py-3.5 text-sm font-bold text-primary transition-all hover:bg-primary-fixed active:scale-[0.98]"
                >
                  <Smartphone className="h-5 w-5" />
                  Get Xtrinox for Android
                </button>
              )}

              <p className="text-center text-[11px] text-slate-400">
                {hasActiveSubscription
                  ? "Your subscription is active. Access the tool in your workspace."
                  : "Monthly access with manual payment confirmation and support."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Content Section */}
      {productData.seoContent && (
        <section className="pt-12 border-t border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">About {productData.name}</h2>
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
            <ReactMarkdown>{productData.seoContent}</ReactMarkdown>
          </div>
        </section>
      )}

      <ModernModal
        isOpen={isAndroidModalOpen && !isAndroidModalMinimized}
        onClose={() => setIsAndroidModalOpen(false)}
        onMinimize={() => setIsAndroidModalMinimized(true)}
        maxWidth="max-w-[520px]"
      >
        <div className="p-8 sm:p-10">
          <div className="mb-6 flex items-start gap-4 pr-16">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
              <span className="material-symbols-outlined text-[30px]">android</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary">Official Android app</span>
              <h2 className="mt-1 text-2xl font-bold text-on-surface">Xtrinox for Android</h2>
              <p className="mt-1 text-sm leading-5 text-on-surface-variant">A focused mobile workspace for your entitled ChatGPT access.</p>
            </div>
          </div>

          <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low">
            <div className="p-4 text-center">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-outline">Version</span>
              <span className="mt-1 block text-sm font-bold text-on-surface">1.0.2</span>
            </div>
            <div className="border-x border-outline-variant p-4 text-center">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-outline">Size</span>
              <span className="mt-1 block text-sm font-bold text-on-surface">3.00 MB</span>
            </div>
            <div className="p-4 text-center">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-outline">Requires</span>
              <span className="mt-1 block text-sm font-bold text-on-surface">Android 7+</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {[
              'Launch your entitled workspace from the Xtrinox app.',
              'Signed production release with secure Firebase authentication.',
              'Lightweight installation with optimized session handling.'
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm leading-5 text-on-surface-variant">
                <span className="material-symbols-outlined mt-0.5 text-[18px] text-primary">check_circle</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <a
            href={`${import.meta.env.BASE_URL}downloads/Xtrinox-v1.0.2-release.apk`}
            download
            className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 font-semibold text-on-primary shadow-md transition-all hover:bg-primary-container active:scale-[0.98]"
          >
            <Download className="h-5 w-5" />
            Download APK
          </a>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-medium text-outline">
            <ShieldCheck className="h-4 w-4" />
            Signed release • Updated 11 November 2026
          </div>
        </div>
      </ModernModal>

      {isAndroidModalOpen && isAndroidModalMinimized && (
        <button
          onClick={() => setIsAndroidModalMinimized(false)}
          className="fixed bottom-5 right-5 z-[9998] flex items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-left shadow-xl transition-all hover:-translate-y-0.5 hover:border-primary"
          aria-label="Restore Android app download dialog"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-fixed text-primary">
            <span className="material-symbols-outlined text-[20px]">android</span>
          </span>
          <span className="flex flex-col">
            <span className="text-[12px] font-bold text-on-surface">Xtrinox for Android</span>
            <span className="text-[10px] font-medium text-on-surface-variant">Tap to restore download</span>
          </span>
          <span className="material-symbols-outlined text-[18px] text-primary">open_in_full</span>
        </button>
      )}
    </div>
  );
};

const FeatureItem: React.FC<{ feature: ProductFeature }> = ({ feature }) => {
  const Icon = FEATURE_ICONS[feature.icon] || Sparkles;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all min-h-[150px]">
      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
        <Icon className="w-5 h-5" />
      </div>
      <h4 className="font-bold text-slate-900 text-sm mb-1">{feature.title}</h4>
      <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
    </div>
  );
};
