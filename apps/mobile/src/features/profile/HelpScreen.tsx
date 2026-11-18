import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, ChevronDown, Mail, MessageCircle, Phone } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';

const FAQ = [
  { q: 'Comment annuler une réservation ?', a: 'Ouvrez « Mes réservations », sélectionnez la réservation puis appuyez sur « Annuler la réservation ». Les paiements sont remboursés sous 48 h si l’annulation a lieu plus de 24 h avant l’arrivée.' },
  { q: 'Quels moyens de paiement sont acceptés ?', a: 'Mobile Money (MTN MoMo, Orange Money), cartes bancaires Visa / Mastercard et paiement sur place selon l’établissement.' },
  { q: 'La caution d’un véhicule est-elle remboursée ?', a: 'Oui. La caution est bloquée à la prise en charge et intégralement restituée au retour du véhicule si aucun dommage n’est constaté.' },
  { q: 'Puis-je modifier les dates d’une réservation ?', a: 'Pour modifier vos dates, annulez la réservation puis créez-en une nouvelle, ou contactez directement l’établissement via la fiche de réservation.' },
  { q: 'Comment contacter un établissement ?', a: 'Chaque réservation confirmée affiche un bouton « Contacter l’établissement » avec le numéro de téléphone du partenaire.' },
];

export function HelpScreen() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Screen topBar={{ back: '/profile', title: 'Aide & support' }}>
      <div className="grid grid-cols-3 gap-2.5">
        <Link to="/assistant" className="flex flex-col items-center gap-1.5 rounded-[14px] bg-white p-3 shadow-card text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <Bot size={20} />
          </span>
          <span className="text-[11px] font-semibold text-ink-900">Assistant</span>
        </Link>
        <a href="tel:+237690000000" className="flex flex-col items-center gap-1.5 rounded-[14px] bg-white p-3 shadow-card text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <Phone size={20} />
          </span>
          <span className="text-[11px] font-semibold text-ink-900">Appeler</span>
        </a>
        <a href="mailto:support@rezho.cm" className="flex flex-col items-center gap-1.5 rounded-[14px] bg-white p-3 shadow-card text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <Mail size={20} />
          </span>
          <span className="text-[11px] font-semibold text-ink-900">Email</span>
        </a>
      </div>

      <h2 className="mt-5 mb-2 text-[13px] font-semibold text-ink-700">Questions fréquentes</h2>
      <ul className="rounded-[16px] bg-white shadow-card divide-y divide-ink-100">
        {FAQ.map((f, i) => (
          <li key={f.q}>
            <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
              <span className="flex-1 text-[13px] font-semibold text-ink-900">{f.q}</span>
              <ChevronDown size={16} className={`text-ink-500 transition-transform ${open === i ? 'rotate-180' : ''}`} />
            </button>
            {open === i && <p className="px-4 pb-4 -mt-1 text-[12px] leading-relaxed text-ink-700 screen-in">{f.a}</p>}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center gap-3 rounded-[14px] bg-brand-900 p-4 text-white">
        <MessageCircle size={22} className="shrink-0" />
        <div className="text-[12px]">
          <p className="font-bold">Support disponible 7j/7</p>
          <p className="text-white/80">De 8h à 22h · support@rezho.cm</p>
        </div>
      </div>
    </Screen>
  );
}
