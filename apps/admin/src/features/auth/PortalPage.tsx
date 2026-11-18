import { Link } from 'react-router-dom';
import { ArrowRight, BedDouble, Car, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import type { ProviderKind } from '@rezho/shared';
import { PROVIDERS, PROVIDER_KINDS, KIND_LABEL } from '@/config/providers';
import { Logo } from '@/components/Logo';

const ICON: Record<ProviderKind, LucideIcon> = { hotels: BedDouble, restaurants: UtensilsCrossed, vehicles: Car };
const BLURB: Record<ProviderKind, string> = {
  hotels: 'Hôtels, résidences, appartements et lodges.',
  restaurants: 'Restaurants, menus et réservations de tables.',
  vehicles: 'Agences de location et gestion de flotte.',
};

/**
 * /partner/login — neutral entry point listing the three partner spaces.
 * Each space has its own login address and its own session.
 */
export function PortalPage() {
  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-[1000px]">
        <div className="flex flex-col items-center text-center">
          <Logo size={72} />
          <h1 className="mt-4 text-[24px] font-extrabold text-ink-900">Espace Partenaire REZHO</h1>
          <p className="mt-1 max-w-[520px] text-[13px] text-ink-500">Chaque type d’établissement dispose de son propre espace et de sa propre adresse de connexion. Choisissez le vôtre.</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PROVIDER_KINDS.map((k) => {
            const cfg = PROVIDERS[k];
            const Icon = ICON[k];
            return (
              <Link key={k} to={`${cfg.basePath}/login`} className="group relative flex flex-col overflow-hidden rounded-[20px] bg-white shadow-card transition-shadow hover:shadow-float focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600">
                <div className="relative h-36 overflow-hidden bg-brand-900">
                  <img src={cfg.heroImage} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 to-transparent" aria-hidden="true" />
                  <span className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-[12px] bg-lime-500 text-brand-900">
                    <Icon size={20} />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-[16px] font-bold text-ink-900">{KIND_LABEL[k]}</h2>
                  <p className="mt-1 flex-1 text-[12px] text-ink-500">{BLURB[k]}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-brand-700">
                    Se connecter <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <span className="mt-1 text-[10px] text-ink-300">{cfg.basePath}/login</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
