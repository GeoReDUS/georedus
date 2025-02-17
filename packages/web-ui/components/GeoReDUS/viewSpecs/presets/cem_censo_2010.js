import { uniqBy } from 'lodash'
import { METADATA_API_ENDPOINT } from '../constants'
import { globalResources, tableVectorSource } from '../util'
import { schemeRdYlBu, schemePuOr, schemeRdPu } from 'd3-scale-chromatic'

const TABLE_ID = 'cem_censo_2010'
const VECTOR_SOURCE_ID = `${TABLE_ID}.geom`

function safeScheme(scheme) {
  //
  // d3 schemes use sparse arrays (new Array(3)) to
  // keep initial schemes empty:
  //
  // https://github.com/d3/d3-scale-chromatic/blob/main/src/diverging/RdYlBu.js
  //
  // This causes some issues for us, thus we convert
  // those sparse arrays into same structure but filled ones
  //
  return Array.from(scheme, (d) => d || null)
}

export function cem_censo_2010(viewSpec, allViewSpecs) {
  const {
    indicator_path,
    indicator_id,
    indicator_label,
    variable_id,
    number_format,
    is_default_variant,
    variant_label,
    measure_unit,
    variable_id_pct,
    variant_path,
    description,
    preset,
  } = viewSpec

  const globalRes = globalResources()

  const viewId = `${TABLE_ID}.${variable_id}`

  const NUMBER_FMT = ['pt-BR', { style: 'percent' }]

  const pathParts = (indicator_path || '').split(/\s*\/\s*/g)

  if (variable_id !== indicator_id) {
    return null
  }

  const variants = uniqBy(
    allViewSpecs.filter(
      (otherViewSpec) => otherViewSpec.indicator_id === indicator_id,
    ),
    (viewSpec) => viewSpec.variable_id,
  )

  const labels = Object.fromEntries(
    variants.map((variant) => [variant.variable_id, variant.variant_label]),
  )
  const measureUnits = Object.fromEntries(
    variants.map((variant) => [variant.variable_id, variant.measure_unit]),
  )

  return {
    id: viewId,
    path: [pathParts[0], '2010', ...pathParts.slice(1)].join(' / '),
    label: indicator_label,
    conf: {
      data: {
        variableId: {
          type: 'treeSelect',
          options: variants.map((variant) => ({
            path: variant.variant_path,
            label: variant.variant_label,
            value: variant.variable_id,
          })),
          placeholder: 'Selecione uma variante',
          clearable: false,
          defaultValue: variable_id,
        },
      },
      style: {
        layerOpacity: {
          type: 'slider',
          label: 'Opacidade da camada',
          size: '1',
          min: 0,
          max: 1,
          step: 0.01,
          defaultValue: 0.6,
        },
      },
    },

    metadata: [
      '$let',
      {
        variableValues: [
          '$get',
          ['$template', '[].${0}', ['$get', 'view.conf.data.variableId']],
          [
            '$fetch',
            [
              '$template',
              `${METADATA_API_ENDPOINT}/${TABLE_ID}?select=` +
                '${variableId}' +
                '&cod_municipio=eq.' +
                '${municipioId}',
              {
                variableId: ['$get', 'view.conf.data.variableId'],
                municipioId: ['$context', 'municipioId'],
              },
            ],
            {
              cache: 'force-cache',
            },
          ],
        ],
      },
      {
        labels,
        measureUnits,
        variableValues: ['$get', 'variableValues'],
        colorScaleStops: [
          '$naturalBreaks',
          ['$get', 'variableValues'],
          {
            scalesByK: safeScheme(schemeRdPu),
            minK: 5,
          },
        ],
      },
    ],

    sources: {
      ...globalRes.sources,
      [VECTOR_SOURCE_ID]: tableVectorSource(TABLE_ID, {
        minzoom: 8,
        maxzoom: 20,
      }),
    },
    layers: {
      ...globalRes.layers,
      [`${VECTOR_SOURCE_ID}_fill`]: {
        interactive: true,

        legends: [
          {
            type: 'SequentialColorLegend',
            title: [
              '$join',
              [
                indicator_label,
                [
                  '$get',
                  ['$get', 'view.conf.data.variableId'],
                  ['$get', 'view.metadata.labels'],
                ],
              ],
              ' | ',
            ],
            unit: [
              '$get',
              ['$get', 'view.conf.data.variableId'],
              ['$get', 'view.metadata.measureUnits'],
            ],
            format: {
              number: NUMBER_FMT,
            },
            steps: ['$get', 'view.metadata.colorScaleStops'],
          },
        ],

        tooltip: {
          title: [
            '$literal',
            [
              '$template',
              'Setor ${0}',
              ['$get', 'feature.properties.cd_geocodi'],
            ],
          ],
          entries: [
            [
              ['$get', 'view.conf.data.variableId'],
              [
                '$literal',
                [
                  '$get',
                  [
                    '$template',
                    'feature.properties.${0}' +
                      `::string({ "number": ${JSON.stringify(NUMBER_FMT)} })`,
                    ['$get', 'view.conf.data.variableId'],
                  ],
                ],
              ],
            ],
            [
              'Pessoas Residentes',
              [
                '$literal',
                ['$get', `feature.properties.pop_bas_mor_tot_pes::string`],
              ],
            ],
          ],
        },
        source: VECTOR_SOURCE_ID,
        'source-layer': VECTOR_SOURCE_ID,
        type: 'fill',
        filter: ['==', ['get', 'cod_municipio'], ['$get', 'municipioId']],
        paint: {
          'fill-color': [
            '$flat',
            [
              ['step', ['get', ['$get', 'view.conf.data.variableId']]],
              ['$get', 'view.metadata.colorScaleStops'],
            ],
          ],
          'fill-opacity': ['$get', 'view.conf.style.layerOpacity'],
          'fill-outline-color': 'transparent',
        },
      },
    },
  }
}
