export function Logo({ size = 36 }) {
  const dim = typeof size === 'number' ? `${size}px` : size
  return (
    <div
      className="grid place-items-center rounded-xl bg-gradient-to-br from-purple-400 to-cyan-300"
      style={{ width: dim, height: dim }}
      aria-label="Glow.Up logo"
    >
      <svg
        width="70%"
        height="70%"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-hidden="true"
      >
        {/* Body */}
        <rect x="47" y="35" width="6" height="30" rx="3" fill="#000000" />
        {/* Top wings */}
        <circle cx="30" cy="40" r="18" fill="#000000" />
        <circle cx="70" cy="40" r="18" fill="#000000" />
        {/* Bottom wings */}
        <circle cx="34" cy="64" r="14" fill="#000000" />
        <circle cx="66" cy="64" r="14" fill="#000000" />
        {/* Antennae */}
        <path d="M50 35 C45 25, 38 22, 32 24" stroke="#000000" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M50 35 C55 25, 62 22, 68 24" stroke="#000000" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  )
}


