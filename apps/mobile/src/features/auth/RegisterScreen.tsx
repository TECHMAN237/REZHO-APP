import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Phone, User } from 'lucide-react';
import { isValidEmail, isValidPhone } from '@rezho/shared';
import { Logo } from '@/components/Logo';
import { Button, Checkbox, Input } from '@/components/ui';
import { TopBar } from '@/components/layout/Screen';
import { useAppStore, useToastStore } from '@/store/useAppStore';

export function RegisterScreen() {
  const navigate = useNavigate();
  const register = useAppStore((s) => s.register);
  const show = useToastStore((s) => s.show);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [accept, setAccept] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form | 'accept', string>>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (form.name.trim().length < 3) next.name = 'Entrez votre nom complet.';
    if (!isValidEmail(form.email)) next.email = 'Entrez une adresse email valide.';
    if (!isValidPhone(form.phone)) next.phone = 'Entrez un numéro valide (ex : +237 6 90 12 34 56).';
    if (form.password.length < 6) next.password = 'Au moins 6 caractères.';
    if (form.confirm !== form.password) next.confirm = 'Les mots de passe ne correspondent pas.';
    if (!accept) next.accept = 'Vous devez accepter les conditions.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    setTimeout(() => {
      register({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() });
      show('Compte créé avec succès !');
      navigate('/home', { replace: true });
    }, 800);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-brand-50 screen-in">
      <TopBar back="/login" />
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-6 pb-8">
        <div className="flex flex-col items-center text-center">
          <Logo size={64} />
          <h1 className="mt-3 text-[22px] font-extrabold text-ink-900">Créer un compte</h1>
          <p className="mt-1 text-[13px] text-ink-500">Rejoignez REZHO et réservez en toute simplicité.</p>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-3.5" noValidate>
          <Input placeholder="Nom complet" autoComplete="name" icon={<User size={17} />} value={form.name} onChange={set('name')} error={errors.name} />
          <Input placeholder="Email" type="email" autoComplete="email" icon={<Mail size={17} />} value={form.email} onChange={set('email')} error={errors.email} />
          <Input placeholder="Téléphone" type="tel" autoComplete="tel" icon={<Phone size={17} />} value={form.phone} onChange={set('phone')} error={errors.phone} />
          <Input placeholder="Mot de passe" type="password" autoComplete="new-password" icon={<Lock size={17} />} value={form.password} onChange={set('password')} error={errors.password} />
          <Input placeholder="Confirmer le mot de passe" type="password" autoComplete="new-password" icon={<Lock size={17} />} value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
          <Checkbox
            checked={accept}
            onChange={setAccept}
            error={errors.accept}
            label={
              <span className="text-[12px]">
                J’accepte les <span className="font-bold text-brand-700">Conditions d’utilisation</span> et la{' '}
                <span className="font-bold text-brand-700">Politique de confidentialité</span>.
              </span>
            }
          />
          <Button type="submit" full size="lg" loading={loading}>
            S’inscrire
          </Button>
        </form>
        <p className="mt-6 text-center text-[13px] text-ink-500">
          Déjà un compte ?{' '}
          <Link to="/login" className="font-bold text-brand-700">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
