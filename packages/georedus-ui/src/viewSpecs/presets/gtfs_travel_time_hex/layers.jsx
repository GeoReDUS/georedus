import { get } from '@orioro/get'
import { resolve } from '@orioro/resolve'
import { Z_OVERLAY_TOP_3000 } from '../../zIndexes'
import { COLOR_SCHEMES, GEOREDUS_COLOR_SCHEMES } from '../../util'
import { SOURCE_LAYER_ID } from './sources'

const COLORS = COLOR_SCHEMES['-schemeRdYlGn'].scalesByK[11]

const GREEN_STEPS = [COLORS[1], 15, COLORS[2], 30]
const YELLOW_ORANGE_STEPS = [COLORS[6], 45, COLORS[7], 60]
const RED_STEPS = [COLORS[8], 90, COLORS[9], 120, COLORS[10]]
const COLOR_STEPS = [...GREEN_STEPS, ...YELLOW_ORANGE_STEPS, ...RED_STEPS]

export function layers(viewSpec, allViewSpecs, context) {
  return {
    main_fill: {
      source: 'main',
      'source-layer': SOURCE_LAYER_ID,
      type: 'fill',
      interactive: true,
      paint: {
        'fill-color': resolve.fn((ctx) => {
          return [
            'case',
            ['==', ['feature-state', 't'], null],
            'transparent', // color for features with NO value at all
            ['step', ['feature-state', 't'], ...COLOR_STEPS],
          ]
        }),

        'fill-opacity': 1,
        'fill-outline-color': [
          'case',
          ['boolean', ['feature-state', 'hover'], false], // default: not hovered
          GEOREDUS_COLOR_SCHEMES.schemeGeoReDUS.rosa,
          'transparent',
        ],
      },

      //
      // Show tooltip only when a source hex is fixed
      //
      tooltip: resolve.fn((ctx) => {
        const clickedHexFromId = get(ctx, 'view.conf.data.clickedHexFromId')

        return clickedHexFromId
          ? {
              entries: [
                [
                  'Tempo de viagem',
                  [
                    '$literal',
                    resolve.fn((hoverCtx) => {
                      const featureId = hoverCtx.feature?.id

                      if (!featureId) {
                        return
                      }

                      return (
                        get(
                          ctx,
                          `view.sources.main.featureState.stateById.${featureId}.t`,
                        ) + ' min'
                      )
                    }),
                  ],
                ],
              ],
            }
          : null
      }),

      onMouseMove: resolve.fn((ctx) => (e) => {
        const clickedHexFromId = get(ctx, 'view.conf.data.clickedHexFromId')

        if (clickedHexFromId) {
          return
        }

        const hoveredHexFromId = get(ctx, 'view.conf.data.hoveredHexFromId') || null
        const targetHexFrom = e.properties.id || null

        if (hoveredHexFromId === targetHexFrom) {
          return
        }

        ctx.app.viewConfDispatch({
          type: 'SET_VIEW',
          payload: {
            viewConf: {
              ...ctx.view.conf,
              data: {
                ...ctx.view.conf.data,
                hoveredHexFromId: targetHexFrom,
              },
            },
          },
        })
      }),

      onClick: resolve.fn((ctx) => (e) => {
        const clickedHexFromId = get(ctx, 'view.conf.data.clickedHexFromId') || null
        const targetHexFrom = e.properties.id || null

        ctx.app.viewConfDispatch({
          type: 'SET_VIEW',
          payload: {
            viewConf: {
              ...ctx.view.conf,
              data: {
                ...ctx.view.conf.data,
                ...(clickedHexFromId === targetHexFrom
                  ? {
                      hoveredHexFromId: clickedHexFromId,
                      clickedHexFromId: null,
                    }
                  : {
                      hoveredHexFromId: targetHexFrom,
                      clickedHexFromId: targetHexFrom,
                    }),
              },
            },
          },
        })
      }),
      legends: [
        {
          title: 'Tempo de viagem',
          type: 'SequentialColorLegend',
          steps: COLOR_STEPS,
        },
      ],
    },

    cursors_fill: {
      zIndex: Z_OVERLAY_TOP_3000,
      source: 'cursors',
      type: 'fill',
      filter: ['has', 'fill-color'],
      paint: {
        'fill-color': ['coalesce', ['get', 'fill-color'], 'transparent'],
      },
    },

    cursors_line: {
      zIndex: Z_OVERLAY_TOP_3000,
      source: 'cursors',
      type: 'line',
      filter: ['has', 'line-color'],
      paint: {
        'line-color': ['coalesce', ['get', 'line-color'], 'transparent'],
        'line-width': ['coalesce', ['get', 'line-width'], 2],
      },
    },
  }
}
