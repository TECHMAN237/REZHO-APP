import { useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Camera, Check } from 'lucide-react';
import { CITIES, isValidEmail, isValidPhone, type City } from '@rezho/shared';
import { Page, useShell } from '@/components/layout/AppShell';
import { useAdminStore, useToastStore, type NotificationPrefs } from '@/store/useAdminStore';
import { Button, Card, Input, Select, Tabs, Textarea, Toggle } from '@/components/ui';

type Tab = 'establishment' | 'account' | 'notifications';

export function SettingsPage() {
  const { kind } = useShell();
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as Tab | null) ?? 'establishment';
  const setTab = (t: Tab) => setParams({ tab: t }, { replace: true });

  const profile = useAdminStore((s) => s.profiles[kind]);
  const account = useAdminStore((s) => s.account);
  const notifications = useAdminStore((s) => s.notifications[kind]);
  const updateProfile = useAdminStore((s) => s.updateProfile);
  const updateAccount = useAdminStore((s) => s.updateAccount);
  const setNotification = useAdminStore((s) => s.setNotification);
  const show = useToastStore((s) => s.show);

  const [est, setEst] = useState({ name: profile.name, phone: profile.phone, email: profile.email, address: profile.address, city: profile.city, description: profile.description, image: profile.image });
  const [acc, setAcc] = useState({ name: account.name, email: account.email, phone: account.phone, password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const entityLabel = kind === 'hotels' ? 'établissement' : kind === 'restaurants' ? 'restaurant' : 'agence';
  const nameLabel = kind === 'hotels' ? 'Nom de l’établissement' : kind === 'restaurants' ? 'Nom du restaurant' : 'Nom de l’agence';
  const tabLabel = kind === 'hotels' ? 'Établissement' : kind === 'restaurants' ? 'Restaurant' : 'Agence';

  const saveEstablishment = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (est.name.trim().length < 2) next.name = 'Nom requis.';
    if (!isValidPhone(est.phone)) next.phone = 'Numéro invalide.';
    if (!isValidEmail(est.email)) next.email = 'Email invalide.';
    if (est.address.trim().length < 4) next.address = 'Adresse requise.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    setTimeout(() => {
      updateProfile(kind, { ...est, city: est.city as City });
      setSaving(false);
      show('Modifications enregistrées.');
    }, 600);
  };

  const saveAccount = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (acc.name.trim().length < 2) next.accName = 'Nom requis.';
    if (!isValidEmail(acc.email)) next.accEmail = 'Email invalide.';
    if (!isValidPhone(acc.phone)) next.accPhone = 'Numéro invalide.';
    if (acc.password && acc.password.length < 6) next.password = 'Au moins 6 caractères.';
    if (acc.password && acc.password !== acc.confirm) next.confirm = 'Les mots de passe ne correspondent pas.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    setTimeout(() => {
      updateAccount({ name: acc.name, email: acc.email, phone: acc.phone });
      setAcc((a) => ({ ...a, password: '', confirm: '' }));
      setSaving(false);
      show(acc.password ? 'Compte et mot de passe mis à jour.' : 'Compte mis à jour.');
    }, 600);
  };

  const notifRows: { key: keyof NotificationPrefs; label: string; text: string }[] = [
    { key: 'newReservation', label: 'Nouvelles réservations', text: 'Être alerté dès qu’un client réserve.' },
    { key: 'payment', label: 'Paiements reçus', text: 'Notification à chaque paiement encaissé via REZHO.' },
    { key: 'reminders', label: 'Rappels', text: kind === 'restaurants' ? 'Rappel des services et réservations du jour.' : 'Rappel des arrivées et départs du jour.' },
    { key: 'marketing', label: 'Nouveautés REZHO', text: 'Conseils, nouvelles fonctionnalités et offres partenaires.' },
    { key: 'email', label: 'Par email', text: 'Recevoir les notifications par email.' },
    { key: 'sms', label: 'Par SMS', text: 'Recevoir les notifications par SMS.' },
  ];

  return (
    <Page title="Paramètres" subtitle={`Gérez les informations de votre ${entityLabel} et votre compte.`} narrow>
      <div className="mb-5">
        <Tabs
          options={[
            { key: 'establishment', label: tabLabel },
            { key: 'account', label: 'Compte' },
            { key: 'notifications', label: 'Notifications' },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {tab === 'establishment' && (
        <form onSubmit={saveEstablishment} noValidate>
          <Card>
            <h2 className="text-[15px] font-bold text-ink-900">Informations {kind === 'hotels' ? 'de l’établissement' : kind === 'restaurants' ? 'du restaurant' : 'de l’agence'}</h2>
            <div className="mt-5 grid gap-6 md:grid-cols-[220px_1fr]">
              <div>
                <div className="relative overflow-hidden rounded-[14px] bg-ink-100 aspect-[4/3]">
                  <img src={est.image} alt="" className="h-full w-full object-cover" />
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  aria-label="Choisir une photo"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setEst({ ...est, image: URL.createObjectURL(f) });
                  }}
                />
                <Button type="button" variant="outline" size="sm" className="mt-3 w-full" leftIcon={<Camera size={14} />} onClick={() => fileRef.current?.click()}>
                  Modifier la photo
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label={nameLabel} required value={est.name} onChange={(e) => setEst({ ...est, name: e.target.value })} error={errors.name} className="sm:col-span-2" />
                <Input label="Téléphone" required type="tel" value={est.phone} onChange={(e) => setEst({ ...est, phone: e.target.value })} error={errors.phone} />
                <Input label="Email de contact" required type="email" value={est.email} onChange={(e) => setEst({ ...est, email: e.target.value })} error={errors.email} />
                <Input label="Adresse" required value={est.address} onChange={(e) => setEst({ ...est, address: e.target.value })} error={errors.address} />
                <Select label="Ville" value={est.city} onChange={(e) => setEst({ ...est, city: e.target.value as City })}>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
                <Textarea label="Description" value={est.description} onChange={(e) => setEst({ ...est, description: e.target.value })} maxLength={300} className="sm:col-span-2" />
              </div>
            </div>
          </Card>
          <div className="mt-5 flex justify-end">
            <Button type="submit" size="lg" loading={saving} rightIcon={<Check size={16} />}>
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      )}

      {tab === 'account' && (
        <form onSubmit={saveAccount} noValidate>
          <Card>
            <h2 className="text-[15px] font-bold text-ink-900">Compte gestionnaire</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Input label="Nom complet" required value={acc.name} onChange={(e) => setAcc({ ...acc, name: e.target.value })} error={errors.accName} />
              <Input label="Email de connexion" required type="email" value={acc.email} onChange={(e) => setAcc({ ...acc, email: e.target.value })} error={errors.accEmail} />
              <Input label="Téléphone" required type="tel" value={acc.phone} onChange={(e) => setAcc({ ...acc, phone: e.target.value })} error={errors.accPhone} />
            </div>
            <h3 className="mt-6 text-[13px] font-bold text-ink-900">Changer le mot de passe</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Input label="Nouveau mot de passe" type="password" autoComplete="new-password" value={acc.password} onChange={(e) => setAcc({ ...acc, password: e.target.value })} error={errors.password} hint="Laissez vide pour conserver le mot de passe actuel." />
              <Input label="Confirmer" type="password" autoComplete="new-password" value={acc.confirm} onChange={(e) => setAcc({ ...acc, confirm: e.target.value })} error={errors.confirm} />
            </div>
          </Card>
          <div className="mt-5 flex justify-end">
            <Button type="submit" size="lg" loading={saving} rightIcon={<Check size={16} />}>
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      )}

      {tab === 'notifications' && (
        <Card padded={false}>
          <div className="px-5 pt-5">
            <h2 className="text-[15px] font-bold text-ink-900">Préférences de notification</h2>
            <p className="text-[12px] text-ink-500 mt-0.5">Les changements sont enregistrés automatiquement.</p>
          </div>
          <ul className="mt-3 divide-y divide-ink-100">
            {notifRows.map((n) => (
              <li key={n.key} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-ink-900">{n.label}</p>
                  <p className="text-[12px] text-ink-500">{n.text}</p>
                </div>
                <Toggle
                  checked={notifications[n.key]}
                  onChange={(v) => {
                    setNotification(kind, n.key, v);
                    show(`${n.label} : ${v ? 'activé' : 'désactivé'}.`, 'info');
                  }}
                  label={n.label}
                />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </Page>
  );
}
