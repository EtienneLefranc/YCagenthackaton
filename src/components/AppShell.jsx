import { Link } from 'react-router-dom'
import { BackgroundOrbs } from './BackgroundOrbs.jsx'
import { Logo } from './Logo.jsx'

export function AppShell({ children }) {
  return (
    <div className="min-h-dvh w-full">
      <BackgroundOrbs />
      <header className="sticky top-0 z-10 backdrop-blur border-b border-white/10 bg-black/10">
        <div className="mx-auto max-w-7xl px-4 md:px-6 h-16 flex items-center justify-between overflow-hidden">
          <Link to="/" className="flex items-center gap-3">
            <Logo size={36} />
            <div className="text-lg" style={{fontFamily:'Space Grotesk, ui-sans-serif, system-ui'}}>Glow.Up</div>
          </Link>
          <nav className="hidden lg:flex items-center gap-6 text-sm text-white/70 flex-shrink-0">
            <Link className="hover:text-white" to="/">Home</Link>
            <Link className="hover:text-white" to="/start">Get started</Link>
            <Link className="hover:text-white" to="/app">Dashboard</Link>
          </nav>
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <a href="mailto:marianai@stanford.edu" className="btn-ghost">Feedback</a>
            <button className="btn-primary">Upgrade</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 smd:px-6 py-8 md:py-12">
        {children}
      </main>
      <footer className="border-t border-white/10 py-6 text-center text-xs text-white/50 mt-10">© {new Date().getFullYear()} Glow.Up — Launch faster with your AI operator</footer>
    </div>
  )
}


