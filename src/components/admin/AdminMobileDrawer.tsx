import React, { useEffect } from 'react';
import { AdminRoute } from '../../types/admin';
import { AdminSidebar } from './AdminSidebar';
import { X } from 'lucide-react';

interface AdminMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoute: AdminRoute;
  onNavigate: (route: AdminRoute) => void;
  onBackToPlatform: () => void;
  onSignOut: () => void;
}

export const AdminMobileDrawer: React.FC<AdminMobileDrawerProps> = ({
  isOpen,
  onClose,
  currentRoute,
  onNavigate,
  onBackToPlatform,
  onSignOut
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 lg:hidden flex bg-[#0B0B0C]/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-72 h-full flex flex-col bg-[#FAF9F5] shadow-2xl animate-in slide-in-from-left duration-250">
        <AdminSidebar
          currentRoute={currentRoute}
          onNavigate={(route) => {
            onNavigate(route);
            onClose();
          }}
          onBackToPlatform={() => {
            onBackToPlatform();
            onClose();
          }}
          onSignOut={() => {
            onSignOut();
            onClose();
          }}
          onClose={onClose}
          className="w-full border-r-0"
        />
      </div>
    </div>
  );
};
