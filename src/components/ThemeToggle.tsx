'use client';

import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme') as Theme | null;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial: Theme = stored ?? (prefersDark ? 'dark' : 'light');
      setTheme(initial);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      document.documentElement.classList[theme === 'dark' ? 'add' : 'remove']('dark');
      localStorage.setItem('theme', theme);
    } catch {}
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  const onToggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    try {
      document.documentElement.classList.toggle('dark', next === 'dark');
      if (document.body) {
        document.body.classList.toggle('dark', next === 'dark');
      }
      document.documentElement.style.colorScheme = next;
      localStorage.setItem('theme', next);
    } catch {}
    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Toggle theme"
      className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors
                 border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800
                 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-100"
    >
      {theme === 'dark' ? (
        <>
          <MoonIcon className="h-4 w-4" />
          Dark
        </>
      ) : (
        <>
          <SunIcon className="h-4 w-4" />
          Light
        </>
      )}
    </button>
  );
}

function SunIcon(props: JSX.IntrinsicElements['svg']) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon(props: JSX.IntrinsicElements['svg']) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
