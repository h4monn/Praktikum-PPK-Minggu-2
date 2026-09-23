export type Theme = 'light' | 'dark';

export const THEME_COOKIE_NAME = 'duitku_theme';

/**
 * Mendapatkan nilai cookie tema di sisi client (browser).
 */
export function getClientThemeCookie(): Theme {
  if (typeof document === 'undefined') return 'light';
  const match = document.cookie.match(new RegExp('(^| )' + THEME_COOKIE_NAME + '=([^;]+)'));
  if (match && (match[2] === 'dark' || match[2] === 'light')) {
    return match[2] as Theme;
  }
  return 'light';
}

/**
 * Menyimpan nilai cookie tema di sisi client (browser).
 */
export function setClientThemeCookie(theme: Theme) {
  if (typeof document === 'undefined') return;
  const maxAge = 60 * 60 * 24 * 365; // 1 tahun
  document.cookie = `${THEME_COOKIE_NAME}=${theme}; path=/; max-age=${maxAge}; SameSite=Lax`;
}
