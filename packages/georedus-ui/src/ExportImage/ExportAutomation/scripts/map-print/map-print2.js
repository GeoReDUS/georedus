import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync' // or use a simpler CSV parser
import puppeteer from 'puppeteer'
import { config } from './export-config.js'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const outputDir = path.join(__dirname, 'exported-images')
fs.mkdirSync(outputDir, { recursive: true })

function readMunicipios(csvPath) {
  const file = fs.readFileSync(csvPath, 'utf-8')
  const records = parse(file, { columns: true })
  return records.map((r) => r.municipioId)
}

async function wait(ms) {
  return await new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

const MAX_LOAD_RETRIES = 2 // number of reload attempts before giving up on this id
const READY_TIMEOUT = 60000

async function navigateAndWaitReady(page, url, { reload = false } = {}) {
  if (reload) {
    await page.reload({ waitUntil: 'domcontentloaded' })
  } else {
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
    })
  }

  await page.waitForSelector('.maplibregl-canvas')

  await wait(7000)

  await page.waitForFunction(
    () => {
      console.log('Waiting for map to be ready and bounds applied')
      const createImgReady = typeof window.__createImg === 'function'
      const tilesReady = window.__tilesLoading === false
      const boundsApplied = window.__mapBoundsApplied === true
      return createImgReady && tilesReady && boundsApplied
    },
    { timeout: READY_TIMEOUT },
  )
}

async function printMunicipioImage(page, municipioId, viewConf) {
  // Navigate to URL with municipioId
  const url = `${config.baseUrl}&municipioId=${municipioId}&viewConf=${viewConf}`

  let lastError = null

  for (let attempt = 0; attempt <= MAX_LOAD_RETRIES; attempt++) {
    try {
      if (attempt === 0) {
        await navigateAndWaitReady(page, url)
      } else {
        console.log(
          `Retrying ${municipioId} (attempt ${attempt}/${MAX_LOAD_RETRIES}) — reloading page`,
        )
        await navigateAndWaitReady(page, url, { reload: true })
      }

      await wait(3000)

      await page.evaluate(async () => {
        console.log('evaluating create Img')
        await window.__createImg()
      })

      await wait(3000)

      return true
    } catch (error) {
      lastError = error
      console.error(
        `Ready-check failed for ${municipioId} on attempt ${attempt}: ${error.message}`,
      )
    }
  }

  // All attempts exhausted
  throw lastError
}

async function mapPrint(csvPath) {
  const municipios = readMunicipios(csvPath)
  const browser = await puppeteer.launch({
    headless: false,
    args: [`--download-default-directory=${outputDir}`],
  })

  let completed = 0
  let failed = 0

  // Process in batches of 3 (concurrency: 3)
  try {
    for (let i = 0; i < municipios.length; i += config.concurrency) {
      const batch = municipios.slice(i, i + config.concurrency)

      const promises = batch.map(async (municipioId) => {
        const page = await browser.newPage()
        const client = await page.createCDPSession()
        await client.send('Browser.setDownloadBehavior', {
          behavior: 'allow',
          downloadPath: outputDir,
          eventsEnabled: true,
        })
        await page.setViewport({ width: 1920, height: 1080 })
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
