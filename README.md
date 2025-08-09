# React + Vite


I am write:


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


          
Guys, this is general information about the tech stack for the frontend:

### Tech stack overview
- **Runtime/UI**: React 19 (`react`, `react-dom`) with `StrictMode`
- **Routing**: React Router v7 (`BrowserRouter`, `Routes`, `Route`, `Navigate`)
- **Build tool**: Vite 7 with `@vitejs/plugin-react` (fast dev server, ESM, HMR)
- **Styling**: Tailwind CSS v4 (utility-first) + PostCSS; custom design tokens in `src/index.css`
- **Animation**: Framer Motion (available; integrate in components as needed)

### How it fits together
- **Entry**: `index.html` mounts `#root`; `src/main.jsx` renders `<App />` inside `StrictMode`.
- **Routing**: `src/App.jsx` defines routes:
  - `/` → `Landing`
  - `/start` → `Onboarding`
  - `/creating` → `Loading`
  - `/app/*` → `Dashboard`
  - fallback → redirect to `/start`
- **Layout**: `src/components/AppShell.jsx` provides header/nav/footer and backdrop effects; pages render as children inside this shell.
- **Styling**: `tailwind.config.js` scans `index.html` and all files under `src/`; `src/index.css` imports Tailwind and defines tokens (colors, gradients) plus utility classes like `.btn-primary`, `.glass`, `.input`.
- **Project type**: SPA, suitable for static hosting (Vercel/Netlify/GitHub Pages). No server-side code in this repo.

### Dev and build
- **Start dev server**:
  ```bash
  npm run dev
  ```
- **Production build**:
  ```bash
  npm run build
  ```
- **Preview production build locally**:
  ```bash
  npm run preview
  ```

### Extending
- **Animations**: Use `framer-motion` (`motion.div`, variants) for interactive UI in pages/components.
- **State/data**: Currently no global state lib; use React state/hooks or add one if needed.
- **Styling**: Add utilities or component classes in `src/index.css`; update `tailwind.config.js` if you add new content paths.

- Pushed to `https://github.com/EtienneLefranc/YCagenthackaton` on `main`.
This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
