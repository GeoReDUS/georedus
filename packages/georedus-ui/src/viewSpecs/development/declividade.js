const DECLIVIDADE_ID = 'declividade'
import { resolve } from '@orioro/resolve'
import { $urlSearch } from '../resolveView/customExpr'
import { VIEW_TYPE_SURFACE_CHOROPLETH } from '../constants'

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

const PRECISION = 0.00000001

const CLASSES_DECLIVIDADE = [
  {
    color: '#2B83BA',
    label: '0º',
    range: [0, 0 + PRECISION - PRECISION / 10],
  },
  {
    color: '#6BB0AF',
    label: '0 a 2º',
    range: [0 + PRECISION, 2],
  },
  {
    color: '#ABDDA4',
    label: '2 a 5º',
    range: [2 + PRECISION, 5],
  },
  {
    color: '#D5EEB1',
    label: '5 a 10º',
    range: [5 + PRECISION, 10],
  },
  {
    color: '#FFFFBF',
    label: '10 a 17º',
    range: [10 + PRECISION, 17],
  },
  {
    color: '#FED690',
    label: '17 a 20º',
    range: [17 + PRECISION, 20],
  },
  {
    color: '#FDAE61',
    label: '20 a 25º',
    range: [20 + PRECISION, 25],
  },
  {
    color: '#EA633E',
    label: '25 a 30º',
    range: [25 + PRECISION, 30],
  },
  {
    color: '#D7191C',
    label: '30 a 45º',
    range: [30 + PRECISION, 45],
  },
  {
    color: '#860003',
    label: 'Acima de 45º',
    range: [45 + PRECISION, 999999],
  },
]

export function declividade({ RASTER_TILE_SERVER_ENDPOINT, mosaicJsonUrl }) {
  const DEVICE_PIXEL_RATIO_SUFFIX =
    typeof window !== 'undefined' && window.devicePixelRatio > 1 ? '@2x' : ''

  return {
    viewType: VIEW_TYPE_SURFACE_CHOROPLETH,
    collection_id: DECLIVIDADE_ID,
    indicator_id: DECLIVIDADE_ID,
    id: DECLIVIDADE_ID,
    label: 'Declividade',
    path: `Emergências climáticas / / Suscetibilidade a deslizamentos`,

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
        minzoom: 7,
        maxzoom: 14,
        type: 'raster',
        tiles: [
          resolve.fn(({ view: { conf } }) => {
            const declividadeRange = _declividadeRange(
              conf?.data?.declividadeRange,
            )

            const baseUrl = `${RASTER_TILE_SERVER_ENDPOINT}/mosaicjson/tiles/WebMercatorQuad/{z}/{x}/{y}${DEVICE_PIXEL_RATIO_SUFFIX}`

            const COLOR_MAP = CLASSES_DECLIVIDADE.map((cl) => [
              cl.range,
              cl.color,
            ])

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
        minzoom: 7,
        // zIndex: 10,
        type: 'raster',
        source: DECLIVIDADE_ID,
        paint: {
          'raster-opacity': 0.85,
        },
        legends: [
          {
            type: 'CategoricalLegend',
            title: 'Classes de Declividade',
            items: CLASSES_DECLIVIDADE,
          },
        ],
      },
    },
  }
}
