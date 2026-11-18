import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Mail, MapPin, Phone, User } from 'lucide-react';
import { CITIES, isValidEmail, isValidPhone, type City } from '@rezho/shared';
import { Avatar, Button, Input, Select } from '@/components/ui';
import { Screen } from '@/components/layout/Screen';
import { useAppStore, useToastStore } from '@/store/useAppStore';

export function EditProfileScreen() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const show = useToastStore((s) => s.show);
  const [form, setForm] = useState({ name: user.name, email: user.email, phone: user.phone, city: user.city });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 3) next.name = 'Entrez votre nom complet.';
    if (!isValidEmail(form.email)) next.email = 'Email invalide.';
    if (!isValidPhone(form.phone)) next.phone = 'Numéro invalide.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    setTimeout(() => {
      updateProfile({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), city: form.city });
      setLoading(false);
      show('Profil mis à jour.');
      navigate('/profile');
    }, 600);
  };

  return (
    <Screen
      topBar={{ back: '/profile', title: 'Mes informations' }}
      footer={
        <Button full size="lg" loading={loading} onClick={submit}>
          Enregistrer
        </Button>
      }
    >
      <div className="flex flex-col items-center pt-2">
        <div className="relative">
          <Avatar src={user.avatar} name={user.name} size={88} />
          <button
            type="button"
            aria-label="Changer la photo"
            onClick={() => show('Changement de photo simulé.', 'info')}
            className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-brand-700 text-white flex items-center justify-center ring-2 ring-brand-50"
          >
            <Camera size={15} />
          </button>
        </div>
      </div>
      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <Input label="Nom complet" icon={<User size={17} />} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
        <Input label="Email" type="email" icon={<Mail size={17} />} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
        <Input label="Téléphone" type="tel" icon={<Phone size={17} />} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} error={errors.phone} />
        <Select label="Ville" icon={<MapPin size={17} />} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value as City })}>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </form>
    </Screen>
  );
}
