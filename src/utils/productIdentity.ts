export type ProductKey = 'chatgpt' | 'claude' | 'quillbot' | 'stealth' | 'turnitin';

export interface ProductBrandMeta {
  key: ProductKey;
  canonicalName: string;
  brandColor: string;
  brandBgTint: string;
  symbolHref: string;
  viewBox: string;
}

export const PRODUCT_BRAND_CONFIG: Record<ProductKey, ProductBrandMeta> = {
  chatgpt: {
    key: 'chatgpt',
    canonicalName: 'ChatGPT Premium',
    brandColor: '#10a37f',
    brandBgTint: 'rgba(16, 163, 127, 0.12)',
    symbolHref: '#brand-openai',
    viewBox: '0 0 24 24'
  },
  claude: {
    key: 'claude',
    canonicalName: 'Claude AI',
    brandColor: '#d7764d',
    brandBgTint: 'rgba(215, 118, 77, 0.12)',
    symbolHref: '#brand-claude',
    viewBox: '0 0 48 48'
  },
  quillbot: {
    key: 'quillbot',
    canonicalName: 'QuillBot Pro',
    brandColor: '#21a36a',
    brandBgTint: 'rgba(33, 163, 106, 0.12)',
    symbolHref: '#brand-quill',
    viewBox: '0 0 48 48'
  },
  stealth: {
    key: 'stealth',
    canonicalName: 'Stealth Writer',
    brandColor: '#9b4cf5',
    brandBgTint: 'rgba(155, 76, 245, 0.12)',
    symbolHref: '#brand-stealth',
    viewBox: '0 0 48 48'
  },
  turnitin: {
    key: 'turnitin',
    canonicalName: 'Turnitin Instructor',
    brandColor: '#0863ae',
    brandBgTint: 'rgba(8, 99, 174, 0.12)',
    symbolHref: '#brand-turnitin',
    viewBox: '0 0 48 48'
  }
};

/**
 * Normalizes any product ID, slug, or display name to canonical ProductKey.
 * Handles:
 * - 'chatgpt-premium', 'chatgpt', 'ChatGPT Premium', 'openai', 'gpt'
 * - 'claude-ai', 'claude', 'Claude AI', 'anthropic'
 * - 'quillbot-pro', 'quillbot', 'QuillBot Pro', 'quill'
 * - 'stealth-writer', 'stealth', 'Stealth Writer'
 * - 'turnitin-instructor', 'turnitin', 'Turnitin Instructor'
 */
export function normalizeProductKey(idOrName?: string | null): ProductKey | null {
  if (!idOrName) return null;
  const s = String(idOrName).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (s.includes('chatgpt') || s.includes('openai') || s === 'gpt') return 'chatgpt';
  if (s.includes('claude') || s.includes('anthropic')) return 'claude';
  if (s.includes('quillbot') || s.includes('quill')) return 'quillbot';
  if (s.includes('stealth')) return 'stealth';
  if (s.includes('turnitin')) return 'turnitin';
  return null;
}

export function getProductBrandMeta(idOrName?: string | null): ProductBrandMeta | null {
  const key = normalizeProductKey(idOrName);
  return key ? PRODUCT_BRAND_CONFIG[key] : null;
}
