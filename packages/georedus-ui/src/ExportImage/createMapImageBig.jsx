import { getPaperDimensions } from './paperDimensions'

import { PAPER_WIDTH_PX } from './constants.js'
const {
  PAPER_WIDTH,
  PAPER_HEIGHT,
  INSIDE_WIDTH,
  INSIDE_HEIGHT,
  MARGIN,
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
  ctx.drawImage(mapCanvas, MARGIN, MARGIN, INSIDE_WIDTH, INSIDE_HEIGHT)

  //2 - Draw Map Infos
  //2.1 - Create images from blobs (to get dimensions)
  const projectionImg = await createImg(blobProjection)
  const northArrowImg = await createImg(blobNorthArrow)
  const scaleImg = await createImg(blobScale)

  let projectionPosX = 0
  let projectionPosY = 0
  let projectionWidth = 0
  let projectionHeight = 0

  //2.2 - Projection dimensions and position
  if (projectionImg && northArrowImg && scaleImg) {
    projectionWidth = projectionImg.width
    projectionHeight = projectionImg.height
    projectionPosX = MARGIN + MAPINFO_PADDING
    projectionPosY = MARGIN + INSIDE_HEIGHT - MAPINFO_PADDING - projectionHeight

    //2.3 - North dimensions and position (to the right of projection)
    const northPadding = (projectionHeight - NORTH_SIZE) / 2
    const northPosX = projectionPosX + projectionWidth + MAPINFO_PADDING
    const northPosY = projectionPosY + northPadding

    //2.4 - Scale dimensions and position (below projection)
    const scaleX = INSIDE_WIDTH / mapCanvas.width
    const scaleY = INSIDE_HEIGHT / mapCanvas.height
    const scalePadding = (projectionHeight - scaleImg.height * scaleY) / 2
    const scalePosX = northPosX + NORTH_SIZE + MAPINFO_PADDING
    const scalePosY = projectionPosY + scalePadding
    const scaleWidth = Math.round(scaleImg.width * scaleX)
    const scaleHeight = Math.round(scaleImg.height * scaleY)

    //2.5 - Background dimensions and position
    const backgroundX = MARGIN + MAPINFO_PADDING
    const backgroundY = projectionPosY
    const backgroundWidth =
      projectionWidth +
      NORTH_SIZE +
      scaleWidth / PIXELRATIO
    const backgroundHeight = projectionHeight

    //2.6 - Draw Map Info background
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

    //2.7 - Draw Map Infos
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

  //3 - Draw logo on bottom left of map

  const logoImg = await createImg(blobLogo)
  if (logoImg) {
    const logoScale = logoImg.width / logoImg.height
    const logoPosX = MARGIN + MAPINFO_PADDING
    const logoPosY = projectionPosY - MAPINFO_PADDING - LOGO_HEIGHT
    const logoWidth = Math.round(LOGO_HEIGHT * logoScale)

    ctx.fillStyle = '#ffffff80'
    roundRect(
      ctx,
      logoPosX,
      logoPosY,
      logoWidth,
      LOGO_HEIGHT,
      MAPINFO_PADDING / 2,
    )
    ctx.fill()

    ctx.drawImage(logoImg, logoPosX, logoPosY, logoWidth, LOGO_HEIGHT)
  }

  //3 - Calculate positions for bottom section elements and scale
  const bottomStartY = INSIDE_HEIGHT + MARGIN * 1.5

  //5 - DRAW LEGEND
  const legendImg = await createImg(blobLegend)
  console.log(legendImg)
  if (legendImg) {
    const legendHeight = legendImg.height
    const legendWidth = legendImg.width
    ctx.drawImage(
      legendImg,
      PAPER_WIDTH - MARGIN - MAPINFO_PADDING - legendWidth,
      PAPER_HEIGHT - MARGIN - MAPINFO_PADDING - legendHeight,
      legendWidth,
      legendHeight,
    )
  }

  return new Promise((resolve) => {
    combinedCanvas.toBlob((blob) => {
      resolve(blob)
    })
  })
}
