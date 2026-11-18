import { useState, type FormEvent } from 'react';
import { CreditCard, Plus, Smartphone, Trash2 } from 'lucide-react';
import { BottomSheet, Button, Input, Select } from '@/components/ui';
import { Screen } from '@/components/layout/Screen';
import { useAppStore, useToastStore } from '@/store/useAppStore';

export function PaymentMethodsScreen() {
  const cards = useAppStore((s) => s.cards);
  const addCard = useAppStore((s) => s.addCard);
  const removeCard = useAppStore((s) => s.removeCard);
  const momo = useAppStore((s) => s.mobileMoneyNumber);
  const setMomo = useAppStore((s) => s.setMobileMoneyNumber);
  const show = useToastStore((s) => s.show);
  const [open, setOpen] = useState(false);
  const [momoEdit, setMomoEdit] = useState(momo);
  const [form, setForm] = useState({ number: '', holder: '', exp: '', brand: 'Visa' as 'Visa' | 'Mastercard' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const digits = form.number.replace(/\s/g, '');
    const next: Record<string, string> = {};
    if (!/^\d{16}$/.test(digits)) next.number = 'Numéro de carte à 16 chiffres.';
    if (form.holder.trim().length < 3) next.holder = 'Nom du titulaire requis.';
    if (!/^\d{2}\/\d{2}$/.test(form.exp)) next.exp = 'Format MM/AA.';
    setErrors(next);
    if (Object.keys(next).length) return;
    addCard({ brand: form.brand, last4: digits.slice(-4), holder: form.holder.trim().toUpperCase() });
    setOpen(false);
    setForm({ number: '', holder: '', exp: '', brand: 'Visa' });
    show('Carte ajoutée.');
  };

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <Screen topBar={{ back: '/profile', title: 'Moyens de paiement' }}>
        <h2 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-500">Mobile Money</h2>
        <div className="rounded-[16px] bg-white p-4 shadow-card">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FEF3C7] text-[#B45309]">
              <Smartphone size={18} />
            </span>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-ink-900">MTN MoMo / Orange Money</p>
              <p className="text-[12px] text-ink-500">{momo}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <input value={momoEdit} onChange={(e) => setMomoEdit(e.target.value)} aria-label="Numéro Mobile Money" className="flex-1 h-10 rounded-[10px] border border-ink-200 px-3 text-[13px] focus:outline-none focus:border-brand-600" />
            <Button
              size="sm"
              className="h-10"
              onClick={() => {
                setMomo(momoEdit);
                show('Numéro Mobile Money mis à jour.');
              }}
            >
              Enregistrer
            </Button>
          </div>
        </div>

        <div className="mt-5 mb-2 flex items-center justify-between">
          <h2 className="text-[12px] font-semibold uppercase tracking-wide text-ink-500">Cartes bancaires</h2>
          <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1 text-[12px] font-bold text-brand-700">
            <Plus size={14} /> Ajouter
          </button>
        </div>
        {cards.length === 0 ? (
          <p className="rounded-[16px] bg-white p-4 text-center text-[12px] text-ink-500 shadow-card">Aucune carte enregistrée.</p>
        ) : (
          <ul className="space-y-2.5">
            {cards.map((c) => (
              <li key={c.id} className="relative overflow-hidden rounded-[16px] bg-brand-900 p-4 text-white shadow-card">
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" aria-hidden="true" />
                <div className="flex items-center justify-between">
                  <CreditCard size={22} />
                  <span className="text-[12px] font-bold">{c.brand}</span>
                </div>
                <p className="mt-5 text-[16px] font-semibold tracking-[0.15em]">•••• •••• •••• {c.last4}</p>
                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <span className="uppercase text-white/80">{c.holder}</span>
                  <button
                    type="button"
                    aria-label="Supprimer la carte"
                    onClick={() => {
                      removeCard(c.id);
                      show('Carte supprimée.', 'info');
                    }}
                    className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 font-semibold"
                  >
                    <Trash2 size={12} /> Retirer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Screen>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Ajouter une carte">
        <form onSubmit={submit} className="space-y-3 pb-2" noValidate>
          <Select label="Type" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value as 'Visa' | 'Mastercard' })}>
            <option>Visa</option>
            <option>Mastercard</option>
          </Select>
          <Input label="Numéro de carte" inputMode="numeric" placeholder="1234 5678 9012 3456" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} error={errors.number} />
          <Input label="Titulaire" placeholder="NOM PRÉNOM" value={form.holder} onChange={(e) => setForm({ ...form, holder: e.target.value })} error={errors.holder} />
          <Input label="Expiration" placeholder="MM/AA" value={form.exp} onChange={(e) => setForm({ ...form, exp: e.target.value })} error={errors.exp} />
          <Button type="submit" full>
            Ajouter la carte
          </Button>
        </form>
      </BottomSheet>
    </div>
  );
}
