import { useState } from 'react'
import Header from './components/Header.jsx'
import CheckForm from './components/CheckForm.jsx'
import CheckProgress from './components/CheckProgress.jsx'
import CheckResults from './components/CheckResults.jsx'

export default function App() {
  const [phase, setPhase] = useState('idle') // idle | checking | done
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
    <div className="min-h-screen bg-[#f7f7f5]">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-10">
        {phase === 'idle' && (
          <CheckForm onSubmit={handleSubmit} error={error} />
        )}
        {phase === 'checking' && (
          <CheckProgress />
        )}
        {phase === 'done' && results && (
          <CheckResults results={results} onReset={handleReset} />
        )}
      </main>
    </div>
  )
}
