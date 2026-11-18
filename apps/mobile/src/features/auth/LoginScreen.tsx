import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { isValidEmail } from '@rezho/shared';
import { Logo } from '@/components/Logo';
import { Button, Input } from '@/components/ui';
import { useAppStore, useToastStore } from '@/store/useAppStore';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8 2.1-1.2 2.9-2.4c.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.5-1-2.5-3.8zM14 5.4c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.9-1 3 1 .1 2.1-.6 2.8-1.5z" />
    </svg>
  );
}

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
