import { resolve } from '@orioro/resolve'
import { get } from '@orioro/get'
import { _resolveSourceBounds } from '../metadata'

import { BUILDINGS_MIN_ZOOM } from '../buildings'
import { $urlSearch } from '../../../../resolveView/customExpr'

export function setor_censitario(
  viewSpec,
  allViewSpecs,
  context,
  { PARSED_SCHEMA, DATA_UTIL, CHART_UTIL },
) {
  const { collection_id } = viewSpec

  const VECTOR_SOURCE_ID = `${collection_id}.geom`

  const { VECTOR_TILE_SERVER_ENDPOINT } = context

  //
  // Fill color expression for data loaded from
  // vector source
  //
  const _vectorSourceFillColor = [
    '$flat',
    [
      [
        'step',
        ['coalesce', ['get', ['$get', 'view.conf.data.variableId']], -1],
      ],
      ['$get', 'view.metadata.colorScaleStops'],
    ],
  ]

  const sources = {
    [VECTOR_SOURCE_ID]: {
      type: 'vector',
      attribution: PARSED_SCHEMA.sourceLabel,
      minzoom: 8,
      //
      // Prevent system from fetching data beyond necessary detail
      //
      maxzoom: BUILDINGS_MIN_ZOOM,
      promoteId: 'cd_setor',
      bounds: _resolveSourceBounds,
      tiles: [
        resolve.fn((context) => {
          const _variableId = get(context, 'view.conf.data.variableId')
          const _variant = PARSED_SCHEMA.variantsByVariableId[_variableId]

          return [
            '$vtxUrl',
            {
              tiles: `${VECTOR_TILE_SERVER_ENDPOINT}/dvt/{z}/{x}/{y}?${$urlSearch(
                [
                  {
                    view: _variant.collection_id,
                    select: ['cd_setor'],
                    where: {
                      cd_mun: [context.app.municipioId],
                    },
                  },
                ],
              )}`,
              data: [['cd_setor', DATA_UTIL._resolveDataUrl]],
            },
          ]
        }),
      ],
    },
  }

  const layers = {
    //
    // Polygon fill from the vector source layer
    // (setor censitario)
    //
    [`${VECTOR_SOURCE_ID}_fill`]: {
      hidden: [
        '$not',
        ['$empty', ['$get', 'view.metadata.customGeoJSON.AREAS']],
      ],
      interactive: true,
      legends: CHART_UTIL._legends,

      tooltip: {
        title: null,
        entries: [CHART_UTIL._variableValueTooltipEntry],
      },
      source: VECTOR_SOURCE_ID,
      'source-layer': 'dvt',
      type: 'fill',
      // maxzoom: 14,
      paint: {
        'fill-color': _vectorSourceFillColor,
        'fill-opacity': [
          'step',
          ['zoom'],
          //
          // At lower zooms, opacities should be high
          //
          [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1,
            ['$get', 'view.conf.style.layerOpacity'],
          ],
          BUILDINGS_MIN_ZOOM,
          //
          // At higher zooms, opacity should be low,
          // so that buildings show up
          //
          ['case', ['boolean', ['feature-state', 'hover'], false], 0.2, 0.1],
        ],
        'fill-outline-color': 'transparent',
      },
    },

    //
    // Boundary lines from the vector source layer
    // (setor censitario)
    //
    [`${VECTOR_SOURCE_ID}_boundary_lines`]: {
      hidden: [
        '$not',
        ['$empty', ['$get', 'view.metadata.customGeoJSON.AREAS']],
      ],
      source: VECTOR_SOURCE_ID,
      'source-layer': 'dvt',
      type: 'line',
      interactive: true,
      // minzoom: BUILDINGS_MIN_ZOOM,
      paint: {
        // 'line-color': _vectorSourceFillColor,
        'line-color': CHART_UTIL._color_scheme.scalesByK[3][2],
        'line-width': [
          'step',
          ['zoom'],
          // default: zoom < 14 → thin lines
          ['case', ['boolean', ['feature-state', 'hover'], false], 2, 0],
          BUILDINGS_MIN_ZOOM,
          // zoom ≥ 14 → larger lines
          ['case', ['boolean', ['feature-state', 'hover'], false], 4, 0],
        ],
        'line-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          1,
          ['$get', 'view.conf.style.layerOpacity'],
        ],
      },
    },
  }

  return {
    sources,
    layers,
  }
}
