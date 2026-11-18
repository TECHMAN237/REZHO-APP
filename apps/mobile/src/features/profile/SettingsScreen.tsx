import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, Globe, Lock, RotateCcw, Shield, Trash2 } from 'lucide-react';
import { ConfirmDialog, Toggle } from '@/components/ui';
import { Screen } from '@/components/layout/Screen';
import { useAppStore, useToastStore } from '@/store/useAppStore';

export function SettingsScreen() {
  const navigate = useNavigate();
  const notifications = useAppStore((s) => s.notifications);
  const setNotification = useAppStore((s) => s.setNotification);
  const resetDemo = useAppStore((s) => s.resetDemo);
  const show = useToastStore((s) => s.show);
  const [language, setLanguage] = useState('Français');
  const [biometric, setBiometric] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <Screen topBar={{ back: '/profile', title: 'Paramètres' }}>
        <h2 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-500">Notifications</h2>
        <div className="rounded-[16px] bg-white shadow-card divide-y divide-ink-100">
          <Link to="/notifications" className="flex items-center gap-3 px-4 h-[52px] text-[14px] font-medium text-ink-900">
            <Bell size={18} className="text-ink-700" />
            <span className="flex-1">Centre de notifications</span>
            <ChevronRight size={16} className="text-ink-300" />
          </Link>
          <div className="flex items-center gap-3 px-4 h-[52px] text-[14px] text-ink-900">
            <span className="flex-1">Notifications push</span>
            <Toggle checked={notifications.push} onChange={(v) => setNotification('push', v)} label="Notifications push" />
          </div>
          <div className="flex items-center gap-3 px-4 h-[52px] text-[14px] text-ink-900">
            <span className="flex-1">Emails de réservation</span>
            <Toggle checked={notifications.bookingUpdates} onChange={(v) => setNotification('bookingUpdates', v)} label="Emails de réservation" />
          </div>
          <div className="flex items-center gap-3 px-4 h-[52px] text-[14px] text-ink-900">
            <span className="flex-1">Offres et promotions</span>
            <Toggle checked={notifications.promos} onChange={(v) => setNotification('promos', v)} label="Offres et promotions" />
          </div>
        </div>

        <h2 className="mt-5 mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-500">Compte</h2>
        <div className="rounded-[16px] bg-white shadow-card divide-y divide-ink-100">
          <label className="flex items-center gap-3 px-4 h-[52px] text-[14px] text-ink-900">
            <Globe size={18} className="text-ink-700" />
            <span className="flex-1">Langue</span>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-transparent text-[13px] font-semibold text-brand-700 focus:outline-none" aria-label="Langue">
              <option>Français</option>
              <option>English</option>
            </select>
          </label>
          <div className="flex items-center gap-3 px-4 h-[52px] text-[14px] text-ink-900">
            <Shield size={18} className="text-ink-700" />
            <span className="flex-1">Connexion biométrique</span>
            <Toggle checked={biometric} onChange={setBiometric} label="Connexion biométrique" />
          </div>
          <button type="button" onClick={() => show('Un email de réinitialisation a été envoyé (simulation).', 'info')} className="flex w-full items-center gap-3 px-4 h-[52px] text-[14px] font-medium text-ink-900 text-left">
            <Lock size={18} className="text-ink-700" />
            <span className="flex-1">Changer le mot de passe</span>
            <ChevronRight size={16} className="text-ink-300" />
          </button>
        </div>

        <h2 className="mt-5 mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-500">Démo</h2>
        <div className="rounded-[16px] bg-white shadow-card divide-y divide-ink-100">
          <button type="button" onClick={() => setConfirmReset(true)} className="flex w-full items-center gap-3 px-4 h-[52px] text-[14px] font-medium text-ink-900 text-left">
            <RotateCcw size={18} className="text-ink-700" />
            <span className="flex-1">Réinitialiser les données de démo</span>
            <ChevronRight size={16} className="text-ink-300" />
          </button>
          <button type="button" onClick={() => show('Suppression de compte simulée.', 'info')} className="flex w-full items-center gap-3 px-4 h-[52px] text-[14px] font-medium text-danger text-left">
            <Trash2 size={18} />
            <span className="flex-1">Supprimer mon compte</span>
          </button>
        </div>
      </Screen>
      <ConfirmDialog
        open={confirmReset}
        danger
        title="Réinitialiser la démo ?"
        text="Les réservations, favoris et préférences enregistrés localement seront remis à zéro."
        confirmLabel="Réinitialiser"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetDemo();
          setConfirmReset(false);
          show('Données de démo réinitialisées.', 'info');
          navigate('/', { replace: true });
        }}
      />
    </div>
  );
}
