import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AppShell } from '../components/AppShell.jsx'
import { BackgroundOrbs } from '../components/BackgroundOrbs.jsx'

export function Loading() {
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => navigate('/app'), 5000)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <AppShell>
      <BackgroundOrbs />
      <div className="glass rounded-3xl p-10 w-full max-w-xl text-center mx-auto">
        <div className="text-2xl mb-2" style={{fontFamily:'Space Grotesk, ui-sans-serif, system-ui'}}>Creating workspace</div>
        <p className="subtle mb-8">We’re assembling your AI operator, setting up the launch workspace and tools…</p>
        <div className="relative mx-auto w-40 h-40">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-purple-400/40"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-cyan-400/40"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          />
          <div className="absolute inset-8 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 grid place-items-center font-display text-black text-3xl font-bold">G</div>
        </div>
      </div>
    </AppShell>
  )
}


