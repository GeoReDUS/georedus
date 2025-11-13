import React from 'react'
import { resolve } from '@orioro/resolve'
import { $urlSearch } from '../resolveView/customExpr'
import { colord } from 'colord'
import { VIEW_TYPE_SURFACE_CHOROPLETH } from '../constants'
import { DocumentIframe } from '../../DocumentIframe'
import { schemeCategory10 } from 'd3-scale-chromatic'

const HAND_ID = 'hand'

const DEFAULT_HAND_VALUE = 2
const MAX_HAND_VALUE = 6

const OTTO_3 = 'ana_malha_br_bacias_hidrograficas_2017_otto_3.geom'

function _handValue(conf) {
  return typeof conf?.data?.handValue === 'number'
    ? conf.data.handValue
    : DEFAULT_HAND_VALUE
}

//
// Color at DEFAULT_HAND_VALUE
//
const BASE_COLOR = '#2B83BA'

const COLOR_MAP_BASE = [
  [[0, 0.1], colord(BASE_COLOR).darken(0.2).toHex()],
  [[0.10000000001, 0.25], colord(BASE_COLOR).darken(0.15).toHex()],
  [[0.25000000001, 0.5], colord(BASE_COLOR).darken(0.1).toHex()],
  [[0.50000000001, 1], colord(BASE_COLOR).darken(0.05).toHex()],
  [[1.00000000001, 1.5], BASE_COLOR],
  [[1.50000000001, 2], colord(BASE_COLOR).lighten(0.1).toHex()],
  [[2.00000000001, 2.5], colord(BASE_COLOR).lighten(0.2).toHex()],
  [[2.50000000001, 3], colord(BASE_COLOR).lighten(0.25).toHex()],
  [[3.00000000001, 3.5], colord(BASE_COLOR).lighten(0.3).toHex()],
  [[3.50000000001, 4], colord(BASE_COLOR).lighten(0.35).toHex()],
  [[4.00000000001, 4.5], colord(BASE_COLOR).lighten(0.4).toHex()],
  [[4.50000000001, 5], colord(BASE_COLOR).lighten(0.45).toHex()],
  [[5.00000000001, MAX_HAND_VALUE], colord(BASE_COLOR).lighten(0.5).toHex()],
]

function hand_legends() {
  return [
    {
      type: 'ContinuousColorLegend',
      title: 'Altura acima da drenagem mais próxima',
      unit: 'metros',
      numberUnit: 'm',
      colors: resolve.fn(({ view: { conf } }) => {
        const handValue = _handValue(conf)

        return COLOR_MAP_BASE.filter(
          ([range, value]) => range[1] <= handValue,
        ).map(([range, color]) => color)
      }),
      domain: resolve.fn(({ view: { conf } }) => {
        const handValue = _handValue(conf)

        return [0, handValue]
      }),
      barHeight: 50,
    },
  ]
}

export function hand({
  RASTER_TILE_SERVER_ENDPOINT,
  VECTOR_TILE_SERVER_ENDPOINT,
  mosaicJsonUrl,
}) {
  const DEVICE_PIXEL_RATIO_SUFFIX =
    typeof window !== 'undefined' && window.devicePixelRatio > 1 ? '@2x' : ''

  return {
    viewType: VIEW_TYPE_SURFACE_CHOROPLETH,
    collection_id: HAND_ID,
    indicator_id: HAND_ID,
    id: HAND_ID,
    sourceLabel: 'ANADEM (ANA)',
    label: 'Altura acima da drenagem mais próxima',
    shortDescription:
      'Áreas suscetíveis à inundação calculadas por meio da distância vertical em relação ao canal de drenagem mais próximo',
    path: `Emergências climáticas / / Suscetibilidade à inundação`,
    metodology: (
      <DocumentIframe src="/georedus/metodologia/inundacao-hand.pdf" />
    ),
    confSchema: {
      data: {
        handValue: {
          type: 'slider',
          defaultValue: DEFAULT_HAND_VALUE,
          step: 1,
          min: 0,
          max: MAX_HAND_VALUE,

          label: resolve.literal(
            resolve.fn((context) => {
              return `Altura (${typeof context.value?.handValue === 'number' ? context.value.handValue : DEFAULT_HAND_VALUE}m)`
            }),
          ),
          helperText: 'Altura acima da drenagem mais próxima',
        },
      },
    },
    metadata: {},

    sources: {
      [HAND_ID]: {
        type: 'raster',
        minzoom: 9,
        maxzoom: 14,
        tiles: [
          resolve.fn(({ view: { conf } }) => {
            const handValue = _handValue(conf)

            const baseUrl = `${RASTER_TILE_SERVER_ENDPOINT}/mosaicjson/tiles/WebMercatorQuad/{z}/{x}/{y}${DEVICE_PIXEL_RATIO_SUFFIX}`

            return `${baseUrl}?${$urlSearch([
              {
                url: mosaicJsonUrl,
                // colormap: [[[0, handValue], '#2B83BA']],
                colormap: COLOR_MAP_BASE.filter(
                  ([range, value]) => range[1] <= handValue,
                ),
              },
            ])}`
          }),
        ],
      },
      [OTTO_3]: {
        type: 'vector',
        minzoom: 7,
        tiles: [`${VECTOR_TILE_SERVER_ENDPOINT}/${OTTO_3}/{z}/{x}/{y}`],
      },
    },
    layers: {
      [`${HAND_ID}`]: {
        minzoom: 9,
        // zIndex: 10,
        type: 'raster',
        source: HAND_ID,
        paint: {
          'raster-opacity': 0.85,
        },
        legends: hand_legends(),
      },
      [`${OTTO_3}_bounds`]: {
        source: OTTO_3,
        'source-layer': OTTO_3,
        minzoom: 7,
        type: 'line',
        paint: {
          'line-color': schemeCategory10[2],
          'line-width': 6,
          'line-dasharray': [4, 4],
          'line-opacity': 0.5,
        },
      },
    },
  }
}
