import { createContext, useContext, useState, type ReactNode } from 'react';
import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import type { ProviderKind } from '@rezho/shared';
import { PROVIDERS } from '@/config/providers';
import { useAdminStore } from '@/store/useAdminStore';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastHost } from '@/components/ui';

interface ShellContextValue {
  kind: ProviderKind;
  openMobile: () => void;
}

const ShellContext = createContext<ShellContextValue | null>(null);

export function useShell(): ShellContextValue {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error('useShell must be used inside AppShell');
  return ctx;
}

/**
 * Layout for /partner/:kind/* — persistent sidebar + scrollable content.
 * Each partner space is isolated: it only accepts its own session. A hotel
 * session never grants access to the restaurant or vehicle space; the user is
 * sent to that space's own login page instead.
 */
export function AppShell() {
  const { kind: kindParam } = useParams();
  const kind = (kindParam ?? '') as ProviderKind;
  const session = useAdminStore((s) => (PROVIDERS[kind] ? s.sessions[kind] : null));
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!PROVIDERS[kind]) return <Navigate to="/partner/login" replace />;
  if (!session) return <Navigate to={`${PROVIDERS[kind].basePath}/login`} replace state={{ from: location.pathname }} />;

  return (
    <ShellContext.Provider value={{ kind, openMobile: () => setMobileOpen(true) }}>
      <div className="flex h-full min-h-screen bg-brand-50">
        <Sidebar kind={kind} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Outlet />
        </div>
        <ToastHost />
      </div>
    </ShellContext.Provider>
  );
}

interface PageProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  /** Narrower content (forms) */
  narrow?: boolean;
}

/** Standard page: top bar (title, subtitle, actions, bell, avatar) + content. */
export function Page({ title, subtitle, actions, children, narrow }: PageProps) {
  const { kind, openMobile } = useShell();
  return (
    <div className="flex flex-1 flex-col min-h-screen page-in">
      <Topbar kind={kind} onOpenMobile={openMobile} title={title} subtitle={subtitle} right={actions} />
      <main className={`flex-1 px-5 pb-10 lg:px-8 ${narrow ? 'max-w-[1100px]' : ''}`}>{children}</main>
    </div>
  );
}
