import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('careeros:installDismissed') === 'true'
  })

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      if (!dismissed) setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [dismissed])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setShow(false)
  }

  const handleDismiss = () => {
    setShow(false)
    setDismissed(true)
    localStorage.setItem('careeros:installDismissed', 'true')
  }

  if (!show) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 animate-slide-up">
      <div className="border-glow border border-accent/30 bg-surface-900/95 backdrop-blur rounded-xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
            <Smartphone size={16} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-700 text-sm text-white">Install CareerOS</div>
            <div className="font-body text-xs text-slate-500 mt-0.5">Add to home screen for offline access and a native app feel.</div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleInstall}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-surface-950 rounded-lg font-display font-600 text-xs hover:bg-accent/90 transition-colors"
              >
                <Download size={11} />Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 bg-surface-700 text-slate-400 rounded-lg font-body text-xs hover:bg-surface-600 transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-slate-600 hover:text-slate-400 transition-colors shrink-0">
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
