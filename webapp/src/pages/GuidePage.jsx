import { useState } from 'react'
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, AlertTriangle, Info, Download } from 'lucide-react'

const SECTIONS = [
  {
    id: 'que-es',
    title: '¿Qué es Nexbu Check?',
    content: (
      <div className="space-y-3 text-sm text-[#78716c] leading-relaxed">
        <p>
          Nexbu Check es una herramienta de auditoría automatizada para sitios WordPress.
          Analiza tu sitio desde afuera — sin instalar nada — y detecta problemas de
          seguridad, SEO, rendimiento y contenido.
        </p>
        <p>
          Para una auditoría completa al 100%, puedes instalar el <strong className="text-[#1c1917]">plugin companion</strong> en
          tu WordPress. Este expone un endpoint autenticado con datos internos que
          no son accesibles públicamente.
        </p>
      </div>
    ),
  },
  {
    id: 'como-usar',
    title: 'Cómo usar',
    content: (
      <ol className="space-y-4">
        {[
          {
            n: '1',
            title: 'Ingresa la URL',
            desc: 'Escribe la URL completa de tu sitio WordPress (ej. https://ejemplo.com). No necesitas instalar nada.',
          },
          {
            n: '2',
            title: 'Opcional: conecta el plugin',
            desc: 'Si instalaste el plugin Nexbu Check en tu WordPress, activa el toggle "Tengo el plugin instalado" y pega la API Key. Esto habilita 8 checks adicionales internos.',
          },
          {
            n: '3',
            title: 'Analiza',
            desc: 'Haz clic en "Analizar sitio". El proceso tarda entre 10 y 20 segundos dependiendo del servidor del sitio.',
          },
          {
            n: '4',
            title: 'Revisa los resultados',
            desc: 'Obtendrás un score general y un desglose por categoría. Cada check muestra su estado y una descripción del problema o confirmación.',
          },
        ].map(step => (
          <li key={step.n} className="flex gap-4">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#1c1917] text-white text-xs font-bold flex items-center justify-center mt-0.5">
              {step.n}
            </span>
            <div>
              <p className="text-sm font-semibold text-[#1c1917]">{step.title}</p>
              <p className="text-sm text-[#78716c] mt-0.5 leading-relaxed">{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    ),
  },
  {
    id: 'estados',
    title: 'Estados de cada check',
    content: (
      <div className="space-y-3">
        {[
          {
            Icon: CheckCircle2,
            color: 'text-[#166534]',
            bg: 'bg-[#f0fdf4]',
            border: 'border-[#bbf7d0]',
            label: 'Correcto',
            desc: 'El check pasó sin problemas.',
          },
          {
            Icon: XCircle,
            color: 'text-[#9f1239]',
            bg: 'bg-[#fff1f2]',
            border: 'border-[#fecdd3]',
            label: 'Error',
            desc: 'Se detectó un problema que afecta al sitio. Requiere acción.',
          },
          {
            Icon: AlertTriangle,
            color: 'text-[#92400e]',
            bg: 'bg-[#fffbeb]',
            border: 'border-[#fde68a]',
            label: 'Aviso',
            desc: 'No es crítico pero es recomendable revisarlo.',
          },
          {
            Icon: Info,
            color: 'text-[#1e40af]',
            bg: 'bg-[#eff6ff]',
            border: 'border-[#bfdbfe]',
            label: 'Manual',
            desc: 'No se puede verificar automáticamente. Requiere revisión humana.',
          },
        ].map(({ Icon, color, bg, border, label, desc }) => (
          <div key={label} className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${bg} ${border}`}>
            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
            <div>
              <p className={`text-sm font-semibold ${color}`}>{label}</p>
              <p className="text-xs text-[#78716c] mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'checks-seguridad',
    title: '🔒 Checks de Seguridad',
    icon: '/seguridad.png',
    content: (
      <CheckTable rows={[
        ['SSL activo y forzado', 'Verifica que el sitio usa HTTPS y que HTTP redirige con código 301.'],
        ['Versión de WordPress oculta', 'Detecta si la versión WP está expuesta en el meta generator, readme.html o /wp-json.'],
        ['XML-RPC deshabilitado', 'Comprueba si xmlrpc.php responde — es el vector de fuerza bruta más común.'],
        ['wp-login.php protegido', 'Verifica si el acceso al login es directo, bloqueado o redirige a una URL personalizada.'],
        ['readme.html no accesible', 'Detecta si readme.html es público — revela la versión exacta de WordPress.'],
        ['Headers de seguridad HTTP', 'Revisa la presencia de HSTS, X-Frame-Options, X-Content-Type-Options y Referrer-Policy.'],
      ]} />
    ),
  },
  {
    id: 'checks-seo',
    title: '🔍 Checks de SEO',
    icon: '/search.png',
    content: (
      <CheckTable rows={[
        ['Meta título', 'Presente y con longitud correcta (10–65 caracteres).'],
        ['Meta descripción', 'Presente y con longitud correcta (50–160 caracteres).'],
        ['Canonical tag', 'Evita contenido duplicado — debe apuntar a la URL canónica.'],
        ['Estructura H1/H2', 'Exactamente 1 H1 por página y entre 1–6 H2 para estructurar el contenido.'],
        ['Open Graph', 'og:title, og:description y og:image presentes para compartir en redes.'],
        ['Schema.org', 'Datos estructurados JSON-LD o microdata según el tipo de contenido.'],
        ['Alt en imágenes', 'Todas las imágenes deben tener atributo alt descriptivo.'],
        ['Analytics', 'Detecta GA4, Google Tag Manager o Meta Pixel en el código fuente.'],
        ['Indexación', 'Verifica que no haya meta robots noindex bloqueando la página.'],
        ['robots.txt', 'Existe, no bloquea todo el sitio y referencia al Sitemap.'],
        ['Sitemap XML', 'sitemap.xml o sitemap_index.xml accesible públicamente.'],
        ['llms.txt', 'Estándar emergente que ayuda a los modelos de lenguaje a entender el sitio.'],
      ]} />
    ),
  },
  {
    id: 'checks-contenido',
    title: '⚡ Checks de Contenido y Rendimiento',
    icon: '/rendimiento.png',
    content: (
      <CheckTable rows={[
        ['Favicon', 'Configurado en el sitio.'],
        ['Página 404 personalizada', 'El servidor responde con código 404 real y tiene contenido personalizado.'],
        ['Compresión GZIP / Brotli', 'El servidor comprime las respuestas para reducir el tiempo de carga.'],
        ['HTTPS consistente', 'La URL final de la homepage está en HTTPS.'],
        ['Páginas legales', 'Detecta privacidad, términos y condiciones y política de cookies.'],
        ['Páginas WooCommerce', 'Si se detecta WooCommerce, verifica carrito, checkout y mi cuenta.'],
      ]} />
    ),
  },
  {
    id: 'plugin',
    title: '🔌 Plugin companion — checks internos',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-[#78716c] leading-relaxed">
          El plugin Nexbu Check se instala en tu WordPress y expone el endpoint
          <code className="mx-1 px-1.5 py-0.5 bg-[#f5f5f4] border border-[#e7e5e4] rounded text-xs text-[#1c1917]">
            tusitio.com/nexbu-check/
          </code>
          con datos internos autenticados. Agrega 8 checks adicionales:
        </p>
        <CheckTable rows={[
          ['Child theme', 'El sitio trabaja sobre un child theme, no directamente sobre el tema padre.'],
          ['Usuario "admin"', 'No existe ningún usuario con el nombre de usuario "admin".'],
          ['WP_DEBUG deshabilitado', 'El modo debug está desactivado en producción.'],
          ['Indexación desde WP', '"Desalentar a los motores de búsqueda" está desactivado en los ajustes.'],
          ['Plugin de caché', 'Detecta WP Rocket, W3 Total Cache, LiteSpeed Cache u otros.'],
          ['Plugin de backups', 'Detecta UpdraftPlus, BackupBuddy, BackWPup u otros.'],
          ['Plugins actualizados', 'Todos los plugins activos están en su última versión.'],
          ['Base de datos', 'Menos de 500 revisiones acumuladas — señal de BD limpia.'],
        ]} />

        <div className="pt-2">
          <a
            href="/downloads/nexbu-check-plugin.zip"
            download
            className="btn-primary inline-flex"
          >
            <Download className="w-4 h-4" />
            Descargar plugin (.zip)
          </a>
          <p className="text-xs text-[#a8a29e] mt-2">
            Instálalo en WordPress → Plugins → Subir plugin. Luego genera la API Key en Ajustes → Nexbu Check.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'faq',
    title: 'Preguntas frecuentes',
    content: (
      <div className="space-y-4">
        {[
          {
            q: '¿Afecta el análisis al rendimiento de mi sitio?',
            a: 'Mínimamente. El análisis consiste en requests HTTP simples, similar a lo que hace un bot de búsqueda. No genera carga significativa.',
          },
          {
            q: '¿Es seguro instalar el plugin?',
            a: 'Sí. El plugin solo expone datos de lectura. La API Key se guarda como hash y nunca en texto plano. El endpoint solo responde a requests autenticados y con CORS restringido a check.nexbu.com.',
          },
          {
            q: '¿Con qué frecuencia debo auditar mi sitio?',
            a: 'Recomendamos hacerlo antes de cada lanzamiento o actualización importante, y al menos una vez al mes como mantenimiento rutinario.',
          },
          {
            q: '¿Qué hago si un check falla?',
            a: 'Cada check incluye un mensaje descriptivo del problema. En la mayoría de los casos indica exactamente qué configurar y en algunos casos qué plugin instalar.',
          },
          {
            q: '¿Funciona con cualquier WordPress?',
            a: 'Los checks externos funcionan con cualquier sitio web, no solo WordPress. Los checks del plugin requieren WordPress 6.4+ y PHP 8.0+.',
          },
        ].map(({ q, a }) => (
          <div key={q} className="border-b border-[#e7e5e4] pb-4 last:border-0 last:pb-0">
            <p className="text-sm font-semibold text-[#1c1917]">{q}</p>
            <p className="text-sm text-[#78716c] mt-1 leading-relaxed">{a}</p>
          </div>
        ))}
      </div>
    ),
  },
]

function CheckTable({ rows }) {
  return (
    <div className="divide-y divide-[#e7e5e4]">
      {rows.map(([title, desc]) => (
        <div key={title} className="flex gap-3 py-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#a8a29e] mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-[#1c1917]">{title}</p>
            <p className="text-xs text-[#78716c] mt-0.5">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function Accordion({ section }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#f5f5f4] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {section.icon
            ? <img src={section.icon} alt="" className="w-7 h-7 object-contain" />
            : <span className="text-base">{section.title.split(' ')[0]}</span>
          }
          <h2 className="text-sm font-semibold text-[#1c1917]">
            {section.icon ? section.title.replace(/^[^\s]+\s/, '') : section.title}
          </h2>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-[#a8a29e] shrink-0" />
          : <ChevronDown className="w-4 h-4 text-[#a8a29e] shrink-0" />
        }
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-[#e7e5e4] pt-4">
          {section.content}
        </div>
      )}
    </div>
  )
}

export default function GuidePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-4">
      <div className="space-y-1 pb-2">
        <h1 className="text-2xl font-semibold text-[#1c1917] tracking-tight">Guía de uso</h1>
        <p className="text-sm text-[#78716c]">Todo lo que necesitas saber para sacarle partido a Nexbu Check.</p>
      </div>

      {SECTIONS.map(section => (
        <Accordion key={section.id} section={section} />
      ))}

      <p className="text-center text-xs text-[#a8a29e] py-4">
        <a href="https://nexbu.com" target="_blank" rel="noopener noreferrer">
          <img src="/logo-nexbu.png" alt="Nexbu" className="h-4 w-auto inline-block opacity-40 hover:opacity-70 transition-opacity" />
        </a>
      </p>
    </main>
  )
}
