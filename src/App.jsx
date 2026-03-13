import { useState, useCallback } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { ToastProvider, useToast } from './hooks/useToast.jsx'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import CertTracker from './components/CertTracker'
import StudyJournal from './components/StudyJournal'
import GoalsRoadmap from './components/GoalsRoadmap'
import Analytics from './components/Analytics'
import Settings from './components/Settings'
import JobTracker from './components/JobTracker'
import InstallPrompt from './components/InstallPrompt'
import CommandPalette from './components/CommandPalette'

// ── Seed data ─────────────────────────────────────────────────────────────────

const DEFAULT_CERTS = [
  { id: '1', name: 'CompTIA Security+',  vendor: 'CompTIA', examDate: '', status: 'achieved',    progress: 100, notes: 'Completed. DoD 8570 IAT II baseline.' },
  { id: '2', name: 'CompTIA CySA+',      vendor: 'CompTIA', examDate: '', status: 'in-progress', progress: 35,  notes: 'Using Jason Dion + Professor Messer.' },
  { id: '3', name: 'Cisco CCNA 200-301', vendor: 'Cisco',   examDate: '', status: 'in-progress', progress: 55,  notes: 'Lab work via CCNA::TERMINAL project.' },
  { id: '4', name: 'Jamf 100',           vendor: 'Jamf',    examDate: '', status: 'in-progress', progress: 70,  notes: 'Interactive HTML study tools in progress.' },
]
const DEFAULT_JOURNAL = [
  { id: '10', topic: 'Subnetting with Magic Numbers',          hours: '2',   date: new Date().toISOString().split('T')[0],                         notes: 'Practiced VLSM and CIDR. Solid on /24-/30.',     tags: 'CCNA, subnetting' },
  { id: '11', topic: 'Threat Hunting - MITRE ATT&CK',          hours: '1.5', date: new Date(Date.now()-86400000).toISOString().split('T')[0],      notes: 'Lateral movement and persistence TTPs.',          tags: 'CySA+, threat-hunting' },
  { id: '12', topic: 'Jamf 100 - Enrollment Profiles',         hours: '1',   date: new Date(Date.now()-86400000*2).toISOString().split('T')[0],   notes: 'MDM profiles, DEP, and supervised mode.',        tags: 'Jamf, MDM' },
  { id: '13', topic: 'SOC Analyst - SIEM Query Practice',      hours: '2.5', date: new Date(Date.now()-86400000*3).toISOString().split('T')[0],   notes: 'Splunk SPL and Elastic KQL lab work.',           tags: 'CySA+, SIEM, SOC' },
  { id: '14', topic: 'AWS IAM - Roles and Policies Deep Dive', hours: '1.5', date: new Date(Date.now()-86400000*5).toISOString().split('T')[0],   notes: 'Least privilege principles for cloud security.', tags: 'AWS, IAM, cloud' },
]
const DEFAULT_GOALS = [
  { id: 'g1', title: 'Earn CompTIA Security+',         phase: 'Foundation',   description: 'DoD 8570 baseline cert.',              targetDate: '', completed: true,  priority: 'high' },
  { id: 'g2', title: 'Pass Jamf 100 Certification',   phase: 'Foundation',   description: 'Apple MDM for school IT environment.',  targetDate: '', completed: false, priority: 'medium' },
  { id: 'g3', title: 'Earn CompTIA CySA+',            phase: 'Intermediate', description: 'SOC analyst pathway, DoD 8570 IAT II.', targetDate: '', completed: false, priority: 'high' },
  { id: 'g4', title: 'Complete Cisco CCNA 200-301',   phase: 'Intermediate', description: 'Networking depth for IT Admin roles.',  targetDate: '', completed: false, priority: 'high' },
  { id: 'g5', title: 'Land SOC Analyst Role (SoCal)', phase: 'Advanced',     description: 'Defense contractor, ITAR environment.', targetDate: '', completed: false, priority: 'high' },
  { id: 'g6', title: 'Earn CISSP',                   phase: 'Expert',       description: 'Long-term — requires 5yr experience.',  targetDate: '', completed: false, priority: 'low' },
]
const DEFAULT_JOBS = [
  { id: 'j1', company: 'Northrop Grumman', role: 'IT Systems Admin',  location: 'El Segundo, CA',  url: '', stage: 'Wishlist',  appliedDate: '', salary: '$75k-$90k', notes: 'Posted on LinkedIn. Req TS/SCI.', clearance: true, remote: false },
  { id: 'j2', company: 'Raytheon',         role: 'SOC Analyst I',      location: 'El Segundo, CA',  url: '', stage: 'Applied',   appliedDate: new Date(Date.now()-86400000*5).toISOString().split('T')[0], salary: '$70k-$85k', notes: 'Applied via Indeed.', clearance: false, remote: false },
  { id: 'j3', company: 'SAIC',             role: 'Cyber Security Analyst', location: 'San Diego, CA', url: '', stage: 'Interview', appliedDate: new Date(Date.now()-86400000*12).toISOString().split('T')[0], salary: '$80k-$100k', notes: 'Phone screen scheduled.', clearance: true, remote: true },
]

// ── Inner app (needs toast context) ──────────────────────────────────────────

function AppInner() {
  const toast = useToast()
  const [certs,   setCerts]   = useLocalStorage('careeros:certs',   DEFAULT_CERTS)
  const [journal, setJournal] = useLocalStorage('careeros:journal', DEFAULT_JOURNAL)
  const [goals,   setGoals]   = useLocalStorage('careeros:goals',   DEFAULT_GOALS)
  const [jobs,    setJobs]    = useLocalStorage('careeros:jobs',    DEFAULT_JOBS)
  const [view,    setView]    = useLocalStorage('careeros:view',    'dashboard')
  const [mobileOpen, setMobileOpen]     = useState(false)
  const [paletteOpen, setPaletteOpen]   = useState(false)
  const [pendingAction, setPendingAction] = useState(null)

  const handleNavigate = useCallback((v) => {
    setView(v)
    setMobileOpen(false)
    setPaletteOpen(false)
  }, [setView])

  const handleAction = useCallback((action) => {
    setPendingAction(action)
    setTimeout(() => setPendingAction(null), 100)
  }, [])

  const handleMobileToggle = (val) => setMobileOpen(typeof val === 'boolean' ? val : p => !p)

  // Wrapped setters that fire toasts
  const handleSetCerts = useCallback((v) => {
    setCerts(v)
    toast.success('Certifications updated')
  }, [setCerts, toast])

  const handleSetJournal = useCallback((v) => {
    setJournal(v)
    toast.success('Journal updated')
  }, [setJournal, toast])

  const handleSetGoals = useCallback((v) => {
    setGoals(v)
    toast.success('Goals updated')
  }, [setGoals, toast])

  const handleSetJobs = useCallback((v) => {
    setJobs(v)
    toast.success('Pipeline updated')
  }, [setJobs, toast])

  useKeyboardShortcuts({
    onOpenPalette: () => setPaletteOpen(p => !p),
    onNavigate: handleNavigate,
    onAction: handleAction,
  })

  return (
    <div className="min-h-screen bg-surface-950 noise-bg grid-lines flex">
      <Sidebar
        active={view}
        onNavigate={handleNavigate}
        mobileOpen={mobileOpen}
        onMobileToggle={handleMobileToggle}
        onOpenPalette={() => setPaletteOpen(true)}
      />

      <main className="flex-1 min-w-0 pt-14 lg:pt-0 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {view === 'dashboard' && <Dashboard certs={certs} journal={journal} goals={goals} />}
          {view === 'certs'     && <CertTracker certs={certs} setCerts={handleSetCerts} />}
          {view === 'journal'   && <StudyJournal journal={journal} setJournal={handleSetJournal} />}
          {view === 'goals'     && <GoalsRoadmap goals={goals} setGoals={handleSetGoals} />}
          {view === 'analytics' && <Analytics journal={journal} certs={certs} />}
          {view === 'jobs'      && <JobTracker jobs={jobs} setJobs={handleSetJobs} forceOpenForm={pendingAction === 'openForm'} />}
          {view === 'settings'  && (
            <Settings
              certs={certs}     setCerts={setCerts}
              journal={journal} setJournal={setJournal}
              goals={goals}     setGoals={setGoals}
              jobs={jobs}       setJobs={setJobs}
            />
          )}
        </div>
      </main>

      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNavigate={handleNavigate}
        onAction={handleAction}
        certs={certs}
        journal={journal}
      />

      <InstallPrompt />
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  )
}
