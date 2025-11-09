const TEMPERATURA_SUPERFICIE_ID = 'temperatura_superficie'
import { resolve } from '@orioro/resolve'
import { $urlSearch } from '../resolveView/customExpr'
import { interpolateSpectral } from 'd3-scale-chromatic'
import { colord } from 'colord'
import { VIEW_TYPE_SURFACE_CHOROPLETH } from '../constants'

const TEMPERATURA_MIN = 20
const TEMPERATURA_MAX = 60
const DEFAULT_TEMPERATURA_RANGE = [TEMPERATURA_MIN, TEMPERATURA_MAX]
const TRANSPARENT = [0, 0, 0, 0]

function _temperaturaRange(candidate) {
  return Array.isArray(candidate) &&
    candidate.length === 2 &&
    typeof candidate[0] === 'number' &&
    typeof candidate[1] === 'number'
    ? candidate
    : DEFAULT_TEMPERATURA_RANGE
}

const COLOR_STEPS = TEMPERATURA_MAX - TEMPERATURA_MIN + 1
const PRECISION = 0.00000001
const COLOR_MAP = Array.from({ length: COLOR_STEPS }, (_, idx) => {
  const progress = idx / (COLOR_STEPS - 1)
  const rangeStart = TEMPERATURA_MIN + idx
  const rangeEnd =
    idx === COLOR_STEPS - 1 ? 9999999 : rangeStart + 1 - PRECISION

  return [
    [rangeStart, rangeEnd],
    colord(interpolateSpectral(1 - progress)).toHex(),
  ]
})

function temperatura_legends() {
  return [
    {
      type: 'ContinuousColorLegend',
      title: 'Temperatura máxima de superfície (ºC)',
      unit: 'Valor médio em º Celsiu da temperatur máxima no período de 2021 - 2025',
      numberUnit: 'º',
      colors: resolve.fn(({ view: { conf } }) => {
        const temperaturaRange = _temperaturaRange(conf?.data?.temperaturaRange)

        return COLOR_MAP.filter(
          ([range]) =>
            range[0] <= temperaturaRange[1] && range[1] >= temperaturaRange[0],
        ).map(([_, color]) => color)
      }),
      domain: resolve.fn(({ view: { conf } }) => {
        const temperaturaRange = _temperaturaRange(conf?.data?.temperaturaRange)

        return temperaturaRange
      }),
      barDirection: 'to right',
      barWidth: '100%',
      barHeight: 15,
    },
  ]
}

export function temperatura_superficie({
  RASTER_TILE_SERVER_ENDPOINT,
  mosaicJsonUrl,
}) {
  const DEVICE_PIXEL_RATIO_SUFFIX =
    typeof window !== 'undefined' && window.devicePixelRatio > 1 ? '@2x' : ''

  return {
    viewType: VIEW_TYPE_SURFACE_CHOROPLETH,
    collection_id: TEMPERATURA_SUPERFICIE_ID,
    indicator_id: TEMPERATURA_SUPERFICIE_ID,
    id: TEMPERATURA_SUPERFICIE_ID,
    label: 'Temperatura máxima de superfície (ºC)',
    year: '2021 - 2025',
    path: `Emergências climáticas / / Extremos de temperatura`,

    confSchema: {
      data: {
        temperaturaRange: {
          type: 'range',
          defaultValue: DEFAULT_TEMPERATURA_RANGE,
          step: 1,
          min: DEFAULT_TEMPERATURA_RANGE[0],
          max: DEFAULT_TEMPERATURA_RANGE[1],
          label: resolve.literal(
            resolve.fn((context) => {
              const temperaturaRange = _temperaturaRange(
                context.value?.temperaturaRange,
              )
              const minLabel = `${temperaturaRange[0]}°`
              const maxLabel = `${temperaturaRange[1]}°${temperaturaRange[1] === DEFAULT_TEMPERATURA_RANGE[1] ? '+' : ''}`
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
        maxzoom: 14,
        type: 'raster',
        tiles: [
          resolve.fn(({ view: { conf } }) => {
            const temperaturaRange = _temperaturaRange(
              conf?.data?.temperaturaRange,
            )

            const baseUrl = `${RASTER_TILE_SERVER_ENDPOINT}/mosaicjson/tiles/WebMercatorQuad/{z}/{x}/{y}${DEVICE_PIXEL_RATIO_SUFFIX}`

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
        // zIndex: 10,
        type: 'raster',
        source: TEMPERATURA_SUPERFICIE_ID,
        paint: {
          'raster-opacity': 0.85,
        },
        legends: temperatura_legends(),
      },
    },
  }
}
