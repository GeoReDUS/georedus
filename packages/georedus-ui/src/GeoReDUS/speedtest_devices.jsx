import { resolve, resolveAsync } from '@orioro/resolve'
import {
  basicTooltip,
  continuousColorSchemeSelector,
} from '../viewSpecs/presets/util'
import { COLOR_SCALE_STOPS_RESOLVERS } from '../viewSpecs/presets/vector_polygon_continuous/metadata/colorScaleStopResolvers'
import { D3_COLOR_SCHEMES } from '../viewSpecs/util'

export function speedtest_devices({ id = 'speedtest_devices' } = {}) {
  return {
    collection_id: id,
    indicator_id: id,
    id: id,
    label: 'Dispositivos conectados',
    path: `Divisões territoriais / _ / Conectividade`,
    confSchema: {
      style: {
        colorScheme: continuousColorSchemeSelector({
          defaultValue: 'schemePuBu',
        }),
      },
    },
    metadata: resolveAsync.fn(async (ctx) => {
      const municipioId = ctx.app.municipioId
      // const municipioId = '3550308'
      const variableId = 'devices'
      const colorSchemeId = ctx.view.conf.style?.colorScheme || 'schemePuBu'

      const values = await fetch(
        `http://localhost:8001/ookla_speedtest_performance_fixed_tiles_2025?select=${variableId}&cd_mun=eq.${municipioId}`,
      )
        .then((res) => res.json())
        .then((items) => items.map((item) => item[variableId]))

      const colorScaleStops = COLOR_SCALE_STOPS_RESOLVERS.naturalBreaks({
        values,
        colorScheme: D3_COLOR_SCHEMES[colorSchemeId],
        classificationMethod: {
          k: 5,
        },
      })

      return {
        colorScaleStops,
      }
    }),

    sources: {
      main: {
        type: 'vector',
        tiles: [
          'http://localhost:8002/ookla_speedtest_performance_fixed_tiles_2025.geom/{z}/{x}/{y}',
        ],
        minzoom: 6,
      },
    },

    layers: {
      main_fill: {
        // zIndex: Z_OVERLAY_BASE_1000,
        source: 'main',
        'source-layer': 'ookla_speedtest_performance_fixed_tiles_2025.geom',
        type: 'fill',
        paint: {
          'fill-color': resolve.fn((ctx) => {
            const variableId = 'devices'

            const colorScaleStops = ctx?.view?.metadata?.colorScaleStops || []

            return ['step', ['get', variableId], ...colorScaleStops]
          }),
          'fill-opacity': 1,
          'fill-outline-color': 'rgba(0,0,0,0)',
        },
        tooltip: basicTooltip(),
        legends: [
          {
            type: 'SequentialColorLegend',
            title: 'Presença de banda larga fixa',
            unit: 'Qtd de dispositivos detectados',

            steps: resolve.fn((ctx) => {
              const colorScaleStops = ctx?.view?.metadata?.colorScaleStops || []

              return colorScaleStops
            }),
            format: {
              // number: viewSpec.style.numberFormat || DEFAULT_NUMBER_FORMAT,
              below: 'Sem dados',
              above: 'Acima de ${0}',
            },
          },
        ],
      },
    },
  }
}
