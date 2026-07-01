import axios from 'axios'

export async function runSeoChecks(url, homepageResponse, $, axiosConfig) {
  const htmlChecks = $ ? getHtmlChecks(url, $, homepageResponse?.data || '') : []

  const async_ = await Promise.allSettled([
    checkRobotsTxt(url, axiosConfig),
    checkSitemap(url, axiosConfig),
    checkLLMsTxt(url, axiosConfig),
  ])

  const asyncResults = async_.map(r => r.status === 'fulfilled' ? r.value : null).filter(Boolean)

  return [...htmlChecks, ...asyncResults]
}

function getHtmlChecks(url, $, rawHtml) {
  return [
    checkMetaTitle($),
    checkMetaDescription($),
    checkCanonical($),
    checkH1Structure($),
    checkOGTags($),
    checkSchema($),
    checkImagesAlt($),
    checkAnalytics(rawHtml),
    checkIndexing($, rawHtml),
  ]
}

function checkMetaTitle($) {
  const check = { id: 'meta_title', title: 'Meta título presente', category: 'seo' }
  const title = $('title').first().text().trim()
  if (!title) return { ...check, status: 'fail', message: 'No hay <title> en la página.' }
  if (title.length < 10) return { ...check, status: 'warning', message: `Título muy corto: "${title}"` }
  if (title.length > 65) return { ...check, status: 'warning', message: `Título demasiado largo (${title.length} chars). Recomendado: < 65.` }
  return { ...check, status: 'pass', message: `Título encontrado: "${title.substring(0, 60)}${title.length > 60 ? '…' : ''}"` }
}

function checkMetaDescription($) {
  const check = { id: 'meta_description', title: 'Meta descripción presente', category: 'seo' }
  const desc = $('meta[name="description"]').attr('content') || ''
  if (!desc) return { ...check, status: 'fail', message: 'No hay meta description en la página.' }
  if (desc.length < 50) return { ...check, status: 'warning', message: `Descripción muy corta (${desc.length} chars).` }
  if (desc.length > 160) return { ...check, status: 'warning', message: `Descripción muy larga (${desc.length} chars). Recomendado: < 160.` }
  return { ...check, status: 'pass', message: `Meta description presente (${desc.length} chars).` }
}

function checkCanonical($) {
  const check = { id: 'canonical', title: 'Canonical tag presente', category: 'seo' }
  const canonical = $('link[rel="canonical"]').attr('href') || ''
  if (!canonical) return { ...check, status: 'fail', message: 'No hay canonical tag en la página.' }
  return { ...check, status: 'pass', message: `Canonical: ${canonical}` }
}

function checkH1Structure($) {
  const check = { id: 'h1_structure', title: 'Estructura H1 correcta', category: 'seo' }
  const h1Count = $('h1').length
  const h2Count = $('h2').length

  if (h1Count === 0) return { ...check, status: 'fail', message: 'No hay ningún H1 en la página.' }
  if (h1Count > 1) return { ...check, status: 'fail', message: `Hay ${h1Count} H1 — debe haber exactamente 1.` }
  if (h2Count === 0) return { ...check, status: 'warning', message: '1 H1 correcto pero sin H2. Agrega subtítulos para estructurar el contenido.' }
  if (h2Count > 6) return { ...check, status: 'warning', message: `1 H1, ${h2Count} H2. Demasiados H2 pueden indicar contenido no estructurado.` }
  return { ...check, status: 'pass', message: `Estructura correcta: 1 H1, ${h2Count} H2.` }
}

function checkOGTags($) {
  const check = { id: 'og_tags', title: 'Open Graph configurado', category: 'seo' }
  const missing = []
  if (!$('meta[property="og:title"]').attr('content')) missing.push('og:title')
  if (!$('meta[property="og:description"]').attr('content')) missing.push('og:description')
  if (!$('meta[property="og:image"]').attr('content')) missing.push('og:image')

  if (missing.length === 0) return { ...check, status: 'pass', message: 'Open Graph configurado correctamente.' }
  if (missing.length === 3) return { ...check, status: 'fail', message: 'No hay ningún tag Open Graph.' }
  return { ...check, status: 'warning', message: `Faltan: ${missing.join(', ')}.` }
}

function checkSchema($) {
  const check = { id: 'schema', title: 'Datos estructurados (Schema.org)', category: 'seo' }
  const jsonLd = $('script[type="application/ld+json"]').length
  const microdata = $('[itemscope]').length

  if (jsonLd > 0) return { ...check, status: 'pass', message: `${jsonLd} bloque(s) JSON-LD encontrado(s).` }
  if (microdata > 0) return { ...check, status: 'pass', message: `Microdata encontrada (${microdata} elemento(s)).` }
  return { ...check, status: 'warning', message: 'No se detectaron datos estructurados. Agrega Schema.org según el tipo de contenido.' }
}

function checkImagesAlt($) {
  const check = { id: 'images_alt', title: 'Imágenes con alt text', category: 'seo' }
  const allImages = $('img').toArray()
  if (allImages.length === 0) return { ...check, status: 'pass', message: 'No hay imágenes en la página principal.' }

  const withoutAlt = allImages.filter(img => {
    const alt = $(img).attr('alt')
    return alt === undefined || alt === null
  })
  const emptyAlt = allImages.filter(img => $(img).attr('alt') === '')

  if (withoutAlt.length === 0 && emptyAlt.length === 0) {
    return { ...check, status: 'pass', message: `Todas las ${allImages.length} imágenes tienen alt text.` }
  }
  if (withoutAlt.length > 0) {
    return { ...check, status: 'fail', message: `${withoutAlt.length} de ${allImages.length} imágenes sin atributo alt.` }
  }
  return { ...check, status: 'warning', message: `${emptyAlt.length} imagen(es) con alt vacío (ok si son decorativas).` }
}

function checkAnalytics(rawHtml) {
  const check = { id: 'analytics', title: 'Analytics / tracking presente', category: 'seo' }
  const hasGA4 = /G-[A-Z0-9]+/.test(rawHtml)
  const hasGTM = /GTM-[A-Z0-9]+/.test(rawHtml)
  const hasUA = /UA-\d+-\d+/.test(rawHtml)
  const hasPixel = /fbq\(|facebook\.com\/tr/.test(rawHtml)

  const found = []
  if (hasGA4) found.push('Google Analytics 4')
  if (hasGTM) found.push('Google Tag Manager')
  if (hasUA) found.push('Universal Analytics (deprecated)')
  if (hasPixel) found.push('Meta Pixel')

  if (found.length === 0) return { ...check, status: 'warning', message: 'No se detectó ningún script de analytics o tracking.' }
  if (hasUA && !hasGA4) return { ...check, status: 'warning', message: `${found.join(', ')} — Universal Analytics está deprecado. Migra a GA4.` }
  return { ...check, status: 'pass', message: `Detectado: ${found.join(', ')}.` }
}

function checkIndexing($, rawHtml) {
  const check = { id: 'indexing', title: 'Indexación habilitada', category: 'seo' }
  const metaRobots = $('meta[name="robots"]').attr('content') || ''

  if (/noindex/i.test(metaRobots)) {
    return { ...check, status: 'fail', message: 'La página tiene meta robots "noindex" — los buscadores no la indexarán.' }
  }
  if (/noindex/i.test(rawHtml)) {
    return { ...check, status: 'warning', message: 'Se detectó "noindex" en el HTML pero no en el meta robots principal.' }
  }
  return { ...check, status: 'pass', message: 'No se detecta bloqueo de indexación en la página.' }
}

async function checkRobotsTxt(url, axiosConfig) {
  const check = { id: 'robots_txt', title: 'robots.txt configurado', category: 'seo' }

  try {
    const r = await axios.get(`${url}/robots.txt`, { ...axiosConfig })
    if (r.status !== 200) {
      return { ...check, status: 'warning', message: `robots.txt no encontrado (${r.status}).` }
    }

    const content = typeof r.data === 'string' ? r.data : ''
    if (/^disallow:\s*\/\s*$/im.test(content)) {
      return { ...check, status: 'fail', message: 'robots.txt tiene "Disallow: /" — bloquea todos los buscadores.' }
    }
    if (!content.includes('Sitemap:') && !content.includes('sitemap:')) {
      return { ...check, status: 'warning', message: 'robots.txt existe pero no incluye referencia al Sitemap.' }
    }
    return { ...check, status: 'pass', message: 'robots.txt encontrado y configurado correctamente.' }
  } catch {
    return { ...check, status: 'warning', message: 'No se pudo acceder a robots.txt.' }
  }
}

async function checkSitemap(url, axiosConfig) {
  const check = { id: 'sitemap', title: 'Sitemap XML presente', category: 'seo' }
  const candidates = ['/sitemap.xml', '/sitemap_index.xml', '/wp-sitemap.xml']

  for (const path of candidates) {
    try {
      const r = await axios.get(`${url}${path}`, { ...axiosConfig })
      if (r.status === 200) {
        return { ...check, status: 'pass', message: `Sitemap encontrado en ${path}.` }
      }
    } catch {}
  }

  return { ...check, status: 'fail', message: 'No se encontró sitemap XML. Genera uno con Yoast SEO o Rank Math.' }
}

async function checkLLMsTxt(url, axiosConfig) {
  const check = { id: 'llms_txt', title: 'llms.txt presente', category: 'seo' }

  try {
    const r = await axios.get(`${url}/llms.txt`, { ...axiosConfig })
    if (r.status === 200) {
      return { ...check, status: 'pass', message: 'llms.txt encontrado — ayuda a los LLMs a entender el sitio.' }
    }
    return { ...check, status: 'warning', message: 'llms.txt no encontrado. Es un estándar emergente recomendado.' }
  } catch {
    return { ...check, status: 'warning', message: 'llms.txt no encontrado. Es un estándar emergente recomendado.' }
  }
}
