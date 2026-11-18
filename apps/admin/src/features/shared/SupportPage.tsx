import { useState } from 'react';
import { ChevronDown, Mail, MessageCircle, Phone, RotateCcw } from 'lucide-react';
import { Page, useShell } from '@/components/layout/AppShell';
import { useAdminStore, useToastStore } from '@/store/useAdminStore';
import { Button, Card, ConfirmDialog } from '@/components/ui';

const FAQ: Record<'hotels' | 'restaurants' | 'vehicles', { q: string; a: string }[]> = {
  hotels: [
    { q: 'Comment publier une nouvelle chambre ?', a: 'Depuis « Chambres », cliquez sur « Ajouter une chambre » et suivez les 4 étapes : informations, médias, équipements puis tarification. La chambre apparaît immédiatement dans votre liste.' },
    { q: 'Comment bloquer des dates ?', a: 'Dans « Disponibilités », sélectionnez une chambre puis cliquez sur un jour du calendrier pour le marquer indisponible. Les jours réservés ne peuvent pas être modifiés.' },
    { q: 'Quand suis-je payé ?', a: 'Les paiements encaissés via REZHO sont reversés sous 48 h ouvrées sur votre compte Mobile Money ou bancaire.' },
  ],
  restaurants: [
    { q: 'Comment ajouter un plat au menu ?', a: 'Depuis « Menu & Plats », cliquez sur « Ajouter un plat » et suivez les 3 étapes : informations, médias puis prix & disponibilité.' },
    { q: 'Comment indiquer qu’un plat est épuisé ?', a: 'Dans le menu, utilisez le menu d’actions du plat puis « Marquer indisponible ». Vous pouvez aussi désactiver la disponibilité dans la fiche du plat.' },
    { q: 'Comment gérer mes horaires ?', a: 'Dans « Disponibilités », définissez vos jours d’ouverture, vos horaires de service et vos dates de fermeture exceptionnelle.' },
  ],
  vehicles: [
    { q: 'Comment ajouter un véhicule à ma flotte ?', a: 'Depuis « Véhicules », cliquez sur « Ajouter un véhicule » et suivez les 4 étapes : informations, médias, caractéristiques puis tarification.' },
    { q: 'Comment signaler une maintenance ?', a: 'Dans « Disponibilités », sélectionnez le véhicule puis changez son statut en « Maintenance ». Il n’apparaîtra plus dans les résultats clients.' },
    { q: 'Comment fonctionne la caution ?', a: 'La caution définie sur chaque véhicule est bloquée lors de la prise en charge et restituée au retour si aucun dommage n’est constaté.' },
  ],
};

export function SupportPage() {
  const { kind } = useShell();
  const resetDemo = useAdminStore((s) => s.resetDemo);
  const show = useToastStore((s) => s.show);
  const [open, setOpen] = useState<number | null>(0);
  const [confirm, setConfirm] = useState(false);

  return (
    <Page title="Aide & Support" subtitle="Nous sommes disponibles 7j/7 pour vous accompagner." narrow>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card padded={false}>
          <h2 className="px-5 pt-5 text-[15px] font-bold text-ink-900">Questions fréquentes</h2>
          <ul className="mt-2 divide-y divide-ink-100">
            {FAQ[kind].map((f, i) => (
              <li key={f.q}>
                <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center gap-3 px-5 py-4 text-left">
                  <span className="flex-1 text-[13px] font-semibold text-ink-900">{f.q}</span>
                  <ChevronDown size={16} className={`text-ink-500 transition-transform ${open === i ? 'rotate-180' : ''}`} />
                </button>
                {open === i && <p className="px-5 pb-4 -mt-1 text-[13px] leading-relaxed text-ink-700">{f.a}</p>}
              </li>
            ))}
          </ul>
        </Card>
        <div className="space-y-4">
          <Card dark>
            <MessageCircle size={24} className="text-lime-400" />
            <p className="mt-3 text-[15px] font-bold">Support partenaires</p>
            <p className="text-[12px] text-white/75 mt-1">Lundi – Dimanche, 8h – 22h</p>
            <div className="mt-4 space-y-2 text-[12px]">
              <a href="tel:+237690000000" className="flex items-center gap-2 hover:underline">
                <Phone size={14} /> +237 6 90 00 00 00
              </a>
              <a href="mailto:partenaires@rezho.cm" className="flex items-center gap-2 hover:underline">
                <Mail size={14} /> partenaires@rezho.cm
              </a>
            </div>
          </Card>
          <Card>
            <p className="text-[13px] font-bold text-ink-900">Données de démonstration</p>
            <p className="mt-1 text-[12px] text-ink-500">Réinitialisez les chambres, plats, véhicules, réservations et paiements de démo.</p>
            <Button variant="outline" size="sm" className="mt-3" leftIcon={<RotateCcw size={14} />} onClick={() => setConfirm(true)}>
              Réinitialiser la démo
            </Button>
          </Card>
        </div>
      </div>
      <ConfirmDialog
        open={confirm}
        danger
        title="Réinitialiser les données de démo ?"
        text="Toutes les modifications locales (ajouts, suppressions, statuts) seront perdues."
        confirmLabel="Réinitialiser"
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          resetDemo();
          setConfirm(false);
          show('Données de démo réinitialisées.', 'info');
        }}
      />
    </Page>
  );
}
