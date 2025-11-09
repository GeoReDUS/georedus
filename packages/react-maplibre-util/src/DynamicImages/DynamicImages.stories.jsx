import { InspectControl } from '../Controls'
import { LayeredMap } from '../LayeredMap'
import '@maplibre/maplibre-gl-inspect/dist/maplibre-gl-inspect.css'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useHover } from '../useHover'

import { DynamicImages } from './DynamicImages'
import { svgIconGenerator, svgIconId } from './svgImages'
import {
  mdiBusSign,
  mdiForest,
  mdiHospital,
  mdiMapMarkerCircle,
  mdiParking,
  mdiSchool,
} from '@mdi/js'
import { useMemo } from 'react'

export default {
  title: 'DynamicImages',
  parameters: {
    layout: 'fullscreen',
  },
}

const MAP_STYLE = `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.STORYBOOK_MAP_TILER_API_KEY}`

const FEATURES = [
  {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-46.6333, -23.5505],
    },
    properties: { category: 'forest' },
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-46.6343, -23.5515],
    },
    properties: { category: 'hospital' },
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-46.6353, -23.5505],
    },
    properties: { category: 'parking' },
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-46.6353, -23.5495],
    },
    properties: { category: 'parking' },
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-46.6333, -23.5525],
    },
    properties: { category: 'bus' },
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-46.6323, -23.5505],
    },
    properties: { category: 'school' },
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-46.6313, -23.5505],
    },
    properties: { category: 'unknown' },
  },
].map((feat, index) => ({ ...feat, id: index }))

const MAP_ICONS = svgIconGenerator({
  mdiForest,
  mdiParking,
  mdiBusSign,
  mdiHospital,
  mdiSchool,
  mdiMapMarkerCircle,
})

export const Basic = () => {
  //
  // Hover stuff
  //
  const [{ children: hoverChildren, ...hoverProps }, hoverInfo, isDragging] =
    useHover({}, [])

  return (
    <LayeredMap
      {...hoverProps}
      initialViewState={{
        latitude: -23.5505,
        longitude: -46.6333,
        zoom: 14,
      }}
      style={{
        height: '100vh',
        width: '100vw',
      }}
      mapStyle={MAP_STYLE}
      views={[
        {
          id: 'test',
          sources: {
            test: {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: FEATURES,
              },
            },
          },
          layers: {
            circle: {
              interactive: true,
              source: 'test',
              type: 'circle',
              paint: {
                'circle-radius': 20,
                'circle-color': [
                  'case',
                  ['boolean', ['feature-state', 'hover'], false],
                  'blue',
                  'green',
                ],
              },
            },
            symbol: {
              source: 'test',
              type: 'symbol',
              layout: {
                // 'icon-image': [
                //   'match',
                //   ['get', 'category'],
                //   'forest',
                //   MAP_ICONS.mdiForest({
                //     fill: 'white',
                //   }),
                //   'hospital',
                //   MAP_ICONS.mdiHospital({
                //     fill: 'white',
                //   }),
                //   'parking',
                //   'mdiParking({fill:"white"})',
                //   'bus',
                //   'mdiBusSign({fill:"white"})',
                //   'school',
                //   'mdiSchool({fill:"white"})',
                //   'mdiMapMarkerCircle({fill:"white"})', // fallback
                // ],

                // By default, MapLibre parses `{}` inside strings as legacy token expressions.
                // That behavior would cause parts of our icon name to be stripped when using dynamic SVG names.
                // Using an expression with `["literal", value]` disables token parsing entirely,
                // ensuring the icon-image string is used exactly as provided.
                'icon-image': ['literal', 'mdiSchool({"fill":"white"})'],

                'icon-size': 0.8,
              },
            },
          },
        },
      ]}
    >
      <DynamicImages onGenerateImage={MAP_ICONS} />
      <InspectControl />
    </LayeredMap>
  )
}
