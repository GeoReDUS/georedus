import { schemeCategory10 } from 'd3-scale-chromatic'
import { waves_1 } from '@orioro/react-maplibre-util'
import { Z_OVERLAY_BASE_1000 } from '../zIndexes'

function svgBgImage(svg) {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

export function br_divisao_territorial({
  VECTOR_TILE_SERVER_ENDPOINT,
  id,
  path,
  label = id,
  line = {},
  fill = {},
}) {
  return {
    collection_id: id,
    indicator_id: id,
    id: id,
    label,
    path: `Divisões territoriais / _ / ${path}`,
    metadata: {},
    sources: {
      [id]: {
        promoteId: 'id',
        type: 'vector',
        tiles: [`${VECTOR_TILE_SERVER_ENDPOINT}/${id}/{z}/{x}/{y}`],
      },
    },
    layers: {
      [`${id}_bounds`]: {
        zIndex: Z_OVERLAY_BASE_1000,
        source: id,
        'source-layer': id,
        type: 'line',
        ...line,
      },
      [`${id}_fill`]: {
        zIndex: Z_OVERLAY_BASE_1000,
        source: id,
        'source-layer': id,
        type: 'fill',
        ...fill,
        paint: {
          'fill-opacity': 0,
          ...fill.paint,
        },
      },
    },
  }
}

export function br_divisao_territorial_views(conf) {
  return [
    //
    // 2024
    //
    br_divisao_territorial({
      ...conf,
      year: '2022',
      path: 'Municípios',
      label: 'Municípios',
      id: 'ibge_malha_br_municipio_2024.geom',
      line: {
        paint: {
          'line-color': schemeCategory10[0],
          'line-width': 5,
          'line-dasharray': [2, 2],
          'line-opacity': 0.5,
        },
      },
    }),
    br_divisao_territorial({
      ...conf,
      year: '2022',
      path: 'Municípios',
      label: 'Regiões Metropolitanas',
      id: 'ibge_malha_br_regiao_metropolitana_2024.geom',
      line: {
        paint: {
          'line-color': schemeCategory10[1],
          'line-width': 10,
          'line-opacity': 0.5,
        },
      },
    }),
    br_divisao_territorial({
      ...conf,
      year: '2022',
      path: 'Municípios',
      label: 'Concentrações Urbanas',
      id: 'ibge_malha_br_concurb_2024.geom',
      line: {
        paint: {
          'line-color': schemeCategory10[2],
          'line-width': 5,
          'line-opacity': 0.5,
        },
      },
    }),
    br_divisao_territorial({
      path: 'Censo 2022',
      id: 'ibge_malha_br_regiao_intermediaria_2024.geom',
      year: '2022',
      label: 'Região intermediária',
      line: {
        paint: {
          'line-color': schemeCategory10[3],
          'line-width': 6,
          'line-opacity': 0.5,
        },
      },
      ...conf,
    }),

    br_divisao_territorial({
      path: 'Censo 2022',
      id: 'ibge_malha_br_regiao_imediata_2024.geom',
      year: '2022',
      label: 'Região imediata',
      line: {
        paint: {
          'line-color': schemeCategory10[4],
          'line-width': 6,
          'line-opacity': 0.5,
        },
      },
      ...conf,
    }),

    //
    // Censo 2022
    //
    br_divisao_territorial({
      path: 'Censo 2022',
      id: 'ibge_malha_br_distrito_2022.geom',
      year: '2022',
      label: 'Distritos',
      line: {
        paint: {
          'line-color': schemeCategory10[5],
          'line-width': 6,
          'line-opacity': 0.5,
        },
      },
      ...conf,
    }),
    br_divisao_territorial({
      path: 'Censo 2022',
      ...conf,
      year: '2022',
      label: 'Subdistritos',
      id: 'ibge_malha_br_subdistrito_2022.geom',
      line: {
        paint: {
          'line-color': schemeCategory10[6],
          'line-width': 2,
          'line-opacity': 0.5,
        },
      },
    }),
    br_divisao_territorial({
      path: 'Censo 2022',
      ...conf,
      year: '2022',
      label: 'Bairros',
      id: 'ibge_malha_br_bairro_2022.geom',
      line: {
        paint: {
          'line-color': 'black',
          'line-width': 1,
          'line-opacity': 0.5,
        },
      },
    }),
    br_divisao_territorial({
      year: '2022',
      path: 'Favelas e Comunidades Urbanas',
      label: 'Favelas e Comunidades Urbanas',
      id: 'ibge_malha_br_fcu_2022.geom',
      line: {
        paint: {
          'line-color': 'brown',
          'line-width': 1,
          'line-opacity': 1,
        },
      },
      fill: {
        paint: {
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1,
            0.6,
          ],
          'fill-pattern': 'waves_1({ stroke: "brown", scale: 0.25 })',
        },
        interactive: true,
        tooltip: {
          title: ['$literal', ['$get', 'feature.properties.name']],
          entries: [['Favela ou Comunidade Urbana', null]],
        },
        legends: [
          {
            type: 'CategoricalLegend',
            items: [
              {
                label: 'Favelas e Comunidades Urbanas',
                box: {
                  style: {
                    borderColor: 'brown',
                    borderStyle: 'solid',
                    borderWidth: '1px',
                    backgroundImage: svgBgImage(
                      waves_1({
                        stroke: 'brown',
                        scale: '0.25',
                      }),
                    ),
                  },
                },
              },
            ],
          },
        ],
      },
      ...conf,
    }),

    //
    // Censo 2010
    //
    br_divisao_territorial({
      path: 'Censo 2010',
      year: '2010',
      label: 'Distritos',
      id: 'ibge_malha_br_distrito_2010.geom',
      line: {
        paint: {
          'line-color': 'blue',
          'line-width': 6,
          'line-opacity': 0.5,
        },
      },
      ...conf,
    }),
    br_divisao_territorial({
      path: 'Censo 2010',
      year: '2010',
      label: 'Subdistritos',
      id: 'ibge_malha_br_subdistrito_2010.geom',
      line: {
        paint: {
          'line-color': 'magenta',
          'line-width': 2,
          'line-opacity': 0.5,
        },
      },
      ...conf,
    }),
  ]
}
