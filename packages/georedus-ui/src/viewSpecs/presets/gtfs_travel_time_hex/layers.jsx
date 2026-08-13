import { resolve } from '@orioro/resolve'
import { get } from '@orioro/get'
import { Z_OVERLAY_BASE_1000, Z_OVERLAY_TOP_3000 } from '../../zIndexes'

function _travelTimeFillColor(bands, valueKey) {
  return [
    'step',
    ['get', valueKey],
    bands[0].color,
    ...bands.slice(0, -1).flatMap((band, i) => [band.value, bands[i + 1].color]),
  ]
}

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
        'fill-color': style.baseFillColor,
        'fill-opacity': style.baseFillOpacity,
      },
      onClick: resolve.fn((ctx) => (e) => {
        const selectedHexFrom = get(ctx, 'view.conf.data.selectedHexFrom')
        const clickedHexFrom = e.properties[style.originIdKey]

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
      hidden: ['$empty', ['$get', 'view.conf.data.selectedHexFrom']],
      filter: resolve.fn((ctx) => {
        const selectedHexFrom = get(ctx, 'view.conf.data.selectedHexFrom')

        return selectedHexFrom
          ? ['==', ['get', style.originIdKey], selectedHexFrom]
          : ['==', ['get', style.originIdKey], '']
      }),
      paint: {
        'line-color': style.outlineColor,
        'line-width': style.outlineWidth,
      },
    },

    travel_time_fill: {
      zIndex: Z_OVERLAY_BASE_1000,
      source: 'travel_time',
      'source-layer': 'dvt',
      type: 'fill',
      hidden: ['$empty', ['$get', 'view.conf.data.selectedHexFrom']],
      paint: {
        'fill-color': _travelTimeFillColor(style.bands, style.valueKey),
        'fill-opacity': 0.8,
      },
      legends: [
        {
          type: 'CategoricalLegend',
          title: label,
          items: style.bands,
        },
      ],
    },
  }
}
