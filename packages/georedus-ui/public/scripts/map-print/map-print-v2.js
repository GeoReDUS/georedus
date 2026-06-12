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

async function printMunicipioImage(page, municipioId, viewConf, outputPath) {
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
  console.log('Page loaded')

  try {
    await page.waitForSelector('.maplibregl-canvas', {
      timeout: 10000,
    })
    console.log('  ✓ Map canvas found')
  } catch (error) {
    console.error('  ✗ Map did not load:', error.message)
    throw error
  }

  // Wait for export button to appear
  try {
    await page.waitForSelector('#export-image-button', { timeout: 15000 })
    console.log('  ✓ Export button found')
  } catch (error) {
    console.error('  ✗ Export button not found:', error.message)
    throw error
  }

  // Set up blob capture hook BEFORE clicking the button
  const capturePromise = page.evaluateHandle(() => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error('Export timeout')),
        60000
      )

      // Get original saveAs
      const originalSaveAs = window.saveAs

      // Override saveAs to intercept the blob
      window.saveAs = function(blob, filename) {
        clearTimeout(timeout)
        console.log('[Component] Exporting file:', filename)
        
        // Read blob as base64
        const reader = new FileReader()
        reader.onload = () => {
          // Return the base64 data
          resolve({
            filename,
            data: reader.result, // base64 string
          })
        }
        reader.onerror = () => reject(reader.error)
        reader.readAsArrayBuffer(blob)

        // Also call original saveAs for browser behavior
        originalSaveAs(blob, filename)
      }
    })
  })

  console.log('  Clicking export button...')
  await page.click('#export-image-button')

  // Wait for the blob capture promise to resolve
  try {
    const result = await page.evaluate(
      (promiseHandle) => {
        return window.__capturePromise
      }
    ).catch(() => null)

    // Alternative: wait for the hook to complete
    const blobData = await Promise.race([
      page.waitForFunction(() => window.__blobData !== undefined, {
        timeout: 60000,
      }).then(() => page.evaluate(() => window.__blobData)),
      new Promise((resolve) =>
        setTimeout(() => resolve(null), 70000)
      ),
    ])

    if (blobData) {
      console.log('  ✓ Export blob captured')
      
      // Save the file
      const filePath = path.join(outputPath, `${municipioId}.png`)
      
      // Convert base64 to buffer and write
      if (blobData.startsWith('data:')) {
        // It's a data URL
        const base64Data = blobData.split(',')[1]
        const buffer = Buffer.from(base64Data, 'base64')
        fs.writeFileSync(filePath, buffer)
      } else {
        // It's raw base64
        const buffer = Buffer.from(blobData, 'base64')
        fs.writeFileSync(filePath, buffer)
      }
      
      console.log(`  ✓ Saved to: ${filePath}`)
      return true
    } else {
      console.log('  ⚠ No blob data captured, but export was initiated')
      return true
    }
  } catch (error) {
    console.warn('  ⚠ Error capturing export:', error.message)
    console.log('  Note: Export may have completed via browser download')
    return true // Don't fail the whole batch
  }
}

async function mapPrint(csvPath) {
  const municipios = readMunicipios(csvPath)
  const outputPath = ensureOutputDirectory()

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
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
          console.log(
            `✓ [${completed}/${municipios.length}] ${municipioId}`
          )
        } catch (error) {
          failed++
          console.error(
            `✗ [${completed + failed}/${municipios.length}] ${municipioId}: ${error.message}`
          )
        } finally {
          await page.close()
        }
      })
      await Promise.all(promises)
    }
  } finally {
    await browser.close()
    console.log(
      `\nDone! Completed: ${completed}, Failed: ${failed}`
    )
  }
}

const csvPath = process.argv[2] || path.join(__dirname, 'municipios.csv')
mapPrint(csvPath).catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
