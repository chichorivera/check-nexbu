import axios from 'axios'

export async function runContentChecks(url, homepageResponse, $, axiosConfig) {
  const htmlChecks = $ ? [checkFavicon($), checkWooCommerceDetection($)] : []
  const isWooCommerce = htmlChecks.find(c => c.id === 'woocommerce_detect')?.detected || false

  const async_ = await Promise.allSettled([
    checkCustom404(url, axiosConfig),
    checkCompression(homepageResponse),
    checkHTTPSConsistency(url, homepageResponse),
    checkLegalPages(url, $, axiosConfig),
    ...(isWooCommerce ? [checkWooCommercePages(url, axiosConfig)] : []),
  ])

  const asyncResults = async_.map(r => r.status === 'fulfilled' ? r.value : null).filter(Boolean)
  const visibleHtmlChecks = htmlChecks.filter(c => c.id !== 'woocommerce_detect')

  return [...visibleHtmlChecks, ...asyncResults]
}

function checkFavicon($) {
  const check = { id: 'favicon', title: 'Favicon configurado', category: 'content' }
  const favicon = $('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').first().attr('href')
  if (favicon) return { ...check, status: 'pass', message: `Favicon encontrado: ${favicon}` }
  return { ...check, status: 'warning', message: 'No se detectó favicon. Configúralo en Ajustes → Personalizar.' }
}

function checkWooCommerceDetection($) {
  const body = $('body').attr('class') || ''
  const html = $.html() || ''
  const detected = /woocommerce/i.test(body) || html.includes('woocommerce')
  return { id: 'woocommerce_detect', title: 'WooCommerce detectado', category: 'content', detected }
}

async function checkCustom404(url, axiosConfig) {
  const check = { id: 'custom_404', title: 'Página 404 personalizada', category: 'content' }
  const testUrl = `${url}/nexbu-check-404-test-${Date.now()}`
  const cfg = { timeout: axiosConfig.timeout, headers: axiosConfig.headers }

  function evaluate(status, data) {
    if (status === 404) {
      const html = typeof data === 'string' ? data : ''
      const isDefault = /Just another WordPress site|wp-login\.php/i.test(html)
      const isCustom = html.length > 500 && !isDefault
      if (isCustom) return { ...check, status: 'pass', message: 'Página 404 personalizada detectada.' }
      return { ...check, status: 'warning', message: 'Error 404 correcto pero la página podría ser la default de WordPress.' }
    }
    return { ...check, status: 'warning', message: `El servidor retorna ${status} para URLs inexistentes (esperado: 404).` }
  }

  // Intento 1: siguiendo redirects normalmente
  try {
    const r = await axios.get(testUrl, { ...cfg, maxRedirects: 5, validateStatus: (s) => s < 500 })
    return evaluate(r.status, r.data)
  } catch {}

  // Intento 2: sin seguir el redirect, lo seguimos manualmente
  // Cubre el caso www-redirect → 404 que algunos servidores hacen
  try {
    const r = await axios.get(testUrl, { ...cfg, maxRedirects: 0, validateStatus: () => true })
    if ((r.status === 301 || r.status === 302) && r.headers.location) {
      const r2 = await axios.get(r.headers.location, { ...cfg, maxRedirects: 3, validateStatus: (s) => s < 500 })
      return evaluate(r2.status, r2.data)
    }
    return evaluate(r.status, r.data)
  } catch {}

  return { ...check, status: 'warning', message: 'No se pudo verificar la página 404.' }
}

function checkCompression(homepageResponse) {
  const check = { id: 'compression', title: 'Compresión GZIP/Brotli activa', category: 'content' }

  if (!homepageResponse) return { ...check, status: 'warning', message: 'No se pudo verificar compresión.' }

  const encoding = homepageResponse.headers['content-encoding'] || ''
  if (/br/i.test(encoding)) return { ...check, status: 'pass', message: 'Compresión Brotli activa (óptima).' }
  if (/gzip/i.test(encoding)) return { ...check, status: 'pass', message: 'Compresión GZIP activa.' }
  return { ...check, status: 'warning', message: 'Sin compresión detectada. Habilita GZIP/Brotli en el servidor.' }
}

function checkHTTPSConsistency(url, homepageResponse) {
  const check = { id: 'https_consistency', title: 'Consistencia HTTPS en el sitio', category: 'content' }

  if (!homepageResponse) return { ...check, status: 'warning', message: 'No se pudo verificar.' }

  const finalUrl = homepageResponse.request?.res?.responseUrl || homepageResponse.config?.url || url
  if (finalUrl && !finalUrl.startsWith('https://')) {
    return { ...check, status: 'fail', message: 'La URL final de la homepage no usa HTTPS.' }
  }
  return { ...check, status: 'pass', message: 'La URL final está en HTTPS.' }
}

async function checkLegalPages(url, $, axiosConfig) {
  const check = { id: 'legal_pages', title: 'Páginas legales presentes', category: 'content' }

  // Keywords para pre-filtrar links por href + texto (sin hacer requests)
  const hrefTextKeys = {
    privacy: /privaci|privacy|datos.?person/i,
    terms:   /termino|condicione|aviso.?legal|legal.?notice/i,
    cookies: /cookie/i,
  }

  // Keywords para densidad en título y cuerpo de la página
  const contentKeys = {
    privacy: ['datos personales', 'privacidad', 'tratamiento de datos', 'responsable del tratamiento', 'gdpr', 'rgpd', 'lopd', 'derechos de acceso', 'titular'],
    terms:   ['términos y condiciones', 'condiciones de uso', 'términos de servicio', 'aviso legal', 'responsabilidad', 'usuario', 'contrato', 'obligaciones'],
    cookies: ['política de cookies', 'uso de cookies', 'cookie', 'almacenamiento', 'navegador', 'terceros', 'rastreo', 'sesión'],
  }

  // Normalizar hostname para comparar wiseplan.cl == www.wiseplan.cl
  function rootHost(h) { return h.replace(/^www\./, '') }
  let baseHost = ''
  try { baseHost = rootHost(new URL(url).hostname) } catch {}

  // Recoger todos los links internos únicos con su href, path y texto
  const seen = new Set()
  const allLinks = []
  if ($) {
    $('a[href]').each((_, el) => {
      const raw = ($(el).attr('href') || '').trim()
      if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:')) return
      const full = raw.startsWith('http') ? raw : raw.startsWith('/') ? url + raw : null
      if (!full || seen.has(full)) return
      try {
        const u = new URL(full)
        if (rootHost(u.hostname) !== baseHost) return  // solo links del mismo dominio
        seen.add(full)
        allLinks.push({
          href: full,
          path: u.pathname.toLowerCase(),
          text: $(el).text().trim().toLowerCase(),
        })
      } catch {}
    })
  }

  // Pre-filtrar candidatos por href + texto (barato, sin requests)
  const candidates = allLinks.filter(l => {
    const combined = l.path + ' ' + l.text
    return hrefTextKeys.privacy.test(combined)
      || hrefTextKeys.terms.test(combined)
      || hrefTextKeys.cookies.test(combined)
  })

  // Si no hay candidatos con keywords, usar todos los links del footer
  const toFetch = candidates.length > 0
    ? candidates.slice(0, 20)
    : allLinks.filter(l => {
        const el = $?.(`a[href="${l.href}"], a[href="${l.path}"]`)?.closest('footer, [class*="footer"], [id*="footer"]')
        return el?.length > 0
      }).slice(0, 20)

  // Puntuar densidad de keywords en título + cuerpo
  function density(text, keys) {
    return keys.reduce((n, k) => {
      const re = new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
      return n + (text.match(re)?.length || 0)
    }, 0)
  }

  // Fetch en paralelo y puntuar cada candidato
  const scored = (await Promise.all(
    toFetch.map(async (link) => {
      try {
        const r = await axios.get(link.href, {
          timeout: axiosConfig.timeout,
          headers: axiosConfig.headers,
          maxRedirects: 5,
        })
        if (r.status !== 200 || typeof r.data !== 'string') return null
        const body = r.data.toLowerCase()
        const titleMatch = body.match(/<title[^>]*>([^<]*)<\/title>/i)
        const title = (titleMatch?.[1] || '').toLowerCase()
        // Puntos extra si href o texto ya matcheaban la categoría (x3)
        const hrefBonus = (cat) => hrefTextKeys[cat].test(link.path + ' ' + link.text) ? 3 : 0
        return {
          href: link.href,
          privacy: density(title + ' ' + body, contentKeys.privacy) + hrefBonus('privacy'),
          terms:   density(title + ' ' + body, contentKeys.terms)   + hrefBonus('terms'),
          cookies: density(title + ' ' + body, contentKeys.cookies) + hrefBonus('cookies'),
        }
      } catch { return null }
    })
  )).filter(Boolean)

  const MIN = 4  // mínimo de menciones para considerar que es la página correcta

  function best(cat) {
    const top = scored.reduce((a, b) => (a?.[cat] || 0) >= (b?.[cat] || 0) ? a : b, null)
    return top?.[cat] >= MIN ? top.href : null
  }

  const privacy = best('privacy')
  const terms   = best('terms')
  const cookies = best('cookies')

  const found = [], missing = []
  if (privacy) found.push('Privacidad'); else missing.push('Política de privacidad')
  if (terms)   found.push('Términos');   else missing.push('Términos y condiciones')
  if (cookies) found.push('Cookies');    else missing.push('Política de cookies')

  if (missing.length === 0) return { ...check, status: 'pass', message: `Páginas legales encontradas: ${found.join(', ')}.` }
  if (missing.length === 3) return { ...check, status: 'fail', message: 'No se encontraron páginas legales (privacidad, términos, cookies).' }
  return { ...check, status: 'warning', message: `Faltan: ${missing.join(', ')}.` }
}

async function checkWooCommercePages(url, axiosConfig) {
  const check = { id: 'woocommerce_pages', title: 'Páginas WooCommerce nativas', category: 'content' }

  const pages = [
    { slug: ['/carrito', '/cart'], name: 'Carrito' },
    { slug: ['/checkout', '/finalizar-compra'], name: 'Checkout' },
    { slug: ['/mi-cuenta', '/my-account'], name: 'Mi Cuenta' },
  ]

  const results = await Promise.all(pages.map(async (page) => {
    for (const slug of page.slug) {
      try {
        const r = await axios.get(`${url}${slug}`, { ...axiosConfig, maxRedirects: 3 })
        if (r.status === 200) return { name: page.name, found: true }
      } catch {}
    }
    return { name: page.name, found: false }
  }))

  const missing = results.filter(r => !r.found).map(r => r.name)
  if (missing.length === 0) return { ...check, status: 'pass', message: 'Todas las páginas WooCommerce encontradas.' }
  return { ...check, status: 'warning', message: `Páginas WooCommerce no encontradas: ${missing.join(', ')}.` }
}
