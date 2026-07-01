import { useEffect } from 'react'

export function useTheme(theme?: 'light' | 'dark' | 'system') {
  useEffect(() => {
    const root = document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    function applyTheme(isDark: boolean) {
      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    if (!theme || theme === 'system') {
      applyTheme(mediaQuery.matches)
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches)
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }

    applyTheme(theme === 'dark')
  }, [theme])
}
