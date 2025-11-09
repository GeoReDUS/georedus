import type { StyleImageMetadata } from 'maplibre-gl'

/**
 * Renders an SVG string onto a canvas and returns an object compatible with maplibre `addImage`.
 *
 * @param svgString - The SVG markup as a string
 * @param pixelRatio - (Optional) device pixel ratio, defaults to window.devicePixelRatio
 * @returns Promise resolving to { width, height, data, pixelRatio }
 */
export async function svgToMaplibreImage(
  svgString: string,
  inputPixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio : 1,
): Promise<
  [
    {
      width: number
      height: number
      data: Uint8ClampedArray
    },
    Partial<StyleImageMetadata>,
  ]
> {
  return new Promise((resolve, reject) => {
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(svgBlob)
    const img = new Image()
    img.onload = () => {
      // Normalize pixel ratio: integer and at least 1
      const pixelRatio = Math.max(1, Math.round(inputPixelRatio || 1))

      const width = img.width * pixelRatio
      const height = img.height * pixelRatio

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')!
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, width, height)
      URL.revokeObjectURL(url)
      resolve([
        {
          width,
          height,
          data: imageData.data,
        },
        {
          pixelRatio,
        },
      ])
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load SVG as image'))
    }
    img.src = url
  })
}
