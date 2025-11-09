import { InspectControl } from '../Controls'
import { LayeredMap } from '../LayeredMap'
import '@maplibre/maplibre-gl-inspect/dist/maplibre-gl-inspect.css'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useHover } from '../useHover'

import { DynamicImages } from './DynamicImages'
import { svgImageGenerator } from './svgImages'
import * as svgPatterns from './svgPatterns'

export default {
  title: 'DynamicImages / fill-pattern',
  parameters: {
    layout: 'fullscreen',
  },
}

const MAP_STYLE = `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.STORYBOOK_MAP_TILER_API_KEY}`

const MAP_PATTERNS = svgImageGenerator(svgPatterns)

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
        latitude: -1.455833,
        longitude: -48.503887,
        zoom: 10,
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
            municipios: {
              promoteId: 'codarea',
              type: 'geojson',
              data: `https://servicodados.ibge.gov.br/api/v4/malhas/paises/BR?intrarregiao=municipio&formato=application/vnd.geo+json&qualidade=minima`,
            },
          },
          layers: {
            municipios: {
              interactive: true,
              type: 'fill',
              source: 'municipios',
              paint: {
                'fill-pattern': [
                  'match',
                  ['get', 'codarea'],
                  '1501402',
                  'squares_1({ stroke: "magenta" })',
                  '1500800',
                  'cross_1({ stroke: "blue" })',
                  '1501303',
                  'mosaic_1',
                  '1500107',
                  'triangles_1({ stroke: "red", scale: 0.5 })',
                  '1500206',
                  'diamonds_1({ stroke: "orange", scale: 1 })',
                  '1505700',
                  'waves_1({ stroke: "navy", scale: 0.5 })',
                  '1504422',
                  'circles_1',
                  '1501501',
                  'lines_1',

                  'none',
                ],
                'fill-opacity': [
                  'case',
                  ['boolean', ['feature-state', 'hover'], false],
                  1,
                  0.6,
                ],
              },
            },
            municipios_boundaries: {
              type: 'line',
              source: 'municipios',
              paint: {
                'line-color': 'black',
                'line-width': 3,
              },
            },
          },
        },
      ]}
    >
      <DynamicImages onGenerateImage={MAP_PATTERNS} />
      <InspectControl />
    </LayeredMap>
  )
}
