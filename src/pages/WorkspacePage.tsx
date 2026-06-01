import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../state/useAuthStore';
import { useRuntimeStore } from '../state/useRuntimeStore';
import { useSubscriptionStore } from '../state/useSubscriptionStore';
import { MarketplaceTool } from '../firebase/schema';
import { PagePreloader } from '../components/PagePreloader';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { extensionService } from '../services/extension.service';

export const WorkspacePage: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    extensionStatus, 
    syncState, 
    setSyncState, 
    setSyncError, 
    syncError,
    setLaunchingTool
  } = useRuntimeStore();

  const { subscriptions, entitlements, userDoc, loading: isSubscriptionLoading } = useSubscriptionStore();
  const [activeSubscribedTools, setActiveSubscribedTools] = useState<any[]>([]);

  useEffect(() => {
    if (isSubscriptionLoading) return;
    const tools = [];
    
    // Check for ChatGPT Premium (Entitlement or Legacy)
    const isChatGPTActive = entitlements.some(e => e.toolId.toLowerCase().includes('chatgpt') && e.launchAllowed) ||
                          subscriptions.some(s => s.toolId.toLowerCase().includes('chatgpt') && s.status === 'active') ||
                          !!(userDoc?.encryptedPayload);
    
    if (isChatGPTActive) {
      tools.push({ id: 'chatgpt-premium', name: 'ChatGPT Premium', icon: 'chat', status: 'ready' });
    }

    // Check for other tools in entitlements
    entitlements.forEach(ent => {
      if (!ent.toolId.toLowerCase().includes('chatgpt') && ent.launchAllowed) {
        // We might need to fetch tool names from marketplace store if not available here
        tools.push({ id: ent.toolId, name: ent.toolId, icon: 'smart_toy', status: 'ready' });
      }
    });

    setActiveSubscribedTools(tools);
  }, [subscriptions, entitlements, userDoc, isSubscriptionLoading]);

  if (isSubscriptionLoading) return <PagePreloader message="Synchronizing Workspace..." status="Verifying account entitlements..." />;

  // Launch the selected AI tool securely through the browser extension
  const handleLaunchTool = async (toolId: string) => {
    if (!user) return;
    
    const selectedTool = activeSubscribedTools.find(t => t.id === toolId);
    setLaunchingTool(selectedTool?.name || 'Tool');
    setSyncState('syncing');
    setSyncError(null);

    try {
      // 1. Fetch specific session data for this tool from entitlements
      const entDocRef = doc(db, 'entitlements', `${user.uid}_${toolId}`);
      const entDoc = await getDoc(entDocRef);
      
      let encryptedPayload;
      let decryptionKey;

      if (entDoc.exists() && entDoc.data().encryptedPayload) {
        encryptedPayload = entDoc.data().encryptedPayload;
        decryptionKey = entDoc.data().decryptionKey;
      } else {
        // Fallback to legacy user doc
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          throw new Error('No session data found. Please contact support.');
        }

        const data = userDoc.data();
        encryptedPayload = data?.encryptedPayload;
        decryptionKey = data?.decryptionKey;
      }

      if (!encryptedPayload?.ciphertext || !decryptionKey) {
        throw new Error('Incomplete session data.');
      }

      // 2. Validate Extension Status
      if (extensionStatus === 'conflict') {
        throw new Error('System integrity check failed. Please resolve the extension conflict first.');
      }
      if (extensionStatus !== 'connected') {
        throw new Error('Xtrinox Bridge is required to launch. Please install or enable the extension.');
      }

      // 3. Sync Payload with Extension
      const result = await extensionService.inject(encryptedPayload, decryptionKey);
      
      setSyncState('success');
      
      // 4. Smart Redirect
      // If the extension already handled the redirect (typical for ChatGPT flow), 
      // we don't need to do anything. If it didn't, we open the tool URL.
      setTimeout(() => {
        if (result && !result.redirectUrl) {
           if (toolId.toLowerCase().includes('chatgpt')) {
             window.open('https://chatgpt.com', '_blank');
           }
        }
        setSyncState('idle');
        setLaunchingTool(null);
      }, 1500);

    } catch (err: any) {
      setSyncState('failed');
      setSyncError(err.message || 'Sync failed');
      setLaunchingTool(null);
    }
  };

  return (
    <div className="space-y-xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface">Your Workspace</h1>
          <p className="text-body-md text-on-surface-variant">Manage and launch your active AI subscriptions.</p>
        </div>
        <div className="flex gap-sm">
           <span className="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-label-sm font-bold border border-emerald-500/20 flex items-center gap-1">
             <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
             System Ready
           </span>
        </div>
      </div>

      {activeSubscribedTools.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center px-lg py-xxl bg-background">
          <div className="max-w-4xl w-full text-center mb-xl">
            <h1 className="font-display text-display text-on-surface mb-md">Your workspace is ready</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl max-w-2xl mx-auto">
              Subscribe to AI tools from the marketplace to begin building your workflow. Your tools, data, and analytics will appear here once you're set up.
            </p>
            <div className="flex justify-center gap-md">
              <button 
                onClick={() => window.location.href = '/Xtrinox/marketplace'}
                className="bg-primary hover:bg-primary-container text-on-primary font-h3 text-h3 px-lg py-sm rounded-lg shadow-sm transition-all duration-200 active:scale-95"
              >
                Explore Marketplace
              </button>
              <button className="bg-surface border border-outline-variant hover:bg-surface-variant text-on-surface-variant font-h3 text-h3 px-lg py-sm rounded-lg transition-all duration-200 active:scale-95">
                Browse Featured Tools
              </button>
            </div>
          </div>
          
          {/* Bento-style Mockup Grid (Visual Interest) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg w-full max-w-5xl opacity-80 pointer-events-none">
            <div className="col-span-1 md:col-span-2 aspect-[2/1] bg-surface-container-low rounded-xl border border-outline-variant border-dashed flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
              <div className="text-center p-md">
                <span className="material-symbols-outlined text-surface-dim text-5xl mb-md">add_circle</span>
                <div className="h-4 w-48 bg-surface-container-highest rounded-full mx-auto mb-sm"></div>
                <div className="h-3 w-32 bg-surface-container-highest rounded-full mx-auto"></div>
              </div>
            </div>
            <div className="aspect-square bg-surface-container-low rounded-xl border border-outline-variant border-dashed flex items-center justify-center p-md">
              <div className="w-full space-y-sm">
                <div className="h-3 w-full bg-surface-container-highest rounded-full"></div>
                <div className="h-3 w-3/4 bg-surface-container-highest rounded-full"></div>
                <div className="h-3 w-1/2 bg-surface-container-highest rounded-full"></div>
              </div>
            </div>
            <div className="aspect-square bg-surface-container-low rounded-xl border border-outline-variant border-dashed flex items-center justify-center p-md">
              <div className="flex gap-sm">
                <div className="h-10 w-10 bg-surface-container-highest rounded-lg"></div>
                <div className="h-10 w-10 bg-surface-container-highest rounded-lg"></div>
                <div className="h-10 w-10 bg-surface-container-highest rounded-lg"></div>
              </div>
            </div>
            <div className="col-span-1 md:col-span-2 aspect-[3/1] bg-surface-container-low rounded-xl border border-outline-variant border-dashed flex items-center justify-center px-lg">
              <div className="w-full flex justify-between items-center">
                <div className="h-4 w-1/3 bg-surface-container-highest rounded-full"></div>
                <div className="h-8 w-24 bg-surface-container-highest rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
          {activeSubscribedTools.map(tool => (
            <div key={tool.id} className="bg-surface rounded-2xl border border-outline-variant p-lg shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-md">
                <div className="h-12 w-12 bg-primary-container rounded-xl flex items-center justify-center text-on-primary-container">
                  <span className="material-symbols-outlined text-2xl">{tool.icon}</span>
                </div>
                <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-label-sm font-bold uppercase">Active</span>
              </div>
              <h3 className="font-h2 text-h2 text-on-surface mb-1">{tool.name}</h3>
              <p className="text-body-md text-on-surface-variant mb-xl">Professional grade AI session orchestration.</p>
              
              <button 
                onClick={() => handleLaunchTool(tool.id)}
                disabled={syncState === 'syncing'}
                className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50 transition-all"
              >
                {syncState === 'syncing' ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                    Launch Session
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {syncError && (
        <div className="p-md bg-error-container text-on-error-container rounded-xl flex items-center gap-3 border border-error/20">
          <span className="material-symbols-outlined">warning</span>
          <p className="text-label-md font-bold">{syncError}</p>
        </div>
      )}

      {syncState === 'success' && (
        <div className="p-md bg-emerald-500 text-white rounded-xl flex items-center gap-3 shadow-lg animate-bounce">
          <span className="material-symbols-outlined">check_circle</span>
          <p className="text-label-md font-bold">Workspace Synced Successfully! Opening Tool...</p>
        </div>
      )}
    </div>
  );
};
