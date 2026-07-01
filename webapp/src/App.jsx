import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import CheckForm from './components/CheckForm.jsx'
import CheckProgress from './components/CheckProgress.jsx'
import CheckResults from './components/CheckResults.jsx'
import GuidePage from './pages/GuidePage.jsx'

function HomePage() {
  const [phase, setPhase] = useState('idle')
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  async function handleSubmit(url, apiKey) {
    setPhase('checking')
    setError(null)
    setResults(null)

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, apiKey: apiKey || null }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Error del servidor' }))
        throw new Error(err.error || `Error ${res.status}`)
      }

      const data = await res.json()
      setResults(data)
      setPhase('done')
    } catch (err) {
      setError(err.message)
      setPhase('idle')
    }
  }

  function handleReset() {
    setPhase('idle')
    setResults(null)
    setError(null)
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      {phase === 'idle' && <CheckForm onSubmit={handleSubmit} error={error} />}
      {phase === 'checking' && <CheckProgress />}
      {phase === 'done' && results && <CheckResults results={results} onReset={handleReset} />}
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f5f5f4]">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/guia" element={<GuidePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
