import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'lime';
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
  primary: 'bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900 shadow-sm',
  secondary: 'bg-brand-100 text-brand-800 hover:bg-brand-200',
  outline: 'bg-white text-brand-700 border border-brand-700 hover:bg-brand-50',
  ghost: 'bg-transparent text-brand-700 hover:bg-brand-50',
  danger: 'bg-white text-danger border border-danger/40 hover:bg-red-50',
  lime: 'bg-lime-500 text-brand-900 hover:bg-lime-600',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px] rounded-md gap-1.5',
  md: 'h-11 px-5 text-[14px] rounded-[14px] gap-2',
  lg: 'h-[50px] px-6 text-[15px] rounded-[14px] gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  full,
  loading,
  leftIcon,
  rightIcon,
  className = '',
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition-colors select-none disabled:opacity-50 disabled:cursor-not-allowed ${variantClass[variant]} ${sizeClass[size]} ${full ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  tone?: 'light' | 'dark' | 'glass' | 'primary';
  size?: number;
}

export function IconButton({ label, tone = 'light', size = 40, className = '', children, ...rest }: IconButtonProps) {
  const toneClass =
    tone === 'glass'
      ? 'bg-white/90 text-ink-900 shadow-sm backdrop-blur'
      : tone === 'dark'
        ? 'bg-brand-900 text-white'
        : tone === 'primary'
          ? 'bg-brand-700 text-white shadow-float'
          : 'bg-white text-ink-900 border border-ink-200';
  return (
    <button
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-full transition-transform active:scale-95 ${toneClass} ${className}`}
      style={{ width: size, height: size }}
      {...rest}
    >
      {children}
    </button>
  );
}
