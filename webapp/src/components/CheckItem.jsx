import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react'

const STATUS_CONFIG = {
  pass: {
    Icon: CheckCircle2,
    color: 'text-[#0f7b6c]',
    bg: 'bg-[#edfaf7]',
    border: 'border-[#b2e8df]',
    label: 'OK',
  },
  fail: {
    Icon: XCircle,
    color: 'text-[#c0392b]',
    bg: 'bg-[#fef2f2]',
    border: 'border-[#fecaca]',
    label: 'Error',
  },
  warning: {
    Icon: AlertTriangle,
    color: 'text-[#b45309]',
    bg: 'bg-[#fffbeb]',
    border: 'border-[#fde68a]',
    label: 'Aviso',
  },
  manual: {
    Icon: Info,
    color: 'text-[#1d6fa4]',
    bg: 'bg-[#eff6ff]',
    border: 'border-[#bfdbfe]',
    label: 'Manual',
  },
}

export default function CheckItem({ check }) {
  const config = STATUS_CONFIG[check.status] || STATUS_CONFIG.manual
  const { Icon } = config

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-md border ${config.bg} ${config.border}`}>
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${config.color}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#37352f] leading-tight">{check.title}</p>
        <p className="text-xs text-[#787774] mt-0.5 leading-relaxed">{check.message}</p>
      </div>
    </div>
  )
}
