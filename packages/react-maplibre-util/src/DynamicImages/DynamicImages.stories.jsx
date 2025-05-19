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

const MAP_STYLE = `https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.STORYBOOK_MAP_TILER_API_KEY}`

const FEATURES = [
  {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-66.0333, 0.7999],
    },
    properties: { category: 'forest' },
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-66.0433, 0.8099],
    },
    properties: { category: 'hospital' },
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-66.0533, 0.7999],
    },
    properties: { category: 'parking' },
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-66.0533, 0.81],
    },
    properties: { category: 'parking' },
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-66.0333, 0.7899],
    },
    properties: { category: 'bus' },
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-66.0233, 0.7999],
    },
    properties: { category: 'school' },
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-66.0133, 0.7999],
    },
    properties: { category: 'unknown' },
  },
].map((feat, index) => ({ ...feat, id: index }))

export const Basic = () => {
  const MAP_SVG_GENERATOR = useMemo(
    () =>
      svgIconGenerator({
        mdiForest,
        mdiParking,
        mdiBusSign,
        mdiHospital,
        mdiSchool,
        mdiMapMarkerCircle,
      }),
    [],
  )

  //
  // Hover stuff
  //
  const [{ children: hoverChildren, ...hoverProps }, hoverInfo, isDragging] =
    useHover({}, [])

  return (
    <LayeredMap
      {...hoverProps}
      initialViewState={{
        latitude: 0.7999968,
        longitude: -66.0333332,
        zoom: 12,
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
                'icon-image': [
                  'match',
                  ['get', 'category'],
                  'forest',
                  svgIconId('mdiForest', {
                    fill: 'white',
                  }),
                  'hospital',
                  svgIconId('mdiHospital', {
                    fill: 'white',
                  }),
                  'parking',
                  'mdiParking({fill:"white"})',
                  'bus',
                  'mdiBusSign({fill:"white"})',
                  'school',
                  'mdiSchool({fill:"white"})',
                  'mdiMapMarkerCircle({fill:"white"})', // fallback
                ],
                'icon-size': 0.8,
              },
            },
          },
        },
      ]}
    >
      <DynamicImages onGenerateImage={MAP_SVG_GENERATOR} />
      <InspectControl />
    </LayeredMap>
  )
}
