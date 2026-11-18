import { useEffect, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useToastStore } from '@/store/useAppStore';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Bottom sheet anchored inside the phone frame (parent must be `relative`). */
export function BottomSheet({ open, onClose, title, children, footer }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="absolute inset-0 z-40 flex items-end" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Fermer" className="absolute inset-0 bg-ink-900/45" onClick={onClose} />
      <div className="relative w-full max-h-[88%] flex flex-col rounded-t-[24px] bg-white sheet-up">
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <span className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-ink-200" aria-hidden="true" />
          <h3 className="text-[16px] font-bold text-ink-900 mt-2">{title}</h3>
          <button type="button" aria-label="Fermer" onClick={onClose} className="mt-2 h-8 w-8 rounded-full bg-ink-50 flex items-center justify-center text-ink-700">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar">{children}</div>
        {footer && <div className="px-5 pb-5 pt-2 border-t border-ink-100 bg-white">{footer}</div>}
      </div>
    </div>
  );
}

interface ConfirmProps {
  open: boolean;
  title: string;
  text?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, text, confirmLabel = 'Confirmer', cancelLabel = 'Annuler', danger, onConfirm, onCancel }: ConfirmProps) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6" role="alertdialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Fermer" className="absolute inset-0 bg-ink-900/45" onClick={onCancel} />
      <div className="relative w-full rounded-[20px] bg-white p-5 pop-in">
        <h3 className="text-[16px] font-bold text-ink-900">{title}</h3>
        {text && <p className="mt-1.5 text-[13px] text-ink-500">{text}</p>}
        <div className="mt-5 flex gap-2.5">
          <button type="button" onClick={onCancel} className="flex-1 h-11 rounded-[12px] border border-ink-200 text-[14px] font-semibold text-ink-700">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 h-11 rounded-[12px] text-[14px] font-semibold text-white ${danger ? 'bg-danger' : 'bg-brand-700'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  if (!toasts.length) return null;
  return (
    <div className="absolute left-4 right-4 top-14 z-[60] flex flex-col gap-2 pointer-events-none" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-2.5 rounded-[14px] px-3.5 py-3 text-[13px] font-medium text-white shadow-float pop-in ${
            t.tone === 'success' ? 'bg-brand-800' : t.tone === 'error' ? 'bg-danger' : 'bg-ink-900'
          }`}
        >
          {t.tone === 'success' ? <CheckCircle2 size={18} /> : t.tone === 'error' ? <AlertCircle size={18} /> : <Info size={18} />}
          <span className="flex-1">{t.message}</span>
          <button type="button" aria-label="Fermer" onClick={() => dismiss(t.id)} className="opacity-80">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
