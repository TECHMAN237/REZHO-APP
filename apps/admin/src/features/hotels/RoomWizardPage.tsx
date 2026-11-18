import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { AMENITY_LABEL, CITIES, IMG, ROOM_TYPES, formatFCFA, type AmenityKey, type City, type MediaItem, type RoomType } from '@rezho/shared';
import { Page } from '@/components/layout/AppShell';
import { useAdminStore, useToastStore } from '@/store/useAdminStore';
import { AvailabilityCalendar, Button, Card, Counter, Input, Label, MediaUploader, Select, SelectTile, Stepper, Textarea } from '@/components/ui';
import { AMENITY_ICON, ROOM_AMENITIES } from '@/lib/amenities';

const STEPS = ['Infos générales', 'Médias (Photos & Vidéo)', 'Équipements', 'Tarification & Disponibilités'];

const SAMPLES = [IMG.room1, IMG.room2, IMG.room3, IMG.room4, IMG.room5, IMG.room6, IMG.room7, IMG.room8].map((url, i) => ({ url, name: `chambre-${i + 1}.jpg` }));

interface FormState {
  name: string;
  type: RoomType;
  description: string;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  surface: string;
  address: string;
  city: City;
  media: MediaItem[];
  amenities: AmenityKey[];
  pricePerNight: string;
  weekendPrice: string;
  promoPercent: string;
  unavailableDates: string[];
}

export function RoomWizardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const rooms = useAdminStore((s) => s.rooms);
  const addRoom = useAdminStore((s) => s.addRoom);
  const updateRoom = useAdminStore((s) => s.updateRoom);
  const profile = useAdminStore((s) => s.profiles.hotels);
  const reservations = useAdminStore((s) => s.reservations.hotels);
  const show = useToastStore((s) => s.show);
  const editing = id ? rooms.find((r) => r.id === id) : undefined;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(() => ({
    name: editing?.name ?? '',
    type: editing?.type ?? 'Double',
    description: editing?.description ?? '',
    capacity: editing?.capacity ?? 2,
    bedrooms: editing?.bedrooms ?? 1,
    bathrooms: editing?.bathrooms ?? 1,
    surface: editing ? String(editing.surface) : '',
    address: editing?.address ?? profile.address.split(',')[0] ?? '',
    city: editing?.city ?? profile.city,
    media: editing?.media ?? [],
    amenities: editing?.amenities ?? ['wifi', 'ac'],
    pricePerNight: editing ? String(editing.pricePerNight) : '',
    weekendPrice: editing?.weekendPrice ? String(editing.weekendPrice) : '',
    promoPercent: editing?.promoPercent ? String(editing.promoPercent) : '',
    unavailableDates: editing?.unavailableDates ?? [],
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [publishing, setPublishing] = useState(false);

  if (id && !editing) return <Navigate to="/partner/hotels/rooms" replace />;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const validate = (s: number): boolean => {
    const next: Record<string, string> = {};
    if (s === 1) {
      if (form.name.trim().length < 3) next.name = 'Nom requis (3 caractères minimum).';
      if (form.description.trim().length < 20) next.description = 'Décrivez la chambre (20 caractères minimum).';
      if (form.surface && Number(form.surface) <= 0) next.surface = 'Surface invalide.';
    }
    if (s === 2 && form.media.length === 0) next.media = 'Ajoutez au moins une photo.';
    if (s === 3 && form.amenities.length === 0) next.amenities = 'Sélectionnez au moins un équipement.';
    if (s === 4) {
      if (!form.pricePerNight || Number(form.pricePerNight) < 1000) next.pricePerNight = 'Prix par nuit requis (min. 1 000 FCFA).';
      if (form.weekendPrice && Number(form.weekendPrice) < 1000) next.weekendPrice = 'Prix week-end invalide.';
      if (form.promoPercent && (Number(form.promoPercent) < 0 || Number(form.promoPercent) > 90)) next.promoPercent = 'Entre 0 et 90 %.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const next = () => validate(step) && setStep((s) => Math.min(4, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const publish = () => {
    if (!validate(4)) return;
    setPublishing(true);
    const payload = {
      number: editing?.number ?? `N°${100 + rooms.length + 1}`,
      name: form.name.trim(),
      type: form.type,
      capacity: form.capacity,
      bedrooms: form.bedrooms,
      bathrooms: form.bathrooms,
      surface: Number(form.surface) || 0,
      address: form.address.trim(),
      city: form.city,
      description: form.description.trim(),
      media: form.media,
      amenities: form.amenities,
      pricePerNight: Number(form.pricePerNight),
      weekendPrice: form.weekendPrice ? Number(form.weekendPrice) : undefined,
      promoPercent: form.promoPercent ? Number(form.promoPercent) : undefined,
      unavailableDates: form.unavailableDates,
      status: editing?.status ?? ('available' as const),
    };
    setTimeout(() => {
      if (editing) {
        updateRoom(editing.id, payload);
        show('Chambre mise à jour.');
        navigate('/partner/hotels/rooms');
      } else {
        const created = addRoom(payload);
        navigate(`/partner/hotels/rooms/success/${created.id}`, { replace: true });
      }
    }, 900);
  };

  const reservedDates = new Set<string>();
  if (editing) {
    for (const r of reservations) {
      if (r.itemId !== editing.id || !r.endDate || r.status === 'cancelled') continue;
      let d = r.startDate;
      while (d < r.endDate) {
        reservedDates.add(d);
        const nd = new Date(d);
        nd.setDate(nd.getDate() + 1);
        d = nd.toISOString().slice(0, 10);
      }
    }
  }

  return (
    <Page title={editing ? 'Modifier la chambre' : 'Ajouter une chambre'} subtitle={editing ? `Mettez à jour « ${editing.name} ».` : 'Créez une nouvelle chambre en 4 étapes.'} narrow>
      <Card className="mb-5">
        <Stepper steps={STEPS} current={step} />
      </Card>

      <Card>
        {step === 1 && (
          <div className="page-in">
            <h2 className="text-[15px] font-bold text-ink-900 mb-4">Informations générales</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <Input label="Nom de la chambre" required placeholder="Ex. : Chambre Deluxe" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
                <Select label="Type de chambre" required value={form.type} onChange={(e) => set('type', e.target.value as RoomType)}>
                  {ROOM_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t === 'Simple' ? 'Chambre simple' : t === 'Double' ? 'Chambre double' : t}
                    </option>
                  ))}
                </Select>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label>Capacité</Label>
                    <Counter value={form.capacity} onChange={(v) => set('capacity', v)} min={1} max={12} label="Capacité" />
                  </div>
                  <Input label="Surface (optionnel)" type="number" min={0} suffix="m²" placeholder="25" value={form.surface} onChange={(e) => set('surface', e.target.value)} error={errors.surface} />
                </div>
              </div>
              <div className="space-y-4">
                <Textarea label="Description" required placeholder="Chambre moderne et confortable, idéale pour un séjour d’affaires ou de détente." value={form.description} onChange={(e) => set('description', e.target.value)} maxLength={200} error={errors.description} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Chambres</Label>
                  <Counter value={form.bedrooms} onChange={(v) => set('bedrooms', v)} min={1} max={10} label="Nombre de chambres" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Salles de bain</Label>
                  <Counter value={form.bathrooms} onChange={(v) => set('bathrooms', v)} min={1} max={10} label="Nombre de salles de bain" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Adresse" value={form.address} onChange={(e) => set('address', e.target.value)} />
                <Select label="Ville" value={form.city} onChange={(e) => set('city', e.target.value as City)}>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="page-in">
            <MediaUploader title="Photos et vidéo de la chambre" value={form.media} onChange={(m) => { set('media', m); setErrors((e) => ({ ...e, media: '' })); }} samples={SAMPLES} error={errors.media} />
          </div>
        )}

        {step === 3 && (
          <div className="page-in">
            <h2 className="text-[15px] font-bold text-ink-900 mb-1">Équipements de la chambre</h2>
            <p className="text-[12px] text-ink-500 mb-4">Sélectionnez les équipements disponibles.</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {ROOM_AMENITIES.map((a) => {
                const Icon = AMENITY_ICON[a];
                const selected = form.amenities.includes(a);
                return <SelectTile key={a} selected={selected} onToggle={() => set('amenities', selected ? form.amenities.filter((x) => x !== a) : [...form.amenities, a])} icon={<Icon size={22} />} label={AMENITY_LABEL[a]} />;
              })}
            </div>
            {errors.amenities && <p className="mt-3 text-[11px] font-medium text-danger">{errors.amenities}</p>}
          </div>
        )}

        {step === 4 && (
          <div className="page-in grid gap-8 lg:grid-cols-[320px_1fr]">
            <div>
              <h2 className="text-[15px] font-bold text-ink-900 mb-4">Tarification</h2>
              <div className="space-y-4">
                <Input label="Prix par nuit" required type="number" min={0} step={500} suffix="FCFA" placeholder="25 000" value={form.pricePerNight} onChange={(e) => set('pricePerNight', e.target.value)} error={errors.pricePerNight} />
                <Input label="Prix week-end (optionnel)" type="number" min={0} step={500} suffix="FCFA" placeholder="28 000" value={form.weekendPrice} onChange={(e) => set('weekendPrice', e.target.value)} error={errors.weekendPrice} />
                <Input label="Promo (optionnel)" type="number" min={0} max={90} suffix="%" placeholder="10" value={form.promoPercent} onChange={(e) => set('promoPercent', e.target.value)} error={errors.promoPercent} />
                {form.pricePerNight && form.promoPercent && (
                  <p className="rounded-[10px] bg-brand-50 px-3 py-2 text-[12px] text-brand-800">
                    Prix affiché : <span className="font-bold">{formatFCFA(Math.round(Number(form.pricePerNight) * (1 - Number(form.promoPercent) / 100)))}</span> / nuit
                  </p>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-ink-900 mb-1">Disponibilités</h2>
              <p className="text-[12px] text-ink-500 mb-3">Cliquez sur un jour pour le rendre indisponible.</p>
              <AvailabilityCalendar
                getState={(iso) => (reservedDates.has(iso) ? 'reserved' : form.unavailableDates.includes(iso) ? 'unavailable' : 'available')}
                onToggle={(iso) => set('unavailableDates', form.unavailableDates.includes(iso) ? form.unavailableDates.filter((d) => d !== iso) : [...form.unavailableDates, iso])}
              />
            </div>
          </div>
        )}
      </Card>

      <div className="mt-5 flex items-center justify-between">
        {step === 1 ? (
          <Button variant="outline" onClick={() => navigate('/partner/hotels/rooms')}>
            Annuler
          </Button>
        ) : (
          <Button variant="ghost" leftIcon={<ArrowLeft size={16} />} onClick={prev}>
            Précédent
          </Button>
        )}
        {step < 4 ? (
          <Button rightIcon={<ArrowRight size={16} />} onClick={next}>
            Suivant
          </Button>
        ) : (
          <Button size="lg" loading={publishing} rightIcon={<Check size={16} />} onClick={publish}>
            {editing ? 'Enregistrer les modifications' : 'Publier la chambre'}
          </Button>
        )}
      </div>
    </Page>
  );
}
