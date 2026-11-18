import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BedDouble, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { AMENITY_LABEL, formatFCFA, matches, type ProviderRoom, type RoomStatus } from '@rezho/shared';
import { Page } from '@/components/layout/AppShell';
import { useAdminStore, useToastStore } from '@/store/useAdminStore';
import { Button, ConfirmDialog, DataTable, Drawer, EmptyState, FilterChips, IconButton, KeyValue, RoomStatusBadge, RowMenu, SearchInput, Thumb, type Column } from '@/components/ui';

type Filter = 'all' | RoomStatus;

export function RoomsPage() {
  const navigate = useNavigate();
  const rooms = useAdminStore((s) => s.rooms);
  const deleteRoom = useAdminStore((s) => s.deleteRoom);
  const updateRoom = useAdminStore((s) => s.updateRoom);
  const show = useToastStore((s) => s.show);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [toDelete, setToDelete] = useState<ProviderRoom | null>(null);
  const [view, setView] = useState<ProviderRoom | null>(null);

  const list = useMemo(() => rooms.filter((r) => (filter === 'all' || r.status === filter) && matches(`${r.name} ${r.number} ${r.type}`, query)), [rooms, filter, query]);

  const columns: Column<ProviderRoom>[] = [
    {
      key: 'room',
      header: 'Chambre',
      render: (r) => (
        <span className="flex items-center gap-3">
          <Thumb src={r.media[0]?.url ?? ''} size={44} />
          <span>
            <span className="block font-bold text-ink-900">{r.name}</span>
            <span className="block text-[11px] text-ink-500">{r.number}</span>
          </span>
        </span>
      ),
    },
    { key: 'type', header: 'Type', render: (r) => r.type },
    { key: 'capacity', header: 'Capacité', render: (r) => `${r.capacity} pers.`, hideBelowLg: true },
    { key: 'price', header: 'Prix / nuit', render: (r) => <span className="font-semibold">{formatFCFA(r.pricePerNight)}</span> },
    { key: 'status', header: 'Statut', render: (r) => <RoomStatusBadge status={r.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (r) => (
        <span className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <IconButton label="Modifier" onClick={() => navigate(`/partner/hotels/rooms/${r.id}/edit`)}>
            <Pencil size={15} />
          </IconButton>
          <RowMenu
            items={[
              { label: 'Voir les détails', icon: <Eye size={14} />, onSelect: () => setView(r) },
              { label: 'Modifier', icon: <Pencil size={14} />, onSelect: () => navigate(`/partner/hotels/rooms/${r.id}/edit`) },
              {
                label: r.status === 'unavailable' ? 'Marquer disponible' : 'Marquer indisponible',
                icon: <BedDouble size={14} />,
                onSelect: () => {
                  updateRoom(r.id, { status: r.status === 'unavailable' ? 'available' : 'unavailable' });
                  show(`${r.name} ${r.status === 'unavailable' ? 'est de nouveau disponible' : 'marquée indisponible'}.`);
                },
              },
              { label: 'Supprimer', icon: <Trash2 size={14} />, danger: true, onSelect: () => setToDelete(r) },
            ]}
          />
        </span>
      ),
    },
  ];

  return (
    <Page
      title="Chambres & Logements"
      subtitle="Gérez, modifiez et publiez vos chambres."
      actions={
        <Link to="/partner/hotels/rooms/new">
          <Button leftIcon={<Plus size={16} />}>Ajouter une chambre</Button>
        </Link>
      }
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Rechercher une chambre…" className="w-full sm:w-[300px]" />
        <FilterChips
          options={[
            { key: 'all', label: 'Toutes', count: rooms.length },
            { key: 'available', label: 'Disponibles', count: rooms.filter((r) => r.status === 'available').length },
            { key: 'occupied', label: 'Occupées', count: rooms.filter((r) => r.status === 'occupied').length },
            { key: 'unavailable', label: 'Indisponibles', count: rooms.filter((r) => r.status === 'unavailable').length },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </div>
      <DataTable
        columns={columns}
        rows={list}
        rowKey={(r) => r.id}
        onRowClick={setView}
        empty={
          <EmptyState
            icon={<BedDouble size={24} />}
            title="Aucune chambre"
            text="Ajoutez votre première chambre pour commencer à recevoir des réservations."
            action={
              <Link to="/partner/hotels/rooms/new">
                <Button leftIcon={<Plus size={16} />}>Ajouter une chambre</Button>
              </Link>
            }
          />
        }
      />

      <Drawer
        open={!!view}
        onClose={() => setView(null)}
        title={view?.name ?? ''}
        footer={
          view && (
            <>
              <Button variant="outline" className="flex-1" onClick={() => navigate(`/partner/hotels/availability?room=${view.id}`)}>
                Disponibilités
              </Button>
              <Button className="flex-1" leftIcon={<Pencil size={15} />} onClick={() => navigate(`/partner/hotels/rooms/${view.id}/edit`)}>
                Modifier
              </Button>
            </>
          )
        }
      >
        {view && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-2">
              {view.media.slice(0, 6).map((m) => (
                <img key={m.id} src={m.url} alt="" className="aspect-square w-full rounded-[10px] object-cover" />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[12px] text-ink-500">{view.number}</p>
              <RoomStatusBadge status={view.status} />
            </div>
            <p className="text-[13px] leading-relaxed text-ink-700">{view.description}</p>
            <div className="divide-y divide-ink-100 rounded-[12px] border border-ink-100 px-3">
              <KeyValue label="Type" value={view.type} />
              <KeyValue label="Capacité" value={`${view.capacity} pers.`} />
              <KeyValue label="Surface" value={`${view.surface} m²`} />
              <KeyValue label="Prix / nuit" value={formatFCFA(view.pricePerNight)} />
              {view.weekendPrice && <KeyValue label="Prix week-end" value={formatFCFA(view.weekendPrice)} />}
              {view.promoPercent && <KeyValue label="Promotion" value={`-${view.promoPercent}%`} />}
              <KeyValue label="Dates bloquées" value={`${view.unavailableDates.length}`} />
            </div>
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-500">Équipements</p>
              <div className="flex flex-wrap gap-1.5">
                {view.amenities.map((a) => (
                  <span key={a} className="rounded-full bg-brand-100 px-2.5 py-1 text-[11px] font-semibold text-brand-800">
                    {AMENITY_LABEL[a]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!toDelete}
        danger
        title={`Supprimer « ${toDelete?.name} » ?`}
        text="Cette chambre ne sera plus visible par les clients. Les réservations existantes sont conservées."
        confirmLabel="Supprimer"
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) {
            deleteRoom(toDelete.id);
            show(`${toDelete.name} supprimée.`, 'info');
          }
          setToDelete(null);
        }}
      />
    </Page>
  );
}
