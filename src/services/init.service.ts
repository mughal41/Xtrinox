import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/config';

const SEED_TOOLS = [
  {
    id: 'chatgpt-premium',
    slug: 'chatgpt-premium',
    name: 'ChatGPT Premium',
    description: 'The world\'s most powerful language model, unlocked and optimized for professional use.',
    category: 'AI Assistant',
    monthlyPrice: '$20/month',
    active: true,
    requiresBridge: true,
    featured: true,
    launchUrl: 'https://chatgpt.com',
    logoUrl: 'chat',
    bannerUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxcaA-WiDy4teS56G59ku1AM9dzYHcVHf-xqJKmiJzjYNvOGPiG7SOrhKZ1Fv25fTJeOqCjkbwRPHKpE-3f6geNYBBiKQfUDzjg0iaAqNzOJHrOWWCingaz4aIpB0ImNCM3nADVWqq2SKeiw9raXdx11C54NieJlKhsYoxpGuWgTsuD5hvbB8kGwBNJ5Fj6ke07spEIrCLIccf_LEUPSXHhQn4V5wnviGRbM7T-yq1SihToURTfm4NVQ1WYAo5GeYHhrvPIXlzhnA'
  },
  {
    id: 'quillbot-pro',
    slug: 'quillbot-pro',
    name: 'Quillbot Pro',
    description: 'Professional paraphrasing and writing assistant with advanced grammar checking.',
    category: 'Writing',
    monthlyPrice: '$19/month',
    active: true,
    requiresBridge: true,
    featured: true,
    launchUrl: 'https://quillbot.com',
    logoUrl: 'edit_note',
    bannerUrl: ''
  },
  {
    id: 'stealth-writer',
    slug: 'stealth-writer',
    name: 'Stealth Writer',
    description: 'AI content humanizer to bypass detection and improve readability.',
    category: 'Writing',
    monthlyPrice: '$29/month',
    active: true,
    requiresBridge: true,
    featured: false,
    launchUrl: 'https://stealthwriter.ai',
    logoUrl: 'visibility_off',
    bannerUrl: ''
  },
  {
    id: 'turnitin-instructor',
    slug: 'turnitin-instructor',
    name: 'Turnitin Instructor',
    description: 'Elite plagiarism detection and academic integrity verification for researchers.',
    category: 'Research',
    monthlyPrice: '$49/month',
    active: true,
    requiresBridge: true,
    featured: true,
    launchUrl: 'https://turnitin.com',
    logoUrl: 'school',
    bannerUrl: ''
  }
];

export async function initializeMarketplace() {
  console.log('[Init] Checking marketplace state...');
  try {
    const snap = await getDocs(collection(db, 'marketplace_tools'));
    
    if (snap.empty) {
      console.log('[Init] Marketplace empty, seeding initial tools...');
      const batch = writeBatch(db);
      
      for (const tool of SEED_TOOLS) {
        const ref = doc(db, 'marketplace_tools', tool.id);
        batch.set(ref, {
          ...tool,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      await batch.commit();
      console.log('[Init] Marketplace seeded successfully.');
    } else {
      console.log('[Init] Marketplace already initialized.');
    }
    
    // Feature Flags Check
    const flagsRef = doc(db, 'system_configs', 'feature_flags');
    const flagsSnap = await getDocs(collection(db, 'system_configs'));
    if (flagsSnap.empty) {
       await setDoc(flagsRef, {
         marketplaceEnabled: true,
         workspaceEnabled: true,
         newRuntimeEnabled: true,
         updatedAt: serverTimestamp()
       });
       console.log('[Init] Feature flags initialized.');
    }

  } catch (e) {
    console.error('[Init] Initialization failed:', e);
  }
}
