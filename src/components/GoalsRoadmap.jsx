import { useState } from 'react'
import { Plus, Target, ChevronRight, Trash2, X, GripVertical, CheckCircle2, Circle, ArrowRight, Flag } from 'lucide-react'

const PHASES = ['Foundation', 'Intermediate', 'Advanced', 'Expert']
const PHASE_COLORS = {
  Foundation:   { border: 'border-emerald-500/30', bg: 'bg-emerald-500/5',  dot: 'bg-emerald-400',  text: 'text-emerald-400',  badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  Intermediate: { border: 'border-accent/30',       bg: 'bg-accent/5',       dot: 'bg-accent',        text: 'text-accent',        badge: 'bg-accent/10 text-accent border-accent/20' },
  Advanced:     { border: 'border-violet-500/30',   bg: 'bg-violet-500/5',   dot: 'bg-violet-400',   text: 'text-violet-400',   badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  Expert:       { border: 'border-gold/30',          bg: 'bg-gold/5',         dot: 'bg-gold',          text: 'text-gold',          badge: 'bg-gold/10 text-gold border-gold/20' },
}

const EMPTY_GOAL = { title: '', phase: 'Foundation', description: '', targetDate: '', completed: false, priority: 'medium' }

function GoalCard({ goal, onToggle, onDelete, onEdit, index }) {
  const c = PHASE_COLORS[goal.phase] || PHASE_COLORS.Foundation
  const daysLeft = goal.targetDate
    ? Math.ceil((new Date(goal.targetDate) - new Date()) / 86400000)
    : null
  return (
    <div
      className={`border ${c.border} ${c.bg} rounded-xl p-4 group transition-all hover:scale-[1.01] animate-slide-up`}
      style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'both' }}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(goal.id)}
          className="mt-0.5 shrink-0 transition-transform hover:scale-110"
        >
          {goal.completed
            ? <CheckCircle2 size={18} className={c.text} />
            : <Circle size={18} className="text-slate-600 hover:text-slate-400" />
          }
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-display font-600 text-sm ${goal.completed ? 'line-through text-slate-500' : 'text-white'}`}>
              {goal.title}
            </span>
            <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border ${c.badge}`}>{goal.phase}</span>
            {goal.priority === 'high' && (
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border bg-red-500/10 text-red-400 border-red-500/20">HIGH</span>
            )}
          </div>
          {goal.description && (
            <p className="font-body text-xs text-slate-500 mt-1 leading-relaxed">{goal.description}</p>
          )}
          {goal.targetDate && (
            <div className="font-mono text-[10px] mt-2">
              {daysLeft !== null && daysLeft >= 0
                ? <span className={daysLeft <= 14 ? 'text-red-400' : 'text-slate-500'}>
                    {daysLeft === 0 ? '🎯 Due today' : `${daysLeft}d remaining`} · {new Date(goal.targetDate).toLocaleDateString()}
                  </span>
                : <span className="text-slate-600">{new Date(goal.targetDate).toLocaleDateString()} · Past due</span>
              }
            </div>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => onEdit(goal)} className="p-1.5 rounded-lg text-slate-600 hover:text-accent hover:bg-accent/10 transition-all">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button onClick={() => onDelete(goal.id)} className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-all">
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function GoalsRoadmap({ goals, setGoals }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_GOAL)
  const [editId, setEditId] = useState(null)
  const [activePhase, setActivePhase] = useState('all')

  const handleSubmit = () => {
    if (!form.title.trim()) return
    if (editId) {
      setGoals(prev => prev.map(g => g.id === editId ? { ...form, id: editId } : g))
      setEditId(null)
    } else {
      setGoals(prev => [...prev, { ...form, id: Date.now().toString() }])
    }
    setForm(EMPTY_GOAL)
    setShowForm(false)
  }

  const handleEdit = (goal) => { setForm({ ...goal }); setEditId(goal.id); setShowForm(true) }
  const handleDelete = (id) => setGoals(prev => prev.filter(g => g.id !== id))
  const handleToggle = (id) => setGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g))

  const completed = goals.filter(g => g.completed).length
  const pct = goals.length ? Math.round((completed / goals.length) * 100) : 0

  const filtered = activePhase === 'all' ? goals : goals.filter(g => g.phase === activePhase)

  // Group by phase for roadmap view
  const byPhase = PHASES.reduce((acc, p) => {
    acc[p] = filtered.filter(g => g.phase === p)
    return acc
  }, {})

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="font-mono text-xs text-violet-400 tracking-widest mb-2 uppercase">Career Trajectory</div>
          <h1 className="font-display font-800 text-3xl text-white tracking-tight">Goals Roadmap</h1>
          <p className="font-body text-slate-500 text-sm mt-1">
            <span className="text-violet-400 font-mono">{completed}/{goals.length}</span> milestones complete
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_GOAL) }}
          className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg font-display font-600 text-sm hover:bg-violet-400 transition-colors"
        >
          <Plus size={14} />Add Goal
        </button>
      </div>

      {/* Overall progress bar */}
      <div className="border border-surface-700 bg-surface-800/30 rounded-xl p-5 mb-6 animate-slide-up" style={{ animationFillMode: 'both' }}>
        <div className="flex justify-between items-center mb-3">
          <span className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">Overall Progress</span>
          <span className="font-mono text-sm text-violet-400">{pct}%</span>
        </div>
        <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full progress-fill bg-gradient-to-r from-emerald-400 via-accent to-violet-400"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between mt-3">
          {PHASES.map(p => {
            const phaseGoals = goals.filter(g => g.phase === p)
            const phaseDone  = phaseGoals.filter(g => g.completed).length
            const c = PHASE_COLORS[p]
            return (
              <div key={p} className="text-center">
                <div className={`font-mono text-[9px] ${c.text}`}>{p.slice(0,4).toUpperCase()}</div>
                <div className="font-mono text-[10px] text-slate-500">{phaseDone}/{phaseGoals.length}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Phase filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', ...PHASES].map(p => {
          const c = p !== 'all' ? PHASE_COLORS[p] : null
          const count = p === 'all' ? goals.length : goals.filter(g => g.phase === p).length
          return (
            <button
              key={p}
              onClick={() => setActivePhase(p)}
              className={`font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-lg border transition-all ${
                activePhase === p
                  ? c ? `${c.badge}` : 'bg-surface-700 text-white border-surface-600'
                  : 'text-slate-500 border-surface-700 hover:text-slate-300'
              }`}
            >
              {p === 'all' ? `All (${count})` : `${p} (${count})`}
            </button>
          )
        })}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="border-glow border border-violet-500/20 bg-surface-800/80 rounded-xl p-6 mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <span className="font-display font-600 text-white">{editId ? 'Edit Goal' : 'New Career Goal'}</span>
            <button onClick={() => { setShowForm(false); setEditId(null) }} className="text-slate-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase block mb-1.5">Goal Title *</label>
              <input
                className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-white font-body placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                placeholder="e.g. Land SOC Analyst role at defense contractor"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase block mb-1.5">Phase</label>
              <select
                className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-white font-body focus:outline-none focus:border-violet-500/50 transition-colors appearance-none"
                value={form.phase}
                onChange={e => setForm(p => ({ ...p, phase: e.target.value }))}
              >
                {PHASES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase block mb-1.5">Priority</label>
              <select
                className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-white font-body focus:outline-none focus:border-violet-500/50 transition-colors appearance-none"
                value={form.priority}
                onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase block mb-1.5">Target Date</label>
              <input
                type="date"
                className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-white font-body focus:outline-none focus:border-violet-500/50 transition-colors"
                value={form.targetDate}
                onChange={e => setForm(p => ({ ...p, targetDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase block mb-1.5">Status</label>
              <div className="flex items-center gap-3 h-10">
                <button
                  onClick={() => setForm(p => ({ ...p, completed: !p.completed }))}
                  className="flex items-center gap-2 font-body text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {form.completed
                    ? <CheckCircle2 size={16} className="text-emerald-400" />
                    : <Circle size={16} className="text-slate-600" />
                  }
                  {form.completed ? 'Completed' : 'In Progress'}
                </button>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase block mb-1.5">Description</label>
              <textarea
                rows={2}
                className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-white font-body placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                placeholder="What does achieving this look like?"
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleSubmit} className="px-5 py-2 bg-violet-500 text-white rounded-lg font-display font-600 text-sm hover:bg-violet-400 transition-colors">
              {editId ? 'Update' : 'Add Goal'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null) }} className="px-4 py-2 bg-surface-700 text-slate-300 rounded-lg font-body text-sm hover:bg-surface-600 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Roadmap: phase columns on lg, stacked list on mobile */}
      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Flag size={48} className="text-slate-800 mb-4" />
          <p className="font-display font-600 text-slate-500">No goals yet.</p>
          <p className="font-body text-slate-600 text-sm mt-1">Map your career trajectory above.</p>
        </div>
      ) : activePhase === 'all' ? (
        /* Grid roadmap when showing all phases */
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {PHASES.map(phase => {
            const c = PHASE_COLORS[phase]
            const phaseGoals = byPhase[phase] || []
            const donePct = phaseGoals.length ? Math.round(phaseGoals.filter(g => g.completed).length / phaseGoals.length * 100) : 0
            return (
              <div key={phase} className={`border ${c.border} rounded-xl overflow-hidden`}>
                {/* Phase header */}
                <div className={`px-4 py-3 ${c.bg} border-b ${c.border} flex items-center justify-between`}>
                  <div>
                    <div className={`font-display font-700 text-sm ${c.text}`}>{phase}</div>
                    <div className="font-mono text-[9px] text-slate-600 mt-0.5">{donePct}% complete</div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                </div>
                {/* Goals in this phase */}
                <div className="p-3 space-y-2 min-h-24">
                  {phaseGoals.length === 0 ? (
                    <div className="py-6 text-center">
                      <p className="font-body text-[11px] text-slate-700">No goals in this phase</p>
                    </div>
                  ) : (
                    phaseGoals.map((goal, i) => (
                      <GoalCard key={goal.id} goal={goal} index={i} onToggle={handleToggle} onDelete={handleDelete} onEdit={handleEdit} />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List view for filtered phase */
        <div className="space-y-3">
          {filtered.map((goal, i) => (
            <GoalCard key={goal.id} goal={goal} index={i} onToggle={handleToggle} onDelete={handleDelete} onEdit={handleEdit} />
          ))}
        </div>
      )}
    </div>
  )
}
