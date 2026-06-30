import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import CheckItem from './CheckItem.jsx'

function ScoreBadge({ score }) {
  const color = score >= 80 ? 'bg-[#edfaf7] text-[#0f7b6c]'
    : score >= 50 ? 'bg-[#fffbeb] text-[#b45309]'
    : 'bg-[#fef2f2] text-[#c0392b]'

  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {score}%
    </span>
  )
}

export default function CategoryCard({ category }) {
  const [open, setOpen] = useState(true)
  const passCount = category.checks.filter(c => c.status === 'pass').length
  const total = category.checks.length

  return (
    <div className="notion-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#f7f7f5] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{category.icon}</span>
          <div>
            <h3 className="text-sm font-semibold text-[#37352f]">{category.label}</h3>
            <p className="text-xs text-[#787774]">{passCount} / {total} checks correctos</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ScoreBadge score={category.score} />
          {open
            ? <ChevronUp className="w-4 h-4 text-[#b0aea8]" />
            : <ChevronDown className="w-4 h-4 text-[#b0aea8]" />
          }
        </div>
      </button>

      {open && (
        <div className="px-5 pb-4 space-y-2 border-t border-[#e9e9e7] pt-4">
          {category.checks.map(check => (
            <CheckItem key={check.id} check={check} />
          ))}
        </div>
      )}
    </div>
  )
}
