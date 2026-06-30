import { RotateCcw, ExternalLink } from 'lucide-react'
import CategoryCard from './CategoryCard.jsx'

function ScoreCircle({ score }) {
  const color = score >= 80 ? '#0f7b6c' : score >= 50 ? '#b45309' : '#c0392b'
  const label = score >= 80 ? 'Excelente' : score >= 50 ? 'Regular' : 'Necesita trabajo'
  const circumference = 2 * Math.PI * 40
  const dash = (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#e9e9e7" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.6s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold" style={{ color }}>{score}</span>
        </div>
      </div>
      <span className="text-xs text-[#787774] font-medium">{label}</span>
    </div>
  )
}

export default function CheckResults({ results, onReset }) {
  const passCount = results.categories.flatMap(c => c.checks).filter(c => c.status === 'pass').length
  const totalCount = results.categories.flatMap(c => c.checks).length
  const checkedAt = new Date(results.checkedAt).toLocaleString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <div className="notion-card p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-5">
            <ScoreCircle score={results.score} />
            <div className="space-y-1">
              <p className="text-xs text-[#787774] flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3" />
                <a
                  href={results.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#2383e2] transition-colors"
                >
                  {results.url}
                </a>
              </p>
              <p className="text-2xl font-semibold text-[#37352f]">
                {passCount} <span className="text-[#787774] text-base font-normal">/ {totalCount} checks</span>
              </p>
              <p className="text-xs text-[#b0aea8]">Analizado el {checkedAt}</p>
              {results.hasPlugin && (
                <span className="inline-flex items-center gap-1 text-xs bg-[#eff6ff] text-[#1d6fa4] border border-[#bfdbfe] px-2 py-0.5 rounded-full">
                  🔌 Plugin conectado
                </span>
              )}
            </div>
          </div>

          <button onClick={onReset} className="notion-btn-ghost">
            <RotateCcw className="w-3.5 h-3.5" />
            Nuevo análisis
          </button>
        </div>
      </div>

      {/* Categories */}
      {results.categories.map(category => (
        <CategoryCard key={category.id} category={category} />
      ))}

      {/* Footer */}
      <p className="text-center text-xs text-[#b0aea8] py-4">
        Nexbu Check — by{' '}
        <a href="https://jjrc.dev" target="_blank" rel="noopener noreferrer" className="hover:text-[#2383e2]">
          jjrc.dev
        </a>
      </p>
    </div>
  )
}
