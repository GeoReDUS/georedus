import { useQuery } from '@tanstack/react-query'
import { extent } from 'd3-array'
import { scaleQuantile, scaleSequential } from 'd3-scale'
import { useMemo } from 'react'
import { apiFetch, entityGql } from '@/api'
import { interpolateYlOrRd, schemeYlOrRd } from 'd3-scale-chromatic'
import { useQueries } from '@tanstack/react-query'
import { GeoJsonLayer } from '@deck.gl/layers'
import { fetchAllPages } from '@orioro/util'

export function useDataLayers({ layers }) {
  const layerDataQueries = useQueries({
    queries: layers.map((layer) => ({
      queryKey: ['DataLayer_data', layer],
      queryFn: async function () {
        const features = await fetchAllPages({
          fetchPage: async ({ offset, pageSize }) => {
            const pageFeatures = await apiFetch(
              entityGql('InitiativeMapLayerFeature').list(
                {
                  where: layer.mapLayerFeaturesWhere,
                  skip: offset,
                  take: pageSize,
                },
                `
                  properties
                  geometry
                `,
              ),
            )

            return pageFeatures
          },
          pageSize: 400,
        })

        return {
          layer,
          features,
        }
      },
    })),
    throwOnError: process.env.NODE_ENV !== 'production',
  })

  return layerDataQueries
}
