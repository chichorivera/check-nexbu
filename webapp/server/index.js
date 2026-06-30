import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { runAllChecks } from './checks/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
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
    res.json(results)
  } catch (err) {
    console.error('[check error]', err.message)
    res.status(500).json({ error: 'Error interno al analizar el sitio' })
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
