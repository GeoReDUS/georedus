import { toBlob } from 'html-to-image'

export const LEGEND_CLASS_NAME = 'LegendContainer'
export const IMAGE_DESCRIPTION_CLASS_NAME = 'ImageDescription'
export const QR_CODE_CLASS_NAME = 'QrCode'
export const LOGO_CLASS_NAME = 'Logo'
export const PROJECTION_CLASS_NAME = 'Projection'
export const NORTH_ARROW_CLASS_NAME = 'NorthArrow'
export const SCALE_CONTROL_CLASS_NAME = 'ScaleControl'

const MARGIN = 100
const CANVAS_WIDTH = 3508
const CANVAS_HEIGHT = 2480


export async function createMapImage({
  map,
  rootEl,
}) {

  const mapCanvas = map.getCanvas()

  const blobLegend = await toBlob(rootEl.querySelector(`.${LEGEND_CLASS_NAME}`), {
    cacheBust: true,
    pixelRatio: 2,
    fontEmbedCSS: false,
    backgroundColor: '#ffffff',
  })

  const blobDescription = await toBlob(rootEl.querySelector(`.${IMAGE_DESCRIPTION_CLASS_NAME}`), {
    cacheBust: true,
    pixelRatio: 2,
    fontEmbedCSS: false,
    backgroundColor: '#ffffff',
  })

  const blobQRCode = await toBlob(rootEl.querySelector(`.${QR_CODE_CLASS_NAME}`), {
    cacheBust: true,
    pixelRatio: 2,
    fontEmbedCSS: false,
    backgroundColor: '#ffffff',
  })

  const blobLogo = await toBlob(rootEl.querySelector(`.${LOGO_CLASS_NAME}`), {
    cacheBust: true,
    pixelRatio: 2,
    fontEmbedCSS: false,
    backgroundColor: '#ffffff80',
  })

  const blobProjection = await toBlob(rootEl.querySelector(`.${PROJECTION_CLASS_NAME}`), {
    cacheBust: true,
    pixelRatio: 2,
    fontEmbedCSS: false,
    backgroundColor: '#ffffff80',
  })

  const blobNorthArrow = await toBlob(rootEl.querySelector(`.${NORTH_ARROW_CLASS_NAME}`), {
    cacheBust: true,
    pixelRatio: 2,
    fontEmbedCSS: false,
    backgroundColor: 'transparent',
  })

  const scaleElement = map.getContainer()
    .querySelector('.maplibregl-ctrl-scale')

  const scaleWrapper = document.createElement('div')
  scaleWrapper.style.padding = '0px'
  scaleWrapper.style.backgroundColor = 'transparent'
  scaleWrapper.style.display = 'block'
  scaleWrapper.style.position = 'relative'
  scaleWrapper.style.overflow = 'visible'

  const scaleClone = scaleElement.cloneNode(true)
  scaleClone.style.overflow = 'visible'
  // Force the internal SVG/lines to not be clipped
  scaleClone.style.position = 'relative'
  scaleWrapper.appendChild(scaleClone)
  document.body.appendChild(scaleWrapper)

  // Wait a bit for render
  await new Promise((r) => setTimeout(r, 100))

  const blobScale = await toBlob(scaleWrapper, {
    cacheBust: true,
    pixelRatio: 2,
    fontEmbedCSS: false,
    backgroundColor: 'transparent',
  })

  document.body.removeChild(scaleWrapper)

  // Convert legend blob to image (only time we need to convert)
  const legendImg = await new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.src = URL.createObjectURL(blobLegend)
  })

  const descriptionImg = await new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.src = URL.createObjectURL(blobDescription)
  })

  const qrCodeImg = await new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.src = URL.createObjectURL(blobQRCode)
  })

  const logoImg = await new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.src = URL.createObjectURL(blobLogo)
  })

  const projectionImg = await new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.src = URL.createObjectURL(blobProjection)
  })

  const northArrowImg = await new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.src = URL.createObjectURL(blobNorthArrow)
  })

  const scaleImg = await new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.src = URL.createObjectURL(blobScale)
  })

  // Create combined canvas and draw directly
  const combinedCanvas = document.createElement('canvas')

  // Define margins (in pixels)
  const margin = 100

  // Set internal resolution with margins
  combinedCanvas.width = 3508
  combinedCanvas.height = 2480

  const ctx = combinedCanvas.getContext('2d')

  // Fill background white
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height)

  // Scale map to new canvas size maintaining aspect ratio
  // Map is 1296x615, canvas is 3508x2480
  const mapScaleX = (3508 - margin * 2) / 1296
  const mapWidth = 3508 - margin * 2
  const mapHeight = 615 * mapScaleX // ~1664px
  ctx.drawImage(mapCanvas, margin, margin, mapWidth, mapHeight)

  const scale = mapWidth / mapCanvas.width

  // Position legend in bottom section
  const bottomStartY = mapHeight + margin * 2
  const bottomHeight = 2480 - margin * 3 - mapHeight // ~816px
  const descriptionWidth =
    bottomHeight * (descriptionImg.width / descriptionImg.height) // 20% of canvas width
  const legendWidth = bottomHeight * (legendImg.width / legendImg.height)

  // Draw description on bottom left

  ctx.drawImage(
    descriptionImg,
    margin,
    bottomStartY,
    descriptionWidth,
    bottomHeight,
  )

  ctx.drawImage(
    legendImg,
    margin + descriptionWidth,
    bottomStartY,
    legendWidth,
    bottomHeight,
  )

  // Draw QRCode on bottom right
  const qrCodeSize = bottomHeight
  ctx.drawImage(
    qrCodeImg,
    combinedCanvas.width - margin - qrCodeSize,
    bottomStartY,
    qrCodeSize,
    qrCodeSize,
  )

  // Draw logo on bottom left of map
  const logoHeight = 200
  const logoPadding = 20
  ctx.drawImage(
    logoImg,
    margin + logoPadding,
    margin + mapHeight - logoHeight - logoPadding,
    logoHeight * (logoImg.width / logoImg.height),
    logoHeight,
  )

  // Draw projection on bottom left, below logo
  const projectionHeight = 120
  const projectionX = margin + logoPadding
  const projectionY =
    margin + mapHeight - logoHeight - projectionHeight - logoPadding * 2
  ctx.drawImage(
    projectionImg,
    projectionX,
    projectionY,
    projectionHeight * (projectionImg.width / projectionImg.height),
    projectionHeight,
  )

  // Draw scale on bottom left, below projection
  const scaleHeight = 60
  const scaleX = margin + logoPadding
  const scaleY = projectionY - scaleHeight - logoPadding
  const correctionFactorWidth = scale / 2 //2.59 // Scale up the scale control to make it more visible
  const correctionFactorHeight = scale / 2
  ctx.drawImage(
    scaleImg,
    scaleX,
    scaleY,
    scaleImg.width * correctionFactorWidth,
    scaleImg.height * correctionFactorHeight,
  )

  // Draw north arrow on bottom left, below scale
  const northArrowHeight = 100
  const northArrowX = margin + logoPadding
  const northArrowY = scaleY - northArrowHeight - logoPadding
  ctx.drawImage(
    northArrowImg,
    northArrowX,
    northArrowY,
    northArrowHeight * (northArrowImg.width / northArrowImg.height),
    northArrowHeight,
  )

  return new Promise((resolve) => {
    combinedCanvas.toBlob((blob) => {
      resolve(blob)
    })
  })
}
