import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEO_PRODUCTS } from '../src/data/seoProducts.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const siteOrigin = 'https://mughal41.github.io';
const basePath = '/Xtrinox';

const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const stripMarkdown = (value = '') =>
  String(value)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

const renderMarkdownContent = (markdown = '') => {
  const lines = String(markdown).split('\n');
  const html = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length === 0) return;
    html.push(`<ul>${listItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`);
    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      continue;
    }

    if (line.startsWith('### ')) {
      flushList();
      html.push(`<h3>${escapeHtml(line.slice(4))}</h3>`);
      continue;
    }

    if (line.startsWith('## ')) {
      flushList();
      html.push(`<h2>${escapeHtml(line.slice(3))}</h2>`);
      continue;
    }

    if (line.startsWith('- ')) {
      listItems.push(line.slice(2));
      continue;
    }

    flushList();
    html.push(`<p>${escapeHtml(line)}</p>`);
  }

  flushList();
  return html.join('\n');
};

const renderProductStaticHtml = (product) => {
  const productUrl = `${siteOrigin}${basePath}/marketplace/${product.slug}/`;
  const imageUrl = product.imageUrl || product.bannerUrl || `${siteOrigin}${basePath}/og-image.png`;
  const keywords = product.seoKeywords?.join(', ') || '';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.seoDescription || product.description,
    image: imageUrl,
    brand: {
      '@type': 'Brand',
      name: 'Xtrinox',
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'USD',
      price: product.monthlyPrice.match(/\d+(?:\.\d+)?/)?.[0] || '0',
      availability: 'https://schema.org/InStock',
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: product.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return `
    <article class="seo-product-shell">
      <p class="seo-kicker">${escapeHtml(product.category)} subscription</p>
      <h1>${escapeHtml(product.name)}</h1>
      <p class="seo-lede">${escapeHtml(product.description)}</p>
      <p><strong>Price:</strong> ${escapeHtml(product.monthlyPrice)} through Xtrinox manual checkout.</p>
      <p>${escapeHtml(product.buyingIntent)}</p>

      <section>
        <h2>Why choose ${escapeHtml(product.name)} on Xtrinox?</h2>
        <ul>${product.benefits.map((benefit) => `<li>${escapeHtml(benefit)}</li>`).join('')}</ul>
      </section>

      <section>
        <h2>Popular use cases</h2>
        <ul>${product.useCases.map((useCase) => `<li>${escapeHtml(useCase)}</li>`).join('')}</ul>
      </section>

      <section>
        ${renderMarkdownContent(product.seoContent)}
      </section>

      <section>
        <h2>Frequently asked questions</h2>
        ${product.faqs.map((faq) => `
          <h3>${escapeHtml(faq.question)}</h3>
          <p>${escapeHtml(faq.answer)}</p>
        `).join('')}
      </section>
    </article>
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    <script type="application/ld+json">${JSON.stringify(faqJsonLd)}</script>
    <style>
      .seo-product-shell {
        max-width: 960px;
        margin: 0 auto;
        padding: 48px 20px;
        font-family: Inter, Arial, sans-serif;
        color: #0f172a;
        line-height: 1.65;
      }
      .seo-product-shell h1 {
        font-size: 42px;
        line-height: 1.1;
        margin: 0 0 16px;
      }
      .seo-product-shell h2 {
        font-size: 26px;
        line-height: 1.25;
        margin: 36px 0 12px;
      }
      .seo-product-shell h3 {
        font-size: 19px;
        margin: 24px 0 8px;
      }
      .seo-product-shell ul {
        padding-left: 22px;
      }
      .seo-kicker {
        margin: 0 0 10px;
        color: #4f46e5;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: .08em;
        text-transform: uppercase;
      }
      .seo-lede {
        color: #475569;
        font-size: 18px;
      }
    </style>
  `;
};

const injectHead = (html, product) => {
  const productUrl = `${siteOrigin}${basePath}/marketplace/${product.slug}/`;
  const imageUrl = product.imageUrl || product.bannerUrl || `${siteOrigin}${basePath}/og-image.png`;
  const metaBlock = `
    <style id="xtrinox-prerender-guard">
      #xtrinox-static-seo {
        display: none !important;
      }
    </style>
    <title>${escapeHtml(product.seoTitle)}</title>
    <meta name="description" content="${escapeHtml(product.seoDescription)}" />
    <meta name="keywords" content="${escapeHtml(product.seoKeywords?.join(', ') || '')}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${productUrl}" />
    <meta property="og:type" content="product" />
    <meta property="og:title" content="${escapeHtml(product.seoTitle)}" />
    <meta property="og:description" content="${escapeHtml(product.seoDescription)}" />
    <meta property="og:url" content="${productUrl}" />
    <meta property="og:site_name" content="Xtrinox" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(product.seoTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(product.seoDescription)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
  `;

  return html
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta name="description"[\s\S]*?>/g, '')
    .replace(/<meta name="keywords"[\s\S]*?>/g, '')
    .replace(/<meta name="robots"[\s\S]*?>/g, '')
    .replace(/<link rel="canonical"[\s\S]*?>/g, '')
    .replace(/<meta property="og:[\s\S]*?>/g, '')
    .replace(/<meta name="twitter:[\s\S]*?>/g, '')
    .replace('</head>', `${metaBlock}\n  </head>`);
};

const injectStaticBody = (html, product) => {
  const staticHtml = renderProductStaticHtml(product);
  const description = escapeHtml(stripMarkdown(product.seoContent));

  return html
    .replace(
      '<div id="root"></div>',
      `<div id="root"><div id="xtrinox-static-seo" aria-hidden="true">${staticHtml}</div></div><noscript><p>${description}</p></noscript>`
    );
};

const template = await readFile(path.join(distDir, 'index.html'), 'utf8');

await Promise.all(
  SEO_PRODUCTS.map(async (product) => {
    const html = injectStaticBody(injectHead(template, product), product);
    const outputDir = path.join(distDir, 'marketplace', product.slug);
    await mkdir(outputDir, { recursive: true });
    await writeFile(path.join(outputDir, 'index.html'), html);
  })
);

console.log(`[prerender-products] Generated ${SEO_PRODUCTS.length} static product pages.`);
