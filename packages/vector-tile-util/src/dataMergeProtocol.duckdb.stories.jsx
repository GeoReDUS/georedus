import React, { useEffect, useState } from 'react'
import { ThemeProvider } from 'styled-components'

import queryString from 'query-string'

import Map, { Layer, Source } from 'react-map-gl/maplibre'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

import MaplibreInspect from '@maplibre/maplibre-gl-inspect'
import { useControl } from 'react-map-gl/maplibre'
import '@maplibre/maplibre-gl-inspect/dist/maplibre-gl-inspect.css'
import { dataMergeProtocol, makeMemoFetch } from './dataMergeProtocol'

import { uniq } from 'lodash-es'
import { duckQuery } from './duckdb'

// http://localhost:6006/censo/2022_tracts_Basico_v0.5.0.parquet
// http://localhost:6006/censo/2022_tracts_Domicilio_v0.5.0.parquet
// http://localhost:6006/censo/2022_tracts_Entorno_v0.5.0.parquet
// http://localhost:6006/censo/2022_tracts_Indigenas_v0.5.0.parquet
// http://localhost:6006/censo/2022_tracts_Obitos_v0.5.0.parquet
// http://localhost:6006/censo/2022_tracts_Pessoas_v0.5.0.parquet
// http://localhost:6006/censo/2022_tracts_Preliminares_v0.5.0.parquet
// http://localhost:6006/censo/2022_tracts_Quilombolas_v0.5.0.parquet
// http://localhost:6006/censo/2022_tracts_ResponsavelRenda_v0.5.0.parquet

duckQuery(`
  SELECT
    *
    -- ST_Area(geom) AS area,
    -- ST_Centroid(geom) AS centroid,
    -- ST_AsGeoJSON(ST_Centroid(geom)) AS centroid_geojson 
  FROM
    'http://localhost:6006/censo/35census_tract_2020_simplified.parquet'
  LIMIT 10;
`).then((d) => {
  console.log(d[0])
})

// duckQuery(`
//   SELECT *
//   FROM 'http://localhost:6006/censo/2022_tracts_Basico_v0.5.0.parquet'
//   WHERE code_muni = 3550308;
// `).then((d) => {
//   console.log(Object.keys(d[0]))
// })

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
  title: 'dataMergeProtocol / duckdb',
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

const { protocolHandler, memoFetchData } = dataMergeProtocol({
  memoFetchData: async (query) => {
    const result = await duckQuery(atob(query))

    return result
  },
})

maplibregl.addProtocol('ducktiles', protocolHandler)

function _searchParams(params) {
  return queryString.stringify(
    //
    // By default, stringify non primitive values using
    // JSON.stringify before passing on to queryString,
    // AS by default queryString ignores non-primitive values.
    //
    // This still allows for ducktiles formatting, throgh the array
    // searchParams input, w/ second arg AS options passed
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

const QUERY_PRESETS = {}
QUERY_PRESETS.idade = `SELECT
  b.code_tract AS code_tract,
  (
    (
      p.demografia_V01013 + -- Sexo masculino, 20 a 24 anos
      p.demografia_V01014 + -- Sexo masculino, 25 a 29 anos
      p.demografia_V01015 + -- Sexo masculino, 30 a 39 anos
      p.demografia_V01024 + -- Sexo feminino, 20 a 24 anos
      p.demografia_V01025 + -- Sexo feminino, 25 a 29 anos
      p.demografia_V01026   -- Sexo feminino, 30 a 39 anos
    )
    /
    b.V0001 -- Total de pessoas
  ) AS map_color_value
FROM
  'http://localhost:6006/censo/2022_tracts_Basico_v0.5.0.parquet' AS b
JOIN
  'http://localhost:6006/censo/2022_tracts_Pessoas_v0.5.0.parquet' AS p
ON b.code_tract = p.code_tract
WHERE b.code_muni = 3550308;`

QUERY_PRESETS.densidade = `WITH base AS (
  SELECT
    m.code_tract,
    m.geom,
    b.V0001 AS hab, -- total de pessoas
    (b.V0001 / ST_Area(m.geom)) AS hab_km2
  FROM
    'http://localhost:6006/censo/35census_tract_2020_simplified.parquet' AS m
  JOIN
    'http://localhost:6006/censo/2022_tracts_Basico_v0.5.0.parquet' AS b
  ON m.code_tract = b.code_tract
  WHERE b.code_muni = 3550308
)
SELECT
  *,
  NTILE(5) OVER (ORDER BY hab_km2)::INT AS map_color_value
FROM base;`

export const Basic = () => {
  const [liveSqlQuery, setLiveSqlQuery] = useState(QUERY_PRESETS.densidade)

  const [appliedSqlQuery, setAppliedSqlQuery] = useState(liveSqlQuery)

  const year = '2022'
  const cd_mun = '3550308'
  // const variable_id = 'V0001'

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

  const dataUrl = btoa(appliedSqlQuery)

  const [colorScale, setColorScale] = useState(null)

  useEffect(() => {
    ;(async () => {
      const data = await memoFetchData(dataUrl)

      const values = data.map((entry) => entry.map_color_value)
      const nonEmptyValues = values.filter(
        (v) => typeof v === 'number' && !Number.isNaN(v),
      )

      const min = Math.min(...nonEmptyValues)
      const max = Math.max(...nonEmptyValues)
      console.log('values', { min, max }, values, nonEmptyValues)

      // Build MapLibre 'fill-color' expression
      const fillColorExpr = [
        'case',
        ['has', 'map_color_value'],
        [
          'interpolate',
          ['linear'],
          ['get', 'map_color_value'],
          min,
          'skyblue',
          max,
          'red',
        ],
        '#efefef',
      ]

      setColorScale(fillColorExpr)
    })()
  }, [dataUrl])

  return (
    <div>
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
            `ducktiles://{t:'${sectorsTileUrl}',d:[['cd_setor:code_tract', '${dataUrl}']]}`,
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
              'fill-opacity': 1,
              // 'fill-opacity': [
              //   'step',
              //   ['zoom'],
              //   0.8, // default (zoom < 14)
              //   14,
              //   0.2, // at zoom ≥ 14
              // ],
            }}
          />
        </Source>
        <Source
          type="vector"
          tiles={[
            `ducktiles://{t:'${buildingsTileUrl}',d:[['setor_${year}_id:cd_setor', '${dataUrl}']]}`,
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
      <form
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          position: 'fixed',
          bottom: 10,
          left: 10,
          width: 'calc(100% - 20px)',
          maxWidth: 600,
          boxSizing: 'border-box',
        }}
        onSubmit={(e) => {
          e.preventDefault()

          setAppliedSqlQuery(liveSqlQuery)
        }}
      >
        <select
          style={{
            marginBottom: 10,
          }}
          onChange={(e) => {
            setLiveSqlQuery(e.target.value)
          }}
        >
          <option>---</option>
          {Object.entries(QUERY_PRESETS).map(([key, value]) => (
            <option value={value}>{key}</option>
          ))}
        </select>
        <textarea
          style={{
            height: 300,
            width: '100%',
            boxSizing: 'border-box',
            padding: 10,
            color: 'white',
            background: 'black',
            marginBottom: 10,
          }}
          value={liveSqlQuery}
          onChange={(e) => {
            setLiveSqlQuery(e.target.value)
          }}
        />
        <button type="submit">Aplicar</button>
      </form>
    </div>
  )
}
