import { useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const EXTENSION_ID = 'REPLACE_WITH_YOUR_EXTENSION_ID';
const SUCCESS_RESET_MS = 2000;
const BRIDGE_PING_INTERVAL_MS = 4000;
const BRIDGE_REPLY_TIMEOUT_MS = 5000;
const APP_MESSAGE_SOURCE = 'xtrinox-web-app';
const BRIDGE_MESSAGE_SOURCE = 'xtrinox-extension-bridge';
const EXTENSION_ID_CONFIGURED = EXTENSION_ID && !EXTENSION_ID.startsWith('REPLACE_WITH_');

function App() {
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [launchError, setLaunchError] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchSuccess, setLaunchSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(true);
  const [bridgeConnected, setBridgeConnected] = useState(false);
  const [extensionStatus, setExtensionStatus] = useState('disconnected'); // 'disconnected', 'connected', 'conflict'
  const [extensionVersion, setExtensionVersion] = useState(null);
  const LATEST_VERSION = '1.0.0'; // Manually update this when you release a new version
  const DOWNLOAD_URL = 'https://mughal41.github.io/Xtrinox/xtrinox-bridge.zip';



  const bridgePingTimerRef = useRef(null);
  const pendingBridgeRequestsRef = useRef(new Map());
  const requestSequenceRef = useRef(0);

  const runtimeMessagingAvailable =
    typeof globalThis.chrome !== 'undefined' &&
    typeof globalThis.chrome.runtime !== 'undefined' &&
    typeof globalThis.chrome.runtime.sendMessage === 'function';
  const directExtensionAvailable = runtimeMessagingAvailable && EXTENSION_ID_CONFIGURED;
  const extensionAvailable = extensionStatus !== 'disconnected' || directExtensionAvailable;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      setLoginError('');
      setLaunchError('');
      setSessionReady(true);
      setLaunchSuccess(false);
      setIsLaunching(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const pendingRequests = pendingBridgeRequestsRef.current;

    const handleBridgeMessage = (event) => {
      if (event.source !== window) {
        return;
      }

      const message = event.data;
      if (!message || message.source !== BRIDGE_MESSAGE_SOURCE) {
        return;
      }

      if (message.type === 'XTRINOX_EXTENSION_PONG') {
        setBridgeConnected(true);
        if (message.version) {
          setExtensionVersion(message.version);
        }
        if (message.status === 'conflict') {
          setExtensionStatus('conflict');
        } else {
          setExtensionStatus('connected');
        }
        return;
      }


      if (message.type === 'XTRINOX_EXTENSION_RESULT') {
        const pending = pendingRequests.get(message.requestId);
        if (!pending) {
          return;
        }

        window.clearTimeout(pending.timeoutId);
        pendingRequests.delete(message.requestId);

        if (message.ok) {
          pending.resolve(message.payload || { ok: true });
        } else {
          pending.reject(new Error(message.error || 'Extension rejected the request.'));
        }
      }
    };

    const pingBridge = () => {
      window.postMessage(
        {
          source: APP_MESSAGE_SOURCE,
          type: 'XTRINOX_EXTENSION_PING',
        },
        window.location.origin,
      );
    };

    window.addEventListener('message', handleBridgeMessage);
    pingBridge();
    bridgePingTimerRef.current = window.setInterval(pingBridge, BRIDGE_PING_INTERVAL_MS);

    return () => {
      window.removeEventListener('message', handleBridgeMessage);
      if (bridgePingTimerRef.current) {
        window.clearInterval(bridgePingTimerRef.current);
      }

      pendingRequests.forEach((pending) => {
        window.clearTimeout(pending.timeoutId);
      });
      pendingRequests.clear();
    };
  }, []);

  const avatarLabel = useMemo(() => {
    if (!user?.email) {
      return 'U';
    }

    const [localPart] = user.email.split('@');
    return localPart.slice(0, 2).toUpperCase() || 'U';
  }, [user]);

  const extensionStatusLabel = 
    extensionStatus === 'conflict' ? 'Extension Conflict Detected' :
    extensionAvailable 
      ? (extensionVersion && extensionVersion !== LATEST_VERSION ? 'Update Available' : 'Extension Connected')
      : 'Extension Not Detected';


  const normalizeError = (error, fallback) => {
    if (!error || typeof error !== 'object') {
      return fallback;
    }
    return error.message || fallback;
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError('');

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setPassword('');
    } catch (error) {
      setLoginError(normalizeError(error, 'Sign-in failed. Verify your credentials and try again.'));
    }
  };

  const handleLogout = async () => {
    setLaunchError('');
    setLoginError('');
    await signOut(auth);
  };

  const sendToExtensionByBridge = (payload, key) =>
    new Promise((resolve, reject) => {
      const requestId = `xtrinox-${Date.now()}-${requestSequenceRef.current}`;
      requestSequenceRef.current += 1;

      const timeoutId = window.setTimeout(() => {
        pendingBridgeRequestsRef.current.delete(requestId);
        reject(new Error('Extension bridge timed out. Reload the page and ensure content script is active.'));
      }, BRIDGE_REPLY_TIMEOUT_MS);

      pendingBridgeRequestsRef.current.set(requestId, { resolve, reject, timeoutId });

      window.postMessage(
        {
          source: APP_MESSAGE_SOURCE,
          type: 'XTRINOX_EXTENSION_INJECT',
          requestId,
          payload,
          key,
        },
        window.location.origin,
      );
    });

  const sendToExtensionById = (payload, key) =>
    new Promise((resolve, reject) => {
      globalThis.chrome.runtime.sendMessage(
        EXTENSION_ID,
        { action: 'injectSession', payload, key },
        (response) => {
          if (globalThis.chrome.runtime.lastError) {
            reject(new Error('Extension not reachable. Ensure it is loaded and extension ID is correct.'));
            return;
          }

          if (response?.ok === false) {
            reject(new Error(response.error || 'Extension rejected the request.'));
            return;
          }

          resolve(response);
        },
      );
    });

  const sendToExtension = async (payload, key) => {
    if (bridgeConnected) {
      return sendToExtensionByBridge(payload, key);
    }

    if (directExtensionAvailable) {
      return sendToExtensionById(payload, key);
    }

    throw new Error('Extension not detected. Ensure content script is active for this app origin.');
  };

  const handleLaunchSession = async () => {
    if (!user || !extensionAvailable || extensionStatus === 'conflict') {
      return;
    }

    setLaunchError('');
    setLaunchSuccess(false);
    setIsLaunching(true);

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        setSessionReady(false);
        throw new Error('No session data found. Contact your administrator.');
      }

      const data = userDoc.data();
      const encryptedPayload = data?.encryptedPayload;
      const decryptionKey = data?.decryptionKey;

      if (!encryptedPayload?.ciphertext || !encryptedPayload?.iv || !decryptionKey) {
        setSessionReady(false);
        throw new Error('No session data found. Contact your administrator.');
      }

      setSessionReady(true);
      await sendToExtension(encryptedPayload, decryptionKey);
      setLaunchSuccess(true);

      // DEEP LAUNCH: Open ChatGPT automatically
      setTimeout(() => {
        window.open('https://chatgpt.com', '_blank');
      }, 1000);

      window.setTimeout(() => {
        setLaunchSuccess(false);
      }, SUCCESS_RESET_MS);
    } catch (error) {
      setLaunchError(normalizeError(error, 'Session launch failed. Please retry.'));
    } finally {
      setIsLaunching(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-cyan-300/20 border-t-cyan-300" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-10 text-slate-100">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/70" />
        <div className="absolute -left-16 -top-16 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

        <main className="relative z-10 w-full max-w-md">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-[0_0_30px_rgba(56,189,248,0.15)]">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 text-slate-950">
                <span className="material-symbols-outlined text-2xl">lock</span>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-cyan-200">Sign In</h1>
              <p className="mt-2 text-sm text-slate-400">Where Ideas Become Output</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Email</label>
                <div className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    mail
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@company.com"
                    className="h-12 w-full rounded-xl border border-white/10 bg-slate-900/50 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none ring-0 transition focus:border-cyan-400/60"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    key
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-xl border border-white/10 bg-slate-900/50 pl-11 pr-12 text-sm text-white placeholder:text-slate-500 outline-none ring-0 transition focus:border-cyan-400/60"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-cyan-300"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Sign in
              </button>
            </form>

            {loginError ? (
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                <span className="material-symbols-outlined text-base">error</span>
                <p>{loginError}</p>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/50" />

      <header className="h-16 border-b border-white/10 bg-slate-950/80 px-8 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 text-slate-950">
              <span className="material-symbols-outlined">shield_lock</span>
            </div>
            <span className="text-lg font-semibold tracking-wide text-cyan-200">Xtrinox</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-slate-500">Authenticated User</p>
              <p className="text-sm text-cyan-200">{user.email}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-semibold text-cyan-200">
              {avatarLabel}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
              title="Log out"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col items-center px-6 py-10">
        <div
          className={`mb-7 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
            extensionStatus === 'conflict' ? 'border-amber-400/30 bg-amber-500/10 text-amber-200' :
            extensionAvailable
              ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
              : 'border-amber-400/30 bg-amber-500/10 text-amber-200'
          }`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              extensionStatus === 'conflict' ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]' :
              extensionAvailable ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-amber-300'
            }`}
          />
          {extensionStatusLabel}
        </div>

        <section className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-[0_0_30px_rgba(56,189,248,0.12)]">
          {!extensionAvailable ? (
            <div className="mx-auto flex max-w-lg flex-col items-center justify-center py-10 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                <span className="material-symbols-outlined text-4xl">extension</span>
              </div>
              <h2 className="text-2xl font-semibold text-slate-100">Xtrinox Bridge Required</h2>
              <p className="mt-3 text-slate-400">
                To access your premium session and enjoy a seamless experience, please ensure the **Xtrinox Bridge** extension is active in your browser.
              </p>
              <div className="mt-8 w-full space-y-4">
                <a
                  href={DOWNLOAD_URL}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 py-4 font-semibold text-slate-950 transition hover:brightness-110"
                >
                  <span className="material-symbols-outlined">download</span>
                  Download Latest Extension
                </a>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 text-left text-sm text-slate-300">
                    <span className="material-symbols-outlined text-cyan-400">check_circle</span>
                    <span>Make sure to install the extension in Chrome.</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 text-left text-sm text-slate-300">
                    <span className="material-symbols-outlined text-cyan-400">settings</span>
                    <span>Verify the extension is enabled in your browser settings.</span>
                  </div>
                </div>
              </div>
            </div>
          ) : extensionVersion && extensionVersion !== LATEST_VERSION ? (
            <div className="mx-auto flex max-w-lg flex-col items-center justify-center py-10 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-500/10 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                <span className="material-symbols-outlined text-4xl">update</span>
              </div>
              <h2 className="text-2xl font-semibold text-slate-100">Update Available</h2>
              <p className="mt-3 text-slate-400">
                A new version of **Xtrinox Bridge** is available (v{LATEST_VERSION}). Please update to continue using premium features.
              </p>
              <div className="mt-8 w-full">
                <a
                  href={DOWNLOAD_URL}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-6 py-4 font-semibold text-slate-950 transition hover:brightness-110"
                >
                  <span className="material-symbols-outlined">download_for_offline</span>
                  Download v{LATEST_VERSION}
                </a>
                <p className="mt-4 text-xs text-slate-500">
                  Current Version: v{extensionVersion}
                </p>
              </div>
            </div>
          ) : extensionStatus === 'conflict' ? (

            <div className="mx-auto flex max-w-lg flex-col items-center justify-center py-10 text-center">
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                <span className="material-symbols-outlined text-4xl">security</span>
              </div>
              <h2 className="text-2xl font-semibold text-slate-100">System Integrity Check</h2>
              <p className="mt-3 text-slate-400">
                To protect your premium session, we've restricted access to the dashboard. Unauthorized cookie extensions were detected.
              </p>
              <div className="mt-8 flex flex-col gap-3 w-full">
                <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-2">Required Action</p>
                  <p className="text-sm text-amber-200/80 leading-relaxed">
                    Open the <b>Xtrinox Bridge</b> extension and click <b>"Resolve Conflict"</b> to restore full system integrity.
                  </p>
                </div>
              </div>
            </div>
          ) : !sessionReady ? (
            <div className="mx-auto flex max-w-lg flex-col items-center justify-center py-10 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/70 text-slate-400">
                <span className="material-symbols-outlined text-4xl">folder_off</span>
              </div>
              <h2 className="text-2xl font-semibold text-slate-100">No session data found</h2>
              <p className="mt-2 text-sm text-slate-400">Contact your administrator.</p>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-cyan-200">Boost Your Productivity Now!</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Get started with the best state of the art LLMs.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLaunchSession}
                disabled={isLaunching || launchSuccess}
                className={`h-14 w-full rounded-2xl px-6 text-base font-semibold transition ${
                  launchSuccess
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 hover:brightness-110'
                } disabled:cursor-not-allowed disabled:opacity-70`}
              >
                {launchSuccess ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="material-symbols-outlined">check_circle</span>
                    Synced Successfully
                  </span>
                ) : isLaunching ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-900/20 border-t-slate-900" />
                    Connecting Bridge...
                  </span>
                ) : (
                  'Launch Premium Session'
                )}
              </button>


              {extensionStatus === 'conflict' ? (
                <div className="rounded-xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-base">warning</span>
                    <p className="font-semibold">Security Conflict Detected</p>
                  </div>
                  <p className="text-xs text-amber-200/70">
                    Other cookie extensions are interfering. Please open the Xtrinox Bridge extension and click "Resolve Conflict".
                  </p>
                </div>
              ) : null}



              {bridgeConnected ? (
                <p className="text-xs text-slate-500">Connected via content-script bridge (auto-detected).</p>
              ) : directExtensionAvailable ? (
                <p className="text-xs text-slate-500">Connected via direct extension ID fallback.</p>
              ) : runtimeMessagingAvailable ? (
                <p className="text-xs text-slate-500">
                  Runtime available but fallback ID is unset; using bridge-only mode.
                </p>
              ) : null}

              {launchError ? (
                <div className="rounded-xl border border-red-400/25 bg-red-500/10 p-4 text-left text-sm text-red-200">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-base">error</span>
                    <p>{launchError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLaunchSession}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-red-100 underline decoration-red-300/60"
                  >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    Retry
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </section>
      </main>

    </div>
  );
}

export default App;