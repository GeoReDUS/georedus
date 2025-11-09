const CURVATURA_ID = 'curvatura'
import { resolve } from '@orioro/resolve'
import { $urlSearch } from '../resolveView/customExpr'
import { VIEW_TYPE_SURFACE_CHOROPLETH } from '../constants'

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

export function curvatura({ RASTER_TILE_SERVER_ENDPOINT, mosaicJsonUrl }) {
  const DEVICE_PIXEL_RATIO_SUFFIX =
    typeof window !== 'undefined' && window.devicePixelRatio > 1 ? '@2x' : ''

  return {
    viewType: VIEW_TYPE_SURFACE_CHOROPLETH,

    collection_id: CURVATURA_ID,
    indicator_id: CURVATURA_ID,
    id: CURVATURA_ID,
    label: 'Forma da encosta - Em perfil',
    path: `Emergências climáticas / / Suscetibilidade a deslizamentos`,

    confSchema: {
      data: {
        // temperaturaRange: {
        //   type: 'range',
        //   defaultValue: DEFAULT_DECLIVIDADE_RANGE,
        //   step: 1,
        //   min: DEFAULT_DECLIVIDADE_RANGE[0],
        //   max: DEFAULT_DECLIVIDADE_RANGE[1],
        //   label: resolve.literal(
        //     resolve.fn((context) => {
        //       const temperaturaRange = _temperaturaRange(
        //         context.value?.temperaturaRange,
        //       )
        //       const minLabel = `${temperaturaRange[0]}°`
        //       const maxLabel = `${temperaturaRange[1]}°${temperaturaRange[1] === DEFAULT_DECLIVIDADE_RANGE[1] ? '+' : ''}`
        //       return `Intervalo de temperatura (${minLabel} - ${maxLabel})`
        //     }),
        //   ),
        //   helperText: 'Intervalo de temperatura apresentado',
        // },
      },
    },
    metadata: {},

    sources: {
      [CURVATURA_ID]: {
        minzoom: 9,
        type: 'raster',
        tiles: [
          resolve.fn(({ view: { conf } }) => {
            // const temperaturaRange = _temperaturaRange(
            //   conf?.data?.temperaturaRange,
            // )

            const baseUrl = `${RASTER_TILE_SERVER_ENDPOINT}/mosaicjson/tiles/WebMercatorQuad/{z}/{x}/{y}${DEVICE_PIXEL_RATIO_SUFFIX}`

            const COLOR_MAP = {
              1: '#d92bcb',
              2: '#b49bcb',
              3: '#dcdcdc',
              4: '#f3ce5e',
              5: '#fd952e',
            }

            return `${baseUrl}?${$urlSearch([
              {
                url: mosaicJsonUrl,
                colormap: COLOR_MAP,
              },
            ])}`
          }),
        ],
      },
    },
    layers: {
      [`${CURVATURA_ID}`]: {
        minzoom: 9,
        // zIndex: 10,
        type: 'raster',
        source: CURVATURA_ID,
        paint: {
          'raster-opacity': 0.85,
        },
      },
    },
  }
}
