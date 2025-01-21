import React, { useEffect, useState } from 'react'
import Map, {
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
  Layer,
  Source,
} from '@vis.gl/react-maplibre'
import 'maplibre-gl/dist/maplibre-gl.css' // See notes below

import { ckmeans } from 'simple-statistics'

import { MapView } from './MapView'

// import 'maplibre-gl/dist/maplibre-gl.css'

// import { Meta } from '@storybook/react'
// import { Component } from './index'
// import { ThemeProvider } from 'styled-components'

const meta = {
  title: 'Component',
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

const cem_censo_2010 = 'cem_censo_2010'

const DATA_LAYER_SPEC = {
  // id: 'cem_censo_2010',
  dataSourceId: 'cem_censo_2010',
  propertyId: 'dom_mor_dom_tot_pro',
  sources: [
    {
      id: cem_censo_2010,
      type: 'vector',
      tiles: [`http://localhost:6002/${cem_censo_2010}/{z}/{x}/{y}`],
      minzoom: 10,
      maxzoom: 20,
    },
    {
      id: 'ibge_br_municipio',
      type: 'vector',
      tiles: [`http://localhost:6002/ibge_br_municipio/{z}/{x}/{y}`],
      minzoom: 10,
      maxzoom: 20,
    },
  ],
  layers: [
    {
      // id: `${id}_fill`,
      source: cem_censo_2010,
      'source-layer': cem_censo_2010,
      type: 'fill',
      paint: {
        'fill-color': [
          'step',
          750,
          // ['get', 'point_count'],
          '#51bbd6',
          100,
          '#f1f075',
          750,
          '#f28cb1',
        ],

        // 'fill-color': '#ff0000',
        'fill-opacity': 0.5,
        'fill-outline-color': '#000000',
        // 'line-color': 'steelblue',
        // 'line-width': 3,
        // 'line-opacity': 1
      },
    },
    {
      source: cem_censo_2010,
      'source-layer': cem_censo_2010,
      type: 'line',
      paint: {
        'line-color': '#000000', // Line color
        'line-width': 1, // Line width
        // 'line-dasharray': [2, 4], // Dash pattern
      },
    },
    {
      source: 'ibge_br_municipio',
      'source-layer': 'ibge_br_municipio',
      type: 'line',
      paint: {
        'line-color': '#FF0000', // Line color
        'line-width': 3, // Line width
        // 'line-dasharray': [2, 4], // Dash pattern
      },
    },
  ],
}

const METADATA_API_ENDPOINT = `http://localhost:6001`

async function resolveDataLayer(dataLayerSpec, context) {
  //
  //
  // do stuff here
  //
  //

  const { codMunicipio } = context
  const { dataSourceId, propertyId } = dataLayerSpec

  const URL = `${METADATA_API_ENDPOINT}/${dataSourceId}?cod_municipio=eq.${codMunicipio}&select=${propertyId}`
  const propertyValues = (await fetch(URL).then((res) => res.json())).map(
    (entry) => entry[propertyId],
  )

  const colorScale = ['#FFFFFF', '#EEEEEE', '#DDDDDD', '#CCCCCC', '#BBBBBB']

  const groups = ckmeans(propertyValues, colorScale.length)
  const bounds = groups.map((group) => [group[0], group[group.length - 1]])

  console.log(bounds)

  const colorStepExpr = [
    'step',
    ['get', propertyId],

    ...bounds
      .map(([min, max], index) => {
        const color = colorScale[index]

        return index === 0 ? [color] : [min, color]
      })
      .flat(1),

    // '#51bbd6',
    // 100,
    // '#f1f075',
    // 750,
    // '#f28cb1',
  ]

  console.log(colorStepExpr)

  const filterExpr = [
    'any',
    ['==', ['get', 'cod_municipio'], codMunicipio],
    ['==', ['get', 'id'], codMunicipio],
  ]

  //
  const dataLayer = {
    ...dataLayerSpec,
    layers: [
      {
        ...dataLayerSpec.layers[0],
        filter: filterExpr,
        paint: {
          ...dataLayerSpec.layers[0].paint,
          'fill-color': colorStepExpr,
        },
      },
      ...dataLayerSpec.layers.slice(1).map((layer) => ({
        ...layer,
        filter: filterExpr,
      })),
    ],
  }

  return dataLayer
}

export const Basic = () => {
  const [codMunicipio, setCodMunicipio] = useState('1501402')

  const [activeDataLayerSpec, setActiveDataLayerSpec] =
    useState(DATA_LAYER_SPEC)

  const [dataLayer, setDataLayer] = useState(null)

  useEffect(() => {
    resolveDataLayer(activeDataLayerSpec, {
      codMunicipio,
    }).then((dl) => setDataLayer(dl))
  }, [activeDataLayerSpec, codMunicipio])

  const LAYER_ID = 'cem_censo_2010'
  const id = LAYER_ID

  return (
    <Map
      initialViewState={{
        latitude: -1.455833,
        longitude: -48.503887,
        zoom: 10,
      }}
      style={{ width: '100vw', height: '100vh' }}
      mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.STORYBOOK_MAP_TILER_API_KEY}`}
    >
      <GeolocateControl position="top-right" />
      <FullscreenControl position="top-right" />
      <NavigationControl position="top-right" />
      <ScaleControl />

      {dataLayer && <MapView {...dataLayer} />}
    </Map>
  )
}

export const Basic2 = () => {
  return (
    <Map
      initialViewState={{
        latitude: -1.455833,
        longitude: -48.503887,
        zoom: 10,
      }}
      style={{ width: '100vw', height: '100vh' }}
      mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.STORYBOOK_MAP_TILER_API_KEY}`}
    >
      <GeolocateControl position="top-right" />
      <FullscreenControl position="top-right" />
      <NavigationControl position="top-right" />
      <ScaleControl />
      <MapView
        sources={[
          {
            id: 'municipio',
            type: 'vector',
            tiles: [
              'http://localhost:6002/public_read_api.ibge_malha_br_municipio.geom,' +
                'public_read_api.ibge_malha_br_municipio.centroid' +
                '/{z}/{x}/{y}',
            ],
          },
          {
            id: 'bairro',
            type: 'vector',
            tiles: [
              'http://localhost:6002/public_read_api.ibge_malha_br_bairro.geom,' +
                'public_read_api.ibge_malha_br_bairro.centroid' +
                '/{z}/{x}/{y}',
            ],
          },
        ]}
        layers={[
          {
            source: 'municipio',
            'source-layer': 'public_read_api.ibge_malha_br_municipio.geom',
            type: 'line',
            paint: {
              'line-color': '#FF0000', // Line color
              'line-width': 1, // Line width
              // 'line-dasharray': [2, 4], // Dash pattern
            },
          },
          {
            source: 'municipio',
            'source-layer': 'public_read_api.ibge_malha_br_municipio.centroid',
            type: 'circle',
            paint: {
              'circle-color': '#00FF00',
              'circle-radius': 5,
              // 'line-color': '#FF0000', // Line color
              // 'line-width': 3, // Line width
              // 'line-dasharray': [2, 4], // Dash pattern
            },
            minzoom: 6
          },
          {
            id: 'poi-labels',
            type: 'symbol',
            source: 'municipio',
            'source-layer': 'public_read_api.ibge_br_municipio.centroid',
            layout: {
              'text-field': ['get', 'area'],
              'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
              'text-radial-offset': 0.5,
              'text-justify': 'auto',
              'icon-image': ['concat', ['get', 'icon'], '_15'],
            },
          },

          {
            source: 'bairro',
            'source-layer': 'public_read_api.ibge_malha_br_bairro.geom',
            type: 'line',
            paint: {
              'line-color': '#0000FF', // Line color
              'line-width': 3, // Line width
              // 'line-dasharray': [2, 4], // Dash pattern
            },
            minzoom: 8
          },
        ]}
      />
    </Map>
  )
}
