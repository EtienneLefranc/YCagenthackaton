import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { AppShell } from '../components/AppShell.jsx'
import { marketResearchService } from '../services/marketResearchService.js'

export function Landing() {
  const [problemStatement, setProblemStatement] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [questions, setQuestions] = useState(null)
  const [error, setError] = useState('')

  const handleGenerateQuestions = async () => {
    if (!problemStatement.trim()) {
      setError('Please enter a problem statement')
      return
    }

    setIsGenerating(true)
    setError('')
    setQuestions(null)

    try {
      const data = await marketResearchService.generateQuestions(problemStatement.trim())
      setQuestions(data.questions)
    } catch (err) {
      setError(err.message || 'Failed to connect to the market research service. Please make sure the backend is running.')
    } finally {
      setIsGenerating(false)
    }
  }

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
          
          {/* Market Research Input Section */}
          <motion.div
            className="mt-8 space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                Describe your business problem or opportunity:
              </label>
              <textarea
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="e.g., Small businesses struggle to manage inventory efficiently, leading to stockouts and lost sales..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all"
                rows={3}
                maxLength={1000}
              />
              <div className="text-xs text-white/50 text-right">
                {problemStatement.length}/1000
              </div>
            </div>
            
            <button
              onClick={handleGenerateQuestions}
              disabled={isGenerating || !problemStatement.trim()}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating Questions...' : 'Generate Market Research Questions'}
            </button>

            {error && (
              <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                {error}
              </div>
            )}
          </motion.div>

          {/* Generated Questions Display */}
          {questions && (
            <motion.div
              className="mt-6 space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-lg font-semibold text-white">
                Market Research Questions ({questions.length})
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {questions.map((q, index) => (
                  <div key={q.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="text-sm text-white/70 mb-1">Question {index + 1}</div>
                    <div className="text-white font-medium">{q.question}</div>
                    {q.type === 'select' && q.options && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {q.options.map((option, optIndex) => (
                          <span key={optIndex} className="px-2 py-1 bg-white/10 rounded text-xs text-white/70">
                            {option}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-xs text-white/50">
                Use these questions to gather market insights and validate your business idea.
              </div>
            </motion.div>
          )}

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


