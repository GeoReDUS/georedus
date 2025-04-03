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
