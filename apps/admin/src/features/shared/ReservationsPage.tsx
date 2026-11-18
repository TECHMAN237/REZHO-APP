import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarX2, Check, Clock, Phone, XCircle } from 'lucide-react';
import { PAYMENT_METHOD_LABEL, formatDate, formatDateRange, formatFCFA, matches, type BookingStatus, type ProviderReservation } from '@rezho/shared';
import { Page } from '@/components/layout/AppShell';
import { useShell } from '@/components/layout/AppShell';
import { DATE_RANGES, DateRangeSelect, type RangeKey } from '@/components/layout/Topbar';
import { useAdminStore, useToastStore } from '@/store/useAdminStore';
import { Avatar, Button, ConfirmDialog, DataTable, Drawer, EmptyState, FilterChips, KeyValue, SearchInput, StatusBadge, Thumb, type Column } from '@/components/ui';

type Filter = 'all' | BookingStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'confirmed', label: 'Confirmées' },
  { key: 'ongoing', label: 'En cours' },
  { key: 'pending', label: 'En attente' },
  { key: 'completed', label: 'Terminées' },
  { key: 'cancelled', label: 'Annulées' },
];

export function ReservationsPage() {
  const { kind } = useShell();
  const [params, setParams] = useSearchParams();
  const reservations = useAdminStore((s) => s.reservations[kind]);
  const setStatus = useAdminStore((s) => s.setReservationStatus);
  const show = useToastStore((s) => s.show);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [range, setRange] = useState<RangeKey>('quarter');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ProviderReservation | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    const focus = params.get('focus');
    if (focus) {
      const r = reservations.find((x) => x.id === focus);
      if (r) setSelected(r);
      setParams({}, { replace: true });
    }
  }, [params, reservations, setParams]);

  const current = DATE_RANGES.find((r) => r.key === range)!;
  const list = useMemo(
    () =>
      reservations
        .filter((r) => (filter === 'all' || r.status === filter) && r.startDate >= current.start && r.startDate <= current.end && matches(`${r.ref} ${r.customer.name} ${r.itemName}`, query))
        .sort((a, b) => (a.startDate < b.startDate ? 1 : -1)),
    [reservations, filter, query, current],
  );

  const counts = Object.fromEntries(FILTERS.map((f) => [f.key, f.key === 'all' ? reservations.length : reservations.filter((r) => r.status === f.key).length])) as Record<Filter, number>;

  const baseColumns: Column<ProviderReservation>[] = [
    { key: 'ref', header: 'N° Réservation', render: (r) => <span className="font-bold text-ink-900">{r.ref}</span> },
    {
      key: 'customer',
      header: 'Client',
      render: (r) => (
        <span className="flex items-center gap-2.5">
          <Avatar src={r.customer.avatar} name={r.customer.name} size={30} />
          <span className="font-medium">{r.customer.name}</span>
        </span>
      ),
    },
  ];

  const kindColumns: Column<ProviderReservation>[] =
    kind === 'restaurants'
      ? [
          { key: 'when', header: 'Date & Heure', render: (r) => `${formatDate(r.startDate)}, ${r.time}` },
          { key: 'guests', header: 'Couvert(s)', render: (r) => `${r.guests} pers.`, hideBelowLg: true },
        ]
      : [
          {
            key: 'item',
            header: kind === 'hotels' ? 'Chambre' : 'Véhicule',
            render: (r) => (
              <span className="flex items-center gap-2.5">
                <Thumb src={r.itemImage} size={34} />
                <span className="font-medium">{r.itemName}</span>
              </span>
            ),
          },
          { key: 'period', header: kind === 'hotels' ? 'Séjour' : 'Période', render: (r) => formatDateRange(r.startDate, r.endDate), hideBelowLg: true },
          { key: 'amount', header: 'Montant', render: (r) => <span className="font-semibold">{formatFCFA(r.amount)}</span>, align: 'right' },
        ];

  const columns: Column<ProviderReservation>[] = [...baseColumns, ...kindColumns, { key: 'status', header: 'Statut', render: (r) => <StatusBadge status={r.status} /> }];

  const update = (r: ProviderReservation, status: BookingStatus, message: string) => {
    setStatus(kind, r.id, status);
    setSelected({ ...r, status });
    show(message);
  };

  const subtitle = kind === 'hotels' ? 'Suivez et gérez les réservations de votre établissement.' : kind === 'restaurants' ? 'Suivez et gérez les réservations de votre restaurant.' : 'Suivez et gérez les réservations de vos véhicules.';

  return (
    <Page title="Réservations" subtitle={subtitle} actions={<DateRangeSelect value={range} onChange={setRange} />}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <FilterChips
          options={FILTERS.map((f) => ({ ...f, count: counts[f.key] }))}
          value={filter}
          onChange={(v) => {
            setFilter(v);
            setPage(1);
          }}
        />
        <SearchInput value={query} onChange={setQuery} placeholder="Rechercher une réservation…" className="w-full sm:w-[280px]" />
      </div>
      <DataTable
        columns={columns}
        rows={list}
        rowKey={(r) => r.id}
        onRowClick={setSelected}
        page={page}
        pageSize={8}
        onPageChange={setPage}
        empty={<EmptyState icon={<CalendarX2 size={24} />} title="Aucune réservation" text="Aucune réservation ne correspond à ces filtres ou à cette période." />}
      />

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Réservation ${selected.ref}` : ''}
        footer={
          selected && (
            <>
              {selected.status === 'pending' && (
                <Button className="flex-1" leftIcon={<Check size={16} />} onClick={() => update(selected, 'confirmed', 'Réservation confirmée.')}>
                  Confirmer
                </Button>
              )}
              {selected.status === 'confirmed' && (
                <Button className="flex-1" variant="primary" leftIcon={<Clock size={16} />} onClick={() => update(selected, 'ongoing', kind === 'hotels' ? 'Client enregistré (check-in).' : 'Réservation marquée en cours.')}>
                  {kind === 'hotels' ? 'Check-in' : 'Marquer en cours'}
                </Button>
              )}
              {selected.status === 'ongoing' && (
                <Button className="flex-1" variant="primary" leftIcon={<Check size={16} />} onClick={() => update(selected, 'completed', 'Réservation terminée.')}>
                  {kind === 'hotels' ? 'Check-out' : 'Terminer'}
                </Button>
              )}
              {(selected.status === 'pending' || selected.status === 'confirmed') && (
                <Button className="flex-1" variant="danger" leftIcon={<XCircle size={16} />} onClick={() => setConfirmCancel(true)}>
                  Annuler
                </Button>
              )}
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 rounded-[12px] bg-brand-50 p-3">
              <Thumb src={selected.itemImage} size={56} />
              <div className="min-w-0">
                <p className="text-[14px] font-bold text-ink-900 truncate">{selected.itemName}</p>
                <p className="text-[12px] text-ink-500">
                  {formatDateRange(selected.startDate, selected.endDate)}
                  {selected.time ? ` · ${selected.time}` : ''}
                </p>
              </div>
              <span className="ml-auto">
                <StatusBadge status={selected.status} />
              </span>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-500">Client</p>
              <div className="flex items-center gap-3">
                <Avatar src={selected.customer.avatar} name={selected.customer.name} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-ink-900">{selected.customer.name}</p>
                  <p className="text-[12px] text-ink-500 truncate">{selected.customer.email}</p>
                </div>
                <a href={`tel:${selected.customer.phone.replace(/\s/g, '')}`} className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700" aria-label="Appeler le client">
                  <Phone size={16} />
                </a>
              </div>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-500">Détails</p>
              <div className="divide-y divide-ink-100 rounded-[12px] border border-ink-100 px-3">
                <KeyValue label="Référence" value={selected.ref} />
                {selected.guests !== undefined && <KeyValue label={kind === 'restaurants' ? 'Couverts' : 'Voyageurs'} value={`${selected.guests} pers.`} />}
                <KeyValue label={kind === 'restaurants' ? 'Date & heure' : 'Période'} value={`${formatDateRange(selected.startDate, selected.endDate)}${selected.time ? ` · ${selected.time}` : ''}`} />
                <KeyValue label="Montant" value={formatFCFA(selected.amount)} />
                <KeyValue label="Paiement" value={PAYMENT_METHOD_LABEL[selected.paymentMethod]} />
                <KeyValue label="Téléphone" value={selected.customer.phone} />
                <KeyValue label="Créée le" value={formatDate(selected.createdAt.slice(0, 10))} />
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={confirmCancel}
        danger
        title="Annuler cette réservation ?"
        text="Le client sera notifié et le paiement remboursé le cas échéant (simulation)."
        confirmLabel="Annuler la réservation"
        cancelLabel="Retour"
        onCancel={() => setConfirmCancel(false)}
        onConfirm={() => {
          if (selected) update(selected, 'cancelled', 'Réservation annulée.');
          setConfirmCancel(false);
        }}
      />
    </Page>
  );
}
