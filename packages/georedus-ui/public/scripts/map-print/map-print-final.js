import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import puppeteer from 'puppeteer'
import { config } from './export-config.js'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function readMunicipios(csvPath) {
  const file = fs.readFileSync(csvPath, 'utf-8')
  const records = parse(file, { columns: true })
  return records.map((r) => r.municipioId)
}

function ensureOutputDirectory() {
  const outputPath = path.join(__dirname, config.outputDir)
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true })
  }
  return outputPath
}

async function printMunicipioImage(page, municipioId, viewConf, outputPath) {
  const url = `${config.baseUrl}&municipioId=${municipioId}&viewConf=${viewConf}`
  
  // Expose a Node.js function to the browser
  await page.exposeFunction('__saveFile', async (blobData, filename) => {
    const filePath = path.join(outputPath, filename)
    const buffer = Buffer.from(blobData, 'base64')
    fs.writeFileSync(filePath, buffer)
    console.log(`  ✓ Saved: ${filename} (${buffer.length} bytes)`)
    return true
  })

  try {
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    })
  } catch (error) {
    console.error('Navigation failed:', error.message)
    throw error
  }
  console.log('Page loaded')

  // Capture browser logs (filter out noisy re-render logs)
  page.on('console', (msg) => {
    const text = msg.text()
    const type = msg.type()
    // Only show errors and important component logs, skip repetitive viewConfState logs
    if (type === 'error' || text.includes('[Component]') || text.includes('[SCRIPT]') || text.includes('MapReady')) {
      console.log(`  [${type.toUpperCase()}] ${text}`)
    }
  })

  try {
    await page.waitForSelector('.maplibregl-canvas', { timeout: 10000 })
    console.log('  ✓ Map canvas found')
  } catch (error) {
    console.error('  ✗ Map not found:', error.message)
    throw error
  }

  try {
    await page.waitForSelector('#export-image-button', { timeout: 15000 })
    console.log('  ✓ Export button found')
  } catch (error) {
    console.error('  ✗ Button not found:', error.message)
    throw error
  }

  console.log('  Calling window.__triggerExport()...')
  
  // Initialize the export done flag
  await page.evaluate(() => {
    window.__exportDone = false
  })

  // Call the exposed function directly (more reliable than button click)
  const triggerResult = await page.evaluate(() => {
    if (typeof window.__triggerExport === 'function') {
      console.log('[SCRIPT] Calling __triggerExport directly')
      window.__triggerExport()
      return true
    }
    return false
  })

  if (!triggerResult) {
    throw new Error('window.__triggerExport function not found - component not initialized')
  }

  console.log('  ✓ Export triggered via __triggerExport()')

  // Wait for export to complete (component will set window.__exportDone)
  try {
    await page.waitForFunction(() => window.__exportDone === true, {
      timeout: 30000,
      polling: 500,
    })
    console.log('  ✓ Export completed')
    return true
  } catch (error) {
    const state = await page.evaluate(() => ({
      exportDone: window.__exportDone,
      triggerExists: typeof window.__triggerExport === 'function',
    }))
    console.log('  Debug state:', state)
    throw new Error(`Export timeout: ${error.message}`)
  }
}

async function mapPrint(csvPath) {
  const municipios = readMunicipios(csvPath)
  const outputPath = ensureOutputDirectory()

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  let completed = 0
  let failed = 0

  try {
    for (let i = 0; i < municipios.length; i += config.concurrency) {
      const batch = municipios.slice(i, i + config.concurrency)

      const promises = batch.map(async (municipioId) => {
        const page = await browser.newPage()
        try {
          await printMunicipioImage(page, municipioId, config.viewConf, outputPath)
          completed++
          console.log(`✓ [${completed}/${municipios.length}] ${municipioId}\n`)
        } catch (error) {
          failed++
          console.error(`✗ [${completed + failed}/${municipios.length}] ${municipioId}: ${error.message}\n`)
        } finally {
          await page.close()
        }
      })
      await Promise.all(promises)
    }
  } finally {
    await browser.close()
    console.log(`\n========================================`)
    console.log(`Done! Completed: ${completed}, Failed: ${failed}`)
    console.log(`========================================`)
  }
}

const csvPath = process.argv[2] || path.join(__dirname, 'municipios.csv')
mapPrint(csvPath).catch((error) => {
  console.error('Fatal error:', error.message)
  process.exit(1)
})
