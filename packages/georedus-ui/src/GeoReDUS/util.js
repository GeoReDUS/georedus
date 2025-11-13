//
// TODO: update version after fix in import
// Currently locked at 2.0.0
// https://github.com/mapbox/tilebelt/pull/50
//
import { pointToTile, tileToBBOX } from '@mapbox/tilebelt'

export function getDeviceLocation(options = {}) {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      return reject(new Error('Geolocation not supported'))
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      (err) => {
        console.error(err)
        resolve(null)
      },
      options,
    )
  })
}

async function coordinatesFromDeviceLocation() {
  const deviceLocation = await getDeviceLocation()

  return deviceLocation
    ? [deviceLocation.coords.longitude, deviceLocation.coords.latitude]
    : null
}

async function coordinatesFromIp() {
  try {
    const ipInfo = await fetch('/api/georedus/ipInfo').then((r) => r.json())

    return ipInfo ? [ipInfo.lon, ipInfo.lat] : null
  } catch (err) {
    console.error(err)
    return null
  }
}

export async function resolveInitialMunicipioId({
  METADATA_API_ENDPOINT,
  coordinates,
  defaultCoordinates,
}) {
  coordinates =
    coordinates ||
    // (await coordinatesFromIp()) ||
    (await coordinatesFromDeviceLocation()) ||
    defaultCoordinates

  if (!coordinates) {
    return null
  }

  return fetch(
    `${METADATA_API_ENDPOINT}/rpc/get_intersecting_ibge_malha_br_municipio`,
    {
      method: 'POST',
      body: JSON.stringify({
        input_geojson: {
          type: 'Point',
          coordinates,
        },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
    .then((res) => res.json())
    .then((municipios) => (municipios.length > 0 ? municipios[0].id : null))
}

/**
 * Returns a bbox covering the 3×3 grid of tiles around the tile that contains
 * (lng, lat) at the given zoom. Useful for limiting map bounds or prefetching.
 *
 * TILE LAYOUT (center tile is x,y):
 *
 *      +---------+---------+---------+
 *      | x-1,y-1 |  x,y-1  | x+1,y-1 |
 *      +---------+---------+---------+
 *      | x-1,y   |  x,y    | x+1,y   |
 *      +---------+---------+---------+
 *      | x-1,y+1 |  x,y+1  | x+1,y+1 |
 *      +---------+---------+---------+
 *
 * Returns: [minLng, minLat, maxLng, maxLat]
 */
export function getSurroundingTilesBbox(lng, lat, zoom) {
  // Tile under center point
  const [x, y] = pointToTile(lng, lat, zoom)

  let minLng = Infinity
  let minLat = Infinity
  let maxLng = -Infinity
  let maxLat = -Infinity

  // 3×3 block of tiles around the center tile
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const tile = [x + dx, y + dy, zoom]
      const bbox = tileToBBOX(tile)

      minLng = Math.min(minLng, bbox[0])
      minLat = Math.min(minLat, bbox[1])
      maxLng = Math.max(maxLng, bbox[2])
      maxLat = Math.max(maxLat, bbox[3])
    }
  }

  return [minLng, minLat, maxLng, maxLat]
}
