import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Onboarding } from './pages/Onboarding.jsx'
import { Loading } from './pages/Loading.jsx'
import { Dashboard } from './pages/Dashboard.jsx'
import { Landing } from './pages/Landing.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/start" element={<Onboarding />} />
        <Route path="/creating" element={<Loading />} />
        <Route path="/app/*" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/start" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
