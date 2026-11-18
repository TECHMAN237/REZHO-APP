import { useMemo, useState } from 'react';
import { Download, Wallet } from 'lucide-react';
import { PAYMENT_METHOD_LABEL, formatDate, formatFCFA, matches, type Payment } from '@rezho/shared';
import { Page, useShell } from '@/components/layout/AppShell';
import { DATE_RANGES, DateRangeSelect, type RangeKey } from '@/components/layout/Topbar';
import { useAdminStore, useToastStore } from '@/store/useAdminStore';
import { Avatar, Button, DataTable, EmptyState, FilterChips, IconButton, PaymentStatusBadge, SearchInput, type Column } from '@/components/ui';

type Filter = 'all' | 'completed' | 'pending';

export function PaymentsPage() {
  const { kind } = useShell();
  const payments = useAdminStore((s) => s.payments[kind]);
  const setPaymentStatus = useAdminStore((s) => s.setPaymentStatus);
  const show = useToastStore((s) => s.show);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [range, setRange] = useState<RangeKey>('quarter');
  const [page, setPage] = useState(1);

  const current = DATE_RANGES.find((r) => r.key === range)!;
  const list = useMemo(
    () => payments.filter((p) => (filter === 'all' || p.status === filter) && p.date >= current.start && p.date <= current.end && matches(`${p.ref} ${p.reservationRef} ${p.customer.name}`, query)).sort((a, b) => (a.date < b.date ? 1 : -1)),
    [payments, filter, query, current],
  );

  const totalCompleted = payments.filter((p) => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0);

  const exportCsv = () => {
    const header = 'N° Paiement;Réservation;Client;Montant (FCFA);Date;Méthode;Statut';
    const rows = list.map((p) => [p.ref, p.reservationRef, p.customer.name, p.amount, p.date, PAYMENT_METHOD_LABEL[p.method], p.status].join(';'));
    const blob = new Blob([`﻿${[header, ...rows].join('\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rezho-paiements-${kind}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    show('Export CSV téléchargé.', 'info');
  };

  const columns: Column<Payment>[] = [
    { key: 'ref', header: 'N° Paiement', render: (p) => <span className="font-bold text-ink-900">{p.ref}</span> },
    { key: 'res', header: 'Réservation', render: (p) => <span className="text-ink-700">{p.reservationRef}</span> },
    {
      key: 'customer',
      header: 'Client',
      render: (p) => (
        <span className="flex items-center gap-2.5">
          <Avatar src={p.customer.avatar} name={p.customer.name} size={30} />
          <span className="font-medium">{p.customer.name}</span>
        </span>
      ),
    },
    { key: 'amount', header: 'Montant', render: (p) => <span className="font-semibold">{formatFCFA(p.amount)}</span> },
    { key: 'date', header: 'Date', render: (p) => formatDate(p.date), hideBelowLg: true },
    { key: 'method', header: 'Méthode', render: (p) => PAYMENT_METHOD_LABEL[p.method], hideBelowLg: true },
    { key: 'status', header: 'Statut', render: (p) => <PaymentStatusBadge status={p.status} /> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (p) =>
        p.status === 'pending' ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setPaymentStatus(kind, p.id, 'completed');
              show(`Paiement ${p.ref} marqué comme terminé.`);
            }}
          >
            Marquer payé
          </Button>
        ) : null,
    },
  ];

  const subtitle = kind === 'hotels' ? 'Consultez les paiements effectués dans l’application.' : kind === 'restaurants' ? 'Consultez les paiements des commandes et réservations.' : 'Consultez les paiements des locations.';

  return (
    <Page
      title="Paiements"
      subtitle={subtitle}
      actions={
        <>
          <DateRangeSelect value={range} onChange={setRange} />
          <IconButton label="Exporter en CSV" tone="outline" size={40} onClick={exportCsv} className="!rounded-full">
            <Download size={16} />
          </IconButton>
        </>
      }
    >
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[16px] bg-white p-4 shadow-card">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">Encaissé via REZHO</p>
          <p className="mt-1 text-[22px] font-extrabold text-ink-900">{formatFCFA(totalCompleted)}</p>
        </div>
        <div className="rounded-[16px] bg-white p-4 shadow-card">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">En attente</p>
          <p className="mt-1 text-[22px] font-extrabold text-[#B45309]">{formatFCFA(totalPending)}</p>
        </div>
        <div className="rounded-[16px] bg-brand-900 p-4 text-white shadow-card">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">Paiements</p>
          <p className="mt-1 text-[22px] font-extrabold">
            {payments.filter((p) => p.status === 'completed').length} <span className="text-[13px] font-medium text-white/70">terminés sur {payments.length}</span>
          </p>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <FilterChips
          options={[
            { key: 'all', label: 'Tous', count: payments.length },
            { key: 'completed', label: 'Terminés', count: payments.filter((p) => p.status === 'completed').length },
            { key: 'pending', label: 'En attente', count: payments.filter((p) => p.status === 'pending').length },
          ]}
          value={filter}
          onChange={(v) => {
            setFilter(v);
            setPage(1);
          }}
        />
        <SearchInput value={query} onChange={setQuery} placeholder="Rechercher un paiement…" className="w-full sm:w-[280px]" />
      </div>
      <DataTable columns={columns} rows={list} rowKey={(p) => p.id} page={page} pageSize={8} onPageChange={setPage} empty={<EmptyState icon={<Wallet size={24} />} title="Aucun paiement" text="Aucun paiement sur cette période." />} />
    </Page>
  );
}
