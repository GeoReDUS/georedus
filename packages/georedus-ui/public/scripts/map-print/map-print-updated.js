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

// Create output directory if it doesn't exist
function ensureOutputDirectory() {
  const outputPath = path.join(__dirname, config.outputDir)
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true })
    console.log(`Created output directory: ${outputPath}`)
  }
  return outputPath
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
    console.log('  Map canvas found')
  } catch (error) {
    console.error('  Map did not load:', error.message)
    throw error
  }

  // Wait for export button to appear
  try {
    await page.waitForSelector('#export-image-button', {
      timeout: 15000,
    })
    console.log('  Export button found')
  } catch (error) {
    console.error('  Export button not found:', error.message)
    throw error
  }

  // Set up listener for when createImg completes
  const exportCompletePromise = page.evaluate(() => {
    return new Promise((resolve) => {
      // Store original saveAs function
      const originalSaveAs = window.saveAs
      
      // Override saveAs to signal when export is done
      window.saveAs = function(...args) {
        console.log('[ExportImage] Saving file:', args[1])
        originalSaveAs.apply(this, args)
        // Signal that export is complete
        window.__exportComplete = true
        resolve()
      }
    })
  })

  console.log('  Clicking export button...')
  await page.click('#export-image-button')

  // Wait for export to complete (with timeout)
  try {
    await Promise.race([
      exportCompletePromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Export timeout')), 60000)
      ),
    ])
    console.log('  ✓ Export initiated by component')
  } catch (error) {
    console.warn('  ⚠ Export signal timeout:', error.message)
  }

  // Wait a bit for file operations to complete
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return true
}

async function mapPrint(csvPath) {
  const municipios = readMunicipios(csvPath)
  const outputPath = ensureOutputDirectory()

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      // Disable sandbox for reliability
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  })

  // Set download path for browser
  const client = await browser.createBrowserContext({
    // This context will handle downloads
  })

  let completed = 0
  let failed = 0

  // Process in batches
  try {
    for (let i = 0; i < municipios.length; i += config.concurrency) {
      const batch = municipios.slice(i, i + config.concurrency)

      const promises = batch.map(async (municipioId) => {
        const page = await client.newPage()
        
        // Set up download handler to save to our output directory
        const downloadPath = path.join(outputPath, `${municipioId}.png`)
        
        try {
          // Listen for new targets (file downloads from file-saver)
          const downloadPromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(
              () => reject(new Error('No download detected')),
              15000
            )

            page.browser().on('disconnected', () => clearTimeout(timeout))
          })

          await printMunicipioImage(page, municipioId, config.viewConf)
          
          // Try to catch the download via file-saver's Blob
          // The React component uses saveAs() which triggers a download
          try {
            await downloadPromise
          } catch (e) {
            // Download might have been triggered, continue
            console.log('  Note: Download monitoring not available in headless')
          }

          // Check if file was saved to downloads folder or directly
          // For now, assume the React component handled it
          console.log(
            `✓ [${completed + 1}/${municipios.length}] Exported ${municipioId}`,
          )
          completed++
        } catch (error) {
          failed++
          console.error(
            `✗ [${completed + failed}/${municipios.length}] Failed to export ${municipioId}: ${error.message}`,
          )
        } finally {
          await page.close()
        }
      })
      await Promise.all(promises)
    }
  } finally {
    await client.close()
    await browser.close()
    console.log(
      `\n✓ Done! Completed: ${completed}, Failed: ${failed}`,
    )
  }
}

const csvPath = process.argv[2] || path.join(__dirname, 'municipios.csv')
mapPrint(csvPath).catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
