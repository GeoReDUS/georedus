import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync' // or use a simpler CSV parser
import puppeteer from 'puppeteer'
import { config } from './export-config.js'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = dirname(__filename)

// function readMunicipios(csvPath) {
//   const file = fs.readFileSync(csvPath, 'utf-8')
//   const records = parse(file, { columns: true })
//   return records.map(r => r.municipioId)
// }

async function exportMunicipioImage(page, municipioId, viewConf) {
  // 1. Navigate to URL with municipioId
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

  // 3. Wait a bit more for legends/UI to render
  try {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    console.log('Lengends rendered')
  } catch (error) {
    console.error('Legends did not load:', error.message)
    throw error
  }

  // 4. Debug: Check if the share button exists
  try {
    const shareButtonExists = await page.evaluate(() => {
      return !!document.getElementById('share-map')
    })
    console.log('Share button exists:', shareButtonExists)

    if (shareButtonExists) {
      const buttonInfo = await page.evaluate(() => {
        const btn = document.getElementById('share-map')
        return {
          visible: btn.offsetParent !== null,
          display: window.getComputedStyle(btn).display,
          className: btn.className,
        }
      })
      console.log('Button info:', buttonInfo)
    }
  } catch (error) {
    console.error('Error checking button:', error.message)
  }

  // 4. Click "Compartilhar" button to open modal
  try {
    await page.locator('#share-map').click({ timeout: 5000 })
    console.log('Share button clicked')
  } catch (error) {
    console.error('Share button click failed:', error.message)
    throw error
  }

  // 5. Wait for modal to appear
  await new Promise((resolve) => setTimeout(resolve, 10000))
  console.log('Modal should be open now')

  // Debug: Check what's actually in the modal
  try {
    const modalContent = await page.evaluate(() => {
      return {
        bodyHTML: document.body.innerHTML.substring(0, 1000),
        iframes: document.querySelectorAll('iframe').length,
        allText: document.body.innerText.substring(0, 500),
      }
    })
    console.log('Modal content:', JSON.stringify(modalContent, null, 2))
  } catch (error) {
    console.error('Error checking modal:', error.message)
  }

  // List all buttons with their full text
  try {
    const allButtons = await page.$$eval('button', (buttons) =>
      buttons.map((b) => ({
        text: b.innerText || b.textContent,
        id: b.id,
        className: b.className.substring(0, 100),
      })),
    )
    console.log('All button texts:', allButtons)
  } catch (error) {
    console.error('Error listing buttons:', error.message)
  }

  // 6. Click "Baixar imagem" button inside modal
  try {
    // Try finding by text content instead of ID
    const foundButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      return buttons.find((b) => b.textContent?.includes('Baixar imagem'))
    })

    if (foundButton) {
      console.log('Found "Baixar imagem" button by text')
      await page
        .locator('button:has-text("Baixar imagem")')
        .click({ timeout: 5000 })
      console.log('Button clicked')
    } else {
      console.error('Could not find "Baixar imagem" button')
      throw new Error('Baixar imagem button not found')
    }
  } catch (error) {
    console.error('Button click failed:', error.message)
    throw error
  }
  //   try {
  //     const exportButtonExists = await page.evaluate(() => {
  //       return !!document.getElementById('export-image-button')
  //     })
  //     console.log('Export button exists:', exportButtonExists)
  //     await page.locator('#export-image-button').click({ timeout: 5000 })
  //     console.log('Button clicked')
  //   } catch (error) {
  //     console.error('Button click failed:', error.message)
  //     throw error
  //   }

  // 5. Wait for download (Puppeteer auto-saves to Downloads folder)
  await new Promise((resolve) => setTimeout(resolve, 2000))

  return true
}

// async function captureDownload(page, municipioId) {
//   // Setup download folder
//   const downloadPath = path.join(process.cwd(), config.outputDir)
//   if (!fs.existsSync(downloadPath)) {
//     fs.mkdirSync(downloadPath, { recursive: true })
//   }

//   // Configure Puppeteer to save downloads to your folder
//   // This requires CDP (Chrome DevTools Protocol)
//   return new Promise((resolve, reject) => {
//     page.on('response', response => {
//       if (response.headers()['content-disposition']?.includes('attachment')) {
//         response.buffer().then(buffer => {
//           fs.writeFileSync(
//             path.join(downloadPath, `${municipioId}_georedus.png`),
//             buffer
//           )
//           resolve()
//         })
//       }
//     })
//   })
// }

// async function batchExport(csvPath) {
//   const municipios = readMunicipios(csvPath)
//   const browser = await puppeteer.launch({ headless: 'new' })

//   let completed = 0
//   let failed = 0

//   // Process in batches of 3 (concurrency: 3)
//   for (let i = 0; i < municipios.length; i += config.concurrency) {
//     const batch = municipios.slice(i, i + config.concurrency)

//     const promises = batch.map(async (municipioId) => {
//       try {
//         const page = await browser.newPage()
//         await exportMunicipioImage(page, municipioId, config.viewConf)
//         completed++
//         console.log(`[${completed}/${municipios.length}] Exported ${municipioId}`)
//         await page.close()
//       } catch (error) {
//         failed++
//         console.error(`Failed to export ${municipioId}: ${error.message}`)
//       }
//     })

//     await Promise.all(promises)
//   }

//   await browser.close()
//   console.log(`\nDone! Completed: ${completed}, Failed: ${failed}`)
// }

// // Run
// const csvPath = process.argv[2] || path.join(__dirname, 'municipios.csv')
// batchExport(csvPath)

async function batchExport() {
  const browser = await puppeteer.launch({ headless: 'new' })
  const page = await browser.newPage()
  await exportMunicipioImage(page, 4115200, config.viewConf)
  return
}

batchExport()
