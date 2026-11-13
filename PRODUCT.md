# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Students, Academic Researchers & Writers:** Individuals seeking reliable access to high-tier research, grammar, plagiarism detection, and writing tools (Turnitin, QuillBot Pro, StealthWriter, Claude, ChatGPT) with local payment methods (PKR / manual transfer) without international credit card barriers.
- **Developers & Knowledge Workers:** Professionals requiring managed, multi-device access to top-tier reasoning engines (ChatGPT GPT-4o, Claude 3.5/Sonnet) for programming, data synthesis, and workflow automation.
- **Platform Administrators:** Operators managing subscription entitlements, cookie pools, user authentication, and hardware-bound device trust controls.

## Product Purpose

Xtrinox is a premium AI tool marketplace and workspace that lets users discover, purchase, and launch premium AI subscriptions in one unified environment. It bridges the gap between international AI services and local users by handling payment processing, entitlement provisioning, and secure session handoffs via the custom Xtrinox Bridge browser extension.

## Positioning

Unlike unmanaged account-sharing services or fragile shared credentials, Xtrinox delivers a secure, hardware-bound session bridge. User access is gated through device authorization and managed session cookies, providing single-click launch into genuine AI platforms with enterprise-grade isolation.

## Operating Context

- **Client Surface:** High-performance single-page web application running in modern desktop and mobile browsers.
- **Bridge Ecosystem:** Connects with the Xtrinox Bridge desktop browser extension to inject session credentials and sync active tool states.
- **Commercial Flow:** Local currency pricing (PKR) with benchmark USD transparency, combined with a manual payment review queue (bank transfer, Easypaisa, JazzCash, crypto).
- **Administration:** In-app operational portal for inventory, cookies pool health, user accounts, and real-time audit logs.

## Capabilities and Constraints

- **Marketplace & Catalog:** Dynamic search (`Cmd/Ctrl + K` global shortcut), category filtering (AI Assistants, Writing, Research, Productivity), price sorting, and interactive hero deck showcasing flagship tools.
- **Product Details & Education:** In-depth feature breakdown, capability showcases, real-world use cases, and transparent FAQs.
- **Session & Device Security:** Multi-device trust manager (desktop vs. mobile, IP/location tracking, device session revocation).
- **Checkout & Entitlements:** Multi-step order submission with payment receipt verification.
- **System Constraints:** Unified single-theme design system (`chalk-ink-acid`); strict client-side session isolation and zero exposure of raw master credentials to end users.

## Brand Commitments

- **Name & Identity:** Xtrinox — Premium AI Tool Marketplace.
- **Signature Palette:** "Chalk, Ink & Acid" — Chalk White (`#F3F2EE`), Ink Black (`#0B0B0C`), and Electric Acid Green (`#B6FF2E`).
- **Brand Mark:** Geometric bold `X` emblem paired with an illuminated Acid Green status dot.
- **Tone & Voice:** Authoritative, high-precision, utilitarian, and technologically forward. Avoids playful or cartoonish tropes; communicates reliability, speed, and uncompromising digital craftsmanship.

## Evidence on Hand

- Production Vite + React 19 + Tailwind CSS codebase (`src/`).
- Master brand assets and vector symbol definitions in `index.html` and `/public/assets/aistudio/`.
- Pre-validated visual regression goldens (`marketplace-verified.png`, `chalk-grid.png`, `admin-dashboard-fresh.png`).
- Structured product catalog with live PKR/USD conversions and feature matrices in `src/data/products.ts`.

## Product Principles

1. **Precision Over Decoration:** Every visual element serves navigation, credibility, or state clarity. No ornamental distraction.
2. **Deterministic Session Reliability:** Tool launch states (disconnected, syncing, active, conflict) are unmistakable and instantly readable.
3. **High-Contrast Readability:** Maximum legibility through deep ink contrast against warm tactile chalk backgrounds.
4. **Tactile Digital Feedback:** Micro-interactions, hover expansions, and card tilts communicate immediate physical responsiveness.

## Accessibility & Inclusion

- WCAG AA compliant contrast ratios across primary text (`#0B0B0C` on `#F3F2EE` > 16:1).
- Clear `:focus-visible` indicators with 2px solid brand rings and offset geometry.
- Full `prefers-reduced-motion` overrides eliminating 3D card tilt, indeterminate loading animations, and rotational transitions.
- Semantic HTML tags, ARIA labels for icon-only buttons, and accessible keyboard-navigable dialogs and trays.
