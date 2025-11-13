import { resolve } from '@orioro/resolve'
import { get } from '@orioro/get'
export const BUILDINGS_MIN_ZOOM = 14
export const BUILDINGS_3D_MIN_ZOOM = 16

const BUILDINGS_SOURCE_ID = 'overture_br_buildings.geom'

export function buildings_sources({ GLOBAL_CONTEXT, PARSED_SCHEMA }) {
  const { VECTOR_TILE_SERVER_ENDPOINT, METADATA_API_ENDPOINT } = GLOBAL_CONTEXT

  return {
    [BUILDINGS_SOURCE_ID]: {
      type: 'vector',
      attribution: PARSED_SCHEMA.sourceLabel,
      minzoom: BUILDINGS_MIN_ZOOM,
      maxzoom: BUILDINGS_MIN_ZOOM,
      tiles: [
        resolve.fn((context) => {
          const variableId = get(context, 'view.conf.data.variableId')
          const variant = PARSED_SCHEMA.variantsByVariableId[variableId]

          return [
            '$vtxUrl',
            {
              tiles: `${VECTOR_TILE_SERVER_ENDPOINT}/${BUILDINGS_SOURCE_ID}/{z}/{x}/{y}`,
              data: [
                [
                  `setor_${PARSED_SCHEMA.year}_id:id`,
                  `${METADATA_API_ENDPOINT}/rpc/cem_censo_2022_data_tile?` +
                    `table_id=${variant.source_table_id}&` +
                    `variable_id=${variableId}&` +
                    `z={z}&x={x}&y={y}`,
                ],
              ],
            },
          ]
        }),
      ],
    },
  }
}

export function buildings_layers({ PARSED_SCHEMA }) {
  const _fillColorExp = [
    '$flat',
    [
      ['step', ['coalesce', ['get', 'value'], -1]],
      ['$get', 'view.metadata.colorScaleStops'],
    ],
  ]

  //
  // If indicator is about populacao-e-domicilios,
  // do not color paint buildings whose subtype
  // is known and is not residential.
  //
  // Otherwise, apply color to all buildings
  //
  const _fillColor = PARSED_SCHEMA.indicator_path?.startsWith(
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
        _fillColorExp,
      ]
    : _fillColorExp

  return {
    //
    // Buildings layer
    //
    [`${BUILDINGS_SOURCE_ID}_fill`]: {
      hidden: [
        '$not',
        ['$empty', ['$get', 'view.metadata.customGeoJSON.AREAS_GEOJSON']],
      ],
      interactive: false,
      source: BUILDINGS_SOURCE_ID,
      'source-layer': BUILDINGS_SOURCE_ID,
      type: 'fill',
      minzoom: BUILDINGS_MIN_ZOOM,
      paint: {
        'fill-color': _fillColor,
        'fill-opacity': 1,
      },
    },

    //
    // Buildings fill extrusion
    //
    [`${BUILDINGS_SOURCE_ID}_fill_extrusion`]: {
      hidden: [
        '$not',
        ['$empty', ['$get', 'view.metadata.customGeoJSON.AREAS_GEOJSON']],
      ],
      interactive: false,
      source: BUILDINGS_SOURCE_ID,
      'source-layer': BUILDINGS_SOURCE_ID,
      type: 'fill-extrusion',
      minzoom: BUILDINGS_MIN_ZOOM,
      paint: {
        'fill-extrusion-color': _fillColor,
        'fill-extrusion-opacity': 0.8,
        'fill-extrusion-height': [
          'step',
          ['zoom'],
          0,
          BUILDINGS_3D_MIN_ZOOM,
          ['coalesce', ['get', 'height'], 0],
        ],
      },
    },
  }
}
