import { Z_OVERLAY_BASE_1000, Z_OVERLAY_TOP_3000 } from '../zIndexes'
import { interpolate } from '@orioro/util'
import { resolve, resolveAsync } from '@orioro/resolve'
import { sortBy } from 'lodash'

const ISOCHRONE_COLORS = [
  { value: 15, label: '15 min', color: '#2ECC71' },
  { value: 30, label: '30 min', color: '#F1C40F' },
  { value: 45, label: '45 min', color: '#E67E22' },
  { value: 60, label: '60 min', color: '#E74C3C' },
]

export function piloto_mobilidade_stops({
  circle = {},
  color,
  tiles,
  source_layer,
  sources = {},
  layers = {},
  VECTOR_TILE_SERVER_ENDPOINT,
  METADATA_API_ENDPOINT,
  ...props
}) {
  if (!source_layer) {
    throw new Error('source_layer must be defined')
  }

  return {
    ...props,
    // confSchema: {
    //   data: {
    //     isocrona_origem_stop_id: {
    //       label: 'ID do ponto de ônibus analisado',
    //       type: 'text',
    //     },
    //   },
    // },
    metadata: {
      isocrona_origem_polygons_geojson: resolveAsync.fn(async (context) => {
        const stop_id = context?.view?.conf?.data?.isocrona_origem_stop_id

        if (!stop_id) {
          return null
        }

        const isocrona_origem_polygons = await fetch(
          `${METADATA_API_ENDPOINT}/fnp_piloto_mobilidade_2026_isocronas_origem?id=eq.${stop_id}`,
        ).then((res) => res.json())

        return {
          type: 'FeatureCollection',
          features: sortBy(isocrona_origem_polygons, 'isochrone')
            .reverse()
            .map(({ geom, ...properties }) => ({
              type: 'Feature',
              properties,
              geometry: geom,
            })),
        }
      }),
    },
    sources: {
      main: {
        promoteId: 'id',
        type: 'vector',
        tiles,
      },
      isocrona_origem_polygons: resolve.fn((context) => {
        const isocrona_origem_polygons_geojson =
          context?.view?.metadata?.isocrona_origem_polygons_geojson

        if (!isocrona_origem_polygons_geojson) {
          return null
        }

        return {
          type: 'geojson',
          data: isocrona_origem_polygons_geojson,
        }
      }),
      ...sources,
    },
    layers: {
      [`main_circle`]: {
        zIndex: Z_OVERLAY_TOP_3000,
        source: 'main',
        'source-layer': source_layer,
        type: 'circle',
        ...circle,
        filter: resolve.fn((context) => {
          const isocrona_origem_stop_id =
            context?.view?.conf?.data?.isocrona_origem_stop_id

          return isocrona_origem_stop_id
            ? ['==', ['get', 'stop_id'], isocrona_origem_stop_id]
            : ['all']
        }),
        paint: resolve.fn((context) => {
          const PAINT_BASE = {
            'circle-color': color,
            'circle-stroke-color': '#000000',
            'circle-radius': 6,
          }
          const isocrona_origem_stop_id =
            context?.view?.conf?.data?.isocrona_origem_stop_id

          return isocrona_origem_stop_id
            ? {
                ...PAINT_BASE,
                'circle-stroke-width': 3,
                'circle-radius': 10,
                // 'circle-color': 'red',
              }
            : {
                ...PAINT_BASE,
                'circle-radius': 4,
                'circle-stroke-width': 1,
                'circle-stroke-opacity': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  12,
                  0,
                  16,
                  0.8,
                ],
                'circle-opacity': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  10,
                  0.2,
                  16,
                  0.9,
                ],
              }
        }),
        onClick: resolve.fn((ctx) => (e) => {
          const isocrona_origem_stop_id =
            ctx?.view?.conf?.data?.isocrona_origem_stop_id

          ctx.app.viewConfDispatch({
            type: 'SET_VIEW',
            payload: {
              viewConf: {
                ...ctx.view.conf,
                data: {
                  ...ctx.view.conf,
                  isocrona_origem_stop_id: isocrona_origem_stop_id
                    ? null
                    : e.properties.stop_id,
                },
              },
            },
          })
        }),
        tooltip: {
          title: [
            '$literal',
            resolve.fn((ctx) => {
              return ctx?.feature?.properties?.stop_name
            }),
          ],
          entries: [
            '$literal',
            resolve.fn((ctx) => {
              console.log(ctx.feature.properties)

              return typeof ctx.feature?.properties === 'object'
                ? Object.entries({
                    Linhas: ctx.feature.properties.routes
                      ? JSON.parse(ctx.feature.properties.routes).join(', ')
                      : null,
                    ID: ctx.feature.properties.stop_id,
                  })
                : []
            }),
          ],
        },
      },

      isocrona_origem_polygons: resolve.fn((context) => {
        const isocrona_origem_polygons_geojson =
          context?.view?.metadata?.isocrona_origem_polygons_geojson

        if (!isocrona_origem_polygons_geojson) {
          return null
        }

        return {
          source: 'isocrona_origem_polygons',
          type: 'fill',
          paint: {
            'fill-opacity': 1,
            'fill-color': [
              'match',
              ['get', 'isochrone'],
              ...ISOCHRONE_COLORS.flatMap((item) => [item.value, item.color]),
              '#CCCCCC', // fallback
            ],
          },
          // tooltip: {
          //   title: [
          //     '$literal',
          //     resolve.fn((ctx) => {
          //       return ctx?.feature?.properties?.name
          //     }),
          //   ],
          //   entries: [
          //     '$literal',
          //     resolve.fn((ctx) => {
          //       return typeof ctx.feature?.properties === 'object'
          //         ? Object.entries({
          //             'Tempo de deslocamento':
          //               ctx.feature.properties.isochrone + ' min',
          //           })
          //         : []
          //     }),
          //   ],
          // },
          legends: [
            {
              type: 'CategoricalLegend',
              title: 'Tempo de deslocamento',
              items: ISOCHRONE_COLORS,
            },
          ],
        }
      }),
      ...layers,
    },
  }
}
