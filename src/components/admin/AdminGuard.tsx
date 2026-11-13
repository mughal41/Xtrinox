import React, { useState } from 'react';
import { useAuthStore } from '../../state/useAuthStore';
import { Shield, ShieldAlert, RefreshCw, ArrowLeft } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
  onBackToMarketplace: () => void;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({
  children,
  onBackToMarketplace
}) => {
  const { user, isAdmin, loading, initialized, refreshAdminStatus } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(false);

  const handleRetry = async () => {
    setIsVerifying(true);
    try {
      await refreshAdminStatus();
    } finally {
      setIsVerifying(false);
    }
  };

  // State 1: Verifying administrative credentials
  if (loading || !initialized || isVerifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F3F2EE] text-[#0B0B0C] p-6 selection:bg-[#0B0B0C] selection:text-[#F3F2EE]">
        <div className="w-full max-w-sm rounded-2xl border border-[#E4E3DD] bg-white p-8 shadow-xl flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Animated Shield Scanning Mark */}
          <div className="relative w-16 h-16 rounded-2xl bg-[#0B0B0C] border border-[#0B0B0C] flex items-center justify-center shadow-lg overflow-hidden">
            <Shield className="w-8 h-8 text-[#B6FF2E] animate-pulse" />
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#B6FF2E] to-transparent animate-pulse top-1/2 -translate-y-1/2" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#71717A] block font-mono">
              XTRINOX SECURITY SUBSYSTEM
            </span>
            <h1 className="text-lg font-bold text-[#0B0B0C] font-heading">
              Verifying administrative credentials
            </h1>
            <p className="text-xs text-[#52525B] leading-relaxed max-w-xs">
              Validating cryptographic ID token and verifying administrative custom claim from security authority...
            </p>
          </div>

          <div className="w-48 h-1 bg-[#E4E3DD] rounded-full overflow-hidden">
            <div className="h-full bg-[#B6FF2E] rounded-full w-1/3 animate-indeterminate" />
          </div>

          <span className="text-[11px] text-[#71717A] font-mono">
            claim: tokenResult.claims.admin === true
          </span>
        </div>
      </div>
    );
  }

  // State 2: Access-restricted state (Requires admin: true claim)
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F3F2EE] text-[#0B0B0C] p-6 selection:bg-[#0B0B0C] selection:text-[#F3F2EE]">
        <div className="w-full max-w-md rounded-2xl border border-[#E4E3DD] bg-white p-8 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600 block font-mono">
              SECURITY CLEARANCE REQUIRED
            </span>
            <h1 className="text-xl font-bold text-[#0B0B0C] font-heading">
              Access Restricted
            </h1>
            <p className="text-xs text-[#52525B] leading-relaxed max-w-sm mx-auto">
              This management workspace requires authenticated administrative privileges (<code className="text-[#0B0B0C] bg-[#F3F2EE] px-1.5 py-0.5 rounded border border-[#E4E3DD] font-mono text-[11px]">admin: true</code> custom claim).
              {!user ? ' You are currently not signed in.' : ' Your signed-in account does not possess administrator claims.'}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleRetry}
              disabled={isVerifying}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#E4E3DD] bg-[#FAF9F5] hover:bg-[#EBEAE5] text-[#0B0B0C] text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#71717A] ${isVerifying ? 'animate-spin' : ''}`} />
              <span>Retry Access</span>
            </button>
            <button
              type="button"
              onClick={onBackToMarketplace}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B0B0C] text-[#F3F2EE] hover:bg-[#1F2024] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Marketplace</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Admin authorized
  return <>{children}</>;
};
