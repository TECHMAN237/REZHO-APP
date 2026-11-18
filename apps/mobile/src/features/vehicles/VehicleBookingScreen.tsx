import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, ChevronRight, Info, MapPin, ShieldCheck } from 'lucide-react';
import { VEHICLES, daysInclusive, formatDate, formatFCFA, type PriceLine } from '@rezho/shared';
import { BottomSheet, Button, Calendar, Checkbox, Input, Select, Stepper, nextAvailableRange } from '@/components/ui';
import { Screen } from '@/components/layout/Screen';
import { useAppStore } from '@/store/useAppStore';
import { PICKUP_LOCATIONS, SERVICE_FEE, VEHICLE_OPTIONS } from '@/lib/booking';

export function VehicleBookingScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = VEHICLES.find((v) => v.id === id);
  const user = useAppStore((s) => s.user);
  const setDraft = useAppStore((s) => s.setDraft);

  const initial = useMemo(() => nextAvailableRange([], 2), []);
  const [start, setStart] = useState<string | undefined>(initial.start);
  const [end, setEnd] = useState<string | undefined>(initial.end);
  const [dateOpen, setDateOpen] = useState(false);
  const locations = PICKUP_LOCATIONS[item?.city ?? 'Yaoundé'] ?? PICKUP_LOCATIONS.Yaoundé!;
  const [pickup, setPickup] = useState(locations[0]!);
  const [dropoff, setDropoff] = useState(locations[0]!);
  const [pickupTime, setPickupTime] = useState('09:00');
  const [options, setOptions] = useState<string[]>([]);
  const [driverName, setDriverName] = useState(user.name);
  const [driverPhone, setDriverPhone] = useState(user.phone);
  const [license, setLicense] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!item) return <Navigate to="/vehicles" replace />;
  const days = start && end ? daysInclusive(start, end) : 0;
  const discount = item.longTermDiscount && days >= 7 ? item.longTermDiscount : 0;

  const lines: PriceLine[] = [];
  if (days > 0) lines.push({ label: `Location (${days} jour${days > 1 ? 's' : ''})`, amount: item.pricePerDay * days });
  if (discount) lines.push({ label: `Remise longue durée (-${discount}%)`, amount: -Math.round(item.pricePerDay * days * (discount / 100)) });
  for (const opt of VEHICLE_OPTIONS) {
    if (!options.includes(opt.id)) continue;
    lines.push({ label: opt.label, amount: opt.perDay ? opt.price * Math.max(1, days) : opt.price });
  }
  if (pickup.startsWith('Livraison') || dropoff.startsWith('Livraison')) lines.push({ label: 'Livraison / récupération', amount: 5000 });
  lines.push({ label: 'Frais de service', amount: SERVICE_FEE });
  const total = lines.reduce((s, l) => s + l.amount, 0);

  const toggleOption = (optId: string) => setOptions((o) => (o.includes(optId) ? o.filter((x) => x !== optId) : [...o, optId]));

  const submit = () => {
    const next: Record<string, string> = {};
    if (!start || !end || days < 1) next.dates = 'Sélectionnez les dates de location.';
    if (driverName.trim().length < 3) next.driverName = 'Entrez le nom du conducteur.';
    if (driverPhone.trim().length < 8) next.driverPhone = 'Entrez un numéro de téléphone valide.';
    if (license.trim().length < 5) next.license = 'Entrez le numéro de permis de conduire.';
    if (!acceptTerms) next.terms = 'Vous devez accepter les conditions de location.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setDraft({
      kind: 'vehicle',
      itemId: item.id,
      itemName: item.name,
      itemImage: item.images[0]!,
      city: item.city,
      startDate: start!,
      endDate: end!,
      guests: 1,
      lines,
      total,
      subtitle: `${days} jour${days > 1 ? 's' : ''} · ${item.transmission}`,
      details: {
        'Lieu de prise en charge': pickup,
        'Lieu de retour': dropoff,
        'Heure de prise en charge': pickupTime,
        Conducteur: driverName.trim(),
        Téléphone: driverPhone.trim(),
        'Permis n°': license.trim(),
        Caution: `${formatFCFA(item.deposit)} (à la prise en charge)`,
      },
    });
    navigate('/checkout');
  };

  return (
    <Screen
      topBar={{ back: `/vehicles/${item.id}`, title: 'Détails de la location' }}
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
        <img src={item.images[0]} alt="" className="h-14 w-20 rounded-[10px] object-cover" />
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-ink-900 truncate">{item.name}</p>
          <p className="text-[11px] text-ink-500">
            {item.transmission} · {item.fuel} · {item.seats} places
          </p>
          <p className="text-[11px] font-semibold text-brand-700">{formatFCFA(item.pricePerDay)} / jour</p>
        </div>
      </div>

      <section className="mt-5">
        <h2 className="text-[13px] font-semibold text-ink-700 mb-2">Période de location</h2>
        <button type="button" onClick={() => setDateOpen(true)} className={`flex w-full items-center gap-3 rounded-[12px] border bg-white px-3.5 h-12 text-left ${errors.dates ? 'border-danger' : 'border-ink-200'}`}>
          <CalendarDays size={17} className="text-brand-700" />
          <span className="flex-1 text-[13px] font-medium text-ink-900">
            {start && end ? `${formatDate(start, { weekday: true })} – ${formatDate(end, { weekday: true })}` : <span className="text-ink-300">Choisir les dates</span>}
          </span>
          <ChevronRight size={16} className="text-ink-500" />
        </button>
        {errors.dates && <p className="mt-1 text-[12px] text-danger font-medium">{errors.dates}</p>}
        {days > 0 && (
          <p className="mt-1 text-[11px] text-ink-500">
            {days} jour{days > 1 ? 's' : ''}
            {discount ? ` · remise longue durée -${discount}% appliquée` : ''}
          </p>
        )}
      </section>

      <section className="mt-5 space-y-3">
        <Select label="Lieu de prise en charge" icon={<MapPin size={16} />} value={pickup} onChange={(e) => setPickup(e.target.value)}>
          {locations.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </Select>
        <Select label="Lieu de retour" icon={<MapPin size={16} />} value={dropoff} onChange={(e) => setDropoff(e.target.value)}>
          {locations.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </Select>
        <Select label="Heure de prise en charge" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)}>
          {['07:00', '08:00', '09:00', '10:00', '12:00', '14:00', '16:00', '18:00'].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </section>

      <section className="mt-5">
        <h2 className="text-[13px] font-semibold text-ink-700 mb-1">Options</h2>
        <div className="rounded-[12px] bg-white px-3.5 shadow-card divide-y divide-ink-100">
          {VEHICLE_OPTIONS.map((opt) => (
            <Checkbox
              key={opt.id}
              checked={options.includes(opt.id)}
              onChange={() => toggleOption(opt.id)}
              label={
                <span>
                  {opt.label} <span className="text-ink-500">(+{formatFCFA(opt.price, false)} FCFA{opt.perDay ? ' / jour' : ''})</span>
                </span>
              }
            />
          ))}
        </div>
      </section>

      <section className="mt-5 space-y-3">
        <h2 className="text-[13px] font-semibold text-ink-700 -mb-1">Conducteur</h2>
        <Input label="Nom complet" value={driverName} onChange={(e) => setDriverName(e.target.value)} error={errors.driverName} />
        <Input label="Téléphone" type="tel" value={driverPhone} onChange={(e) => setDriverPhone(e.target.value)} error={errors.driverPhone} />
        <Input label="Numéro de permis de conduire" placeholder="Ex. : CM-2019-123456" value={license} onChange={(e) => setLicense(e.target.value)} error={errors.license} />
      </section>

      <section className="mt-5 rounded-[14px] bg-white p-3.5 shadow-card">
        <p className="flex items-center gap-2 text-[12px] text-ink-700">
          <ShieldCheck size={16} className="text-brand-700" /> Caution de <span className="font-bold text-ink-900">{formatFCFA(item.deposit)}</span> à la prise en charge, restituée au retour.
        </p>
        <div className="mt-2">
          <Checkbox checked={acceptTerms} onChange={setAcceptTerms} error={errors.terms} label={<span className="text-[12px]">J’accepte les conditions de location (permis valide, carburant à ma charge, retour à l’heure).</span>} />
        </div>
      </section>

      <BottomSheet
        open={dateOpen}
        onClose={() => setDateOpen(false)}
        title="Période de location"
        footer={
          <Button full disabled={!start || !end} onClick={() => setDateOpen(false)}>
            {start && end ? `Confirmer (${daysInclusive(start, end)} jour${daysInclusive(start, end) > 1 ? 's' : ''})` : 'Sélectionnez les dates'}
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
    </Screen>
  );
}
