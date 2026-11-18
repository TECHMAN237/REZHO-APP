import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Eye, Pencil, Plus, Trash2, Wrench } from 'lucide-react';
import { formatFCFA, matches, type FleetVehicle, type VehicleStatus } from '@rezho/shared';
import { Page } from '@/components/layout/AppShell';
import { useAdminStore, useToastStore } from '@/store/useAdminStore';
import { Badge, Button, ConfirmDialog, DataTable, Drawer, EmptyState, FilterChips, IconButton, KeyValue, RowMenu, SearchInput, Thumb, VehicleStatusBadge, type Column } from '@/components/ui';

type Filter = 'all' | VehicleStatus;

export function FleetPage() {
  const navigate = useNavigate();
  const fleet = useAdminStore((s) => s.fleet);
  const deleteVehicle = useAdminStore((s) => s.deleteVehicle);
  const updateVehicle = useAdminStore((s) => s.updateVehicle);
  const show = useToastStore((s) => s.show);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [toDelete, setToDelete] = useState<FleetVehicle | null>(null);
  const [view, setView] = useState<FleetVehicle | null>(null);

  const list = useMemo(() => fleet.filter((v) => (filter === 'all' || v.status === filter) && matches(`${v.brand} ${v.model} ${v.name} ${v.year} ${v.type}`, query)), [fleet, filter, query]);

  const setStatus = (v: FleetVehicle, status: VehicleStatus, msg: string) => {
    updateVehicle(v.id, { status });
    show(msg);
    if (view?.id === v.id) setView({ ...v, status });
  };

  const columns: Column<FleetVehicle>[] = [
    {
      key: 'vehicle',
      header: 'Véhicule',
      render: (v) => (
        <span className="flex items-center gap-3">
          <Thumb src={v.media[0]?.url ?? ''} size={44} className="!w-[60px]" />
          <span>
            <span className="block font-bold text-ink-900">{v.name}</span>
            <span className="block text-[11px] text-ink-500">
              {v.transmission} · {v.fuel} · {v.seats} places
            </span>
          </span>
        </span>
      ),
    },
    {
      key: 'model',
      header: 'Marque / Modèle',
      render: (v) => (
        <span>
          <span className="block font-medium">
            {v.brand} {v.model}
          </span>
          <span className="block text-[11px] text-ink-500">{v.year}</span>
        </span>
      ),
      hideBelowLg: true,
    },
    { key: 'type', header: 'Type', render: (v) => <Badge tone="neutral">{v.type}</Badge>, hideBelowLg: true },
    { key: 'price', header: 'Prix / jour', render: (v) => <span className="font-semibold">{formatFCFA(v.pricePerDay)}</span> },
    { key: 'status', header: 'Statut', render: (v) => <VehicleStatusBadge status={v.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (v) => (
        <span className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <IconButton label="Modifier" onClick={() => navigate(`/partner/vehicles/fleet/${v.id}/edit`)}>
            <Pencil size={15} />
          </IconButton>
          <RowMenu
            items={[
              { label: 'Voir les détails', icon: <Eye size={14} />, onSelect: () => setView(v) },
              { label: 'Modifier', icon: <Pencil size={14} />, onSelect: () => navigate(`/partner/vehicles/fleet/${v.id}/edit`) },
              { label: v.status === 'maintenance' ? 'Fin de maintenance' : 'Mettre en maintenance', icon: <Wrench size={14} />, onSelect: () => setStatus(v, v.status === 'maintenance' ? 'available' : 'maintenance', v.status === 'maintenance' ? `${v.name} de nouveau disponible.` : `${v.name} en maintenance.`) },
              { label: v.status === 'unavailable' ? 'Marquer disponible' : 'Marquer indisponible', icon: <Car size={14} />, onSelect: () => setStatus(v, v.status === 'unavailable' ? 'available' : 'unavailable', 'Statut mis à jour.') },
              { label: 'Supprimer', icon: <Trash2 size={14} />, danger: true, onSelect: () => setToDelete(v) },
            ]}
          />
        </span>
      ),
    },
  ];

  return (
    <Page
      title="Ma flotte de véhicules"
      subtitle="Gérez, modifiez et publiez vos véhicules."
      actions={
        <Link to="/partner/vehicles/fleet/new">
          <Button leftIcon={<Plus size={16} />}>Ajouter un véhicule</Button>
        </Link>
      }
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Rechercher un véhicule…" className="w-full sm:w-[300px]" />
        <FilterChips
          options={[
            { key: 'all', label: 'Tous', count: fleet.length },
            { key: 'available', label: 'Disponibles', count: fleet.filter((v) => v.status === 'available').length },
            { key: 'rented', label: 'Loués', count: fleet.filter((v) => v.status === 'rented').length },
            { key: 'maintenance', label: 'Maintenance', count: fleet.filter((v) => v.status === 'maintenance').length },
            { key: 'unavailable', label: 'Indisponibles', count: fleet.filter((v) => v.status === 'unavailable').length },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </div>
      <DataTable
        columns={columns}
        rows={list}
        rowKey={(v) => v.id}
        onRowClick={setView}
        empty={
          <EmptyState
            icon={<Car size={24} />}
            title="Aucun véhicule"
            text="Ajoutez votre premier véhicule pour commencer à louer."
            action={
              <Link to="/partner/vehicles/fleet/new">
                <Button leftIcon={<Plus size={16} />}>Ajouter un véhicule</Button>
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
              <Button variant="outline" className="flex-1" onClick={() => navigate(`/partner/vehicles/availability?vehicle=${view.id}`)}>
                Disponibilités
              </Button>
              <Button className="flex-1" leftIcon={<Pencil size={15} />} onClick={() => navigate(`/partner/vehicles/fleet/${view.id}/edit`)}>
                Modifier
              </Button>
            </>
          )
        }
      >
        {view && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-2">
              {view.media.slice(0, 4).map((m) => (
                <img key={m.id} src={m.url} alt="" className="aspect-[4/3] w-full rounded-[10px] object-cover" />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <Badge tone="neutral">{view.type}</Badge>
              <VehicleStatusBadge status={view.status} />
            </div>
            <p className="text-[13px] leading-relaxed text-ink-700">{view.description}</p>
            <div className="divide-y divide-ink-100 rounded-[12px] border border-ink-100 px-3">
              <KeyValue label="Marque / Modèle" value={`${view.brand} ${view.model} (${view.year})`} />
              <KeyValue label="Transmission" value={view.transmission} />
              <KeyValue label="Carburant" value={view.fuel} />
              <KeyValue label="Couleur" value={view.color} />
              <KeyValue label="Kilométrage" value={`${formatFCFA(view.mileage, false)} km`} />
              <KeyValue label="Places" value={`${view.seats}`} />
              <KeyValue label="Prix / jour" value={formatFCFA(view.pricePerDay)} />
              {view.deposit && <KeyValue label="Caution" value={formatFCFA(view.deposit)} />}
              {view.longTermDiscount && <KeyValue label="Remise longue durée" value={`-${view.longTermDiscount}%`} />}
            </div>
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-500">Équipements</p>
              <div className="flex flex-wrap gap-1.5">
                {view.equipment.map((e) => (
                  <span key={e} className="rounded-full bg-brand-100 px-2.5 py-1 text-[11px] font-semibold text-brand-800">
                    {e}
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
        text="Le véhicule sera retiré de votre flotte et ne sera plus proposé à la location."
        confirmLabel="Supprimer"
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) {
            deleteVehicle(toDelete.id);
            show(`${toDelete.name} supprimé de la flotte.`, 'info');
          }
          setToDelete(null);
        }}
      />
    </Page>
  );
}
