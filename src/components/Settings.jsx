import { useState, useRef } from 'react'
import { Download, Upload, Trash2, Info, Shield, Database, RefreshCw, CheckCircle2 } from 'lucide-react'

export default function Settings({ certs, setCerts, journal, setJournal, goals, setGoals, jobs = [], setJobs = () => {} }) {
  const [importStatus, setImportStatus] = useState(null) // null | 'success' | 'error'
  const [showClearConfirm, setShowClearConfirm] = useState(null) // null | 'certs' | 'journal' | 'goals' | 'all'
  const fileRef = useRef()

  const handleExport = () => {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: { certs, journal, goals, jobs },
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `careeros-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const payload = JSON.parse(ev.target.result)
        if (!payload.data) throw new Error('Invalid format')
        if (payload.data.certs)   setCerts(payload.data.certs)
        if (payload.data.journal) setJournal(payload.data.journal)
        if (payload.data.goals)   setGoals(payload.data.goals)
        if (payload.data.jobs)    setJobs(payload.data.jobs)
        setImportStatus('success')
        setTimeout(() => setImportStatus(null), 3000)
      } catch {
        setImportStatus('error')
        setTimeout(() => setImportStatus(null), 3000)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleClear = (target) => {
    if (target === 'certs')   setCerts([])
    if (target === 'journal') setJournal([])
    if (target === 'goals')   setGoals([])
    if (target === 'jobs')   setJobs([])
    if (target === 'all')     { setCerts([]); setJournal([]); setGoals([]); setJobs([]) }
    setShowClearConfirm(null)
  }

  const storageSize = useMemo => {
    try {
      const raw = JSON.stringify({ certs, journal, goals })
      return (new Blob([raw]).size / 1024).toFixed(1)
    } catch { return '?' }
  }

  const size = (() => {
    try { return (new Blob([JSON.stringify({ certs, journal, goals })]).size / 1024).toFixed(1) }
    catch { return '?' }
  })()

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="font-mono text-xs text-slate-500 tracking-widest mb-2 uppercase">System</div>
        <h1 className="font-display font-800 text-3xl text-white tracking-tight">Settings</h1>
        <p className="font-body text-slate-500 text-sm mt-1">Data management and app configuration</p>
      </div>

      <div className="max-w-2xl space-y-4">

        {/* Data overview */}
        <div className="border border-surface-700 bg-surface-800/30 rounded-xl p-6 animate-slide-up" style={{ animationFillMode: 'both' }}>
          <div className="flex items-center gap-2 mb-5">
            <Database size={14} className="text-accent" />
            <span className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">Local Storage Overview</span>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: 'Certifications', count: certs.length, color: 'text-accent' },
              { label: 'Job Applications', count: jobs.length, color: 'text-gold' },
              { label: 'Journal Entries', count: journal.length, color: 'text-gold' },
              { label: 'Goals', count: goals.length, color: 'text-violet-400' },
            ].map(({ label, count, color }) => (
              <div key={label} className="text-center">
                <div className={`font-display font-800 text-2xl ${color}`}>{count}</div>
                <div className="font-body text-[11px] text-slate-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-surface-700 pt-4 flex items-center justify-between">
            <span className="font-body text-xs text-slate-600">Storage used</span>
            <span className="font-mono text-xs text-slate-400">{size} KB</span>
          </div>
        </div>

        {/* Export */}
        <div className="border border-surface-700 bg-surface-800/30 rounded-xl p-6 animate-slide-up" style={{ animationDelay: '60ms', animationFillMode: 'both' }}>
          <div className="flex items-center gap-2 mb-2">
            <Download size={14} className="text-emerald-400" />
            <span className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">Export Backup</span>
          </div>
          <p className="font-body text-sm text-slate-500 mb-4">Download all your data as a JSON file. Use this to back up or transfer your data.</p>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 rounded-lg font-display font-600 text-sm hover:bg-emerald-500/10 transition-colors"
          >
            <Download size={14} />
            Export careeros-backup.json
          </button>
        </div>

        {/* Import */}
        <div className="border border-surface-700 bg-surface-800/30 rounded-xl p-6 animate-slide-up" style={{ animationDelay: '120ms', animationFillMode: 'both' }}>
          <div className="flex items-center gap-2 mb-2">
            <Upload size={14} className="text-accent" />
            <span className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">Import Backup</span>
          </div>
          <p className="font-body text-sm text-slate-500 mb-4">Restore from a previously exported CareerOS JSON file. This will overwrite current data.</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border border-accent/30 bg-accent/5 text-accent rounded-lg font-display font-600 text-sm hover:bg-accent/10 transition-colors"
            >
              <Upload size={14} />
              Choose File…
            </button>
            {importStatus === 'success' && (
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
                <CheckCircle2 size={13} /> Imported successfully
              </span>
            )}
            {importStatus === 'error' && (
              <span className="font-mono text-[11px] text-red-400">Invalid file format</span>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </div>

        {/* Danger zone */}
        <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-6 animate-slide-up" style={{ animationDelay: '180ms', animationFillMode: 'both' }}>
          <div className="flex items-center gap-2 mb-4">
            <Trash2 size={14} className="text-red-400" />
            <span className="font-mono text-[10px] tracking-widest text-red-400/70 uppercase">Danger Zone</span>
          </div>
          <div className="space-y-3">
            {[
              { key: 'certs',   label: 'Clear Certifications', sub: `Remove all ${certs.length} certifications` },
              { key: 'journal', label: 'Clear Journal',         sub: `Remove all ${journal.length} entries` },
              { key: 'goals',   label: 'Clear Goals',           sub: `Remove all ${goals.length} goals` },
              { key: 'jobs',    label: 'Clear Job Pipeline',    sub: `Remove all ${jobs.length} applications` },
              { key: 'all',     label: 'Reset Everything',      sub: 'Wipe all data — cannot be undone' },
            ].map(({ key, label, sub }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <div className="font-body text-sm text-slate-300">{label}</div>
                  <div className="font-body text-[11px] text-slate-600">{sub}</div>
                </div>
                {showClearConfirm === key ? (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-red-400">Sure?</span>
                    <button
                      onClick={() => handleClear(key)}
                      className="px-2.5 py-1 bg-red-500 text-white rounded font-mono text-[10px] hover:bg-red-400 transition-colors"
                    >
                      Yes, delete
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(null)}
                      className="px-2.5 py-1 bg-surface-700 text-slate-400 rounded font-mono text-[10px] hover:bg-surface-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowClearConfirm(key)}
                    className={`px-3 py-1.5 border border-red-500/30 text-red-400 rounded-lg font-mono text-[10px] hover:bg-red-500/10 transition-colors ${key === 'all' ? 'font-700' : ''}`}
                  >
                    Clear
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* App info */}
        <div className="border border-surface-700 bg-surface-800/30 rounded-xl p-5 animate-slide-up" style={{ animationDelay: '240ms', animationFillMode: 'both' }}>
          <div className="flex items-center gap-2 mb-4">
            <Info size={14} className="text-slate-500" />
            <span className="font-mono text-[10px] tracking-widest text-slate-600 uppercase">About CareerOS</span>
          </div>
          <div className="space-y-2 font-mono text-[11px]">
            {[
              ['Version', '1.0.0'],
              ['Stack',   'React 18 · Vite · Tailwind CSS'],
              ['PWA',     'Workbox · Cache-first · Offline capable'],
              ['Storage', 'localStorage · No server · No tracking'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-slate-600">{k}</span>
                <span className="text-slate-400">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-surface-700">
            <Shield size={11} className="text-emerald-400" />
            <span className="font-mono text-[10px] text-emerald-400/70">All data stored locally on your device</span>
          </div>
        </div>

      </div>
    </div>
  )
}
