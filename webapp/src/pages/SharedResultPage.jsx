import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import CheckResults from '../components/CheckResults.jsx'

function Skeleton() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-4">
      <div className="card p-6 animate-pulse">
        <div className="flex items-center gap-5">
          <div className="w-24 h-24 rounded-full bg-[#e7e5e4]" />
          <div className="space-y-2 flex-1">
            <div className="h-3 w-48 bg-[#e7e5e4] rounded" />
            <div className="h-7 w-32 bg-[#e7e5e4] rounded" />
            <div className="h-3 w-40 bg-[#e7e5e4] rounded" />
          </div>
        </div>
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="card p-5 animate-pulse">
          <div className="h-4 w-36 bg-[#e7e5e4] rounded" />
        </div>
      ))}
    </main>
  )
}

function NotFound() {
  const navigate = useNavigate()
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <div className="card p-10 flex flex-col items-center gap-4 text-center">
        <p className="text-4xl">🔍</p>
        <h1 className="text-lg font-semibold text-[#1c1917]">Análisis no encontrado</h1>
        <p className="text-sm text-[#78716c] max-w-sm">
          Este enlace puede haber expirado o ser inválido. Los análisis se almacenan por tiempo limitado.
        </p>
        <button onClick={() => navigate('/')} className="btn-primary mt-2">
          Analizar un sitio
        </button>
      </div>
    </main>
  )
}

export default function SharedResultPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [state, setState] = useState('loading')
  const [results, setResults] = useState(null)

  useEffect(() => {
    fetch(`/api/r/${id}`)
      .then(res => {
        if (res.status === 404) throw new Error('notfound')
        if (!res.ok) throw new Error('error')
        return res.json()
      })
      .then(data => {
        setResults({ ...data, shareId: id })
        setState('found')
      })
      .catch(err => {
        setState(err.message === 'notfound' ? 'notfound' : 'error')
      })
  }, [id])

  if (state === 'loading') return <Skeleton />
  if (state === 'notfound' || state === 'error') return <NotFound />

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <CheckResults
        results={results}
        onReset={() => navigate('/')}
        resetLabel="Analizar mi sitio"
      />
    </main>
  )
}
