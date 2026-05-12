import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../state/useAuthStore';
import { useRuntimeStore } from '../state/useRuntimeStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { auth } from '../firebase/config';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export const MainLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  const { extensionStatus, extensionVersion, latestVersion } = useRuntimeStore();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const isUpdateAvailable = extensionVersion && latestVersion && extensionVersion !== latestVersion;

  const navItems = [
    { name: 'Marketplace', path: '/marketplace', icon: 'storefront' },
    { name: 'Workspace', path: '/workspace', icon: 'dashboard' },
    { name: 'Devices', path: '/devices', icon: 'devices' },
    { name: 'Settings', path: '/settings', icon: 'settings' },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      {/* Top Navigation */}
      <header className="bg-surface shadow-sm sticky top-0 z-50 border-b border-outline-variant">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-[1280px] mx-auto">
          <div className="flex items-center gap-4 md:gap-10">
            <Link to="/" className="font-bold tracking-tight text-primary text-2xl lg:text-3xl">Xtrinox</Link>
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "font-medium transition-colors duration-200 py-1 border-b-2 text-sm lg:text-base",
                    location.pathname === item.path
                      ? "text-primary font-bold border-primary"
                      : "text-on-surface-variant border-transparent hover:text-primary"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            {/* Extension Status Badge - Desktop */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant">
              <div className={cn(
                "h-2 w-2 rounded-full",
                extensionStatus === 'connected' ? "bg-emerald-500" : 
                extensionStatus === 'conflict' ? "bg-amber-500" : "bg-red-500"
              )} />
              <span className="text-on-surface-variant capitalize" style={{ fontSize: '12px', lineHeight: '1', letterSpacing: '0.02em', fontWeight: 500 }}>
                {extensionStatus === 'connected' ? (isUpdateAvailable ? 'Update Available' : 'Connected') : extensionStatus}
              </span>
            </div>

            {user ? (
              <div className="hidden sm:flex items-center gap-4 ml-4">
                <div className="text-right">
                  <p className="uppercase font-bold text-outline" style={{ fontSize: '10px' }}>Active User</p>
                  <p className="font-bold text-on-surface" style={{ fontSize: '12px', lineHeight: '1', letterSpacing: '0.02em', fontWeight: 500 }}>{user.email}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold">
                  {user.email?.[0].toUpperCase()}
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-on-surface-variant hover:text-error transition-colors"
                  title="Sign Out"
                >
                  <span className="material-symbols-outlined">logout</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:block bg-primary text-on-primary rounded-lg font-bold shadow-sm hover:shadow active:scale-95 transition-all" style={{ padding: '8px 24px' }}>
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-outline-variant bg-surface" style={{ animation: 'slideDown 0.2s ease-out' }}>
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes slideDown {
                from { opacity: 0; transform: translateY(-8px); }
                to   { opacity: 1; transform: translateY(0); }
              }
            `}} />
            <nav className="flex flex-col" style={{ padding: '8px 0' }}>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 transition-colors duration-200",
                    location.pathname === item.path
                      ? "bg-primary-fixed text-primary font-bold"
                      : "text-on-surface-variant hover:bg-surface-container-low"
                  )}
                  style={{ padding: '14px 24px', fontSize: '15px', gap: '12px' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '22px', fontVariationSettings: location.pathname === item.path ? "'FILL' 1" : "'FILL' 0" }}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Mobile User Section */}
            <div className="border-t border-outline-variant" style={{ padding: '16px 24px' }}>
              {/* Extension Status */}
              <div className="flex items-center gap-2 mb-3">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  extensionStatus === 'connected' ? "bg-emerald-500" : 
                  extensionStatus === 'conflict' ? "bg-amber-500" : "bg-red-500"
                )} />
                <span className="text-on-surface-variant capitalize" style={{ fontSize: '12px', fontWeight: 500 }}>
                  Bridge: {extensionStatus === 'connected' ? (isUpdateAvailable ? 'Update Available' : 'Connected') : extensionStatus}
                </span>
              </div>

              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold" style={{ fontSize: '16px' }}>
                      {user.email?.[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-on-surface" style={{ fontSize: '13px' }}>{user.email}</p>
                      <p className="text-outline" style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' }}>Active Session</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="flex items-center gap-2 text-on-surface-variant hover:text-error transition-colors rounded-lg"
                    style={{ padding: '8px 12px', fontSize: '13px', fontWeight: 500 }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center bg-primary text-on-primary rounded-lg font-bold shadow-sm hover:shadow active:scale-95 transition-all"
                  style={{ padding: '12px 24px', fontSize: '15px' }}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow max-w-[1280px] w-full mx-auto" style={{ paddingLeft: '24px', paddingRight: '24px', paddingTop: '40px', paddingBottom: '40px' }}>
        {children || <Outlet />}
      </main>

      <footer className="bg-surface border-t border-outline-variant mt-auto">
        <div className="w-full flex flex-col md:flex-row justify-between items-center max-w-[1280px] mx-auto" style={{ padding: '40px 24px', gap: '16px' }}>
          <div className="flex flex-col items-center md:items-start">
            <span className="font-bold text-on-surface mb-2" style={{ fontSize: '16px', lineHeight: '1.4', fontWeight: 600 }}>Xtrinox</span>
            <p className="text-on-surface-variant" style={{ fontSize: '11px', lineHeight: '1', letterSpacing: '0.03em', fontWeight: 600 }}>© 2024 Xtrinox AI Marketplace. Built for precision.</p>
          </div>
          <div className="flex" style={{ gap: '24px' }}>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#" style={{ fontSize: '11px', lineHeight: '1', letterSpacing: '0.03em', fontWeight: 600 }}>Privacy Policy</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#" style={{ fontSize: '11px', lineHeight: '1', letterSpacing: '0.03em', fontWeight: 600 }}>Terms</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#" style={{ fontSize: '11px', lineHeight: '1', letterSpacing: '0.03em', fontWeight: 600 }}>Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
