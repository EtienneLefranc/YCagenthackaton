import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell } from '../components/AppShell.jsx'
import { generateInvestorsWithAnthropic, generatePitchDeckWithAnthropic } from '../lib/anthropic.js'

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
  const [isLoading, setIsLoading] = useState(false)
  const [investors, setInvestors] = useState([])
  const [error, setError] = useState('')
  const [pitchSlides, setPitchSlides] = useState([])
  const [pitchLoading, setPitchLoading] = useState(false)
  const [pitchError, setPitchError] = useState('')
  const [apiKeyInput, setApiKeyInput] = useState(() => {
    try { return sessionStorage.getItem('glowup-anthropic-key') || '' } catch { return '' }
  })

  function getAnthropicKey() {
    const stored = (() => { try { return sessionStorage.getItem('glowup-anthropic-key') || '' } catch { return '' } })()
    return (
      stored ||
      (typeof window !== 'undefined' ? (window.ANTHROPIC_API_KEY || '') : '') ||
      (import.meta.env.VITE_ANTHROPIC_API_KEY || '')
    ).trim()
  }

  function KeySaver() {
    const hasKey = !!getAnthropicKey()
    if (hasKey) return null
    return (
      <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 mb-4">
        <div className="text-sm text-white/80 mb-2">Add your Anthropic API key (stored locally for this session)</div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="password"
            className="input flex-1"
            placeholder="sk-ant-..."
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
          />
          <button
            className="btn-primary"
            onClick={() => {
              try { sessionStorage.setItem('glowup-anthropic-key', (apiKeyInput || '').trim()) } catch {}
            }}
          >
            Save key (local)
          </button>
        </div>
        <div className="text-xs text-white/60 mt-2">Tip: For dev, you can also use <code>VITE_ANTHROPIC_API_KEY</code> in a .env file.</div>
      </div>
    )
  }

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

          {active !== 'profile' && active !== 'connections' && active !== 'pitch' && (
            <div className="glass rounded-2xl p-6 md:p-8">
              <div className="font-display text-xl mb-3">Coming alive</div>
              <p className="subtle">We’ll wire this to your AI operator next. For the hackathon demo, this showcases the UX and flow cleanly.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button className="btn-primary">Generate</button>
                <button className="btn-ghost">Configure</button>
              </div>
            </div>
          )}

          {active === 'pitch' && (
            <div className="glass rounded-2xl p-6 md:p-8">
              <div className="text-xl mb-2" style={{fontFamily:'Space Grotesk, ui-sans-serif, system-ui'}}>Pitch deck (auto‑draft)</div>
              <p className="subtle mb-4">Grounded in your profile. Clean structure. Edit after generation as needed.</p>

              <KeySaver />

              <div className="flex gap-3 mb-6">
                <button
                  className="btn-primary"
                  onClick={async () => {
                    setPitchError('')
                    setPitchLoading(true)
                    setPitchSlides([])
                    try {
                      const apiKey = getAnthropicKey()
                      const slides = await generatePitchDeckWithAnthropic({ profile, apiKey })
                      setPitchSlides(Array.isArray(slides) ? slides : [])
                    } catch (e) {
                      setPitchError(e?.message || 'Failed to generate pitch deck')
                    } finally {
                      setPitchLoading(false)
                    }
                  }}
                >
                  {pitchLoading ? 'Generating…' : 'Generate'}
                </button>
                <button className="btn-ghost" onClick={() => setPitchSlides([])}>Clear</button>
              </div>

              {pitchError && (
                <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-3 text-sm mb-4">{pitchError}</div>
              )}

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {pitchSlides.map((s, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-white/70 text-xs">Slide {s?.number || idx + 1}</div>
                          <div className="text-white font-medium">{s?.title || 'Untitled'}</div>
                        </div>
                        <div className="text-xs rounded-full px-2 py-1 bg-purple-400/15 border border-purple-400/20 text-white/80">
                          {String(s?.subtitle || '').slice(0, 24) || 'Overview'}
                        </div>
                      </div>
                      {s?.subtitle && (
                        <div className="text-white/70 text-sm mt-2">{s.subtitle}</div>
                      )}
                      <ul className="mt-3 space-y-2 list-disc list-inside text-sm text-white/90">
                        {(Array.isArray(s?.bullets) ? s.bullets : String(s?.bullets || '').split(/\n|•|\-/).filter(Boolean)).slice(0, 6).map((b, i) => (
                          <li key={i}>{String(b).trim()}</li>
                        ))}
                      </ul>
                      {s?.metrics && typeof s.metrics === 'object' && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {Object.entries(s.metrics).slice(0, 6).map(([k, v]) => (
                            <span key={k} className="text-xs rounded-full px-2 py-1 bg-white/5 border border-white/10">{k}: {String(v)}</span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {!pitchLoading && pitchSlides.length === 0 && !pitchError && (
                <div className="text-white/60 text-sm">Click Generate to draft 12 structured slides.</div>
              )}
            </div>
          )}

          {active === 'connections' && (
            <div className="glass rounded-2xl p-6 md:p-8">
              <div className="text-xl mb-2" style={{fontFamily:'Space Grotesk, ui-sans-serif, system-ui'}}>High‑value investors</div>
              <p className="subtle mb-4">Curated to your profile. We’ll prioritize warm intros from your graph next.</p>
              <KeySaver />
              <div className="flex gap-3 mb-6">
                <button
                  className="btn-primary"
                  onClick={async () => {
                    setError('')
                    setIsLoading(true)
                    setInvestors([])
                    try {
                      const apiKey = getAnthropicKey()
                      const enrichedProfile = {
                        ...profile,
                        // Derive a rough stage hint from launchWeeks
                        stage_hint:
                          profile.launchWeeks === '1-2' || profile.launchWeeks === '3-4'
                            ? 'pre-seed'
                            : profile.launchWeeks === '5-8'
                              ? 'seed'
                              : 'seed-or-series-a',
                      }
                      const results = await generateInvestorsWithAnthropic({ profile: enrichedProfile, apiKey })
                      setInvestors(results)
                    } catch (e) {
                      setError(e?.message || 'Failed to generate')
                    } finally {
                      setIsLoading(false)
                    }
                  }}
                >
                  {isLoading ? 'Generating…' : 'Generate'}
                </button>
                <button className="btn-ghost" onClick={() => setInvestors([])}>Clear</button>
              </div>

              {error && <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-3 text-sm">{error}</div>}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {investors.map((inv, idx) => (
                  <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-white font-medium">{inv.name || 'Unknown'}</div>
                        <div className="text-white/70 text-sm">{inv.role || ''}{inv.role && inv.firm ? ' · ' : ''}{inv.firm || ''}</div>
                      </div>
                      <div className="text-xs rounded-full px-2 py-1 bg-purple-400/15 border border-purple-400/20 text-white/80">{(inv.geo || 'Global')}</div>
                    </div>
                    {inv.why_match && <div className="text-white/80 text-sm mt-3">{inv.why_match}</div>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(inv.sectors || []).slice(0,3).map((s) => (
                        <span key={s} className="text-xs rounded-full px-2 py-1 bg-white/5 border border-white/10">{s}</span>
                      ))}
                      {(inv.stages || []).slice(0,2).map((s) => (
                        <span key={s} className="text-xs rounded-full px-2 py-1 bg-white/5 border border-white/10">{s}</span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      {inv?.links?.linkedin && <a className="btn-ghost" href={inv.links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
                      {inv?.links?.twitter && <a className="btn-ghost" href={inv.links.twitter} target="_blank" rel="noreferrer">Twitter</a>}
                      {inv?.links?.website && <a className="btn-ghost" href={inv.links.website} target="_blank" rel="noreferrer">Website</a>}
                      {inv?.links?.email && <a className="btn-primary" href={`mailto:${inv.links.email}`}>Email</a>}
                    </div>
                  </div>
                ))}
              </div>

              {!isLoading && investors.length === 0 && !error && (
                <div className="text-white/60 text-sm">Click Generate to see a curated list.</div>
              )}
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


