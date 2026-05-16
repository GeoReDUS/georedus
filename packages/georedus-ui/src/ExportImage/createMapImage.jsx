import { toBlob } from 'html-to-image'
import { getPaperDimensions } from './paperDimensions'

// Paper dimensions for final image export (PAPER_WIDTH = 1200 for preview)
const {
  PAPER_WIDTH,
  PAPER_HEIGHT,
  MARGIN,
  PIXELRATIO,
  MAP_WIDTH,
  MAP_HEIGHT,
  BOTTOM_HEIGHT,
  DESCRIPTION_WIDTH,
  QRCODE_SIZE,
  LEGEND_WIDTH,
  LOGO_HEIGHT,
  PROJECTION_HEIGHT,
  MAPINFO_PADDING,
  NORTH_SIZE,
} = getPaperDimensions(3508)

function createImg(blob) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.src = URL.createObjectURL(blob)
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
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, PAPER_WIDTH, PAPER_HEIGHT)

  //1 - DRAW MAP ON CANVAS
  // Fill background white
  ctx.drawImage(mapCanvas, MARGIN, MARGIN, MAP_WIDTH, MAP_HEIGHT)

  //2 - Draw Map Infos
  //2.1 - Create images from blobs (to get dimensions)
  const projectionImg = await createImg(blobProjection)
  const northArrowImg = await createImg(blobNorthArrow)
  const scaleImg = await createImg(blobScale)

  //2.2 - Projection dimensions and position
  const projectionPosX = MARGIN + MAPINFO_PADDING
  const projectionPosY =
    MARGIN + MAP_HEIGHT - MAPINFO_PADDING - PROJECTION_HEIGHT
  const projectionWidth = Math.round(
    PROJECTION_HEIGHT * (projectionImg.width / projectionImg.height),
  )

  //2.3 - North dimensions and position (to the right of projection)
  const northPadding = (PROJECTION_HEIGHT - NORTH_SIZE) / 2
  const northPosX = projectionPosX + projectionWidth + MAPINFO_PADDING
  const northPosY = projectionPosY + northPadding

  //2.4 - Scale dimensions and position (below projection)
  const scaleX = MAP_WIDTH / mapCanvas.width / PIXELRATIO
  const scaleY = MAP_HEIGHT / mapCanvas.height / PIXELRATIO
  const scalePadding = (PROJECTION_HEIGHT - scaleImg.height * scaleY) / 2
  const scalePosX = northPosX + NORTH_SIZE + MAPINFO_PADDING
  const scalePosY = projectionPosY + scalePadding
  const scaleWidth = Math.round(scaleImg.width * scaleX)
  const scaleHeight = Math.round(scaleImg.height * scaleY)

  //2.5 - Background dimensions and position
  const backgroundX = MARGIN + MAPINFO_PADDING
  const backgroundY = projectionPosY
  const backgroundWidth = projectionWidth * 2 + NORTH_SIZE
  const backgroundHeight = PROJECTION_HEIGHT

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
    PROJECTION_HEIGHT,
  )
  ctx.drawImage(northArrowImg, northPosX, northPosY, NORTH_SIZE, NORTH_SIZE)
  ctx.drawImage(scaleImg, scalePosX, scalePosY, scaleWidth, scaleHeight)

  //3 - Draw logo on bottom left of map
  const logoImg = await createImg(blobLogo)
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

  ctx.drawImage(
    logoImg,
    logoPosX,
    logoPosY,
    logoWidth,
    LOGO_HEIGHT,
  )

  //3 - Calculate positions for bottom section elements and scale
  const bottomStartY = MAP_HEIGHT + MARGIN * 1.5

  //4 - DRAW DESCRIPTION
  const descriptionImg = await createImg(blobDescription)
  ctx.drawImage(
    descriptionImg,
    MARGIN,
    bottomStartY,
    DESCRIPTION_WIDTH,
    BOTTOM_HEIGHT,
  )

  //5 - DRAW LEGEND
  const legendImg = await createImg(blobLegend)
  const legendScale = legendImg.width / legendImg.height
  const legendHeight = BOTTOM_HEIGHT
  const legendWidth = legendHeight * legendScale
  ctx.drawImage(
    legendImg,
    MARGIN * 1.5 + DESCRIPTION_WIDTH,
    bottomStartY,
    legendWidth,
    legendHeight,
  )

  //6 - DRAW QR CODE
  const qrCodeImg = await createImg(blobQRCode)
  ctx.drawImage(
    qrCodeImg,
    PAPER_WIDTH - MARGIN - QRCODE_SIZE,
    PAPER_HEIGHT - MARGIN - QRCODE_SIZE,
    QRCODE_SIZE,
    QRCODE_SIZE,
  )

  return new Promise((resolve) => {
    combinedCanvas.toBlob((blob) => {
      resolve(blob)
    })
  })
}
