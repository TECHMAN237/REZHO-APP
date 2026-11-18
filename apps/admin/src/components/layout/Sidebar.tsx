import { NavLink, useNavigate } from 'react-router-dom';
import { HelpCircle, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import type { ProviderKind } from '@rezho/shared';
import { PROVIDERS, KIND_LABEL } from '@/config/providers';
import { useAdminStore } from '@/store/useAdminStore';
import { Logo } from '@/components/Logo';

export function Sidebar({ kind, mobileOpen, onCloseMobile }: { kind: ProviderKind; mobileOpen: boolean; onCloseMobile: () => void }) {
  const cfg = PROVIDERS[kind];
  const profile = useAdminStore((s) => s.profiles[kind]);
  const collapsed = useAdminStore((s) => s.sidebarCollapsed);
  const setCollapsed = useAdminStore((s) => s.setSidebarCollapsed);
  const logout = useAdminStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <>
      {mobileOpen && <button type="button" aria-label="Fermer le menu" onClick={onCloseMobile} className="fixed inset-0 z-30 bg-brand-950/50 lg:hidden" />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-brand-900 text-white transition-[width,transform] duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'lg:w-[76px]' : 'lg:w-[236px]'} w-[236px] shrink-0`}
        aria-label="Navigation latérale"
      >
        <div className={`flex items-center gap-2 px-4 pt-5 pb-3 ${collapsed ? 'lg:justify-center lg:px-2' : ''}`}>
          <Logo size={34} variant="light" wordmark={false} />
          {!collapsed && (
            <div className="leading-tight">
              <p className="text-[17px] font-extrabold tracking-[0.08em]">REZHO</p>
              <p className="text-[10px] text-white/70">{cfg.spaceLabel}</p>
            </div>
          )}
          <button type="button" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Déployer le menu' : 'Réduire le menu'} className={`ml-auto hidden lg:flex h-7 w-7 items-center justify-center rounded-[6px] text-white/60 hover:bg-white/10 hover:text-white ${collapsed ? 'hidden' : ''}`}>
            <PanelLeftClose size={16} />
          </button>
        </div>
        {collapsed && (
          <button type="button" onClick={() => setCollapsed(false)} aria-label="Déployer le menu" className="mx-auto mb-2 hidden lg:flex h-7 w-7 items-center justify-center rounded-[6px] text-white/60 hover:bg-white/10 hover:text-white">
            <PanelLeftOpen size={16} />
          </button>
        )}

        {/* Establishment card — this space only (no switching between partner spaces). */}
        <div className={`px-3 ${collapsed ? 'lg:px-2' : ''}`}>
          <NavLink to={`${cfg.basePath}/settings`} onClick={onCloseMobile} title={profile.name} className={`flex w-full items-center gap-2.5 rounded-[12px] bg-white/10 p-2 text-left hover:bg-white/15 ${collapsed ? 'lg:justify-center' : ''}`}>
            <img src={profile.image} alt="" className="h-9 w-9 rounded-[8px] object-cover shrink-0" />
            {!collapsed && (
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block truncate text-[12px] font-bold">{profile.name}</span>
                <span className="block truncate text-[10px] text-white/70">
                  {KIND_LABEL[kind]} · {profile.city}
                </span>
              </span>
            )}
          </NavLink>
        </div>

        <nav className="mt-4 flex-1 px-3 space-y-1" aria-label="Sections">
          {cfg.nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onCloseMobile}
              title={label}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-full px-3.5 h-10 text-[13px] font-semibold transition-colors ${collapsed ? 'lg:justify-center lg:px-0' : ''} ${
                  isActive ? 'bg-lime-500 text-brand-900' : 'text-white/85 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-5 space-y-1">
          <NavLink to={`${cfg.basePath}/support`} onClick={onCloseMobile} title="Aide & Support" className={({ isActive }) => `flex items-center gap-3 rounded-full px-3.5 h-10 text-[13px] font-semibold transition-colors ${collapsed ? 'lg:justify-center lg:px-0' : ''} ${isActive ? 'bg-lime-500 text-brand-900' : 'text-white/85 hover:bg-white/10'}`}>
            <HelpCircle size={18} className="shrink-0" />
            {!collapsed && <span>Aide & Support</span>}
          </NavLink>
          <button
            type="button"
            title="Se déconnecter"
            onClick={() => {
              logout(kind);
              navigate(`${cfg.basePath}/login`);
            }}
            className={`flex w-full items-center gap-3 rounded-full px-3.5 h-10 text-[13px] font-semibold text-white/70 hover:bg-white/10 hover:text-white ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Se déconnecter</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
