import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell } from '../components/AppShell.jsx'
import { BackgroundOrbs } from '../components/BackgroundOrbs.jsx'
import { Logo } from '../components/Logo.jsx'

const brandTones = [
  { key: 'professional', label: 'Professional' },
  { key: 'playful', label: 'Playful' },
  { key: 'bold', label: 'Bold' },
  { key: 'minimal', label: 'Minimal' },
]

export function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    startupName: '',
    website: '',
    brandTone: 'professional',
    problem: '',
    solution: '',
    linkedin: '',
    notes: '',
    launchWeeks: '',
    milestones: '',
  })
  const [errors, setErrors] = useState({})

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function validateStep1() {
    const nextErrors = {}
    if (!form.problem.trim()) nextErrors.problem = 'Required'
    if (!form.solution.trim()) nextErrors.solution = 'Required'
    if (!/^https?:\/\/.+linkedin\.com\//i.test(form.linkedin.trim())) nextErrors.linkedin = 'Valid LinkedIn URL required'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function validateStep2() {
    const nextErrors = {}
    if (!form.launchWeeks) nextErrors.launchWeeks = 'Select a timeframe'
    if (!form.milestones.trim()) nextErrors.milestones = 'Add your key milestones'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleNext() {
    if (step === 1 && validateStep1()) setStep(2)
  }

  function handleSubmit() {
    if (!validateStep2()) return
    sessionStorage.setItem('glowup-profile', JSON.stringify(form))
    navigate('/creating')
  }

  return (
    <AppShell>
      <BackgroundOrbs />
      <div className="w-full max-w-3xl mx-auto glass rounded-3xl p-6 md:p-10 mt-6 md:mt-8">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <div>
              <h1 className="text-xl md:text-2xl" style={{fontFamily:'Space Grotesk, ui-sans-serif, system-ui'}}>Glow.Up</h1>
              <p className="subtle">Launch faster with your AI MBA</p>
            </div>
          </div>
          <div className="hidden md:flex gap-2 items-center text-xs text-white/50">
            <span className={step === 1 ? 'text-white' : ''}>1</span>
            <div className="h-px w-10 bg-white/10" />
            <span className={step === 2 ? 'text-white' : ''}>2</span>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="grid gap-5"
            >
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <div className="label mb-2">Startup name (optional)</div>
                  <input className="input" placeholder="Eg. VectorWave" value={form.startupName} onChange={(e) => updateField('startupName', e.target.value)} />
                </div>
                <div>
                  <div className="label mb-2">LinkedIn URL<span className="text-hot">*</span></div>
                  <input className="input" placeholder="https://www.linkedin.com/in/yourname" value={form.linkedin} onChange={(e) => updateField('linkedin', e.target.value)} />
                  {errors.linkedin && <p className="text-xs text-pink-400 mt-1">{errors.linkedin}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <div className="label mb-2">Brand tone</div>
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-10 gap-4 lg:gap-30">
                    {brandTones.map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => updateField('brandTone', t.key)}
                        className={
                          'w-full flex items-center justify-center rounded-2xl px-12 py-3 text-base border transition ' +
                          (form.brandTone === t.key
                            ? 'border-purple-400/60 bg-purple-400/10'
                            : 'border-white/10 hover:border-white/20')
                        }
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                
              </div>

              <div>
                <div className="label mb-2">One-line problem<span className="text-hot">*</span></div>
                <input className="input" placeholder="What pain are you killing?" value={form.problem} onChange={(e) => updateField('problem', e.target.value)} />
                {errors.problem && <p className="text-xs text-pink-400 mt-1">{errors.problem}</p>}
              </div>
              <div>
                <div className="label mb-2">One-line solution<span className="text-hot">*</span></div>
                <input className="input" placeholder="How do you solve it in one sentence?" value={form.solution} onChange={(e) => updateField('solution', e.target.value)} />
                {errors.solution && <p className="text-xs text-pink-400 mt-1">{errors.solution}</p>}
              </div>

              <div>
                <div className="label mb-2">Extra notes (optional)</div>
                <textarea rows={4} className="input resize-none" placeholder="Anything else that helps the AI operator?" value={form.notes} onChange={(e) => updateField('notes', e.target.value)} />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button className="btn-primary" onClick={handleNext}>Next</button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="grid gap-5"
            >
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <div className="label mb-2">In how many weeks are you planning to launch?<span className="text-hot">*</span></div>
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {['1-2', '3-4', '5-8', '8+'].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => updateField('launchWeeks', w)}
                        className={
                          'w-full flex items-center justify-center rounded-2xl px-8 py-3 text-base border transition ' +
                          (form.launchWeeks === w
                            ? 'border-purple-400/60 bg-purple-400/10'
                            : 'border-white/10 hover:border-white/20')
                        }
                      >
                        {w} weeks
                      </button>
                    ))}
                  </div>
                  {errors.launchWeeks && <p className="text-xs text-pink-400 mt-1">{errors.launchWeeks}</p>}
                </div>
                <div>
                  <div className="label mb-2">What are the main milestones before launch?<span className="text-hot">*</span></div>
                  <textarea rows={6} className="input resize-none" placeholder="Eg. MVP done → Beta signups → Landing page → Pilot with 5 users" value={form.milestones} onChange={(e) => updateField('milestones', e.target.value)} />
                  {errors.milestones && <p className="text-xs text-pink-400 mt-1">{errors.milestones}</p>}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button className="btn-ghost" onClick={() => setStep(1)}>Back</button>
                <button className="btn-primary" onClick={handleSubmit}>Submit</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  )
}


