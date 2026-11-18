import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { IMG } from '@rezho/shared';
import { useAppStore } from '@/store/useAppStore';

const SLIDES = [
  {
    image: IMG.room1,
    title: 'Hébergements\nde qualité',
    text: 'Hôtels, appartements et auberges au meilleur prix.',
  },
  {
    image: IMG.food11,
    title: 'Restaurants\nà proximité',
    text: 'Découvrez et réservez les meilleurs restaurants.',
  },
  {
    image: IMG.suv5,
    title: 'Location de\nvéhicules',
    text: 'Louez un véhicule en toute simplicité et sécurité.',
  },
];

export function OnboardingScreen() {
  const navigate = useNavigate();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index]!;
  const last = index === SLIDES.length - 1;

  const finish = () => {
    completeOnboarding();
    navigate('/login', { replace: true });
  };

  return (
    <div className="relative flex-1 min-h-0 flex flex-col bg-white overflow-hidden">
      <div className="relative h-[58%] shrink-0">
        {SLIDES.map((s, i) => (
          <img
            key={s.image}
            src={s.image}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${i === index ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" aria-hidden="true" />
        <button
          type="button"
          onClick={finish}
          className="absolute right-5 top-12 sm:top-14 rounded-full bg-black/25 backdrop-blur px-3.5 h-8 text-[13px] font-semibold text-white"
        >
          Passer
        </button>
      </div>
      <div className="relative flex-1 flex flex-col px-7 pb-8 -mt-6 screen-in" key={index}>
        <h1 className="text-[26px] font-extrabold leading-tight text-ink-900 whitespace-pre-line">{slide.title}</h1>
        <p className="mt-3 text-[14px] text-ink-500 leading-relaxed max-w-[280px]">{slide.text}</p>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5" aria-label={`Étape ${index + 1} sur ${SLIDES.length}`}>
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Aller à l’étape ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-5 bg-brand-700' : 'w-2 bg-ink-200'}`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label={last ? 'Commencer' : 'Suivant'}
            onClick={() => (last ? finish() : setIndex((i) => i + 1))}
            className="h-14 w-14 rounded-full bg-brand-700 text-white flex items-center justify-center shadow-float active:scale-95 transition-transform"
          >
            <ArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
