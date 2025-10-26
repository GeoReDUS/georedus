import { resolve } from '@orioro/resolve'
import { $urlSearch } from '../../../../resolveView/customExpr'
import { _resolveSourceBounds } from '../metadata'

export const BUILDINGS_MIN_ZOOM = 14
export const BUILDINGS_3D_MIN_ZOOM = 16

export function buildings(
  viewSpec,
  allViewSpecs,
  context,
  { CHART_UTIL, DATA_UTIL, PARSED_SCHEMA },
) {
  const { collection_id, indicator_path } = viewSpec
  const { VECTOR_TILE_SERVER_ENDPOINT } = context
  const VECTOR_SOURCE_ID = `${collection_id}.geom`

  const sources = {
    [`${VECTOR_SOURCE_ID}_buildings`]: {
      type: 'vector',
      attribution: PARSED_SCHEMA.sourceLabel,
      minzoom: BUILDINGS_MIN_ZOOM,
      maxzoom: BUILDINGS_MIN_ZOOM,
      bounds: _resolveSourceBounds,
      // Zoom levels make no real difference, buildings
      // are pretty square
      // maxzoom: 20,
      tiles: [
        resolve.fn((context) => {
          return [
            '$vtxUrl',
            {
              tiles: `${VECTOR_TILE_SERVER_ENDPOINT}/dvt/{z}/{x}/{y}?${$urlSearch(
                [
                  {
                    view: 'overture_br_buildings',
                    select: [`setor_${PARSED_SCHEMA.year}_id`],
                    where: {
                      [`municipio_id`]: [context.app.municipioId],
                    },
                  },
                ],
              )}`,
              data: [
                [
                  `setor_${PARSED_SCHEMA.year}_id:cd_setor`,
                  DATA_UTIL._resolveDataUrl,
                ],
              ],
            },
          ]
        }),
      ],
    },
  }

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

  const layers = {
    //
    // Buildings layer
    //
    [`${VECTOR_SOURCE_ID}_buildings_fill`]: {
      hidden: [
        '$not',
        ['$empty', ['$get', 'view.metadata.customGeoJSON.AREAS']],
      ],
      interactive: false,
      source: `${VECTOR_SOURCE_ID}_buildings`,
      'source-layer': 'dvt',
      type: 'fill',
      minzoom: BUILDINGS_MIN_ZOOM,
      paint: {
        //
        // If indicator is about populacao-e-domicilios,
        // do not color paint buildings whose subtype
        // is known and is not residential.
        //
        // Otherwise, apply color to all buildings
        //
        'fill-color': indicator_path?.startsWith('População e domicílios')
          ? [
              'case',
              [
                'in',
                ['get', 'subtype'],
                [
                  'literal',
                  [
                    'agricultural',
                    'civic',
                    'commercial',
                    'education',
                    'entertainment',
                    'industrial',
                    'medical',
                    'military',
                    'outbuilding',
                    'religious',
                    // 'residential',
                    'service',
                    'transportation',
                  ],
                ],
              ],
              '#EFEFEF',
              _vectorSourceFillColor,
            ]
          : _vectorSourceFillColor,
        'fill-opacity': 1,
      },
    },
    [`${VECTOR_SOURCE_ID}_buildings_fill_extrusion`]: {
      hidden: [
        '$not',
        ['$empty', ['$get', 'view.metadata.customGeoJSON.AREAS']],
      ],
      interactive: false,
      // tooltip: {
      //   title: ['$literal', ['$get', 'feature.properties.primary_name']],
      //   entries: [],
      //   // entries: [
      //   //   _variableValueTooltipEntry,
      //   //   // ['subtype', ['$literal', ['$get', 'feature.properties.subtype']]],
      //   // ],
      // },
      source: `${VECTOR_SOURCE_ID}_buildings`,
      'source-layer': 'dvt',
      type: 'fill-extrusion',
      minzoom: BUILDINGS_MIN_ZOOM,
      paint: {
        //
        // If indicator is about populacao-e-domicilios,
        // do not color paint buildings whose subtype
        // is known and is not residential.
        //
        // Otherwise, apply color to all buildings
        //
        'fill-extrusion-color': indicator_path?.startsWith(
          'População e domicílios',
        )
          ? [
              'case',
              [
                'in',
                ['get', 'subtype'],
                [
                  'literal',
                  [
                    'agricultural',
                    'civic',
                    'commercial',
                    'education',
                    'entertainment',
                    'industrial',
                    'medical',
                    'military',
                    'outbuilding',
                    'religious',
                    // 'residential',
                    'service',
                    'transportation',
                  ],
                ],
              ],
              '#EFEFEF',
              _vectorSourceFillColor,
            ]
          : _vectorSourceFillColor,
        'fill-extrusion-opacity': 0.8,
        // 'fill-extrusion-opacity': ['$get', 'view.conf.style.layerOpacity'],
        // 'fill-extrusion-outline-color': 'transparent',
        'fill-extrusion-height': [
          'step',
          ['zoom'],
          0,
          BUILDINGS_3D_MIN_ZOOM,
          ['coalesce', ['get', 'height'], 0],
        ],
        // ['get', 'height'], // Adjust as needed
      },
    },
  }

  return {
    sources,
    layers,
  }
}
