import { useEffect, useRef } from 'react'

/**
 * Global keyboard shortcut handler.
 *
 * Supported shortcuts:
 *   ⌘K / Ctrl+K  → open command palette
 *   G then D/C/J/G/A/S → navigate (vim-style)
 *   N then J/C/G/A     → new entry (navigate + open form)
 *   Escape             → close modals (handled locally in each component)
 */
export function useKeyboardShortcuts({ onOpenPalette, onNavigate, onAction }) {
  const seqRef = useRef('') // accumulate multi-key sequences
  const timerRef = useRef(null)

  useEffect(() => {
    const NAV_MAP = { d: 'dashboard', c: 'certs', j: 'journal', g: 'goals', a: 'analytics', s: 'settings', b: 'jobs' }
    const NEW_MAP = { j: 'journal', c: 'certs', g: 'goals', a: 'jobs' }

    const handler = (e) => {
      const tag = e.target.tagName
      // Never fire shortcuts when user is typing in an input/textarea/select
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return

      // ⌘K / Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpenPalette()
        seqRef.current = ''
        return
      }

      // Ignore modifier-combo keys for seq shortcuts
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const key = e.key.toLowerCase()

      // Accumulate sequence
      seqRef.current += key
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => { seqRef.current = '' }, 800)

      const seq = seqRef.current

      // Two-key sequences
      if (seq.length === 2) {
        const [prefix, second] = seq

        if (prefix === 'g' && NAV_MAP[second]) {
          e.preventDefault()
          onNavigate(NAV_MAP[second])
          seqRef.current = ''
          return
        }

        if (prefix === 'n' && NEW_MAP[second]) {
          e.preventDefault()
          onNavigate(NEW_MAP[second])
          onAction('openForm')
          seqRef.current = ''
          return
        }

        // Unknown seq — reset
        seqRef.current = ''
      }
    }

    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      clearTimeout(timerRef.current)
    }
  }, [onOpenPalette, onNavigate, onAction])
}
