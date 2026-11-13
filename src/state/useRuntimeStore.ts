import { create } from 'zustand';
import { ExtensionStatus, extensionService } from '../services/extension.service';

export type SyncState = 'idle' | 'syncing' | 'success' | 'failed' | 'launching';

interface RuntimeState {
  extensionStatus: ExtensionStatus | 'unknown';
  extensionVersion: string | null;
  latestVersion: string | null;
  bridgeConnected: boolean;
  syncState: SyncState;
  deviceBlocked: boolean;
  currentDeviceId: string | null;
  adminDataLoading: boolean;
  syncError: string | null;
  launchingToolName: string | null;
  isUpdating: boolean;
  updateProgress: number;
  
  // Actions
  setExtensionStatus: (status: ExtensionStatus) => void;
  setExtensionVersion: (version: string) => void;
  setLatestVersion: (version: string) => void;
  setBridgeConnected: (connected: boolean) => void;
  setSyncState: (state: SyncState) => void;
  setDeviceBlocked: (blocked: boolean) => void;
  setCurrentDeviceId: (id: string | null) => void;
  setAdminDataLoading: (loading: boolean) => void;
  setSyncError: (error: string | null) => void;
  setLaunchingTool: (name: string | null) => void;
  setIsUpdating: (updating: boolean) => void;
  setUpdateProgress: (progress: number) => void;
  
  // Handlers
  initialize: () => () => void;
}

export const useRuntimeStore = create<RuntimeState>((set) => ({
  extensionStatus: 'unknown',
  extensionVersion: null,
  latestVersion: null,
  bridgeConnected: false,
  syncState: 'idle',
  deviceBlocked: false,
  currentDeviceId: null,
  adminDataLoading: false,
  syncError: null,
  launchingToolName: null,
  isUpdating: false,
  updateProgress: 0,

  setExtensionStatus: (status) => set({ extensionStatus: status }),
  setExtensionVersion: (version) => set({ extensionVersion: version }),
  setLatestVersion: (version) => set({ latestVersion: version }),
  setBridgeConnected: (connected) => set({ bridgeConnected: connected }),
  setSyncState: (state) => set({ syncState: state }),
  setDeviceBlocked: (blocked) => set({ deviceBlocked: blocked }),
  setCurrentDeviceId: (id) => set({ currentDeviceId: id }),
  setAdminDataLoading: (loading) => set({ adminDataLoading: loading }),
  setSyncError: (error) => set({ syncError: error }),
  setLaunchingTool: (name) => set({ launchingToolName: name }),
  setIsUpdating: (updating) => set({ isUpdating: updating }),
  setUpdateProgress: (progress) => set({ updateProgress: progress }),

  initialize: () => {
    let lastPongTime = 0;
    
    // Ping extension periodically
    extensionService.onPong(({ version, status }) => {
      lastPongTime = Date.now();
      set({ 
        bridgeConnected: status === 'connected',
        extensionVersion: version || null,
        extensionStatus: status || 'connected'
      });
    });

    // Start pinging immediately
    extensionService.ping();

    // Fast initial check for non-installed extension (1.2s instead of 5s)
    const initialCheck = setTimeout(() => {
      if (lastPongTime === 0) {
        set({ bridgeConnected: false, extensionStatus: 'disconnected' });
      }
    }, 1200);

    // Responsive heartbeat interval (every 2s, timeout after 3.5s)
    const interval = setInterval(() => {
      extensionService.ping();
      
      // If we haven't heard from the extension in 3.5 seconds, it's disconnected
      if (lastPongTime > 0 && Date.now() - lastPongTime > 3500) {
        set({ bridgeConnected: false, extensionStatus: 'disconnected' });
      }
    }, 2000);

    // Fetch latest version
    const fetchVersion = async () => {
      try {
        const response = await fetch('https://mughal41.github.io/Xtrinox/version.json');
        if (response.ok) {
          const data = await response.json();
          if (data.version) set({ latestVersion: data.version });
        }
      } catch {
        // Version checks are non-critical.
      }
    };
    fetchVersion();
    const versionInterval = setInterval(fetchVersion, 30000);

    return () => {
      clearTimeout(initialCheck);
      clearInterval(interval);
      clearInterval(versionInterval);
    };
  }
}));
