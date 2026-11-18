import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Pencil, Plus, Trash2, UtensilsCrossed } from 'lucide-react';
import { DISH_CATEGORIES, formatFCFA, matches, type DishCategory, type ProviderDish } from '@rezho/shared';
import { Page } from '@/components/layout/AppShell';
import { useAdminStore, useToastStore } from '@/store/useAdminStore';
import { AvailabilityBadge, Badge, Button, ConfirmDialog, DataTable, Drawer, EmptyState, FilterChips, IconButton, KeyValue, RowMenu, SearchInput, Thumb, Toggle, type Column } from '@/components/ui';

type Filter = 'all' | DishCategory;
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export function MenuPage() {
  const navigate = useNavigate();
  const dishes = useAdminStore((s) => s.dishes);
  const deleteDish = useAdminStore((s) => s.deleteDish);
  const updateDish = useAdminStore((s) => s.updateDish);
  const show = useToastStore((s) => s.show);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [toDelete, setToDelete] = useState<ProviderDish | null>(null);
  const [view, setView] = useState<ProviderDish | null>(null);

  const list = useMemo(() => dishes.filter((d) => (filter === 'all' || d.category === filter) && matches(`${d.name} ${d.category} ${d.description}`, query)), [dishes, filter, query]);

  const toggleAvailable = (d: ProviderDish) => {
    updateDish(d.id, { available: !d.available });
    show(`${d.name} ${d.available ? 'marqué indisponible' : 'de nouveau disponible'}.`);
    if (view?.id === d.id) setView({ ...d, available: !d.available });
  };

  const columns: Column<ProviderDish>[] = [
    {
      key: 'dish',
      header: 'Plat',
      render: (d) => (
        <span className="flex items-center gap-3">
          <Thumb src={d.media[0]?.url ?? d.image} size={44} />
          <span>
            <span className="block font-bold text-ink-900">{d.name}</span>
            <span className="block max-w-[260px] truncate text-[11px] text-ink-500">{d.description}</span>
          </span>
        </span>
      ),
    },
    { key: 'category', header: 'Catégorie', render: (d) => d.category },
    {
      key: 'price',
      header: 'Prix',
      render: (d) => (
        <span className="font-semibold">
          {formatFCFA(d.price)} {d.promoPercent ? <Badge tone="warning">-{d.promoPercent}%</Badge> : null}
        </span>
      ),
    },
    { key: 'status', header: 'Statut', render: (d) => <AvailabilityBadge available={d.available} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (d) => (
        <span className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <IconButton label="Modifier" onClick={() => navigate(`/partner/restaurants/menu/${d.id}/edit`)}>
            <Pencil size={15} />
          </IconButton>
          <RowMenu
            items={[
              { label: 'Voir les détails', icon: <Eye size={14} />, onSelect: () => setView(d) },
              { label: 'Modifier', icon: <Pencil size={14} />, onSelect: () => navigate(`/partner/restaurants/menu/${d.id}/edit`) },
              { label: d.available ? 'Marquer indisponible' : 'Marquer disponible', icon: <UtensilsCrossed size={14} />, onSelect: () => toggleAvailable(d) },
              { label: 'Supprimer', icon: <Trash2 size={14} />, danger: true, onSelect: () => setToDelete(d) },
            ]}
          />
        </span>
      ),
    },
  ];

  return (
    <Page
      title="Menu & Plats"
      subtitle="Gérez vos plats, catégories et disponibilités."
      actions={
        <Link to="/partner/restaurants/menu/new">
          <Button leftIcon={<Plus size={16} />}>Ajouter un plat</Button>
        </Link>
      }
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <FilterChips options={[{ key: 'all', label: 'Tous', count: dishes.length }, ...DISH_CATEGORIES.map((c) => ({ key: c, label: c, count: dishes.filter((d) => d.category === c).length }))]} value={filter} onChange={setFilter} />
        <SearchInput value={query} onChange={setQuery} placeholder="Rechercher un plat…" className="w-full sm:w-[280px]" />
      </div>
      <DataTable
        columns={columns}
        rows={list}
        rowKey={(d) => d.id}
        onRowClick={setView}
        empty={
          <EmptyState
            icon={<UtensilsCrossed size={24} />}
            title="Aucun plat"
            text="Ajoutez votre premier plat pour constituer votre menu."
            action={
              <Link to="/partner/restaurants/menu/new">
                <Button leftIcon={<Plus size={16} />}>Ajouter un plat</Button>
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
              <Button variant="outline" className="flex-1" onClick={() => toggleAvailable(view)}>
                {view.available ? 'Marquer indisponible' : 'Marquer disponible'}
              </Button>
              <Button className="flex-1" leftIcon={<Pencil size={15} />} onClick={() => navigate(`/partner/restaurants/menu/${view.id}/edit`)}>
                Modifier
              </Button>
            </>
          )
        }
      >
        {view && (
          <div className="space-y-5">
            <img src={view.media[0]?.url ?? view.image} alt="" className="h-[200px] w-full rounded-[12px] object-cover" />
            <div className="flex items-center justify-between">
              <Badge tone="brand">{view.category}</Badge>
              <div className="flex items-center gap-2 text-[12px]">
                <span className="text-ink-500">Disponible</span>
                <Toggle checked={view.available} onChange={() => toggleAvailable(view)} label="Disponible à la commande" />
              </div>
            </div>
            <p className="text-[13px] leading-relaxed text-ink-700">{view.description}</p>
            <div className="divide-y divide-ink-100 rounded-[12px] border border-ink-100 px-3">
              <KeyValue label="Prix" value={formatFCFA(view.price)} />
              {view.promoPercent && <KeyValue label="Prix promo" value={`${formatFCFA(Math.round(view.price * (1 - view.promoPercent / 100)))} (-${view.promoPercent}%)`} />}
              <KeyValue label="Jours" value={(view.availableDays ?? []).length === 7 ? 'Tous les jours' : (view.availableDays ?? []).map((n) => DAYS[n - 1]).join(', ')} />
              <KeyValue label="Médias" value={`${view.media.length}`} />
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!toDelete}
        danger
        title={`Supprimer « ${toDelete?.name} » ?`}
        text="Le plat sera retiré du menu visible par les clients."
        confirmLabel="Supprimer"
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) {
            deleteDish(toDelete.id);
            show(`${toDelete.name} supprimé du menu.`, 'info');
          }
          setToDelete(null);
        }}
      />
    </Page>
  );
}
