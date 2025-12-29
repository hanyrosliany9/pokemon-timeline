import { useEffect } from 'react'

interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  handler: () => void
  description: string
}

/**
 * ★ Insight ─────────────────────────────────────
 * Custom keyboard shortcut hook for global and
 * component-level keyboard navigation. Normalizes
 * key matching across browsers and prevents
 * unwanted triggers when typing in inputs.
 * ─────────────────────────────────────────────────
 */

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in form inputs
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        // Allow Escape key even in form fields
        if (event.key !== 'Escape') {
          return
        }
      }

      for (const shortcut of shortcuts) {
        // Normalize key comparison (handle uppercase/lowercase)
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()

        // Check modifier keys
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey
        const altMatch = shortcut.alt ? event.altKey : !event.altKey
        const metaMatch = shortcut.meta ? event.metaKey : !event.metaKey

        if (keyMatches && ctrlMatch && shiftMatch && altMatch && metaMatch) {
          event.preventDefault()
          shortcut.handler()
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [shortcuts])
}

/**
 * Common keyboard shortcuts for the application
 */
export const COMMON_SHORTCUTS = {
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
} as const
