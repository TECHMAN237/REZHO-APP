import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { DISH_CATEGORIES, IMG, formatFCFA, type DishCategory, type MediaItem } from '@rezho/shared';
import { Page } from '@/components/layout/AppShell';
import { useAdminStore, useToastStore } from '@/store/useAdminStore';
import { Button, Card, DayPicker, Input, Label, MediaUploader, Select, Stepper, Textarea, Toggle } from '@/components/ui';

const STEPS = ['Infos générales', 'Médias', 'Prix & Disponibilité'];
const SAMPLES = [IMG.food6, IMG.food5, IMG.food7, IMG.food9, IMG.food1, IMG.food4, IMG.dessert1, IMG.drink3].map((url, i) => ({ url, name: `plat-${i + 1}.jpg` }));

interface FormState {
  name: string;
  category: DishCategory;
  description: string;
  prepTime: string;
  media: MediaItem[];
  price: string;
  promoPercent: string;
  available: boolean;
  availableDays: number[];
}

export function DishWizardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dishes = useAdminStore((s) => s.dishes);
  const addDish = useAdminStore((s) => s.addDish);
  const updateDish = useAdminStore((s) => s.updateDish);
  const show = useToastStore((s) => s.show);
  const editing = id ? dishes.find((d) => d.id === id) : undefined;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(() => ({
    name: editing?.name ?? '',
    category: editing?.category ?? 'Plats principaux',
    description: editing?.description ?? '',
    prepTime: '',
    media: editing?.media ?? [],
    price: editing ? String(editing.price) : '',
    promoPercent: editing?.promoPercent ? String(editing.promoPercent) : '',
    available: editing?.available ?? true,
    availableDays: editing?.availableDays ?? [1, 2, 3, 4, 5, 6, 7],
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [publishing, setPublishing] = useState(false);

  if (id && !editing) return <Navigate to="/partner/restaurants/menu" replace />;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const validate = (s: number): boolean => {
    const next: Record<string, string> = {};
    if (s === 1) {
      if (form.name.trim().length < 2) next.name = 'Nom du plat requis.';
      if (form.description.trim().length < 10) next.description = 'Décrivez le plat (10 caractères minimum).';
    }
    if (s === 2 && form.media.length === 0) next.media = 'Ajoutez au moins une photo du plat.';
    if (s === 3) {
      if (!form.price || Number(form.price) < 100) next.price = 'Prix requis (min. 100 FCFA).';
      if (form.promoPercent && (Number(form.promoPercent) < 0 || Number(form.promoPercent) > 90)) next.promoPercent = 'Entre 0 et 90 %.';
      if (form.availableDays.length === 0) next.days = 'Sélectionnez au moins un jour.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const publish = () => {
    if (!validate(3)) return;
    setPublishing(true);
    const payload = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      price: Number(form.price),
      promoPercent: form.promoPercent ? Number(form.promoPercent) : undefined,
      image: form.media.find((m) => m.kind === 'image')?.url ?? form.media[0]?.url ?? IMG.food6,
      available: form.available,
      availableDays: form.availableDays,
      media: form.media,
    };
    setTimeout(() => {
      if (editing) {
        updateDish(editing.id, payload);
        show('Plat mis à jour.');
        navigate('/partner/restaurants/menu');
      } else {
        const created = addDish(payload);
        navigate(`/partner/restaurants/menu/success/${created.id}`, { replace: true });
      }
    }, 900);
  };

  return (
    <Page title={editing ? 'Modifier le plat' : 'Ajouter un plat'} subtitle={editing ? `Mettez à jour « ${editing.name} ».` : 'Ajoutez un nouveau plat au menu en quelques étapes.'} narrow>
      <Card className="mb-5">
        <Stepper steps={STEPS} current={step} />
      </Card>
      <Card>
        {step === 1 && (
          <div className="page-in">
            <h2 className="text-[15px] font-bold text-ink-900 mb-4">Informations du plat</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Nom du plat" required placeholder="Ex. : Poulet DG" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
              <Select label="Catégorie" required value={form.category} onChange={(e) => set('category', e.target.value as DishCategory)}>
                {DISH_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              <Textarea label="Description" required placeholder="Poulet sauté aux plantains mûrs, avec légumes frais et épices locales." value={form.description} onChange={(e) => set('description', e.target.value)} maxLength={200} error={errors.description} className="md:col-span-2" />
              <Input label="Temps de préparation (optionnel)" type="number" min={0} suffix="min" placeholder="25" value={form.prepTime} onChange={(e) => set('prepTime', e.target.value)} />
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="page-in">
            <MediaUploader title="Photos et vidéo du plat" value={form.media} onChange={(m) => { set('media', m); setErrors((e) => ({ ...e, media: '' })); }} samples={SAMPLES} error={errors.media} max={8} />
          </div>
        )}
        {step === 3 && (
          <div className="page-in grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-[15px] font-bold text-ink-900 mb-4">Tarification</h2>
              <div className="space-y-4">
                <Input label="Prix du plat" required type="number" min={0} step={100} suffix="FCFA" placeholder="4 000" value={form.price} onChange={(e) => set('price', e.target.value)} error={errors.price} />
                <Input label="Promo (optionnel)" type="number" min={0} max={90} suffix="%" placeholder="10" value={form.promoPercent} onChange={(e) => set('promoPercent', e.target.value)} error={errors.promoPercent} />
                {form.price && form.promoPercent && (
                  <p className="rounded-[10px] bg-brand-50 px-3 py-2 text-[12px] text-brand-800">
                    Prix affiché : <span className="font-bold">{formatFCFA(Math.round(Number(form.price) * (1 - Number(form.promoPercent) / 100)))}</span>
                  </p>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-ink-900 mb-4">Disponibilité</h2>
              <div className="flex items-center justify-between rounded-[10px] border border-ink-200 px-3.5 h-11 mb-4">
                <span className="text-[13px] font-medium text-ink-900">Disponible à la commande</span>
                <Toggle checked={form.available} onChange={(v) => set('available', v)} label="Disponible à la commande" />
              </div>
              <Label>Jours de disponibilité</Label>
              <div className="mt-2">
                <DayPicker value={form.availableDays} onChange={(v) => set('availableDays', v)} />
              </div>
              {errors.days && <p className="mt-2 text-[11px] font-medium text-danger">{errors.days}</p>}
            </div>
          </div>
        )}
      </Card>
      <div className="mt-5 flex items-center justify-between">
        {step === 1 ? (
          <Button variant="outline" onClick={() => navigate('/partner/restaurants/menu')}>
            Annuler
          </Button>
        ) : (
          <Button variant="ghost" leftIcon={<ArrowLeft size={16} />} onClick={() => setStep((s) => s - 1)}>
            Précédent
          </Button>
        )}
        {step < 3 ? (
          <Button rightIcon={<ArrowRight size={16} />} onClick={() => validate(step) && setStep((s) => s + 1)}>
            Suivant
          </Button>
        ) : (
          <Button size="lg" loading={publishing} rightIcon={<Check size={16} />} onClick={publish}>
            {editing ? 'Enregistrer les modifications' : 'Publier le plat'}
          </Button>
        )}
      </div>
    </Page>
  );
}
