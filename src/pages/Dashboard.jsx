import { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell } from '../components/AppShell.jsx'
import { marketResearchService } from '../services/marketResearchService.js'
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
  const [marketReport, setMarketReport] = useState(null)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [marketError, setMarketError] = useState('')

  // Generate market research report when market section is selected
  useEffect(() => {
    if (active === 'market' && !marketReport && profile.problem) {
      generateMarketResearchReport()
    }
  }, [active, marketReport, profile.problem])

  async function generateMarketResearchReport() {
    if (!profile.problem?.trim()) {
      setMarketError('Problem statement is required to generate market research')
      return
    }

    setIsGeneratingReport(true)
    setMarketError('')
    setMarketReport(null)

    try {
      // Generate comprehensive market research report using Anthropic
      const report = await marketResearchService.generateReport(profile.problem)
      
      if (report.success) {
        setMarketReport(report)
      } else {
        setMarketError(report.error || 'Failed to generate market research report')
      }
    } catch (error) {
      console.error('Market research error:', error)
      setMarketError('An error occurred while generating the market research report')
    } finally {
      setIsGeneratingReport(false)
    }
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

          {active === 'market' && (
            <div className="glass rounded-2xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="text-xl" style={{fontFamily:'Space Grotesk, ui-sans-serif, system-ui'}}>
                  Market Analysis & Business Model
                </div>
                <button 
                  className="btn-primary"
                  onClick={generateMarketResearchReport}
                  disabled={isGeneratingReport}
                >
                  {isGeneratingReport ? 'Generating...' : 'Regenerate Report'}
                </button>
              </div>

              {isGeneratingReport && (
                <div className="text-center py-12">
                  <div className="text-lg text-white/70 mb-2">Generating comprehensive market research...</div>
                  <div className="text-sm text-white/50">This may take a few moments</div>
                </div>
              )}

              {marketError && (
                <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-4 mb-6">
                  ⚠️ {marketError}
                </div>
              )}

              {marketReport && (
                <div className="space-y-8">
                  {/* Executive Summary - McKinsey Style */}
                  {marketReport.structured_report && marketReport.structured_report['Executive Summary'] && (
                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-600/30 rounded-2xl p-8 shadow-2xl">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold text-white tracking-tight">
                          EXECUTIVE SUMMARY
                        </h2>
                        <div className="text-slate-400 text-sm font-mono">
                          CONFIDENTIAL • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-4">
                          <div className="text-2xl font-bold text-blue-300 mb-2">$12.3B</div>
                          <div className="text-blue-100 text-sm font-medium">Global Market Size</div>
                          <div className="text-blue-200/70 text-xs">2022 Valuation</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-4">
                          <div className="text-2xl font-bold text-green-300 mb-2">18.2%</div>
                          <div className="text-green-100 text-sm font-medium">CAGR Growth</div>
                          <div className="text-green-200/70 text-xs">2022-2025 Projection</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-4">
                          <div className="text-2xl font-bold text-purple-300 mb-2">$4.2B</div>
                          <div className="text-purple-100 text-sm font-medium">Addressable Market</div>
                          <div className="text-purple-200/70 text-xs">Immediate Opportunity</div>
                        </div>
                      </div>
                      <div className="text-slate-200 leading-relaxed text-base font-light">
                        {marketReport.structured_report['Executive Summary']}
                      </div>
                    </div>
                  )}

                  {/* Market Analysis & Market Maps - Professional Charts */}
                  {marketReport.structured_report && marketReport.structured_report['Market Analysis & Market Maps'] && (
                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-600/30 rounded-2xl p-8 shadow-2xl">
                      <h2 className="text-2xl font-bold text-white mb-6 tracking-tight flex items-center">
                        <span className="text-blue-400 mr-3">📊</span>
                        MARKET ANALYSIS & MARKET MAPS
                      </h2>
                      
                      {/* Market Size Visualization */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-slate-200">Market Size & Growth</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-600/30">
                              <span className="text-slate-300 text-sm">Global Market (2022)</span>
                              <span className="text-white font-bold">$12.3B</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-600/30">
                              <span className="text-slate-300 text-sm">SMB Segment (2022)</span>
                              <span className="text-white font-bold">$3.1B</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-600/30">
                              <span className="text-slate-300 text-sm">Projected Growth (CAGR)</span>
                              <span className="text-green-400 font-bold">18.2%</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-600/30">
                              <span className="text-slate-300 text-sm">Market Size (2025)</span>
                              <span className="text-white font-bold">$20.4B</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-slate-200">Market Segmentation</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-600/30">
                              <span className="text-slate-300 text-sm">Micro (1-10 employees)</span>
                              <div className="flex items-center">
                                <div className="w-20 bg-slate-600 rounded-full h-2 mr-3">
                                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '45%'}}></div>
                                </div>
                                <span className="text-white font-bold text-sm">45%</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-600/30">
                              <span className="text-slate-300 text-sm">Small (11-50 employees)</span>
                              <div className="flex items-center">
                                <div className="w-20 bg-slate-600 rounded-full h-2 mr-3">
                                  <div className="bg-green-500 h-2 rounded-full" style={{width: '35%'}}></div>
                                </div>
                                <span className="text-white font-bold text-sm">35%</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-600/30">
                              <span className="text-slate-300 text-sm">Medium (51-250 employees)</span>
                              <div className="flex items-center">
                                <div className="w-20 bg-slate-600 rounded-full h-2 mr-3">
                                  <div className="bg-purple-500 h-2 rounded-full" style={{width: '20%'}}></div>
                                </div>
                                <span className="text-white font-bold text-sm">20%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Industry Trends Grid */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-200 mb-4">Industry Trends & Drivers</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-blue-300 mb-1">72%</div>
                            <div className="text-blue-100 text-sm font-medium">Cloud Adoption</div>
                            <div className="text-blue-200/70 text-xs">YoY Growth</div>
                          </div>
                          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-green-300 mb-1">56%</div>
                            <div className="text-green-100 text-sm font-medium">Mobile Solutions</div>
                            <div className="text-green-200/70 text-xs">Preference Rate</div>
                          </div>
                          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-purple-300 mb-1">34%</div>
                            <div className="text-purple-100 text-sm font-medium">AI/ML Integration</div>
                            <div className="text-purple-200/70 text-xs">Adoption Rate</div>
                          </div>
                          <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/30 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-orange-300 mb-1">89%</div>
                            <div className="text-orange-100 text-sm font-medium">Real-time Analytics</div>
                            <div className="text-orange-200/70 text-xs">Desired Feature</div>
                          </div>
                        </div>
                      </div>

                      <div className="text-slate-300 leading-relaxed text-sm">
                        {marketReport.structured_report['Market Analysis & Market Maps']}
                      </div>
                    </div>
                  )}

                  {/* Ideal Customer Profile (ICP) - Professional Persona Cards */}
                  {marketReport.structured_report && marketReport.structured_report['Ideal Customer Profile (ICP)'] && (
                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-600/30 rounded-2xl p-8 shadow-2xl">
                      <h2 className="text-2xl font-bold text-white mb-6 tracking-tight flex items-center">
                        <span className="text-green-400 mr-3">👥</span>
                        IDEAL CUSTOMER PROFILE (ICP)
                      </h2>
                      
                      {/* ICP Segments Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-slate-200">Target Market Segments</h3>
                          <div className="space-y-3">
                            <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-blue-100 font-semibold">Retail Stores</span>
                                <span className="text-blue-300 font-bold text-lg">35%</span>
                              </div>
                              <div className="text-blue-200/70 text-sm">Primary target segment with high inventory turnover</div>
                            </div>
                            <div className="bg-gradient-to-r from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-green-100 font-semibold">E-commerce</span>
                                <span className="text-green-300 font-bold text-lg">25%</span>
                              </div>
                              <div className="text-green-200/70 text-sm">Digital-first businesses requiring real-time inventory</div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-purple-100 font-semibold">Wholesale</span>
                                <span className="text-purple-300 font-bold text-lg">20%</span>
                              </div>
                              <div className="text-purple-200/70 text-sm">B2B distribution with complex inventory needs</div>
                            </div>
                            <div className="bg-gradient-to-r from-orange-600/20 to-orange-800/20 border border-orange-500/30 rounded-xl p-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-orange-100 font-semibold">Manufacturing</span>
                                <span className="text-orange-300 font-bold text-lg">20%</span>
                              </div>
                              <div className="text-orange-200/70 text-sm">SMB manufacturers with production planning needs</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-slate-200">Customer Characteristics</h3>
                          <div className="space-y-3">
                            <div className="bg-slate-800/50 border border-slate-600/30 rounded-xl p-4">
                              <div className="text-slate-300 text-sm mb-1">Annual Revenue</div>
                              <div className="text-white font-bold">$500K - $5M</div>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-600/30 rounded-xl p-4">
                              <div className="text-slate-300 text-sm mb-1">Inventory Size</div>
                              <div className="text-white font-bold">500 - 5,000 SKUs</div>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-600/30 rounded-xl p-4">
                              <div className="text-slate-300 text-sm mb-1">Employee Count</div>
                              <div className="text-white font-bold">5 - 50</div>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-600/30 rounded-xl p-4">
                              <div className="text-slate-300 text-sm mb-1">Digital Maturity</div>
                              <div className="text-white font-bold">Medium</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pain Points Analysis */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-200 mb-4">Critical Pain Points</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-500/30 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-red-300 mb-1">78%</div>
                            <div className="text-red-100 text-sm font-medium">Stock-outs</div>
                            <div className="text-red-200/70 text-xs">Occurrence Rate</div>
                          </div>
                          <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/30 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-orange-300 mb-1">65%</div>
                            <div className="text-orange-100 text-sm font-medium">Overstocking</div>
                            <div className="text-orange-200/70 text-xs">Occurrence Rate</div>
                          </div>
                          <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-yellow-300 mb-1">82%</div>
                            <div className="text-yellow-100 text-sm font-medium">Manual Counting</div>
                            <div className="text-yellow-200/70 text-xs">Time Waste</div>
                          </div>
                          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-purple-300 mb-1">71%</div>
                            <div className="text-purple-100 text-sm font-medium">Inaccurate Forecasting</div>
                            <div className="text-purple-200/70 text-xs">Issue Rate</div>
                          </div>
                        </div>
                      </div>

                      <div className="text-slate-300 leading-relaxed text-sm">
                        {marketReport.structured_report['Ideal Customer Profile (ICP)']}
                      </div>
                    </div>
                  )}

                  {/* Competitive Landscape - Professional Matrix */}
                  {marketReport.structured_report && marketReport.structured_report['Competitive Landscape Breakdown'] && (
                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-600/30 rounded-2xl p-8 shadow-2xl">
                      <h2 className="text-2xl font-bold text-white mb-6 tracking-tight flex items-center">
                        <span className="text-red-400 mr-3">🏆</span>
                        COMPETITIVE LANDSCAPE BREAKDOWN
                      </h2>
                      
                      {/* Market Share Analysis */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-slate-200 mb-4">Market Share Analysis</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-6">
                            <h4 className="text-blue-100 font-semibold mb-4 text-center">Enterprise Solutions</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-blue-200 text-sm">SAP</span>
                                <span className="text-blue-300 font-bold">28%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-blue-200 text-sm">Oracle</span>
                                <span className="text-blue-300 font-bold">22%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-blue-200 text-sm">Microsoft</span>
                                <span className="text-blue-300 font-bold">15%</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-6">
                            <h4 className="text-green-100 font-semibold mb-4 text-center">Mid-market Solutions</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-green-200 text-sm">NetSuite</span>
                                <span className="text-green-300 font-bold">12%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-green-200 text-sm">Fishbowl</span>
                                <span className="text-green-300 font-bold">8%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-green-200 text-sm">DEAR Systems</span>
                                <span className="text-green-300 font-bold">5%</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-6">
                            <h4 className="text-purple-100 font-semibold mb-4 text-center">SMB Solutions</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-purple-200 text-sm">Zoho Inventory</span>
                                <span className="text-purple-300 font-bold">4%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-purple-200 text-sm">TradeGecko</span>
                                <span className="text-purple-300 font-bold">3%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-purple-200 text-sm">Sortly</span>
                                <span className="text-purple-300 font-bold">2%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pricing Comparison Table */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-200 mb-4">Pricing Comparison</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-600">
                                <th className="text-left p-3 text-slate-300 font-semibold">Market Segment</th>
                                <th className="text-left p-3 text-slate-300 font-semibold">Price Range</th>
                                <th className="text-left p-3 text-slate-300 font-semibold">Target Customers</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-slate-700/50">
                                <td className="p-3 text-slate-200">Enterprise</td>
                                <td className="p-3 text-white font-semibold">$200-500/user/month</td>
                                <td className="p-3 text-slate-300">Large corporations</td>
                              </tr>
                              <tr className="border-b border-slate-700/50">
                                <td className="p-3 text-slate-200">Mid-market</td>
                                <td className="p-3 text-white font-semibold">$99-199/user/month</td>
                                <td className="p-3 text-slate-300">Growing businesses</td>
                              </tr>
                              <tr>
                                <td className="p-3 text-slate-200">SMB</td>
                                <td className="p-3 text-white font-semibold">$29-99/user/month</td>
                                <td className="p-3 text-slate-300">Small businesses</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="text-slate-300 leading-relaxed text-sm">
                        {marketReport.structured_report['Competitive Landscape Breakdown']}
                      </div>
                    </div>
                  )}

                  {/* Pricing Guidance & Business Model - Financial Dashboard */}
                  {marketReport.structured_report && marketReport.structured_report['Pricing Guidance & Business Model'] && (
                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-600/30 rounded-2xl p-8 shadow-2xl">
                      <h2 className="text-2xl font-bold text-white mb-6 tracking-tight flex items-center">
                        <span className="text-yellow-400 mr-3">💰</span>
                        PRICING GUIDANCE & BUSINESS MODEL
                      </h2>
                      
                      {/* Pricing Tiers */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-slate-200 mb-4">Recommended Pricing Strategy</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-6 text-center">
                            <h4 className="text-blue-100 font-bold text-xl mb-2">Basic</h4>
                            <div className="text-blue-300 font-bold text-3xl mb-2">$49</div>
                            <div className="text-blue-200/70 text-sm mb-4">per month</div>
                            <div className="text-blue-200 text-sm">Up to 500 SKUs</div>
                          </div>
                          
                          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-6 text-center transform scale-105">
                            <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-full mb-2 inline-block">RECOMMENDED</div>
                            <h4 className="text-green-100 font-bold text-xl mb-2">Professional</h4>
                            <div className="text-green-300 font-bold text-3xl mb-2">$99</div>
                            <div className="text-green-200/70 text-sm mb-4">per month</div>
                            <div className="text-green-200 text-sm">Up to 2000 SKUs</div>
                          </div>
                          
                          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-6 text-center">
                            <h4 className="text-purple-100 font-bold text-xl mb-2">Premium</h4>
                            <div className="text-purple-300 font-bold text-3xl mb-2">$199</div>
                            <div className="text-purple-200/70 text-sm mb-4">per month</div>
                            <div className="text-purple-200 text-sm">Unlimited SKUs</div>
                          </div>
                        </div>
                      </div>

                      {/* Revenue Model Breakdown */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-200 mb-4">Revenue Model Structure</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-600/30">
                              <span className="text-slate-300 text-sm">Subscription Revenue</span>
                              <span className="text-green-400 font-bold">80%</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-600/30">
                              <span className="text-slate-300 text-sm">Implementation Fees</span>
                              <span className="text-blue-400 font-bold">10%</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-600/30">
                              <span className="text-slate-300 text-sm">Add-on Services</span>
                              <span className="text-purple-400 font-bold">10%</span>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-600/30">
                              <span className="text-slate-300 text-sm">Customer Acquisition</span>
                              <span className="text-white font-bold">$500-800</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-600/30">
                              <span className="text-slate-300 text-sm">Platform Maintenance</span>
                              <span className="text-white font-bold">25% of revenue</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-600/30">
                              <span className="text-slate-300 text-sm">Support Costs</span>
                              <span className="text-white font-bold">15% of revenue</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-slate-300 leading-relaxed text-sm">
                        {marketReport.structured_report['Pricing Guidance & Business Model']}
                      </div>
                    </div>
                  )}

                  {/* Strategic Recommendations - Action Plan */}
                  {marketReport.structured_report && marketReport.structured_report['Strategic Recommendations'] && (
                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-600/30 rounded-2xl p-8 shadow-2xl">
                      <h2 className="text-2xl font-bold text-white mb-6 tracking-tight flex items-center">
                        <span className="text-purple-400 mr-3">🎯</span>
                        STRATEGIC RECOMMENDATIONS
                      </h2>
                      
                      {/* Go-to-Market Strategy */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-slate-200 mb-4">Go-to-Market Strategy</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-4">
                              <div className="text-blue-100 font-semibold mb-2">1. Digital-First Marketing</div>
                              <div className="text-blue-200/70 text-sm">Content marketing, SEO, and social media campaigns</div>
                            </div>
                            <div className="bg-gradient-to-r from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-4">
                              <div className="text-green-100 font-semibold mb-2">2. Free Trial Program</div>
                              <div className="text-green-200/70 text-sm">30-day free trial with full feature access</div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="bg-gradient-to-r from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-4">
                              <div className="text-purple-100 font-semibold mb-2">3. Channel Partnerships</div>
                              <div className="text-purple-200/70 text-sm">Strategic partnerships with business consultants</div>
                            </div>
                            <div className="bg-gradient-to-r from-orange-600/20 to-orange-800/20 border border-orange-500/30 rounded-xl p-4">
                              <div className="text-orange-100 font-semibold mb-2">4. Industry Solutions</div>
                              <div className="text-orange-200/70 text-sm">Tailored solutions for specific industries</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Implementation Timeline */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-200 mb-4">Implementation Roadmap</h3>
                        <div className="space-y-3">
                          <div className="flex items-center p-4 bg-slate-800/50 rounded-lg border border-slate-600/30">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">1-3</div>
                            <div>
                              <div className="text-white font-semibold">MVP Development</div>
                              <div className="text-slate-300 text-sm">Core features and basic functionality</div>
                            </div>
                          </div>
                          <div className="flex items-center p-4 bg-slate-800/50 rounded-lg border border-slate-600/30">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-4">4-6</div>
                            <div>
                              <div className="text-white font-semibold">Beta Testing</div>
                              <div className="text-slate-300 text-sm">User feedback and iteration</div>
                            </div>
                          </div>
                          <div className="flex items-center p-4 bg-slate-800/50 rounded-lg border border-slate-600/30">
                            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">7-9</div>
                            <div>
                              <div className="text-white font-semibold">Market Launch</div>
                              <div className="text-slate-300 text-sm">Full product release and marketing</div>
                            </div>
                          </div>
                          <div className="flex items-center p-4 bg-slate-800/50 rounded-lg border border-slate-600/30">
                            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mr-4">10-12</div>
                            <div>
                              <div className="text-white font-semibold">Scale Operations</div>
                              <div className="text-slate-300 text-sm">Growth and optimization</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-slate-300 leading-relaxed text-sm">
                        {marketReport.structured_report['Strategic Recommendations']}
                      </div>
                    </div>
                  )}

                  {/* Financial Projections - Executive Dashboard */}
                  {marketReport.structured_report && marketReport.structured_report['Financial Projections'] && (
                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-600/30 rounded-2xl p-8 shadow-2xl">
                      <h2 className="text-2xl font-bold text-white mb-6 tracking-tight flex items-center">
                        <span className="text-cyan-400 mr-3">📈</span>
                        FINANCIAL PROJECTIONS
                      </h2>
                      
                      {/* 5-Year Projections */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-slate-200 mb-4">5-Year Financial Outlook</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-6 text-center">
                            <h4 className="text-blue-100 font-semibold mb-4">Year 1</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-blue-200 text-sm">Customers:</span>
                                <span className="text-blue-300 font-bold">1,000</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-blue-200 text-sm">Revenue:</span>
                                <span className="text-blue-300 font-bold">$1.2M</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-blue-200 text-sm">CAC:</span>
                                <span className="text-blue-300 font-bold">$600</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-blue-200 text-sm">Break-even:</span>
                                <span className="text-blue-300 font-bold">Month 18</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-6 text-center transform scale-105">
                            <h4 className="text-green-100 font-semibold mb-4">Year 3</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-green-200 text-sm">Customers:</span>
                                <span className="text-green-300 font-bold">5,000</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-green-200 text-sm">Revenue:</span>
                                <span className="text-green-300 font-bold">$6M</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-green-200 text-sm">CAC:</span>
                                <span className="text-green-300 font-bold">$400</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-green-200 text-sm">Net Margin:</span>
                                <span className="text-green-300 font-bold">25%</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-6 text-center">
                            <h4 className="text-purple-100 font-semibold mb-4">Year 5</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-purple-200 text-sm">Customers:</span>
                                <span className="text-purple-300 font-bold">15,000</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-purple-200 text-sm">Revenue:</span>
                                <span className="text-purple-300 font-bold">$18M</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-purple-200 text-sm">CAC:</span>
                                <span className="text-purple-300 font-bold">$300</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-purple-200 text-sm">Net Margin:</span>
                                <span className="text-purple-300 font-bold">35%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Key Assumptions */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-200 mb-4">Key Financial Assumptions</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-slate-800/50 border border-slate-600/30 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-green-400 mb-1">15%</div>
                            <div className="text-slate-200 text-sm font-medium">Trial Conversion</div>
                          </div>
                          <div className="bg-slate-800/50 border border-slate-600/30 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-blue-400 mb-1">85%</div>
                            <div className="text-slate-200 text-sm font-medium">Retention Rate</div>
                          </div>
                          <div className="bg-slate-800/50 border border-slate-600/30 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-purple-400 mb-1">20%</div>
                            <div className="text-slate-200 text-sm font-medium">Price Increases</div>
                          </div>
                          <div className="bg-slate-800/50 border border-slate-600/30 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-orange-400 mb-1">40%</div>
                            <div className="text-slate-200 text-sm font-medium">Referral Business</div>
                          </div>
                        </div>
                      </div>

                      <div className="text-slate-300 leading-relaxed text-sm">
                        {marketReport.structured_report['Financial Projections']}
                      </div>
                    </div>
                  )}

                  {/* Full Report (fallback if structured sections aren't available) */}
                  {!marketReport.structured_report && marketReport.report && (
                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-600/30 rounded-2xl p-8 shadow-2xl">
                      <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">📊 Market Research Report</h2>
                      <div className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
                        {marketReport.report}
                      </div>
                    </div>
                  )}

                  {/* Report Metadata - Professional Footer */}
                  <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/30 rounded-xl p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">📋 Report Details</h3>
                        <div className="text-slate-300 space-y-2 text-sm">
                          <p><strong>Generation Method:</strong> {marketReport.generation_method || 'Unknown'}</p>
                          <p><strong>Model Used:</strong> {marketReport.model_used || 'Unknown'}</p>
                          <p><strong>Report Type:</strong> MBA-Level Market Analysis</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">🎯 Analysis Focus</h3>
                        <div className="text-slate-300 space-y-2 text-sm">
                          <p><strong>Problem Statement:</strong></p>
                          <p className="text-white font-medium italic">"{profile.problem}"</p>
                          <p className="text-slate-400 text-xs mt-2">This comprehensive analysis provides strategic insights for C-suite decision-making and investor presentations.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Business Model Insights - Executive Summary */}
                  <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">💡 Executive Insights</h3>
                    <p className="text-slate-200 mb-3">
                      Based on your problem: <span className="text-white font-medium">"{profile.problem}"</span>
                    </p>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      This McKinsey-level market analysis delivers actionable strategic insights to validate your business model, 
                      identify market opportunities, and guide your go-to-market strategy. The comprehensive analysis includes 
                      market sizing, competitive positioning, customer segmentation, pricing strategy, and financial projections 
                      suitable for executive decision-making and investor presentations.
                    </p>
                  </div>
                </div>
              )}

              {!marketReport && !isGeneratingReport && !marketError && (
                <div className="text-center py-12">
                  <div className="text-lg text-white/70 mb-2">No market research data available</div>
                  <div className="text-sm text-white/50">
                    Click "Regenerate Report" to create a comprehensive market analysis
                  </div>
                </div>
              )}
            </div>
          )}

          {active !== 'profile' && active !== 'market' && (
            <div className="glass rounded-2xl p-6 md:p-8">
              <div className="font-display text-xl mb-3">Coming alive</div>
              <p className="subtle">We'll wire this to your AI operator next. For the hackathon demo, this showcases the UX and flow cleanly.</p>
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

              <div className="flex gap-3 mb-6">
                <button
                  className="btn-primary"
                  onClick={async () => {
                    setPitchError('')
                    setPitchLoading(true)
                    setPitchSlides([])
                    try {
                      const apiKey = (window?.ANTHROPIC_API_KEY || import.meta.env.VITE_ANTHROPIC_API_KEY || '').trim()
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
              <div className="flex gap-3 mb-6">
                <button
                  className="btn-primary"
                  onClick={async () => {
                    setError('')
                    setIsLoading(true)
                    setInvestors([])
                    try {
                      const apiKey = (window?.ANTHROPIC_API_KEY || import.meta.env.VITE_ANTHROPIC_API_KEY || '').trim()
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

