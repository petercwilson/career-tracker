import { TrendingUp, Target, Clock, Award, BookOpen, ChevronRight, Flame } from 'lucide-react'

function StatCard({ label, value, sub, icon: Icon, accent = 'accent', delay = 0 }) {
  const colors = {
    accent: { border: 'border-accent/20', bg: 'bg-accent/5', icon: 'text-accent', val: 'text-gradient' },
    gold:   { border: 'border-gold/20',   bg: 'bg-gold/5',   icon: 'text-gold',   val: 'text-gradient-gold' },
    violet: { border: 'border-violet-500/20', bg: 'bg-violet-500/5', icon: 'text-violet-400', val: 'text-violet-300' },
    emerald:{ border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', icon: 'text-emerald-400', val: 'text-emerald-300' },
  }
  const c = colors[accent]
  return (
    <div
      className={`border-glow border ${c.border} ${c.bg} rounded-xl p-5 animate-slide-up`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">{label}</span>
        <Icon size={14} className={c.icon} />
      </div>
      <div className={`font-display font-800 text-2xl mb-1 ${c.val}`}>{value}</div>
      {sub && <div className="font-body text-xs text-slate-500">{sub}</div>}
    </div>
  )
}

function ProgressBar({ label, pct, color = 'bg-accent' }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="font-body text-sm text-slate-300">{label}</span>
        <span className="font-mono text-xs text-slate-500">{pct}%</span>
      </div>
      <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full progress-fill`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function Dashboard({ certs, journal, goals = [] }) {
  const inProgress  = certs.filter(c => c.status === 'in-progress')
  const achieved    = certs.filter(c => c.status === 'achieved')
  const nextGoal    = inProgress[0] || null

  const totalHours  = journal.reduce((sum, e) => sum + (Number(e.hours) || 0), 0)
  const thisWeek    = (() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 7)
    return journal
      .filter(e => new Date(e.date) >= cutoff)
      .reduce((sum, e) => sum + (Number(e.hours) || 0), 0)
  })()

  const streakDays  = (() => {
    if (!journal.length) return 0
    const dates = [...new Set(journal.map(e => e.date))].sort().reverse()
    let streak = 0
    let current = new Date()
    current.setHours(0, 0, 0, 0)
    for (const d of dates) {
      const day = new Date(d)
      day.setHours(0, 0, 0, 0)
      if ((current - day) / 86400000 <= 1) { streak++; current = day } else break
    }
    return streak
  })()

  const nextExam = certs
    .filter(c => c.examDate && c.status === 'in-progress')
    .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))[0]

  const daysUntilExam = nextExam
    ? Math.ceil((new Date(nextExam.examDate) - new Date()) / 86400000)
    : null

  const recentEntries = [...journal].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="font-mono text-xs text-accent tracking-widest mb-2 uppercase">Mission Control</div>
        <h1 className="font-display font-800 text-3xl text-white tracking-tight">Dashboard</h1>
        <p className="font-body text-slate-500 mt-1 text-sm">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard label="Total Hours" value={totalHours.toFixed(1)} sub="all time" icon={Clock} accent="accent" delay={0} />
        <StatCard label="This Week" value={thisWeek.toFixed(1)}  sub="hours logged" icon={TrendingUp} accent="gold" delay={60} />
        <StatCard label="Streak" value={`${streakDays}d`} sub="consecutive days" icon={Flame} accent="violet" delay={120} />
        <StatCard label="Achieved" value={achieved.length} sub={`of ${certs.length} certs`} icon={Award} accent="emerald" delay={180} />
      </div>

      {/* Main content: 2-col on lg */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Next Goal */}
        <div className="border-glow border border-surface-700 bg-surface-800/50 rounded-xl p-6 animate-slide-up" style={{ animationDelay: '240ms', animationFillMode: 'both' }}>
          <div className="flex items-center gap-2 mb-5">
            <Target size={14} className="text-accent" />
            <span className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">Next Goal</span>
          </div>
          {nextGoal ? (
            <>
              <h2 className="font-display font-700 text-xl text-white mb-1">{nextGoal.name}</h2>
              <div className="flex items-center gap-2 mb-5">
                <span className="font-mono text-xs px-2 py-0.5 bg-accent/10 text-accent rounded border border-accent/20">
                  {nextGoal.vendor || 'Certification'}
                </span>
                {daysUntilExam !== null && daysUntilExam >= 0 && (
                  <span className={`font-mono text-xs px-2 py-0.5 rounded border ${daysUntilExam <= 14 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-gold/10 text-gold border-gold/20'}`}>
                    {daysUntilExam === 0 ? 'TODAY' : `${daysUntilExam}d to exam`}
                  </span>
                )}
              </div>
              {nextGoal.progress !== undefined && (
                <ProgressBar label="Progress" pct={nextGoal.progress || 0} color="bg-gradient-to-r from-accent to-violet-400" />
              )}
              {nextGoal.examDate && (
                <div className="font-body text-xs text-slate-500 mt-3">
                  Exam: <span className="text-slate-300">{new Date(nextGoal.examDate).toLocaleDateString()}</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Award size={32} className="text-slate-700 mb-3" />
              <p className="font-body text-slate-500 text-sm">No active certifications.</p>
              <p className="font-body text-slate-600 text-xs mt-1">Add one in the Certifications tab.</p>
            </div>
          )}
        </div>

        {/* Study progress */}
        <div className="border-glow border border-surface-700 bg-surface-800/50 rounded-xl p-6 animate-slide-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
          <div className="flex items-center gap-2 mb-5">
            <BookOpen size={14} className="text-gold" />
            <span className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">Recent Sessions</span>
          </div>
          {recentEntries.length > 0 ? (
            <div className="space-y-2">
              {recentEntries.map((entry, i) => (
                <div key={entry.id} className="flex items-start gap-3 py-2.5 border-b border-surface-700/50 last:border-0" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="font-mono text-[10px] text-slate-600 pt-0.5 w-16 shrink-0">
                    {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-body text-sm text-slate-300 truncate">{entry.topic}</div>
                    {entry.notes && <div className="font-body text-xs text-slate-600 truncate mt-0.5">{entry.notes}</div>}
                  </div>
                  <div className="font-mono text-xs text-gold shrink-0">{entry.hours}h</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BookOpen size={32} className="text-slate-700 mb-3" />
              <p className="font-body text-slate-500 text-sm">No study sessions yet.</p>
              <p className="font-body text-slate-600 text-xs mt-1">Log your first session in the Journal tab.</p>
            </div>
          )}
        </div>

      </div>

      {/* Goals summary strip */}
      {goals.length > 0 && (
        <div className="mt-6 border border-surface-700 bg-surface-800/30 rounded-xl p-5 animate-slide-up" style={{ animationDelay: "360ms", animationFillMode: "both" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">Goals Roadmap</span>
            <span className="font-mono text-[10px] text-violet-400">{goals.filter(g => g.completed).length}/{goals.length} milestones</span>
          </div>
          <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden mb-4">
            <div className="h-full rounded-full progress-fill bg-gradient-to-r from-emerald-400 via-accent to-violet-400" style={{ width: `${goals.length ? Math.round(goals.filter(g=>g.completed).length/goals.length*100) : 0}%` }} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {["Foundation","Intermediate","Advanced","Expert"].map(phase => {
              const pg = goals.filter(g => g.phase === phase)
              const done = pg.filter(g => g.completed).length
              const colors = { Foundation:"text-emerald-400", Intermediate:"text-accent", Advanced:"text-violet-400", Expert:"text-gold" }
              return (
                <div key={phase} className="text-center border border-surface-700 rounded-lg py-2.5">
                  <div className={`font-mono text-sm font-bold ${colors[phase]}`}>{done}/{pg.length}</div>
                  <div className="font-body text-[10px] text-slate-600 mt-0.5">{phase}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
