import { useState } from 'react'
import { Globe, Key, ChevronDown, ChevronUp, AlertCircle, Download } from 'lucide-react'

export default function CheckForm({ onSubmit, error }) {
  const [url, setUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [showPlugin, setShowPlugin] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    await onSubmit(url.trim(), showPlugin ? apiKey.trim() : null)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center space-y-2 py-4">
        <h2 className="text-2xl font-semibold text-[#1c1917] tracking-tight">
          Auditoría WordPress
        </h2>
        <p className="text-[#78716c] text-sm max-w-md mx-auto">
          Verifica seguridad, SEO, rendimiento y contenido automáticamente.
          Instala el plugin companion para llegar al 100%.
        </p>
      </div>

      {/* Form card */}
      <div className="card p-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#78716c] uppercase tracking-wide">
              URL del sitio
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a8a29e]" />
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://ejemplo.com"
                className="input pl-9"
                required
                autoFocus
                disabled={loading}
              />
            </div>
          </div>

          {/* Plugin toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowPlugin(!showPlugin)}
              className="btn-ghost text-xs"
            >
              {showPlugin ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {showPlugin ? 'Ocultar' : 'Tengo el plugin Nexbu instalado'}
            </button>

            {showPlugin && (
              <div className="mt-3 space-y-2 pl-1">
                <label className="text-xs font-medium text-[#78716c] uppercase tracking-wide">
                  API Key del plugin
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a8a29e]" />
                  <input
                    type="password"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="Pega aquí la API Key generada en el plugin"
                    className="input pl-9"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-[#78716c]">
                  Genera la API Key en WordPress → Ajustes → Nexbu Check
                </p>
                <a
                  href="/downloads/nexbu-check-plugin.zip"
                  download
                  className="inline-flex items-center gap-1.5 text-xs text-[#1c1917] font-medium hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  ¿No lo tienes? Descargar plugin (.zip)
                </a>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[#fff1f2] border border-[#fecdd3]">
              <AlertCircle className="w-4 h-4 text-[#9f1239] mt-0.5 shrink-0" />
              <p className="text-xs text-[#9f1239]">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="btn-primary w-full justify-center py-2.5"
          >
            {loading ? 'Analizando...' : 'Analizar sitio'}
          </button>
        </form>
      </div>

      {/* What we check */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: '/seguridad.png', label: 'Seguridad' },
          { icon: '/search.png', label: 'SEO' },
          { icon: '/rendimiento.png', label: 'Rendimiento' },
          { icon: '/contenido.png', label: 'Contenido' },
        ].map(item => (
          <div key={item.label} className="card p-3 text-center space-y-2">
            <img src={item.icon} alt={item.label} className="w-10 h-10 object-contain mx-auto" />
            <div className="text-xs text-[#78716c] font-medium">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
