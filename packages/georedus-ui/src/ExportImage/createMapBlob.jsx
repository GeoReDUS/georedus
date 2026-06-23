import { toBlob } from 'html-to-image'
import { getPaperDimensions } from './paperDimensions'

import { PAPER_WIDTH_PX } from './constants.js'
const { PIXELRATIO } = getPaperDimensions(PAPER_WIDTH_PX)

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

// function createAttributionWrapper(map) {
//   const attributionElement = map
//     .getContainer()
//     .querySelector('.maplibregl-ctrl-attrib')

//   if (!attributionElement) return null

//   // Force expand if in compact mode
//   attributionElement.classList.add('maplibregl-compact-show')

//   const attributionWrapper = document.createElement('div')
//   attributionWrapper.style.padding = '0px'
//   attributionWrapper.style.backgroundColor = 'transparent'
//   attributionWrapper.style.display = 'inline-block'
//   attributionWrapper.style.position = 'relative'

//   const attributionClone = attributionElement.cloneNode(true)
//   attributionWrapper.appendChild(attributionClone)
//   document.body.appendChild(attributionWrapper)

//   return attributionWrapper
// }

// Extract all DOM elements to blobs FIRST (while DOM is visible)
export async function extractMapImageBlobs({ map, rootEl, onlyMap = false }) {
  const blobDescription = await createBlob(IMAGE_DESCRIPTION_CLASS_NAME, rootEl, onlyMap ? "transparent" : null)
  const blobQRCode = !onlyMap ? await createBlob(QR_CODE_CLASS_NAME, rootEl) : null
  const blobLegend = await createBlob(LEGEND_CLASS_NAME, rootEl)
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

  // const attributionWrapper = createAttributionWrapper(map)
  // const blobAttribution = attributionWrapper
  //   ? await toBlob(attributionWrapper, {
  //       cacheBust: true,
  //       pixelRatio: PIXELRATIO,
  //       fontEmbedCSS: false,
  //       backgroundColor: 'transparent',
  //     })
  //   : null
  // if (attributionWrapper) document.body.removeChild(attributionWrapper)

  return {
    mapCanvas: map.getCanvas(),
    blobLegend,
    blobDescription,
    blobQRCode,
    blobLogo,
    blobProjection,
    blobNorthArrow,
    blobScale,
    // blobAttribution,
  }
}
