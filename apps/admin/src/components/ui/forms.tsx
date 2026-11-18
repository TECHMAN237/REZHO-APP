import { useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Check, ChevronDown, Eye, EyeOff, Minus, Plus, Search } from 'lucide-react';

interface FieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  suffix?: ReactNode;
}

const baseInput =
  'w-full h-10 rounded-[10px] border bg-white text-[13px] text-ink-900 placeholder:text-ink-300 transition-colors focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15 disabled:bg-ink-50';

export function Label({ htmlFor, children, required }: { htmlFor?: string; children: ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="text-[12px] font-semibold text-ink-700">
      {children}
      {required && <span className="text-danger"> *</span>}
    </label>
  );
}

export function FieldError({ error }: { error?: string }) {
  return error ? <p className="text-[11px] text-danger font-medium">{error}</p> : null;
}

export function Input({ label, required, error, hint, icon, suffix, className = '', id, type = 'text', ...rest }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <Label htmlFor={inputId} required={required}>
          {label}
        </Label>
      )}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none">{icon}</span>}
        <input
          id={inputId}
          type={isPassword ? (show ? 'text' : 'password') : type}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-err` : undefined}
          className={`${baseInput} ${icon ? 'pl-9' : 'pl-3.5'} ${isPassword || suffix ? 'pr-12' : 'pr-3.5'} ${error ? 'border-danger' : 'border-ink-200'}`}
          {...rest}
        />
        {isPassword && (
          <button type="button" aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 p-1 rounded-md hover:text-ink-900">
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
        {suffix && !isPassword && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-ink-500 pointer-events-none">{suffix}</span>}
      </div>
      {error ? (
        <p id={`${inputId}-err`} className="text-[11px] text-danger font-medium">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11px] text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function Textarea({ label, required, error, hint, className = '', id, maxLength, value, ...rest }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const len = typeof value === 'string' ? value.length : 0;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <Label htmlFor={inputId} required={required}>
          {label}
        </Label>
      )}
      <textarea id={inputId} aria-invalid={!!error} maxLength={maxLength} value={value} className={`${baseInput} h-auto min-h-[104px] py-2.5 px-3.5 resize-none ${error ? 'border-danger' : 'border-ink-200'}`} {...rest} />
      <div className="flex justify-between">
        {error ? <p className="text-[11px] text-danger font-medium">{error}</p> : hint ? <p className="text-[11px] text-ink-500">{hint}</p> : <span />}
        {maxLength && (
          <span className="text-[11px] text-ink-500">
            {len} / {maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

export function Select({ label, required, error, icon, className = '', id, children, ...rest }: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <Label htmlFor={inputId} required={required}>
          {label}
        </Label>
      )}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none">{icon}</span>}
        <select id={inputId} className={`${baseInput} appearance-none ${icon ? 'pl-9' : 'pl-3.5'} pr-9 ${error ? 'border-danger' : 'border-ink-200'}`} {...rest}>
          {children}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none" />
      </div>
      <FieldError error={error} />
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Rechercher…', className = '' }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} className={`${baseInput} rounded-full pl-9 pr-3.5 border-ink-200`} />
    </div>
  );
}

export function Checkbox({ checked, onChange, label, error, className = '' }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; error?: string; className?: string }) {
  return (
    <div className={className}>
      <label className="flex items-center gap-2.5 cursor-pointer select-none min-h-[32px]">
        <span
          role="checkbox"
          aria-checked={checked}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              onChange(!checked);
            }
          }}
          onClick={() => onChange(!checked)}
          className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors ${checked ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-ink-300'}`}
        >
          {checked && <Check size={12} strokeWidth={3} />}
        </span>
        <span className="text-[13px] text-ink-900">{label}</span>
      </label>
      <FieldError error={error} />
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-brand-600' : 'bg-ink-200'}`}>
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
    </button>
  );
}

export function Counter({ value, onChange, min = 0, max = 99, label }: { value: number; onChange: (v: number) => void; min?: number; max?: number; label?: string }) {
  return (
    <div className="inline-flex items-center h-10 rounded-[10px] border border-ink-200 bg-white" aria-label={label}>
      <button type="button" aria-label="Diminuer" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))} className="h-full w-10 flex items-center justify-center text-ink-700 disabled:opacity-40 hover:bg-ink-50 rounded-l-[10px]">
        <Minus size={14} />
      </button>
      <span className="min-w-[40px] text-center text-[13px] font-semibold">{value}</span>
      <button type="button" aria-label="Augmenter" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))} className="h-full w-10 flex items-center justify-center text-brand-700 disabled:opacity-40 hover:bg-ink-50 rounded-r-[10px]">
        <Plus size={14} />
      </button>
    </div>
  );
}

/** Selectable tile with a checkbox in the corner (amenities / equipment). */
export function SelectTile({ selected, onToggle, icon, label }: { selected: boolean; onToggle: () => void; icon: ReactNode; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={`relative flex flex-col items-center justify-center gap-2 rounded-[12px] border bg-white px-3 py-4 text-center transition-colors ${selected ? 'border-brand-600 bg-brand-50' : 'border-ink-200 hover:border-ink-300'}`}
    >
      <span className={`absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-[4px] border ${selected ? 'bg-brand-600 border-brand-600 text-white' : 'border-ink-300 bg-white'}`}>{selected && <Check size={10} strokeWidth={3} />}</span>
      <span className={selected ? 'text-brand-700' : 'text-ink-700'}>{icon}</span>
      <span className="text-[12px] font-medium text-ink-900">{label}</span>
    </button>
  );
}

/** Day-of-week selector (Lun..Dim). */
export function DayPicker({ value, onChange }: { value: number[]; onChange: (v: number[]) => void }) {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Jours de disponibilité">
      {days.map((d, i) => {
        const n = i + 1;
        const on = value.includes(n);
        return (
          <button
            key={d}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((x) => x !== n) : [...value, n].sort())}
            className={`flex flex-col items-center gap-1 rounded-[10px] border px-3 py-2 text-[11px] font-semibold transition-colors ${on ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-ink-200 bg-white text-ink-500'}`}
          >
            <span className={`flex h-4 w-4 items-center justify-center rounded-[4px] border ${on ? 'bg-brand-600 border-brand-600 text-white' : 'border-ink-300'}`}>{on && <Check size={10} strokeWidth={3} />}</span>
            {d}
          </button>
        );
      })}
    </div>
  );
}
