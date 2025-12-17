import * as React from 'react'
import { Layer, Map, Source } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'

import { useQuery } from '@tanstack/react-query'

import { dsvFormat } from 'd3'
import { keyBy } from 'lodash-es'

// import { MapWindow } from './MapWindow'

export default {
  title: 'react-map-gl',
  parameters: {
    layout: 'fullscreen',
  },
}
const DATAVIZ_STYLE = `https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.STORYBOOK_MAP_TILER_API_KEY}`

export const Basic = () => {
  const dataQuery = useQuery({
    queryKey: ['Data'],
    queryFn: async () => {
      const geoJsonData = await fetch(
        'https://servicodados.ibge.gov.br/api/v4/malhas/estados/PA?formato=application/vnd.geo+json&intrarregiao=municipio&qualidade=intermediaria',
      ).then((res) => res.json())

      const alfabetizacaoDataCSV = await fetch(
        '/studies/Agregados_por_municipios_alfabetizacao_BR.csv',
      ).then((res) => res.text())

      const alfabetizacaoData = dsvFormat(',').parse(
        alfabetizacaoDataCSV,
        (entry) =>
          Object.fromEntries(
            Object.entries(entry).map(([key, value]) => [
              key,
              key.startsWith('V') ? parseFloat(value) : value,
            ]),
          ),
      )

      const alfabetizacaoDataByCdMun = keyBy(alfabetizacaoData, 'CD_MUN')

      const finalGeoJsonData = {
        ...geoJsonData,
        features: geoJsonData.features.map((feature) => {
          const featureAlfValues =
            alfabetizacaoDataByCdMun[feature.properties.codarea] || {}

          return {
            ...feature,
            properties: {
              ...feature.properties,
              ...featureAlfValues,
            },
          }
        }),
      }

      const V00644Values = finalGeoJsonData.features.map(
        (feat) => feat.properties.V00644,
      )

      const minV00644 = Math.min(...V00644Values)
      const maxV00644 = Math.max(...V00644Values)

      console.log('finalGeoJsonData', finalGeoJsonData)

      return {
        ...finalGeoJsonData,
        properties: {
          ...finalGeoJsonData.properties,
          minV00644,
          maxV00644,
        },
      }
    },
  })

  return (
    <Map
      initialViewState={{
        latitude: -1.455833,
        longitude: -48.503887,
        zoom: 10,
      }}
      style={{ width: '100vw', height: '100vh' }}
      mapStyle={DATAVIZ_STYLE}
    >
      {dataQuery.status === 'success' && (
        <>
          <Source id="municipios" type="geojson" data={dataQuery.data} />

          <Source id="municipios" type="geojson" data={dataQuery.data} />

          <Layer
            type="fill"
            source="municipios"
            paint={{
              'fill-opacity': 0.5,
              // 'fill-color': [
              //   'case',
              //   [
              //     'all',
              //     ['>=', ['get', 'V00644'], 0],
              //     ['<', ['get', 'V00644'], 1000],
              //   ],
              //   'magenta',
              //   [
              //     'all',
              //     ['>=', ['get', 'V00644'], 1000],
              //     ['<', ['get', 'V00644'], 5000],
              //   ],
              //   'purple',
              //   [
              //     'all',
              //     ['>=', ['get', 'V00644'], 5000],
              //     ['<', ['get', 'V00644'], 10000],
              //   ],
              //   'red',
              //   'green',
              // ],

              // 'fill-color': [
              //   'step',
              //   ['get', 'V00644'],
              //   'magenta',
              //   100,
              //   'purple',
              //   5000,
              //   'red',
              //   10000,
              //   'green',
              // ],

              'fill-color': [
                'interpolate',
                ['linear'],
                ['get', 'V00644'],
                dataQuery.data.properties.minV00644,
                'white',
                dataQuery.data.properties.maxV00644,
                'green',
              ],
            }}
          />
          <Layer
            type="line"
            source="municipios"
            paint={{
              'line-color': 'green',
              'line-width': 2,
              // 'line-dasharray' can be combined with 'line-gradient'
              'line-dasharray': [2, 2],
            }}
            layout={{
              'line-cap': 'round',
              'line-join': 'round',
            }}
          />
        </>
      )}
    </Map>
  )
}
