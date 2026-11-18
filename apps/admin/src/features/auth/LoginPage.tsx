import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { isValidEmail, type ProviderKind } from '@rezho/shared';
import { PROVIDERS, KIND_LABEL } from '@/config/providers';
import { useAdminStore } from '@/store/useAdminStore';
import { Logo } from '@/components/Logo';
import { Button, Checkbox, Input } from '@/components/ui';

const DEMO_EMAIL: Record<ProviderKind, string> = {
  hotels: 'contact@hotellavallee.cm',
  restaurants: 'contact@lebantu.cm',
  vehicles: 'contact@autodrive.cm',
};

/**
 * Login page of ONE partner space (/partner/hotels/login, /partner/restaurants/login,
 * /partner/vehicles/login). Each space has its own address and its own session.
 */
export function LoginPage() {
  const { kind: kindParam } = useParams();
  const kind = (kindParam ?? '') as ProviderKind;
  const cfg = PROVIDERS[kind];
  const location = useLocation() as { state?: { from?: string } };
  const navigate = useNavigate();
  const session = useAdminStore((s) => (cfg ? s.sessions[kind] : null));
  const login = useAdminStore((s) => s.login);

  const [email, setEmail] = useState(cfg ? DEMO_EMAIL[kind] : '');
  const [password, setPassword] = useState('rezho2026');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [forgot, setForgot] = useState(false);

  if (!cfg) return <Navigate to="/partner/login" replace />;
  if (session) return <Navigate to={`${cfg.basePath}/dashboard`} replace />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!isValidEmail(email)) next.email = 'Entrez une adresse email valide.';
    if (password.length < 6) next.password = 'Au moins 6 caractères.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    setTimeout(() => {
      login(kind, email, remember);
      const from = location.state?.from;
      navigate(from && from.startsWith(`${cfg.basePath}/`) ? from : `${cfg.basePath}/dashboard`, { replace: true });
    }, 700);
  };

  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-[1100px] grid overflow-hidden rounded-[24px] bg-white shadow-card lg:grid-cols-[1.15fr_1fr] min-h-[620px]">
        {/* Left hero panel */}
        <div className="relative hidden lg:flex flex-col justify-between bg-brand-900 text-white p-10 overflow-hidden">
          <img src={cfg.heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-950/90 via-brand-900/60 to-brand-900/20" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <Logo size={40} variant="light" wordmark={false} />
              <span className="text-[20px] font-extrabold tracking-[0.08em]">REZHO</span>
            </div>
            <span className="mt-4 inline-block rounded-full bg-lime-500 px-3.5 py-1.5 text-[12px] font-bold text-brand-900">{cfg.badge}</span>
            <h1 className="mt-8 max-w-[380px] text-[32px] font-extrabold leading-tight">{cfg.heroHeadline}</h1>
          </div>
          <ul className="relative grid grid-cols-3 gap-4">
            {cfg.heroFeatures.map(({ icon: Icon, label }) => (
              <li key={label} className="flex flex-col items-center gap-2 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-white/15 backdrop-blur">
                  <Icon size={22} className="text-lime-400" />
                </span>
                <span className="text-[12px] font-semibold leading-tight">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right form panel */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-12">
          <div className="flex flex-col items-center text-center">
            <Logo size={80} />
            <h2 className="mt-4 text-[22px] font-extrabold text-ink-900">Connexion Partenaire</h2>
            <p className="mt-1 text-[13px] text-ink-500">{cfg.loginSubtitle}</p>
            <span className="mt-3 inline-flex items-center rounded-full border border-brand-700 bg-brand-50 px-3 py-1 text-[11px] font-semibold text-brand-800">{KIND_LABEL[kind]}</span>
          </div>

          {forgot ? (
            <div className="mt-6 rounded-[12px] bg-brand-50 p-5 text-center pop-in">
              <p className="text-[14px] font-bold text-ink-900">Lien envoyé !</p>
              <p className="mt-1 text-[12px] text-ink-500">
                Un lien de réinitialisation a été envoyé à <span className="font-semibold text-ink-900">{email}</span> (simulation).
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setForgot(false)}>
                Retour à la connexion
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
              <Input label="Email" type="email" autoComplete="email" icon={<Mail size={16} />} value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} placeholder="Email" />
              <Input label="Mot de passe" type="password" autoComplete="current-password" icon={<Lock size={16} />} value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} placeholder="Mot de passe" />
              <Checkbox checked={remember} onChange={setRemember} label="Se souvenir de moi" />
              <Button type="submit" full size="lg" loading={loading}>
                Se connecter
              </Button>
              <div className="text-center">
                <button type="button" onClick={() => setForgot(true)} className="text-[12px] font-semibold text-brand-700 hover:underline">
                  Mot de passe oublié ?
                </button>
              </div>
            </form>
          )}

          <p className="mt-8 text-center text-[11px] text-ink-300">
            Démo : n’importe quel email et mot de passe (6 caractères min.) fonctionnent.
            <br />
            Vous n’êtes pas un partenaire « {KIND_LABEL[kind]} » ?{' '}
            <Link to="/partner/login" className="underline">
              Choisir un autre espace
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
