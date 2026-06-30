import { Download } from 'lucide-react'

export default function Header() {
  return (
    <header className="border-b border-[#e7e5e4] bg-white">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <img
          src="/logo-nexbu.png"
          alt="Nexbu"
          className="h-7 w-auto"
        />

        <a
          href="/downloads/nexbu-check-plugin.zip"
          download
          className="btn-ghost text-xs shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Descargar plugin</span>
        </a>
      </div>
    </header>
  )
}
