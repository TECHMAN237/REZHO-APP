interface LogoProps {
  /** Overall height in px */
  size?: number;
  /** Light = white glyphs for dark backgrounds */
  variant?: 'light' | 'dark';
  /** Show the REZHO wordmark under the R mark */
  wordmark?: boolean;
  className?: string;
}

/**
 * REZHO brand mark: bold "R" with a location pin embedded in the leg,
 * reproduced from the approved reference (white on dark green, green on light).
 */
export function Logo({ size = 64, variant = 'dark', wordmark = true, className }: LogoProps) {
  const fg = variant === 'light' ? '#FFFFFF' : '#0F3D2E';
  const accent = variant === 'light' ? '#9BE017' : '#1F8A4C';
  const markSize = wordmark ? size * 0.62 : size;
  return (
    <div className={`inline-flex flex-col items-center ${className ?? ''}`} aria-label="REZHO" role="img">
      <svg width={markSize} height={markSize} viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <text
          x="8"
          y="54"
          fontFamily='"Plus Jakarta Sans", Inter, Arial, sans-serif'
          fontWeight="800"
          fontSize="58"
          fill={fg}
        >
          R
        </text>
        <path d="M44 30c-5.5 0-10 4.4-10 9.9 0 7.4 10 17.1 10 17.1s10-9.7 10-17.1c0-5.5-4.5-9.9-10-9.9z" fill={accent} />
        <circle cx="44" cy="40" r="4" fill={variant === 'light' ? '#0F3D2E' : '#FFFFFF'} />
      </svg>
      {wordmark && (
        <span
          className="font-extrabold tracking-[0.08em] leading-none"
          style={{ color: fg, fontSize: size * 0.3, marginTop: size * 0.02 }}
        >
          REZHO
        </span>
      )}
    </div>
  );
}

export function LogoInline({ size = 28, variant = 'dark' }: { size?: number; variant?: 'light' | 'dark' }) {
  const fg = variant === 'light' ? '#FFFFFF' : '#0F3D2E';
  return (
    <span className="inline-flex items-center gap-1.5" aria-label="REZHO" role="img">
      <Logo size={size} variant={variant} wordmark={false} />
      <span className="font-extrabold tracking-[0.08em]" style={{ color: fg, fontSize: size * 0.72 }}>
        REZHO
      </span>
    </span>
  );
}
