import { Download } from 'lucide-react'
import { NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header className="border-b border-[#e7e5e4] bg-white">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <NavLink to="/">
            <img src="/logo-nexbu.png" alt="Nexbu" className="h-7 w-auto" />
          </NavLink>

          <nav className="flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `text-xs px-3 py-1.5 rounded-lg transition-colors duration-150 font-medium
                ${isActive
                  ? 'bg-[#f0efee] text-[#1c1917]'
                  : 'text-[#78716c] hover:bg-[#f0efee] hover:text-[#1c1917]'
                }`
              }
            >
              Auditoría
            </NavLink>
            <NavLink
              to="/guia"
              className={({ isActive }) =>
                `text-xs px-3 py-1.5 rounded-lg transition-colors duration-150 font-medium
                ${isActive
                  ? 'bg-[#f0efee] text-[#1c1917]'
                  : 'text-[#78716c] hover:bg-[#f0efee] hover:text-[#1c1917]'
                }`
              }
            >
              Guía
            </NavLink>
          </nav>
        </div>

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
