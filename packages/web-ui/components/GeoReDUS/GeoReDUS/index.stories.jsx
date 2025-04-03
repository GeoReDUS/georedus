import { useEffect, useState } from 'react'
import { GeoReDUS } from './GeoReDUS'

import { versionedData } from '@orioro/versioned-data'

export default {
  title: 'GeoReDUS / GeoReDUS',
  parameters: {
    layout: 'fullscreen',
  },
}

const VERSION_SPECS = [
  {
    id: '2025_04',
    fromPrev: (prev) => prev || {},
    fromNext: (next) => next || {},
  },
  {
    id: '2025_04_2',
    fromPrev: ({ municipioId, ...rest }) => ({
      ...rest,
      m: municipioId,
    }),
    fromNext: (next) => next || {},
  },
]

const parseStateVersion = versionedData(VERSION_SPECS)

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item !== null ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {}
  }, [key, value])

  return [value, setValue]
}

export const Basic = () => {
  const [stateStorage, setStateStorage] = useLocalStorage(
    'T',
    parseStateVersion(),
  )

  console.log(stateStorage, parseStateVersion(stateStorage))

  return (
    <GeoReDUS
      state={parseStateVersion(stateStorage).data}
      onSetState={(nextState) =>
        setStateStorage({
          version: VERSION_SPECS[VERSION_SPECS.length - 1].id,
          data: nextState,
        })
      }
      api={{
        METADATA_API_ENDPOINT: process.env.STORYBOOK_GEO_METADATA_API_ENDPOINT,
        VECTOR_TILE_SERVER_ENDPOINT:
          process.env.STORYBOOK_GEO_VECTOR_TILE_SERVER_ENDPOINT,
      }}
    />
  )
}
