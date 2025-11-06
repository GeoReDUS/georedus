const TEMPERATURA_SUPERFICIE_ID = 'temperatura_superficie'
import { resolve } from '@orioro/resolve'
import { $urlSearch } from '../resolveView/customExpr'

const DEFAULT_DECLIVIDADE_RANGE = [0, 70]
const TRANSPARENT = [0, 0, 0, 0]

function _temperaturaRange(candidate) {
  return Array.isArray(candidate) &&
    candidate.length === 2 &&
    typeof candidate[0] === 'number' &&
    typeof candidate[1] === 'number'
    ? candidate
    : DEFAULT_DECLIVIDADE_RANGE
}

export function temperatura_superficie({
  RASTER_TILE_SERVER_ENDPOINT,
  mosaicJsonUrl,
}) {
  const DEVICE_PIXEL_RATIO_SUFFIX =
    typeof window !== 'undefined' && window.devicePixelRatio > 1 ? '@2x' : ''

  return {
    collection_id: TEMPERATURA_SUPERFICIE_ID,
    indicator_id: TEMPERATURA_SUPERFICIE_ID,
    id: TEMPERATURA_SUPERFICIE_ID,
    label: 'Temperatura de superfície',
    path: `Emergências climáticas / / Clima`,

    confSchema: {
      data: {
        temperaturaRange: {
          type: 'range',
          defaultValue: DEFAULT_DECLIVIDADE_RANGE,
          step: 1,
          min: DEFAULT_DECLIVIDADE_RANGE[0],
          max: DEFAULT_DECLIVIDADE_RANGE[1],
          label: resolve.literal(
            resolve.fn((context) => {
              const temperaturaRange = _temperaturaRange(
                context.value?.temperaturaRange,
              )
              const minLabel = `${temperaturaRange[0]}°`
              const maxLabel = `${temperaturaRange[1]}°${temperaturaRange[1] === DEFAULT_DECLIVIDADE_RANGE[1] ? '+' : ''}`
              return `Intervalo de temperatura (${minLabel} - ${maxLabel})`
            }),
          ),
          helperText: 'Intervalo de temperatura apresentado',
        },
      },
    },
    metadata: {},

    sources: {
      [TEMPERATURA_SUPERFICIE_ID]: {
        minzoom: 7,
        type: 'raster',
        tiles: [
          resolve.fn(({ view: { conf } }) => {
            const temperaturaRange = _temperaturaRange(
              conf?.data?.temperaturaRange,
            )

            const baseUrl = `${RASTER_TILE_SERVER_ENDPOINT}/mosaicjson/tiles/WebMercatorQuad/{z}/{x}/{y}${DEVICE_PIXEL_RATIO_SUFFIX}`

            const COLOR_MAP = [
              [[0, 0], '#2B83BA'],
              [[0.001, 20], '#6BB0AF'],
              [[20.001, 25], '#ABDDA4'],
              [[25.001, 30], '#D5EEB1'],
              [[30.001, 35], '#FFFFBF'],
              [[35.001, 40], '#FED690'],
              [[40.001, 45], '#FDAE61'],
              [[45.001, 50], '#EA633E'],
              [[50.001, 55], '#D7191C'],
              [[55.001, 999999], '#860003'],
            ]

            return `${baseUrl}?${$urlSearch([
              {
                url: mosaicJsonUrl,
                colormap: COLOR_MAP.map(([bounds, color]) => [
                  bounds,
                  bounds[0] >= temperaturaRange[0] &&
                  bounds[1] <= temperaturaRange[1]
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
      [`${TEMPERATURA_SUPERFICIE_ID}`]: {
        minzoom: 7,
        zIndex: 10,
        type: 'raster',
        source: TEMPERATURA_SUPERFICIE_ID,
        paint: {
          'raster-opacity': 0.85,
        },
      },
    },
  }
}
