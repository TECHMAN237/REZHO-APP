import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, ChevronRight, CreditCard, Heart, HelpCircle, LogOut, Pencil, Settings, User } from 'lucide-react';
import { Avatar, Button, ConfirmDialog } from '@/components/ui';
import { Screen } from '@/components/layout/Screen';
import { BottomNav } from '@/components/layout/BottomNav';
import { AssistantFab } from '@/components/layout/AssistantFab';
import { useAppStore, useToastStore } from '@/store/useAppStore';

const MENU = [
  { to: '/profile/edit', label: 'Mes informations', icon: User },
  { to: '/bookings', label: 'Mes réservations', icon: CalendarDays },
  { to: '/favorites', label: 'Mes favoris', icon: Heart },
  { to: '/profile/payment-methods', label: 'Moyens de paiement', icon: CreditCard },
  { to: '/profile/settings', label: 'Paramètres', icon: Settings },
  { to: '/profile/help', label: 'Aide & support', icon: HelpCircle },
];

export function ProfileScreen() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);
  const show = useToastStore((s) => s.show);
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <Screen
        topBar={{
          title: 'Profil',
          right: (
            <Link to="/profile/edit" aria-label="Modifier le profil" className="h-9 w-9 rounded-full flex items-center justify-center text-ink-900 hover:bg-white">
              <Pencil size={18} />
            </Link>
          ),
        }}
        withNav
      >
        <div className="flex items-center gap-3.5 rounded-[16px] bg-white p-4 shadow-card">
          <Avatar src={user.avatar} name={user.name} size={56} />
          <div className="min-w-0">
            <p className="text-[16px] font-bold text-ink-900 truncate">{user.name}</p>
            <p className="text-[12px] text-ink-500 truncate">{user.email}</p>
            <p className="text-[12px] text-ink-500">{user.phone}</p>
          </div>
        </div>

        <ul className="mt-4 rounded-[16px] bg-white shadow-card divide-y divide-ink-100">
          {MENU.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link to={to} className="flex items-center gap-3 px-4 h-[52px] text-[14px] font-medium text-ink-900 hover:bg-ink-50 first:rounded-t-[16px] last:rounded-b-[16px]">
                <Icon size={18} className="text-ink-700" />
                <span className="flex-1">{label}</span>
                <ChevronRight size={16} className="text-ink-300" />
              </Link>
            </li>
          ))}
        </ul>

        <Button full size="lg" variant="outline" className="mt-5" leftIcon={<LogOut size={17} />} onClick={() => setConfirm(true)}>
          Se déconnecter
        </Button>
        <p className="mt-4 text-center text-[11px] text-ink-300">REZHO v1.0 · Démo frontend</p>
      </Screen>
      <AssistantFab />
      <BottomNav />
      <ConfirmDialog
        open={confirm}
        title="Se déconnecter ?"
        text="Vous pourrez vous reconnecter à tout moment."
        confirmLabel="Se déconnecter"
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          logout();
          show('Vous êtes déconnecté.', 'info');
          navigate('/login', { replace: true });
        }}
      />
    </div>
  );
}
