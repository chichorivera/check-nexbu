import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { mkdirSync } from 'fs'
import { writeFile, readFile } from 'fs/promises'
import { randomUUID } from 'crypto'
import { runAllChecks } from './checks/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const RESULTS_DIR = join(__dirname, 'results')
mkdirSync(RESULTS_DIR, { recursive: true })

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())
app.use(cors())

app.post('/api/check', async (req, res) => {
  const { url, apiKey } = req.body

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL requerida' })
  }

  try {
    const results = await runAllChecks(url.trim(), apiKey || null)
    const shareId = randomUUID()
    await writeFile(join(RESULTS_DIR, `${shareId}.json`), JSON.stringify(results))
    res.json({ ...results, shareId })
  } catch (err) {
    console.error('[check error]', err.message)
    res.status(500).json({ error: 'Error interno al analizar el sitio' })
  }
})

app.get('/api/r/:id', async (req, res) => {
  const { id } = req.params
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) {
    return res.status(400).json({ error: 'ID inválido' })
  }
  try {
    const raw = await readFile(join(RESULTS_DIR, `${id}.json`), 'utf8')
    res.json(JSON.parse(raw))
  } catch {
    res.status(404).json({ error: 'Análisis no encontrado o expirado' })
  }
})

app.get('/api/ping', (_req, res) => res.json({ ok: true }))

if (process.env.NODE_ENV === 'production') {
  const distPath = join(__dirname, '../dist')
  app.use(express.static(distPath))
  app.get('*', (_req, res) => {
    res.sendFile(join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Nexbu Check server → http://localhost:${PORT}`)
})
