import { useState } from 'react'
import { Plus, Briefcase, Trash2, X, ExternalLink, Calendar, MapPin, DollarSign, ChevronRight, Building2, Clock } from 'lucide-react'

const STAGES = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected']

const STAGE_CFG = {
  Wishlist:  { color: 'text-slate-400',   border: 'border-slate-600/30',   bg: 'bg-slate-600/5',   dot: 'bg-slate-500',   badge: 'bg-slate-600/20 text-slate-400 border-slate-600/30' },
  Applied:   { color: 'text-accent',      border: 'border-accent/30',      bg: 'bg-accent/5',      dot: 'bg-accent',      badge: 'bg-accent/10 text-accent border-accent/20' },
  Interview: { color: 'text-violet-400',  border: 'border-violet-500/30',  bg: 'bg-violet-500/5',  dot: 'bg-violet-400',  badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  Offer:     { color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', dot: 'bg-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  Rejected:  { color: 'text-red-400',     border: 'border-red-500/20',     bg: 'bg-red-500/5',     dot: 'bg-red-400',     badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
}

const EMPTY = {
  company: '', role: '', location: '', url: '', stage: 'Wishlist',
  appliedDate: '', salary: '', notes: '', clearance: false, remote: false,
}

function StageBadge({ stage }) {
  const c = STAGE_CFG[stage] || STAGE_CFG.Applied
  return (
    <span className={`font-mono text-[9px] px-2 py-0.5 rounded border ${c.badge}`}>
      {stage.toUpperCase()}
    </span>
  )
}

function KanbanColumn({ stage, jobs, onEdit, onDelete, onMove }) {
  const c = STAGE_CFG[stage]
  const stageJobs = jobs.filter(j => j.stage === stage)
  const nextStage = STAGES[STAGES.indexOf(stage) + 1]
  const prevStage = STAGES[STAGES.indexOf(stage) - 1]

  return (
    <div className={`border ${c.border} rounded-xl overflow-hidden min-w-0 flex flex-col`}>
      {/* Column header */}
      <div className={`px-4 py-3 border-b ${c.border} ${c.bg} flex items-center justify-between shrink-0`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${c.dot}`} />
          <span className={`font-display font-700 text-sm ${c.color}`}>{stage}</span>
        </div>
        <span className="font-mono text-[10px] text-slate-600">{stageJobs.length}</span>
      </div>

      {/* Cards */}
      <div className="p-2 space-y-2 flex-1 min-h-16">
        {stageJobs.map((job, i) => (
          <div
            key={job.id}
            className="group border border-surface-700 bg-surface-800/60 rounded-xl p-3 hover:border-surface-600 transition-all animate-slide-up cursor-pointer"
            style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'both' }}
            onClick={() => onEdit(job)}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="min-w-0">
                <div className="font-display font-600 text-xs text-white truncate">{job.role}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Building2 size={9} className="text-slate-600 shrink-0" />
                  <span className="font-body text-[10px] text-slate-500 truncate">{job.company}</span>
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); onDelete(job.id) }}
                className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-red-400 transition-all p-0.5"
              >
                <Trash2 size={10} />
              </button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {job.location && (
                <span className="flex items-center gap-0.5 font-mono text-[9px] text-slate-600">
                  <MapPin size={8} />{job.location}
                </span>
              )}
              {job.clearance && (
                <span className="font-mono text-[9px] px-1.5 py-0.5 bg-gold/10 text-gold rounded border border-gold/20">CLEARANCE</span>
              )}
              {job.remote && (
                <span className="font-mono text-[9px] px-1.5 py-0.5 bg-violet-500/10 text-violet-400 rounded border border-violet-500/20">REMOTE</span>
              )}
            </div>
            {job.appliedDate && (
              <div className="flex items-center gap-1 mt-2 font-mono text-[9px] text-slate-700">
                <Calendar size={8} />
                {new Date(job.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            )}
            {/* Move buttons */}
            <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
              {prevStage && (
                <button
                  onClick={() => onMove(job.id, prevStage)}
                  className="flex items-center gap-1 font-mono text-[9px] text-slate-600 hover:text-slate-300 px-1.5 py-0.5 rounded border border-surface-700 hover:border-surface-600 transition-all"
                >
                  ← {prevStage}
                </button>
              )}
              {nextStage && stage !== 'Rejected' && (
                <button
                  onClick={() => onMove(job.id, nextStage)}
                  className={`flex items-center gap-1 font-mono text-[9px] px-1.5 py-0.5 rounded border transition-all ${STAGE_CFG[nextStage].badge}`}
                >
                  {nextStage} →
                </button>
              )}
            </div>
          </div>
        ))}
        {stageJobs.length === 0 && (
          <div className="py-4 text-center">
            <p className="font-mono text-[10px] text-slate-800">Empty</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function JobTracker({ jobs, setJobs, forceOpenForm }) {
  const [showForm, setShowForm] = useState(!!forceOpenForm)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [view, setView] = useState('kanban') // 'kanban' | 'list'

  const handleSubmit = (toast) => {
    if (!form.company.trim() || !form.role.trim()) return
    if (editId) {
      setJobs(prev => prev.map(j => j.id === editId ? { ...form, id: editId } : j))
    } else {
      setJobs(prev => [...prev, { ...form, id: Date.now().toString() }])
    }
    setForm(EMPTY)
    setEditId(null)
    setShowForm(false)
  }

  const handleEdit = (job) => { setForm({ ...job }); setEditId(job.id); setShowForm(true) }
  const handleDelete = (id) => setJobs(prev => prev.filter(j => j.id !== id))
  const handleMove = (id, stage) => setJobs(prev => prev.map(j => j.id === id ? { ...j, stage } : j))

  // Pipeline stats
  const stats = STAGES.reduce((acc, s) => { acc[s] = jobs.filter(j => j.stage === s).length; return acc }, {})

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="font-mono text-xs text-gold tracking-widest mb-2 uppercase">Career Pipeline</div>
          <h1 className="font-display font-800 text-3xl text-white tracking-tight">Job Applications</h1>
          <p className="font-body text-slate-500 text-sm mt-1">
            <span className="text-gold font-mono">{jobs.length}</span> applications tracked
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex border border-surface-700 rounded-lg overflow-hidden">
            {['kanban', 'list'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 font-mono text-[10px] tracking-widest uppercase transition-colors ${
                  view === v ? 'bg-surface-700 text-white' : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY) }}
            className="flex items-center gap-2 px-4 py-2 bg-gold text-surface-950 rounded-lg font-display font-600 text-sm hover:bg-gold/90 transition-colors"
          >
            <Plus size={14} />Add Job
          </button>
        </div>
      </div>

      {/* Pipeline summary */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {STAGES.map((stage, i) => {
          const c = STAGE_CFG[stage]
          const count = stats[stage] || 0
          return (
            <div key={stage} className="flex items-center gap-1 shrink-0">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${c.border} ${c.bg}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                <span className={`font-mono text-[10px] ${c.color}`}>{stage}</span>
                <span className="font-mono text-[10px] text-slate-600">{count}</span>
              </div>
              {i < STAGES.length - 1 && <ChevronRight size={12} className="text-slate-700 shrink-0" />}
            </div>
          )
        })}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="border-glow border border-gold/20 bg-surface-800/80 rounded-xl p-6 mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <span className="font-display font-600 text-white">{editId ? 'Edit Application' : 'New Job Application'}</span>
            <button onClick={() => { setShowForm(false); setEditId(null) }} className="text-slate-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase block mb-1.5">Company *</label>
              <input
                className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-white font-body placeholder:text-slate-600 focus:outline-none focus:border-gold/40 transition-colors"
                placeholder="e.g. Northrop Grumman"
                value={form.company}
                onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
              />
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase block mb-1.5">Role / Title *</label>
              <input
                className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-white font-body placeholder:text-slate-600 focus:outline-none focus:border-gold/40 transition-colors"
                placeholder="e.g. SOC Analyst I"
                value={form.role}
                onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              />
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase block mb-1.5">Location</label>
              <input
                className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-white font-body placeholder:text-slate-600 focus:outline-none focus:border-gold/40 transition-colors"
                placeholder="e.g. El Segundo, CA"
                value={form.location}
                onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
              />
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase block mb-1.5">Stage</label>
              <select
                className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-white font-body focus:outline-none focus:border-gold/40 transition-colors appearance-none"
                value={form.stage}
                onChange={e => setForm(p => ({ ...p, stage: e.target.value }))}
              >
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase block mb-1.5">Applied Date</label>
              <input
                type="date"
                className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-white font-body focus:outline-none focus:border-gold/40 transition-colors"
                value={form.appliedDate}
                onChange={e => setForm(p => ({ ...p, appliedDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase block mb-1.5">Salary Range</label>
              <input
                className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-white font-body placeholder:text-slate-600 focus:outline-none focus:border-gold/40 transition-colors"
                placeholder="e.g. $75k–$95k"
                value={form.salary}
                onChange={e => setForm(p => ({ ...p, salary: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase block mb-1.5">Job Posting URL</label>
              <input
                type="url"
                className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-white font-body placeholder:text-slate-600 focus:outline-none focus:border-gold/40 transition-colors"
                placeholder="https://..."
                value={form.url}
                onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase block mb-1.5">Notes</label>
              <textarea
                rows={2}
                className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-white font-body placeholder:text-slate-600 focus:outline-none focus:border-gold/40 transition-colors resize-none"
                placeholder="Contact, interview notes, referral info..."
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2 flex gap-6">
              {[['clearance','Requires Security Clearance'],['remote','Remote / Hybrid']].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer group">
                  <div
                    onClick={() => setForm(p => ({ ...p, [key]: !p[key] }))}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      form[key] ? 'bg-gold border-gold' : 'border-surface-600 group-hover:border-surface-500'
                    }`}
                  >
                    {form[key] && <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#0d1117" strokeWidth="2" strokeLinecap="round"/></svg>}
                  </div>
                  <span className="font-body text-sm text-slate-400">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleSubmit} className="px-5 py-2 bg-gold text-surface-950 rounded-lg font-display font-600 text-sm hover:bg-gold/90 transition-colors">
              {editId ? 'Update' : 'Add Application'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null) }} className="px-4 py-2 bg-surface-700 text-slate-300 rounded-lg font-body text-sm hover:bg-surface-600 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {jobs.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Briefcase size={48} className="text-slate-800 mb-4" />
          <p className="font-display font-600 text-slate-500">No applications tracked yet.</p>
          <p className="font-body text-slate-600 text-sm mt-1">Add your first job application above.</p>
        </div>
      )}

      {/* Kanban */}
      {view === 'kanban' && jobs.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {STAGES.map(stage => (
            <KanbanColumn key={stage} stage={stage} jobs={jobs} onEdit={handleEdit} onDelete={handleDelete} onMove={handleMove} />
          ))}
        </div>
      )}

      {/* List */}
      {view === 'list' && jobs.length > 0 && (
        <div className="space-y-2">
          {[...jobs].sort((a, b) => STAGES.indexOf(a.stage) - STAGES.indexOf(b.stage)).map((job, i) => {
            const c = STAGE_CFG[job.stage]
            return (
              <div
                key={job.id}
                className={`border ${c.border} bg-surface-800/30 rounded-xl px-5 py-4 flex items-center gap-4 group hover:border-surface-600 transition-all animate-slide-up`}
                style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'both' }}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-600 text-white">{job.role}</span>
                    <span className="font-body text-sm text-slate-500">@ {job.company}</span>
                    <StageBadge stage={job.stage} />
                    {job.clearance && <span className="font-mono text-[9px] px-1.5 py-0.5 bg-gold/10 text-gold rounded border border-gold/20">CLEARANCE REQ</span>}
                    {job.remote && <span className="font-mono text-[9px] px-1.5 py-0.5 bg-violet-500/10 text-violet-400 rounded border border-violet-500/20">REMOTE</span>}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    {job.location && <span className="flex items-center gap-1 font-mono text-[10px] text-slate-600"><MapPin size={9} />{job.location}</span>}
                    {job.salary && <span className="flex items-center gap-1 font-mono text-[10px] text-slate-600"><DollarSign size={9} />{job.salary}</span>}
                    {job.appliedDate && <span className="flex items-center gap-1 font-mono text-[10px] text-slate-600"><Calendar size={9} />{new Date(job.appliedDate).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {job.url && (
                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-slate-600 hover:text-accent hover:bg-accent/10 transition-all">
                      <ExternalLink size={13} />
                    </a>
                  )}
                  <button onClick={() => handleEdit(job)} className="p-1.5 rounded-lg text-slate-600 hover:text-gold hover:bg-gold/10 transition-all">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button onClick={() => handleDelete(job.id)} className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
