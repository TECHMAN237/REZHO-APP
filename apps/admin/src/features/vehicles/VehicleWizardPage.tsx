import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Plus, X } from 'lucide-react';
import { IMG, VEHICLE_TYPES, formatFCFA, type Fuel, type MediaItem, type Transmission, type VehicleType } from '@rezho/shared';
import { Page } from '@/components/layout/AppShell';
import { useAdminStore, useToastStore } from '@/store/useAdminStore';
import { AvailabilityCalendar, Button, Card, Counter, DayPicker, Input, Label, MediaUploader, Select, Stepper, Textarea, Toggle } from '@/components/ui';
import { VEHICLE_EQUIPMENT } from '@/lib/amenities';

const STEPS = ['Informations générales', 'Médias', 'Caractéristiques', 'Tarification & Disponibilités'];
const SAMPLES = [IMG.car7, IMG.carInterior1, IMG.suv4, IMG.carInterior2, IMG.car10, IMG.suv1, IMG.car11, IMG.car1].map((url, i) => ({ url, name: `vehicule-${i + 1}.jpg` }));
const BRANDS = ['Toyota', 'Hyundai', 'Kia', 'Renault', 'Mercedes-Benz', 'Nissan', 'Suzuki', 'Honda', 'Volkswagen', 'Peugeot', 'Mitsubishi', 'Ford'];
const COLORS = ['Blanc', 'Noir', 'Gris', 'Argent', 'Bleu', 'Rouge', 'Orange', 'Vert', 'Beige'];
const YEARS = Array.from({ length: 12 }, (_, i) => 2026 - i);

interface FormState {
  brand: string;
  model: string;
  year: number;
  type: VehicleType;
  name: string;
  description: string;
  media: MediaItem[];
  transmission: Transmission;
  fuel: Fuel;
  color: string;
  mileage: string;
  seats: number;
  equipment: string[];
  pricePerDay: string;
  deposit: string;
  longTermDiscount: string;
  available: boolean;
  availableDays: number[];
  unavailableDates: string[];
}

export function VehicleWizardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fleet = useAdminStore((s) => s.fleet);
  const addVehicle = useAdminStore((s) => s.addVehicle);
  const updateVehicle = useAdminStore((s) => s.updateVehicle);
  const show = useToastStore((s) => s.show);
  const editing = id ? fleet.find((v) => v.id === id) : undefined;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(() => ({
    brand: editing?.brand ?? 'Toyota',
    model: editing?.model ?? '',
    year: editing?.year ?? 2022,
    type: editing?.type ?? 'Berline',
    name: editing?.name ?? '',
    description: editing?.description ?? '',
    media: editing?.media ?? [],
    transmission: editing?.transmission ?? 'Automatique',
    fuel: editing?.fuel ?? 'Essence',
    color: editing?.color ?? 'Blanc',
    mileage: editing ? String(editing.mileage) : '',
    seats: editing?.seats ?? 5,
    equipment: editing?.equipment ?? ['Climatisation'],
    pricePerDay: editing ? String(editing.pricePerDay) : '',
    deposit: editing?.deposit ? String(editing.deposit) : '',
    longTermDiscount: editing?.longTermDiscount ? String(editing.longTermDiscount) : '',
    available: editing ? editing.status !== 'unavailable' : true,
    availableDays: editing?.availableDays ?? [1, 2, 3, 4, 5, 6, 7],
    unavailableDates: editing?.unavailableDates ?? [],
  }));
  const [customEquipment, setCustomEquipment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [publishing, setPublishing] = useState(false);

  if (id && !editing) return <Navigate to="/partner/vehicles/fleet" replace />;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const validate = (s: number): boolean => {
    const next: Record<string, string> = {};
    if (s === 1) {
      if (form.model.trim().length < 2) next.model = 'Modèle requis.';
      if (form.name.trim().length < 3) next.name = 'Nom interne requis.';
      if (form.description.trim().length < 20) next.description = 'Décrivez le véhicule (20 caractères minimum).';
    }
    if (s === 2 && form.media.length === 0) next.media = 'Ajoutez au moins une photo du véhicule.';
    if (s === 3) {
      if (form.mileage && Number(form.mileage) < 0) next.mileage = 'Kilométrage invalide.';
    }
    if (s === 4) {
      if (!form.pricePerDay || Number(form.pricePerDay) < 5000) next.pricePerDay = 'Prix par jour requis (min. 5 000 FCFA).';
      if (form.deposit && Number(form.deposit) < 0) next.deposit = 'Caution invalide.';
      if (form.longTermDiscount && (Number(form.longTermDiscount) < 0 || Number(form.longTermDiscount) > 50)) next.longTermDiscount = 'Entre 0 et 50 %.';
      if (form.availableDays.length === 0) next.days = 'Sélectionnez au moins un jour.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const publish = () => {
    if (!validate(4)) return;
    setPublishing(true);
    const payload = {
      brand: form.brand,
      model: form.model.trim(),
      year: form.year,
      name: form.name.trim(),
      type: form.type,
      description: form.description.trim(),
      media: form.media,
      transmission: form.transmission,
      fuel: form.fuel,
      color: form.color,
      mileage: Number(form.mileage) || 0,
      seats: form.seats,
      equipment: form.equipment,
      pricePerDay: Number(form.pricePerDay),
      deposit: form.deposit ? Number(form.deposit) : undefined,
      longTermDiscount: form.longTermDiscount ? Number(form.longTermDiscount) : undefined,
      availableDays: form.availableDays,
      unavailableDates: form.unavailableDates,
      status: form.available ? (editing && editing.status !== 'unavailable' ? editing.status : ('available' as const)) : ('unavailable' as const),
    };
    setTimeout(() => {
      if (editing) {
        updateVehicle(editing.id, payload);
        show('Véhicule mis à jour.');
        navigate('/partner/vehicles/fleet');
      } else {
        const created = addVehicle(payload);
        navigate(`/partner/vehicles/fleet/success/${created.id}`, { replace: true });
      }
    }, 900);
  };

  const addEquipment = (e: string) => {
    const clean = e.trim();
    if (!clean || form.equipment.includes(clean)) return;
    set('equipment', [...form.equipment, clean]);
    setCustomEquipment('');
  };

  return (
    <Page title={editing ? 'Modifier le véhicule' : 'Ajouter un véhicule'} subtitle={editing ? `Mettez à jour « ${editing.name} ».` : 'Enregistrez un nouveau véhicule en quelques étapes.'} narrow>
      <Card className="mb-5">
        <Stepper steps={STEPS} current={step} />
      </Card>
      <Card>
        {step === 1 && (
          <div className="page-in">
            <h2 className="text-[15px] font-bold text-ink-900 mb-4">Informations générales</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Select label="Marque" required value={form.brand} onChange={(e) => set('brand', e.target.value)}>
                {BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </Select>
              <Input label="Nom du véhicule (interne)" required placeholder="Ex. : Toyota Corolla 2022" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
              <Input label="Modèle" required placeholder="Ex. : Corolla" value={form.model} onChange={(e) => set('model', e.target.value)} error={errors.model} />
              <Textarea label="Description" required placeholder="Berline confortable, économique et idéale pour les déplacements en ville et sur de longues distances." value={form.description} onChange={(e) => set('description', e.target.value)} maxLength={200} error={errors.description} className="md:row-span-2" />
              <div className="grid grid-cols-2 gap-4">
                <Select label="Année" required value={form.year} onChange={(e) => set('year', Number(e.target.value))}>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </Select>
                <Select label="Type de véhicule" required value={form.type} onChange={(e) => set('type', e.target.value as VehicleType)}>
                  {VEHICLE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="page-in">
            <MediaUploader title="Photos et vidéo du véhicule" value={form.media} onChange={(m) => { set('media', m); setErrors((e) => ({ ...e, media: '' })); }} samples={SAMPLES} error={errors.media} />
            <p className="mt-3 text-[11px] text-ink-500">Conseil : ajoutez des photos extérieures et intérieures pour rassurer les clients.</p>
          </div>
        )}

        {step === 3 && (
          <div className="page-in">
            <h2 className="text-[15px] font-bold text-ink-900 mb-4">Caractéristiques du véhicule</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Select label="Transmission" value={form.transmission} onChange={(e) => set('transmission', e.target.value as Transmission)}>
                <option>Automatique</option>
                <option>Manuelle</option>
              </Select>
              <Select label="Couleur" value={form.color} onChange={(e) => set('color', e.target.value)}>
                {COLORS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              <Select label="Carburant" value={form.fuel} onChange={(e) => set('fuel', e.target.value as Fuel)}>
                <option>Essence</option>
                <option>Diesel</option>
                <option>Hybride</option>
                <option>Électrique</option>
              </Select>
              <Input label="Kilométrage" type="number" min={0} step={1000} suffix="km" placeholder="48 000" value={form.mileage} onChange={(e) => set('mileage', e.target.value)} error={errors.mileage} />
              <div className="flex flex-col gap-1.5">
                <Label>Nombre de places</Label>
                <Counter value={form.seats} onChange={(v) => set('seats', v)} min={2} max={9} label="Nombre de places" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Équipements</Label>
                <div className="flex flex-wrap gap-1.5">
                  {form.equipment.map((e) => (
                    <span key={e} className="inline-flex items-center gap-1 rounded-full bg-brand-100 pl-2.5 pr-1.5 py-1 text-[11px] font-semibold text-brand-800">
                      {e}
                      <button type="button" aria-label={`Retirer ${e}`} onClick={() => set('equipment', form.equipment.filter((x) => x !== e))} className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-brand-200">
                        <X size={10} strokeWidth={3} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {VEHICLE_EQUIPMENT.filter((e) => !form.equipment.includes(e)).map((e) => (
                    <button key={e} type="button" onClick={() => addEquipment(e)} className="inline-flex items-center gap-1 rounded-full border border-ink-200 bg-white px-2.5 py-1 text-[11px] font-medium text-ink-700 hover:border-brand-500 hover:text-brand-700">
                      <Plus size={10} /> {e}
                    </button>
                  ))}
                </div>
                <form
                  className="mt-1 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    addEquipment(customEquipment);
                  }}
                >
                  <input value={customEquipment} onChange={(e) => setCustomEquipment(e.target.value)} placeholder="Autre équipement…" aria-label="Autre équipement" className="h-9 flex-1 rounded-[8px] border border-ink-200 px-3 text-[12px] focus:outline-none focus:border-brand-600" />
                  <Button type="submit" size="sm" variant="outline">
                    Ajouter
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="page-in grid gap-8 lg:grid-cols-[320px_1fr]">
            <div>
              <h2 className="text-[15px] font-bold text-ink-900 mb-4">Tarification</h2>
              <div className="space-y-4">
                <Input label="Prix par jour" required type="number" min={0} step={1000} suffix="FCFA" placeholder="25 000" value={form.pricePerDay} onChange={(e) => set('pricePerDay', e.target.value)} error={errors.pricePerDay} />
                <Input label="Caution (optionnel)" type="number" min={0} step={5000} suffix="FCFA" placeholder="100 000" value={form.deposit} onChange={(e) => set('deposit', e.target.value)} error={errors.deposit} />
                <Input label="Remise longue durée (optionnel)" type="number" min={0} max={50} suffix="%" placeholder="10" hint="Appliquée à partir de 7 jours de location." value={form.longTermDiscount} onChange={(e) => set('longTermDiscount', e.target.value)} error={errors.longTermDiscount} />
                {form.pricePerDay && form.longTermDiscount && (
                  <p className="rounded-[10px] bg-brand-50 px-3 py-2 text-[12px] text-brand-800">
                    Prix longue durée : <span className="font-bold">{formatFCFA(Math.round(Number(form.pricePerDay) * (1 - Number(form.longTermDiscount) / 100)))}</span> / jour
                  </p>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-ink-900 mb-4">Disponibilités</h2>
              <div className="flex items-center justify-between rounded-[10px] border border-ink-200 px-3.5 h-11 mb-4">
                <span className="text-[13px] font-medium text-ink-900">Disponible à la location</span>
                <Toggle checked={form.available} onChange={(v) => set('available', v)} label="Disponible à la location" />
              </div>
              <Label>Jours disponibles</Label>
              <div className="mt-2 mb-5">
                <DayPicker value={form.availableDays} onChange={(v) => set('availableDays', v)} />
                {errors.days && <p className="mt-2 text-[11px] font-medium text-danger">{errors.days}</p>}
              </div>
              <AvailabilityCalendar compact getState={(iso) => (form.unavailableDates.includes(iso) ? 'unavailable' : 'available')} onToggle={(iso) => set('unavailableDates', form.unavailableDates.includes(iso) ? form.unavailableDates.filter((d) => d !== iso) : [...form.unavailableDates, iso])} />
            </div>
          </div>
        )}
      </Card>
      <div className="mt-5 flex items-center justify-between">
        {step === 1 ? (
          <Button variant="outline" onClick={() => navigate('/partner/vehicles/fleet')}>
            Annuler
          </Button>
        ) : (
          <Button variant="ghost" leftIcon={<ArrowLeft size={16} />} onClick={() => setStep((s) => s - 1)}>
            Précédent
          </Button>
        )}
        {step < 4 ? (
          <Button rightIcon={<ArrowRight size={16} />} onClick={() => validate(step) && setStep((s) => s + 1)}>
            Suivant
          </Button>
        ) : (
          <Button size="lg" loading={publishing} rightIcon={<Check size={16} />} onClick={publish}>
            {editing ? 'Enregistrer les modifications' : 'Publier le véhicule'}
          </Button>
        )}
      </div>
    </Page>
  );
}
