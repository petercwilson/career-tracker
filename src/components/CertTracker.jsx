import { useState } from 'react'
import { Plus, Award, CheckCircle2, Clock, Trash2, X, ChevronDown } from 'lucide-react'

const EMPTY_FORM = { name: '', vendor: '', examDate: '', status: 'in-progress', progress: 0, notes: '' }

function CertBadge({ status }) {
  return status === 'achieved'
    ? <span className="flex items-center gap-1.5 font-mono text-[10px] px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20"><CheckCircle2 size={10} />ACHIEVED</span>
    : <span className="flex items-center gap-1.5 font-mono text-[10px] px-2 py-1 bg-accent/10 text-accent rounded-full border border-accent/20"><Clock size={10} />IN PROGRESS</span>
}

export default function CertTracker({ certs, setCerts }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [filter, setFilter] = useState('all')

  const handleSubmit = () => {
    if (!form.name.trim()) return
    if (editId) {
      setCerts(prev => prev.map(c => c.id === editId ? { ...form, id: editId } : c))
      setEditId(null)
    } else {
      setCerts(prev => [...prev, { ...form, id: Date.now().toString() }])
    }
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  const handleEdit = (cert) => {
    setForm({ ...cert })
    setEditId(cert.id)
    setShowForm(true)
  }

  const handleDelete = (id) => setCerts(prev => prev.filter(c => c.id !== id))

  const filtered = filter === 'all' ? certs : certs.filter(c => c.status === filter)

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="font-mono text-xs text-accent tracking-widest mb-2 uppercase">Career Assets</div>
          <h1 className="font-display font-800 text-3xl text-white tracking-tight">Certifications</h1>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM) }}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-surface-950 rounded-lg font-display font-600 text-sm hover:bg-accent/90 transition-colors"
        >
          <Plus size={14} />Add Cert
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'in-progress', 'achieved'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-lg border transition-all ${
              filter === f
                ? 'bg-accent/10 text-accent border-accent/30'
                : 'text-slate-500 border-surface-700 hover:text-slate-300 hover:border-surface-600'
            }`}
          >
            {f === 'all' ? `All (${certs.length})` : f === 'in-progress' ? `Active (${certs.filter(c=>c.status==='in-progress').length})` : `Done (${certs.filter(c=>c.status==='achieved').length})`}
          </button>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="border-glow border border-accent/20 bg-surface-800/80 rounded-xl p-6 mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <span className="font-display font-600 text-white">{editId ? 'Edit Certification' : 'New Certification'}</span>
            <button onClick={() => { setShowForm(false); setEditId(null) }} className="text-slate-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase block mb-1.5">Certification Name *</label>
              <input
                className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-white font-body placeholder:text-slate-600 focus:outline-none focus:border-accent/50 transition-colors"
                placeholder="e.g. CompTIA CySA+"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase block mb-1.5">Vendor / Issuer</label>
              <input
                className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-white font-body placeholder:text-slate-600 focus:outline-none focus:border-accent/50 transition-colors"
                placeholder="e.g. CompTIA"
                value={form.vendor}
                onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))}
              />
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase block mb-1.5">Exam Date</label>
              <input
                type="date"
                className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-white font-body focus:outline-none focus:border-accent/50 transition-colors"
                value={form.examDate}
                onChange={e => setForm(p => ({ ...p, examDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase block mb-1.5">Status</label>
              <select
                className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-white font-body focus:outline-none focus:border-accent/50 transition-colors appearance-none"
                value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
              >
                <option value="in-progress">In Progress</option>
                <option value="achieved">Achieved</option>
              </select>
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase block mb-1.5">Progress ({form.progress}%)</label>
              <input
                type="range" min="0" max="100" step="5"
                className="w-full accent-[#38bdf8]"
                value={form.progress}
                onChange={e => setForm(p => ({ ...p, progress: Number(e.target.value) }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase block mb-1.5">Notes</label>
              <textarea
                rows={2}
                className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-white font-body placeholder:text-slate-600 focus:outline-none focus:border-accent/50 transition-colors resize-none"
                placeholder="Resources, strategies, etc."
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSubmit}
              className="px-5 py-2 bg-accent text-surface-950 rounded-lg font-display font-600 text-sm hover:bg-accent/90 transition-colors"
            >
              {editId ? 'Update' : 'Add Certification'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditId(null) }}
              className="px-4 py-2 bg-surface-700 text-slate-300 rounded-lg font-body text-sm hover:bg-surface-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Award size={48} className="text-slate-800 mb-4" />
          <p className="font-display font-600 text-slate-500">No certifications found.</p>
          <p className="font-body text-slate-600 text-sm mt-1">Add your first certification above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((cert, i) => {
            const daysLeft = cert.examDate
              ? Math.ceil((new Date(cert.examDate) - new Date()) / 86400000)
              : null
            return (
              <div
                key={cert.id}
                className="border-glow border border-surface-700 bg-surface-800/30 rounded-xl p-5 hover:border-surface-600 transition-all animate-slide-up group"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <span className="font-display font-700 text-white">{cert.name}</span>
                      <CertBadge status={cert.status} />
                      {cert.vendor && <span className="font-mono text-[10px] text-slate-500">{cert.vendor}</span>}
                    </div>
                    {cert.examDate && (
                      <div className="font-body text-xs text-slate-500 mb-3">
                        Exam: <span className={daysLeft !== null && daysLeft <= 14 && daysLeft >= 0 ? 'text-red-400' : 'text-slate-400'}>
                          {new Date(cert.examDate).toLocaleDateString()}
                          {daysLeft !== null && daysLeft >= 0 && ` · ${daysLeft}d away`}
                          {daysLeft !== null && daysLeft < 0 && ' · Past'}
                        </span>
                      </div>
                    )}
                    {cert.status === 'in-progress' && (
                      <div className="mt-2">
                        <div className="flex justify-between mb-1">
                          <span className="font-mono text-[10px] text-slate-600">Progress</span>
                          <span className="font-mono text-[10px] text-slate-500">{cert.progress || 0}%</span>
                        </div>
                        <div className="h-1 bg-surface-700 rounded-full overflow-hidden w-48">
                          <div className="h-full bg-gradient-to-r from-accent to-violet-400 rounded-full progress-fill" style={{ width: `${cert.progress || 0}%` }} />
                        </div>
                      </div>
                    )}
                    {cert.notes && <p className="font-body text-xs text-slate-600 mt-2 line-clamp-1">{cert.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => handleEdit(cert)} className="p-1.5 rounded-lg text-slate-500 hover:text-accent hover:bg-accent/10 transition-all">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={() => handleDelete(cert.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
