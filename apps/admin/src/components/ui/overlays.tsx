import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, MoreHorizontal, X } from 'lucide-react';
import { useToastStore } from '@/store/useAdminStore';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: 'sm' | 'md' | 'lg';
}

export function Modal({ open, onClose, title, subtitle, children, footer, width = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  const w = width === 'sm' ? 'max-w-[420px]' : width === 'lg' ? 'max-w-[760px]' : 'max-w-[560px]';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Fermer" className="absolute inset-0 bg-brand-950/50" onClick={onClose} />
      <div className={`relative w-full ${w} max-h-[90vh] flex flex-col rounded-[16px] bg-white shadow-float pop-in`}>
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3">
          <div>
            {title && <h2 className="text-[17px] font-bold text-ink-900">{title}</h2>}
            {subtitle && <p className="text-[12px] text-ink-500 mt-0.5">{subtitle}</p>}
          </div>
          <button type="button" aria-label="Fermer" onClick={onClose} className="h-8 w-8 shrink-0 rounded-[8px] bg-ink-50 flex items-center justify-center text-ink-700 hover:bg-ink-100">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-5">{children}</div>
        {footer && <div className="flex justify-end gap-2.5 border-t border-ink-100 px-6 py-4">{footer}</div>}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Fermer" className="absolute inset-0 bg-brand-950/50" onClick={onCancel} />
      <div className="relative w-full max-w-[400px] rounded-[16px] bg-white p-6 shadow-float pop-in">
        <h2 className="text-[16px] font-bold text-ink-900">{title}</h2>
        {text && <p className="mt-1.5 text-[13px] text-ink-500">{text}</p>}
        <div className="mt-5 flex justify-end gap-2.5">
          <button type="button" onClick={onCancel} className="h-10 rounded-[10px] border border-ink-200 px-4 text-[13px] font-semibold text-ink-700 hover:bg-ink-50">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} className={`h-10 rounded-[10px] px-4 text-[13px] font-semibold ${danger ? 'bg-danger text-white hover:bg-red-700' : 'bg-lime-500 text-brand-900 hover:bg-lime-600'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Right-side details drawer. */
export function Drawer({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Fermer" className="absolute inset-0 bg-brand-950/40" onClick={onClose} />
      <div className="relative h-full w-full max-w-[440px] bg-white shadow-float flex flex-col page-in">
        <div className="flex items-center justify-between border-b border-ink-100 px-6 h-16 shrink-0">
          <h2 className="text-[16px] font-bold text-ink-900">{title}</h2>
          <button type="button" aria-label="Fermer" onClick={onClose} className="h-8 w-8 rounded-[8px] bg-ink-50 flex items-center justify-center text-ink-700 hover:bg-ink-100">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="border-t border-ink-100 px-6 py-4 flex gap-2.5">{footer}</div>}
      </div>
    </div>
  );
}

export interface MenuItem {
  label: string;
  onSelect: () => void;
  danger?: boolean;
  icon?: ReactNode;
}

/** Small "⋯" dropdown menu for table rows. */
export function RowMenu({ items, label = 'Plus d’actions' }: { items: MenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  return (
    <div ref={ref} className="relative inline-block">
      <button type="button" aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-500 hover:bg-ink-100 hover:text-ink-900">
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-9 z-30 min-w-[180px] rounded-[12px] border border-ink-100 bg-white p-1.5 shadow-float pop-in">
          {items.map((it) => (
            <button
              key={it.label}
              role="menuitem"
              type="button"
              onClick={() => {
                setOpen(false);
                it.onSelect();
              }}
              className={`flex w-full items-center gap-2 rounded-[8px] px-3 h-9 text-left text-[12px] font-medium hover:bg-ink-50 ${it.danger ? 'text-danger' : 'text-ink-900'}`}
            >
              {it.icon}
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  if (!toasts.length) return null;
  return (
    <div className="fixed right-6 top-6 z-[60] flex w-[340px] flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`flex items-center gap-2.5 rounded-[12px] px-4 py-3 text-[13px] font-medium text-white shadow-float pop-in ${t.tone === 'success' ? 'bg-brand-800' : t.tone === 'error' ? 'bg-danger' : 'bg-ink-900'}`}>
          {t.tone === 'success' ? <CheckCircle2 size={18} /> : t.tone === 'error' ? <AlertCircle size={18} /> : <Info size={18} />}
          <span className="flex-1">{t.message}</span>
          <button type="button" aria-label="Fermer" onClick={() => dismiss(t.id)} className="opacity-80 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
