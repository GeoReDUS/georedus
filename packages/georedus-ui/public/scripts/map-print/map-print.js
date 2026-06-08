import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync' // or use a simpler CSV parser
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

async function printMunicipioImage(page, municipioId, viewConf) {
  // Navigate to URL with municipioId
  const url = `${config.baseUrl}&municipioId=${municipioId}&viewConf=${viewConf}`
  try {
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    })
  } catch (error) {
    console.error('Navigation failed:', error.message)
    throw error
  }
  console.log('Page loaded:', url)

  try {
    await page.waitForSelector('.maplibregl-canvas', {
      timeout: 10000,
    })
    console.log('Map canvas found')
  } catch (error) {
    console.error('Map did not load:', error.message)
    throw error
  }

  // Give the map time to finish rendering
  await page.waitForNetworkIdle({
    idleTime: 2000,
    timeout: 20000,
  })

	// Componente precisaria enviar feedback de que acabou de carregar
  // await page.waitForFunction(() => window.mapReady === true, { timeout: 30000 })

  console.log('Map loaded')

  // Small extra delay for animations/rendering
  await new Promise((resolve) => setTimeout(resolve, 2000))

  console.log('Timeout')

  await page.screenshot({
    path: `./public/exported-images/map-${municipioId}.png`,
    fullPage: true,
  })

  console.log('Screenshot')

  return true
}

async function mapPrint(csvPath) {
  const municipios = readMunicipios(csvPath)
  const browser = await puppeteer.launch({ headless: 'new' })

  let completed = 0
  let failed = 0

  // Process in batches of 3 (concurrency: 3)
  try {
    for (let i = 0; i < municipios.length; i += config.concurrency) {
      const batch = municipios.slice(i, i + config.concurrency)

      const promises = batch.map(async (municipioId) => {
        const page = await browser.newPage()
        try {
          await printMunicipioImage(page, municipioId, config.viewConf)
          completed++
          console.log(
            `[${completed}/${municipios.length}] Exported ${municipioId}`,
          )
        } catch (error) {
          failed++
          console.error(`Failed to export ${municipioId}: ${error.message}`)
        } finally {
          await page.close()
        }
      })
      await Promise.all(promises)
    }
  } finally {
    await browser.close()
    console.log(`\nDone! Completed: ${completed}, Failed: ${failed}`)
  }
}

const csvPath = process.argv[2] || path.join(__dirname, 'municipios.csv')
mapPrint(csvPath)
