import { StateCreator } from 'zustand'

type ThemeType = 'light' | 'dark' | 'system'

export interface ThemeSlice {
  theme: ThemeType
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: ThemeType) => void
  updateResolvedTheme: () => void
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const getResolvedTheme = (theme: ThemeType): 'light' | 'dark' => {
  if (theme === 'system') {
    return getSystemTheme()
  }
  return theme
}

const applyTheme = (resolvedTheme: 'light' | 'dark') => {
  if (typeof document === 'undefined') return

  if (resolvedTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const getInitialTheme = (): ThemeType => {
  if (typeof localStorage === 'undefined') return 'system'
  return (localStorage.getItem('theme') as ThemeType) || 'system'
}

export const createThemeSlice: StateCreator<ThemeSlice> = (set) => {
  const initialTheme = getInitialTheme()
  const initialResolvedTheme = getResolvedTheme(initialTheme)

  return {
    theme: initialTheme,
    resolvedTheme: initialResolvedTheme,

    setTheme: (theme: ThemeType) => {
      localStorage.setItem('theme', theme)
      const resolvedTheme = getResolvedTheme(theme)
      applyTheme(resolvedTheme)

      set({
        theme,
        resolvedTheme,
      })
    },

    updateResolvedTheme: () => {
      const storedTheme = getInitialTheme()
      const resolvedTheme = getResolvedTheme(storedTheme)
      applyTheme(resolvedTheme)

      set({
        theme: storedTheme,
        resolvedTheme,
      })
    },
  }
}
