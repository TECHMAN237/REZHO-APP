import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MailCheck } from 'lucide-react';
import { isValidEmail } from '@rezho/shared';
import { Logo } from '@/components/Logo';
import { Button, Input } from '@/components/ui';
import { TopBar } from '@/components/layout/Screen';

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError('Entrez une adresse email valide.');
      return;
    }
    setError(undefined);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 800);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-brand-50 screen-in">
      <TopBar back="/login" />
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-8">
        <div className="flex flex-col items-center text-center">
          <Logo size={64} />
          <h1 className="mt-3 text-[22px] font-extrabold text-ink-900">Mot de passe oublié</h1>
          <p className="mt-1 text-[13px] text-ink-500 max-w-[260px]">
            Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
        </div>
        {sent ? (
          <div className="mt-8 rounded-[16px] bg-white p-5 shadow-card text-center pop-in">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <MailCheck size={26} />
            </span>
            <p className="mt-3 text-[15px] font-bold text-ink-900">Email envoyé !</p>
            <p className="mt-1 text-[13px] text-ink-500">
              Un lien de réinitialisation a été envoyé à <span className="font-semibold text-ink-900">{email}</span> (simulation).
            </p>
            <Link to="/login" className="mt-5 inline-block">
              <Button>Retour à la connexion</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
            <Input label="Email" type="email" placeholder="Email" icon={<Mail size={17} />} value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
            <Button type="submit" full size="lg" loading={loading}>
              Envoyer le lien
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
