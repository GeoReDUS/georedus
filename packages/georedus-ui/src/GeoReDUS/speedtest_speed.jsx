import { resolve } from '@orioro/resolve'
import { basicTooltip } from '../viewSpecs/presets/util'
import { COLOR_SCALE_STOPS_RESOLVERS } from '../viewSpecs/presets/vector_polygon_continuous/metadata/colorScaleStopResolvers'
import { D3_COLOR_SCHEMES } from '../viewSpecs/util'

export function speedtest_speed({ id = 'avg_d_kbps' } = {}) {
  const colorScaleStops = COLOR_SCALE_STOPS_RESOLVERS.custom({
    colorScheme: D3_COLOR_SCHEMES.schemeRdYlGn,
    classificationMethod: {
      breaks: [5000, 10000, 25000, 50000, 100000, 200000],
    },
  })

  return {
    collection_id: id,
    indicator_id: id,
    id: id,
    label: 'Velocidade de internet',
    path: `Divisões territoriais / _ / Conectividade`,
    confSchema: {
      data: {
        networkType: {
          type: 'select',
          clearable: false,
          defaultValue: 'fixed',
          options: [
            {
              label: 'Fixa',
              value: 'fixed',
            },
            {
              label: 'Móvel',
              value: 'mobile',
            },
          ],
        },
      },
    },
    metadata: {},

    sources: {
      main: {
        type: 'vector',
        tiles: resolve.fn((ctx) => {
          const networkType = ctx.view.conf.data?.networkType || 'fixed'

          return [
            `http://localhost:8002/ookla_speedtest_performance_${networkType}_tiles_2025.geom/{z}/{x}/{y}`,
          ]
        }),
        minzoom: 6,
      },
    },

    layers: {
      main_fill: {
        // zIndex: Z_OVERLAY_BASE_1000,
        source: 'main',
        'source-layer': resolve.fn((ctx) => {
          const networkType = ctx.view.conf.data?.networkType || 'fixed'

          return `ookla_speedtest_performance_${networkType}_tiles_2025.geom`
        }),
        type: 'fill',
        paint: {
          'fill-color': ['step', ['get', 'avg_d_kbps'], ...colorScaleStops],
          'fill-opacity': 0.5,
          'fill-outline-color': 'rgba(0,0,0,0)',
        },
        tooltip: basicTooltip(),
        legends: [
          {
            type: 'SequentialColorLegend',
            title: resolve.fn((ctx) => {
              const networkType = ctx.view.conf.data?.networkType || 'fixed'

              return `Velocidade de banda larga (${networkType})`
            }),
            unit: 'Kbps',

            steps: colorScaleStops,
            format: {
              below: 'Sem dados',
              above: 'Acima de ${0}',
            },
          },
        ],
      },
    },
  }
}
