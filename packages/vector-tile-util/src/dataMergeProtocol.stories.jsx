import React, { useEffect, useState } from 'react'
import { ThemeProvider } from 'styled-components'

import queryString from 'query-string'

import Map, { Layer, Source } from 'react-map-gl/maplibre'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

import MaplibreInspect from '@maplibre/maplibre-gl-inspect'
import { useControl } from 'react-map-gl/maplibre'
import '@maplibre/maplibre-gl-inspect/dist/maplibre-gl-inspect.css'
import { dataMergeProtocol } from './dataMergeProtocol'

function InspectControl(props) {
  useControl(
    () =>
      new MaplibreInspect({
        ...props,
        popup: new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
        }),
      }),
    {
      // position: props.position,
    },
  )

  return null
}

const MAP_STYLE = `https://api.maptiler.com/maps/streets/style.json?key=${process.env.STORYBOOK_MAP_TILER_API_KEY}`

export default {
  title: 'dataMergeProtocol',
  decorators: [
    (Story) => (
      <ThemeProvider theme={{}}>
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
}

const { protocolHandler, memoFetchData } = dataMergeProtocol({})

maplibregl.addProtocol('custom', protocolHandler)

function _searchParams(params) {
  return queryString.stringify(
    //
    // By default, stringify non primitive values using
    // JSON.stringify before passing on to queryString,
    // as by default queryString ignores non-primitive values.
    //
    // This still allows for custom formatting, throgh the array
    // searchParams input, w/ second arg as options passed
    // to queryString
    //
    Object.fromEntries(
      Object.entries(params).map(([key, value]) => [
        key,
        typeof value === 'object' && value !== null
          ? JSON.stringify(value)
          : value,
      ]),
    ),
  )
}

const SP_BOUNDS = [
  -46.8256, // min longitude (west)
  -24.0086, // min latitude  (south)
  -46.3656, // max longitude (east)
  -23.3567, // max latitude  (north)
]

export const Basic = () => {
  const year = '2010'
  const cd_mun = '3550308'
  const variable_id = 'pop_bas_mor_tot_0_4_pct'

  const buildingsTileUrl = `https://staging-geo-vector-tile-server-de3cacd0424b.herokuapp.com/dvt/{z}/{x}/{y}?${_searchParams(
    {
      view: 'overture_br_buildings',
      select: [`setor_${year}_id`],
      where: {
        municipio_id: [cd_mun],
      },
    },
  )}`

  const sectorsTileUrl = `https://staging-geo-vector-tile-server-de3cacd0424b.herokuapp.com/dvt/{z}/{x}/{y}?${_searchParams(
    {
      select: ['cd_setor'],
      view: `ibge_malha_br_setor_censitario_${year}`,
      where: {
        cd_mun: [cd_mun],
      },
    },
  )}`

  const dataUrl = `https://dev-geoapi-metadata.orioro.design/cem_censo_${year}_rel?select=cd_setor,${variable_id}&cd_mun=eq.${cd_mun}`

  const [colorScale, setColorScale] = useState(null)

  useEffect(() => {
    ;(async () => {
      const data = await memoFetchData(dataUrl)

      const values = data.map((entry) => entry[variable_id])

      const min = Math.min(...values)
      const max = Math.max(...values)

      // Build MapLibre 'fill-color' expression
      const fillColorExpr = [
        'case',
        ['has', variable_id],
        [
          'interpolate',
          ['linear'],
          ['get', variable_id],
          min,
          'skyblue',
          max,
          'red',
        ],
        '#efefef',
      ]

      setColorScale(fillColorExpr)
    })()
  }, [])

  return (
    <Map
      initialViewState={{
        longitude: -46.6333,
        latitude: -23.5505,
        zoom: 10,
      }}
      style={{ width: '100vw', height: '100vh' }}
      mapStyle={MAP_STYLE}
    >
      <InspectControl />
      <Source
        type="vector"
        tiles={[
          `custom://{t:'${sectorsTileUrl}',d:[['cd_setor', '${dataUrl}']]}`,
        ]}
        bounds={SP_BOUNDS}
        minzoom={8}
        maxzoom={13}
      >
        <Layer
          type="fill"
          source-layer="dvt"
          paint={{
            'fill-color': colorScale || '#efefef',
            'fill-opacity': [
              'step',
              ['zoom'],
              0.8, // default (zoom < 14)
              14,
              0.2, // at zoom ≥ 14
            ],
          }}
        />
      </Source>
      <Source
        type="vector"
        tiles={[
          `custom://{t:'${buildingsTileUrl}',d:[['setor_${year}_id:cd_setor', '${dataUrl}']]}`,
        ]}
        bounds={SP_BOUNDS}
        minzoom={14}
        maxzoom={14}
      >
        <Layer
          type="fill"
          source-layer="dvt"
          paint={{
            'fill-color': colorScale || '#efefef',
            'fill-opacity': 1,
          }}
        />
      </Source>
    </Map>
  )
}
