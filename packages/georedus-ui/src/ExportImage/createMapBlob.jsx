import { toBlob } from 'html-to-image'
import { getPaperDimensions } from './paperDimensions'

const { PIXELRATIO } = getPaperDimensions(3508)

export const LEGEND_CLASS_NAME = 'LegendContainer'
export const IMAGE_DESCRIPTION_CLASS_NAME = 'ImageDescription'
export const QR_CODE_CLASS_NAME = 'QrCode'
export const LOGO_CLASS_NAME = 'Logo'
export const PROJECTION_CLASS_NAME = 'Projection'
export const NORTH_ARROW_CLASS_NAME = 'NorthArrow'
export const SCALE_CONTROL_CLASS_NAME = 'ScaleControl'

async function createBlob(className, rootEl, backgroundColor = '#ffffff') {
  return toBlob(rootEl.querySelector(`.${className}`), {
    cacheBust: true,
    pixelRatio: PIXELRATIO,
    fontEmbedCSS: false,
    backgroundColor,
  })
}

function createScaleWrapper(map) {
  const scaleElement = map
    .getContainer()
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

  return scaleWrapper
}

// Extract all DOM elements to blobs FIRST (while DOM is visible)
export async function extractMapImageBlobs({ map, rootEl }) {
  const blobLegend = await createBlob(LEGEND_CLASS_NAME, rootEl)
  const blobDescription = await createBlob(IMAGE_DESCRIPTION_CLASS_NAME, rootEl)
  const blobQRCode = await createBlob(QR_CODE_CLASS_NAME, rootEl)
  const blobLogo = await createBlob(LOGO_CLASS_NAME, rootEl, 'transparent')
  const blobProjection = await createBlob(
    PROJECTION_CLASS_NAME,
    rootEl,
    'transparent',
  )
  const blobNorthArrow = await createBlob(
    NORTH_ARROW_CLASS_NAME,
    rootEl,
    'transparent',
  )

  const scaleWrapper = createScaleWrapper(map)
  const blobScale = await toBlob(scaleWrapper, {
    cacheBust: true,
    pixelRatio: PIXELRATIO,
    fontEmbedCSS: false,
    backgroundColor: 'transparent',
  })
  document.body.removeChild(scaleWrapper)

  return {
    mapCanvas: map.getCanvas(),
    blobLegend,
    blobDescription,
    blobQRCode,
    blobLogo,
    blobProjection,
    blobNorthArrow,
    blobScale,
  }
}
