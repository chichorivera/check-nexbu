import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react'

const STATUS_CONFIG = {
  pass: {
    Icon: CheckCircle2,
    color: 'text-[#166534]',
    bg: 'bg-[#f0fdf4]',
    border: 'border-[#bbf7d0]',
  },
  fail: {
    Icon: XCircle,
    color: 'text-[#9f1239]',
    bg: 'bg-[#fff1f2]',
    border: 'border-[#fecdd3]',
  },
  warning: {
    Icon: AlertTriangle,
    color: 'text-[#92400e]',
    bg: 'bg-[#fffbeb]',
    border: 'border-[#fde68a]',
  },
  manual: {
    Icon: Info,
    color: 'text-[#1e40af]',
    bg: 'bg-[#eff6ff]',
    border: 'border-[#bfdbfe]',
  },
}

export default function CheckItem({ check }) {
  const config = STATUS_CONFIG[check.status] || STATUS_CONFIG.manual
  const { Icon } = config

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${config.bg} ${config.border}`}>
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${config.color}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#1c1917] leading-tight">{check.title}</p>
        <p className="text-xs text-[#78716c] mt-0.5 leading-relaxed">{check.message}</p>
      </div>
    </div>
  )
}
