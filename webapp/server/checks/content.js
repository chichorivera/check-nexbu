import axios from 'axios'

export async function runContentChecks(url, homepageResponse, $, axiosConfig) {
  const htmlChecks = $ ? [checkFavicon($), checkWooCommerceDetection($)] : []
  const isWooCommerce = htmlChecks.find(c => c.id === 'woocommerce_detect')?.detected || false

  const async_ = await Promise.allSettled([
    checkCustom404(url, axiosConfig),
    checkCompression(homepageResponse),
    checkHTTPSConsistency(url, homepageResponse),
    checkLegalPages(url, axiosConfig),
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

  try {
    const testUrl = `${url}/nexbu-check-404-test-${Date.now()}`
    const r = await axios.get(testUrl, { ...axiosConfig })

    if (r.status !== 404) {
      return { ...check, status: 'warning', message: `El servidor retorna ${r.status} para URLs inexistentes (esperado: 404).` }
    }

    const html = typeof r.data === 'string' ? r.data : ''
    const isDefault = /Just another WordPress site|wp-login\.php/i.test(html)
    const isCustom = html.length > 500 && !isDefault

    if (isCustom) return { ...check, status: 'pass', message: 'Página 404 personalizada detectada.' }
    return { ...check, status: 'warning', message: 'Error 404 correcto pero la página podría ser la default de WordPress.' }
  } catch {
    return { ...check, status: 'warning', message: 'No se pudo verificar la página 404.' }
  }
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

async function checkLegalPages(url, axiosConfig) {
  const check = { id: 'legal_pages', title: 'Páginas legales presentes', category: 'content' }

  const slugsPrivacy = ['/politica-de-privacidad', '/privacidad', '/privacy-policy', '/aviso-de-privacidad']
  const slugsTerms = ['/terminos-y-condiciones', '/terminos', '/terms', '/terms-and-conditions', '/aviso-legal']
  const slugsCookies = ['/politica-de-cookies', '/cookies', '/cookie-policy']

  async function checkAny(slugs) {
    for (const slug of slugs) {
      try {
        const r = await axios.get(`${url}${slug}`, { ...axiosConfig, maxRedirects: 3 })
        if (r.status === 200) return slug
      } catch {}
    }
    return null
  }

  const [privacy, terms, cookies] = await Promise.all([
    checkAny(slugsPrivacy),
    checkAny(slugsTerms),
    checkAny(slugsCookies),
  ])

  const found = []
  const missing = []
  if (privacy) found.push('Privacidad'); else missing.push('Política de privacidad')
  if (terms) found.push('Términos'); else missing.push('Términos y condiciones')
  if (cookies) found.push('Cookies'); else missing.push('Política de cookies')

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
