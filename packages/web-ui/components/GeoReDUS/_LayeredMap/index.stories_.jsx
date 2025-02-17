import React, { useMemo, useState } from 'react'
import DeckGL from '@deck.gl/react'
import { MapView } from '@deck.gl/core'
import { GeoJsonLayer } from '@deck.gl/layers'
import { Map } from 'react-map-gl/maplibre'
import { apiFetch, entityGql } from '@/api'

import { useQuery } from '@tanstack/react-query'
import { interpolateBlues } from 'd3-scale-chromatic'
import { extent } from 'd3-array'
import { scaleSequential } from 'd3-scale'
import { LayeredMap } from '.'

export default {
  title: 'GeoReDUS / LayeredMap',
}

const INITIAL_VIEW_STATE = {
  longitude: -48.503887,
  latitude: -1.455833,
  zoom: 13,
}

export const Basic = () => {
  const dataQuery = useQuery({
    queryKey: ['Test'],
    queryFn: async () => {
      return apiFetch(
        entityGql('InitiativeMapLayerFeature').list(
          {
            where: {
              properties: {
                indexSchema: {
                  string_0: 'cd_geocodi', // id
                  string_1: 'cd_geocods', // cod_subdistrito
                  string_2: 'cod_distrito',
                  string_3: 'cod_bairro',
                  string_4: 'cod_municipio',
                  string_5: 'cod_uf',
                  string_6: 'tipo',
                },
                value: {
                  cod_municipio: '1501402',
                },
              },
            },
          },
          ['properties', 'geometry'].join('\n'),
        ),
      )
    },
  })

  const [property, setProperty] = useState('ent_esg_mor_tot_dom')

  const colorScale = useMemo(() => {
    if (!dataQuery.data) {
      return null
    }
    return scaleSequential(
      extent(dataQuery.data, (feature) => feature.properties[property]),
      interpolateBlues,
    )
  }, [dataQuery.data, property])

  return (
    <DeckGL initialViewState={INITIAL_VIEW_STATE} controller>
      {dataQuery.status === 'success' && (
        <GeoJsonLayer
          data={dataQuery.data}
          getFillColor={(feature) => {
            const rgbStr = colorScale(feature.properties[property])
            const rgb = rgbStr.match(/\d+/g).map(Number) // Extract RGB components as numbers

            return [rgb[0], rgb[1], rgb[2], 255 / 2]
          }}
        />
      )}

      <MapView controller>
        <Map
          // mapStyle="mapbox://styles/mapbox/light-v9"
          mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.NEXT_PUBLIC_MAP_TILER_API_KEY}`}
        />
      </MapView>

      {/*<FirstPersonView width="50%" x="50%" fovy={50} />*/}
    </DeckGL>
  )
}

export const Basic2 = () => {
  return (
    <LayeredMap
      layers={['1501402', '1500800'].map((cod_municipio) => ({
        id: cod_municipio,
        type: 'sequential_choropleth',
        property: 'ent_esg_mor_tot_dom',
        label: 'Presença de esgotamento a céu aberto',
        mapLayerFeaturesWhere: {
          mapLayer: {
            id: {
              equals: 'a141eb25-94e7-4351-b083-024f650c0b05',
            },
          },
          properties: {
            indexSchema: {
              string_0: 'cd_geocodi', // id
              string_1: 'cd_geocods', // cod_subdistrito
              string_2: 'cod_distrito',
              string_3: 'cod_bairro',
              string_4: 'cod_municipio',
              string_5: 'cod_uf',
              string_6: 'tipo',
            },
            value: {
              cod_municipio: cod_municipio,
            },
          },
        },
      }))}
    />
  )
}
