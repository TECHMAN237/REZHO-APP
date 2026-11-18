/**
 * REZHO design tokens — derived from the four approved reference images.
 * Consumed by both Tailwind configs (mobile + admin) and by components.
 */
export const colors = {
  brand: {
    950: '#07271B', // deepest green (splash gradient end)
    900: '#0F3D2E', // sidebar / dark panels
    800: '#145238',
    700: '#1A6B45', // mobile primary buttons (dark green)
    600: '#1F8A4C', // primary (customer app)
    500: '#2BA55B',
    400: '#4CC27A',
    300: '#8ED9A8',
    200: '#C8EBD5',
    100: '#E3F4E9', // chips / light tags
    50: '#F0F8F3', // page background (mint)
  },
  lime: {
    600: '#7CC210',
    500: '#9BE017', // provider CTA / active nav
    400: '#B5EA4A',
    100: '#EEF9D8',
  },
  ink: {
    900: '#0F1A14', // primary text
    700: '#334139',
    500: '#6B7A70', // muted text
    300: '#B8C2BB', // placeholders
    200: '#DCE5DF', // borders
    100: '#EEF3F0', // subtle fills
    50: '#F7FAF8',
  },
  status: {
    success: '#16A34A',
    successBg: '#DCFCE7',
    warning: '#D97706',
    warningBg: '#FEF3C7',
    danger: '#DC2626',
    dangerBg: '#FEE2E2',
    info: '#2563EB',
    infoBg: '#DBEAFE',
    star: '#F5B301',
  },
} as const;

export const radii = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  phone: '40px',
} as const;

export const fontFamily = {
  sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
} as const;

export const shadows = {
  card: '0 1px 2px rgba(15, 26, 20, 0.04), 0 4px 16px rgba(15, 26, 20, 0.06)',
  float: '0 8px 24px rgba(15, 61, 46, 0.25)',
  phone: '0 30px 80px rgba(7, 39, 27, 0.35)',
} as const;

/** Tailwind-ready theme extension shared by both apps. */
export const tailwindTheme = {
  colors: {
    brand: colors.brand,
    lime: colors.lime,
    ink: colors.ink,
    success: colors.status.success,
    warning: colors.status.warning,
    danger: colors.status.danger,
    info: colors.status.info,
    star: colors.status.star,
  },
  borderRadius: radii,
  fontFamily,
  boxShadow: shadows,
};
