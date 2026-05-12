import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Cookie,
  Users, 
  Zap, 
  Settings2, 
  ArrowLeft,
  Activity,
  ShieldCheck,
  Menu,
  X,
  LogOut
} from 'lucide-react';

import { auth } from '../firebase/config';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Package, label: 'Tools Inventory', path: '/admin/tools' },
  { icon: Cookie, label: 'Product Cookies', path: '/admin/product-cookies' },
  { icon: Users, label: 'User Directory', path: '/admin/users' },
  { icon: ShieldCheck, label: 'Entitlements', path: '/admin/entitlements' },
  { icon: Zap, label: 'Runtime Monitor', path: '/admin/runtime' },
  { icon: Activity, label: 'Audit Logs', path: '/admin/logs' },
  { icon: Settings2, label: 'System Settings', path: '/admin/system' },
];

export const AdminLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      // Firebase auth state will remain unchanged if logout fails.
    }
  };

  const sidebarContent = (
    <>
      <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#0058be', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck className="text-white" size={18} />
          </div>
          <span style={{ fontWeight: '800', fontSize: '16px', color: '#0f172a', letterSpacing: '-0.02em' }}>
            XTRINOX <span style={{ color: '#0058be', fontSize: '10px', marginLeft: '4px', verticalAlign: 'middle' }}>ADMIN</span>
          </span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.2s',
              backgroundColor: isActive ? 'rgba(0, 88, 190, 0.05)' : 'transparent',
              color: isActive ? '#0058be' : '#64748b'
            })}
            className="admin-nav-link"
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '16px', borderTop: '1px solid #f1f5f9' }}>
        <NavLink
          to="/marketplace"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#64748b',
            textDecoration: 'none',
            borderRadius: '10px'
          }}
        >
          <ArrowLeft size={18} />
          Back to Platform
        </NavLink>
        
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#ef4444',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            textAlign: 'left',
            marginTop: '4px'
          }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        width: '100%'
      }}
    >
      {/* Mobile Top Bar */}
      {isMobile && (
        <header style={{
          height: '64px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', backgroundColor: '#0058be', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck className="text-white" size={16} />
            </div>
            <span style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>XTRINOX</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ backgroundColor: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '8px' }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>
      )}

      {/* Sidebar Overlay (Mobile Only) */}
      {isMobile && isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 90
          }}
        />
      )}

      {/* Sidebar */}
      <aside 
        style={{
          width: isMobile ? '280px' : '256px',
          position: isMobile ? 'fixed' : 'sticky',
          left: isMobile ? (isMobileMenuOpen ? '0' : '-280px') : '0',
          top: 0,
          height: '100vh',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 100,
          flexShrink: 0
        }}
      >
        {sidebarContent}
      </aside>

      {/* Main Content Area */}
      <main 
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          width: '100%'
        }}
      >
        <div 
          style={{
            flex: 1,
            padding: isMobile ? '24px 16px' : '40px 32px',
            overflowY: 'auto'
          }}
        >
          <div 
            style={{
              maxWidth: '72rem', // max-w-6xl
              margin: '0 auto',
              width: '100%'
            }}
          >
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
