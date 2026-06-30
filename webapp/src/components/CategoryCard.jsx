import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import CheckItem from './CheckItem.jsx'

function ScoreBadge({ score }) {
  const style = score >= 80
    ? 'bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]'
    : score >= 50
    ? 'bg-[#fffbeb] text-[#92400e] border border-[#fde68a]'
    : 'bg-[#fff1f2] text-[#9f1239] border border-[#fecdd3]'

  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style}`}>
      {score}%
    </span>
  )
}

export default function CategoryCard({ category }) {
  const [open, setOpen] = useState(true)
  const passCount = category.checks.filter(c => c.status === 'pass').length
  const total = category.checks.length

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#f5f5f4] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{category.icon}</span>
          <div>
            <h3 className="text-sm font-semibold text-[#1c1917]">{category.label}</h3>
            <p className="text-xs text-[#78716c]">{passCount} / {total} checks correctos</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ScoreBadge score={category.score} />
          {open
            ? <ChevronUp className="w-4 h-4 text-[#a8a29e]" />
            : <ChevronDown className="w-4 h-4 text-[#a8a29e]" />
          }
        </div>
      </button>

      {open && (
        <div className="px-5 pb-4 space-y-2 border-t border-[#e7e5e4] pt-4">
          {category.checks.map(check => (
            <CheckItem key={check.id} check={check} />
          ))}
        </div>
      )}
    </div>
  )
}
