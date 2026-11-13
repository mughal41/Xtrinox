import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { RouteName, BridgeState, UserProfile } from './types';
import { AdminRoute } from './types/admin';
import { SharedHeader } from './components/SharedHeader';
import { SharedFooter } from './components/SharedFooter';
import { useAuthStore } from './state/useAuthStore';
import { useSubscriptionStore } from './state/useSubscriptionStore';
import { useRuntimeStore } from './state/useRuntimeStore';
import { firestoreService } from './services/firestore.service';
import { getFullDeviceInfo } from './services/device.service';

// Lazy-loaded Consumer Route Pages
const MarketplacePage = lazy(() => import('./pages/MarketplacePage').then(m => ({ default: m.MarketplacePage })));
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage').then(m => ({ default: m.ProductDetailsPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const WorkspacePage = lazy(() => import('./pages/WorkspacePage').then(m => ({ default: m.WorkspacePage })));
const DevicesPage = lazy(() => import('./pages/DevicesPage').then(m => ({ default: m.DevicesPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

// Lazy-loaded Admin Portal Components
const AdminGuard = lazy(() => import('./components/admin/AdminGuard').then(m => ({ default: m.AdminGuard })));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminToolsPage = lazy(() => import('./pages/admin/AdminToolsPage').then(m => ({ default: m.AdminToolsPage })));
const AdminProductCookiesPage = lazy(() => import('./pages/admin/AdminProductCookiesPage').then(m => ({ default: m.AdminProductCookiesPage })));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));
const AdminEntitlementsPage = lazy(() => import('./pages/admin/AdminEntitlementsPage').then(m => ({ default: m.AdminEntitlementsPage })));
const AdminRuntimePage = lazy(() => import('./pages/admin/AdminRuntimePage').then(m => ({ default: m.AdminRuntimePage })));
const AdminLogsPage = lazy(() => import('./pages/admin/AdminLogsPage').then(m => ({ default: m.AdminLogsPage })));
const AdminSystemPage = lazy(() => import('./pages/admin/AdminSystemPage').then(m => ({ default: m.AdminSystemPage })));
import { BrandSpinner } from './components/BrandSpinner';

const PageLoadingFallback: React.FC = () => (
  <div
    className="min-h-[60vh] flex-1 flex items-center justify-center p-8 bg-transparent"
    role="status"
    aria-label="Loading page content"
  >
    <BrandSpinner size="lg" />
  </div>
);

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<RouteName>('marketplace');
  const [routeParam, setRouteParam] = useState<string>('quillbot');
  const [manualBridgeOverride, setManualBridgeOverride] = useState<BridgeState | null>(null);

  // Real backend auth & subscription stores
  const { user: authUser, isAdmin, loading: authLoading, initialized: authInitialized, initialize: initAuth, signOut } = useAuthStore();
  const { userDoc, fetchSubscriptions, clear: clearSubscriptions } = useSubscriptionStore();
  const { 
    bridgeConnected, 
    extensionStatus, 
    syncState, 
    deviceBlocked, 
    initialize: initRuntime, 
    setDeviceBlocked, 
    setCurrentDeviceId 
  } = useRuntimeStore();

  // Permanent single global theme: Chalk White + Ink Black + Acid Green
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'chalk-ink-acid');
  }, []);

  // Initialize Auth & Runtime listeners on mount
  useEffect(() => {
    const unsubAuth = initAuth();
    const unsubRuntime = initRuntime();
    return () => {
      unsubAuth();
      unsubRuntime();
    };
  }, [initAuth, initRuntime]);

  // Clear manual override once real extension reports an active connection
  useEffect(() => {
    if (extensionStatus === 'connected' && bridgeConnected) {
      setManualBridgeOverride(null);
    }
  }, [extensionStatus, bridgeConnected]);

  useEffect(() => {
    if (authUser) {
      fetchSubscriptions(authUser.uid);
      getFullDeviceInfo().then(async (devInfo) => {
        try {
          const isBlocked = await firestoreService.isDeviceBlocked(authUser.uid, devInfo.deviceId);
          setDeviceBlocked(isBlocked);
          setCurrentDeviceId(devInfo.deviceId);
          await firestoreService.registerOrUpdateDevice(authUser.uid, devInfo);
        } catch (err) {
          console.warn('Device registration error:', err);
        }
      });
      // Throttle heartbeat runtime update
      firestoreService.updateRuntimeState(authUser.uid, {
        browser: navigator.userAgent,
        os: navigator.platform,
        extensionConnected: bridgeConnected,
        extensionVersion: useRuntimeStore.getState().extensionVersion || 'unknown',
        status: 'active'
      }).catch(() => {});
    } else {
      clearSubscriptions();
    }
  }, [authUser, fetchSubscriptions, clearSubscriptions, setDeviceBlocked, setCurrentDeviceId, bridgeConnected]);

  // Derived bridge state for visual UI indicators (with manual override support for prototype drawer)
  const bridgeState: BridgeState = useMemo(() => {
    if (manualBridgeOverride) return manualBridgeOverride;
    if (deviceBlocked) return 'blocked';
    if (syncState === 'syncing') return 'syncing';
    if (syncState === 'success') return 'success';
    if (syncState === 'failed') return 'failed';
    if (extensionStatus === 'conflict') return 'conflict';
    if (bridgeConnected || extensionStatus === 'connected') return 'ready';
    return 'disconnected';
  }, [manualBridgeOverride, deviceBlocked, syncState, extensionStatus, bridgeConnected]);

  // Unified user profile object for consumers
  const user: UserProfile = useMemo(() => {
    if (!authUser) {
      return {
        name: '',
        email: '',
        bio: '',
        isAdmin: false
      };
    }
    return {
      name: authUser.displayName || userDoc?.displayName || authUser.email?.split('@')[0] || 'Member',
      email: authUser.email || '',
      bio: userDoc?.bio || '',
      isAdmin: isAdmin
    };
  }, [authUser, userDoc, isAdmin]);

  // URL route parsing on initial load and popstate
  useEffect(() => {
    const parseUrl = () => {
      let path = window.location.pathname.toLowerCase();
      // Support GitHub Pages basename /Xtrinox/
      if (path.startsWith('/xtrinox')) {
        path = path.replace('/xtrinox', '') || '/';
      }

      const params = new URLSearchParams(window.location.search);
      const queryPage = params.get('page') as RouteName | null;

      if (queryPage) {
        setCurrentRoute(queryPage);
        const qParam = params.get('id');
        if (qParam) setRouteParam(qParam);
        return;
      }

      if (path.startsWith('/admin')) {
        const adminSub = path.replace(/^\/admin\/?/, '');
        if (adminSub === 'tools') setCurrentRoute('admin/tools');
        else if (adminSub === 'product-cookies') setCurrentRoute('admin/product-cookies');
        else if (adminSub === 'users') setCurrentRoute('admin/users');
        else if (adminSub === 'entitlements') setCurrentRoute('admin/entitlements');
        else if (adminSub === 'runtime') setCurrentRoute('admin/runtime');
        else if (adminSub === 'logs') setCurrentRoute('admin/logs');
        else if (adminSub === 'system') setCurrentRoute('admin/system');
        else if (adminSub === 'feature-flags') setCurrentRoute('admin/feature-flags');
        else setCurrentRoute('admin/dashboard');
      } else if (path.startsWith('/checkout')) {
        setCurrentRoute('checkout');
        const parts = path.split('/');
        if (parts[2]) setRouteParam(parts[2]);
      } else if (path.startsWith('/marketplace/')) {
        setCurrentRoute('product-details');
        const parts = path.split('/');
        if (parts[2]) setRouteParam(parts[2]);
      } else if (path === '/workspace') {
        setCurrentRoute('workspace');
      } else if (path === '/devices') {
        setCurrentRoute('devices');
      } else if (path === '/settings') {
        setCurrentRoute('settings');
      } else if (path === '/login') {
        setCurrentRoute('login');
      } else {
        setCurrentRoute('marketplace');
      }
    };

    parseUrl();

    const handlePopState = () => parseUrl();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (route: RouteName, param?: string) => {
    setCurrentRoute(route);
    if (param) setRouteParam(param);

    // Support both root deployment and GitHub Pages /Xtrinox/ sub-path
    const isGhPages =
      typeof window !== 'undefined' &&
      window.location.pathname.toLowerCase().startsWith('/xtrinox');
    const prefix = isGhPages ? '/Xtrinox' : '';

    // Update browser URL
    let path = `${prefix}/marketplace`;
    if (route.startsWith('admin/')) {
      const sub = route.replace('admin/', '');
      path = `${prefix}/admin/${sub}`;
    } else if (route === 'marketplace') path = `${prefix}/marketplace`;
    else if (route === 'product-details') path = `${prefix}/marketplace/${param || routeParam || 'quillbot'}`;
    else if (route === 'login') path = `${prefix}/login`;
    else if (route === 'checkout') path = `${prefix}/checkout/${param || routeParam || 'quillbot'}`;
    else if (route === 'workspace') path = `${prefix}/workspace`;
    else if (route === 'devices') path = `${prefix}/devices`;
    else if (route === 'settings') path = `${prefix}/settings`;

    try {
      window.history.pushState({}, '', path);
    } catch {
      // Fallback for strict iframe sandboxes
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = async () => {
    await signOut();
    navigateTo('login');
  };

  // Route protection for private consumer pages
  const isProtectedRoute = (r: RouteName) => {
    return r === 'checkout' || r === 'workspace' || r === 'devices' || r === 'settings';
  };

  useEffect(() => {
    if (!authLoading && authInitialized && !authUser && isProtectedRoute(currentRoute)) {
      navigateTo('login');
    }
  }, [authLoading, authInitialized, authUser, currentRoute]);

  const isAdminRoute = currentRoute.startsWith('admin/');

  // Show fallback while initial auth state is resolving for protected routes
  if (authLoading && !authInitialized && (isProtectedRoute(currentRoute) || isAdminRoute)) {
    return <PageLoadingFallback />;
  }

  // If viewing an Admin route, render through AdminGuard and AdminLayout
  if (isAdminRoute) {
    const adminRoute = currentRoute as AdminRoute;
    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <AdminGuard onBackToMarketplace={() => navigateTo('marketplace')}>
          <AdminLayout
            currentRoute={adminRoute}
            onNavigate={(r) => navigateTo(r as RouteName)}
            onBackToPlatform={() => navigateTo('marketplace')}
          >
            <Suspense fallback={<PageLoadingFallback />}>
              {adminRoute === 'admin/dashboard' && (
                <AdminDashboardPage onNavigate={(r) => navigateTo(r as RouteName)} />
              )}
              {adminRoute === 'admin/tools' && <AdminToolsPage />}
              {adminRoute === 'admin/product-cookies' && <AdminProductCookiesPage />}
              {adminRoute === 'admin/users' && <AdminUsersPage />}
              {adminRoute === 'admin/entitlements' && (
                <AdminEntitlementsPage
                  onNavigateToCookies={() => navigateTo('admin/product-cookies')}
                />
              )}
              {adminRoute === 'admin/runtime' && <AdminRuntimePage />}
              {adminRoute === 'admin/logs' && <AdminLogsPage />}
              {(adminRoute === 'admin/system' || adminRoute === 'admin/feature-flags') && (
                <AdminSystemPage />
              )}
            </Suspense>
          </AdminLayout>
        </AdminGuard>
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--brand)] selection:text-white transition-colors">
      {/* Shared Adaptive Header */}
      <SharedHeader
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        bridgeState={bridgeState}
        user={user}
      />

      {/* Main Routed Content */}
      <main className="flex-1">
        <Suspense fallback={<PageLoadingFallback />}>
          {currentRoute === 'marketplace' && (
            <MarketplacePage onNavigate={navigateTo} />
          )}

          {currentRoute === 'product-details' && (
            <ProductDetailsPage
              productId={routeParam}
              onNavigate={navigateTo}
            />
          )}

          {currentRoute === 'login' && (
            <LoginPage
              onNavigate={navigateTo}
              onLoginSuccess={() => {
                navigateTo('workspace');
              }}
            />
          )}

          {currentRoute === 'checkout' && (
            <CheckoutPage
              productId={routeParam}
              onNavigate={navigateTo}
            />
          )}

          {currentRoute === 'workspace' && (
            <WorkspacePage
              onNavigate={navigateTo}
              bridgeState={bridgeState}
              setBridgeState={(s) => setManualBridgeOverride(s)}
            />
          )}

          {currentRoute === 'devices' && (
            <DevicesPage onNavigate={navigateTo} />
          )}

          {currentRoute === 'settings' && (
            <SettingsPage
              onNavigate={navigateTo}
              user={user}
              setUser={() => {}}
              onSignOut={handleSignOut}
            />
          )}
        </Suspense>
      </main>

      {/* Shared Footer (hidden on login to preserve focused authentication goal) */}
      {currentRoute !== 'login' && (
        <SharedFooter onNavigate={navigateTo} />
      )}
    </div>
  );
}

