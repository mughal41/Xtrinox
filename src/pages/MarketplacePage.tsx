import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarketplaceStore } from '../state/useMarketplaceStore';
import { useSubscriptionStore } from '../state/useSubscriptionStore';
import { MarketplaceTool } from '../firebase/schema';
import { PagePreloader } from '../components/PagePreloader';

const ToolCard: React.FC<{ tool: MarketplaceTool }> = ({ tool }) => {
  const navigate = useNavigate();
  const isSubscribed = useSubscriptionStore((state) => state.isSubscribed(tool.id));

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSubscribed) {
      navigate('/workspace');
    } else {
      navigate(`/checkout/${tool.id}`);
    }
  };

  return (
    <div 
      onClick={() => navigate(`/marketplace/${tool.id}`)}
      className="bg-surface rounded-xl border border-surface-container-highest overflow-hidden hover:shadow-lg transition-all group flex flex-col cursor-pointer"
    >
      <div className="h-32 bg-surface-container-high relative overflow-hidden">
        {(tool.imageUrl || tool.bannerUrl) ? (
          <img 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            src={tool.imageUrl || tool.bannerUrl} 
            alt={tool.name} 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
             <span className="material-symbols-outlined text-slate-300 text-4xl">image</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <button className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center text-on-surface-variant hover:text-rose-500 transition-colors">
            <span className="material-symbols-outlined text-[18px]">favorite</span>
          </button>
        </div>
      </div>
      <div className="p-md flex flex-col flex-grow">
        <div className="flex gap-sm mb-xs">
          <span className="text-label-sm text-primary font-bold uppercase">{tool.category}</span>
        </div>
        <h4 className="font-h2 text-h2 mb-xs">{tool.name}</h4>
        <p className="text-body-md text-on-surface-variant line-clamp-2 mb-md flex-grow">{tool.description}</p>
        <div className="flex items-center justify-between pt-sm border-t border-surface-container-low">
          <span className="text-h3 font-h3">{tool.monthlyPrice}</span>
          <button 
            onClick={handleAction}
            className={`${
              isSubscribed 
                ? "bg-emerald-500 text-white" 
                : "bg-primary text-on-primary"
            } px-md py-2 rounded-lg font-label-md text-label-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1`}
          >
            {isSubscribed ? (
              <>
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Subscribed
              </>
            ) : (
              'Subscribe'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── FAQ Accordion Item ─────────────────────────────────── */
const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-outline-variant/30">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left transition-colors hover:bg-surface-container-low py-4 px-1 gap-4"
        aria-expanded={open}
      >
        <h3 className="text-on-surface font-semibold text-sm md:text-base">{q}</h3>
        <span
          className="material-symbols-outlined text-on-surface-variant shrink-0 transition-transform duration-300 text-[22px]"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          expand_more
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[500px] opacity-100 pb-4' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-on-surface-variant text-sm md:text-base leading-relaxed px-1">{a}</p>
      </div>
    </div>
  );
};

/* ── SEO Content Section ───────────────────────────────── */
const SeoContentSection: React.FC = () => (
  <section className="mt-8 pt-8 border-t border-outline-variant" style={{ marginTop: '64px', paddingTop: '48px' }}>
    {/* Trust Bar */}
    <div className="flex flex-wrap justify-center gap-6 mb-8 opacity-60" style={{ marginBottom: '48px' }}>
      {[
        { icon: 'verified_user', label: 'Enterprise-Grade Security' },
        { icon: 'speed', label: 'Instant Activation' },
        { icon: 'support_agent', label: '24/7 Priority Support' },
        { icon: 'cloud_done', label: 'Cloud-Managed Access' },
      ].map(b => (
        <div key={b.label} className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{b.icon}</span>
          <span className="text-on-surface-variant font-medium" style={{ fontSize: '13px' }}>{b.label}</span>
        </div>
      ))}
    </div>

    {/* Main SEO Heading Block */}
    <div className="max-w-4xl mx-auto mb-12">
      <h2 className="text-on-surface font-bold text-2xl md:text-3xl lg:text-4xl leading-tight mb-6">
        The Smarter Way to Access Premium AI Tools
      </h2>
      <p className="text-on-surface-variant leading-relaxed text-sm md:text-base mb-4">
        Xtrinox is a managed AI marketplace built for professionals, creators, and teams who need reliable, 
        always-on access to the world's leading AI platforms — without the complexity of managing individual 
        licenses, billing cycles, or enterprise contracts. We handle the infrastructure so you can focus on 
        what matters: getting work done.
      </p>
      <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
        Whether you're a content strategist leveraging conversational AI for research, a developer using 
        code-generation assistants, or a creative professional exploring image synthesis and audio 
        production tools — Xtrinox gives you a single, unified dashboard to subscribe, launch, and 
        manage every tool in your workflow.
      </p>
    </div>

    {/* Feature Pillars (3-col) */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
      {[
        {
          icon: 'rocket_launch',
          title: 'One-Click Activation',
          body: 'Subscribe to any premium AI tool and start using it instantly through our secure workspace. No setup guides, no API keys — just seamless access from your browser.',
        },
        {
          icon: 'shield_lock',
          title: 'Secure Managed Sessions',
          body: 'Every session runs through Xtrinox Bridge, our enterprise-grade browser extension that provides encrypted workspace connectivity, session isolation, and real-time monitoring.',
        },
        {
          icon: 'savings',
          title: 'Flexible Plans, Zero Lock-in',
          body: 'Access professional-tier AI capabilities at a fraction of individual licensing costs. Cancel anytime — no annual commitments, no hidden fees, no surprises.',
        },
      ].map(f => (
        <div key={f.title} className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/20">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
            <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
          </div>
          <h3 className="text-on-surface font-semibold text-lg mb-2">{f.title}</h3>
          <p className="text-on-surface-variant text-sm leading-relaxed">{f.body}</p>
        </div>
      ))}
    </div>

    {/* How It Works */}
    <div className="max-w-4xl mx-auto mb-12">
      <h2 className="text-on-surface font-bold text-xl md:text-2xl leading-tight mb-6">
        How Xtrinox Works
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { step: '01', title: 'Browse & Choose', desc: 'Explore our curated catalog of verified AI tools across writing, coding, image generation, and more.' },
          { step: '02', title: 'Subscribe Instantly', desc: 'Pick a plan that fits your workflow. Activation is immediate — no approval queues or waiting periods.' },
          { step: '03', title: 'Connect Workspace', desc: 'Install Xtrinox Bridge to securely link your browser. It takes under 30 seconds.' },
          { step: '04', title: 'Launch & Create', desc: 'Open any subscribed tool directly from your workspace dashboard. Session security is handled automatically.' },
        ].map(s => (
          <div key={s.step} className="text-center p-4">
            <div className="text-primary font-extrabold text-4xl mb-2 opacity-30 tracking-tight">{s.step}</div>
            <h4 className="text-on-surface font-semibold text-sm mb-1">{s.title}</h4>
            <p className="text-on-surface-variant text-xs leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Use-case driven SEO paragraphs */}
    <div className="max-w-4xl mx-auto" style={{ marginBottom: '48px' }}>
      <h2 className="text-on-surface font-bold" style={{ fontSize: '22px', lineHeight: '1.3', marginBottom: '20px' }}>
        Built for Every Creative & Professional Workflow
      </h2>
      <div className="space-y-4">
        <p className="text-on-surface-variant" style={{ fontSize: '14px', lineHeight: '1.7' }}>
          <strong className="text-on-surface">For Writers & Content Creators:</strong> Access 
          premium conversational AI and long-form writing assistants to draft articles, brainstorm ideas, 
          refine copy, and produce publication-ready content at scale. Xtrinox ensures your creative 
          environment is always available, always fast, and always private.
        </p>
        <p className="text-on-surface-variant" style={{ fontSize: '14px', lineHeight: '1.7' }}>
          <strong className="text-on-surface">For Developers & Engineers:</strong> Leverage 
          intelligent code completion, debugging assistants, and documentation generators through a 
          managed workspace. Integrate AI into your development pipeline without juggling separate 
          subscriptions or worrying about rate limits.
        </p>
        <p className="text-on-surface-variant" style={{ fontSize: '14px', lineHeight: '1.7' }}>
          <strong className="text-on-surface">For Teams & Small Businesses:</strong> Provide your 
          team with unified access to a suite of AI-powered productivity tools — from meeting 
          summarizers to presentation builders — managed under a single billing dashboard. No 
          per-seat surprises, no complex license management.
        </p>
        <p className="text-on-surface-variant" style={{ fontSize: '14px', lineHeight: '1.7' }}>
          <strong className="text-on-surface">For Researchers & Analysts:</strong> Run complex 
          queries, analyze datasets, and synthesize findings using the most advanced language models 
          available. Xtrinox handles provisioning so you can focus on discovery and insight.
        </p>
      </div>
    </div>

    {/* FAQ (SEO-rich) */}
    <div className="max-w-4xl mx-auto" style={{ marginBottom: '48px' }}>
      <h2 className="text-on-surface font-bold" style={{ fontSize: '22px', lineHeight: '1.3', marginBottom: '24px' }}>
        Frequently Asked Questions
      </h2>
      <div>
        <FaqItem q="What is Xtrinox?" a="Xtrinox is a managed AI marketplace that gives professionals instant, secure access to premium AI tools — including conversational AI, code assistants, image generators, and audio production platforms — through a single subscription dashboard." />
        <FaqItem q="How is Xtrinox different from subscribing directly?" a="Xtrinox provides managed access with built-in session security, workspace integration, and unified billing. You get professional-grade AI capabilities at competitive pricing, with zero setup overhead and enterprise-level reliability." />
        <FaqItem q="Is my data secure?" a="Absolutely. All sessions run through Xtrinox Bridge, our encrypted browser extension that enforces session isolation, real-time integrity monitoring, and automatic credential rotation. Your work stays private by design." />
        <FaqItem q="Can I cancel anytime?" a="Yes. All Xtrinox plans are month-to-month with no cancellation fees. You retain full access until the end of your current billing period." />
        <FaqItem q="What tools are available on Xtrinox?" a="Our catalog includes curated AI tools across multiple categories: conversational AI assistants, code generation platforms, image synthesis tools, audio production suites, research accelerators, and marketing automation engines. New tools are added regularly based on user demand and quality verification." />
        <FaqItem q="Do I need to install anything?" a="You'll need the Xtrinox Bridge browser extension (available for all Chromium-based browsers). It installs in seconds and provides the secure connectivity layer between your browser and the AI tools in your workspace." />
      </div>
    </div>

    {/* Bottom CTA */}
    <div className="text-center max-w-2xl mx-auto" style={{ paddingTop: '24px', paddingBottom: '48px' }}>
      <h2 className="text-on-surface font-bold" style={{ fontSize: '24px', lineHeight: '1.3', marginBottom: '12px' }}>
        Start Building with AI Today
      </h2>
      <p className="text-on-surface-variant" style={{ fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
        Join thousands of professionals who use Xtrinox to access, manage, and deploy 
        premium AI tools — all from one secure workspace.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <a href="#" className="bg-primary text-on-primary font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all inline-flex items-center gap-2" style={{ padding: '14px 32px', fontSize: '15px' }}>
          <span className="material-symbols-outlined text-[20px]">explore</span>
          Explore Marketplace
        </a>
        <a href="#" className="bg-surface border border-outline-variant text-on-surface font-semibold rounded-xl hover:bg-surface-container-low transition-all inline-flex items-center gap-2" style={{ padding: '14px 32px', fontSize: '15px' }}>
          <span className="material-symbols-outlined text-[20px]">play_circle</span>
          How It Works
        </a>
      </div>
    </div>
  </section>
);

export const MarketplacePage: React.FC = () => {
  const { tools, loading, fetchTools } = useMarketplaceStore();
  const subsLoading = useSubscriptionStore((state) => state.loading);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  // Show preloader until BOTH tools and subscriptions are ready
  if (loading || subsLoading) return <PagePreloader message="Synchronizing marketplace inventory..." />;

  // Derive unique categories from actual Firestore tool data
  const uniqueCategories = Array.from(new Set(tools.map(t => t.category).filter(Boolean)));
  const categories = ['All', ...uniqueCategories];

  // Filter tools by selected category
  const filteredTools = activeCategory === 'All'
    ? tools
    : tools.filter(t => t.category === activeCategory);

  return (
    <div className="space-y-xxl">
      {/* Hero Section */}
      <section className="text-center py-xl">
        <h1 className="font-display text-display text-on-surface mb-md">Precision AI Marketplace</h1>
        <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-xl">
          Access high-grade reliability and professional competence with Xtrinox's world-class catalog of curated AI technology.
        </p>
        
        {/* Category Chips — dynamic from Firestore */}
        <div className="flex flex-wrap justify-center gap-sm">
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={
                activeCategory === cat
                  ? "bg-primary-container text-on-primary-container px-md py-2 rounded-lg font-label-md text-label-md transition-all shadow-sm"
                  : "bg-surface-container-high text-on-surface-variant px-md py-2 rounded-lg font-label-md text-label-md hover:bg-surface-container-highest transition-all"
              }
            >
              {cat}
              {cat !== 'All' && (
                <span className="ml-1 opacity-60">
                  ({tools.filter(t => t.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Excellence */}
      <section>
        <div className="flex justify-between items-end mb-lg">
          <div>
            <h2 className="font-h1 text-h1 text-on-surface">Featured Excellence</h2>
            <p className="text-body-md text-on-surface-variant">
              {activeCategory === 'All' 
                ? 'Top-tier tools verified for enterprise deployment.' 
                : `Showing ${filteredTools.length} tool${filteredTools.length !== 1 ? 's' : ''} in ${activeCategory}`}
            </p>
          </div>
          {activeCategory !== 'All' && (
            <button 
              onClick={() => setActiveCategory('All')}
              className="text-primary font-bold flex items-center gap-xs hover:gap-sm transition-all"
            >
              Clear Filter <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
          {filteredTools.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
        {filteredTools.length === 0 && (
          <div className="text-center py-xl">
            <span className="material-symbols-outlined text-on-surface-variant text-[48px] opacity-30" style={{ marginBottom: '12px', display: 'block' }}>search_off</span>
            <p className="text-on-surface-variant font-medium" style={{ fontSize: '15px' }}>No tools found in "{activeCategory}"</p>
            <button onClick={() => setActiveCategory('All')} className="text-primary font-semibold mt-2" style={{ fontSize: '14px' }}>
              View all tools →
            </button>
          </div>
        )}
      </section>

      {/* Trending Bento Grid — hidden for now */}
      {/* <section>
        <h2 className="font-h1 text-h1 text-on-surface mb-lg">Trending Now</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
          <div className="md:col-span-2 md:row-span-2 bg-slate-900 text-white rounded-xl p-xl flex flex-col justify-between overflow-hidden relative shadow-xl">
            <div className="z-10">
              <span className="bg-primary text-on-primary px-sm py-1 rounded-full text-label-sm mb-md inline-block">HOT RELEASE</span>
              <h3 className="font-display text-[28px] leading-tight mb-md">OmniAudio 2.0</h3>
              <p className="text-body-lg text-slate-300 max-w-xs mb-lg">Studio-quality voice cloning and audio restoration for podcasters and broadcasters.</p>
              <button className="bg-white text-slate-950 px-lg py-3 rounded-lg font-bold shadow-xl hover:bg-primary hover:text-white transition-all">Get Unlimited Access</button>
            </div>
            <div className="absolute -right-20 -bottom-20 opacity-20 transform rotate-12">
              <span className="material-symbols-outlined text-[240px]">graphic_eq</span>
            </div>
          </div>
          
          {[1,2,3,4].map(i => (
             <div key={i} className="bg-surface rounded-xl border border-surface-container-highest p-md flex gap-md items-center hover:bg-surface-container-low transition-colors cursor-pointer">
               <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
                 <span className="material-symbols-outlined text-primary">analytics</span>
               </div>
               <div>
                 <h4 className="font-h3 text-h3">DataSage {i}</h4>
                 <p className="text-label-md text-on-surface-variant">$19/mo • Analytics</p>
               </div>
             </div>
          ))}
        </div>
      </section> */}

      {/* SEO Content Section */}
      <SeoContentSection />
    </div>
  );
};
