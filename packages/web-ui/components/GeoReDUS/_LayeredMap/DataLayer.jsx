import { useQuery } from '@tanstack/react-query'
import { extent } from 'd3-array'
import { scaleSequential } from 'd3-scale'
import { useMemo } from 'react'
import { apiFetch, entityGql } from '@/api'
import { interpolateBlues } from 'd3-scale-chromatic'

import DeckGL from '@deck.gl/react'

import { GeoJsonLayer } from '@deck.gl/layers'

export function DataLayer({ layer }) {
  const dataQuery = useQuery({
    queryKey: ['DataLayer_data', layer],
    queryFn: async function () {
      return apiFetch(
        entityGql('InitiativeMapLayerFeature').list(
          {
            where: layer.mapLayerFeaturesWhere,
          },
          `
            properties
            geometry
          `,
        ),
      )
    },
    throwOnError: process.env.NODE_ENV !== 'production',
  })

  const colorScale = useMemo(() => {
    if (!dataQuery.data) {
      return null
    }
    return scaleSequential(
      extent(dataQuery.data, (feature) => feature.properties[layer.property]),
      interpolateBlues,
    )
  }, [dataQuery.data, layer.property])

  return dataQuery.status === 'success' ? (
    <GeoJsonLayer
      data={dataQuery.data}
      getFillColor={(feature) => {
        const rgbStr = colorScale(feature.properties[layer.property])
        const rgb = rgbStr.match(/\d+/g).map(Number) // Extract RGB components as numbers

        return [rgb[0], rgb[1], rgb[2], 255 / 2]
      }}
    />
  ) : null
}
