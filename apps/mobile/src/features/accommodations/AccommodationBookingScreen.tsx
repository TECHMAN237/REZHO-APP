import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BedDouble, CalendarDays, ChevronRight, Info, Users } from 'lucide-react';
import { ACCOMMODATIONS, formatDate, formatDateRange, formatFCFA, nightsBetween, type PriceLine } from '@rezho/shared';
import { BottomSheet, Button, Calendar, Checkbox, Counter, Input, Stepper, Textarea, nextAvailableRange } from '@/components/ui';
import { Screen } from '@/components/layout/Screen';
import { useAppStore } from '@/store/useAppStore';
import { ACCOMMODATION_OPTIONS, SERVICE_FEE } from '@/lib/booking';

export function AccommodationBookingScreen() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const item = ACCOMMODATIONS.find((a) => a.id === id);
  const user = useAppStore((s) => s.user);
  const setDraft = useAppStore((s) => s.setDraft);

  const initial = useMemo(() => nextAvailableRange([], 2), []);
  const [start, setStart] = useState<string | undefined>(initial.start);
  const [end, setEnd] = useState<string | undefined>(initial.end);
  const [dateOpen, setDateOpen] = useState(false);
  const [guests, setGuests] = useState(2);
  const [roomId, setRoomId] = useState(params.get('room') ?? item?.rooms[0]?.id ?? '');
  const [roomOpen, setRoomOpen] = useState(false);
  const [options, setOptions] = useState<string[]>(['breakfast']);
  const [guestName, setGuestName] = useState(user.name);
  const [guestPhone, setGuestPhone] = useState(user.phone);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!item) return <Navigate to="/accommodations" replace />;
  const room = item.rooms.find((r) => r.id === roomId) ?? item.rooms[0]!;
  const nights = start && end ? nightsBetween(start, end) : 0;

  const lines: PriceLine[] = [];
  if (nights > 0) lines.push({ label: `Séjour (${nights} nuit${nights > 1 ? 's' : ''})`, amount: room.pricePerNight * nights });
  for (const opt of ACCOMMODATION_OPTIONS) {
    if (!options.includes(opt.id)) continue;
    const amount = opt.perPerson ? opt.price * guests : opt.price;
    lines.push({ label: opt.perPerson ? `${opt.label} (${guests} pers.)` : opt.label, amount });
  }
  lines.push({ label: 'Frais de service', amount: SERVICE_FEE });
  const total = lines.reduce((s, l) => s + l.amount, 0);

  const toggleOption = (optId: string) => setOptions((o) => (o.includes(optId) ? o.filter((x) => x !== optId) : [...o, optId]));

  const submit = () => {
    const next: Record<string, string> = {};
    if (!start || !end || nights < 1) next.dates = 'Sélectionnez vos dates d’arrivée et de départ.';
    if (guests > room.capacity) next.guests = `Cette chambre accueille ${room.capacity} personne${room.capacity > 1 ? 's' : ''} maximum.`;
    if (guestName.trim().length < 3) next.guestName = 'Entrez le nom du voyageur principal.';
    if (guestPhone.trim().length < 8) next.guestPhone = 'Entrez un numéro de téléphone valide.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setDraft({
      kind: 'accommodation',
      itemId: item.id,
      itemName: item.name,
      itemImage: room.image,
      city: item.city,
      startDate: start!,
      endDate: end!,
      guests,
      lines,
      total,
      subtitle: room.name,
      details: {
        Chambre: room.name,
        Lit: room.bed,
        'Voyageur principal': guestName.trim(),
        Téléphone: guestPhone.trim(),
        ...(note.trim() ? { 'Demande spéciale': note.trim() } : {}),
      },
    });
    navigate('/checkout');
  };

  return (
    <Screen
      topBar={{ back: `/accommodations/${item.id}`, title: 'Détails de la réservation' }}
      footer={
        <div>
          <div className="flex items-center justify-between mb-3 text-[12px]">
            <span className="flex items-center gap-1 text-ink-500">
              Total estimé <Info size={12} />
            </span>
            <span className="text-[16px] font-extrabold text-brand-700">{formatFCFA(total)}</span>
          </div>
          <Button full size="lg" onClick={submit}>
            Continuer
          </Button>
        </div>
      }
    >
      <div className="py-2">
        <Stepper steps={['Détails', 'Paiement', 'Confirmation']} current={1} />
      </div>

      <div className="mt-3 flex gap-3 rounded-[14px] bg-white p-2.5 shadow-card">
        <img src={item.images[0]} alt="" className="h-14 w-14 rounded-[10px] object-cover" />
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-ink-900 truncate">{item.name}</p>
          <p className="text-[11px] text-ink-500">{item.address}</p>
          <p className="text-[11px] font-semibold text-brand-700">{formatFCFA(room.pricePerNight)} / nuit</p>
        </div>
      </div>

      <section className="mt-5">
        <h2 className="text-[13px] font-semibold text-ink-700 mb-2">Dates de séjour</h2>
        <button
          type="button"
          onClick={() => setDateOpen(true)}
          className={`flex w-full items-center gap-3 rounded-[12px] border bg-white px-3.5 h-12 text-left ${errors.dates ? 'border-danger' : 'border-ink-200'}`}
        >
          <CalendarDays size={17} className="text-brand-700" />
          <span className="flex-1 text-[13px] font-medium text-ink-900">
            {start && end ? (
              <>
                {formatDate(start, { weekday: true })} – {formatDate(end, { weekday: true })}
              </>
            ) : (
              <span className="text-ink-300">Choisir les dates</span>
            )}
          </span>
          <ChevronRight size={16} className="text-ink-500" />
        </button>
        {errors.dates && <p className="mt-1 text-[12px] text-danger font-medium">{errors.dates}</p>}
        {nights > 0 && <p className="mt-1 text-[11px] text-ink-500">{nights} nuit{nights > 1 ? 's' : ''} · {formatDateRange(start!, end!)}</p>}
      </section>

      <section className="mt-5">
        <h2 className="text-[13px] font-semibold text-ink-700 mb-2">Nombre de voyageurs</h2>
        <div className={`flex items-center justify-between rounded-[12px] border bg-white px-3.5 h-12 ${errors.guests ? 'border-danger' : 'border-ink-200'}`}>
          <span className="flex items-center gap-2 text-[13px] font-medium text-ink-900">
            <Users size={17} className="text-brand-700" /> {guests} adulte{guests > 1 ? 's' : ''}
          </span>
          <Counter value={guests} onChange={setGuests} min={1} max={8} label="Voyageurs" />
        </div>
        {errors.guests && <p className="mt-1 text-[12px] text-danger font-medium">{errors.guests}</p>}
      </section>

      <section className="mt-5">
        <h2 className="text-[13px] font-semibold text-ink-700 mb-2">Type de chambre</h2>
        <button type="button" onClick={() => setRoomOpen(true)} className="flex w-full items-center gap-3 rounded-[12px] border border-ink-200 bg-white p-2.5 text-left">
          <img src={room.image} alt="" className="h-11 w-11 rounded-[8px] object-cover" />
          <span className="flex-1 min-w-0">
            <span className="block text-[13px] font-bold text-ink-900">{room.name}</span>
            <span className="flex items-center gap-1 text-[11px] text-ink-500">
              <BedDouble size={12} /> {room.bed} · {room.capacity} pers. max
            </span>
          </span>
          <ChevronRight size={16} className="text-ink-500" />
        </button>
      </section>

      <section className="mt-5">
        <h2 className="text-[13px] font-semibold text-ink-700 mb-1">Options supplémentaires</h2>
        <div className="rounded-[12px] bg-white px-3.5 shadow-card divide-y divide-ink-100">
          {ACCOMMODATION_OPTIONS.map((opt) => (
            <Checkbox
              key={opt.id}
              checked={options.includes(opt.id)}
              onChange={() => toggleOption(opt.id)}
              label={
                <span>
                  {opt.label} <span className="text-ink-500">(+{formatFCFA(opt.price, false)} FCFA{opt.perPerson ? ' / pers.' : ''})</span>
                </span>
              }
            />
          ))}
        </div>
      </section>

      <section className="mt-5 space-y-3">
        <h2 className="text-[13px] font-semibold text-ink-700 -mb-1">Informations du voyageur</h2>
        <Input label="Nom complet" value={guestName} onChange={(e) => setGuestName(e.target.value)} error={errors.guestName} />
        <Input label="Téléphone" type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} error={errors.guestPhone} />
        <Textarea label="Demande spéciale (optionnel)" placeholder="Ex. : chambre à l’étage, lit bébé…" value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} />
      </section>

      <BottomSheet
        open={dateOpen}
        onClose={() => setDateOpen(false)}
        title="Dates de séjour"
        footer={
          <Button full disabled={!start || !end} onClick={() => setDateOpen(false)}>
            {start && end ? `Confirmer (${nightsBetween(start, end)} nuit${nightsBetween(start, end) > 1 ? 's' : ''})` : 'Sélectionnez les dates'}
          </Button>
        }
      >
        <Calendar
          mode="range"
          start={start}
          end={end}
          onChange={(s, e) => {
            setStart(s);
            setEnd(e);
          }}
        />
      </BottomSheet>

      <BottomSheet open={roomOpen} onClose={() => setRoomOpen(false)} title="Choisir une chambre">
        <ul className="space-y-2.5 pb-2">
          {item.rooms.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => {
                  setRoomId(r.id);
                  setRoomOpen(false);
                }}
                className={`flex w-full gap-3 rounded-[14px] border p-2.5 text-left ${r.id === room.id ? 'border-brand-600 bg-brand-50' : 'border-ink-200 bg-white'}`}
              >
                <img src={r.image} alt="" className="h-16 w-16 rounded-[10px] object-cover" />
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] font-bold text-ink-900">{r.name}</span>
                  <span className="block text-[11px] text-ink-500">
                    {r.bed} · {r.capacity} pers.
                  </span>
                  <span className="block mt-1 text-[13px] font-bold text-brand-700">{formatFCFA(r.pricePerNight)} / nuit</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </BottomSheet>
    </Screen>
  );
}
