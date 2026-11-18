import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { isValidEmail } from '@rezho/shared';
import { Logo } from '@/components/Logo';
import { Button, Input } from '@/components/ui';
import { useAppStore, useToastStore } from '@/store/useAppStore';
import { AppleIcon, GoogleIcon } from '@/components/ui/BrandIcons';

export function LoginScreen() {
  const navigate = useNavigate();
  const login = useAppStore((s) => s.login);
  const show = useToastStore((s) => s.show);
  const [email, setEmail] = useState('ayesha.khan@gmail.com');
  const [password, setPassword] = useState('rezho2026');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!isValidEmail(email)) next.email = 'Entrez une adresse email valide.';
    if (password.length < 6) next.password = 'Le mot de passe doit contenir au moins 6 caractères.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    setTimeout(() => {
      login(email);
      show('Bon retour, connexion réussie !');
      navigate('/home', { replace: true });
    }, 700);
  };

  const social = (name: string) => {
    setLoading(true);
    setTimeout(() => {
      login(email);
      show(`Connexion via ${name} simulée.`, 'info');
      navigate('/home', { replace: true });
    }, 700);
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar bg-brand-50 px-6 pt-16 sm:pt-20 pb-8 screen-in">
      <div className="flex flex-col items-center text-center">
        <Logo size={88} />
        <h1 className="mt-5 text-[24px] font-extrabold text-ink-900">Bon retour !</h1>
        <p className="mt-1 text-[13px] text-ink-500 max-w-[250px]">Connectez-vous à votre compte et continuez vos réservations.</p>
      </div>

      <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="Email"
          icon={<Mail size={17} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <Input
          label="Mot de passe"
          type="password"
          autoComplete="current-password"
          placeholder="Mot de passe"
          icon={<Lock size={17} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <div className="flex justify-end -mt-1">
          <Link to="/forgot-password" className="text-[12px] font-semibold text-brand-700">
            Mot de passe oublié ?
          </Link>
        </div>
        <Button type="submit" full size="lg" loading={loading}>
          Se connecter
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-[12px] text-ink-500">
        <span className="h-px flex-1 bg-ink-200" />
        Ou continuer avec
        <span className="h-px flex-1 bg-ink-200" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => social('Google')}
          className="h-11 rounded-[14px] border border-ink-200 bg-white flex items-center justify-center gap-2 text-[13px] font-semibold text-ink-900 hover:bg-ink-50"
        >
          <GoogleIcon /> Google
        </button>
        <button
          type="button"
          onClick={() => social('Apple')}
          className="h-11 rounded-[14px] border border-ink-200 bg-white flex items-center justify-center gap-2 text-[13px] font-semibold text-ink-900 hover:bg-ink-50"
        >
          <AppleIcon /> Apple
        </button>
      </div>

      <p className="mt-7 text-center text-[13px] text-ink-500">
        Pas de compte ?{' '}
        <Link to="/register" className="font-bold text-brand-700">
          S’inscrire
        </Link>
      </p>
      <p className="mt-3 text-center text-[11px] text-ink-300">Démo : n’importe quel email et mot de passe fonctionnent.</p>
    </div>
  );
}
