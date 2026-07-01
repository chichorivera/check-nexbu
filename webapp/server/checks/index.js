import axios from 'axios'
import { load } from 'cheerio'
import { runSecurityChecks } from './security.js'
import { runSeoChecks } from './seo.js'
import { runContentChecks } from './content.js'

const USER_AGENT = 'Mozilla/5.0 (compatible; NexbuCheck/1.0; +https://check.nexbu.com)'
const TIMEOUT = 12000

function normalizeUrl(input) {
  let url = input.trim().replace(/\/+$/, '')
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }
  return url
}

export async function runAllChecks(rawUrl, apiKey = null) {
  const url = normalizeUrl(rawUrl)
  const axiosConfig = {
    timeout: TIMEOUT,
    headers: { 'User-Agent': USER_AGENT },
    validateStatus: () => true,
  }

  let homepageResponse = null
  let $ = null

  try {
    homepageResponse = await axios.get(url, { ...axiosConfig, maxRedirects: 5 })
    $ = load(homepageResponse.data || '')
  } catch (err) {
    console.warn('[homepage fetch failed]', err.message)
  }

  const [securityResults, seoResults, contentResults] = await Promise.all([
    runSecurityChecks(url, homepageResponse, $, axiosConfig),
    runSeoChecks(url, homepageResponse, $, axiosConfig),
    runContentChecks(url, homepageResponse, $, axiosConfig),
  ])

  let pluginResults = []
  if (apiKey) {
    pluginResults = await runPluginChecks(url, apiKey, axiosConfig)
  }

  const categories = buildCategories(securityResults, seoResults, contentResults, pluginResults)
  const score = computeScore(categories)

  return {
    url,
    checkedAt: new Date().toISOString(),
    score,
    hasPlugin: apiKey ? pluginResults.length > 0 : false,
    categories,
  }
}

async function runPluginChecks(url, apiKey, axiosConfig) {
  try {
    const r = await axios.get(`${url}/nexbu-check/`, {
      ...axiosConfig,
      headers: {
        ...axiosConfig.headers,
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (r.status === 401 || r.status === 403) {
      return [{ id: 'plugin_auth', title: 'Autenticación con plugin', category: 'plugin', status: 'fail', message: 'API Key inválida o no autorizada.' }]
    }

    if (r.status !== 200 || !r.data?.data) {
      return [{ id: 'plugin_auth', title: 'Plugin Nexbu Check', category: 'plugin', status: 'fail', message: `El endpoint respondió ${r.status}. ¿Está el plugin activado?` }]
    }

    return parsePluginData(r.data.data)
  } catch (err) {
    return [{ id: 'plugin_auth', title: 'Plugin Nexbu Check', category: 'plugin', status: 'fail', message: `No se pudo conectar al endpoint: ${err.message}` }]
  }
}

function parsePluginData(data) {
  const checks = []

  // Child theme
  checks.push({
    id: 'child_theme', title: 'Usa child theme', category: 'plugin',
    status: data.theme?.is_child ? 'pass' : 'fail',
    message: data.theme?.is_child
      ? `Child theme activo: "${data.theme.name}" (padre: ${data.theme.parent})`
      : `No usa child theme. Tema activo: "${data.theme?.name || 'desconocido'}".`,
  })

  // Admin username
  checks.push({
    id: 'admin_user', title: 'Usuario "admin" no existe', category: 'plugin',
    status: data.security?.admin_user_exists ? 'fail' : 'pass',
    message: data.security?.admin_user_exists
      ? 'Existe un usuario con nombre "admin". Cámbialo.'
      : 'No existe usuario con nombre "admin".',
  })

  // Debug mode
  checks.push({
    id: 'debug_mode', title: 'WP_DEBUG deshabilitado', category: 'plugin',
    status: data.security?.debug_mode ? 'fail' : 'pass',
    message: data.security?.debug_mode
      ? 'WP_DEBUG está activado en producción. Puede exponer errores internos.'
      : 'WP_DEBUG deshabilitado.',
  })

  // Search engine discouraged
  checks.push({
    id: 'search_discouraged', title: 'Buscadores no bloqueados desde WP', category: 'plugin',
    status: data.settings?.search_discouraged ? 'fail' : 'pass',
    message: data.settings?.search_discouraged
      ? 'WordPress tiene "Desalentar a los motores de búsqueda" activado.'
      : 'La indexación está permitida en los ajustes de WordPress.',
  })

  // Cache plugin
  checks.push({
    id: 'cache_plugin', title: 'Plugin de caché activo', category: 'plugin',
    status: data.performance?.cache_plugin ? 'pass' : 'warning',
    message: data.performance?.cache_plugin
      ? `Plugin de caché detectado: ${data.performance.cache_plugin}`
      : 'No se detectó plugin de caché (WP Rocket, W3TC, LiteSpeed, etc.).',
  })

  // Backup plugin
  checks.push({
    id: 'backup_plugin', title: 'Plugin de backups activo', category: 'plugin',
    status: data.performance?.backup_plugin ? 'pass' : 'warning',
    message: data.performance?.backup_plugin
      ? `Plugin de backups detectado: ${data.performance.backup_plugin}`
      : 'No se detectó plugin de backups (UpdraftPlus, BackupBuddy, etc.).',
  })

  // Plugin updates
  if (data.plugins?.updates_available?.length > 0) {
    checks.push({
      id: 'plugin_updates', title: 'Plugins actualizados', category: 'plugin',
      status: 'warning',
      message: `${data.plugins.updates_available.length} plugin(s) con actualizaciones pendientes: ${data.plugins.updates_available.join(', ')}.`,
    })
  } else {
    checks.push({
      id: 'plugin_updates', title: 'Plugins actualizados', category: 'plugin',
      status: 'pass',
      message: `Todos los plugins están actualizados (${data.plugins?.active_count || 0} activos).`,
    })
  }

  // DB revisions
  const revisions = data.database?.revisions_count || 0
  checks.push({
    id: 'db_revisions', title: 'Base de datos optimizada', category: 'plugin',
    status: revisions > 500 ? 'warning' : 'pass',
    message: revisions > 500
      ? `${revisions} revisiones en la base de datos. Considera limpiarlas con WP-Optimize.`
      : `Base de datos en buen estado (${revisions} revisiones).`,
  })

  return checks
}

function buildCategories(security, seo, content, plugin) {
  const categoriesMap = {
    security: { id: 'security', label: 'Seguridad', icon: '/seguridad.png', checks: security },
    seo: { id: 'seo', label: 'SEO', icon: '/search.png', checks: seo },
    content: { id: 'content', label: 'Contenido y Rendimiento', icon: '/rendimiento.png', checks: content },
  }

  if (plugin.length > 0) {
    categoriesMap.plugin = { id: 'plugin', label: 'Plugin Nexbu Check', icon: '🔌', checks: plugin }
  }

  return Object.values(categoriesMap).map(cat => ({
    ...cat,
    score: computeCategoryScore(cat.checks),
  }))
}

function computeCategoryScore(checks) {
  const scoreable = checks.filter(c => c.status !== 'manual')
  if (scoreable.length === 0) return 100
  const passed = scoreable.filter(c => c.status === 'pass').length
  return Math.round((passed / scoreable.length) * 100)
}

function computeScore(categories) {
  const allChecks = categories.flatMap(c => c.checks)
  const scoreable = allChecks.filter(c => c.status !== 'manual')
  if (scoreable.length === 0) return 0
  const passed = scoreable.filter(c => c.status === 'pass').length
  return Math.round((passed / scoreable.length) * 100)
}
