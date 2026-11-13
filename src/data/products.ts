import { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'chatgpt-premium',
    slug: 'chatgpt',
    name: 'ChatGPT Premium',
    category: 'assistant',
    categoryLabel: 'AI assistants',
    pricePkr: 5015.63,
    priceFormatted: 'Rs 5,015.63',
    basePriceUsd: '$18.00',
    duration: '30 days',
    isSubscribed: true,
    brandColor: '#10a37f',
    accentBg: '#092729',
    shortDescription: 'Managed AI assistance for writing, analysis, research, and everyday productivity.',
    fullDescription: 'ChatGPT Premium provides intelligent conversational assistance, code generation, in-depth text analysis, and productivity acceleration. Accessed through the Xtrinox managed bridge workspace with full multi-device authorization.',
    searchKeywords: 'chatgpt premium writing analysis research productivity ai assistant coding openai gpt-4',
    features: [
      'Advanced GPT-4o reasoning & high-speed generation',
      'Code generation, debugging, and refactoring',
      'Document analysis and data summarization',
      'Managed workspace session handoff via Xtrinox Bridge'
    ],
    capabilities: [
      { title: 'Complex Reasoning', desc: 'Solve math, logic, and multi-step programming tasks with step-by-step clarity.' },
      { title: 'Long Document Analysis', desc: 'Upload, query, and synthesize long PDFs, technical specs, and datasets.' },
      { title: 'Workflow Automation', desc: 'Draft reports, format communications, and streamline daily operational tasks.' }
    ],
    useCases: [
      { title: 'Software Engineering', desc: 'Accelerate frontend/backend development and debug difficult errors.' },
      { title: 'Research & Synthesis', desc: 'Extract key findings across complex literature and compile briefs.' }
    ],
    faqs: [
      { question: 'How is this subscription delivered?', answer: 'Your ChatGPT session is launched securely through the Xtrinox Bridge browser extension.' },
      { question: 'Can I use this on mobile?', answer: 'Yes, through the Xtrinox Android app or mobile web workspace.' }
    ]
  },
  {
    id: 'claude-ai',
    slug: 'claude',
    name: 'Claude AI',
    category: 'assistant',
    categoryLabel: 'AI assistants',
    pricePkr: 6966.15,
    priceFormatted: 'Rs 6,966.15',
    basePriceUsd: '$25.00',
    duration: '30 days',
    isSubscribed: false,
    brandColor: '#d7764d',
    accentBg: '#432a26',
    shortDescription: 'AI assistance for writing, reasoning, analysis, and complex problem solving.',
    fullDescription: 'Claude AI delivers nuanced natural language comprehension, exceptional writing tone, and long-context reasoning for demanding academic, technical, and creative challenges.',
    searchKeywords: 'claude ai assistant writing analysis reasoning problem solving coding anthropic sonnet opus',
    features: [
      '200k token context window for massive documents',
      'Nuanced prose drafting with natural, thoughtful cadence',
      'Technical architecture analysis and review',
      'Reliable artifact generation and code sandbox'
    ],
    capabilities: [
      { title: 'Extended Context', desc: 'Process entire codebases or research papers in a single prompt.' },
      { title: 'Nuanced Writing', desc: 'Generate thoughtful, human-sounding prose without formulaic repetition.' }
    ],
    useCases: [
      { title: 'Strategic Writing', desc: 'Draft executive summaries, white papers, and long-form articles.' },
      { title: 'System Architecture', desc: 'Analyze structural designs and evaluate software patterns.' }
    ],
    faqs: [
      { question: 'How does verification work?', answer: 'Submit payment via JazzCash or bank transfer, send proof via WhatsApp, and account access is verified manually.' }
    ]
  },
  {
    id: 'quillbot-pro',
    slug: 'quillbot',
    name: 'QuillBot Pro',
    category: 'writing',
    categoryLabel: 'Writing',
    pricePkr: 1950.52,
    priceFormatted: 'Rs 1,950.52',
    basePriceUsd: '$7.00',
    duration: '30 days',
    isSubscribed: false,
    brandColor: '#21a36a',
    accentBg: '#12362c',
    shortDescription: 'Paraphrasing, grammar review, summarization, and academic writing support.',
    fullDescription: 'QuillBot Pro is the ultimate AI writing collaborator. Elevate your vocabulary, rephrase complex sentences into clear expression, eliminate grammatical flaws, and synthesize lengthy texts into concise briefs.',
    searchKeywords: 'quillbot pro writing grammar paraphrasing summarizing academic citation co-writer',
    features: [
      'Unlimited Paraphraser with all 8 fluency & custom modes',
      'Advanced Grammar & Style Checker with one-click fixes',
      'Integrated Plagiarism Checker and Citation Generator',
      'Summarizer tool for condensing research papers and articles'
    ],
    capabilities: [
      { title: '8 Paraphrasing Modes', desc: 'Standard, Fluency, Formal, Simple, Creative, Expand, Shorten, and Custom modes.' },
      { title: 'Tone & Clarity Adjustment', desc: 'Ensure your writing adheres to the exact professional or academic standard desired.' },
      { title: 'Plagiarism Defense', desc: 'Scan research against billions of web pages to ensure complete attribution.' }
    ],
    useCases: [
      { title: 'Academic Research', desc: 'Refine thesis papers, cite sources accurately, and condense literature reviews.' },
      { title: 'Content Editing', desc: 'Eliminate passive voice, improve rhythm, and polish professional drafts.' }
    ],
    faqs: [
      { question: 'What payment methods are supported for QuillBot Pro?', answer: 'We support local mobile wallets (JazzCash / Easypaisa) and direct bank transfers.' },
      { question: 'How long until my access is active?', answer: 'Manual verification typically completes within a short review window after receipt submission.' }
    ]
  },
  {
    id: 'stealth-writer',
    slug: 'stealth-writer',
    name: 'Stealth Writer',
    category: 'writing',
    categoryLabel: 'Writing',
    pricePkr: 3343.75,
    priceFormatted: 'Rs 3,343.75',
    basePriceUsd: '$12.00',
    duration: '30 days',
    isSubscribed: false,
    brandColor: '#9b4cf5',
    accentBg: '#231834',
    shortDescription: 'Rewriting and tone refinement to help shape more natural-sounding content.',
    fullDescription: 'Stealth Writer transforms machine-generated copy into fluent, authentic, human-like expression. Perfect for editors and writers seeking natural cadence, organic structure, and vocabulary diversity.',
    searchKeywords: 'stealth writer writing rewriting humanize tone refinement content natural',
    features: [
      'Advanced sentence restructuring for organic syntax flow',
      'Vocabulary variation and colloquial nuance enhancement',
      'Multi-level rewrite depth options',
      'Preserves original intent and factual meaning'
    ],
    capabilities: [
      { title: 'Natural Cadence', desc: 'Adjust sentence length distributions to mirror authentic human writing.' },
      { title: 'Meaning Preservation', desc: 'Keep technical facts and contextual relationships intact while transforming phrasing.' }
    ],
    useCases: [
      { title: 'Copywriting & Marketing', desc: 'Ensure web copy and newsletters sound engaging and personalized.' },
      { title: 'Essay & Script Polish', desc: 'Remove repetitive robotic transitions and enhance stylistic flair.' }
    ],
    faqs: [
      { question: 'Is this subscription shared or dedicated?', answer: 'Delivered securely through your individual Xtrinox Bridge workspace session.' }
    ]
  },
  {
    id: 'turnitin-instructor',
    slug: 'turnitin',
    name: 'Turnitin Instructor',
    category: 'research',
    categoryLabel: 'Research',
    pricePkr: 6966.15,
    priceFormatted: 'Rs 6,966.15',
    basePriceUsd: '$25.00',
    duration: '30 days',
    isSubscribed: false,
    brandColor: '#1284ff',
    accentBg: '#0b2947',
    shortDescription: 'Similarity reports, plagiarism checking, and academic integrity workflows.',
    fullDescription: 'Turnitin Instructor provides authoritative plagiarism detection and academic integrity inspection. Run non-repository similarity reports against global academic databases and published papers.',
    searchKeywords: 'turnitin instructor research academic integrity similarity reports plagiarism no-repository',
    features: [
      'Comprehensive similarity reports across billions of scholarly articles',
      'No-repository indexing option to protect document originality',
      'Detailed breakdown of overlapping sources and citations',
      'High-speed batch inspection for research papers and theses'
    ],
    capabilities: [
      { title: 'Global Academic Match', desc: 'Compare text against leading journals, institutional repositories, and open web data.' },
      { title: 'Non-Repository Protection', desc: 'Your scanned documents are not saved to the public database, preserving student/author rights.' }
    ],
    useCases: [
      { title: 'Dissertation Review', desc: 'Verify citations and ensure integrity before academic submission.' },
      { title: 'Publishing Pre-flight', desc: 'Check manuscripts against journal guidelines to prevent unintentional overlap.' }
    ],
    faqs: [
      { question: 'Will my paper be stored in the database?', answer: 'No, Xtrinox configured non-repository access prevents your papers from being stored or flagged in future checks.' }
    ]
  }
];

export const DEMO_DEVICES = [
  {
    id: 'd0',
    browser: 'Firefox 157',
    os: 'Linux',
    location: 'Karachi, PK',
    ip: '203.0.113.24',
    lastActive: 'Active now',
    status: 'trusted' as const,
    current: true,
    kind: 'desktop' as const
  },
  {
    id: 'd1',
    browser: 'Firefox 157',
    os: 'Linux',
    location: 'Karachi, PK',
    ip: '203.0.113.19',
    lastActive: '12 Nov · 09:42',
    status: 'trusted' as const,
    current: false,
    kind: 'desktop' as const
  },
  {
    id: 'd2',
    browser: 'Chrome 156',
    os: 'Windows 11',
    location: 'Karachi, PK',
    ip: '203.0.113.31',
    lastActive: '11 Nov · 17:18',
    status: 'trusted' as const,
    current: false,
    kind: 'desktop' as const
  },
  {
    id: 'd3',
    browser: 'Firefox 157',
    os: 'Linux',
    location: 'Karachi, PK',
    ip: '203.0.113.44',
    lastActive: '11 Nov · 10:16',
    status: 'trusted' as const,
    current: false,
    kind: 'desktop' as const
  },
  {
    id: 'd4',
    browser: 'Chrome 154',
    os: 'Android 10',
    location: 'Saddar, PK',
    ip: '198.51.100.22',
    lastActive: '10 Nov · 19:42',
    status: 'blocked' as const,
    current: false,
    kind: 'phone' as const
  },
  {
    id: 'd5',
    browser: 'Firefox 155',
    os: 'Linux',
    location: 'Karachi, PK',
    ip: '203.0.113.57',
    lastActive: '10 Nov · 12:20',
    status: 'trusted' as const,
    current: false,
    kind: 'desktop' as const
  },
  {
    id: 'd6',
    browser: 'Chrome 155',
    os: 'Windows 10',
    location: 'Karachi, PK',
    ip: '198.51.100.48',
    lastActive: '09 Nov · 15:07',
    status: 'pending' as const,
    current: false,
    kind: 'desktop' as const
  },
  {
    id: 'd7',
    browser: 'Firefox 155',
    os: 'Linux',
    location: 'Karachi, PK',
    ip: '203.0.113.58',
    lastActive: '09 Nov · 11:44',
    status: 'trusted' as const,
    current: false,
    kind: 'desktop' as const
  },
  {
    id: 'd8',
    browser: 'Chrome 153',
    os: 'Windows 11',
    location: 'Karachi, PK',
    ip: '203.0.113.61',
    lastActive: '07 Nov · 09:18',
    status: 'blocked' as const,
    current: false,
    kind: 'desktop' as const
  },
  {
    id: 'd9',
    browser: 'Chrome 152',
    os: 'Android 10',
    location: 'Saddar, PK',
    ip: '198.51.100.64',
    lastActive: '03 Nov · 17:14',
    status: 'trusted' as const,
    current: false,
    kind: 'phone' as const
  }
];

export const PAYMENT_DESTINATIONS = {
  wallet: {
    provider: 'JazzCash / Easypaisa',
    recipientName: 'Muhammad Hamza',
    accountNumber: '0304-5829147'
  },
  bank: {
    bankName: 'Meezan Bank Limited',
    recipientName: 'Muhammad Hamza',
    accountNumber: '01020104829182',
    iban: 'PK48MEZN0001020104829182'
  },
  whatsappNumber: '+923045829147'
};
