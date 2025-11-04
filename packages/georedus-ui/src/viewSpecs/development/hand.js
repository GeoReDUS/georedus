const HAND_ID = 'hand'
import { resolve } from '@orioro/resolve'
import { $urlSearch } from '../resolveView/customExpr'

const DEFAULT_HAND_VALUE = 2

export function hand({ RASTER_TILE_SERVER_ENDPOINT, mosaicJsonUrl }) {
  const DEVICE_PIXEL_RATIO_SUFFIX =
    typeof window !== 'undefined' && window.devicePixelRatio > 1 ? '@2x' : ''

  return {
    collection_id: HAND_ID,
    indicator_id: HAND_ID,
    id: HAND_ID,
    label: 'Áreas sujeitas a inundação (HAND)',
    path: `Emergências climáticas / / Riscos hidrológicos`,

    confSchema: {
      data: {
        handValue: {
          type: 'slider',
          defaultValue: DEFAULT_HAND_VALUE,
          step: 1,
          min: 0,
          max: 10,

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
        tiles: [
          resolve.fn(({ view: { conf } }) => {
            const handValue =
              typeof conf?.data?.handValue === 'number'
                ? conf.data.handValue
                : DEFAULT_HAND_VALUE

            const baseUrl = `${RASTER_TILE_SERVER_ENDPOINT}/mosaicjson/tiles/WebMercatorQuad/{z}/{x}/{y}${DEVICE_PIXEL_RATIO_SUFFIX}`

            return `${baseUrl}?${$urlSearch([
              {
                url: mosaicJsonUrl,
                colormap: [[[0, handValue], '#2B83BA']],
              },
            ])}`
          }),
        ],
      },
    },
    layers: {
      [`${HAND_ID}`]: {
        zIndex: 10,
        type: 'raster',
        source: HAND_ID,
        paint: {
          'raster-opacity': 0.85,
        },
      },
    },
  }
}
