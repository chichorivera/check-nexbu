import archiver from 'archiver'
import { createWriteStream, mkdirSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PLUGIN_SRC = join(__dirname, '../../plugin-nexbu-check')
const OUTPUT_DIR = join(__dirname, '../public/downloads')
const OUTPUT_FILE = join(OUTPUT_DIR, 'nexbu-check-plugin.zip')

if (!existsSync(PLUGIN_SRC)) {
  console.error(`[zip-plugin] No se encontró el plugin en ${PLUGIN_SRC}`)
  process.exit(1)
}

mkdirSync(OUTPUT_DIR, { recursive: true })

const output = createWriteStream(OUTPUT_FILE)
const archive = archiver('zip', { zlib: { level: 9 } })

output.on('close', () => {
  console.log(`[zip-plugin] nexbu-check-plugin.zip generado (${(archive.pointer() / 1024).toFixed(1)} KB)`)
})

archive.on('error', (err) => { throw err })
archive.pipe(output)

// Nest files under nexbu-check-plugin/ so the zip extracts cleanly into wp-content/plugins/
archive.directory(PLUGIN_SRC, 'nexbu-check-plugin')
archive.finalize()
