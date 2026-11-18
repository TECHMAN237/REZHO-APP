import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'lime' | 'primary' | 'outline' | 'ghost' | 'danger' | 'subtle';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantClass: Record<Variant, string> = {
  lime: 'bg-lime-500 text-brand-900 hover:bg-lime-600 shadow-sm',
  primary: 'bg-brand-700 text-white hover:bg-brand-800',
  outline: 'bg-white text-ink-900 border border-ink-200 hover:border-ink-300 hover:bg-ink-50',
  ghost: 'bg-transparent text-ink-700 hover:bg-ink-100',
  danger: 'bg-white text-danger border border-danger/40 hover:bg-red-50',
  subtle: 'bg-brand-100 text-brand-800 hover:bg-brand-200',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-8 px-3 text-[12px] rounded-[8px] gap-1.5',
  md: 'h-10 px-4 text-[13px] rounded-[10px] gap-2',
  lg: 'h-11 px-5 text-[14px] rounded-[12px] gap-2',
};

export function Button({ variant = 'lime', size = 'md', full, loading, leftIcon, rightIcon, className = '', children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold whitespace-nowrap transition-colors select-none disabled:opacity-50 disabled:cursor-not-allowed ${variantClass[variant]} ${sizeClass[size]} ${full ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: number;
  tone?: 'ghost' | 'outline' | 'danger';
}

export function IconButton({ label, size = 32, tone = 'ghost', className = '', children, ...rest }: IconButtonProps) {
  const toneClass = tone === 'outline' ? 'border border-ink-200 bg-white hover:bg-ink-50 text-ink-700' : tone === 'danger' ? 'text-danger hover:bg-red-50' : 'text-ink-500 hover:bg-ink-100 hover:text-ink-900';
  return (
    <button aria-label={label} title={label} className={`inline-flex items-center justify-center rounded-[8px] transition-colors ${toneClass} ${className}`} style={{ width: size, height: size }} {...rest}>
      {children}
    </button>
  );
}
