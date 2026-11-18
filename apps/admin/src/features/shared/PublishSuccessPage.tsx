import { Link, Navigate, useParams } from 'react-router-dom';
import { Check, ExternalLink, Plus } from 'lucide-react';
import { Page, useShell } from '@/components/layout/AppShell';
import { useAdminStore } from '@/store/useAdminStore';
import { Button } from '@/components/ui';

const CONFETTI = [
  { x: 6, y: 12, c: '#9BE017', r: 20 },
  { x: 92, y: 8, c: '#F5B301', r: -15 },
  { x: 96, y: 55, c: '#1F8A4C', r: 40 },
  { x: 3, y: 60, c: '#F5B301', r: -30 },
  { x: 14, y: 90, c: '#9BE017', r: 10 },
  { x: 86, y: 92, c: '#DC2626', r: 60 },
  { x: 50, y: 2, c: '#2563EB', r: -50 },
];

/** Shared "published successfully" screen for rooms, dishes and vehicles. */
export function PublishSuccessPage() {
  const { kind } = useShell();
  const { id } = useParams();
  const room = useAdminStore((s) => s.rooms.find((r) => r.id === id));
  const dish = useAdminStore((s) => s.dishes.find((d) => d.id === id));
  const vehicle = useAdminStore((s) => s.fleet.find((v) => v.id === id));

  const item =
    kind === 'hotels' && room
      ? { name: room.name, image: room.media[0]?.url ?? '', title: 'Chambre publiée avec succès !', text: `La chambre « ${room.name} » est maintenant visible par les clients REZHO.`, listPath: '/partner/hotels/rooms', listLabel: 'Voir les chambres', newPath: '/partner/hotels/rooms/new', newLabel: 'Ajouter une autre' }
      : kind === 'restaurants' && dish
        ? { name: dish.name, image: dish.media[0]?.url ?? dish.image, title: 'Plat publié avec succès !', text: `Le plat « ${dish.name} » est maintenant disponible sur votre menu.`, listPath: '/partner/restaurants/menu', listLabel: 'Voir le menu', newPath: '/partner/restaurants/menu/new', newLabel: 'Ajouter un autre' }
        : kind === 'vehicles' && vehicle
          ? { name: vehicle.name, image: vehicle.media[0]?.url ?? '', title: 'Véhicule publié avec succès !', text: `La ${vehicle.name} est maintenant disponible à la location sur REZHO.`, listPath: '/partner/vehicles/fleet', listLabel: 'Voir le véhicule', newPath: '/partner/vehicles/fleet/new', newLabel: 'Ajouter un autre' }
          : null;

  if (!item) return <Navigate to={`/partner/${kind}/dashboard`} replace />;

  return (
    <Page title="Publication" subtitle="Votre contenu est en ligne.">
      <div className="mx-auto mt-6 max-w-[560px] rounded-[20px] bg-white p-8 text-center shadow-card pop-in">
        <div className="relative mx-auto h-[180px] w-[260px]">
          {CONFETTI.map((p, i) => (
            <span key={i} aria-hidden="true" className="absolute h-2.5 w-4 rounded-sm" style={{ left: `${p.x}%`, top: `${p.y}%`, background: p.c, transform: `rotate(${p.r}deg)` }} />
          ))}
          <img src={item.image} alt={item.name} className="h-full w-full rounded-[16px] object-cover" />
          <span className="absolute -right-3 -top-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white ring-4 ring-white">
            <Check size={24} strokeWidth={3} />
          </span>
        </div>
        <h2 className="mt-6 text-[22px] font-extrabold text-ink-900">{item.title}</h2>
        <p className="mt-2 text-[13px] text-ink-500">{item.text}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to={item.listPath}>
            <Button leftIcon={<ExternalLink size={16} />}>{item.listLabel}</Button>
          </Link>
          <Link to={item.newPath}>
            <Button variant="outline" leftIcon={<Plus size={16} />}>
              {item.newLabel}
            </Button>
          </Link>
        </div>
      </div>
    </Page>
  );
}
