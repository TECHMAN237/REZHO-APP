import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface TopBarProps {
  title?: ReactNode;
  back?: boolean | string;
  right?: ReactNode;
  transparent?: boolean;
}

export function TopBar({ title, back, right, transparent }: TopBarProps) {
  const navigate = useNavigate();
  const goBack = () => {
    if (typeof back === 'string') navigate(back);
    else if (window.history.length > 1) navigate(-1);
    else navigate('/home');
  };
  return (
    <header
      className={`relative z-20 flex items-center gap-2 px-4 h-14 shrink-0 sm:mt-10 ${transparent ? '' : 'bg-brand-50'}`}
    >
      {back ? (
        <button
          type="button"
          onClick={goBack}
          aria-label="Retour"
          className="h-9 w-9 -ml-1 rounded-full flex items-center justify-center text-ink-900 hover:bg-white/70"
        >
          <ArrowLeft size={20} />
        </button>
      ) : null}
      {typeof title === 'string' ? (
        <h1 className="flex-1 text-[16px] font-bold text-ink-900 truncate">{title}</h1>
      ) : (
        <div className="flex-1 min-w-0">{title}</div>
      )}
      {right && <div className="flex items-center gap-2">{right}</div>}
    </header>
  );
}

interface ScreenProps {
  children: ReactNode;
  topBar?: TopBarProps;
  footer?: ReactNode;
  /** Add bottom padding so content clears the bottom navigation */
  withNav?: boolean;
  className?: string;
  padded?: boolean;
}

/** Standard scrollable screen: top bar, scroll area, optional sticky footer. */
export function Screen({ children, topBar, footer, withNav, className = '', padded = true }: ScreenProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0 bg-brand-50 screen-in">
      {topBar && <TopBar {...topBar} />}
      <main className={`flex-1 min-h-0 overflow-y-auto no-scrollbar ${padded ? 'px-4' : ''} ${withNav ? 'pb-24' : 'pb-6'} ${className}`}>
        {children}
      </main>
      {footer && <div className="shrink-0 border-t border-ink-100 bg-white px-4 pt-3 pb-4">{footer}</div>}
    </div>
  );
}
