import { resolve, resolveAsync } from '@orioro/resolve'
import { get } from '@orioro/get'
import { fetchDataForHex } from './fetchDataForHex'
import { cellToBoundary, cellsToMultiPolygon, latLngToCell } from 'h3-js'
import { GEOREDUS_COLOR_SCHEMES } from '../../util'

export const SOURCE_LAYER_ID = 'cem_malha_hex_res9.geom'

function _cursorGeometry({ id, hexId, properties = {} }) {
  const boundary = cellToBoundary(hexId, true)

  return {
    type: 'Feature',
    id,
    properties: {
      id,
      ...properties,
    },
    geometry: {
      type: 'Polygon',
      // GeoJSON polygons must be closed (first point === last point)
      coordinates: [[...boundary, boundary[0]]],
    },
  }
}

async function _fetchMunCentroidHex({ METADATA_API_ENDPOINT, municipioId }) {
  const [mun] = await fetch(
    `${METADATA_API_ENDPOINT}/ibge_malha_br_municipio?select=centroid&id=eq.${municipioId}`,
  ).then((res) => res.json())

  const coords = mun?.centroid?.coordinates

  if (!coords) return null

  return latLngToCell(coords[1], coords[0], 9)
}

export function sources(viewSpec, allViewSpecs, context) {
  const { VECTOR_TILE_SERVER_ENDPOINT, METADATA_API_ENDPOINT } = context

  return resolveAsync.fn(async (ctx) => {
    //
    // Resolve municipio centroid
    //
    const clickedHexFromId = get(ctx, 'view.conf.data.clickedHexFromId')
    const hoveredHexFromId = get(ctx, 'view.conf.data.hoveredHexFromId')

    const hexFromId =
      clickedHexFromId ||
      hoveredHexFromId ||
      (await _fetchMunCentroidHex({
        METADATA_API_ENDPOINT,
        municipioId: ctx.app.municipioId,
      }))

    let nextStateById

    try {
      nextStateById = hexFromId
        ? await fetchDataForHex({
            METADATA_API_ENDPOINT,
            hexId: hexFromId,
          })
        : {}
    } catch (err) {
      nextStateById = {}
    }

    const travelTimeBoundary = get(ctx, 'view.conf.data.travelTimeBoundary')

    const ttBoundaryHexIds =
      clickedHexFromId && travelTimeBoundary
        ? Object.keys(nextStateById).filter((hexId) => {
            return nextStateById[hexId].t <= travelTimeBoundary
          })
        : null

    const ttBoundaryPolygon =
      Array.isArray(ttBoundaryHexIds) && ttBoundaryHexIds.length > 0
        ? {
            type: 'Feature',
            properties: {
              'line-color': GEOREDUS_COLOR_SCHEMES.schemeGeoReDUS.roxo,
            },
            geometry: {
              type: 'MultiPolygon',
              coordinates: cellsToMultiPolygon(ttBoundaryHexIds, true),
            },
          }
        : null

    return {
      main: {
        promoteId: 'id',
        type: 'vector',
        minzoom: 9,

        tiles: [
          `${VECTOR_TILE_SERVER_ENDPOINT}/${SOURCE_LAYER_ID}/{z}/{x}/{y}`,
        ],

        featureState: {
          sourceLayer: SOURCE_LAYER_ID,
          stateById: resolve.literal(nextStateById),
        },
      },

      cursors: {
        type: 'geojson',
        data: resolve.fn((ctx) => {
          const clickedHexFromId = get(ctx, 'view.conf.data.clickedHexFromId')
          const hoveredHexFromId = get(ctx, 'view.conf.data.hoveredHexFromId')

          return {
            type: 'FeatureCollection',
            features: [
              hoveredHexFromId
                ? _cursorGeometry({
                    id: 'cursor_hovered',
                    hexId: hoveredHexFromId,
                    properties: {
                      'fill-color': GEOREDUS_COLOR_SCHEMES.schemeGeoReDUS.rosa,
                    },
                  })
                : null,
              clickedHexFromId
                ? _cursorGeometry({
                    id: 'cursor_clicked',
                    hexId: clickedHexFromId,
                    properties: {
                      'fill-color': GEOREDUS_COLOR_SCHEMES.schemeGeoReDUS.roxo,
                    },
                  })
                : null,
              ttBoundaryPolygon,
            ].filter(Boolean),
          }
        }),
      },
    }
  })
}
