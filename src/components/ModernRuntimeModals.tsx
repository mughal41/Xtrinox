import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRuntimeStore } from '../state/useRuntimeStore';
import { ModernModal } from './ModernModal';

export const ModernRuntimeModals: React.FC = () => {
  const { 
    extensionStatus, 
    extensionVersion, 
    latestVersion, 
    bridgeConnected,
    isUpdating,
    updateProgress,
    launchingToolName,
    syncState,
    syncError,
    setSyncState,
    deviceBlocked,
    currentDeviceId
  } = useRuntimeStore();
  
  const location = useLocation();
  const [suppressUpdateModal, setSuppressUpdateModal] = useState(false);

  const shouldSuppressModal = 
    location.pathname.includes('/marketplace') || 
    location.pathname.includes('/checkout') || 
    location.pathname.includes('/login') || 
    location.pathname.includes('/admin') ||
    location.pathname === '/Xtrinox/' ||
    location.pathname === '/';
  
  const isUpdateAvailable = !suppressUpdateModal && extensionVersion && latestVersion && extensionVersion !== latestVersion;

  // 0. DEVICE BLOCKED GATING (Overrides everything, no suppression)
  if (deviceBlocked) {
    return (
      <ModernModal isOpen={true}>
        <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ marginBottom: '24px', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div style={{ 
              height: '96px', 
              width: '96px', 
              borderRadius: '9999px', 
              backgroundColor: '#fee2e2', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              border: '1px solid #fecaca' 
            }}>
              <span className="material-symbols-outlined" style={{ color: '#dc2626', fontSize: '48px' }}>block</span>
            </div>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#191b23', marginBottom: '8px', fontFamily: 'Inter, sans-serif' }}>Access Denied</h2>
          <p style={{ fontSize: '16px', color: '#424754', marginBottom: '40px', maxWidth: '384px', lineHeight: '1.5' }}>
            This device has been suspended due to a security policy violation. You cannot access Xtrinox from this browser.
          </p>
          <div style={{ 
            width: '100%', 
            backgroundColor: '#ecedf7', 
            borderRadius: '12px', 
            padding: '16px', 
            border: '1px solid #c2c6d6', 
            marginBottom: '40px', 
            textAlign: 'left' 
          }}>
            <p style={{ fontSize: '11px', color: '#424754', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px', letterSpacing: '0.05em' }}>Device Fingerprint Reference</p>
            <p style={{ fontFamily: 'monospace', fontSize: '13px', color: '#191b23', wordBreak: 'break-all' }}>{currentDeviceId || 'Unknown'}</p>
          </div>
          <p style={{ fontSize: '14px', color: '#424754', marginBottom: '24px' }}>
            Contact your administrator to restore access.
          </p>
        </div>
      </ModernModal>
    );
  }

  if (!bridgeConnected && extensionStatus === 'unknown') return null;

  return (
    <>
      {/* 1. Workspace Connector Required Modal */}
      <ModernModal 
        isOpen={extensionStatus === 'disconnected' && !shouldSuppressModal}
      >
        <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {/* Illustration Area */}
          <div style={{ marginBottom: '24px', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '192px', height: '128px' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundColor: '#ecedf7', borderRadius: '8px', border: '1px solid #c2c6d6', display: 'flex', flexDirection: 'column', padding: '4px' }}>
                <div style={{ height: '8px', width: '100%', display: 'flex', gap: '4px', marginBottom: '4px', padding: '0 4px' }}>
                  <div style={{ width: '4px', height: '4px', backgroundColor: '#727785', borderRadius: '9999px' }}></div>
                  <div style={{ width: '4px', height: '4px', backgroundColor: '#727785', borderRadius: '9999px' }}></div>
                </div>
                <div style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                  <span className="material-symbols-outlined" style={{ color: 'rgba(0, 88, 190, 0.2)', fontSize: '48px' }}>terminal</span>
                </div>
              </div>
              <div style={{ position: 'absolute', bottom: '-16px', right: '-16px', backgroundColor: '#ffffff', padding: '8px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', border: '1px solid #d8e2ff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ backgroundColor: '#adc6ff', padding: '4px', borderRadius: '6px', display: 'flex' }}>
                  <span className="material-symbols-outlined" style={{ color: '#0058be', fontSize: '20px' }}>sync</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ width: '48px', height: '6px', backgroundColor: '#2170e4', borderRadius: '9999px' }}></div>
                  <div style={{ width: '32px', height: '4px', backgroundColor: '#c2c6d6', borderRadius: '9999px', marginTop: '4px' }}></div>
                </div>
              </div>
            </div>
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#191b23', marginBottom: '8px' }}>Workspace Connector Required</h1>
          <p style={{ fontSize: '16px', color: '#424754', marginBottom: '40px', lineHeight: '1.5' }}>
            Install the secure Xtrinox Workspace Connector to launch premium AI tools and sync your workspace access.
          </p>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a 
              href="https://mughal41.github.io/Xtrinox/xtrinox-bridge.zip"
              style={{ backgroundColor: '#0058be', color: '#ffffff', fontWeight: '600', height: '44px', padding: '0 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', fontSize: '16px' }}
            >
              <span className="material-symbols-outlined">download</span>
              Install Connector
            </a>
            <button style={{ backgroundColor: '#ffffff', color: '#575e70', fontWeight: '600', height: '44px', padding: '0 24px', borderRadius: '8px', border: '1px solid #c2c6d6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px' }}>
              Learn More
            </button>
          </div>

          <div style={{ marginTop: '40px', display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(66, 71, 84, 0.7)', fontSize: '12px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified_user</span>
            Secure local bridge • No browser history access
          </div>
        </div>
      </ModernModal>

      {/* 2. Workspace Conflict Detected Modal */}
      <ModernModal 
        isOpen={extensionStatus === 'conflict' && !shouldSuppressModal}
        accentColor="bg-tertiary"
      >
        <div className="p-xl flex flex-col items-center text-center">
          <div className="mb-lg relative h-24 w-24 flex items-center justify-center">
            <div className="absolute inset-0 bg-tertiary-fixed/30 rounded-full scale-110"></div>
            <div className="bg-surface-container-high p-md rounded-xl shadow-sm border border-outline-variant flex items-center justify-center">
              <span className="material-symbols-outlined text-[48px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>extension_off</span>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-error-container p-1 rounded-full border-2 border-surface-container-lowest">
              <span className="material-symbols-outlined text-error text-[18px]" style={{ fontWeight: 700 }}>warning</span>
            </div>
          </div>

          <h1 className="font-h1 text-h1 text-on-surface mb-sm">Workspace Conflict Detected</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-md max-w-[380px]">
            Another browser modification is interfering with secure workspace access.
          </p>

          <div className="bg-surface-container-low px-md py-sm rounded-lg border border-outline-variant/30 mb-xl">
            <p className="font-label-md text-label-md text-tertiary">
              Disable conflicting extensions to continue using premium tools.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-md w-full">
            <button className="flex-1 bg-primary text-on-primary font-h3 text-h3 py-3 px-lg rounded-lg hover:bg-primary-container transition-all active:scale-95 flex items-center justify-center gap-sm shadow-md">
              <span>Resolve Conflict</span>
              <span className="material-symbols-outlined text-[18px]">bolt</span>
            </button>
            <button className="flex-1 bg-surface-container-lowest text-on-surface-variant border border-outline-variant font-h3 text-h3 py-3 px-lg rounded-lg hover:bg-surface-variant transition-all active:scale-95">
              View Help Guide
            </button>
          </div>
        </div>
        <div className="bg-surface-container-low px-xl py-md border-t border-outline-variant/20 flex justify-center">
          <button className="font-label-sm text-label-sm text-outline hover:text-primary transition-colors flex items-center gap-xs">
            <span className="material-symbols-outlined text-[14px]">contact_support</span>
            Contact Security Support
          </button>
        </div>
      </ModernModal>

      {/* 3. Connector Update Available Modal */}
      <ModernModal 
        isOpen={isUpdateAvailable && !isUpdating && !shouldSuppressModal}
        maxWidth="max-w-md"
      >
        <div className="p-lg flex flex-col items-center text-center border-b border-outline-variant bg-surface-container-low/50">
          <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center mb-md relative">
            <span className="material-symbols-outlined text-primary text-[32px]">sync</span>
            <div className="absolute -bottom-1 -right-1 bg-primary text-on-primary rounded-full p-0.5">
              <span className="material-symbols-outlined text-[14px]">priority_high</span>
            </div>
          </div>
          <h1 className="font-h1 text-h1 text-on-surface">Connector Update Available</h1>
          <p className="mt-sm font-body-md text-body-md text-on-surface-variant">
            A compatibility update is required before continuing. This ensures secure and efficient communication with your enterprise environment.
          </p>
        </div>
        <div className="p-lg space-y-md">
          <div className="grid grid-cols-2 gap-md p-md bg-surface-container-low rounded-lg">
            <div className="space-y-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider">Current Version</span>
              <span className="font-h3 text-h3 text-secondary">v{extensionVersion}</span>
            </div>
            <div className="space-y-1 border-l border-outline-variant pl-md">
              <span className="font-label-sm text-label-sm text-primary block uppercase tracking-wider">Latest Version</span>
              <span className="font-h3 text-h3 text-primary">v{latestVersion}</span>
            </div>
          </div>
          <div className="space-y-sm">
            <div className="flex items-center gap-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span className="font-body-md text-body-md">Improved TLS 1.3 handshake protocols</span>
            </div>
            <div className="flex items-center gap-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span className="font-body-md text-body-md">Optimized data compression protocols</span>
            </div>
          </div>
        </div>
        <div className="p-md px-lg bg-surface-container-low flex flex-col gap-sm">
          <a 
            href="https://mughal41.github.io/Xtrinox/xtrinox-bridge.zip"
            className="w-full h-[40px] bg-primary text-on-primary rounded-lg font-h3 text-h3 flex items-center justify-center gap-sm active:scale-[0.98] transition-transform shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            Update Connector
          </a>
          <button 
            onClick={() => setSuppressUpdateModal(true)}
            className="w-full h-[40px] bg-transparent text-secondary font-body-md text-body-md hover:bg-surface-container-high rounded-lg transition-colors"
          >
            Remind Me Later
          </button>
        </div>
      </ModernModal>

      {/* 4. Update in Progress Modal */}
      <ModernModal 
        isOpen={isUpdating}
        maxWidth="max-w-lg"
      >
        <div className="p-lg border-b border-outline-variant flex justify-between items-center">
          <h2 className="font-h2 text-h2 text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">system_update</span>
            Update in Progress
          </h2>
        </div>
        <div className="p-xl text-center">
          <div className="relative w-40 h-40 mx-auto mb-lg flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle className="text-surface-variant" cx="80" cy="80" fill="transparent" r="74" stroke="currentColor" strokeWidth="8"></circle>
              <circle 
                className="text-primary transition-all duration-500" 
                cx="80" cy="80" fill="transparent" r="74" 
                stroke="currentColor" strokeWidth="8"
                strokeDasharray="465"
                strokeDashoffset={465 - (465 * updateProgress / 100)}
              ></circle>
            </svg>
            <div className="z-10">
              <span className="font-display text-display text-primary">{updateProgress}%</span>
            </div>
          </div>
          <h3 className="font-h3 text-h3 text-on-surface mb-sm">Downloading Connector Update</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-xl max-w-sm mx-auto">
            The update is being downloaded and verified. This usually takes less than 2 minutes depending on your network.
          </p>
          <div className="w-full bg-surface-variant h-2 rounded-full mb-lg overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300 rounded-full"
              style={{ width: `${updateProgress}%` }}
            ></div>
          </div>
          <button className="w-full py-md bg-surface-container-highest text-on-surface-variant rounded-lg font-bold flex items-center justify-center gap-3 cursor-not-allowed" disabled>
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            Downloading Assets...
          </button>
        </div>
      </ModernModal>
      {/* 5. Tool Launching Modal */}
      <ModernModal 
        isOpen={!!launchingToolName}
        maxWidth="max-w-[520px]"
      >
        <div className="p-xl flex flex-col items-center text-center">
          {/* Visual Anchor */}
          <div className="mb-lg relative">
            <div className="w-20 h-20 bg-primary-container/10 rounded-full flex items-center justify-center shadow-[0_0_40px_10px_rgba(0,88,190,0.15)]">
              <span className="material-symbols-outlined text-primary text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
            </div>
            {/* Orbiting Accents */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full animate-pulse"></div>
          </div>

          {/* Identity & Status */}
          <div className="flex flex-col gap-xs mb-xl">
            <h1 className="font-h1 text-h1 text-on-surface">Launching {launchingToolName}...</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Preparing secure workspace access.</p>
          </div>

          {/* Custom Progress Component */}
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mb-xl overflow-hidden relative">
            <div className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(0,88,190,0.5)] animate-progress" style={{ width: '65%' }}></div>
          </div>

          {/* Status Indicators Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md w-full">
            <div className="flex items-center gap-2 justify-center py-2 px-3 bg-surface-container-low rounded-lg border border-outline-variant/20">
              <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="font-label-md text-label-md text-on-surface">Connected</span>
            </div>
            <div className="flex items-center gap-2 justify-center py-2 px-3 bg-surface-container-low rounded-lg border border-outline-variant/20">
              <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="font-label-md text-label-md text-on-surface">Verified</span>
            </div>
            <div className="flex items-center gap-2 justify-center py-2 px-3 bg-surface-container-low rounded-lg border border-outline-variant/20 border-primary/30">
              <span className="material-symbols-outlined text-[16px] text-primary animate-spin">sync</span>
              <span className="font-label-md text-label-md text-primary font-bold">Launching</span>
            </div>
          </div>

          {/* Subtle Branding */}
          <div className="mt-xl pt-lg border-t border-outline-variant/20 w-full flex items-center justify-center gap-sm">
            <div className="font-h3 text-h3 font-bold text-primary">Xtrinox</div>
            <div className="h-4 w-[1px] bg-outline-variant"></div>
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Enterprise Cloud</div>
          </div>
        </div>
      </ModernModal>
      {/* 6. Connection Failed Modal */}
      <ModernModal 
        isOpen={syncState === 'failed'}
        accentColor="bg-error"
        onClose={() => setSyncState('idle')}
      >
        <div className="relative h-40 bg-error-container/20 flex items-center justify-center overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-error flex items-center justify-center shadow-lg mb-2">
              <span className="material-symbols-outlined text-white text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>report</span>
            </div>
            <div className="absolute -inset-10 flex items-center justify-center opacity-20">
              <div className="w-48 h-48 border-2 border-dashed border-error rounded-full animate-[spin_10s_linear_infinite]"></div>
            </div>
          </div>
        </div>
        <div className="p-xl flex flex-col items-center text-center">
          <h2 className="font-h1 text-h1 text-on-surface mb-sm">Connection Failed</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-[340px]">
            We couldn't establish a secure bridge. Please ensure the latest version of the Xtrinox Connector is running.
          </p>
          <div className="mt-lg w-full bg-surface-container-low rounded-lg p-md border border-outline-variant/50 flex flex-col gap-xs text-left">
            <div className="flex justify-between items-center">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Error Details</span>
              <span className="font-label-sm text-label-sm text-error font-bold">{syncError || 'ECONN_TIMEOUT'}</span>
            </div>
          </div>
          <div className="mt-xl flex flex-col gap-md w-full">
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 px-md bg-primary text-on-primary rounded-lg font-bold hover:bg-primary-container transition-all active:scale-[0.98] duration-150 font-body-md text-body-md flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-body-lg">refresh</span>
              Retry Connection
            </button>
          </div>
        </div>
      </ModernModal>
      {/* 7. Syncing Workspace Modal */}
      <ModernModal 
        isOpen={syncState === 'syncing' && !launchingToolName}
      >
        <div className="p-xl flex flex-col items-center text-center">
          {/* Animated Sync Visual */}
          <div className="relative w-48 h-32 mb-lg flex items-center justify-center">
            {/* Cloud Icon */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-primary-container opacity-40">
              <span className="material-symbols-outlined !text-[48px]">cloud</span>
            </div>
            {/* Sync Flow Lines */}
            <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-primary-container to-transparent relative">
              <div className="absolute inset-0 bg-primary-container blur-[4px] opacity-30"></div>
            </div>
            {/* Device Icon */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 text-primary">
              <span className="material-symbols-outlined !text-[48px]">laptop_mac</span>
            </div>
            {/* Pulsing Status Ring */}
            <div className="absolute right-[12px] top-1/2 -translate-y-1/2 w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>

          <h1 className="font-h1 text-h1 text-on-surface mb-sm">Syncing Workspace Access</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-xl">Securely preparing your AI workspace.</p>

          <div className="w-full space-y-lg text-left">
            <div className="flex items-center gap-md relative">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary z-10">
                <span className="material-symbols-outlined !text-[18px]">check</span>
              </div>
              <div className="absolute left-4 top-8 w-0.5 h-6 bg-primary"></div>
              <div>
                <p className="font-h3 text-h3 text-on-surface">Verifying subscription</p>
                <p className="font-label-sm text-label-sm text-primary">Success</p>
              </div>
            </div>
            <div className="flex items-center gap-md relative">
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container z-10 relative">
                <span className="material-symbols-outlined !text-[18px] animate-pulse">lock_open</span>
                <div className="absolute inset-0 rounded-full border-2 border-primary-container border-t-transparent animate-spin"></div>
              </div>
              <div className="absolute left-4 top-8 w-0.5 h-6 bg-surface-container-high"></div>
              <div>
                <p className="font-h3 text-h3 text-on-surface">Preparing secure session</p>
                <p className="font-label-sm text-label-sm text-primary-container">In progress...</p>
              </div>
            </div>
            <div className="flex items-center gap-md relative">
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-outline z-10">
                <span className="material-symbols-outlined !text-[18px]">sync</span>
              </div>
              <div>
                <p className="font-h3 text-h3 text-outline">Syncing local workspace</p>
                <p className="font-label-sm text-label-sm text-outline">Waiting</p>
              </div>
            </div>
          </div>

          <div className="mt-xl pt-lg border-t border-outline-variant w-full flex justify-between items-center">
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined !text-[14px] text-on-surface-variant">security</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">End-to-end Encrypted</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">V 2.1.7</span>
          </div>
        </div>
      </ModernModal>
    </>
  );
};
