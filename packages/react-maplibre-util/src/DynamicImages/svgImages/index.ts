import { strExpr } from '@orioro/util'
import { StyleImageMetadata } from 'maplibre-gl'

type IconPathToSvgOptions = {
  size?: number
  fill?: string
  stroke?: string
  strokeWidth?: string | number
  viewBox?: string
  style?: string
}

export function iconPathToSvg(
  path: string,
  {
    size = 24,
    fill = 'black',
    stroke,
    strokeWidth,
    viewBox = '0 0 24 24',
    style,
  }: IconPathToSvgOptions = {},
): string {
  if (path.startsWith('<svg')) {
    return path
  }

  const svgAttrs = [
    `xmlns="http://www.w3.org/2000/svg"`,
    `width="${size}"`,
    `height="${size}"`,
    `viewBox="${viewBox}"`,
    stroke ? `stroke="${stroke}"` : '',
    strokeWidth ? `stroke-width="${strokeWidth}"` : '',
  ]
    .filter(Boolean)
    .join(' ')

  const pathAttrs = [`fill="${fill}"`, style ? `style="${style}"` : '']
    .filter(Boolean)
    .join(' ')

  return `<svg ${svgAttrs}><path ${pathAttrs} d="${path}" /></svg>`
}
/**
 * Renders an SVG string onto a canvas and returns an object compatible with maplibre `addImage`.
 *
 * @param svgString - The SVG markup as a string
 * @param pixelRatio - (Optional) device pixel ratio, defaults to window.devicePixelRatio
 * @returns Promise resolving to { width, height, data, pixelRatio }
 */
export async function svgToMaplibreImage(
  svgString: string,
  pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio : 1,
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

export function svgIconId(
  iconId: string,
  options?: IconPathToSvgOptions,
): string {
  return options ? `${iconId}(${JSON.stringify(options)})` : iconId
}

type SvgIconGeneratorReturn<T extends Record<string, string>> = {
  (imageId: string): Promise<
    | [
        {
          width: number
          height: number
          data: Uint8ClampedArray
        },
        Partial<StyleImageMetadata>,
      ]
    | null
  >
} & {
  [K in keyof T]: (options?: IconPathToSvgOptions) => string
}

export function svgIconGenerator<T extends Record<string, string>>(
  iconPathsById: T,
): SvgIconGeneratorReturn<T> {
  const fns = Object.fromEntries(
    Object.entries(iconPathsById).map(([iconId, iconPath]) => [
      iconId,
      (options = {}) =>
        () =>
          iconPathToSvg(iconPath, options),
    ]),
  )

  const expr = strExpr({
    expressions: fns,
  })

  async function onGenerateSvgImage(imageId: string) {
    try {
      const imageExpr = expr.parse(imageId)

      const svg = expr.apply(imageExpr, undefined)

      return svgToMaplibreImage(svg)
    } catch (err) {
      // console.log(`will skip: ${imageId}`)
      return null
    }
  }

  Object.assign(
    onGenerateSvgImage,
    Object.fromEntries(
      Object.keys(iconPathsById).map((iconId) => [
        iconId,
        (options?: IconPathToSvgOptions) => svgIconId(iconId, options),
      ]),
    ),
  )

  return onGenerateSvgImage as SvgIconGeneratorReturn<T>
}
