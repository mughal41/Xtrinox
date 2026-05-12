export type ExtensionStatus = 'disconnected' | 'connected' | 'conflict';

export interface ExtensionMessage {
  source: string;
  type: string;
  requestId?: string;
  payload?: any;
  key?: string;
  version?: string;
  status?: string;
  ok?: boolean;
  error?: string;
}

const EXTENSION_ID = 'REPLACE_WITH_YOUR_EXTENSION_ID';
const BRIDGE_MESSAGE_SOURCE = 'xtrinox-extension-bridge';
const APP_MESSAGE_SOURCE = 'xtrinox-web-app';
const BRIDGE_REPLY_TIMEOUT_MS = 5000;

class ExtensionService {
  private pendingRequests = new Map<string, { resolve: Function; reject: Function; timeoutId: number }>();
  private requestSequence = 0;
  private onPongCallback?: (data: { version?: string; status?: ExtensionStatus }) => void;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('message', this.handleMessage.bind(this));
    }
  }

  private handleMessage(event: MessageEvent) {
    if (event.source !== window) return;

    const message: ExtensionMessage = event.data;
    if (!message || message.source !== BRIDGE_MESSAGE_SOURCE) return;

    if (message.type === 'XTRINOX_EXTENSION_PONG') {
      if (this.onPongCallback) {
        let status: ExtensionStatus = 'connected';
        if (message.status === 'conflict') status = 'conflict';
        if (message.status === 'disconnected') status = 'disconnected';
        
        this.onPongCallback({
          version: message.version,
          status,
        });
      }
      return;
    }

    if (message.type === 'XTRINOX_EXTENSION_RESULT' && message.requestId) {
      const pending = this.pendingRequests.get(message.requestId);
      if (!pending) return;

      window.clearTimeout(pending.timeoutId);
      this.pendingRequests.delete(message.requestId);

      if (message.ok) {
        pending.resolve(message.payload || { ok: true });
      } else {
        pending.reject(new Error(message.error || 'Extension rejected the request.'));
      }
    }
  }

  public ping() {
    window.postMessage(
      {
        source: APP_MESSAGE_SOURCE,
        type: 'XTRINOX_EXTENSION_PING',
      },
      window.location.origin
    );
  }

  public onPong(callback: (data: { version?: string; status?: ExtensionStatus }) => void) {
    this.onPongCallback = callback;
  }

  public async inject(payload: any, key: string): Promise<any> {
    const isDirectAvailable = typeof chrome !== 'undefined' && chrome.runtime?.sendMessage && EXTENSION_ID && !EXTENSION_ID.startsWith('REPLACE_');

    if (isDirectAvailable) {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          EXTENSION_ID,
          { action: 'injectSession', payload, key },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error('Extension not reachable.'));
              return;
            }
            if (response?.ok === false) {
              reject(new Error(response.error || 'Extension rejected the request.'));
              return;
            }
            resolve(response);
          }
        );
      });
    }

    return new Promise((resolve, reject) => {
      const requestId = `xtrinox-${Date.now()}-${this.requestSequence++}`;
      
      const timeoutId = window.setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error('Extension bridge timed out. Reload the page and ensure content script is active.'));
      }, BRIDGE_REPLY_TIMEOUT_MS);

      this.pendingRequests.set(requestId, { resolve, reject, timeoutId });

      window.postMessage(
        {
          source: APP_MESSAGE_SOURCE,
          type: 'XTRINOX_EXTENSION_INJECT',
          requestId,
          payload,
          key,
        },
        window.location.origin
      );
    });
  }
}

export const extensionService = new ExtensionService();
