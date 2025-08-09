// Minimal Anthropic Messages API client for the browser.
// NOTE: For production, proxy this request through a backend to keep the API key secret.

const DEFAULT_MODEL = 'claude-3-5-sonnet-latest'

export async function generateInvestorsWithAnthropic({ profile, apiKey }) {
  if (!apiKey) throw new Error('Missing Anthropic API key')

  const system = `You are a startup investor matchmaker. Given a startup profile, pick investors who are a strong fit for the profile's stage and topic. Return a concise JSON array tailored to the inputs.

Rules:
- Output ONLY valid JSON, no backticks, no commentary
- Each item:
  {
    "name": "",
    "firm": "",
    "role": "",
    "why_match": "reference the startup's problem/solution in <= 22 words",
    "fit_score": 1-5,
    "stages": ["pre-seed"|"seed"|"series a"|...],
    "sectors": ["AI", "SaaS", "DevTools", ...],
    "geo": "",
    "links": {"linkedin":"","twitter":"","email":"","website":""}
  }
- Use public info only; if a contact is unknown, set it to "".
- Prefer partners who led or frequently participate at the requested stage.
- Prefer investors with visible interest in the inferred sectors from the text.
- Avoid generic choices; rank by fit_score descending.`

  const prompt = `Startup profile (use this aggressively):\n${JSON.stringify(profile, null, 2)}\n\nInfer sectors from problem/solution text. Map launch timeframe or stage_hint to stages. Return ONLY a JSON array.`

  const url = (import.meta.env.DEV ? '/anthropic' : 'https://api.anthropic.com') + '/v1/messages'
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      // Required by Anthropic for any browser-originating requests
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      max_tokens: 1200,
      system,
      messages: [
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Anthropic error ${res.status}: ${text}`)
  }

  const data = await res.json()
  // Anthropic returns content as an array of blocks; we expect a single text block
  const text = data?.content?.[0]?.text ?? ''
  try {
    const parsed = JSON.parse(text)
    if (!Array.isArray(parsed)) throw new Error('Expected array')
    return parsed
  } catch {
    // Fallback: try to extract the first JSON array inside
    const match = text.match(/\[[\s\S]*\]/)
    if (match) {
      try { return JSON.parse(match[0]) } catch {}
    }
    throw new Error('Model did not return JSON')
  }
}


/**
 * Generate a concise, investor-ready pitch deck outline following a strict slide structure.
 * Returns an array of 12 slides with: number, title, subtitle, bullets[], and optional metrics.
 */
export async function generatePitchDeckWithAnthropic({ profile, apiKey }) {
  if (!apiKey) throw new Error('Missing Anthropic API key')

  const voiceTone = profile?.brandTone || 'clear, confident, concise'
  const startupName = profile?.startupName || 'The Startup'

  const system = `You are a world-class startup storyteller crafting a crisp, investor-ready pitch deck outline.

Rules:
- Output ONLY valid JSON (no backticks, no prose), an array of EXACTLY 12 slides, numbered 0-free (1..12).
- Each slide has the shape:
  {
    "number": 1-12,
    "title": "",
    "subtitle": "",
    "bullets": ["3-6 short bullets, <= 16 words each"],
    "metrics": {"note": "optional: for unit economics (slide 4) and projections (slide 5)"}
  }
- Style and phrasing must follow the brand tone: ${voiceTone}.
- Keep it factual, specific, no fluff. Prioritize clarity over hype.

Slide structure (exact order, titles can be improved but keep meaning):
1. Motivation
2. Market pain / size / growth + target customers
3. Product solving the pain
4. Competition and moat
5. Business model / unit metrics
6. Cash-flow projections (5 years)
7. Risk analysis and mitigation
8. Team + who’s missing
9. Go to market
10. Technology (scaling) and Processes
11. What has been done so far (contracts, POCs, MVP, incorporation)
12. Deal offered + use of proceeds + milestones for this round
`

  const prompt = `Startup profile context:
${JSON.stringify({
  name: startupName,
  brandTone: voiceTone,
  linkedin: profile?.linkedin || '',
  problem: profile?.problem || '',
  solution: profile?.solution || '',
  milestones: profile?.milestones || '',
  notes: profile?.notes || '',
  launchWeeks: profile?.launchWeeks || '',
}, null, 2)}

Return ONLY a JSON array with 12 items in the specified order. Avoid duplicates. If information is missing, infer carefully and keep conservative.`

  const url = (import.meta.env.DEV ? '/anthropic' : 'https://api.anthropic.com') + '/v1/messages'
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      max_tokens: 2200,
      system,
      messages: [
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Anthropic error ${res.status}: ${text}`)
  }

  const data = await res.json()
  const text = data?.content?.[0]?.text ?? ''
  try {
    const parsed = JSON.parse(text)
    if (!Array.isArray(parsed)) throw new Error('Expected array')
    return parsed
  } catch {
    const match = text.match(/\[[\s\S]*\]/)
    if (match) {
      try { return JSON.parse(match[0]) } catch {}
    }
    throw new Error('Model did not return JSON')
  }
}


