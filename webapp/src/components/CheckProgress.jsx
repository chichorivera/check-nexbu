import { useEffect, useState } from 'react'

const STEPS = [
  'Verificando SSL y HTTPS…',
  'Comprobando seguridad de WordPress…',
  'Analizando XML-RPC y accesos…',
  'Revisando headers de seguridad…',
  'Buscando robots.txt y sitemap…',
  'Verificando llms.txt…',
  'Analizando meta tags y SEO…',
  'Revisando estructura de encabezados…',
  'Comprobando Open Graph y Schema…',
  'Verificando analytics y tracking…',
  'Revisando páginas de contenido…',
  'Comprobando favicon y 404…',
  'Buscando páginas legales…',
  'Calculando puntuación final…',
]

export default function CheckProgress() {
  const [stepIndex, setStepIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const total = 14000
    const interval = 100
    let elapsed = 0

    const timer = setInterval(() => {
      elapsed += interval
      const raw = elapsed / total
      // Ease out: advances fast at start, slows near end
      const eased = raw < 0.9 ? raw / 0.9 * 0.92 : 0.92 + (raw - 0.9) / 0.1 * 0.05
      setProgress(Math.min(eased * 100, 97))
      setStepIndex(Math.min(Math.floor(raw * STEPS.length), STEPS.length - 1))
    }, interval)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="notion-card p-8 text-center space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-[#37352f]">Analizando el sitio</h2>
        <p className="text-sm text-[#787774]">{STEPS[stepIndex]}</p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="h-1.5 bg-[#e9e9e7] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2383e2] rounded-full transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-[#b0aea8]">{Math.round(progress)}%</p>
      </div>

      <div className="flex justify-center gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#2383e2] animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}
