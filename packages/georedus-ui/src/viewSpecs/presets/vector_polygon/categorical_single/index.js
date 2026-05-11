import { confSchema } from './confSchema'
import { metadata } from './metadata'
import { layers } from './layers'

export function categorical_single(viewSpec, allViewSpecs, context) {
  const {
    label,
    // color,
    // line = {},
    // fill = {},
    sources = {},
    tiles,
    source_layer,
    // fill_pattern,
    parse_style,
    ...props
  } = viewSpec

  // if (!source_layer) {
  //   throw new Error('source_layer must be defined')
  // }

  return {
    ...props,
    // label,
    confSchema: confSchema(viewSpec, allViewSpecs, context),
    metadata: metadata(viewSpec, allViewSpecs, context),
    // sources: {
    //   main: {
    //     promoteId: 'id',
    //     type: 'vector',
    //     tiles: _parseTiles(tiles, context),
    //   },
    //   ...sources,
    // },
    layers: layers(viewSpec, allViewSpecs, context),
  }
}

// //
// //
// //
// //
// //
// import { interpolate } from '@orioro/util'
// import _ from 'lodash'
// import { confSchema } from './spec/confSchema'
// import { layers, metadata } from './spec'
// import { parseStyleSpec } from './parseStyleSpec'

// function _parseTiles(tiles, context) {
//   tiles = Array.isArray(tiles)
//     ? tiles
//     : typeof tiles === 'string'
//       ? [tiles]
//       : null

//   if (!tiles) {
//     throw new Error(`tiles is required`)
//   }

//   return tiles.map((tileSrcUrl) => interpolate(tileSrcUrl, context))
// }
// function svgBgImage(svg) {
//   return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
// }

// export function vector_polygon(viewSpec, allViewSpecs, context) {
//   const {
//     label,
//     // color,
//     // line = {},
//     // fill = {},
//     sources = {},
//     tiles,
//     source_layer,
//     // fill_pattern,
//     parse_style,
//     ...props
//   } = viewSpec

//   if (!source_layer) {
//     throw new Error('source_layer must be defined')
//   }

//   const styleSpec = parseStyleSpec(viewSpec.styleSpec)

//   switch (styleSpec.dataType) {
//   }

//   return {
//     ...props,
//     label,
//     confSchema: confSchema(viewSpec, allViewSpecs, context),
//     metadata: metadata(viewSpec, allViewSpecs, context),
//     sources: {
//       main: {
//         promoteId: 'id',
//         type: 'vector',
//         tiles: _parseTiles(tiles, context),
//       },
//       ...sources,
//     },
//     layers: layers(viewSpec, allViewSpecs, context),
//   }
// }
