import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Search, LayoutDashboard, Award, BookOpen, Target,
  BarChart2, Settings, Plus, ArrowRight, Clock, Hash,
  Zap, X
} from 'lucide-react'

// ── Static command registry ───────────────────────────────────────────────────

function buildCommands(onNavigate, onAction) {
  return [
    // Navigation
    { id: 'nav-dashboard', group: 'Navigate',     label: 'Go to Dashboard',       icon: LayoutDashboard, shortcut: 'G D', action: () => onNavigate('dashboard') },
    { id: 'nav-certs',     group: 'Navigate',     label: 'Go to Certifications',  icon: Award,           shortcut: 'G C', action: () => onNavigate('certs') },
    { id: 'nav-journal',   group: 'Navigate',     label: 'Go to Study Journal',   icon: BookOpen,        shortcut: 'G J', action: () => onNavigate('journal') },
    { id: 'nav-goals',     group: 'Navigate',     label: 'Go to Goals Roadmap',   icon: Target,          shortcut: 'G G', action: () => onNavigate('goals') },
    { id: 'nav-analytics', group: 'Navigate',     label: 'Go to Analytics',       icon: BarChart2,       shortcut: 'G A', action: () => onNavigate('analytics') },
    { id: 'nav-settings',  group: 'Navigate',     label: 'Go to Settings',        icon: Settings,        shortcut: 'G S', action: () => onNavigate('settings') },
    // Quick actions
    { id: 'act-log',       group: 'Quick Action', label: 'Log Study Session',     icon: Plus,  shortcut: 'N J', action: () => { onNavigate('journal');   onAction('openForm') } },
    { id: 'act-cert',      group: 'Quick Action', label: 'Add Certification',     icon: Plus,  shortcut: 'N C', action: () => { onNavigate('certs');     onAction('openForm') } },
    { id: 'act-goal',      group: 'Quick Action', label: 'Add Goal',              icon: Plus,  shortcut: 'N G', action: () => { onNavigate('goals');     onAction('openForm') } },
    { id: 'act-job',       group: 'Quick Action', label: 'Add Job Application',   icon: Plus,  shortcut: 'N A', action: () => { onNavigate('jobs');      onAction('openForm') } },
  ]
}

// ── Highlight matching text ───────────────────────────────────────────────────
function Highlight({ text, query }) {
  if (!query) return <span>{text}</span>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <span>{text}</span>
  return (
    <span>
      {text.slice(0, idx)}
      <span className="cmd-match">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </span>
  )
}

// ── CommandPalette ─────────────────────────────────────────────────────────────
export default function CommandPalette({ onNavigate, onAction, isOpen, onClose, certs, journal }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef()
  const listRef = useRef()

  const staticCmds = buildCommands(onNavigate, onAction)

  // Dynamic commands from data
  const dynamicCmds = [
    ...certs.slice(0, 5).map(c => ({
      id: `cert-${c.id}`,
      group: 'Certifications',
      label: c.name,
      sub: c.vendor || '',
      icon: Award,
      badge: c.status === 'achieved' ? 'ACHIEVED' : 'IN PROGRESS',
      badgeColor: c.status === 'achieved' ? 'text-emerald-400' : 'text-accent',
      action: () => onNavigate('certs'),
    })),
    ...journal.slice(0, 3).map(e => ({
      id: `journal-${e.id}`,
      group: 'Recent Sessions',
      label: e.topic,
      sub: `${e.hours}h · ${new Date(e.date).toLocaleDateString()}`,
      icon: Clock,
      action: () => onNavigate('journal'),
    })),
  ]

  const allCmds = [...staticCmds, ...dynamicCmds]

  const filtered = query.trim()
    ? allCmds.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        (c.sub || '').toLowerCase().includes(query.toLowerCase()) ||
        c.group.toLowerCase().includes(query.toLowerCase())
      )
    : staticCmds

  // Group results
  const groups = filtered.reduce((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = []
    acc[cmd.group].push(cmd)
    return acc
  }, {})

  const flat = Object.values(groups).flat()

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [isOpen])

  useEffect(() => { setSelected(0) }, [query])

  const run = useCallback((cmd) => {
    cmd.action()
    onClose()
  }, [onClose])

  const handleKey = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected(s => Math.min(s + 1, flat.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected(s => Math.max(s - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (flat[selected]) run(flat[selected])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }, [flat, selected, run, onClose])

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${selected}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  if (!isOpen) return null

  let globalIdx = 0

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-start justify-center pt-[15vh] px-4"
      onClick={onClose}
    >
      <div className="cmd-backdrop absolute inset-0" />

      <div
        className="relative w-full max-w-lg bg-surface-900 border border-surface-600 rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
        style={{ animationDuration: '0.15s' }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-surface-700">
          <Search size={16} className="text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-white font-body text-sm placeholder:text-slate-600 focus:outline-none"
            placeholder="Search commands, certs, sessions…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-600 hover:text-slate-400">
              <X size={14} />
            </button>
          )}
          <kbd>ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="overflow-y-auto max-h-80 py-2">
          {flat.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="font-body text-sm text-slate-600">No results for "{query}"</p>
            </div>
          ) : (
            Object.entries(groups).map(([group, cmds]) => (
              <div key={group}>
                <div className="px-4 py-1.5">
                  <span className="font-mono text-[9px] tracking-widest text-slate-600 uppercase">{group}</span>
                </div>
                {cmds.map((cmd) => {
                  const idx = globalIdx++
                  const Icon = cmd.icon
                  const isSelected = selected === idx
                  return (
                    <button
                      key={cmd.id}
                      data-idx={idx}
                      onClick={() => run(cmd)}
                      onMouseEnter={() => setSelected(idx)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        isSelected ? 'bg-accent/10' : 'hover:bg-surface-800'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-accent/15 border border-accent/20' : 'bg-surface-700 border border-surface-600'
                      }`}>
                        <Icon size={13} className={isSelected ? 'text-accent' : 'text-slate-500'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-body text-sm ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                          <Highlight text={cmd.label} query={query} />
                        </div>
                        {cmd.sub && (
                          <div className="font-mono text-[10px] text-slate-600 mt-0.5">{cmd.sub}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {cmd.badge && (
                          <span className={`font-mono text-[9px] ${cmd.badgeColor}`}>{cmd.badge}</span>
                        )}
                        {cmd.shortcut && (
                          <span className="font-mono text-[10px] text-slate-600 tracking-wider">{cmd.shortcut}</span>
                        )}
                        {isSelected && <ArrowRight size={12} className="text-accent" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-surface-700 px-4 py-2 flex items-center gap-4">
          <span className="font-mono text-[9px] text-slate-700 flex items-center gap-1"><kbd>↑↓</kbd> navigate</span>
          <span className="font-mono text-[9px] text-slate-700 flex items-center gap-1"><kbd>↵</kbd> select</span>
          <span className="font-mono text-[9px] text-slate-700 flex items-center gap-1"><kbd>⌘K</kbd> toggle</span>
          <div className="ml-auto flex items-center gap-1">
            <Zap size={9} className="text-slate-700" />
            <span className="font-mono text-[9px] text-slate-700">CareerOS</span>
          </div>
        </div>
      </div>
    </div>
  )
}
