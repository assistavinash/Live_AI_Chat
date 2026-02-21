// Theme utility for syncing with system preference

export const THEME_LIGHT = 'light';
export const THEME_DARK = 'dark';

/**
 * Get current theme
 * @returns {string} - 'light' or 'dark'
 */
export const getCurrentTheme = () => {
  const override = localStorage.getItem('theme-override');
  if (override) return override;
  
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return THEME_DARK;
  }
  return THEME_LIGHT;
};

/**
 * Set manual theme override
 * @param {string} theme - 'light' or 'dark'
 */
export const setTheme = (theme) => {
  if (theme === THEME_LIGHT) {
    document.documentElement.setAttribute('data-theme', THEME_LIGHT);
    localStorage.setItem('theme-override', THEME_LIGHT);
  } else if (theme === THEME_DARK) {
    document.documentElement.setAttribute('data-theme', THEME_DARK);
    localStorage.setItem('theme-override', THEME_DARK);
  }
};

/**
 * Reset to system theme
 */
export const resetToSystemTheme = () => {
  localStorage.removeItem('theme-override');
  document.documentElement.removeAttribute('data-theme');
};

/**
 * Toggle between light and dark theme
 * @returns {string} - new theme
 */
export const toggleTheme = () => {
  const current = getCurrentTheme();
  const newTheme = current === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;
  setTheme(newTheme);
  return newTheme;
};

/**
 * Check if system prefers dark mode
 */
export const systemPrefersDark = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

