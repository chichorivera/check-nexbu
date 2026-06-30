import axios from 'axios'

export async function runSecurityChecks(url, homepageResponse, $, axiosConfig) {
  const results = await Promise.allSettled([
    checkSSL(url, axiosConfig),
    checkWPVersion(url, $, axiosConfig),
    checkXMLRPC(url, axiosConfig),
    checkWPLogin(url, axiosConfig),
    checkReadmeHTML(url, axiosConfig),
    checkSecurityHeaders(homepageResponse),
  ])

  return results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value
    const fallbackIds = ['ssl', 'wp_version', 'xmlrpc', 'wp_login', 'readme_html', 'security_headers']
    return {
      id: fallbackIds[i],
      title: 'Error en verificación',
      status: 'warning',
      message: `No se pudo completar la verificación: ${r.reason?.message || 'timeout'}`,
      category: 'security',
    }
  })
}

async function checkSSL(url, axiosConfig) {
  const check = { id: 'ssl', title: 'SSL activo y forzado', category: 'security' }

  if (!url.startsWith('https://')) {
    return { ...check, status: 'fail', message: 'El sitio no usa HTTPS.' }
  }

  try {
    const httpUrl = url.replace('https://', 'http://')
    const response = await axios.get(httpUrl, {
      ...axiosConfig,
      maxRedirects: 0,
      validateStatus: (s) => s >= 100 && s < 400,
    })
    const location = response.headers['location'] || ''
    if (response.status === 301 && location.startsWith('https://')) {
      return { ...check, status: 'pass', message: 'SSL activo. HTTP redirige a HTTPS con 301 permanente.' }
    }
    if ((response.status === 302 || response.status === 307) && location.startsWith('https://')) {
      return { ...check, status: 'warning', message: 'SSL activo pero la redirección es temporal (302/307). Debería ser 301.' }
    }
    return { ...check, status: 'warning', message: 'HTTPS disponible pero HTTP no redirige automáticamente.' }
  } catch {
    return { ...check, status: 'pass', message: 'SSL activo (redirección HTTP gestionada a nivel servidor).' }
  }
}

async function checkWPVersion(url, $, axiosConfig) {
  const check = { id: 'wp_version', title: 'Versión de WordPress oculta', category: 'security' }
  const exposed = []

  if ($) {
    const generator = $('meta[name="generator"]').attr('content') || ''
    if (/wordpress/i.test(generator)) {
      exposed.push(`meta generator: "${generator}"`)
    }
  }

  try {
    const r = await axios.get(`${url}/readme.html`, { ...axiosConfig, maxRedirects: 0 })
    if (r.status === 200 && /wordpress/i.test(r.data)) {
      exposed.push('readme.html accesible')
    }
  } catch {}

  try {
    const r = await axios.get(`${url}/wp-json`, { ...axiosConfig })
    if (r.status === 200 && r.data?.generator?.includes?.('WordPress')) {
      exposed.push('REST API /wp-json expone generador')
    }
  } catch {}

  if (exposed.length === 0) {
    return { ...check, status: 'pass', message: 'Versión de WordPress no expuesta públicamente.' }
  }
  return { ...check, status: 'fail', message: `Versión expuesta en: ${exposed.join(', ')}.` }
}

async function checkXMLRPC(url, axiosConfig) {
  const check = { id: 'xmlrpc', title: 'XML-RPC deshabilitado', category: 'security' }

  try {
    const r = await axios.post(
      `${url}/xmlrpc.php`,
      '<?xml version="1.0"?><methodCall><methodName>system.listMethods</methodName></methodCall>',
      { ...axiosConfig, headers: { ...axiosConfig.headers, 'Content-Type': 'text/xml' }, maxRedirects: 0 }
    )
    if (r.status === 200 && typeof r.data === 'string' && r.data.includes('<?xml')) {
      return { ...check, status: 'fail', message: 'XML-RPC responde y está activo — vector de fuerza bruta.' }
    }
    if (r.status === 403 || r.status === 401) {
      return { ...check, status: 'pass', message: `XML-RPC bloqueado (${r.status}).` }
    }
    if (r.status === 405) {
      return { ...check, status: 'pass', message: 'XML-RPC deshabilitado (405 Method Not Allowed).' }
    }
    return { ...check, status: 'pass', message: `xmlrpc.php retorna ${r.status} — no accesible.` }
  } catch (err) {
    if (err.response?.status === 404) {
      return { ...check, status: 'pass', message: 'xmlrpc.php no existe (404).' }
    }
    return { ...check, status: 'pass', message: 'XML-RPC no accesible.' }
  }
}

async function checkWPLogin(url, axiosConfig) {
  const check = { id: 'wp_login', title: 'wp-login.php protegido', category: 'security' }

  try {
    const r = await axios.get(`${url}/wp-login.php`, { ...axiosConfig, maxRedirects: 0 })
    if (r.status === 200 && typeof r.data === 'string' && r.data.includes('user_login')) {
      return { ...check, status: 'warning', message: 'wp-login.php es accesible. Considera cambiar la URL de login (ej. WPS Hide Login).' }
    }
    if (r.status === 403 || r.status === 401) {
      return { ...check, status: 'pass', message: `wp-login.php protegido (${r.status}).` }
    }
    if (r.status === 301 || r.status === 302) {
      return { ...check, status: 'pass', message: 'wp-login.php redirige a URL personalizada.' }
    }
    return { ...check, status: 'pass', message: `wp-login.php retorna ${r.status}.` }
  } catch {
    return { ...check, status: 'pass', message: 'wp-login.php no accesible.' }
  }
}

async function checkReadmeHTML(url, axiosConfig) {
  const check = { id: 'readme_html', title: 'readme.html no accesible', category: 'security' }

  try {
    const r = await axios.get(`${url}/readme.html`, { ...axiosConfig, maxRedirects: 0 })
    if (r.status === 200) {
      return { ...check, status: 'fail', message: 'readme.html accesible — revela la versión exacta de WordPress.' }
    }
    return { ...check, status: 'pass', message: `readme.html no accesible (${r.status}).` }
  } catch {
    return { ...check, status: 'pass', message: 'readme.html no accesible.' }
  }
}

function checkSecurityHeaders(homepageResponse) {
  const check = { id: 'security_headers', title: 'Headers de seguridad HTTP', category: 'security' }

  if (!homepageResponse) {
    return { ...check, status: 'fail', message: 'No se pudo verificar headers HTTP.' }
  }

  const h = homepageResponse.headers
  const missing = []

  if (!h['x-content-type-options']) missing.push('X-Content-Type-Options')
  if (!h['x-frame-options'] && !(h['content-security-policy'] || '').includes('frame-ancestors')) {
    missing.push('X-Frame-Options')
  }
  if (!h['strict-transport-security']) missing.push('HSTS')
  if (!h['referrer-policy']) missing.push('Referrer-Policy')

  if (missing.length === 0) return { ...check, status: 'pass', message: 'Headers de seguridad correctamente configurados.' }
  if (missing.length <= 2) return { ...check, status: 'warning', message: `Faltan: ${missing.join(', ')}.` }
  return { ...check, status: 'fail', message: `Faltan ${missing.length} headers: ${missing.join(', ')}.` }
}
