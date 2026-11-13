import React from 'react';
import { AdminRoute } from '../../types/admin';
import { assetUrl } from '../../utils/assetUrl';
import {
  Shield,
  LayoutDashboard,
  Package,
  KeyRound,
  ShieldCheck,
  Users,
  Activity,
  ScrollText,
  Sliders,
  ArrowLeft,
  LogOut,
  ExternalLink,
  X
} from 'lucide-react';

interface NavItem {
  id: AdminRoute;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

interface AdminSidebarProps {
  currentRoute: AdminRoute;
  onNavigate: (route: AdminRoute) => void;
  onBackToPlatform: () => void;
  onSignOut: () => void;
  onClose?: () => void;
  className?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentRoute,
  onNavigate,
  onBackToPlatform,
  onSignOut,
  onClose,
  className = ''
}) => {
  const navGroups: NavGroup[] = [
    {
      groupName: 'Overview',
      items: [
        {
          id: 'admin/dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard className="w-4 h-4 shrink-0" />
        }
      ]
    },
    {
      groupName: 'Marketplace Management',
      items: [
        {
          id: 'admin/tools',
          label: 'Tools Inventory',
          icon: <Package className="w-4 h-4 shrink-0" />
        },
        {
          id: 'admin/product-cookies',
          label: 'Product Cookies',
          icon: <KeyRound className="w-4 h-4 shrink-0" />
        },
        {
          id: 'admin/entitlements',
          label: 'Entitlements',
          icon: <ShieldCheck className="w-4 h-4 shrink-0" />
        }
      ]
    },
    {
      groupName: 'User Management',
      items: [
        {
          id: 'admin/users',
          label: 'User Directory',
          icon: <Users className="w-4 h-4 shrink-0" />
        }
      ]
    },
    {
      groupName: 'Operations',
      items: [
        {
          id: 'admin/runtime',
          label: 'Runtime Monitor',
          icon: <Activity className="w-4 h-4 shrink-0" />
        },
        {
          id: 'admin/logs',
          label: 'Audit Logs',
          icon: <ScrollText className="w-4 h-4 shrink-0" />
        }
      ]
    },
    {
      groupName: 'Configuration',
      items: [
        {
          id: 'admin/system',
          label: 'System Settings',
          icon: <Sliders className="w-4 h-4 shrink-0" />
        }
      ]
    }
  ];

  return (
    <aside
      className={`w-64 h-full flex flex-col bg-[#FAF9F5] border-r border-[#E4E3DD] text-[#0B0B0C] select-none ${className}`}
    >
      {/* Brand & Environment Header */}
      <div className="p-5 border-b border-[#E4E3DD] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <img
            src={assetUrl('assets/aistudio/main2_dc044820.png')}
            alt="Xtrinox Admin"
            className="w-8 h-8 rounded-xl object-contain shadow-xs shrink-0 select-none"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-black text-sm tracking-tight text-[#0B0B0C]">
                XTRINOX
              </span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-[#F3F2EE] text-[#0B0B0C] border border-[#E4E3DD]">
                ADMIN
              </span>
            </div>
            <span className="text-[10px] text-[#71717A] block font-medium">
              Management Console
            </span>
          </div>
        </div>

        {/* Environment Badge on desktop, Close button in mobile drawer */}
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#71717A] hover:text-[#0B0B0C] hover:bg-[#EBEAE5] transition-colors cursor-pointer"
            aria-label="Close admin menu"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#E8F8D6] text-[#22570A] border border-[#C6EDB0]">
            PROD
          </span>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-6 scrollbar-none">
        {navGroups.map((group) => (
          <div key={group.groupName} className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] px-2.5 mb-1.5 block">
              {group.groupName}
            </span>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                // Feature flags route shares same view as system
                const isActive =
                  currentRoute === item.id ||
                  (item.id === 'admin/system' && currentRoute === 'admin/feature-flags');

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between group transition-all duration-150 cursor-pointer relative ${
                      isActive
                        ? 'bg-[#B6FF2E] text-[#0B0B0C] font-bold shadow-xs'
                        : 'text-[#52525B] hover:text-[#0B0B0C] hover:bg-[#EBEAE5]'
                    }`}
                  >
                    {/* Left active indicator pill in Ink Black */}
                    {isActive && (
                      <span
                        className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-[#0B0B0C]"
                        aria-hidden="true"
                      />
                    )}
                    <div className="flex items-center gap-2.5 truncate pl-1">
                      <span
                        className={`${
                          isActive
                            ? 'text-[#0B0B0C]'
                            : 'text-[#71717A] group-hover:text-[#0B0B0C]'
                        } transition-colors`}
                      >
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          isActive
                            ? 'bg-[#0B0B0C] text-[#B6FF2E]'
                            : 'bg-[#E4E3DD] text-[#0B0B0C]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-[#E4E3DD] space-y-1 shrink-0 bg-[#FAF9F5]">
        <button
          type="button"
          onClick={onBackToPlatform}
          className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium text-[#52525B] hover:text-[#0B0B0C] hover:bg-[#EBEAE5] flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Platform</span>
          </div>
          <ExternalLink className="w-3 h-3 text-[#71717A]" />
        </button>

        <button
          type="button"
          onClick={onSignOut}
          className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out Admin</span>
        </button>
      </div>
    </aside>
  );
};
