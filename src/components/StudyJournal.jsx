import { useState } from 'react'
import { Plus, BookOpen, Trash2, X, Clock, Calendar, Tag } from 'lucide-react'

const today = () => new Date().toISOString().split('T')[0]
const EMPTY = { topic: '', hours: '', date: today(), notes: '', tags: '' }

export default function StudyJournal({ journal, setJournal }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [search, setSearch] = useState('')

  const handleSubmit = () => {
    if (!form.topic.trim() || !form.hours) return
    if (editId) {
      setJournal(prev => prev.map(e => e.id === editId ? { ...form, id: editId } : e))
      setEditId(null)
    } else {
      setJournal(prev => [...prev, { ...form, id: Date.now().toString() }])
    }
    setForm(EMPTY)
    setShowForm(false)
  }

  const handleEdit = (entry) => {
    setForm({ ...entry })
    setEditId(entry.id)
    setShowForm(true)
  }

  const handleDelete = (id) => setJournal(prev => prev.filter(e => e.id !== id))

  const totalHours = journal.reduce((s, e) => s + (Number(e.hours) || 0), 0)

  const grouped = [...journal]
    .filter(e => !search || e.topic.toLowerCase().includes(search.toLowerCase()) || (e.notes && e.notes.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .reduce((acc, entry) => {
      const label = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
      if (!acc[label]) acc[label] = []
      acc[label].push(entry)
      return acc
    }, {})

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="font-mono text-xs text-gold tracking-widest mb-2 uppercase">Knowledge Log</div>
          <h1 className="font-display font-800 text-3xl text-white tracking-tight">Study Journal</h1>
          <p className="font-body text-slate-500 text-sm mt-1">
            <span className="text-gold font-mono">{totalHours.toFixed(1)}h</span> total · <span className="text-slate-400">{journal.length} entries</span>
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm({ ...EMPTY, date: today() }) }}
          className="flex items-center gap-2 px-4 py-2 bg-gold text-surface-950 rounded-lg font-display font-600 text-sm hover:bg-gold/90 transition-colors"
        >
          <Plus size={14} />Log Session
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <input
          className="w-full bg-surface-800 border border-surface-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white font-body placeholder:text-slate-600 focus:outline-none focus:border-gold/40 transition-colors"
          placeholder="Search topics or notes…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="border-glow border border-gold/20 bg-surface-800/80 rounded-xl p-6 mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <span className="font-display font-600 text-white">{editId ? 'Edit Session' : 'Log Study Session'}</span>
            <button onClick={() => { setShowForm(false); setEditId(null) }} className="text-slate-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase block mb-1.5">Topic / Subject *</label>
              <input
                className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-white font-body placeholder:text-slate-600 focus:outline-none focus:border-gold/40 transition-colors"
                placeholder="e.g. TCP/IP Subnetting, SIEM Query Language"
                value={form.topic}
                onChange={e => setForm(p => ({ ...p, topic: e.target.value }))}
              />
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase block mb-1.5">Hours Studied *</label>
              <input
                type="number" min="0.25" max="24" step="0.25"
                className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-white font-body focus:outline-none focus:border-gold/40 transition-colors"
                placeholder="e.g. 1.5"
                value={form.hours}
                onChange={e => setForm(p => ({ ...p, hours: e.target.value }))}
              />
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase block mb-1.5">Date</label>
              <input
                type="date"
                className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-white font-body focus:outline-none focus:border-gold/40 transition-colors"
                value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              />
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase block mb-1.5">Tags (comma-separated)</label>
              <input
                className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-white font-body placeholder:text-slate-600 focus:outline-none focus:border-gold/40 transition-colors"
                placeholder="e.g. CCNA, subnetting, lab"
                value={form.tags}
                onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
              />
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase block mb-1.5">Notes</label>
              <textarea
                rows={2}
                className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-white font-body placeholder:text-slate-600 focus:outline-none focus:border-gold/40 transition-colors resize-none"
                placeholder="Key takeaways, links, struggles..."
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSubmit}
              className="px-5 py-2 bg-gold text-surface-950 rounded-lg font-display font-600 text-sm hover:bg-gold/90 transition-colors"
            >
              {editId ? 'Update' : 'Log Session'}
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

      {/* Grouped entries */}
      {Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen size={48} className="text-slate-800 mb-4" />
          <p className="font-display font-600 text-slate-500">
            {search ? 'No entries match your search.' : 'No study sessions yet.'}
          </p>
          {!search && <p className="font-body text-slate-600 text-sm mt-1">Log your first session above.</p>}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, entries]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <div className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">{date}</div>
                <div className="flex-1 h-px bg-surface-700" />
                <div className="font-mono text-[10px] text-gold">
                  {entries.reduce((s, e) => s + (Number(e.hours) || 0), 0).toFixed(1)}h
                </div>
              </div>
              <div className="space-y-2">
                {entries.map((entry, i) => (
                  <div
                    key={entry.id}
                    className="border border-surface-700 bg-surface-800/30 rounded-xl px-5 py-4 hover:border-surface-600 transition-all group animate-slide-up"
                    style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'both' }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-display font-600 text-white">{entry.topic}</span>
                          <span className="flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 bg-gold/10 text-gold rounded border border-gold/20">
                            <Clock size={9} />{entry.hours}h
                          </span>
                        </div>
                        {entry.tags && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {entry.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                              <span key={tag} className="font-mono text-[9px] px-1.5 py-0.5 bg-surface-700 text-slate-500 rounded tracking-wider">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {entry.notes && (
                          <p className="font-body text-xs text-slate-500 mt-2 leading-relaxed">{entry.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button onClick={() => handleEdit(entry)} className="p-1.5 rounded-lg text-slate-600 hover:text-gold hover:bg-gold/10 transition-all">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button onClick={() => handleDelete(entry.id)} className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-all">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
