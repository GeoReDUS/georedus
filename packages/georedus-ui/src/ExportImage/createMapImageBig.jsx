import { getPaperDimensions } from './paperDimensions'

import { PAPER_WIDTH_PX } from './constants.js'
const {
  MAPWIDTH,
  PAPER_WIDTH,
  PAPER_HEIGHT,
  PIXELRATIO,
  BOTTOM_HEIGHT,
  DESCRIPTION_WIDTH,
  QRCODE_SIZE,
  LOGO_HEIGHT,
  MAPINFO_PADDING,
  NORTH_SIZE,
} = getPaperDimensions(PAPER_WIDTH_PX)

function createImg(blob) {
  return new Promise((resolve) => {
    if (!blob) {
      resolve(null)
      return
    }
    try {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => {
        console.warn('Failed to load image')
        resolve(null)
      }
      img.src = URL.createObjectURL(blob)
    } catch (error) {
      console.error('Error creating image from blob:', error)
      resolve(null)
    }
  })
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

// Compose canvas AFTER (using already-extracted blobs)
export async function composeMapImageCanvas(extractedBlobs) {
  const {
    mapCanvas,
    blobLegend,
    blobDescription,
    blobQRCode,
    blobLogo,
    blobProjection,
    blobNorthArrow,
    blobScale,
  } = extractedBlobs

  //0 - CREATE COMBINED CANVAS
  const combinedCanvas = document.createElement('canvas')
  combinedCanvas.width = PAPER_WIDTH
  combinedCanvas.height = PAPER_HEIGHT

  const ctx = combinedCanvas.getContext('2d')
  // Fill background white
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, PAPER_WIDTH, PAPER_HEIGHT)

  //1 - DRAW MAP ON CANVAS
  ctx.drawImage(mapCanvas, 0, 0, PAPER_WIDTH, PAPER_HEIGHT)

  //2 - Draw Map Infos
  //2.1 - DRAW LEGEND
  const legendImg = await createImg(blobLegend)
  let legendWidth = 0
  if (legendImg) {
    const legendHeight = legendImg.height //* 0.9
    legendWidth = legendImg.width //* 0.9
    ctx.drawImage(
      legendImg,
      PAPER_WIDTH - MAPINFO_PADDING - legendWidth,
      PAPER_HEIGHT - MAPINFO_PADDING - legendHeight,
      legendWidth,
      legendHeight,
    )
  }
  //2.2 - DRAW INFORMATIONS (logo, projection, north arrow, scale)
  const projectionImg = await createImg(blobProjection)
  const northArrowImg = await createImg(blobNorthArrow)
  const scaleImg = await createImg(blobScale)
  const logoImg = await createImg(blobLogo)

  //2.2.0 - Informations dimensions and position
  if (logoImg && projectionImg && northArrowImg && scaleImg) {
    // 2.2.1 Logo dimentsions and position
    const logoScale = logoImg.width / logoImg.height
    const logoPosX = MAPINFO_PADDING
    const logoPosY = PAPER_HEIGHT - MAPINFO_PADDING - LOGO_HEIGHT
    const logoWidth = Math.round(LOGO_HEIGHT * logoScale)

    // 2.2.2 - Projection dimensions and position
    const projectionWidth = projectionImg.width
    const projectionHeight = projectionImg.height
    const projectionPosX = logoPosX + logoWidth + MAPINFO_PADDING
    const projectionPosY = logoPosY

    //2.2.3 - North dimensions and position (to the right of projection)
    const northPadding = (projectionHeight - NORTH_SIZE) / 2
    const northPosX = projectionPosX + projectionWidth + MAPINFO_PADDING
    const northPosY = logoPosY + northPadding

    //2.2.4 - Scale dimensions and position (below projection)
    const scaleX = PAPER_WIDTH / mapCanvas.width
    const scaleY = PAPER_HEIGHT / mapCanvas.height
    const scalePadding = (projectionHeight - scaleImg.height * scaleY) / 2
    const scalePosX = northPosX + NORTH_SIZE + MAPINFO_PADDING
    const scalePosY = logoPosY + scalePadding
    const scaleWidth = Math.round(scaleImg.width * scaleX)
    const scaleHeight = Math.round(scaleImg.height * scaleY)

    //2.2.5 - Background dimensions and position
    const backgroundX = +MAPINFO_PADDING
    const backgroundY = logoPosY
    const backgroundWidth = PAPER_WIDTH - 3 * MAPINFO_PADDING - legendWidth
    const backgroundHeight = projectionHeight

    //2.2.6 - Draw Map Info background
    ctx.fillStyle = '#ffffff80'
    roundRect(
      ctx,
      backgroundX,
      backgroundY,
      backgroundWidth,
      backgroundHeight,
      MAPINFO_PADDING / 2,
    )
    ctx.fill()

    //2.2.7 - Draw Map Infos
    ctx.drawImage(logoImg, logoPosX, logoPosY, logoWidth, LOGO_HEIGHT)
    ctx.drawImage(
      projectionImg,
      projectionPosX,
      projectionPosY,
      projectionWidth,
      projectionHeight,
    )
    ctx.drawImage(northArrowImg, northPosX, northPosY, NORTH_SIZE, NORTH_SIZE)
    ctx.drawImage(scaleImg, scalePosX, scalePosY, scaleWidth, scaleHeight)
  }

  return new Promise((resolve) => {
    combinedCanvas.toBlob((blob) => {
      resolve(blob)
    })
  })
}
