import type { ReactNode } from 'react';
import { BatteryFull, Signal, Wifi } from 'lucide-react';
import { ToastHost } from '@/components/ui/overlays';

/**
 * On narrow viewports the app fills the screen like a native app.
 * On wider viewports it is presented inside a centered phone-sized frame
 * sized like an iPhone 11 (414 × 896 logical px) so the mobile experience can be
 * explored from a desktop browser.
 */
export function PhoneFrame({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <div className="min-h-full w-full flex items-stretch justify-center sm:items-center sm:py-6">
      <div
        className="relative flex flex-col w-full h-[100dvh] sm:h-[896px] sm:max-h-[calc(100dvh-48px)] sm:w-[414px] sm:rounded-[44px] sm:border-[8px] sm:border-ink-900 sm:shadow-phone overflow-hidden bg-brand-50"
        id="phone-frame"
      >
        <StatusBar dark={dark} />
        <div className="relative flex-1 min-h-0 flex flex-col">{children}</div>
        <ToastHost />
      </div>
    </div>
  );
}

function StatusBar({ dark }: { dark?: boolean }) {
  return (
    <div
      className={`hidden sm:flex items-center justify-between px-6 h-10 shrink-0 text-[12px] font-semibold ${dark ? 'bg-transparent text-white absolute top-0 left-0 right-0 z-30' : 'bg-transparent text-ink-900 absolute top-0 left-0 right-0 z-30'}`}
      aria-hidden="true"
    >
      <span>9:41</span>
      <span className="flex items-center gap-1.5">
        <Signal size={14} />
        <Wifi size={14} />
        <BatteryFull size={16} />
      </span>
    </div>
  );
}
