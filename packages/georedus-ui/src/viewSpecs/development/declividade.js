const DECLIVIDADE_ID = 'declividade'
import { resolve } from '@orioro/resolve'
import { $urlSearch } from '../resolveView/customExpr'

const DEFAULT_DECLIVIDADE_RANGE = [0, 45]
const TRANSPARENT = [0, 0, 0, 0]

function _declividadeRange(candidate) {
  return Array.isArray(candidate) &&
    candidate.length === 2 &&
    typeof candidate[0] === 'number' &&
    typeof candidate[1] === 'number'
    ? candidate
    : DEFAULT_DECLIVIDADE_RANGE
}

export function declividade({ RASTER_TILE_SERVER_ENDPOINT, mosaicJsonUrl }) {
  const DEVICE_PIXEL_RATIO_SUFFIX =
    typeof window !== 'undefined' && window.devicePixelRatio > 1 ? '@2x' : ''

  return {
    collection_id: DECLIVIDADE_ID,
    indicator_id: DECLIVIDADE_ID,
    id: DECLIVIDADE_ID,
    label: 'Declividade',
    path: `Emergências climáticas / / Terreno`,

    confSchema: {
      data: {
        declividadeRange: {
          type: 'range',
          defaultValue: DEFAULT_DECLIVIDADE_RANGE,
          step: 1,
          min: DEFAULT_DECLIVIDADE_RANGE[0],
          max: DEFAULT_DECLIVIDADE_RANGE[1],
          label: resolve.literal(
            resolve.fn((context) => {
              const declividadeRange = _declividadeRange(
                context.value?.declividadeRange,
              )

              const minLabel = `${declividadeRange[0]}°`
              const maxLabel = `${declividadeRange[1]}°${declividadeRange[1] === DEFAULT_DECLIVIDADE_RANGE[1] ? '+' : ''}`

              return `Intervalo de declividade (${minLabel} - ${maxLabel})`
            }),
          ),
          helperText: 'Intervalo de declividade apresentado',
        },
      },
    },
    metadata: {},

    sources: {
      [DECLIVIDADE_ID]: {
        minzoom: 9,
        type: 'raster',
        tiles: [
          resolve.fn(({ view: { conf } }) => {
            const declividadeRange = _declividadeRange(
              conf?.data?.declividadeRange,
            )

            const baseUrl = `${RASTER_TILE_SERVER_ENDPOINT}/mosaicjson/tiles/WebMercatorQuad/{z}/{x}/{y}${DEVICE_PIXEL_RATIO_SUFFIX}`

            const COLOR_MAP = [
              [[0, 0], '#2B83BA'],
              [[0.001, 2], '#6BB0AF'],
              [[2.001, 5], '#ABDDA4'],
              [[5.001, 10], '#D5EEB1'],
              [[10.001, 17], '#FFFFBF'],
              [[17.001, 20], '#FED690'],
              [[20.001, 25], '#FDAE61'],
              [[25.001, 30], '#EA633E'],
              [[30.001, 45], '#D7191C'],
              [[45.001, 999999], '#860003'],
            ]

            return `${baseUrl}?${$urlSearch([
              {
                url: mosaicJsonUrl,
                colormap: COLOR_MAP.map(([bounds, color]) => [
                  bounds,
                  bounds[0] >= declividadeRange[0] &&
                  bounds[1] <= declividadeRange[1]
                    ? color
                    : TRANSPARENT,
                ]),
              },
            ])}`
          }),
        ],
      },
    },
    layers: {
      [`${DECLIVIDADE_ID}`]: {
        minzoom: 9,
        zIndex: 10,
        type: 'raster',
        source: DECLIVIDADE_ID,
        paint: {
          'raster-opacity': 0.85,
        },
      },
    },
  }
}
