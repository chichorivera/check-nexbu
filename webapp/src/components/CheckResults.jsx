import { useState } from 'react'
import { RotateCcw, ExternalLink, Copy, Check } from 'lucide-react'
import CategoryCard from './CategoryCard.jsx'

function ScoreCircle({ score }) {
  const color = score >= 80 ? '#166534' : score >= 50 ? '#92400e' : '#9f1239'
  const label = score >= 80 ? 'Excelente' : score >= 50 ? 'Regular' : 'Necesita trabajo'
  const circumference = 2 * Math.PI * 40
  const dash = (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#e7e5e4" strokeWidth="7" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke={color} strokeWidth="7"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.6s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-[#1c1917]">{score}</span>
        </div>
      </div>
      <span className="text-xs text-[#78716c] font-medium">{label}</span>
    </div>
  )
}

function ShareBar({ shareId }) {
  const [copied, setCopied] = useState(false)
  const shareUrl = `${window.location.origin}/r/${shareId}`

  function copy() {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="border-t border-[#e7e5e4] pt-4 mt-4">
      <p className="text-xs font-medium text-[#78716c] mb-2">Enlace para compartir</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 bg-[#f5f5f4] border border-[#e7e5e4] rounded-lg px-3 py-2">
          <p className="text-xs text-[#78716c] font-mono truncate">{shareUrl}</p>
        </div>
        <button
          onClick={copy}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            copied
              ? 'bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]'
              : 'bg-[#1c1917] text-white hover:bg-[#374151]'
          }`}
        >
          {copied
            ? <><Check className="w-3.5 h-3.5" />Copiado</>
            : <><Copy className="w-3.5 h-3.5" />Copiar enlace</>
          }
        </button>
      </div>
    </div>
  )
}

export default function CheckResults({ results, onReset, resetLabel = 'Nuevo análisis' }) {
  const passCount = results.categories.flatMap(c => c.checks).filter(c => c.status === 'pass').length
  const totalCount = results.categories.flatMap(c => c.checks).length
  const checkedAt = new Date(results.checkedAt).toLocaleString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <div className="card p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-5">
            <ScoreCircle score={results.score} />
            <div className="space-y-1">
              <p className="text-xs text-[#78716c] flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3" />
                <a
                  href={results.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#1c1917] transition-colors"
                >
                  {results.url}
                </a>
              </p>
              <p className="text-2xl font-semibold text-[#1c1917]">
                {passCount} <span className="text-[#78716c] text-base font-normal">/ {totalCount} checks</span>
              </p>
              <p className="text-xs text-[#a8a29e]">Analizado el {checkedAt}</p>
              {results.hasPlugin && (
                <span className="inline-flex items-center gap-1 text-xs bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0] px-2 py-0.5 rounded-full">
                  🔌 Plugin conectado
                </span>
              )}
            </div>
          </div>

          <button onClick={onReset} className="btn-ghost">
            <RotateCcw className="w-3.5 h-3.5" />
            {resetLabel}
          </button>
        </div>

        {results.shareId && <ShareBar shareId={results.shareId} />}
      </div>

      {/* Categories */}
      {results.categories.map(category => (
        <CategoryCard key={category.id} category={category} />
      ))}

      {/* Footer */}
      <p className="text-center text-xs text-[#a8a29e] py-4">
        <a href="https://nexbu.com" target="_blank" rel="noopener noreferrer">
          <img src="/logo-nexbu.png" alt="Nexbu" className="h-4 w-auto inline-block opacity-40 hover:opacity-70 transition-opacity" />
        </a>
      </p>
    </div>
  )
}
