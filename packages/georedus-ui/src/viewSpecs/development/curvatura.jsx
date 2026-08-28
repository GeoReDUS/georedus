import React from 'react'
import { resolve } from '@orioro/resolve'
import { $urlSearch } from '../resolveView/customExpr'
import { VIEW_TYPE_SURFACE_CHOROPLETH } from '../constants'
import { DocumentIframe } from '../../DocumentIframe'

const CURVATURA_ID = 'curvatura'

const TRANSPARENT = [0, 0, 0, 0]

const CURVATURA_CLASSES = [
  {
    value: 1,
    label: 'Muito côncava',
    color: '#d92bcb',
  },
  {
    value: 2,
    label: 'Côncava',
    color: '#b49bcb',
  },
  {
    value: 3,
    label: 'Retilínea',
    color: '#dcdcdc',
  },
  {
    value: 4,
    label: 'Convexa',
    color: '#f3ce5e',
  },
  {
    value: 5,
    label: 'Muito convexa',
    color: '#fd952e',
  },
]

const DEFAULT_CURVATURA_ACTIVE_CLASSSES = CURVATURA_CLASSES.map(
  (cl) => cl.value,
)

function _curvaturaActiveClasses(candidate) {
  return Array.isArray(candidate) && candidate.length > 0
    ? candidate
    : DEFAULT_CURVATURA_ACTIVE_CLASSSES
}

export function curvatura({ RASTER_TILE_SERVER_ENDPOINT, mosaicJsonUrl }) {
  const DEVICE_PIXEL_RATIO_SUFFIX =
    typeof window !== 'undefined' && window.devicePixelRatio > 1 ? '@2x' : ''

  return {
    viewType: VIEW_TYPE_SURFACE_CHOROPLETH,

    collection_id: CURVATURA_ID,
    indicator_id: CURVATURA_ID,
    id: CURVATURA_ID,
    sourceLabel: 'ANADEM (ANA)',
    label: 'Forma da encosta - Em perfil',
    shortDescription:
      'Refere-se às formas côncava, convexa e retilínea do terreno, analisada em perfil',
    path: `Emergências climáticas / / Suscetibilidade a deslizamentos`,
    metodology: (
      <DocumentIframe src="/georedus/georedus/metodologia/perfil-de-curvatura.pdf" />
    ),
    confSchema: {
      data: {
        curvaturaActiveClasses: {
          type: 'checkboxSelect',
          options: CURVATURA_CLASSES.map((curv) => ({
            label: curv.label,
            value: curv.value,
          })),
          defaultValue: CURVATURA_CLASSES.map((curv) => curv.value),
        },
      },
    },
    metadata: {},

    sources: {
      [CURVATURA_ID]: {
        minzoom: 9,
        maxzoom: 14,
        type: 'raster',
        tiles: [
          resolve.fn(({ view: { conf } }) => {
            const curvaturaActiveClasses = _curvaturaActiveClasses(
              conf?.data?.curvaturaActiveClasses,
            )

            const baseUrl = `${RASTER_TILE_SERVER_ENDPOINT}/mosaicjson/tiles/WebMercatorQuad/{z}/{x}/{y}${DEVICE_PIXEL_RATIO_SUFFIX}`

            const COLOR_MAP = Object.fromEntries(
              CURVATURA_CLASSES.map((curv) => [
                curv.value,
                curvaturaActiveClasses.includes(curv.value)
                  ? curv.color
                  : TRANSPARENT,
              ]),
            )

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
        legends: [
          {
            type: 'CategoricalLegend',
            title: 'Forma da encosta',
            items: resolve.fn(({ view: { conf } }) => {
              const curvaturaActiveClasses = _curvaturaActiveClasses(
                conf?.data?.curvaturaActiveClasses,
              )

              return CURVATURA_CLASSES.filter((curv) =>
                curvaturaActiveClasses.includes(curv.value),
              )
            }),
          },
        ],
      },
    },
  }
}
