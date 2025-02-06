import qs from 'query-string'

export type MapboxGeocoderApiProps = {
  accessToken: string
}

function _qsFromConfig(
  {
    query,
    accessToken,
    sessionToken,

    language,
    countries,
    types,
    bbox,
    limit,
    proximity,
    reverseMode,
  }: MaplibreGeocoderApiConfig & {
    accessToken: string
    sessionToken: string
  },
  other: Record<string, any> = {},
) {
  return qs.stringify(
    {
      q: query,
      types,
      bbox,
      limit,
      country: countries,
      proximity,
      language: Array.isArray(language) ? language[0] : language,
      access_token: accessToken,
      session_token: sessionToken,

      ...other,
    },
    {
      arrayFormat: 'comma',
    },
  )
}

// function _qsFromConfig(): string {
//   return qs.stringify({
//     // ...rest,
//     access_token: accessToken,
//     session_token: sessionToken,
//     q: query,
//   })
// }

export function mapboxGeocoderApi({ accessToken }: MapboxGeocoderApiProps) {
  const sessionToken = crypto.randomUUID()

  // function _apiEnd

  async function forwardGeocode(input) {
    console.log('forwardGeocode', input)
  }

  async function reverseGeocode(input) {
    console.log('reverseGeocode', input)
  }

  async function searchByPlaceId({
    query,
    language,
  }: MaplibreGeocoderApiConfig): Promise<MaplibreGeocoderPlaceResults> {
    //
    // View docs:
    // https://docs.mapbox.com/api/search/search-box/#retrieve-a-suggested-feature
    // - access_token
    // - session_token
    //
    // - language
    // - eta_type
    // - navigation_profile
    // - origin
    //
    const res = await fetch(
      `https://api.mapbox.com/search/searchbox/v1/retrieve/${query}?${_qsFromConfig(
        {
          language,
          accessToken,
          sessionToken,
        },
      )}`,
    ).then((res) => res.json())

    const place = res.features[0]

    const properties = place.properties

    return {
      ...res,
      place: {
        ...place,
        id: properties.mapbox_id,
        text: `${properties.name} - ${properties.place_formatted}`,
        language: properties.language,
        place_name: properties.name,
        place_type: [properties.feature_type],
        bbox: properties.bbox,
      },
    }
    /*
    return res

    console.log('searchByPlaceId', res.features)

    return {
      place: res.features
      // place: ,
    }*/
  }

  async function getSuggestions(
    config
  ): any {
    // https://docs.mapbox.com/api/search/search-box/
    const res = await fetch(
      `https://api.mapbox.com/search/searchbox/v1/suggest?${_qsFromConfig({
        ...config,
        accessToken,
        sessionToken,
      })}`,
    ).then((res) => res.json())

    return res
  }

  return {
    forwardGeocode,
    reverseGeocode,
    getSuggestions,
    searchByPlaceId,
  }
}
