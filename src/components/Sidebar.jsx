import { LayoutDashboard, Award, BookOpen, Target, BarChart2, Settings, Briefcase, Menu, X, Zap, Search } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',      icon: LayoutDashboard, shortcut: 'GD' },
  { id: 'certs',     label: 'Certifications', icon: Award,           shortcut: 'GC' },
  { id: 'journal',   label: 'Study Journal',  icon: BookOpen,        shortcut: 'GJ' },
  { id: 'goals',     label: 'Roadmap',        icon: Target,          shortcut: 'GG' },
  { id: 'analytics', label: 'Analytics',      icon: BarChart2,       shortcut: 'GA' },
  { id: 'jobs',      label: 'Job Pipeline',   icon: Briefcase,       shortcut: 'GB' },
]

const BOTTOM_ITEMS = [
  { id: 'settings', label: 'Settings', icon: Settings, shortcut: 'GS' },
]

export default function Sidebar({ active, onNavigate, mobileOpen, onMobileToggle, onOpenPalette }) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={onMobileToggle} />
      )}

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-surface-900/95 backdrop-blur border-b border-surface-700">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-accent" />
          <span className="font-display font-700 text-sm tracking-wider text-white">CAREEROS</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onOpenPalette} className="p-1.5 rounded-lg hover:bg-surface-700 text-slate-500 hover:text-white transition-colors">
            <Search size={16} />
          </button>
          <button onClick={onMobileToggle} className="p-1.5 rounded-lg hover:bg-surface-700 text-slate-400 hover:text-white transition-colors">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 z-50 flex flex-col
        bg-surface-900 border-r border-surface-700
        transition-transform duration-300 ease-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-surface-700">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center glow-accent">
            <Zap size={16} className="text-accent" />
          </div>
          <div>
            <div className="font-display font-800 text-sm tracking-widest text-white">CAREEROS</div>
            <div className="font-mono text-[10px] text-slate-500 tracking-wider">v2.0 · MISSION CTRL</div>
          </div>
        </div>

        {/* ⌘K button */}
        <div className="px-3 pt-3">
          <button
            onClick={onOpenPalette}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-surface-700 bg-surface-800/50 hover:border-surface-600 transition-all group"
          >
            <Search size={13} className="text-slate-600 group-hover:text-slate-400" />
            <span className="font-body text-xs text-slate-600 group-hover:text-slate-400 flex-1 text-left">Quick search…</span>
            <kbd>⌘K</kbd>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          <div className="px-3 py-2">
            <span className="font-mono text-[9px] tracking-widest text-slate-700 uppercase">Navigation</span>
          </div>
          {NAV_ITEMS.map(({ id, label, icon: Icon, shortcut }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                onClick={() => { onNavigate(id); onMobileToggle(false) }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                  font-body font-500 transition-all duration-200 group
                  ${isActive
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'text-slate-400 hover:text-white hover:bg-surface-700 border border-transparent'
                  }
                `}
              >
                <Icon size={15} className={isActive ? 'text-accent' : 'text-slate-500 group-hover:text-slate-300'} />
                <span className="font-display font-500 tracking-wide flex-1 text-left">{label}</span>
                {isActive
                  ? <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow" />
                  : <span className="opacity-0 group-hover:opacity-100 font-mono text-[9px] text-slate-700 tracking-wider">{shortcut}</span>
                }
              </button>
            )
          })}
        </nav>

        {/* Bottom nav */}
        <div className="px-3 py-3 border-t border-surface-700 space-y-0.5">
          {BOTTOM_ITEMS.map(({ id, label, icon: Icon, shortcut }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                onClick={() => { onNavigate(id); onMobileToggle(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-all duration-200 group ${
                  isActive ? 'bg-accent/10 text-accent border border-accent/20' : 'text-slate-400 hover:text-white hover:bg-surface-700 border border-transparent'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-accent' : 'text-slate-500 group-hover:text-slate-300'} />
                <span className="font-display font-500 tracking-wide flex-1 text-left">{label}</span>
                {!isActive && <span className="opacity-0 group-hover:opacity-100 font-mono text-[9px] text-slate-700">{shortcut}</span>}
              </button>
            )
          })}
          <div className="px-3 pt-2 pb-1">
            <div className="font-mono text-[10px] text-emerald-400">● SYSTEM ONLINE</div>
          </div>
        </div>
      </aside>
    </>
  )
}
