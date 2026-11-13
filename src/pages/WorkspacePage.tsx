import React, { useState, useEffect, useMemo, useRef } from 'react';
import { RouteName, BridgeState } from '../types';
import { useAuthStore } from '../state/useAuthStore';
import { useSubscriptionStore } from '../state/useSubscriptionStore';
import { useMarketplaceStore } from '../state/useMarketplaceStore';
import { useRuntimeStore } from '../state/useRuntimeStore';
import { extensionService } from '../services/extension.service';
import { firestoreService } from '../services/firestore.service';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  Smartphone,
  ExternalLink,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  X,
  Loader2,
  RefreshCw,
  Download
} from 'lucide-react';
import { ProductIcon, ProductAvatar } from '../components/ProductIcon';
import { BrandSpinner } from '../components/BrandSpinner';

interface WorkspacePageProps {
  onNavigate: (route: RouteName, param?: string) => void;
  bridgeState: BridgeState;
  setBridgeState: (state: BridgeState) => void;
}

export const WorkspacePage: React.FC<WorkspacePageProps> = ({
  onNavigate,
  bridgeState,
  setBridgeState
}) => {
  const [androidModalOpen, setAndroidModalOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [selectedBrowserTab, setSelectedBrowserTab] = useState<'chrome' | 'firefox'>(() => {
    return typeof navigator !== 'undefined' && /firefox/i.test(navigator.userAgent) ? 'firefox' : 'chrome';
  });
  const [launchingToolId, setLaunchingToolId] = useState<string | null>(null);
  const [toolFeedback, setToolFeedback] = useState<Record<string, { text: string; type: 'success' | 'error' | 'info' }>>({});
  const [hasAutoOpenedGuide, setHasAutoOpenedGuide] = useState(false);
  const [connectionLostNotice, setConnectionLostNotice] = useState(false);
  const prevConnectedRef = useRef<boolean | null>(null);

  const { user } = useAuthStore();
  const { subscriptions, entitlements, userDoc, loading: isSubscriptionLoading, fetchSubscriptions } = useSubscriptionStore();
  const { tools: marketplaceTools } = useMarketplaceStore();
  const { 
    extensionStatus, 
    extensionVersion, 
    currentDeviceId, 
    bridgeConnected, 
    deviceBlocked,
    setSyncState,
    setSyncError,
    setLaunchingTool
  } = useRuntimeStore();

  // Monitor connection loss: if extension was active and is turned off/drops offline, prompt reconnection
  useEffect(() => {
    if (prevConnectedRef.current === true && (!bridgeConnected || bridgeState === 'disconnected')) {
      setConnectionLostNotice(true);
      setGuideModalOpen(true);
    }
    if (bridgeConnected && bridgeState === 'ready') {
      setConnectionLostNotice(false);
    }
    prevConnectedRef.current = bridgeConnected || bridgeState === 'ready';
  }, [bridgeConnected, bridgeState]);

  // Auto-prompt download dialog if user does not have extension connected on initial visit
  useEffect(() => {
    if (extensionStatus === 'disconnected' && !bridgeConnected && !hasAutoOpenedGuide) {
      setGuideModalOpen(true);
      setHasAutoOpenedGuide(true);
    }
  }, [extensionStatus, bridgeConnected, hasAutoOpenedGuide]);

  const scenarios: Record<
    BridgeState,
    { title: string; desc: string; button: string; dotColor: string }
  > = {
    disconnected: {
      title: 'Bridge disconnected',
      desc: 'Connect your browser extension before launching tools.',
      button: 'Connect Bridge',
      dotColor: 'bg-[#c5221f]'
    },
    ready: {
      title: 'Ready to launch',
      desc: 'Bridge is connected. You can open your subscribed tool.',
      button: 'Launch session',
      dotColor: 'bg-[#137333]'
    },
    conflict: {
      title: 'Session conflict',
      desc: 'Another Bridge session needs attention before you can launch.',
      button: 'Resolve conflict',
      dotColor: 'bg-[#b06000]'
    },
    blocked: {
      title: 'Device not authorized',
      desc: 'This device needs approval before it can launch your subscription.',
      button: 'Review access',
      dotColor: 'bg-[#b06000]'
    },
    syncing: {
      title: 'Preparing your session',
      desc: 'Checking your subscription and sending the launch request…',
      button: 'Launching…',
      dotColor: 'bg-[#137333]'
    },
    success: {
      title: 'Session active',
      desc: 'Session successfully injected into Xtrinox Bridge.',
      button: 'Launch again',
      dotColor: 'bg-[#137333]'
    },
    failed: {
      title: 'Launch could not complete',
      desc: 'The session handoff did not complete. You can try again.',
      button: 'Retry launch',
      dotColor: 'bg-[#c5221f]'
    }
  };

  const currentScenario = scenarios[bridgeState] || scenarios.disconnected;

  // Active tools computation from Entitlements, Subscriptions, and Legacy User Doc
  const activeTools = useMemo(() => {
    const list: Array<{ id: string; name: string; slug: string; desc: string }> = [];

    // Check for ChatGPT Premium
    const hasChatGPT = 
      entitlements.some(e => e.toolId.toLowerCase().includes('chatgpt') && e.launchAllowed) ||
      subscriptions.some(s => s.toolId.toLowerCase().includes('chatgpt') && s.status === 'active') ||
      !!(userDoc?.encryptedPayload);

    if (hasChatGPT) {
      list.push({
        id: 'chatgpt-premium',
        slug: 'chatgpt',
        name: 'ChatGPT Premium',
        desc: 'Advanced AI assistance for writing, research, coding, and everyday work.'
      });
    }

    // Check other entitlements
    entitlements.forEach(ent => {
      if (!ent.toolId.toLowerCase().includes('chatgpt') && ent.launchAllowed) {
        const foundTool = marketplaceTools.find(m => m.id === ent.toolId || m.slug === ent.toolId);
        list.push({
          id: ent.toolId,
          slug: foundTool?.slug || ent.toolId,
          name: foundTool?.name || ent.toolId,
          desc: foundTool?.description || 'Managed AI subscription with secure session injection.'
        });
      }
    });

    // Check other subscriptions
    subscriptions.forEach(sub => {
      if (!sub.toolId.toLowerCase().includes('chatgpt') && sub.status === 'active') {
        if (!list.some(t => t.id === sub.toolId)) {
          const foundTool = marketplaceTools.find(m => m.id === sub.toolId || m.slug === sub.toolId);
          list.push({
            id: sub.toolId,
            slug: foundTool?.slug || sub.toolId,
            name: foundTool?.name || sub.toolId,
            desc: foundTool?.description || 'Managed AI subscription with secure session injection.'
          });
        }
      }
    });

    return list;
  }, [entitlements, subscriptions, userDoc, marketplaceTools]);

  // Secure 17-step tool launch sequence
  const handleLaunchTool = async (toolId: string) => {
    if (!user) {
      onNavigate('login');
      return;
    }

    // Strictly verify extension is active before initiating session launch
    if (bridgeState === 'disconnected') {
      setGuideModalOpen(true);
      return;
    }

    if (bridgeState === 'conflict' || extensionStatus === 'conflict') {
      setConflictModalOpen(true);
      return;
    }

    if (bridgeState === 'blocked' || deviceBlocked) {
      onNavigate('devices');
      return;
    }

    // Set isolated per-tool launch state
    setLaunchingToolId(toolId);
    setLaunchingTool(toolId);
    setToolFeedback(prev => ({
      ...prev,
      [toolId]: { text: 'Acquiring encrypted session token...', type: 'info' }
    }));

    try {
      // 1. Fetch specific session data for this tool from entitlements
      const entDocRef = doc(db, 'entitlements', `${user.uid}_${toolId}`);
      const entDoc = await getDoc(entDocRef);
      
      let encryptedPayload: any;
      let decryptionKey: string | undefined;

      if (entDoc.exists() && entDoc.data()?.encryptedPayload) {
        encryptedPayload = entDoc.data().encryptedPayload;
        decryptionKey = entDoc.data().decryptionKey;
      } else {
        // Fallback to legacy user doc
        const userDocRef = doc(db, 'users', user.uid);
        const uDoc = await getDoc(userDocRef);

        if (!uDoc.exists()) {
          throw new Error('No session data found for this account. Please contact support.');
        }

        const data = uDoc.data();
        encryptedPayload = data?.encryptedPayload;
        decryptionKey = data?.decryptionKey;
      }

      if (!encryptedPayload?.ciphertext || !decryptionKey) {
        throw new Error('Incomplete session encryption key. Please contact support.');
      }

      setToolFeedback(prev => ({
        ...prev,
        [toolId]: { text: 'Injecting secure session into Xtrinox Bridge...', type: 'info' }
      }));

      // 2. Sync Payload with Extension
      const result = await extensionService.inject(encryptedPayload, decryptionKey);

      setToolFeedback(prev => ({
        ...prev,
        [toolId]: { text: 'Session connected! Launched in workspace.', type: 'success' }
      }));

      // 3. Log launch
      await firestoreService.logLaunch(
        user.uid,
        toolId,
        'success',
        extensionVersion || '1.0.0',
        currentDeviceId || 'web-browser'
      );

      // 4. Redirect
      setTimeout(() => {
        if (result && !result.redirectUrl) {
          if (toolId.toLowerCase().includes('chatgpt')) {
            window.open('https://chatgpt.com', '_blank');
          } else if (toolId.toLowerCase().includes('claude')) {
            window.open('https://claude.ai', '_blank');
          } else if (toolId.toLowerCase().includes('quillbot')) {
            window.open('https://quillbot.com', '_blank');
          }
        }
        setLaunchingToolId(null);
        setLaunchingTool(null);
      }, 1500);

    } catch (err: any) {
      setSyncError(err.message || 'Launch failed');
      setToolFeedback(prev => ({
        ...prev,
        [toolId]: { text: err.message || 'Launch failed. Please check extension.', type: 'error' }
      }));
      setLaunchingToolId(null);
      setLaunchingTool(null);

      // If injection failed because bridge extension was disconnected or unreachable
      if (err.message?.includes('not reachable') || err.message?.includes('unavailable') || err.message?.includes('not confirm')) {
        setGuideModalOpen(true);
      }

      firestoreService.logLaunch(
        user.uid,
        toolId,
        'failed',
        extensionVersion || '1.0.0',
        currentDeviceId || 'web-browser'
      ).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] py-12 px-6 transition-colors">
      <div className="max-w-[1120px] mx-auto">
        {/* Intro Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--brand)] px-2.5 py-1 rounded-md bg-[var(--accent-badge-bg)] inline-block mb-2">
              YOUR AI LIBRARY
            </span>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[var(--text)] tracking-tight leading-tight">
              Your workspace
            </h1>
            <p className="text-sm text-[var(--sub)] mt-1.5 max-w-[500px]">
              Your subscribed AI tools, organized in one place.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAndroidModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-raised)] text-[var(--text)] text-xs font-semibold shadow-xs transition-colors"
            >
              <Smartphone className="w-4 h-4 text-[var(--brand)]" />
              <span>Get Android app</span>
            </button>
          </div>
        </div>

        {/* Tools Bar */}
        <div className="border-b border-[var(--border)] pb-3.5 mb-6 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <h2 className="font-heading font-bold text-base text-[var(--text)]">Your tools</h2>
            <span className="text-xs text-[var(--muted)]">
              {activeTools.length} {activeTools.length === 1 ? 'active subscription' : 'active subscriptions'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                if (user) fetchSubscriptions(user.uid);
              }}
              disabled={isSubscriptionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--surface)] hover:bg-[var(--surface-raised)] text-xs font-semibold text-[var(--text)] transition-all cursor-pointer disabled:opacity-60 shadow-2xs active:scale-95"
              title="Sync subscriptions from Firebase"
            >
              {isSubscriptionLoading ? (
                <BrandSpinner size="xs" variant="mark-spin" badge={false} />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 text-[var(--muted)]" />
              )}
              <span>{isSubscriptionLoading ? 'Syncing…' : 'Sync'}</span>
            </button>

            <button
              onClick={() => onNavigate('marketplace')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand)] hover:opacity-80 transition-opacity"
            >
              <span>Explore marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Connection Lost Notification Banner */}
        {connectionLostNotice && (
          <div className="mb-6 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-900 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 animate-pulse" />
              <div>
                <strong className="font-bold text-sm block sm:inline mr-1">Extension connection lost:</strong>
                <span>Xtrinox Bridge went offline. Please check that the extension is enabled in your browser.</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setGuideModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 transition-all cursor-pointer shadow-xs"
              >
                <span>Reconnect Bridge</span>
              </button>
              <button
                type="button"
                onClick={() => setConnectionLostNotice(false)}
                className="p-1.5 rounded-lg text-rose-700 hover:bg-rose-500/20 text-xs cursor-pointer"
                aria-label="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Offline Extension Warning Banner */}
        {!connectionLostNotice && bridgeState === 'disconnected' && (
          <div className="mb-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
              <div>
                <strong className="font-bold text-sm block sm:inline mr-1">Xtrinox Bridge offline:</strong>
                <span>Connect the extension to launch your subscribed sessions.</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setGuideModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--brand)] text-[var(--brand-text)] font-bold text-xs shrink-0 self-start sm:self-auto hover:bg-[var(--brand-hover)] transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install Extension</span>
            </button>
          </div>
        )}

        {/* Subscribed Products or Loading State */}
        {isSubscriptionLoading ? (
          <div className="py-20 flex items-center justify-center bg-transparent">
            <BrandSpinner size="lg" />
          </div>
        ) : activeTools.length > 0 ? (
          <div className="space-y-6">
            {activeTools.map((tool) => (
              <article
                key={tool.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-lg grid grid-cols-1 lg:grid-cols-12 min-h-[280px]"
              >
                {/* Left Product Area */}
                <div className="lg:col-span-8 p-7 sm:p-9 flex flex-col justify-center">
                  <div className="flex items-center gap-5">
                    <ProductAvatar
                      productId={tool.slug || tool.id}
                      size="2xl"
                      className="text-[#0B0B0C]"
                      containerClassName="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-[var(--border)] shadow-md p-3.5 sm:p-4"
                    />

                    <div>
                      <h3 className="font-heading font-extrabold text-2xl text-[var(--text)] tracking-tight">
                        {tool.name}
                      </h3>
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#137333]/10 border border-[#137333]/30 text-[#137333] text-xs font-bold mt-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#137333]" />
                        <span>Active subscription</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-[var(--sub)] mt-5 leading-relaxed max-w-[560px]">
                    {tool.desc}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-[var(--muted)] mt-4">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--brand)]" />
                    <span>Managed through Xtrinox Bridge</span>
                  </div>
                </div>

                {/* Right Action & Launch Readiness */}
                <aside className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[var(--border)] bg-[var(--surface-raised)] p-7 sm:p-8 flex flex-col justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)] block mb-2">
                    LAUNCH READINESS
                  </span>

                  {(() => {
                    const isThisToolLaunching = launchingToolId === tool.id;
                    const thisFeedback = toolFeedback[tool.id];
                    const isOffline = bridgeState === 'disconnected';
                    const scenario = isThisToolLaunching
                      ? scenarios.syncing
                      : isOffline
                      ? scenarios.disconnected
                      : scenarios[bridgeState] || scenarios.ready;

                    return (
                      <>
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${scenario.dotColor} ${isThisToolLaunching ? 'animate-pulse' : ''}`} />
                          <strong className="text-sm sm:text-base font-bold text-[var(--text)]">
                            {scenario.title}
                          </strong>
                        </div>

                        <p className="text-xs text-[var(--sub)] leading-relaxed mb-5">
                          {scenario.desc}
                        </p>

                        <button
                          type="button"
                          onClick={() => handleLaunchTool(tool.id)}
                          disabled={launchingToolId !== null}
                          className="w-full h-11 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-[var(--brand-text)] text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-70 cursor-pointer"
                        >
                          {isThisToolLaunching ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Launching…</span>
                            </>
                          ) : (
                            <>
                              <span>{scenario.button}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>

                        {/* Contextual help link */}
                        {isOffline && (
                          <div className="mt-3 text-center">
                            <button
                              type="button"
                              onClick={() => setGuideModalOpen(true)}
                              className="text-xs text-[var(--brand)] hover:underline font-semibold cursor-pointer"
                            >
                              Connection guide & download
                            </button>
                          </div>
                        )}

                        {/* Inline Feedback status for this specific tool */}
                        {thisFeedback && (
                          <div
                            className={`mt-4 p-2.5 rounded-lg text-xs leading-relaxed flex items-center gap-2 ${
                              thisFeedback.type === 'success'
                                ? 'bg-[#137333]/10 text-[#137333] border border-[#137333]/30'
                                : thisFeedback.type === 'error'
                                ? 'bg-rose-500/10 text-rose-700 border border-rose-500/30'
                                : 'bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>{thisFeedback.text}</span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </aside>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--border-strong)] p-12 text-center bg-[var(--surface)]">
            <div className="w-14 h-14 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--brand)] flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-[var(--text)] mb-2">No active subscriptions</h3>
            <p className="text-xs text-[var(--sub)] max-w-md mx-auto mb-6 leading-relaxed">
              Subscribe to ChatGPT, Claude, QuillBot, or other leading AI tools from the marketplace. Once your access is verified, your tools will appear here ready to launch.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('marketplace')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand)] text-[var(--brand-text)] text-xs font-bold shadow-md hover:bg-[var(--brand-hover)] transition-all cursor-pointer"
            >
              <span>Browse AI Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Android Modal */}
      {androidModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] p-6 shadow-2xl relative text-[var(--text)] animate-in zoom-in-95">
            <button
              onClick={() => setAndroidModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-[var(--muted)] hover:bg-[var(--surface-raised)]"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-heading font-extrabold text-xl text-[var(--text)]">Xtrinox for Android</h3>
            <p className="text-xs text-[var(--sub)] mt-1 mb-5">
              Access eligible subscriptions from one unified mobile workspace.
            </p>

            <div className="grid grid-cols-3 border border-[var(--border)] rounded-xl overflow-hidden mb-5 text-center">
              <div className="p-3 border-r border-[var(--border)] bg-[var(--surface-raised)]">
                <small className="block text-[10px] text-[var(--muted)] uppercase font-bold">Version</small>
                <b className="text-xs text-[var(--text)]">1.0.2</b>
              </div>
              <div className="p-3 border-r border-[var(--border)] bg-[var(--surface-raised)]">
                <small className="block text-[10px] text-[var(--muted)] uppercase font-bold">Size</small>
                <b className="text-xs text-[var(--text)]">3.00 MB</b>
              </div>
              <div className="p-3 bg-[var(--surface-raised)]">
                <small className="block text-[10px] text-[var(--muted)] uppercase font-bold">Requires</small>
                <b className="text-xs text-[var(--text)]">Android 7+</b>
              </div>
            </div>

            <p className="text-xs text-[var(--sub)] leading-relaxed mb-6">
              Android access depends on supported subscriptions and your verified account status.
            </p>

            <button
              type="button"
              onClick={() => {
                alert('Release download: Connect official production APK repository endpoint.');
                setAndroidModalOpen(false);
              }}
              className="w-full h-10 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-[var(--brand-text)] text-xs font-bold"
            >
              Download APK
            </button>
          </div>
        </div>
      )}

      {/* Bridge Guide Modal */}
      {guideModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] p-6 shadow-2xl relative text-[var(--text)] animate-in zoom-in-95">
            <button
              onClick={() => setGuideModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-[var(--muted)] hover:bg-[var(--surface-raised)]"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-heading font-extrabold text-xl text-[var(--text)]">Connect Xtrinox Bridge</h3>
            <p className="text-xs text-[var(--sub)] mt-1 mb-4">
              Your subscription is active; select your browser to install the lightweight session bridge.
            </p>

            {/* Browser Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--surface-raised)] rounded-xl border border-[var(--border)] mb-4">
              <button
                type="button"
                onClick={() => setSelectedBrowserTab('chrome')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center ${
                  selectedBrowserTab === 'chrome'
                    ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs border border-[var(--border-strong)]'
                    : 'text-[var(--sub)] hover:text-[var(--text)]'
                }`}
              >
                Chrome / Brave / Edge
              </button>
              <button
                type="button"
                onClick={() => setSelectedBrowserTab('firefox')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center ${
                  selectedBrowserTab === 'firefox'
                    ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs border border-[var(--border-strong)]'
                    : 'text-[var(--sub)] hover:text-[var(--text)]'
                }`}
              >
                Mozilla Firefox
              </button>
            </div>

            {/* Dynamic Step-by-Step Instructions based on selected browser */}
            <ol className="space-y-2.5 my-4">
              <li className="flex items-start gap-3 text-xs text-[var(--sub)] leading-relaxed">
                <span className="w-5 h-5 rounded-full bg-[var(--brand)] text-[var(--brand-text)] font-bold text-[10px] flex items-center justify-center shrink-0">
                  1
                </span>
                <span>
                  Download and unzip the <strong>{selectedBrowserTab === 'firefox' ? 'Firefox' : 'Chromium'}</strong> extension package.
                </span>
              </li>
              <li className="flex items-start gap-3 text-xs text-[var(--sub)] leading-relaxed">
                <span className="w-5 h-5 rounded-full bg-[var(--brand)] text-[var(--brand-text)] font-bold text-[10px] flex items-center justify-center shrink-0">
                  2
                </span>
                <span>
                  {selectedBrowserTab === 'firefox' ? (
                    <>Open <code className="px-1.5 py-0.5 rounded bg-[var(--surface-raised)] border border-[var(--border)] text-[11px]">about:debugging#/runtime/this-firefox</code> and click <strong>Load Temporary Add-on</strong>.</>
                  ) : (
                    <>Open <code className="px-1.5 py-0.5 rounded bg-[var(--surface-raised)] border border-[var(--border)] text-[11px]">chrome://extensions</code>, toggle <strong>Developer mode</strong> on the top right, and click <strong>Load unpacked</strong>.</>
                  )}
                </span>
              </li>
              <li className="flex items-start gap-3 text-xs text-[var(--sub)] leading-relaxed">
                <span className="w-5 h-5 rounded-full bg-[var(--brand)] text-[var(--brand-text)] font-bold text-[10px] flex items-center justify-center shrink-0">
                  3
                </span>
                <span>Open the extension popup once, then return here to launch your tools.</span>
              </li>
            </ol>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-[var(--border)]">
              <a
                href={
                  selectedBrowserTab === 'firefox'
                    ? 'https://mughal41.github.io/Xtrinox/xtrinox-bridge-firefox.zip'
                    : 'https://mughal41.github.io/Xtrinox/xtrinox-bridge.zip'
                }
                download
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-[var(--brand-text)] text-xs font-bold transition-all shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download for {selectedBrowserTab === 'firefox' ? 'Firefox' : 'Chrome'}</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setBridgeState('ready');
                  useRuntimeStore.getState().setBridgeConnected(true);
                  useRuntimeStore.getState().setExtensionStatus('connected');
                  setGuideModalOpen(false);
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-raised)] text-[var(--sub)] hover:text-[var(--text)] text-xs font-medium transition-colors cursor-pointer"
              >
                Simulate Connection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conflict Modal */}
      {conflictModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] p-6 shadow-2xl relative text-[var(--text)] animate-in zoom-in-95">
            <button
              onClick={() => setConflictModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-[var(--muted)] hover:bg-[var(--surface-raised)]"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-heading font-extrabold text-xl text-[var(--text)]">Resolve a session conflict</h3>
            <p className="text-xs text-[var(--sub)] mt-1 mb-4">
              Another active Bridge session is preventing this launch.
            </p>

            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Review active sessions in your Devices dashboard, disconnect unrecognized devices, then return here after the conflict is cleared.
            </p>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setConflictModalOpen(false);
                  onNavigate('devices');
                }}
                className="px-4 py-2 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-[var(--brand-text)] text-xs font-bold"
              >
                Go to Devices
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
