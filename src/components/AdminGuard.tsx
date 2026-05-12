import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../state/useAuthStore';
import { PagePreloader } from './PagePreloader';

export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, loading, initialized, refreshAdminStatus } = useAuthStore();
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    if (initialized && user && !isAdmin && !refreshing) {
      setRefreshing(true);
      refreshAdminStatus().finally(() => setRefreshing(false));
    }
  }, [initialized, user, isAdmin]);

  if (loading || !initialized || refreshing) {
    return <PagePreloader message="Verifying administrative credentials..." />;
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f9f9ff] px-6">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl">shield_person</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-slate-500 text-sm mb-8">
            This workspace requires administrative privileges. If you've just been granted access, please try refreshing your session.
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => refreshAdminStatus()}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
            >
              Retry Access
            </button>
            <Navigate to="/marketplace" replace />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
