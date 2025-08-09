import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AppShell } from '../components/AppShell.jsx'

export function Landing() {
  return (
    <AppShell>
      <section className="grid lg:grid-cols-12 gap-8 items-center mt-6 md:mt-10">
        <div className="lg:col-span-6">
          <motion.h1
            className="text-4xl md:text-6xl font-semibold leading-tight"
            style={{fontFamily:'Space Grotesk, ui-sans-serif, system-ui'}}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <br /> Give Your Startup a <span className="bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">Glow.Up</span>.
            With Your Pocket MBA.
          </motion.h1>
          <motion.p
            className="subtle mt-4 max-w-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            From landing page to pitch, investor connections, and market intel — automate the launch grind and ship faster.
          </motion.p>
          <div className="mt-8 flex gap-3">
            <Link to="/start" className="btn-primary">Get started</Link>
            <Link to="/app" className="btn-ghost">View dashboard</Link>
          </div>
          <div className="mt-6 text-xs text-white/50">Trusted by hackathon champions and ambitious builders.</div>
        </div>
        <div className="lg:col-span-6">
          <motion.div
            className="glass rounded-3xl p-5 md:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm text-white/70">Onboarding</div>
                <div className="mt-2 h-3 w-2/3 rounded-full bg-gradient-to-r from-purple-400/70 to-cyan-400/70" />
                <div className="mt-2 h-3 w-1/2 rounded-full bg-white/10" />
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm text-white/70">AI Workspace</div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <div className="h-20 rounded-xl bg-white/5 border border-white/10" />
                  <div className="h-20 rounded-xl bg-white/5 border border-white/10" />
                  <div className="h-20 rounded-xl bg-white/5 border border-white/10" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mt-12 grid md:grid-cols-3 gap-4">
        {[
          ['Instant landing', 'Generate, deploy and track stats in one flow.'],
          ['Investor connections', 'Find warm intros from your graph and our network.'],
          ['Market intel', 'ICP, competitors and pricing guidance tailored to you.'],
        ].map(([title, desc]) => (
          <div key={title} className="glass rounded-2xl p-5">
            <div className="text-lg mb-1" style={{fontFamily:'Space Grotesk, ui-sans-serif, system-ui'}}>{title}</div>
            <div className="subtle">{desc}</div>
          </div>
        ))}
      </section>
    </AppShell>
  )
}


