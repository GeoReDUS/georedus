import { mdiCloseCircleOutline } from '@mdi/js'
import { interpolate, strExpr } from '@orioro/util'
import { iconPathToSvg, type IconPathToSvgOptions } from './iconPathToSvg'
import { svgToMaplibreImage } from './svgToMaplibreImage'
import type { StyleImageMetadata } from 'maplibre-gl'

export function svgIconId(
  iconId: string,
  options?: IconPathToSvgOptions,
): string {
  return options ? `${iconId}(${JSON.stringify(options)})` : iconId
}

type SvgIconSpecsById = Record<
  string,
  string | ((options: Record<string, any>) => string)
>

type SvgIconGeneratorReturn<T extends SvgIconSpecsById> = {
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

const ERROR_ICON_EXPR =
  (options = {}) =>
  () =>
    iconPathToSvg(mdiCloseCircleOutline, {
      fill: 'red',
      ...options,
    })

export function svgIconGenerator<T extends SvgIconSpecsById>(
  svgIconSpecsById: T,
): SvgIconGeneratorReturn<T> {
  const fns = Object.fromEntries(
    Object.entries(svgIconSpecsById).map(([iconId, iconSpec]) => {
      if (typeof iconSpec === 'string' && iconSpec.startsWith('<svg')) {
        //
        // Full svg
        //
        return [
          iconId,
          (options = {}) =>
            () =>
              interpolate(iconSpec, options),
        ]
      } else if (typeof iconSpec === 'string') {
        //
        // Its a string, assume it is an svg path
        //
        return [
          iconId,
          (options = {}) =>
            () =>
              iconPathToSvg(iconSpec, options),
        ]
      } else if (typeof iconSpec === 'function') {
        //
        // Function that returns custom svg
        //
        return [
          iconId,
          (options = {}) =>
            () =>
              iconSpec(options),
        ]
      } else {
        console.warn(`Invalid icon spec for ${iconId}, will ignore`, iconSpec)
        return [iconId, ERROR_ICON_EXPR]
      }
    }),
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

  //
  // Expose generator fns
  //
  Object.assign(
    onGenerateSvgImage,
    Object.fromEntries(
      Object.keys(svgIconSpecsById).map((iconId) => [
        iconId,
        (options?: IconPathToSvgOptions) => svgIconId(iconId, options),
      ]),
    ),
  )

  return onGenerateSvgImage as SvgIconGeneratorReturn<T>
}
