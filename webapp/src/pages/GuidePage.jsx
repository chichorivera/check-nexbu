import { useState } from 'react'
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, AlertTriangle, Info, Download, Copy, Check } from 'lucide-react'

/* ─── Primitivos ─────────────────────────────────────────────── */

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="relative group rounded-lg bg-[#1c1917] overflow-hidden">
      <pre className="text-xs text-[#d6d3d1] font-mono p-4 pr-12 overflow-x-auto leading-relaxed whitespace-pre-wrap break-all">
        {code}
      </pre>
      <button
        onClick={copy}
        className="absolute top-3 right-3 flex items-center gap-1 text-xs text-[#78716c] hover:text-[#d6d3d1] transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  )
}

function Label({ type }) {
  const config = {
    good: { text: 'Respuesta correcta', color: 'text-[#166534] bg-[#f0fdf4] border-[#bbf7d0]' },
    bad: { text: 'Respuesta incorrecta', color: 'text-[#9f1239] bg-[#fff1f2] border-[#fecdd3]' },
    fix: { text: 'Cómo resolverlo', color: 'text-[#1e40af] bg-[#eff6ff] border-[#bfdbfe]' },
    tip: { text: 'Nota', color: 'text-[#92400e] bg-[#fffbeb] border-[#fde68a]' },
  }
  const c = config[type]
  return (
    <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${c.color}`}>
      {c.text}
    </span>
  )
}

function CheckDetail({ title, why, curl, good, bad, fix, tip }) {
  return (
    <div className="border border-[#e7e5e4] rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-[#f5f5f4] border-b border-[#e7e5e4]">
        <p className="text-sm font-semibold text-[#1c1917]">{title}</p>
        {why && <p className="text-xs text-[#78716c] mt-0.5 leading-relaxed">{why}</p>}
      </div>
      <div className="p-4 space-y-3">
        {curl && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-[#78716c] uppercase tracking-wide">Probar con curl</p>
            <CodeBlock code={curl} />
          </div>
        )}
        {good && (
          <div className="space-y-1">
            <Label type="good" />
            <p className="text-xs text-[#166534] font-mono bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg px-3 py-2 leading-relaxed">
              {good}
            </p>
          </div>
        )}
        {bad && (
          <div className="space-y-1">
            <Label type="bad" />
            <p className="text-xs text-[#9f1239] font-mono bg-[#fff1f2] border border-[#fecdd3] rounded-lg px-3 py-2 leading-relaxed">
              {bad}
            </p>
          </div>
        )}
        {fix && (
          <div className="space-y-1">
            <Label type="fix" />
            <div className="text-xs text-[#1e40af] bg-[#eff6ff] border border-[#bfdbfe] rounded-lg px-3 py-2 leading-relaxed">
              {fix}
            </div>
          </div>
        )}
        {tip && (
          <div className="space-y-1">
            <Label type="tip" />
            <p className="text-xs text-[#92400e] bg-[#fffbeb] border border-[#fde68a] rounded-lg px-3 py-2 leading-relaxed">
              {tip}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function Accordion({ title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#f5f5f4] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {icon
            ? <img src={icon} alt="" className="w-7 h-7 object-contain" />
            : null
          }
          <h2 className="text-sm font-semibold text-[#1c1917]">{title}</h2>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-[#a8a29e] shrink-0" />
          : <ChevronDown className="w-4 h-4 text-[#a8a29e] shrink-0" />
        }
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-[#e7e5e4] pt-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status, label, desc }) {
  const config = {
    pass:    { Icon: CheckCircle2, color: 'text-[#166534]', bg: 'bg-[#f0fdf4]', border: 'border-[#bbf7d0]' },
    fail:    { Icon: XCircle,      color: 'text-[#9f1239]', bg: 'bg-[#fff1f2]', border: 'border-[#fecdd3]' },
    warning: { Icon: AlertTriangle,color: 'text-[#92400e]', bg: 'bg-[#fffbeb]', border: 'border-[#fde68a]' },
    manual:  { Icon: Info,         color: 'text-[#1e40af]', bg: 'bg-[#eff6ff]', border: 'border-[#bfdbfe]' },
  }
  const c = config[status]
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${c.bg} ${c.border}`}>
      <c.Icon className={`w-4 h-4 mt-0.5 shrink-0 ${c.color}`} />
      <div>
        <p className={`text-sm font-semibold ${c.color}`}>{label}</p>
        <p className="text-xs text-[#78716c] mt-0.5">{desc}</p>
      </div>
    </div>
  )
}

/* ─── Página ─────────────────────────────────────────────────── */

export default function GuidePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-4">

      <div className="space-y-1 pb-2">
        <h1 className="text-2xl font-semibold text-[#1c1917] tracking-tight">Guía de uso</h1>
        <p className="text-sm text-[#78716c]">
          Referencia completa de cada check con ejemplos prácticos para verificar y resolver problemas.
        </p>
      </div>

      {/* ── ¿Qué es? ─────────────────────────── */}
      <Accordion title="¿Qué es Nexbu Check?" defaultOpen>
        <div className="space-y-3 text-sm text-[#78716c] leading-relaxed">
          <p>
            Nexbu Check analiza un sitio WordPress haciendo requests HTTP desde afuera — como lo haría
            un buscador o un atacante — y cruza los resultados contra un checklist de buenas prácticas
            en seguridad, SEO, rendimiento y contenido.
          </p>
          <p>
            Para datos que solo existen dentro del servidor (plugins activos, configuración de WP,
            usuarios, base de datos), existe el <strong className="text-[#1c1917]">plugin companion</strong>.
            Al instalarlo, el sitio expone un endpoint autenticado con esa información interna.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {[
              { title: 'Sin plugin', desc: '23 checks automáticos. Solo necesitas la URL.', icon: '🌐' },
              { title: 'Con plugin', desc: '31 checks. Incluye datos internos del servidor WordPress.', icon: '🔌' },
            ].map(i => (
              <div key={i.title} className="border border-[#e7e5e4] rounded-xl p-4 space-y-1">
                <p className="text-base">{i.icon}</p>
                <p className="text-sm font-semibold text-[#1c1917]">{i.title}</p>
                <p className="text-xs text-[#78716c]">{i.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Accordion>

      {/* ── Cómo usar ────────────────────────── */}
      <Accordion title="Cómo usar">
        <ol className="space-y-5">
          {[
            {
              n: '1', title: 'Ingresa la URL',
              desc: 'Escribe la URL completa de tu WordPress (ej. https://ejemplo.com). No necesitas instalar nada para este paso.',
            },
            {
              n: '2', title: 'Opcional: conecta el plugin',
              desc: 'Si instalaste el plugin Nexbu Check, activa el toggle y pega la API Key que generaste en WordPress → Ajustes → Nexbu Check.',
            },
            {
              n: '3', title: 'Haz clic en "Analizar sitio"',
              desc: 'El proceso tarda entre 10 y 20 segundos. Se ejecutan todos los checks en paralelo para ser eficiente.',
            },
            {
              n: '4', title: 'Revisa los resultados',
              desc: 'Obtienes un score general y un desglose por categoría. Cada check muestra su estado y un mensaje explicativo.',
            },
          ].map(s => (
            <li key={s.n} className="flex gap-4">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#1c1917] text-white text-xs font-bold flex items-center justify-center mt-0.5">
                {s.n}
              </span>
              <div>
                <p className="text-sm font-semibold text-[#1c1917]">{s.title}</p>
                <p className="text-sm text-[#78716c] mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </Accordion>

      {/* ── Estados ──────────────────────────── */}
      <Accordion title="Cómo interpretar los resultados">
        <div className="space-y-3">
          <StatusBadge status="pass"    label="Correcto"  desc="El check pasó sin problemas. No se requiere acción." />
          <StatusBadge status="fail"    label="Error"     desc="Se detectó un problema. Requiere acción antes de ir a producción." />
          <StatusBadge status="warning" label="Aviso"     desc="No es crítico pero es recomendable revisarlo." />
          <StatusBadge status="manual"  label="Manual"    desc="No se puede verificar automáticamente. Debes revisarlo tú." />
          <div className="pt-1 text-xs text-[#78716c] leading-relaxed border-t border-[#e7e5e4]">
            <p>El <strong className="text-[#1c1917]">score</strong> se calcula como el porcentaje de checks automáticos que pasaron.
            Los checks manuales no afectan el score.</p>
          </div>
        </div>
      </Accordion>

      {/* ── Seguridad ────────────────────────── */}
      <Accordion title="Seguridad" icon="/seguridad.png">
        <div className="space-y-4">

          <CheckDetail
            title="SSL activo y forzado"
            why="HTTPS cifra la comunicación entre el usuario y el servidor. La redirección 301 (permanente) es importante para el SEO — una 302 (temporal) no transfiere el link equity."
            curl={`curl -I http://tusitio.com`}
            good={`HTTP/1.1 301 Moved Permanently\nLocation: https://tusitio.com/`}
            bad={`HTTP/1.1 200 OK\n# Sin redirección a HTTPS`}
            fix="En el panel de hosting activa 'Forzar HTTPS'. Alternativamente agrega esto a tu .htaccess:\n\nRewriteEngine On\nRewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]"
          />

          <CheckDetail
            title="Versión de WordPress oculta"
            why="Exponer la versión de WP facilita que un atacante sepa exactamente qué vulnerabilidades aplicar. Debe ocultarse en el meta generator, readme.html y la REST API."
            curl={`# 1. Meta generator en el HTML\ncurl -s https://tusitio.com | grep -i "generator"\n\n# 2. readme.html (no debe devolver 200)\ncurl -I https://tusitio.com/readme.html\n\n# 3. REST API\ncurl -s https://tusitio.com/wp-json | grep -o '"generator":"[^"]*"'`}
            good={`# Meta generator: sin resultado o vacío\n# readme.html: 403 o 404\n# wp-json: sin campo generator`}
            bad={`<meta name="generator" content="WordPress 6.5.3">\n# readme.html: HTTP/1.1 200 OK\n# wp-json: "generator":"https://wordpress.org/?v=6.5.3"`}
            fix={'Agrega en functions.php del child theme:\n\nremove_action(\'wp_head\', \'wp_generator\');\n\nBloquea readme.html con .htaccess:\n\n<Files readme.html>\n  Order Allow,Deny\n  Deny from all\n</Files>\n\nPara la REST API usa el plugin "Remove WordPress Version from RSS" o iThemes Security.'}
          />

          <CheckDetail
            title="XML-RPC deshabilitado"
            why="xmlrpc.php es un endpoint heredado de WordPress que permite ataques de fuerza bruta masivos enviando miles de combinaciones de usuario/contraseña en una sola petición."
            curl={`curl -s -X POST https://tusitio.com/xmlrpc.php \\\n  -H "Content-Type: text/xml" \\\n  -d '<?xml version="1.0"?><methodCall><methodName>system.listMethods</methodName><params/></methodCall>'`}
            good={`# Cualquiera de estas respuestas es buena:\nHTTP 403 Forbidden\nHTTP 405 Method Not Allowed\nHTTP 404 Not Found`}
            bad={`<?xml version="1.0" encoding="UTF-8"?>\n<methodResponse>\n  <params><param><value><array>...\n# Si responde con XML y lista de métodos → está activo`}
            fix="Instala el plugin 'Disable XML-RPC-API' (gratuito). O bloquéalo desde .htaccess:\n\n<Files xmlrpc.php>\n  Order Allow,Deny\n  Deny from all\n</Files>"
          />

          <CheckDetail
            title="wp-login.php protegido"
            why="La URL de login por defecto es conocida por todos los bots. Si está expuesta, es blanco constante de ataques de fuerza bruta."
            curl={`curl -I https://tusitio.com/wp-login.php`}
            good={`HTTP/1.1 301 Moved Permanently\nLocation: https://tusitio.com/mi-acceso-personalizado/\n# o\nHTTP/1.1 403 Forbidden`}
            bad={`HTTP/1.1 200 OK\n# Y el HTML contiene el formulario de login`}
            fix="Usa el plugin 'WPS Hide Login' para cambiar la URL de login a una ruta personalizada. No requiere editar el core de WordPress."
          />

          <CheckDetail
            title="readme.html no accesible"
            why="El archivo readme.html incluye la versión exacta de WordPress. Si es accesible públicamente, cualquiera puede verla sin esfuerzo."
            curl={`curl -I https://tusitio.com/readme.html`}
            good={`HTTP/1.1 403 Forbidden\n# o\nHTTP/1.1 404 Not Found`}
            bad={`HTTP/1.1 200 OK\nContent-Type: text/html`}
            fix={'Bloquea el acceso desde .htaccess:\n\n<Files readme.html>\n  Order Allow,Deny\n  Deny from all\n</Files>'}
          />

          <CheckDetail
            title="Headers de seguridad HTTP"
            why="Los headers de seguridad protegen contra XSS, clickjacking y filtración de información. Son configuración del servidor web, no de WordPress."
            curl={`curl -I https://tusitio.com`}
            good={`Strict-Transport-Security: max-age=31536000; includeSubDomains\nX-Frame-Options: SAMEORIGIN\nX-Content-Type-Options: nosniff\nReferrer-Policy: strict-origin-when-cross-origin`}
            bad={`# Ausencia de alguno de los headers anteriores en la respuesta`}
            fix={"Agrega en .htaccess (Apache) o configura en Nginx:\n\n# .htaccess\nHeader always set Strict-Transport-Security \"max-age=31536000; includeSubDomains\"\nHeader always set X-Frame-Options \"SAMEORIGIN\"\nHeader always set X-Content-Type-Options \"nosniff\"\nHeader always set Referrer-Policy \"strict-origin-when-cross-origin\"\n\nAlternativamente usa el plugin 'HTTP Headers' o 'Solid Security'."}
          />

        </div>
      </Accordion>

      {/* ── SEO ──────────────────────────────── */}
      <Accordion title="SEO" icon="/search.png">
        <div className="space-y-4">

          <CheckDetail
            title="Meta título"
            why="El título es el factor de SEO on-page más importante. Debe ser único por página, descriptivo y entre 10 y 65 caracteres para no truncarse en los resultados de búsqueda."
            curl={`curl -s https://tusitio.com | grep -i "<title>"`}
            good={`<title>Servicios de Diseño Web en Chile | Nexbu</title>\n# Longitud: entre 10 y 65 caracteres`}
            bad={`# Sin resultado (no hay <title>)\n# o\n<title>Inicio</title>\n# Demasiado genérico o corto`}
            fix="Usa Yoast SEO o Rank Math para definir títulos únicos por página/post."
          />

          <CheckDetail
            title="Meta descripción"
            why="Aunque no afecta directamente el ranking, sí influye en el CTR (click-through rate). Google la muestra en los resultados si es relevante. Debe tener entre 50 y 160 caracteres."
            curl={`curl -s https://tusitio.com | grep -i 'meta name="description"'`}
            good={`<meta name="description" content="Diseñamos sitios WordPress rápidos y seguros para empresas en Chile. Solicita tu cotización." />`}
            bad={`# Sin resultado (no hay meta description)`}
            fix="Configura la meta descripción en Yoast SEO o Rank Math en cada página y post."
          />

          <CheckDetail
            title="Canonical tag"
            why="Evita que Google indexe la misma página con múltiples URLs (con/sin www, con/sin slash, versiones http/https). Debe apuntar siempre a la URL preferida."
            curl={`curl -s https://tusitio.com | grep -i "canonical"`}
            good={`<link rel="canonical" href="https://tusitio.com/" />`}
            bad={`# Sin resultado\n# o apunta a una URL incorrecta`}
            fix="Yoast SEO y Rank Math generan canonical tags automáticamente. Verifica que las URLs canónicas sean correctas en páginas con filtros o paginación."
          />

          <CheckDetail
            title="Estructura H1 / H2"
            why="Los encabezados son la jerarquía del contenido. Debe haber exactamente 1 H1 por página (el título principal) y entre 1 y 6 H2 para las secciones. Múltiples H1 confunden a los buscadores."
            curl={`# Contar H1\ncurl -s https://tusitio.com | grep -oi "<h1" | wc -l\n\n# Ver todos los H1 y H2\ncurl -s https://tusitio.com | grep -iE "<h[12][^>]*>"`}
            good={`# H1: 1\n# H2: entre 2 y 6`}
            bad={`# H1: 0 (falta el título principal)\n# H1: 3 (múltiples H1)`}
            fix="Revisa el editor de bloques o Elementor. El título principal de la página debe ser H1. Las secciones secundarias: H2. Las subsecciones: H3."
          />

          <CheckDetail
            title="Open Graph"
            why="Los tags og:title, og:description y og:image controlan cómo se ve el sitio cuando se comparte en redes sociales (Facebook, LinkedIn, WhatsApp)."
            curl={`curl -s https://tusitio.com | grep -i "og:"`}
            good={`<meta property="og:title" content="Nexbu — Diseño Web WordPress" />\n<meta property="og:description" content="Sitios rápidos y seguros." />\n<meta property="og:image" content="https://tusitio.com/og-image.jpg" />`}
            bad={`# Sin resultados`}
            fix="Yoast SEO y Rank Math generan los tags OG automáticamente. Configura una imagen OG por defecto en el plugin de SEO y personaliza por página importante."
          />

          <CheckDetail
            title="Schema.org (datos estructurados)"
            why="Los datos estructurados ayudan a Google a entender el tipo de contenido y pueden generar rich results (estrellas, precios, FAQs) en los resultados de búsqueda."
            curl={`curl -s https://tusitio.com | grep -i "application/ld+json"`}
            good={`<script type="application/ld+json">\n{"@context":"https://schema.org","@type":"WebSite",...}\n</script>`}
            bad={`# Sin resultado`}
            fix="Yoast SEO y Rank Math generan Schema.org básico. Para tipos específicos (productos, recetas, eventos, FAQs) usa sus configuraciones avanzadas o el plugin 'Schema & Structured Data for WP'."
          />

          <CheckDetail
            title="Imágenes con alt text"
            why="El atributo alt describe la imagen a los motores de búsqueda y a usuarios con lectores de pantalla. También se muestra cuando la imagen no carga."
            curl={`# Ver imágenes sin alt o con alt vacío\ncurl -s https://tusitio.com | grep -i "<img" | grep -v 'alt="[^"]*[a-z]'`}
            good={`# Sin resultados (todas las imágenes tienen alt descriptivo)`}
            bad={`<img src="foto.jpg">\n<img src="logo.png" alt="">`}
            fix={`Agrega el atributo alt a todas las imágenes desde la Biblioteca de medios de WordPress. Para imágenes decorativas es válido usar alt vacío (alt=""), pero si transmiten información deben tener texto descriptivo.`}
          />

          <CheckDetail
            title="Analytics y tracking"
            why="Sin analytics no tienes datos de tráfico, conversiones ni comportamiento de usuarios. Verifica que esté instalado y funcionando antes del lanzamiento."
            curl={`# Detectar GA4, GTM o Meta Pixel\ncurl -s https://tusitio.com | grep -oE "G-[A-Z0-9]+|GTM-[A-Z0-9]+|UA-[0-9]+-[0-9]+"`}
            good={`G-XXXXXXXXXX\n# o\nGTM-XXXXXXX`}
            bad={`# Sin resultado`}
            tip="Si aparece UA-XXXXXXX (Universal Analytics) sin GA4, debes migrar. Universal Analytics fue descontinuado en julio de 2023."
            fix="Instala Google Analytics 4 usando Site Kit by Google (plugin oficial de Google) o configurando Google Tag Manager manualmente."
          />

          <CheckDetail
            title="Indexación habilitada"
            why="WordPress tiene una opción en Ajustes → Lectura llamada 'Desalentar a los motores de búsqueda'. Si está activa en producción, el sitio no aparecerá en Google."
            curl={`curl -s https://tusitio.com | grep -i "robots"`}
            good={`# Sin meta robots noindex\n# o\n<meta name="robots" content="index, follow" />`}
            bad={`<meta name="robots" content="noindex, nofollow" />`}
            fix="En WordPress ve a Ajustes → Lectura y desmarca 'Desalentar a los motores de búsqueda de indexar este sitio'."
          />

          <CheckDetail
            title="robots.txt"
            why="El archivo robots.txt le indica a los bots qué partes del sitio pueden rastrear. Un robots.txt mal configurado puede bloquear el sitio completo o recursos esenciales."
            curl={`curl https://tusitio.com/robots.txt`}
            good={`User-agent: *\nDisallow: /wp-admin/\nAllow: /wp-admin/admin-ajax.php\nSitemap: https://tusitio.com/sitemap.xml`}
            bad={`User-agent: *\nDisallow: /\n# Bloquea TODO el sitio`}
            fix="Edita el robots.txt desde Yoast SEO (SEO → Herramientas → Editor de archivos) o directamente en la raíz del servidor. Nunca uses 'Disallow: /' en producción."
          />

          <CheckDetail
            title="Sitemap XML"
            why="El sitemap le dice a Google exactamente qué URLs existen en el sitio para que las indexe eficientemente. Debe enviarse a Google Search Console."
            curl={`curl -I https://tusitio.com/sitemap.xml\ncurl -I https://tusitio.com/sitemap_index.xml\ncurl -I https://tusitio.com/wp-sitemap.xml`}
            good={`HTTP/1.1 200 OK\nContent-Type: application/xml`}
            bad={`HTTP/1.1 404 Not Found`}
            fix="Activa el sitemap en Yoast SEO (SEO → General → Características → Mapas de sitemap XML) o en Rank Math (Rank Math → Sitemap). Luego envíalo en Google Search Console → Sitemaps."
          />

          <CheckDetail
            title="llms.txt"
            why="Es un estándar emergente (similar a robots.txt pero para LLMs) que describe el sitio en lenguaje simple para que los modelos de lenguaje lo entiendan sin rastrear todo el HTML."
            curl={`curl https://tusitio.com/llms.txt`}
            good={`# Existe y describe el sitio en texto plano:\n# Nexbu — Agencia de diseño web WordPress en Chile\n# Servicios: diseño web, SEO, mantenimiento...`}
            bad={`HTTP/1.1 404 Not Found`}
            tip="No es obligatorio, pero es una buena práctica emergente. Herramientas como Perplexity y ChatGPT pueden usarlo para responder preguntas sobre tu sitio."
            fix="Crea el archivo llms.txt en la raíz del servidor con una descripción del sitio, sus páginas principales y su propósito. Puedes verlo como un 'About page' para LLMs."
          />

        </div>
      </Accordion>

      {/* ── Contenido y Rendimiento ──────────── */}
      <Accordion title="Contenido y Rendimiento" icon="/rendimiento.png">
        <div className="space-y-4">

          <CheckDetail
            title="Favicon configurado"
            why="El favicon aparece en la pestaña del navegador, bookmarks y resultados de búsqueda de Google. Su ausencia es señal de un sitio inacabado."
            curl={`curl -s https://tusitio.com | grep -i "favicon\|shortcut icon\|apple-touch"`}
            good={`<link rel="icon" href="/favicon.ico" />\n<link rel="apple-touch-icon" href="/apple-touch-icon.png" />`}
            bad={`# Sin resultado`}
            fix="Ve a WordPress → Apariencia → Personalizar → Identidad del sitio → Icono del sitio. Sube una imagen cuadrada de al menos 512×512px."
          />

          <CheckDetail
            title="Página 404 personalizada"
            why="Una página 404 genérica o vacía deteriora la experiencia del usuario y puede aumentar el bounce rate. Debe tener contenido útil (buscador, links populares) y responder con código HTTP 404."
            curl={`curl -I https://tusitio.com/esta-pagina-no-existe-nexbu`}
            good={`HTTP/1.1 404 Not Found\n# y el HTML tiene contenido personalizado`}
            bad={`HTTP/1.1 200 OK\n# Responde 200 para páginas inexistentes (soft 404)`}
            fix="Crea o edita el archivo 404.php en tu child theme. Puedes usar plugins como 'Smart 404' para redirigir automáticamente al contenido más cercano."
          />

          <CheckDetail
            title="Compresión GZIP / Brotli"
            why="La compresión reduce el tamaño de los archivos HTML, CSS y JS entre un 60 y 80%, mejorando significativamente el tiempo de carga."
            curl={`curl -I -H "Accept-Encoding: gzip, br" https://tusitio.com | grep -i "content-encoding"`}
            good={`content-encoding: br\n# (Brotli — óptimo)\n# o\ncontent-encoding: gzip`}
            bad={`# Sin header content-encoding`}
            fix={"En Apache agrega a .htaccess:\n\n<IfModule mod_deflate.c>\n  AddOutputFilterByType DEFLATE text/html text/css application/javascript\n</IfModule>\n\nEn Nginx:\n\ngzip on;\ngzip_types text/html text/css application/javascript;\n\nCon WP Rocket o LiteSpeed Cache también puedes activarlo desde el plugin."}
          />

          <CheckDetail
            title="Páginas legales"
            why="La política de privacidad es obligatoria por ley (GDPR, Ley 19.628 en Chile). Los términos y la política de cookies también son necesarios dependiendo del tipo de sitio."
            curl={`# Verificar existencia de cada página\ncurl -I https://tusitio.com/politica-de-privacidad\ncurl -I https://tusitio.com/terminos-y-condiciones\ncurl -I https://tusitio.com/politica-de-cookies`}
            good={`HTTP/1.1 200 OK`}
            bad={`HTTP/1.1 404 Not Found`}
            fix="Crea las páginas con los slugs estándar. Para el banner de cookies usa Complianz o CookieYes. Asegúrate de que los formularios de contacto enlacen a la política de privacidad."
          />

          <CheckDetail
            title="Páginas WooCommerce nativas"
            why="WooCommerce usa páginas específicas para el carrito, checkout y cuenta de usuario. Si no existen o fueron eliminadas por error, la tienda no funciona."
            curl={`curl -I https://tusitio.com/carrito\ncurl -I https://tusitio.com/checkout\ncurl -I https://tusitio.com/mi-cuenta`}
            good={`HTTP/1.1 200 OK\n# Las tres páginas responden correctamente`}
            bad={`HTTP/1.1 404 Not Found`}
            fix="En WooCommerce ve a Ajustes → Avanzado → Configuración de página y reasigna las páginas. Si las páginas no existen, créalas con el shortcode correspondiente ([woocommerce_cart], etc.) y asígnalas ahí."
          />

        </div>
      </Accordion>

      {/* ── Plugin companion ─────────────────── */}
      <Accordion title="Plugin companion — checks internos">
        <div className="space-y-4">
          <div className="text-sm text-[#78716c] leading-relaxed space-y-2">
            <p>
              El plugin expone el endpoint <code className="px-1.5 py-0.5 bg-[#f5f5f4] border border-[#e7e5e4] rounded text-xs text-[#1c1917]">tusitio.com/nexbu-check/</code> con datos
              internos de WordPress que no son accesibles públicamente.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-[#78716c] uppercase tracking-wide">Probar el endpoint manualmente</p>
            <CodeBlock code={`curl -s https://tusitio.com/nexbu-check/ \\\n  -H "Authorization: Bearer TU_API_KEY" | python3 -m json.tool`} />
          </div>

          <div className="divide-y divide-[#e7e5e4] border border-[#e7e5e4] rounded-xl overflow-hidden">
            {[
              { title: 'Child theme', desc: 'Verifica que el sitio use un child theme. Modificar el tema padre directamente hace que los cambios se pierdan con cada actualización.' },
              { title: 'Usuario "admin"', desc: 'Si existe un usuario con login "admin", es el primer objetivo de cualquier ataque de fuerza bruta. Debe renombrarse.' },
              { title: 'WP_DEBUG deshabilitado', desc: 'WP_DEBUG activo en producción puede mostrar errores PHP con rutas internas del servidor a cualquier visitante.' },
              { title: 'Indexación desde WP', desc: 'Verifica que "Desalentar a los motores de búsqueda" esté desmarcado en Ajustes → Lectura.' },
              { title: 'Plugin de caché', desc: 'Detecta WP Rocket, W3 Total Cache, LiteSpeed Cache, WP Super Cache u otros.' },
              { title: 'Plugin de backups', desc: 'Detecta UpdraftPlus, BackupBuddy, BackWPup u otros. Un backup que no se ha probado no cuenta.' },
              { title: 'Plugins actualizados', desc: 'Muestra qué plugins tienen actualizaciones pendientes. Los plugins desactualizados son la principal vía de entrada de malware.' },
              { title: 'Base de datos limpia', desc: 'Cuenta las revisiones acumuladas. Más de 500 es señal de que la BD nunca se ha optimizado. Usa WP-Optimize.' },
            ].map(c => (
              <div key={c.title} className="flex gap-3 px-4 py-3">
                <CheckCircle2 className="w-4 h-4 text-[#a8a29e] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[#1c1917]">{c.title}</p>
                  <p className="text-xs text-[#78716c] mt-0.5">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[#e7e5e4] pt-4 space-y-2">
            <p className="text-sm font-semibold text-[#1c1917]">Instalación del plugin</p>
            <ol className="space-y-1 text-sm text-[#78716c]">
              <li>1. Descarga el .zip con el botón de abajo.</li>
              <li>2. En WordPress ve a Plugins → Añadir nuevo → Subir plugin.</li>
              <li>3. Selecciona el .zip y haz clic en Instalar ahora → Activar.</li>
              <li>4. Ve a Ajustes → Nexbu Check y genera tu API Key.</li>
              <li>5. Cópiala (solo se muestra una vez) y pégala en check.nexbu.com.</li>
            </ol>
            <a href="/downloads/nexbu-check-plugin.zip" download className="btn-primary inline-flex mt-2">
              <Download className="w-4 h-4" />
              Descargar plugin (.zip)
            </a>
          </div>
        </div>
      </Accordion>

      {/* ── FAQ ──────────────────────────────── */}
      <Accordion title="Preguntas frecuentes">
        <div className="space-y-4">
          {[
            {
              q: '¿Afecta el análisis al rendimiento de mi sitio?',
              a: 'Mínimamente. Son requests HTTP simples, similares a los de un bot de búsqueda. El mayor volumen de requests se hace en paralelo y dura unos pocos segundos.',
            },
            {
              q: '¿Es seguro instalar el plugin en producción?',
              a: 'Sí. El plugin es de solo lectura — no modifica nada. La API Key se guarda como hash (nunca en texto plano). El endpoint solo responde a requests autenticados con CORS restringido a check.nexbu.com. Si revocos la key, el endpoint queda completamente inaccesible.',
            },
            {
              q: '¿Con qué frecuencia debo auditar mi sitio?',
              a: 'Antes de cada lanzamiento o cambio importante, y al menos una vez al mes como mantenimiento. También es útil después de instalar o actualizar plugins.',
            },
            {
              q: '¿Por qué un check marca "warning" si el sitio funciona bien?',
              a: 'Los avisos son mejoras recomendadas, no errores críticos. Por ejemplo, una redirección 302 en vez de 301 no rompe el sitio pero sí puede afectar el SEO a largo plazo.',
            },
            {
              q: '¿Funciona con cualquier WordPress?',
              a: 'Los checks externos funcionan con cualquier sitio web. Los checks del plugin requieren WordPress 6.4+ y PHP 8.0+.',
            },
            {
              q: '¿El score del 100% garantiza que el sitio está perfecto?',
              a: 'No. El score mide las verificaciones automatizables. Hay aspectos de calidad (contenido, diseño, UX, velocidad real) que requieren revisión humana. Es un punto de partida, no una garantía.',
            },
          ].map(({ q, a }) => (
            <div key={q} className="border-b border-[#e7e5e4] pb-4 last:border-0 last:pb-0">
              <p className="text-sm font-semibold text-[#1c1917]">{q}</p>
              <p className="text-sm text-[#78716c] mt-1 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </Accordion>

      <p className="text-center text-xs text-[#a8a29e] py-4">
        <a href="https://nexbu.com" target="_blank" rel="noopener noreferrer">
          <img src="/logo-nexbu.png" alt="Nexbu" className="h-4 w-auto inline-block opacity-40 hover:opacity-70 transition-opacity" />
        </a>
      </p>
    </main>
  )
}
