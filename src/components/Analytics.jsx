import { useMemo, useState } from 'react'
import { TrendingUp, Clock, Calendar, Award, BarChart2, Activity } from 'lucide-react'

// ── helpers ──────────────────────────────────────────────────────────────────

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    d.setHours(0, 0, 0, 0)
    return d.toISOString().split('T')[0]
  })
}

function getLast4Weeks() {
  return Array.from({ length: 4 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (3 - i) * 7)
    return d.toISOString().split('T')[0].slice(0, 7) // YYYY-MM label
  })
}

// ── Sub-components ────────────────────────────────────────────────────────────

function BarChart({ data, color = '#38bdf8', unit = 'h' }) {
  const max = Math.max(...data.map(d => d.value), 0.1)
  return (
    <div className="flex items-end gap-1.5 h-28">
      {data.map((d, i) => {
        const heightPct = (d.value / max) * 100
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            {/* Tooltip */}
            <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div className="bg-surface-700 border border-surface-600 rounded px-2 py-1 text-center whitespace-nowrap">
                <div className="font-mono text-[10px] text-white">{d.value.toFixed(1)}{unit}</div>
                <div className="font-mono text-[9px] text-slate-500">{d.label}</div>
              </div>
            </div>
            {/* Bar */}
            <div className="w-full flex-1 flex items-end">
              <div
                className="w-full rounded-t-sm transition-all duration-700 ease-out"
                style={{
                  height: `${Math.max(heightPct, d.value > 0 ? 4 : 0)}%`,
                  background: d.value > 0
                    ? `linear-gradient(to top, ${color}99, ${color})`
                    : '#1e2535',
                  boxShadow: d.value > 0 ? `0 0 8px ${color}44` : 'none',
                }}
              />
            </div>
            <span className="font-mono text-[8px] text-slate-600 truncate w-full text-center">{d.shortLabel || d.label}</span>
          </div>
        )
      })}
    </div>
  )
}

function StatTile({ label, value, sub, icon: Icon, color = 'text-accent', delay = 0 }) {
  return (
    <div
      className="border border-surface-700 bg-surface-800/30 rounded-xl p-4 animate-slide-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[9px] tracking-widest text-slate-600 uppercase">{label}</span>
        <Icon size={12} className={color} />
      </div>
      <div className={`font-display font-800 text-xl ${color}`}>{value}</div>
      {sub && <div className="font-body text-[11px] text-slate-600 mt-0.5">{sub}</div>}
    </div>
  )
}

function TagCloud({ journal }) {
  const tagCounts = useMemo(() => {
    const counts = {}
    journal.forEach(e => {
      if (!e.tags) return
      e.tags.split(',').map(t => t.trim()).filter(Boolean).forEach(t => {
        counts[t] = (counts[t] || 0) + 1
      })
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 12)
  }, [journal])

  if (!tagCounts.length) return <p className="font-body text-xs text-slate-600 py-4 text-center">No tags yet. Add tags in the Study Journal.</p>

  const max = tagCounts[0][1]
  return (
    <div className="flex flex-wrap gap-2">
      {tagCounts.map(([tag, count]) => {
        const weight = count / max
        return (
          <span
            key={tag}
            className="font-mono px-2 py-1 rounded border border-accent/20 bg-accent/5 text-accent transition-all hover:bg-accent/10"
            style={{ fontSize: `${10 + weight * 4}px`, opacity: 0.5 + weight * 0.5 }}
          >
            #{tag} <span className="text-slate-600">{count}</span>
          </span>
        )
      })}
    </div>
  )
}

function HeatmapRow({ journal }) {
  const days = useMemo(() => {
    return Array.from({ length: 35 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (34 - i))
      const key = d.toISOString().split('T')[0]
      const hrs = journal
        .filter(e => e.date === key)
        .reduce((s, e) => s + (Number(e.hours) || 0), 0)
      return { key, hrs, day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
    })
  }, [journal])

  const max = Math.max(...days.map(d => d.hrs), 0.1)

  return (
    <div className="flex gap-1 flex-wrap">
      {days.map(d => {
        const intensity = d.hrs / max
        return (
          <div key={d.key} className="relative group">
            <div
              className="w-6 h-6 rounded-sm transition-all"
              style={{
                background: d.hrs === 0
                  ? '#1e2535'
                  : `rgba(56, 189, 248, ${0.15 + intensity * 0.85})`,
                boxShadow: d.hrs > 0 ? `0 0 6px rgba(56,189,248,${intensity * 0.5})` : 'none',
              }}
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
              <div className="bg-surface-700 border border-surface-600 rounded px-2 py-1">
                <div className="font-mono text-[10px] text-white">{d.hrs.toFixed(1)}h</div>
                <div className="font-mono text-[9px] text-slate-500">{d.day}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main Analytics Component ──────────────────────────────────────────────────

export default function Analytics({ journal, certs }) {
  const [period, setPeriod] = useState('week')

  const stats = useMemo(() => {
    const total = journal.reduce((s, e) => s + (Number(e.hours) || 0), 0)
    const sessions = journal.length

    // Streak
    const dates = [...new Set(journal.map(e => e.date))].sort().reverse()
    let streak = 0
    let cur = new Date(); cur.setHours(0,0,0,0)
    for (const d of dates) {
      const day = new Date(d); day.setHours(0,0,0,0)
      if ((cur - day) / 86400000 <= 1) { streak++; cur = day } else break
    }

    // Best day
    const byDate = {}
    journal.forEach(e => { byDate[e.date] = (byDate[e.date] || 0) + (Number(e.hours) || 0) })
    const bestDay = Object.entries(byDate).sort((a, b) => b[1] - a[1])[0]

    // Avg per session
    const avg = sessions ? (total / sessions) : 0

    return { total, sessions, streak, bestDay, avg }
  }, [journal])

  const chartData = useMemo(() => {
    if (period === 'week') {
      return getLast7Days().map(date => {
        const hrs = journal.filter(e => e.date === date).reduce((s, e) => s + (Number(e.hours) || 0), 0)
        const d = new Date(date)
        return {
          label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          shortLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
          value: hrs,
        }
      })
    } else {
      return getLast4Weeks().map(week => {
        const hrs = journal
          .filter(e => e.date.startsWith(week))
          .reduce((s, e) => s + (Number(e.hours) || 0), 0)
        return { label: week, shortLabel: week.slice(5), value: hrs }
      })
    }
  }, [journal, period])

  const certStats = useMemo(() => ({
    achieved: certs.filter(c => c.status === 'achieved').length,
    inProgress: certs.filter(c => c.status === 'in-progress').length,
    total: certs.length,
  }), [certs])

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="font-mono text-xs text-emerald-400 tracking-widest mb-2 uppercase">Intelligence Layer</div>
        <h1 className="font-display font-800 text-3xl text-white tracking-tight">Analytics</h1>
        <p className="font-body text-slate-500 text-sm mt-1">Study patterns and performance metrics</p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatTile label="Total Hours" value={stats.total.toFixed(1)} sub="all time" icon={Clock} color="text-accent" delay={0} />
        <StatTile label="Sessions" value={stats.sessions} sub="journal entries" icon={Activity} color="text-gold" delay={60} />
        <StatTile label="Study Streak" value={`${stats.streak}d`} sub="consecutive days" icon={TrendingUp} color="text-violet-400" delay={120} />
        <StatTile label="Avg / Session" value={`${stats.avg.toFixed(1)}h`} sub="per entry" icon={BarChart2} color="text-emerald-400" delay={180} />
      </div>

      {/* Hours chart */}
      <div className="border border-surface-700 bg-surface-800/30 rounded-xl p-6 mb-6 animate-slide-up" style={{ animationDelay: '240ms', animationFillMode: 'both' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <BarChart2 size={14} className="text-accent" />
            <span className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">Hours Studied</span>
          </div>
          <div className="flex gap-1">
            {['week', 'month'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`font-mono text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-lg border transition-all ${
                  period === p ? 'bg-accent/10 text-accent border-accent/30' : 'text-slate-600 border-surface-700 hover:text-slate-400'
                }`}
              >
                {p === 'week' ? '7D' : '4W'}
              </button>
            ))}
          </div>
        </div>
        {journal.length > 0
          ? <BarChart data={chartData} color="#38bdf8" />
          : <div className="h-28 flex items-center justify-center">
              <p className="font-body text-xs text-slate-700">Log study sessions to see your chart.</p>
            </div>
        }
      </div>

      {/* 2-col: heatmap + cert breakdown */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">

        {/* Activity Heatmap */}
        <div className="border border-surface-700 bg-surface-800/30 rounded-xl p-6 animate-slide-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
          <div className="flex items-center gap-2 mb-5">
            <Calendar size={14} className="text-gold" />
            <span className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">Activity · Last 35 Days</span>
          </div>
          <HeatmapRow journal={journal} />
          <div className="flex items-center gap-2 mt-3">
            <span className="font-mono text-[9px] text-slate-700">Less</span>
            {[0.1, 0.3, 0.55, 0.75, 1].map(o => (
              <div key={o} className="w-4 h-4 rounded-sm" style={{ background: `rgba(56,189,248,${o})` }} />
            ))}
            <span className="font-mono text-[9px] text-slate-700">More</span>
          </div>
        </div>

        {/* Cert breakdown */}
        <div className="border border-surface-700 bg-surface-800/30 rounded-xl p-6 animate-slide-up" style={{ animationDelay: '360ms', animationFillMode: 'both' }}>
          <div className="flex items-center gap-2 mb-5">
            <Award size={14} className="text-emerald-400" />
            <span className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">Certification Breakdown</span>
          </div>
          {certStats.total > 0 ? (
            <>
              {/* Simple donut-style bar */}
              <div className="flex h-3 rounded-full overflow-hidden mb-4 gap-0.5">
                {certStats.achieved > 0 && (
                  <div
                    className="bg-emerald-400 transition-all duration-700"
                    style={{ width: `${(certStats.achieved / certStats.total) * 100}%` }}
                  />
                )}
                {certStats.inProgress > 0 && (
                  <div
                    className="bg-accent transition-all duration-700"
                    style={{ width: `${(certStats.inProgress / certStats.total) * 100}%` }}
                  />
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-body text-sm text-slate-300">Achieved</span>
                  </div>
                  <span className="font-mono text-sm text-emerald-400">{certStats.achieved}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <span className="font-body text-sm text-slate-300">In Progress</span>
                  </div>
                  <span className="font-mono text-sm text-accent">{certStats.inProgress}</span>
                </div>
                <div className="flex items-center justify-between border-t border-surface-700 pt-3">
                  <span className="font-body text-sm text-slate-500">Total Tracked</span>
                  <span className="font-mono text-sm text-white">{certStats.total}</span>
                </div>
                {stats.bestDay && (
                  <div className="border-t border-surface-700 pt-3">
                    <span className="font-mono text-[9px] tracking-widest text-slate-600 uppercase block mb-1">Best Study Day</span>
                    <span className="font-body text-sm text-gold">{new Date(stats.bestDay[0]).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                    <span className="font-mono text-xs text-slate-500 ml-2">{stats.bestDay[1].toFixed(1)}h</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <Award size={32} className="text-slate-800 mx-auto mb-3" />
              <p className="font-body text-xs text-slate-600">No certifications tracked yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Tag cloud */}
      <div className="border border-surface-700 bg-surface-800/30 rounded-xl p-6 animate-slide-up" style={{ animationDelay: '420ms', animationFillMode: 'both' }}>
        <div className="flex items-center gap-2 mb-5">
          <Activity size={14} className="text-violet-400" />
          <span className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">Topic Distribution</span>
        </div>
        <TagCloud journal={journal} />
      </div>
    </div>
  )
}
