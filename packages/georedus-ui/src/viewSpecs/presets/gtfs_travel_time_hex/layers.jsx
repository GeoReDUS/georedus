import { get } from '@orioro/get'
import { resolve } from '@orioro/resolve'
import { Z_OVERLAY_BASE_1000, Z_OVERLAY_TOP_3000 } from '../../zIndexes'
import { basicTooltip } from '../util'

const COLOR_STEPS = [
  '#1a9850',
  15,
  '#66bd63',
  30,
  '#fee08b',
  45,
  '#fdae61',
  60,
  '#f46d43',
  90,
  '#d73027',
  120,
  '#a50026',
]

export function layers(viewSpec, allViewSpecs, context) {
  const { source_layer, label, style } = viewSpec

  if (!source_layer) {
    throw new Error('source_layer must be defined')
  }

  return {
    main_fill: {
      zIndex: Z_OVERLAY_BASE_1000,
      source: 'main',
      'source-layer': source_layer,
      type: 'fill',
      interactive: true,
      paint: {
        'fill-color': resolve.fn((ctx) => {
          const variableId = ctx.app?.regional ? 'time_min' : 'time_min_local'

          return [
            'case',
            ['!', ['has', variableId]],
            'transparent', // color for features with NO value at all
            [
              'step',
              ['get', variableId],
              // 0,
              ...COLOR_STEPS,
            ],

            // [
            //   'interpolate',
            //   ['linear'],
            //   // ['cubic-bezier', 0.85, 0, 0.15, 1], // steep S-curve
            //   ['get', 'time_min'],
            //   0,
            //   ...COLOR_STEPS,
            // ],
          ]
        }),

        'fill-opacity': 0.8,
        'fill-outline-color': 'transparent',
      },
      tooltip: basicTooltip({}),
      // filter: resolve.fn((ctx) => {
      //   const selectedHexFrom = get(ctx, 'view.conf.data.selectedHexFrom')

      //   return selectedHexFrom ? ['has', 'time_min'] : ['literal', true]
      // }),

      onClick: resolve.fn((ctx) => (e) => {
        const selectedHexFrom = get(ctx, 'view.conf.data.selectedHexFrom')
        const clickedHexFrom = e.properties.id

        ctx.app.viewConfDispatch({
          type: 'SET_VIEW',
          payload: {
            viewConf: {
              ...ctx.view.conf,
              data: {
                ...ctx.view.conf.data,
                selectedHexFrom:
                  selectedHexFrom === clickedHexFrom ? null : clickedHexFrom,
              },
            },
          },
        })
      }),
    },

    main_outline: {
      zIndex: Z_OVERLAY_TOP_3000,
      source: 'main',
      'source-layer': source_layer,
      type: 'line',
      // hidden: ['$empty', ['$get', 'view.conf.data.selectedHexFrom']],
      filter: resolve.fn((ctx) => {
        const selectedHexFrom = get(ctx, 'view.conf.data.selectedHexFrom')

        return selectedHexFrom
          ? ['==', ['get', 'id'], selectedHexFrom]
          : ['!=', ['get', 'id'], '']
      }),
      paint: resolve.fn((ctx) => {
        const selectedHexFrom = get(ctx, 'view.conf.data.selectedHexFrom')

        return selectedHexFrom
          ? {
              'line-color': 'red',
              'line-width': 2,
            }
          : {
              'line-color': '#cccccc',
              'line-width': 1,
            }
      }),
      // paint: {
      //   'line-color': 'red',
      //   'line-width': 2,
      // },
      legends: [
        {
          type: 'SequentialColorLegend',
          steps: COLOR_STEPS,
        },
      ],
    },
  }
}
