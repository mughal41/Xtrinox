import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { WorkspacePage } from './pages/WorkspacePage';
import { DevicesPage } from './pages/DevicesPage';
import { SettingsPage } from './pages/SettingsPage';
import { ModernRuntimeModals } from './components/ModernRuntimeModals';
import { useAuthStore } from './state/useAuthStore';
import { useRuntimeStore } from './state/useRuntimeStore';
import { useSubscriptionStore } from './state/useSubscriptionStore';
import { initializeMarketplace } from './services/init.service';

import { AdminLayout } from './components/AdminLayout';
import { AdminGuard } from './components/AdminGuard';
import { PagePreloader } from './components/PagePreloader';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <PagePreloader message="Verifying secure  access..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ToolManager } from './pages/admin/ToolManager';
import { UserManager } from './pages/admin/UserManager';
import { EntitlementWizard } from './pages/admin/EntitlementWizard';
import { AuditLogs } from './pages/admin/AuditLogs';

import { RuntimeMonitor } from './pages/admin/RuntimeMonitor';
import { SystemSettings } from './pages/admin/SystemSettings';

import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';

import { getFullDeviceInfo, computeFingerprint } from './services/device.service';
import { firestoreService } from './services/firestore.service';

function App() {
  const initializeAuth = useAuthStore((state) => state.initialize);
  const initializeRuntime = useRuntimeStore((state) => state.initialize);

  const { user } = useAuthStore();
  const fetchSubscriptions = useSubscriptionStore((state) => state.fetchSubscriptions);
  const clearSubscriptions = useSubscriptionStore((state) => state.clear);
  const setDeviceBlocked = useRuntimeStore((state) => state.setDeviceBlocked);
  const setCurrentDeviceId = useRuntimeStore((state) => state.setCurrentDeviceId);

  useEffect(() => {
    const unsubAuth = initializeAuth();
    const unsubRuntime = initializeRuntime();
    initializeMarketplace();

    // 1. App-level device check (before/during auth)
    computeFingerprint().then(async (fp) => {
      setCurrentDeviceId(fp);
      const isBlocked = await firestoreService.isDeviceBlocked(fp);
      if (isBlocked) setDeviceBlocked(true);
    });

    return () => {
      unsubAuth();
      if (typeof unsubRuntime === 'function') unsubRuntime();
    };
  }, [initializeAuth, initializeRuntime, setCurrentDeviceId, setDeviceBlocked]);

  useEffect(() => {
    if (user) {
      fetchSubscriptions(user.uid);
      
      // 2. User-authenticated device registration
      getFullDeviceInfo().then(async (deviceInfo) => {
        await firestoreService.registerOrUpdateDevice(user.uid, deviceInfo);
        
        // Re-check block status just in case
        const isBlocked = await firestoreService.isDeviceBlocked(deviceInfo.deviceId);
        if (isBlocked) setDeviceBlocked(true);
      });

    } else {
      clearSubscriptions();
    }
  }, [user, fetchSubscriptions, clearSubscriptions, setDeviceBlocked]);

  return (
    <Router basename="/Xtrinox/">
      <Routes>
        {/* Admin Portal (Isolated Layout) */}
        <Route 
          path="/admin" 
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="tools" element={<ToolManager />} />
          <Route path="users" element={<UserManager />} />
          <Route path="entitlements" element={<EntitlementWizard />} />
          <Route path="runtime" element={<RuntimeMonitor />} />
          <Route path="logs" element={<AuditLogs />} />
          <Route path="feature-flags" element={<SystemSettings />} />
          <Route path="system" element={<SystemSettings />} />
        </Route>

        {/* Public/User App */}
        <Route element={<MainLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/marketplace/:id" element={<ProductDetailPage />} />
          <Route 
            path="/checkout/:id" 
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/workspace" 
            element={
              <ProtectedRoute>
                <WorkspacePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/devices" 
            element={
              <ProtectedRoute>
                <DevicesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/marketplace" replace />} />
          <Route path="*" element={<Navigate to="/marketplace" replace />} />
        </Route>
      </Routes>
      <ModernRuntimeModals />
    </Router>
  );
}

export default App;