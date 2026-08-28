import React from 'react'

const DECLIVIDADE_ID = 'declividade'
import { resolve } from '@orioro/resolve'
import { $urlSearch } from '../resolveView/customExpr'
import { VIEW_TYPE_SURFACE_CHOROPLETH } from '../constants'
import { DocumentIframe } from '../../DocumentIframe'

const TRANSPARENT = [0, 0, 0, 0]

const PRECISION = 0.00000001

const DECLIVIDADE_CLASSES = [
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
].map((cl) => ({ ...cl, value: cl.label }))

const DEFAULT_DECLIVIDADE_ACTIVE_CLASSSES = DECLIVIDADE_CLASSES.map(
  (cl) => cl.value,
)

function _declividadeActiveClasses(candidate) {
  return Array.isArray(candidate) && candidate.length > 0
    ? candidate
    : DEFAULT_DECLIVIDADE_ACTIVE_CLASSSES
}

export function declividade({ RASTER_TILE_SERVER_ENDPOINT, mosaicJsonUrl }) {
  const DEVICE_PIXEL_RATIO_SUFFIX =
    typeof window !== 'undefined' && window.devicePixelRatio > 1 ? '@2x' : ''

  return {
    viewType: VIEW_TYPE_SURFACE_CHOROPLETH,
    collection_id: DECLIVIDADE_ID,
    indicator_id: DECLIVIDADE_ID,
    id: DECLIVIDADE_ID,
    sourceLabel: 'ANADEM (ANA)',
    label: 'Declividade',
    shortDescription:
      'Ângulo de inclinação da superfície do terreno com relação à horizontal',
    path: `Emergências climáticas / / Suscetibilidade a deslizamentos`,
    metodology: <DocumentIframe src="/georedus/georedus/metodologia/declividade.pdf" />,
    confSchema: {
      data: {
        declividadeActiveClasses: {
          type: 'checkboxSelect',
          options: DECLIVIDADE_CLASSES.map((cl) => ({
            label: cl.label,
            value: cl.value,
          })),
          defaultValue: DECLIVIDADE_CLASSES.map((cl) => cl.value),
        },
      },
    },
    metadata: {},

    sources: {
      [DECLIVIDADE_ID]: {
        minzoom: 9,
        maxzoom: 14,
        type: 'raster',
        tiles: [
          resolve.fn(({ view: { conf } }) => {
            const declividadeActiveClasses = _declividadeActiveClasses(
              conf?.data?.declividadeActiveClasses,
            )

            const baseUrl = `${RASTER_TILE_SERVER_ENDPOINT}/mosaicjson/tiles/WebMercatorQuad/{z}/{x}/{y}${DEVICE_PIXEL_RATIO_SUFFIX}`

            const COLOR_MAP = DECLIVIDADE_CLASSES.map((cl) => [
              cl.range,
              declividadeActiveClasses.includes(cl.value)
                ? cl.color
                : TRANSPARENT,
            ])

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
      [`${DECLIVIDADE_ID}`]: {
        minzoom: 9,
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
            items: resolve.fn(({ view: { conf } }) => {
              const declividadeActiveClasses = _declividadeActiveClasses(
                conf?.data?.declividadeActiveClasses,
              )

              return DECLIVIDADE_CLASSES.filter((cl) =>
                declividadeActiveClasses.includes(cl.value),
              )
            }),
          },
        ],
      },
    },
  }
}
