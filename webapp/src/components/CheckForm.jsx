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
        <h2 className="text-2xl font-semibold text-[#37352f] tracking-tight">
          Analiza tu sitio WordPress
        </h2>
        <p className="text-[#787774] text-sm max-w-md mx-auto">
          Verifica seguridad, SEO, rendimiento y contenido automáticamente.
          Para el 100%, instala el plugin companion.
        </p>
      </div>

      {/* Form card */}
      <div className="notion-card p-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#787774] uppercase tracking-wide">
              URL del sitio
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b0aea8]" />
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://ejemplo.com"
                className="notion-input pl-9"
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
              className="notion-btn-ghost text-xs"
            >
              {showPlugin ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {showPlugin ? 'Ocultar' : 'Tengo el plugin Nexbu instalado'}
            </button>

            {showPlugin && (
              <div className="mt-3 space-y-1.5">
                <label className="text-xs font-medium text-[#787774] uppercase tracking-wide">
                  API Key del plugin
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b0aea8]" />
                  <input
                    type="password"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="Pega aquí la API Key generada en el plugin"
                    className="notion-input pl-9"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-[#787774]">
                  Genera la API Key en WordPress → Ajustes → Nexbu Check
                </p>
                <a
                  href="/downloads/nexbu-check-plugin.zip"
                  download
                  className="inline-flex items-center gap-1.5 text-xs text-[#2383e2] hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  ¿No lo tienes instalado? Descargar plugin (.zip)
                </a>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="notion-btn-primary w-full justify-center py-2.5"
          >
            {loading ? 'Analizando...' : 'Analizar sitio'}
          </button>
        </form>
      </div>

      {/* What we check */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: '🔒', label: 'Seguridad' },
          { icon: '🔍', label: 'SEO' },
          { icon: '⚡', label: 'Rendimiento' },
          { icon: '📄', label: 'Contenido' },
        ].map(item => (
          <div key={item.label} className="notion-card p-3 text-center space-y-1">
            <div className="text-xl">{item.icon}</div>
            <div className="text-xs text-[#787774] font-medium">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
