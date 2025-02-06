import React, { useCallback } from 'react'
import { AsyncSelectInput } from '@orioro/react-select'

import qs from 'query-string'

export function Geocoder({}) {
  // const [localVa]

  const searchOptions = useCallback(async (searchText: string) => {
    if (searchText.length < 3) {
      return []
    }

    console.log('will fetch ', searchText)

    const res = await fetch(
      `https://api.mapbox.com/search/searchbox/v1/suggest?${qs.stringify({
        q: searchText,
        access_token: process.env.STORYBOOK_MAPBOX_ACCESS_TOKEN,
        session_token: crypto.randomUUID(),
      })}`,
    ).then((res) => res.json())

    return res.suggestions.map((suggestion) => ({
      label: `${suggestion.name} - ${suggestion.place_formatted}`,
      value: suggestion.mapbox_id,
    }))
  }, [])

  return (
    <AsyncSelectInput
      placeholder="Pesquise por cidade"
      searchOptions={searchOptions}
    />
  )
}
