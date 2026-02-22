import React, { useState, useEffect } from 'react';
import '../styles/ThemeToggle.css';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Detect system theme preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(systemPrefersDark);
    applyTheme(systemPrefersDark);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e) => {
      setIsDark(e.matches);
      applyTheme(e.matches);
      localStorage.removeItem('theme');
    };

    mediaQuery.addEventListener('change', handleThemeChange);
    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, []);

  const applyTheme = (dark) => {
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    applyTheme(newTheme);
    // Save manual override
    localStorage.setItem('theme-override', newTheme ? 'dark' : 'light');
  };

  return (
    <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
      {isDark ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
