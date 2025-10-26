import { fileReadAs } from '@orioro/react-ui-core'
import { GeoReDUSWorker } from '../../../../GeoReDUSWorker'
import { resolve, resolveAsync } from '@orioro/resolve'
import { pick } from 'lodash'
import { buffer } from '@turf/turf'

//
// TODO: deprecate in favor of applying buffers
// inside worker
//
function _applyBuffers(geometry, { bufferSize = DEFAULT_BUFFER_SIZE } = {}) {
  switch (geometry?.type) {
    case 'Point': {
      return buffer(geometry, bufferSize || DEFAULT_BUFFER_SIZE, {
        units: 'meters',
      }).geometry
    }
    case 'LineString': {
      return buffer(geometry, bufferSize || DEFAULT_BUFFER_SIZE, {
        units: 'meters',
      }).geometry
    }
    default: {
      return geometry
    }
  }
}

const UNBOUNDED_BOUNDS = [-180, -90, 180, 90]

export const _resolveSourceBounds = resolve.fn((context) => {
  try {
    const coordinates = context.view.metadata.municipioData?.bbox?.coordinates

    if (!coordinates) {
      return UNBOUNDED_BOUNDS
    }

    const [west, south] = coordinates[0][0] // first point: lower-left (southwest)
    const [east, north] = coordinates[0][2] // third point: upper-right (northeast)

    return [west, south, east, north] // [minX, minY, maxX, maxY]
  } catch (err) {
    console.warn(`error while retrieving bounds`, err)
    return UNBOUNDED_BOUNDS
  }
})

export function metadata(
  viewSpec,
  allViewSpecs,
  context,
  { PARSED_SCHEMA, DATA_UTIL, CHART_UTIL },
) {
  const { METADATA_API_ENDPOINT } = context

  return {
    _value: [
      '$let',
      {
        customGeoJSON: [
          '$if',
          ['$empty', ['$get', 'view.conf.data.customSpatialAggregationUnit']],
          null,
          resolveAsync.fn(async (context) => {
            try {
              const contents = await fileReadAs(
                context.view.conf.data.customSpatialAggregationUnit,
                'text',
              )

              const BASE = JSON.parse(contents)

              //
              // Generate a layer with points only
              //
              const POINTS = {
                ...BASE,
                features: BASE.features.filter(
                  (feat) => feat.geometry?.type === 'Point',
                ),
              }

              const LINE_STRINGS = {
                ...BASE,
                features: BASE.features.filter(
                  (feat) => feat.geometry?.type === 'LineString',
                ),
              }

              //
              // Layer with areas
              //
              const AREAS_FEATURES =
                context.view.conf.data.pointsDisplayMode === 'heatmap'
                  ? //
                    // If points are set to be displayed as heatmap,
                    // remove them from area calculation
                    //
                    BASE.features.filter(
                      (feat) => feat.geometry?.type !== 'Point',
                    )
                  : BASE.features

              const AREAS_BASE = {
                ...BASE,
                features: AREAS_FEATURES.map((feat) => {
                  return {
                    ...feat,
                    geometry: _applyBuffers(
                      feat.geometry,
                      pick(context.view.conf.data, ['bufferSize']),
                    ),
                  }
                }),
              }

              const AREAS =
                context.view.conf.data.pointsDisplayMode === 'heatmap'
                  ? null
                  : context.view.conf.data.dissolveOverlappingGeometries &&
                      AREAS_BASE
                    ? await GeoReDUSWorker.dissolveAreasPreservingIsolated(
                        AREAS_BASE,
                      )
                    : AREAS_BASE

              return {
                BASE,
                POINTS,
                LINE_STRINGS,
                AREAS,
              }
            } catch (err) {
              console.error(err)

              return null
            }
          }),
        ],
      },
      [
        '$let',
        {
          variableValues: [
            '$if',
            ['$empty', ['$get', 'customGeoJSON.AREAS']],
            [
              '$get',
              ['$template', '[].${0}', ['$get', 'view.conf.data.variableId']],
              ['$fetch', DATA_UTIL._resolveDataUrl],
            ],
            [
              '$fetch',
              {
                href: METADATA_API_ENDPOINT,
                pathname: 'rpc/aggregate_by_geojson',
              },
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: {
                  geometries: [
                    '$get',
                    'features[].geometry',
                    ['$get', 'customGeoJSON.AREAS'],
                  ],
                  view: `ibge_malha_br_setor_censitario_${PARSED_SCHEMA.year}_spatial_agg`,
                  agg_column: ['$get', 'view.conf.data.variableId'],
                  agg_type: [
                    '$if',
                    [
                      '$endsWith',
                      ['$get', 'view.conf.data.variableId'],
                      '_pct',
                    ],
                    'weighted_avg',
                    'sum',
                  ],
                },
              },
            ],
          ],
          municipioData: [
            '$get',
            '0',
            [
              '$fetch',
              resolve.fn(
                (context) =>
                  `${METADATA_API_ENDPOINT}/ibge_malha_br_municipio?select=bbox&id=eq.${context.app.municipioId}`,
              ),
            ],
          ],
        },
        {
          labels: PARSED_SCHEMA.labels,
          measureUnits: PARSED_SCHEMA.measureUnits,
          variableValues: ['$get', 'variableValues'],
          municipioData: ['$get', 'municipioData'],
          customGeoJSON: ['$get', 'customGeoJSON'],
          colorScaleStops: [
            '$naturalBreaks',
            ['$get', 'variableValues'],
            {
              ...CHART_UTIL._color_scheme,
              minK: 5,
            },
          ],
        },
      ],
    ],
  }
}
