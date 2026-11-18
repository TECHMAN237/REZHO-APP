import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IMG } from '@rezho/shared';
import { Logo } from '@/components/Logo';
import { useAppStore } from '@/store/useAppStore';

export function SplashScreen() {
  const navigate = useNavigate();
  const onboarded = useAppStore((s) => s.onboarded);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  useEffect(() => {
    const t = setTimeout(() => {
      navigate(isAuthenticated ? '/home' : onboarded ? '/login' : '/onboarding', { replace: true });
    }, 1900);
    return () => clearTimeout(t);
  }, [navigate, onboarded, isAuthenticated]);

  return (
    <div className="relative flex-1 min-h-0 flex flex-col bg-brand-900 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,#1A6B45_0%,#0F3D2E_45%,#07271B_100%)]" aria-hidden="true" />
      <div className="relative flex-1 flex flex-col items-center justify-center px-8 text-center pt-10">
        <Logo size={128} variant="light" />
        <p className="mt-6 text-[16px] font-medium leading-snug max-w-[240px]">
          Réservez facilement hébergements, restaurants et véhicules.
        </p>
      </div>
      <div className="relative h-[42%] shrink-0">
        <img src={IMG.hotelNight} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-900 via-brand-900/40 to-brand-900/70" aria-hidden="true" />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 h-1.5 w-28 rounded-full bg-white/25 overflow-hidden" aria-hidden="true">
          <div className="splash-bar h-full rounded-full bg-lime-500" />
        </div>
      </div>
    </div>
  );
}
