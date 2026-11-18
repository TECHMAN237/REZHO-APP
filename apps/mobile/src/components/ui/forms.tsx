import { useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Check, ChevronDown, Eye, EyeOff, Minus, Plus } from 'lucide-react';

interface FieldProps {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

const baseInput =
  'w-full h-11 rounded-[12px] border bg-white text-[14px] text-ink-900 placeholder:text-ink-300 transition-colors focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15 disabled:bg-ink-50';

export function Input({
  label,
  error,
  hint,
  icon,
  className = '',
  id,
  type = 'text',
  ...rest
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-semibold text-ink-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none">{icon}</span>}
        <input
          id={inputId}
          type={isPassword ? (show ? 'text' : 'password') : type}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-err` : undefined}
          className={`${baseInput} ${icon ? 'pl-10' : 'pl-4'} ${isPassword ? 'pr-11' : 'pr-4'} ${error ? 'border-danger' : 'border-ink-200'}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 p-1 rounded-md hover:text-ink-900"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error ? (
        <p id={`${inputId}-err`} className="text-[12px] text-danger font-medium">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[12px] text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function Textarea({
  label,
  error,
  hint,
  className = '',
  id,
  ...rest
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-semibold text-ink-700">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        aria-invalid={!!error}
        className={`${baseInput} h-auto min-h-[96px] py-3 px-4 resize-none ${error ? 'border-danger' : 'border-ink-200'}`}
        {...rest}
      />
      {error ? <p className="text-[12px] text-danger font-medium">{error}</p> : hint ? <p className="text-[12px] text-ink-500">{hint}</p> : null}
    </div>
  );
}

export function Select({
  label,
  error,
  icon,
  className = '',
  id,
  children,
  ...rest
}: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-semibold text-ink-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none">{icon}</span>}
        <select
          id={inputId}
          className={`${baseInput} appearance-none ${icon ? 'pl-10' : 'pl-4'} pr-10 ${error ? 'border-danger' : 'border-ink-200'}`}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none" />
      </div>
      {error && <p className="text-[12px] text-danger font-medium">{error}</p>}
    </div>
  );
}

interface CheckboxProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
  trailing?: ReactNode;
  error?: string;
}

export function Checkbox({ checked, onChange, label, trailing, error }: CheckboxProps) {
  return (
    <div>
      <label className="flex items-center gap-3 cursor-pointer select-none min-h-[44px]">
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
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border transition-colors ${
            checked ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-ink-300'
          }`}
        >
          {checked && <Check size={14} strokeWidth={3} />}
        </span>
        <span className="flex-1 text-[13px] text-ink-900">{label}</span>
        {trailing}
      </label>
      {error && <p className="text-[12px] text-danger font-medium mt-1">{error}</p>}
    </div>
  );
}

interface RadioCardProps {
  selected: boolean;
  onSelect: () => void;
  icon?: ReactNode;
  title: string;
  subtitle?: string;
}

export function RadioCard({ selected, onSelect, icon, title, subtitle }: RadioCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-[14px] border bg-white px-3.5 py-3 text-left transition-colors ${
        selected ? 'border-brand-600 ring-2 ring-brand-600/15' : 'border-ink-200 hover:border-ink-300'
      }`}
    >
      {icon && <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-ink-50 text-brand-700">{icon}</span>}
      <span className="flex-1 min-w-0">
        <span className="block text-[13px] font-semibold text-ink-900">{title}</span>
        {subtitle && <span className="block text-[11px] text-ink-500 truncate">{subtitle}</span>}
      </span>
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${selected ? 'border-brand-600' : 'border-ink-300'}`}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />}
      </span>
    </button>
  );
}

interface CounterProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export function Counter({ value, onChange, min = 1, max = 20, label }: CounterProps) {
  return (
    <div className="inline-flex items-center gap-3" aria-label={label}>
      <button
        type="button"
        aria-label="Diminuer"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="h-8 w-8 rounded-full border border-ink-200 flex items-center justify-center text-ink-700 disabled:opacity-40 hover:bg-ink-50"
      >
        <Minus size={14} />
      </button>
      <span className="min-w-[20px] text-center text-[14px] font-semibold">{value}</span>
      <button
        type="button"
        aria-label="Augmenter"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="h-8 w-8 rounded-full border border-ink-200 flex items-center justify-center text-ink-700 disabled:opacity-40 hover:bg-ink-50"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-brand-600' : 'bg-ink-200'}`}
    >
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
    </button>
  );
}
