import React from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useRuntimeStore } from '../state/useRuntimeStore';

export const RuntimeModals: React.FC = () => {
  const { extensionStatus, extensionVersion, latestVersion, bridgeConnected } = useRuntimeStore();
  const location = useLocation();

  const isPromptSuppressed = 
    location.pathname.includes('/marketplace') || 
    location.pathname.includes('/checkout') || 
    location.pathname.includes('/login') || 
    location.pathname.includes('/admin') ||
    location.pathname === '/Xtrinox/' ||
    location.pathname === '/';
  
  const isUpdateAvailable = extensionVersion && latestVersion && extensionVersion !== latestVersion;

  if (!bridgeConnected && extensionStatus === 'unknown') return null;

  const content = (
    <>
      {/* Extension Missing Overlay */}
      {extensionStatus === 'disconnected' && !isPromptSuppressed && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-6">
          <div className="w-full max-w-lg bg-surface rounded-3xl p-xl shadow-2xl border border-outline-variant text-center">
             <div className="mb-6 flex h-20 w-20 mx-auto items-center justify-center rounded-3xl bg-amber-500/10 text-amber-600 shadow-sm">
                <span className="material-symbols-outlined text-4xl">extension</span>
             </div>
             <h2 className="text-h1 font-bold text-on-surface">Xtrinox Bridge Required</h2>
             <p className="mt-3 text-body-md text-on-surface-variant">
               To access your premium session and enjoy a seamless experience, please ensure the **Xtrinox Bridge** extension is active.
             </p>
             <div className="mt-8 space-y-3">
               <a 
                 href="https://mughal41.github.io/Xtrinox/xtrinox-bridge.zip"
                 className="flex items-center justify-center gap-2 w-full bg-primary text-on-primary py-4 rounded-2xl font-bold hover:brightness-110 shadow-lg"
               >
                 <span className="material-symbols-outlined">download</span>
                 Download Latest Extension
               </a>
               <p className="text-label-sm text-outline uppercase font-bold tracking-widest pt-2">Installation Guide</p>
               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-container-low p-3 rounded-xl text-left border border-outline-variant">
                    <span className="material-symbols-outlined text-primary text-sm">settings</span>
                    <p className="text-[11px] font-bold mt-1">Enable in Extensions</p>
                  </div>
                  <div className="bg-surface-container-low p-3 rounded-xl text-left border border-outline-variant">
                    <span className="material-symbols-outlined text-primary text-sm">refresh</span>
                    <p className="text-[11px] font-bold mt-1">Reload this Page</p>
                  </div>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Update Available Overlay */}
      {isUpdateAvailable && (
        <div className="fixed bottom-6 right-6 z-[100] w-full max-w-sm bg-surface rounded-2xl p-md shadow-2xl border border-primary/20 animate-slide-up">
           <div className="flex gap-4 items-start">
             <div className="h-10 w-10 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center shrink-0">
               <span className="material-symbols-outlined">update</span>
             </div>
             <div>
               <h3 className="font-bold text-on-surface">Update Available</h3>
               <p className="text-label-md text-on-surface-variant">v{latestVersion} is now ready for deployment.</p>
               <a 
                 href="https://mughal41.github.io/Xtrinox/xtrinox-bridge.zip"
                 className="mt-3 inline-block text-primary font-bold text-label-md hover:underline"
               >
                 Download Update & Restart
               </a>
             </div>
           </div>
        </div>
      )}

      {/* Conflict Detected Overlay */}
      {extensionStatus === 'conflict' && !isPromptSuppressed && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-amber-950/40 backdrop-blur-md px-6">
          <div className="w-full max-w-lg bg-surface rounded-3xl p-xl shadow-2xl border border-amber-500/30 text-center">
             <div className="mb-6 flex h-20 w-20 mx-auto items-center justify-center rounded-3xl bg-amber-500/10 text-amber-600">
                <span className="material-symbols-outlined text-4xl">security</span>
             </div>
             <h2 className="text-h1 font-bold text-on-surface">System Integrity Check</h2>
             <p className="mt-3 text-body-md text-on-surface-variant">
               To protect your premium session, we've restricted access. Unauthorized cookie extensions were detected.
             </p>
             <div className="mt-8 bg-amber-50 border border-amber-200 p-5 rounded-2xl text-left">
               <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2">Required Action</p>
               <p className="text-label-md text-amber-900 leading-relaxed font-medium">
                 Open the <b>Xtrinox Bridge</b> extension and click <b>"Resolve Conflict"</b> to restore system integrity.
               </p>
             </div>
          </div>
        </div>
      )}
    </>
  );

  return createPortal(content, document.body);
};
