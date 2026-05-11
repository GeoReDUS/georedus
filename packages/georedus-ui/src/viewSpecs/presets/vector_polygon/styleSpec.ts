import { string } from '@orioro/cast'
import type { CategoricalLegendProps } from '@orioro/react-chart-util'
import { SVG_PATTERNS } from '@orioro/react-maplibre-util'
import { COLOR_SCHEMES, resolveColor } from '../../util'
import { uniq } from 'lodash'

const SOLID = 'solid'
const DEFAULT_FILL_OPACITY = 0.5

type ItemStyleSpec = {
  color?: string
  fillPattern?:
    | 'circles_1'
    | 'cross_1'
    | 'diamonds_1'
    | 'lines_1'
    | 'mosaic_1'
    | 'mosaic_2'
    | 'squares_1'
    | 'triangles_1'
    | 'waves_1'
    | 'solid'
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
}

type VectorPolygonCategoricalSingle = {
  dataType: 'categorical_single'
} & ItemStyleSpec

type VectorPolygonCategoricalMultiple = {
  dataType: 'categorical_multiple'
  categoryKey: string
  colorScheme:
    | 'schemeGeoReDUSVectorPolygon'
    | 'schemeCategory10'
    | 'schemeAccent'
    | 'schemeDark2'
    | 'schemeObservable10'
    | 'schemePaired'
    | 'schemePastel1'
    | 'schemePastel2'
    | 'schemeSet1'
    | 'schemeSet2'
    | 'schemeSet3'
  categories?: (ItemStyleSpec & {
    value: string
    label?: string
  })[]
} & ItemStyleSpec

type VectorPolygonSequential = {
  dataType: 'sequential'
  fillPattern?:
    | 'circles_1'
    | 'cross_1'
    | 'diamonds_1'
    | 'lines_1'
    | 'mosaic_1'
    | 'mosaic_2'
    | 'squares_1'
    | 'triangles_1'
    | 'waves_1'
    | 'solid'
}

type StyleSpec =
  | VectorPolygonCategoricalSingle
  | VectorPolygonCategoricalMultiple
  | VectorPolygonSequential

type StyleSpecInput =
  | string
  | VectorPolygonCategoricalSingle
  | VectorPolygonCategoricalMultiple
  | VectorPolygonSequential

export function parseStyleSpec(styleInput: StyleSpecInput): StyleSpec {
  if (typeof styleInput === 'string') {
    return {
      dataType: 'categorical_single',
      color: resolveColor(styleInput),
    }
  } else {
    switch (styleInput.dataType) {
      case 'sequential': {
        return styleInput
      }
      case 'categorical_multiple': {
        return styleInput
      }
      case 'categorical_single':
      default: {
        return {
          ...styleInput,
          color: resolveColor(styleInput.color),
          dataType: 'categorical_single',
        }
      }
    }
  }
}

export function styleSpecMetadata(styleSpec: StyleSpec) {}

// type CategoricalParseStyleResult = {
//   legend: { type: 'CategoricalLegend' } & CategoricalLegendProps
//   main_fill: {
//     'fill-color': string
//     'fill-opacity'?: number
//     'fill-pattern'?: string
//   }
//   main_line: {
//     'line-color': string
//     'line-dasharray'?: number[]
//   }
// }

// type SequentialParseStyleResult = {
//   legend: { type: 'SequentialLegend' } & any
//   main_fill: any
//   main_line: any
// }

// type ParseStyleResult = CategoricalParseStyleResult | SequentialParseStyleResult

// function svgBgImage(svg: string) {
//   return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
// }

// function categoricalLegendItem(
//   cat: ItemStyleSpec & {
//     value: string
//     label?: string
//   },
// ): CategoricalLegendProps['items'][number] {
//   const resolvedColor = cat.color ? resolveColor(cat.color) : 'black'

//   return {
//     label: cat.label || cat.value,
//     color: resolvedColor,
//     box: {
//       style: {
//         borderStyle: cat.borderStyle,
//         ...(cat.fillPattern && cat.fillPattern !== SOLID
//           ? {
//               backgroundColor: 'transparent',
//               backgroundImage:
//                 typeof SVG_PATTERNS[cat.fillPattern] === 'function'
//                   ? svgBgImage(
//                       SVG_PATTERNS[cat.fillPattern]({
//                         stroke: resolvedColor,
//                         scale: '0.25',
//                       }),
//                     )
//                   : '',
//             }
//           : {}),
//       },
//     },
//   }
// }

// // function parseCategoryKeyToLegendItems(
// //   categoryKey: string,
// //   style: VectorPolygonCategorical,
// // ): CategoricalLegendProps['items'] {
// //   // get de todos os valore únicos da categoryKey e criar um item de legenda para cada um, usando as propriedades de style como base
// //   // parsear cores de colorScheme aqui
// // }

// function categoricalParseStyle(
//   style: VectorPolygonCategorical,
//   title: string,
// ): CategoricalParseStyleResult {
//   const _resolvedColor = style.color
//     ? resolveColor(style.color)
//     : 'categoryKey' in style && style.categories
//       ? [
//           'match',
//           ['get', style.categoryKey],
//           ...style.categories.flatMap((cat) => [
//             cat.value,
//             cat.color ? resolveColor(cat.color) : 'black',
//           ]),
//           'black',
//         ]
//       : 'black'

//   const legendItems =
//     'categoryKey' in style && style.categories
//       ? style.categories.map((cat) => ({
//           ...categoricalLegendItem(cat),
//         }))
//       : // : 'categoryKey' in style && !style.categories
//         // ? parseCategoryKeyToLegendItems(style.categoryKey, style)
//         [
//           {
//             ...categoricalLegendItem({
//               value: title,
//               color: _resolvedColor,
//               fillPattern: style.fillPattern,
//               borderStyle: style.borderStyle,
//             }),
//           },
//         ]

//   // const fillItems = 'categoryKey' in style && style.categories
//   //   ?
//   //   :

//   return {
//     legend: {
//       type: 'CategoricalLegend',
//       items: legendItems,
//     },
//     main_fill: {
//       'fill-color': _resolvedColor,
//       'fill-opacity': DEFAULT_FILL_OPACITY,
//       ...(style.fillPattern && style.fillPattern !== SOLID
//         ? {
//             'fill-pattern': `${style.fillPattern}({ stroke: "${_resolvedColor}", scale: 0.5 })`,
//           }
//         : null),
//     },
//     main_line: {
//       'line-color': _resolvedColor,
//       ...(style.borderStyle === 'dashed' ? { 'line-dasharray': [2, 2] } : {}),
//     },
//   }
// }

// function sequentialParseStyle(
//   style: VectorPolygonSequential,
//   title: string,
// ): SequentialParseStyleResult {
//   return {
//     legend: {
//       type: 'SequentialLegend',
//     },
//     main_fill: 'any,',
//     main_line: 'any',
//   }
// }

// export function parseStyle(
//   styleInput: StyleSpecInput,
//   title: string,
// ): ParseStyleResult {
//   console.log('parseStyle', { styleInput, title })
//   const style =
//     typeof styleInput === 'string'
//       ? {
//           dataType: 'categorical' as const,
//           color: styleInput,
//         }
//       : styleInput

//   switch (style.dataType) {
//     case 'sequential': {
//       return sequentialParseStyle(style, title)
//     }
//     case 'categorical':
//     default: {
//       return categoricalParseStyle(style, title)
//     }
//   }
// }

/*

color
schemePaired.0

"schemePaired.0" -> {
  "color": "schemePaired.0"
}

{
  "color": "schemePaired.0",
  "fillPattern": "mosaic_1",
  "borderStyle": "dashed"
}

{
  "fillPattern": "mosaic_1",
  "borderStyle": "dashed",
  "categoryKey": "zoneamento",
  "colorScheme": "schemePaired"
}

{
  "fillPattern": "mosaic_1",
  "borderStyle": "dashed",
  "categoryKey": "zoneamento",
  "colorScheme": "schemePaired",

  "categories": [
    {
      "value": "zona_residencial",
      "label": "Zona residencial",
      "fillPattern": "mosaic_1"
    },
    {
      "value": "zona_residencial",
      "fillPattern": "mosaic_1"
    }
  ]
}

{
  // "dataType": "categorical",
  // "categoryKey": "zoneamento",
  "color": "schemePaired",
  // "fillPattern": "mosaic_1",
  // "borderStyle": "solid"
}
 */

/**
```
{
  "dataType": "categorical",
  "categoryKey": "zoneamento",
  "color": "schemePaired.0",
  "fillPattern": "mosaic_1",
  "borderStyle": "solid",

}
```
 * {
 *   "dataType": "categorical",
 *   "categoryKey": "zoneamento",
 *   "color": "schemePaired.0",
 *   "fillPattern": "mosaic_1",
 *   "borderStyle": "solid",
 *
 *   "categories": {
 *     "zona_residencial": {
 *       "color": "schemePaired.0",
 *       "fillPattern": "mosaic_1",
 *       "borderStyle": "solid"
 *     },
 *     "zona_residencial": {
 *       "color": "schemePaired.1",
 *       "fillPattern": "mosaic_2",
 *       "borderStyle": "solid"
 *     }
 *   }
 * }
 * ```
 *
 *
 * ```
 * {
 *   "dataType": "categorical",
 *   "categoryKey": "zoneamento",
 *   "categories": {
 *     "zona_residencial": {
 *       "color": "schemePaired.0",
 *       "fillPattern": "mosaic_1",
 *       "borderStyle": "solid"
 *     },
 *     "zona_residencial": {
 *       "color": "schemePaired.1",
 *       "fillPattern": "mosaic_2",
 *       "borderStyle": "solid"
 *     }
 *   }
 * }
 * ```
 */
