export function BackgroundOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 right-[-10%] h-[60vmin] w-[60vmin] rounded-full opacity-40 blur-3xl" style={{background:'radial-gradient(closest-side, rgba(167,139,250,0.35), transparent)'}} />
      <div className="absolute top-[40%] -left-20 h-[50vmin] w-[50vmin] rounded-full opacity-30 blur-3xl" style={{background:'radial-gradient(closest-side, rgba(34,211,238,0.25), transparent)'}} />
      <div className="absolute bottom-[-10%] right-[10%] h-[40vmin] w-[40vmin] rounded-full opacity-30 blur-3xl" style={{background:'radial-gradient(closest-side, rgba(255,77,141,0.18), transparent)'}} />
    </div>
  )
}


