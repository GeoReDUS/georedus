import { basicTooltip } from '../viewSpecs/presets/util'

export function speedtest_basic({ id = 'speedtest_basic' } = {}) {
  return {
    collection_id: id,
    indicator_id: id,
    id: id,
    label: 'Velocidade de internet (base)',
    path: `Divisões territoriais / _ / Conectividade`,
    metadata: {},

    sources: {
      main: {
        type: 'vector',
        tiles: [
          `http://localhost:8002/ookla_speedtest_performance_mobile_tiles_2025.geom/{z}/{x}/{y}`,
        ],
        minzoom: 6,
      },
    },

    layers: {
      main_fill: {
        // zIndex: Z_OVERLAY_BASE_1000,
        source: 'main',
        'source-layer': 'ookla_speedtest_performance_mobile_tiles_2025.geom',
        type: 'fill',
        paint: {
          'fill-color': 'red',
          'fill-color': [
            'step',
            ['get', 'avg_d_kbps'],
            'red',
            5000,
            'yellow',
            100000,
            'blue',
            200000,
            'green',
          ],
        },
        tooltip: basicTooltip(),
      },
    },
  }
}
