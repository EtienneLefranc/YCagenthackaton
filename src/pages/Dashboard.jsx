import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell } from '../components/AppShell.jsx'

const sections = [
  {
    key: 'profile',
    title: 'Profile',
    description:
      'All your startup details from onboarding, neatly organized. Update anytime to keep your AI operator aligned.',
  },
  {
    key: 'landing',
    title: 'Landing page generation, deployment and stats',
    description:
      'Generate a high-conversion landing with brand tone, deploy to edge hosting in one click, and track signups + conversion.',
  },
  {
    key: 'pitch',
    title: 'Pitch deck creation',
    description:
      'Auto-draft slides from your problem, solution, traction, and market. Tweak narrative and export to PDF.',
  },
  {
    key: 'connections',
    title: 'Find connections of value',
    description:
      'Discover warm intros to relevant investors and potential customers via your LinkedIn graph and our network.',
  },
  {
    key: 'market',
    title: 'Market analysis and business model',
    description:
      'Get crisp market maps, ICP, competitive breakdown, and pricing guidance tailored to your segment.',
  },
  {
    key: 'content',
    title: 'Content creation and branding',
    description:
      'Generate your brand kit plus content calendar for launch on X, LinkedIn, and email with your chosen tone.',
  },
  {
    key: 'naming',
    title: 'Name and product generation',
    description:
      'Explore memorable names and product concept variants. Check domains and social handles instantly.',
  },
]

function useProfile() {
  return useMemo(() => {
    try {
      const raw = sessionStorage.getItem('glowup-profile')
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  }, [])
}

export function Dashboard() {
  const profile = useProfile()
  const [active, setActive] = useState('profile')

  return (
    <AppShell>
      <div className="grid md:grid-cols-12 gap-6">
        <aside className="md:col-span-3 lg:col-span-2 glass rounded-2xl p-2">
          {sections.map((s) => (
            <button
              key={s.key}
              className={
                'w-full text-left px-4 py-3 rounded-xl transition ' +
                (active === s.key
                  ? 'bg-purple-400/10 border border-purple-400/20'
                  : 'hover:bg-white/5')
              }
              onClick={() => setActive(s.key)}
            >
              <div className="font-medium">{s.title}</div>
            </button>
          ))}
        </aside>

        <section className="md:col-span-9 lg:col-span-10 grid gap-6">
          <div className="glass rounded-2xl p-6 md:p-8">
            <AnimatePresence mode="wait">
              {sections.map((s) => (
                active === s.key && (
                  <motion.div
                    key={s.key}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="section-title mb-2">{s.title}</div>
                    <p className="subtle max-w-2xl">{s.description}</p>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>

          {active === 'profile' && (
            <div className="glass rounded-2xl p-6 md:p-8">
              <div className="text-xl mb-4" style={{fontFamily:'Space Grotesk, ui-sans-serif, system-ui'}}>Startup profile</div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <Field label="Startup name" value={profile.startupName || '—'} />
                <Field label="Brand tone" value={profile.brandTone || '—'} />
                <Field label="LinkedIn" value={profile.linkedin || '—'} />
                <Field label="Problem" value={profile.problem || '—'} />
                <Field label="Solution" value={profile.solution || '—'} />
                <Field label="Launch timeframe" value={profile.launchWeeks ? `${profile.launchWeeks} weeks` : '—'} />
                <Field label="Milestones" value={profile.milestones || '—'} full />
                <Field label="Extra notes" value={profile.notes || '—'} full />
              </div>
            </div>
          )}

          {active !== 'profile' && (
            <div className="glass rounded-2xl p-6 md:p-8">
              <div className="font-display text-xl mb-3">Coming alive</div>
              <p className="subtle">We’ll wire this to your AI operator next. For the hackathon demo, this showcases the UX and flow cleanly.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button className="btn-primary">Generate</button>
                <button className="btn-ghost">Configure</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  )
}

function Field({ label, value, full = false }) {
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <div className="label mb-1">{label}</div>
      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">{value}</div>
    </div>
  )
}


