import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product, RouteName } from '../types';
import { PRODUCTS } from '../data/products';
import { useMarketplaceStore } from '../state/useMarketplaceStore';
import { useSubscriptionStore } from '../state/useSubscriptionStore';
import {
  Search,
  Sparkles,
  PenTool,
  FlaskConical,
  Layers,
  ChevronDown,
  Check,
  ArrowRight,
  Monitor,
  Shield,
  Headphones,
  ExternalLink,
  Code2,
  Users,
  X,
  Loader2
} from 'lucide-react';
import { BrandSpinner } from '../components/BrandSpinner';

interface MarketplacePageProps {
  onNavigate: (route: RouteName, param?: string) => void;
}

// Master Reference Cards Data (Hoisted outside component to prevent re-allocation per render)
const CARDS_DATA = [
  {
    slug: 'chatgpt',
    name: 'ChatGPT Premium',
    category: 'assistant',
    price: 5015.63,
    priceFormatted: 'Rs 5,015.63',
    basePrice: '$18.00 USD',
    order: 0,
    search: 'chatgpt premium writing analysis research productivity ai assistant coding',
    coverClass: 'cover-chatgpt',
    logoTileClass: 'openai',
    brandSymbolHref: '#brand-openai',
    title: (
      <>
        ChatGPT<br />Premium
      </>
    ),
    isSubscribed: true,
    description: 'Managed AI assistance for writing, analysis, research, and everyday productivity.',
    action: 'launch'
  },
  {
    slug: 'claude',
    name: 'Claude AI',
    category: 'assistant',
    price: 6966.15,
    priceFormatted: 'Rs 6,966.15',
    basePrice: '$25.00 USD',
    order: 1,
    search: 'claude ai assistant writing analysis reasoning problem solving coding',
    coverClass: 'cover-claude',
    logoTileClass: 'claude',
    brandSymbolHref: '#brand-claude',
    title: <>Claude AI</>,
    isSubscribed: false,
    description: 'AI assistance for writing, reasoning, analysis, and complex problem solving.',
    action: 'subscribe'
  },
  {
    slug: 'quillbot',
    name: 'QuillBot Pro',
    category: 'writing',
    price: 1950.52,
    priceFormatted: 'Rs 1,950.52',
    basePrice: '$7.00 USD',
    order: 2,
    search: 'quillbot pro writing grammar paraphrasing summarizing academic citation',
    coverClass: 'cover-quillbot',
    logoTileClass: 'quill',
    brandSymbolHref: '#brand-quill',
    title: (
      <>
        QuillBot<br />Pro
      </>
    ),
    isSubscribed: false,
    description: 'Paraphrasing, grammar review, summarization, and academic writing support.',
    action: 'subscribe'
  },
  {
    slug: 'stealth-writer',
    name: 'Stealth Writer',
    category: 'writing',
    price: 3343.75,
    priceFormatted: 'Rs 3,343.75',
    basePrice: '$12.00 USD',
    order: 3,
    search: 'stealth writer writing rewriting humanize tone refinement content',
    coverClass: 'cover-stealth',
    logoTileClass: 'stealth',
    brandSymbolHref: '#brand-stealth',
    title: (
      <>
        Stealth<br />Writer
      </>
    ),
    isSubscribed: false,
    description: 'Rewriting and tone refinement to help shape more natural-sounding content.',
    action: 'subscribe'
  },
  {
    slug: 'turnitin',
    name: 'Turnitin Instructor',
    category: 'research',
    price: 6966.15,
    priceFormatted: 'Rs 6,966.15',
    basePrice: '$25.00 USD',
    order: 4,
    search: 'turnitin instructor research academic integrity similarity reports plagiarism',
    coverClass: 'cover-turnitin',
    logoTileClass: 'turnitin',
    brandSymbolHref: '#brand-turnitin',
    title: (
      <>
        Turnitin<br />Instructor
      </>
    ),
    isSubscribed: false,
    description: 'Similarity reports, plagiarism checking, and academic integrity workflows.',
    action: 'subscribe'
  }
];

const CATEGORY_COUNTS = {
  all: CARDS_DATA.length,
  assistant: CARDS_DATA.filter((p) => p.category === 'assistant').length,
  writing: CARDS_DATA.filter((p) => p.category === 'writing').length,
  research: CARDS_DATA.filter((p) => p.category === 'research').length,
  productivity: 0
};

export const MarketplacePage: React.FC<MarketplacePageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'alpha'>('featured');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // Firestore & Real Subscription Bridge
  const { tools, fetchTools, loading: isMarketplaceLoading } = useMarketplaceStore();
  const { isSubscribed } = useSubscriptionStore();

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  // Dynamically map subscription status and Firestore pricing
  const cardsWithSubscription = useMemo(() => {
    return CARDS_DATA.map((card) => {
      const firestoreTool = tools.find(
        (t) => t.slug === card.slug || t.id === card.slug || t.name.toLowerCase() === card.name.toLowerCase()
      );
      const subscribed = isSubscribed(card.slug) || (firestoreTool ? isSubscribed(firestoreTool.id) : false);

      let price = card.price;
      let priceFormatted = card.priceFormatted;

      if (firestoreTool?.pricing?.monthly) {
        price = firestoreTool.pricing.monthly;
        priceFormatted = `Rs ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }

      return {
        ...card,
        price,
        priceFormatted,
        isSubscribed: subscribed,
        action: subscribed ? 'launch' : 'subscribe'
      };
    });
  }, [tools, isSubscribed]);

  // Close sort menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setSortMenuOpen(false);
      }
    };
    if (sortMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [sortMenuOpen]);

  // Detect OS for keyboard shortcut display
  const isMac = useMemo(() => {
    return typeof navigator !== 'undefined' && /(macintosh|mac os x)/i.test(navigator.userAgent);
  }, []);

  // Keyboard shortcut Cmd/Ctrl + K for search focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('marketplace-search');
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter & Sort based on CARDS_DATA
  const filteredProducts = useMemo(() => {
    let list = [...cardsWithSubscription];

    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.search.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'alpha') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      list.sort((a, b) => a.order - b.order);
    }

    return list;
  }, [cardsWithSubscription, searchQuery, selectedCategory, sortBy]);

  // Category counts
  const categoryCounts = useMemo(() => ({
    all: cardsWithSubscription.length,
    assistant: cardsWithSubscription.filter((p) => p.category === 'assistant').length,
    writing: cardsWithSubscription.filter((p) => p.category === 'writing').length,
    research: cardsWithSubscription.filter((p) => p.category === 'research').length,
    productivity: 0
  }), [cardsWithSubscription]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors">
      {/* 1. Hero Billboard */}
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--surface-raised)]">
        <div className="max-w-[1280px] mx-auto px-6 py-10 md:py-14 grid grid-cols-1 lg:grid-cols-12 items-center gap-10">
          {/* Left Hero Copy */}
          <div className="lg:col-span-7">
            <span className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-[var(--brand)] px-2.5 py-1 rounded-md bg-[var(--accent-badge-bg)] inline-block">
              THE AI TOOL MARKETPLACE
            </span>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-[-0.055em] leading-[1.08] mt-3 mb-4 text-[var(--text)]">
              Buy & Access <br />
              <span className="text-[var(--brand)]">Premium AI Tools</span>
            </h1>
            <p className="text-sm md:text-base text-[var(--sub)] max-w-[540px] leading-relaxed mb-6">
              Discover and subscribe to leading AI tools for writing, research, development, and productivity—managed in one place.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#catalog"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-[var(--brand-text)] font-bold text-xs shadow-md hover:shadow-lg transition-all"
              >
                <Layers className="w-4 h-4" />
                <span>Browse AI tools</span>
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] hover:bg-[var(--surface-deep)] text-[var(--text)] font-semibold text-xs transition-colors"
              >
                <span>How it works</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Qualifiers */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 mt-7 text-xs text-[var(--sub)] font-medium">
              <span className="inline-flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-[var(--brand)]" /> Managed workspace
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[var(--brand)]" /> Manual verification
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[var(--brand)]" /> Centralized access
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Headphones className="w-4 h-4 text-[var(--brand)]" /> Priority support
              </span>
            </div>
          </div>

          {/* Right Hero Stacked Deck Showcase */}
          <div className="lg:col-span-5 relative flex items-center justify-center py-6">
            <div className="hero-stack" role="region" aria-label="Featured AI tools deck">
              <div
                role="button"
                tabIndex={0}
                aria-label="View ChatGPT Premium details"
                className="stack-card card-0 card-chatgpt"
                onClick={() => onNavigate('product-details', 'chatgpt')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNavigate('product-details', 'chatgpt');
                  }
                }}
                title="ChatGPT Premium"
              >
                <svg className="brand-symbol" aria-hidden="true"><use href="#brand-openai"></use></svg>
              </div>

              <div
                role="button"
                tabIndex={0}
                aria-label="View Claude AI details"
                className="stack-card card-1 card-claude"
                onClick={() => onNavigate('product-details', 'claude')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNavigate('product-details', 'claude');
                  }
                }}
                title="Claude AI"
              >
                <svg className="claude-symbol" aria-hidden="true"><use href="#brand-claude"></use></svg>
              </div>

              <div
                role="button"
                tabIndex={0}
                aria-label="View QuillBot Pro details"
                className="stack-card card-2 card-quillbot"
                onClick={() => onNavigate('product-details', 'quillbot')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNavigate('product-details', 'quillbot');
                  }
                }}
                title="QuillBot Pro"
              >
                <svg className="quill-symbol" aria-hidden="true"><use href="#brand-quill"></use></svg>
              </div>

              <div
                role="button"
                tabIndex={0}
                aria-label="View Stealth Writer details"
                className="stack-card card-3 card-stealth"
                onClick={() => onNavigate('product-details', 'stealth-writer')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNavigate('product-details', 'stealth-writer');
                  }
                }}
                title="Stealth Writer"
              >
                <svg className="stealth-symbol" aria-hidden="true"><use href="#brand-stealth"></use></svg>
              </div>

              <div
                role="button"
                tabIndex={0}
                aria-label="View Turnitin Instructor details"
                className="stack-card card-4 card-turnitin"
                onClick={() => onNavigate('product-details', 'turnitin')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNavigate('product-details', 'turnitin');
                  }
                }}
                title="Turnitin Instructor"
              >
                <svg className="turn-symbol" aria-hidden="true"><use href="#brand-turnitin"></use></svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Search & Filter Bar */}
      <div id="catalog" className="max-w-[1280px] mx-auto px-6 pt-8">
        {/* Search Input */}
        <div className="relative h-12 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-center px-4 focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--brand)]/20 transition-all shadow-xs">
          <Search className="w-4 h-4 text-[var(--muted)] shrink-0 mr-3" />
          <input
            id="marketplace-search"
            type="search"
            placeholder="Search AI tools — try ‘writing’, ‘research’, or ‘Claude’"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-0 bg-transparent text-[var(--text)] placeholder-[var(--muted)] text-xs sm:text-sm outline-none [&::-webkit-search-cancel-button]:appearance-none"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[var(--muted)] hover:text-[var(--text)] p-1 transition-transform active:scale-90 shrink-0 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd
              onClick={() => document.getElementById('marketplace-search')?.focus()}
              className="hidden sm:inline-flex items-center gap-1 shrink-0 whitespace-nowrap text-[10px] font-mono font-medium bg-[var(--surface-raised)] hover:bg-[var(--surface)] text-[var(--sub)] hover:text-[var(--text)] border border-[var(--border)] px-2 py-1 rounded-md shadow-2xs select-none cursor-pointer transition-all"
              title="Shortcut: Cmd/Ctrl + K"
            >
              <span className="text-[11px] leading-none">{isMac ? '⌘' : 'Ctrl'}</span>
              <span className="text-[10px] leading-none font-semibold">K</span>
            </kbd>
          )}
        </div>

        {/* Categories & Sorting Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4">
          {/* Category Filter Pills (Functional Buttons) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pr-6 scroll-smooth" role="group" aria-label="Filter AI tools">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[var(--brand)] text-[var(--brand-text)] shadow-xs'
                  : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-raised)]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All tools</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10">
                {categoryCounts.all}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('assistant')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                selectedCategory === 'assistant'
                  ? 'bg-[var(--brand)] text-[var(--brand-text)] shadow-xs'
                  : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-raised)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI assistants</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10">
                {categoryCounts.assistant}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('writing')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                selectedCategory === 'writing'
                  ? 'bg-[var(--brand)] text-[var(--brand-text)] shadow-xs'
                  : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-raised)]'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Writing</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10">
                {categoryCounts.writing}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('research')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                selectedCategory === 'research'
                  ? 'bg-[var(--brand)] text-[var(--brand-text)] shadow-xs'
                  : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-raised)]'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Research</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10">
                {categoryCounts.research}
              </span>
            </button>
          </div>

          {/* Sort Menu */}
          <div ref={sortMenuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setSortMenuOpen(!sortMenuOpen)}
              className="w-full sm:w-auto h-10 px-3.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-xs font-semibold text-[var(--text)] flex items-center justify-between sm:justify-start gap-2 hover:border-[var(--brand)] transition-all active:scale-95 shadow-xs cursor-pointer"
              aria-haspopup="listbox"
              aria-expanded={sortMenuOpen}
            >
              <span>
                Sort: <span className="text-[var(--brand)] capitalize">{sortBy.replace('-', ' ')}</span>
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-[var(--muted)] transition-transform duration-200 ${sortMenuOpen ? 'rotate-180 text-[var(--brand)]' : ''}`} />
            </button>

            {sortMenuOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[var(--surface)] border border-[var(--border-strong)] p-1.5 shadow-2xl z-30 flex flex-col gap-1 animate-in zoom-in-95 origin-top-right"
                role="listbox"
              >
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('featured');
                    setSortMenuOpen(false);
                  }}
                  className={`text-left px-3 py-2 rounded-lg text-xs font-medium ${
                    sortBy === 'featured'
                      ? 'bg-[var(--brand)] text-[var(--brand-text)]'
                      : 'text-[var(--text)] hover:bg-[var(--surface-raised)]'
                  }`}
                >
                  Featured
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('price-asc');
                    setSortMenuOpen(false);
                  }}
                  className={`text-left px-3 py-2 rounded-lg text-xs font-medium ${
                    sortBy === 'price-asc'
                      ? 'bg-[var(--brand)] text-[var(--brand-text)]'
                      : 'text-[var(--text)] hover:bg-[var(--surface-raised)]'
                  }`}
                >
                  Price: low to high
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('price-desc');
                    setSortMenuOpen(false);
                  }}
                  className={`text-left px-3 py-2 rounded-lg text-xs font-medium ${
                    sortBy === 'price-desc'
                      ? 'bg-[var(--brand)] text-[var(--brand-text)]'
                      : 'text-[var(--text)] hover:bg-[var(--surface-raised)]'
                  }`}
                >
                  Price: high to low
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('alpha');
                    setSortMenuOpen(false);
                  }}
                  className={`text-left px-3 py-2 rounded-lg text-xs font-medium ${
                    sortBy === 'alpha'
                      ? 'bg-[var(--brand)] text-[var(--brand-text)]'
                      : 'text-[var(--text)] hover:bg-[var(--surface-raised)]'
                  }`}
                >
                  Name: A to Z
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section Heading & Counter */}
        <div className="flex items-baseline justify-between mt-8 mb-5">
          <div>
            <h2 className="font-heading font-bold text-xl md:text-2xl tracking-tight text-[var(--text)]">
              Featured AI tools
            </h2>
            <p className="text-xs text-[var(--sub)] mt-1">
              {filteredProducts.length} managed AI {filteredProducts.length === 1 ? 'subscription' : 'subscriptions'} available.
            </p>
          </div>

          {isMarketplaceLoading && (
            <div className="flex items-center">
              <BrandSpinner size="xs" />
            </div>
          )}
        </div>

        {/* 3. Products Grid */}
        <div className="product-grid" id="product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((card) => (
              <article
                key={card.slug}
                className="product-card"
                data-name={card.name}
                data-slug={card.slug}
                data-category={card.category}
                data-price={card.price.toFixed(2)}
                data-order={card.order}
                data-search={card.search}
                tabIndex={0}
                role="region"
                aria-label={`${card.name} subscription card`}
              >
                <div
                  className={`cover ${card.coverClass}`}
                  onClick={() => onNavigate('product-details', card.slug)}
                >
                  {card.isSubscribed && (
                    <span className="cover-badge">
                      <svg className="icon" aria-hidden="true"><use href="#i-check"></use></svg>
                      Subscribed
                    </span>
                  )}
                  <div className="cover-content">
                    <div className={`logo-tile ${card.logoTileClass}`}>
                      <svg aria-hidden="true"><use href={card.brandSymbolHref}></use></svg>
                    </div>
                    <h3 className="cover-title">{card.title}</h3>
                  </div>
                  <div className="cover-preview" aria-hidden="true">
                    <span className="mock-line short"></span>
                    <span className="mock-line"></span>
                    {card.slug === 'chatgpt' && <span className="mock-line short"></span>}
                    <span className="mock-control"></span>
                  </div>
                </div>
                <div className="card-content">
                  <p className="card-description">{card.description}</p>
                  <div className="card-pricing">
                    <div className="price-line num">
                      <span className="price">{card.priceFormatted}</span>
                      <span className="period">/month</span>
                    </div>
                    <div className="base-price num">USD Benchmark: {card.basePrice}</div>
                  </div>
                  <button
                    className={card.action === 'launch' ? 'btn btn-ghost card-action' : 'btn btn-primary card-action'}
                    type="button"
                    data-action={card.action}
                    aria-label={`${card.action === 'launch' ? 'Launch' : 'Subscribe to'} ${card.name}`}
                    data-product={card.name}
                    data-price={card.priceFormatted}
                    onClick={() => {
                      if (card.action === 'launch') {
                        onNavigate('workspace');
                      } else {
                        onNavigate('checkout', card.slug);
                      }
                    }}
                  >
                    {card.action === 'launch' ? (
                      <>
                        <svg className="icon" aria-hidden="true"><use href="#i-external"></use></svg>
                        Launch tool
                      </>
                    ) : (
                      <>
                        Subscribe <svg className="icon" aria-hidden="true"><use href="#i-arrow"></use></svg>
                      </>
                    )}
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div id="no-results" className="col-span-full border border-dashed border-[var(--border-strong)] rounded-2xl p-10 text-center bg-[var(--surface)]">
              <h3 className="text-base font-bold text-[var(--text)] mb-1">No matching AI tools</h3>
              <p className="text-xs text-[var(--sub)] mb-4">Try a different search term or clear your category filter.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-[var(--brand)] text-[var(--brand-text)] text-xs font-bold"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* 4. Trust Strip / Platform Benefits */}
        <section aria-label="Platform benefits" className="mt-14 mb-10 p-6 sm:p-7 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="group flex items-start gap-3.5 transition-colors">
              <div className="w-11 h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--brand)] flex items-center justify-center shrink-0 group-hover:border-[var(--brand)] group-hover:bg-[var(--surface-deep)] transition-colors">
                <Monitor className="w-5 h-5 text-[var(--brand)]" />
              </div>
              <div className="min-w-0">
                <h3 className="font-heading font-bold text-sm text-[var(--text)] tracking-tight">Managed access</h3>
                <p className="text-xs text-[var(--sub)] mt-1 leading-relaxed">
                  Use supported tools through Xtrinox Bridge with session integrity.
                </p>
              </div>
            </div>

            <div className="group flex items-start gap-3.5 transition-colors">
              <div className="w-11 h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--brand)] flex items-center justify-center shrink-0 group-hover:border-[var(--brand)] group-hover:bg-[var(--surface-deep)] transition-colors">
                <Shield className="w-5 h-5 text-[var(--brand)]" />
              </div>
              <div className="min-w-0">
                <h3 className="font-heading font-bold text-sm text-[var(--text)] tracking-tight">Manual verification</h3>
                <p className="text-xs text-[var(--sub)] mt-1 leading-relaxed">
                  Subscriptions undergo fast human proof review before activation.
                </p>
              </div>
            </div>

            <div className="group flex items-start gap-3.5 transition-colors">
              <div className="w-11 h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--brand)] flex items-center justify-center shrink-0 group-hover:border-[var(--brand)] group-hover:bg-[var(--surface-deep)] transition-colors">
                <Layers className="w-5 h-5 text-[var(--brand)]" />
              </div>
              <div className="min-w-0">
                <h3 className="font-heading font-bold text-sm text-[var(--text)] tracking-tight">Centralized access</h3>
                <p className="text-xs text-[var(--sub)] mt-1 leading-relaxed">
                  Manage and monitor all active AI workflows in one unified hub.
                </p>
              </div>
            </div>

            <div className="group flex items-start gap-3.5 transition-colors">
              <div className="w-11 h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--brand)] flex items-center justify-center shrink-0 group-hover:border-[var(--brand)] group-hover:bg-[var(--surface-deep)] transition-colors">
                <Headphones className="w-5 h-5 text-[var(--brand)]" />
              </div>
              <div className="min-w-0">
                <h3 className="font-heading font-bold text-sm text-[var(--text)] tracking-tight">Direct support</h3>
                <p className="text-xs text-[var(--sub)] mt-1 leading-relaxed">
                  Fast support for setup, extension sync, and workspace access.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. How It Works - Prioritizing User Trust & Purchase Clarity */}
        <section id="how-it-works" aria-label="How it works" className="py-12 border-b border-[var(--border)]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-[var(--brand)] px-2.5 py-1 rounded-md bg-[var(--accent-badge-bg)] inline-block">
                TRANSPARENT PROCESS
              </span>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-[var(--text)] mt-2.5">
                How It Works
              </h2>
              <p className="text-xs sm:text-sm text-[var(--sub)] mt-1 max-w-[620px] leading-relaxed">
                Simple, transparent 3-step journey from tool discovery to authenticated workspace access with manual proof review.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
              <span>No credit card required</span>
              <span>·</span>
              <span>Manual JazzCash & Bank payment</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
            {/* Step 1 */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:border-[var(--border-strong)] transition-all">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="w-9 h-9 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text)] font-extrabold text-sm flex items-center justify-center font-mono">
                    01
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] px-2.5 py-0.5 rounded-full bg-[var(--surface-raised)] border border-[var(--border)]">
                    Step 1
                  </span>
                </div>
                <h3 className="font-heading font-bold text-base sm:text-lg text-[var(--text)] mb-2">
                  Choose an AI tool
                </h3>
                <p className="text-xs sm:text-sm text-[var(--sub)] leading-relaxed">
                  Browse features, capabilities, and local PKR pricing for verified AI products. Pick the 30-day subscription tier that matches your workflow.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--border)]/60 text-[11px] text-[var(--muted)] flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--muted)]" />
                <span>Transparent fixed PKR billing</span>
              </div>
            </div>

            {/* Step 2 - Distinguishing Manual Verification Process */}
            <div className="rounded-2xl border-2 border-[#0B0B0C] bg-[var(--surface)] p-6 sm:p-7 flex flex-col justify-between shadow-xs relative transition-all">
              <div className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-full bg-[#B6FF2E] text-[#0B0B0C] text-[10px] font-extrabold uppercase tracking-wider border border-[#0B0B0C] shadow-xs">
                Manual Verification
              </div>
              <div>
                <div className="flex items-center justify-between mb-5 mt-1">
                  <span className="w-9 h-9 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text)] font-extrabold text-sm flex items-center justify-center font-mono">
                    02
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] px-2.5 py-0.5 rounded-full bg-[var(--surface-raised)] border border-[var(--border)]">
                    Step 2
                  </span>
                </div>
                <h3 className="font-heading font-bold text-base sm:text-lg text-[var(--text)] mb-2">
                  Transfer & verify
                </h3>
                <p className="text-xs sm:text-sm text-[var(--sub)] leading-relaxed">
                  Send local transfer via JazzCash or direct bank transfer, then submit your transaction receipt on WhatsApp. Our verification desk reviews and approves payment proof.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--border)]/60 text-[11px] text-[var(--sub)] flex items-center gap-2 font-medium">
                <Shield className="w-3.5 h-3.5 text-[var(--sub)]" />
                <span>Fast human review & receipt validation</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:border-[var(--border-strong)] transition-all">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="w-9 h-9 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text)] font-extrabold text-sm flex items-center justify-center font-mono">
                    03
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] px-2.5 py-0.5 rounded-full bg-[var(--surface-raised)] border border-[var(--border)]">
                    Step 3
                  </span>
                </div>
                <h3 className="font-heading font-bold text-base sm:text-lg text-[var(--text)] mb-2">
                  Access & launch
                </h3>
                <p className="text-xs sm:text-sm text-[var(--sub)] leading-relaxed">
                  Once your transfer is approved, launch directly from your Workspace via the official Xtrinox Bridge extension. Access is dedicated and authenticated.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--border)]/60 text-[11px] text-[var(--muted)] flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--muted)]" />
                <span>Instant single-click tool launch</span>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Story & Use Cases (Indexable Content) */}
        <section className="py-14 border-b border-[var(--border)] grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Column: Editorial SaaS Presentation */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-[var(--muted)] mb-2 block">
                MANAGED WORKSPACE HUB
              </span>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-[var(--text)] mb-5 leading-tight">
                A smarter way to manage <br />
                <span className="text-[var(--brand)]">
                  AI subscriptions
                </span>
              </h2>
              <div className="space-y-4 max-w-[520px]">
                <p className="text-xs sm:text-sm text-[var(--sub)] leading-relaxed">
                  Xtrinox brings a curated selection of premium AI tools into one marketplace. Compare available subscriptions, review local monthly pricing, and choose tools that fit your writing, research, development, and productivity needs.
                </p>
                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                  Rather than navigating fragmented international billing portals, you can browse supported tools and manage access through Xtrinox. Payment confirmation, eligibility, verification requirements, and access timing depend on the plan and review process shown during checkout.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[var(--border)] flex flex-wrap items-center gap-4 text-xs text-[var(--sub)] font-medium">
              <span className="inline-flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[var(--brand)]" />
                No recurring credit card charges
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-[var(--brand)]" />
                Dedicated workstation sessions
              </span>
            </div>
          </div>

          {/* Right Column: Popular Use Cases Tiles */}
          <div className="lg:col-span-6 lg:border-l border-[var(--border)] lg:pl-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-bold text-base sm:text-lg text-[var(--text)] tracking-tight">
                Popular use cases
              </h3>
              <span className="text-[11px] text-[var(--muted)] font-medium">
                Verified workflows
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="group p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--brand)] hover:shadow-xs transition-all flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-[var(--surface-raised)] group-hover:bg-[var(--brand)] group-hover:text-[var(--brand-text)] border border-[var(--border)] flex items-center justify-center shrink-0 text-[var(--brand)] transition-colors">
                  <PenTool className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs sm:text-sm text-[var(--text)] group-hover:text-[var(--brand)] transition-colors">
                    Writing and editing
                  </h4>
                  <p className="text-xs text-[var(--sub)] mt-1 leading-snug">
                    Draft, revise, paraphrase, and polish articles and essays.
                  </p>
                </div>
              </div>

              <div className="group p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--brand)] hover:shadow-xs transition-all flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-[var(--surface-raised)] group-hover:bg-[var(--brand)] group-hover:text-[var(--brand-text)] border border-[var(--border)] flex items-center justify-center shrink-0 text-[var(--brand)] transition-colors">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs sm:text-sm text-[var(--text)] group-hover:text-[var(--brand)] transition-colors">
                    Research & analysis
                  </h4>
                  <p className="text-xs text-[var(--sub)] mt-1 leading-snug">
                    Explore literature, compare data, and generate synthesis briefs.
                  </p>
                </div>
              </div>

              <div className="group p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--brand)] hover:shadow-xs transition-all flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-[var(--surface-raised)] group-hover:bg-[var(--brand)] group-hover:text-[var(--brand-text)] border border-[var(--border)] flex items-center justify-center shrink-0 text-[var(--brand)] transition-colors">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs sm:text-sm text-[var(--text)] group-hover:text-[var(--brand)] transition-colors">
                    Coding & dev
                  </h4>
                  <p className="text-xs text-[var(--sub)] mt-1 leading-snug">
                    Debug complex architectures, inspect logs, and refactor modules.
                  </p>
                </div>
              </div>

              <div className="group p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--brand)] hover:shadow-xs transition-all flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-[var(--surface-raised)] group-hover:bg-[var(--brand)] group-hover:text-[var(--brand-text)] border border-[var(--border)] flex items-center justify-center shrink-0 text-[var(--brand)] transition-colors">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs sm:text-sm text-[var(--text)] group-hover:text-[var(--brand)] transition-colors">
                    Academic review
                  </h4>
                  <p className="text-xs text-[var(--sub)] mt-1 leading-snug">
                    Verify originality with no-repository Turnitin similarity scans.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. FAQs */}
        <section aria-label="Frequently Asked Questions" className="py-14 border-b border-[var(--border)] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-4">
            <span className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-[var(--brand)] px-2.5 py-1 rounded-md bg-[var(--accent-badge-bg)] inline-block">
              FAQS
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-[var(--text)] mt-2.5 mb-3">
              Frequently asked questions
            </h2>
            <p className="text-xs sm:text-sm text-[var(--sub)] leading-relaxed">
              Clear answers about subscriptions, manual verification, payment transfer, and workspace access through Xtrinox.
            </p>
            <div className="mt-6 p-4 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-xs text-[var(--sub)] leading-relaxed">
              <strong className="text-[var(--text)] block mb-1">Have a specific question?</strong>
              Our verification desk is active on WhatsApp to assist with payment matching.
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-3">
            {[
              {
                q: 'What is Xtrinox?',
                a: 'Xtrinox is a marketplace for discovering, purchasing, and managing access to leading AI tools from one centralized hub with local payment support.'
              },
              {
                q: 'How is it different from subscribing directly?',
                a: 'Xtrinox enables convenient local manual payments (JazzCash / Easypaisa, Bank transfer) and unifies your authorized sessions under the Xtrinox Bridge extension and device dashboard.'
              },
              {
                q: 'How does manual verification work?',
                a: 'After selecting your tool and transferring the exact amount, you submit your transfer screenshot via WhatsApp. Our team reviews the receipt and activates your tool entitlement.'
              },
              {
                q: 'Can I cancel my subscription anytime?',
                a: 'Subscriptions are prepaid for 30-day access periods. You have zero recurring automatic card deductions—simply renew when you wish to continue.'
              },
              {
                q: 'Do I need to install anything to use my tools?',
                a: 'Desktop users install the lightweight Xtrinox Bridge browser extension to authenticate and launch managed tools. Mobile users can also use the Android app.'
              }
            ].map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen
                      ? 'border-[var(--brand)] bg-[var(--surface)] shadow-sm'
                      : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-hidden"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
                        isOpen ? 'bg-[var(--accent)] ring-2 ring-[var(--brand)]' : 'bg-[var(--border-strong)]'
                      }`} />
                      <span className="font-heading font-bold text-xs sm:text-sm text-[var(--text)]">
                        {faq.q}
                      </span>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-transform duration-200 ${
                      isOpen ? 'bg-[var(--brand)] text-[var(--brand-text)] border-[var(--brand)] rotate-180' : 'bg-[var(--surface-raised)] border-[var(--border)] text-[var(--muted)]'
                    }`}>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[var(--sub)] leading-relaxed border-t border-[var(--border)]/60 bg-[var(--surface-raised)]/30 xt-accordion-content">
                      <p className="max-w-[680px]">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 8. Final CTA Banner */}
        <section className="my-10 p-6 md:p-8 rounded-2xl border border-[var(--border-strong)] bg-gradient-to-r from-[var(--surface-raised)] to-[var(--surface)] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[var(--brand)] text-[var(--brand-text)] flex items-center justify-center shrink-0 shadow-md">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg md:text-xl text-[var(--text)]">
                Find the right AI tool for your work
              </h2>
              <p className="text-xs text-[var(--sub)] mt-0.5">
                Explore managed subscriptions, compare prices, and choose what fits.
              </p>
            </div>
          </div>

          <a
            href="#catalog"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-[var(--brand-text)] font-bold text-xs shadow-md transition-colors relative z-10 shrink-0"
          >
            <span>Browse all tools</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </section>
      </div>
    </div>
  );
};
