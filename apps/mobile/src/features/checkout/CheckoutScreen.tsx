import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Building2, CreditCard, Lock, Smartphone } from 'lucide-react';
import { formatDateRange, formatFCFA, type PaymentMethod } from '@rezho/shared';
import { Button, Input, PriceRow, RadioCard, Stepper } from '@/components/ui';
import { Screen } from '@/components/layout/Screen';
import { useAppStore, useToastStore } from '@/store/useAppStore';

export function CheckoutScreen() {
  const navigate = useNavigate();
  const draft = useAppStore((s) => s.draft);
  const confirmBooking = useAppStore((s) => s.confirmBooking);
  const savedNumber = useAppStore((s) => s.mobileMoneyNumber);
  const cards = useAppStore((s) => s.cards);
  const show = useToastStore((s) => s.show);
  const isFree = !draft || draft.total === 0;
  const [method, setMethod] = useState<PaymentMethod>(isFree ? 'on_site' : 'mobile_money');
  const [momoNumber, setMomoNumber] = useState(savedNumber);
  const [operator, setOperator] = useState<'MTN' | 'Orange'>('MTN');
  const [cardNumber, setCardNumber] = useState(cards[0] ? `**** **** **** ${cards[0].last4}` : '');
  const [cardExp, setCardExp] = useState(cards[0] ? '12/28' : '');
  const [cardCvc, setCardCvc] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const doneRef = useRef(false);

  // Once the booking is confirmed the draft is cleared; the success navigation
  // is already in flight, so do not bounce to home in that case.
  if (!draft && !doneRef.current) return <Navigate to="/home" replace />;
  if (!draft) return null;

  const isRestaurant = draft.kind === 'restaurant';

  const pay = () => {
    const next: Record<string, string> = {};
    if (!isFree && method === 'mobile_money' && momoNumber.replace(/\D/g, '').length < 9) next.momo = 'Entrez un numéro Mobile Money valide.';
    if (!isFree && method === 'card') {
      if (cardNumber.replace(/\D|\*/g, '').length < 4) next.card = 'Entrez un numéro de carte valide.';
      if (!/^\d{2}\/\d{2}$/.test(cardExp)) next.exp = 'Format MM/AA.';
      if (cardCvc.length < 3) next.cvc = 'CVC à 3 chiffres.';
    }
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    setTimeout(() => {
      doneRef.current = true;
      const booking = confirmBooking(method);
      setLoading(false);
      if (booking) {
        show(isRestaurant ? 'Table réservée !' : 'Paiement simulé avec succès.');
        navigate(`/booking-success/${booking.id}`, { replace: true });
      }
    }, 1400);
  };

  return (
    <Screen
      topBar={{ back: true, title: isRestaurant ? 'Confirmation' : 'Paiement' }}
      footer={
        <Button full size="lg" loading={loading} onClick={pay} leftIcon={isRestaurant ? undefined : <Lock size={16} />}>
          {isRestaurant ? 'Confirmer la réservation' : `Payer ${formatFCFA(draft.total)}`}
        </Button>
      }
    >
      <div className="py-2">
        <Stepper steps={isRestaurant ? ['Détails', 'Confirmation', 'Terminé'] : ['Détails', 'Paiement', 'Confirmation']} current={2} />
      </div>

      <h2 className="mt-3 mb-2 text-[13px] font-semibold text-ink-700">Récapitulatif</h2>
      <div className="rounded-[16px] bg-white p-3.5 shadow-card">
        <div className="flex gap-3">
          <img src={draft.itemImage} alt="" className="h-14 w-14 rounded-[10px] object-cover" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-ink-900 truncate">{draft.itemName}</p>
            <p className="text-[11px] text-ink-500">{draft.subtitle}</p>
            <p className="text-[11px] text-ink-500">
              {formatDateRange(draft.startDate, draft.endDate)}
              {draft.time ? ` · ${draft.time}` : ''}
            </p>
          </div>
        </div>
        <div className="mt-3 space-y-1.5 border-t border-ink-100 pt-3">
          {draft.lines.map((l) => (
            <PriceRow key={l.label} label={l.label} amount={l.amount === 0 ? 'Gratuit' : formatFCFA(l.amount)} />
          ))}
        </div>
        <div className="mt-3 -mx-3.5 -mb-3.5 rounded-b-[16px] bg-brand-100 px-3.5 py-2.5">
          <PriceRow label="Total à payer" amount={isFree ? 'Gratuit' : formatFCFA(draft.total)} strong />
        </div>
      </div>

      <h2 className="mt-5 mb-2 text-[13px] font-semibold text-ink-700">{isRestaurant ? 'Règlement' : 'Méthode de paiement'}</h2>
      <div className="space-y-2.5" role="radiogroup">
        {!isFree && (
          <>
            <RadioCard selected={method === 'mobile_money'} onSelect={() => setMethod('mobile_money')} icon={<Smartphone size={18} className="text-star" />} title="Mobile Money" subtitle="MTN, Orange" />
            {method === 'mobile_money' && (
              <div className="rounded-[14px] bg-white p-3.5 shadow-card space-y-3 screen-in">
                <div className="flex gap-2">
                  {(['MTN', 'Orange'] as const).map((op) => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setOperator(op)}
                      className={`flex-1 h-10 rounded-[10px] border text-[13px] font-bold ${operator === op ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-ink-200 text-ink-700'}`}
                    >
                      {op === 'MTN' ? 'MTN MoMo' : 'Orange Money'}
                    </button>
                  ))}
                </div>
                <Input label="Numéro Mobile Money" type="tel" value={momoNumber} onChange={(e) => setMomoNumber(e.target.value)} error={errors.momo} hint="Vous recevrez une demande de confirmation sur ce numéro (simulation)." />
              </div>
            )}
            <RadioCard selected={method === 'card'} onSelect={() => setMethod('card')} icon={<CreditCard size={18} />} title="Carte bancaire" subtitle="Visa, Mastercard" />
            {method === 'card' && (
              <div className="rounded-[14px] bg-white p-3.5 shadow-card space-y-3 screen-in">
                <Input label="Numéro de carte" inputMode="numeric" placeholder="1234 5678 9012 3456" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} error={errors.card} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Expiration" placeholder="MM/AA" value={cardExp} onChange={(e) => setCardExp(e.target.value)} error={errors.exp} />
                  <Input label="CVC" inputMode="numeric" placeholder="123" maxLength={4} value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} error={errors.cvc} />
                </div>
              </div>
            )}
          </>
        )}
        <RadioCard
          selected={method === 'on_site'}
          onSelect={() => setMethod('on_site')}
          icon={<Building2 size={18} />}
          title={draft.kind === 'accommodation' ? 'Paiement à l’hôtel' : draft.kind === 'vehicle' ? 'Paiement à l’agence' : 'Règlement sur place'}
          subtitle={draft.kind === 'restaurant' ? 'Aucun prépaiement requis' : 'À l’arrivée'}
        />
      </div>
      <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-ink-500">
        <Lock size={12} /> Paiement sécurisé · simulation sans transaction réelle
      </p>
    </Screen>
  );
}
