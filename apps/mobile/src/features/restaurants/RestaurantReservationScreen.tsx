import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, ChevronRight, Clock, Users } from 'lucide-react';
import { RESTAURANTS, addDays, formatDate, todayISO } from '@rezho/shared';
import { BottomSheet, Button, Calendar, Chip, Counter, Input, Stepper, Textarea } from '@/components/ui';
import { Screen } from '@/components/layout/Screen';
import { useAppStore } from '@/store/useAppStore';
import { RESTAURANT_TIME_SLOTS } from '@/lib/booking';

export function RestaurantReservationScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = RESTAURANTS.find((r) => r.id === id);
  const user = useAppStore((s) => s.user);
  const setDraft = useAppStore((s) => s.setDraft);

  const [date, setDate] = useState(addDays(todayISO(), 1));
  const [dateOpen, setDateOpen] = useState(false);
  const [time, setTime] = useState('19:30');
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [occasion, setOccasion] = useState('Aucune');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!item) return <Navigate to="/restaurants" replace />;

  const submit = () => {
    const next: Record<string, string> = {};
    if (!date) next.date = 'Choisissez une date.';
    if (!time) next.time = 'Choisissez un horaire.';
    if (name.trim().length < 3) next.name = 'Entrez votre nom.';
    if (phone.trim().length < 8) next.phone = 'Entrez un numéro de téléphone valide.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setDraft({
      kind: 'restaurant',
      itemId: item.id,
      itemName: item.name,
      itemImage: item.images[1] ?? item.images[0]!,
      city: item.city,
      startDate: date,
      time,
      guests,
      lines: [{ label: `Réservation de table (${guests} couvert${guests > 1 ? 's' : ''})`, amount: 0 }],
      total: 0,
      subtitle: `${guests} pers. · ${time}`,
      details: {
        'Nom de la réservation': name.trim(),
        Téléphone: phone.trim(),
        ...(occasion !== 'Aucune' ? { Occasion: occasion } : {}),
        ...(note.trim() ? { 'Demande spéciale': note.trim() } : {}),
      },
    });
    navigate('/checkout');
  };

  return (
    <Screen
      topBar={{ back: `/restaurants/${item.id}`, title: 'Réserver une table' }}
      footer={
        <Button full size="lg" onClick={submit}>
          Continuer
        </Button>
      }
    >
      <div className="py-2">
        <Stepper steps={['Détails', 'Confirmation', 'Terminé']} current={1} />
      </div>
      <div className="mt-3 flex gap-3 rounded-[14px] bg-white p-2.5 shadow-card">
        <img src={item.images[0]} alt="" className="h-14 w-14 rounded-[10px] object-cover" />
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-ink-900 truncate">{item.name}</p>
          <p className="text-[11px] text-ink-500">{item.address}</p>
          <p className="text-[11px] font-semibold text-brand-700">{item.openingHours}</p>
        </div>
      </div>

      <section className="mt-5">
        <h2 className="text-[13px] font-semibold text-ink-700 mb-2">Date</h2>
        <button type="button" onClick={() => setDateOpen(true)} className="flex w-full items-center gap-3 rounded-[12px] border border-ink-200 bg-white px-3.5 h-12 text-left">
          <CalendarDays size={17} className="text-brand-700" />
          <span className="flex-1 text-[13px] font-medium text-ink-900">{formatDate(date, { weekday: true })}</span>
          <ChevronRight size={16} className="text-ink-500" />
        </button>
      </section>

      <section className="mt-5">
        <h2 className="text-[13px] font-semibold text-ink-700 mb-2 flex items-center gap-1.5">
          <Clock size={14} /> Heure
        </h2>
        <div className="flex flex-wrap gap-2">
          {RESTAURANT_TIME_SLOTS.map((t) => (
            <Chip key={t} active={time === t} onClick={() => setTime(t)}>
              {t}
            </Chip>
          ))}
        </div>
        {errors.time && <p className="mt-1 text-[12px] text-danger font-medium">{errors.time}</p>}
      </section>

      <section className="mt-5">
        <h2 className="text-[13px] font-semibold text-ink-700 mb-2">Nombre de personnes</h2>
        <div className="flex items-center justify-between rounded-[12px] border border-ink-200 bg-white px-3.5 h-12">
          <span className="flex items-center gap-2 text-[13px] font-medium text-ink-900">
            <Users size={17} className="text-brand-700" /> {guests} personne{guests > 1 ? 's' : ''}
          </span>
          <Counter value={guests} onChange={setGuests} min={1} max={12} label="Personnes" />
        </div>
      </section>

      <section className="mt-5 space-y-3">
        <h2 className="text-[13px] font-semibold text-ink-700 -mb-1">Vos informations</h2>
        <Input label="Nom" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
        <Input label="Téléphone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} />
        <div>
          <p className="text-[13px] font-semibold text-ink-700 mb-2">Occasion (optionnel)</p>
          <div className="flex flex-wrap gap-2">
            {['Aucune', 'Anniversaire', 'Dîner d’affaires', 'Romantique', 'Famille'].map((o) => (
              <Chip key={o} size="sm" active={occasion === o} onClick={() => setOccasion(o)}>
                {o}
              </Chip>
            ))}
          </div>
        </div>
        <Textarea label="Demande spéciale (optionnel)" placeholder="Ex. : table en terrasse, chaise haute…" value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} />
      </section>

      <BottomSheet open={dateOpen} onClose={() => setDateOpen(false)} title="Date de la réservation" footer={<Button full onClick={() => setDateOpen(false)}>Confirmer</Button>}>
        <Calendar mode="single" start={date} onChange={(d) => setDate(d)} />
      </BottomSheet>
    </Screen>
  );
}
